const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { isTeacherOrAdmin } = require('../middleware/authMiddleware');

// GET /api/reports/grades-csv - Xuất bảng điểm chi tiết dạng file .CSV (TKDL.01 & XBC.02)
router.get('/grades-csv', isTeacherOrAdmin, async (req, res) => {
  const { maDuAn, trangThai } = req.query;

  try {
    const pool = getPool();
    let queryStr = `
      SELECT 
        bn.MaBaiNop,
        nd.HoTen AS TenHocSinh,
        nd.Email,
        ISNULL(da.TenDuAn, bt.TenBaiThi) AS TenBaiTap,
        CASE WHEN da.MaDuAn IS NOT NULL THEN N'Dự án Thực hành' ELSE N'Bài thi Trực tuyến' END AS LoaiBaiTap,
        kq.DiemCode,
        ISNULL(kq.KetQuaCode, N'Chưa chấm') AS KetQuaCode,
        ISNULL(kq.KetQuaVideo, N'Chưa duyệt') AS KetQuaVideo,
        ISNULL(CAST(kq.TongDiem AS VARCHAR), N'--') AS TongDiem,
        bn.TrangThai,
        FORMAT(bn.ThoiGianNop, 'dd/MM/yyyy HH:mm:ss') AS ThoiGianNop,
        ISNULL(REPLACE(REPLACE(kq.NhanXet, CHAR(13), ' '), CHAR(10), ' '), N'') AS NhanXet
      FROM BaiNop bn
      JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
      LEFT JOIN BaiThi bt ON bn.MaBaiThi = bt.MaBaiThi
      LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      WHERE 1=1
    `;

    const request = pool.request();

    if (maDuAn && maDuAn !== 'all') {
      queryStr += ` AND bn.MaDuAn = @maDuAn`;
      request.input('maDuAn', sql.Int, parseInt(maDuAn));
    }

    if (trangThai && trangThai !== 'all') {
      if (trangThai === 'pass') {
        queryStr += ` AND kq.TongDiem >= 5`;
      } else if (trangThai === 'fail') {
        queryStr += ` AND (kq.TongDiem < 5 OR kq.TongDiem IS NULL)`;
      } else if (trangThai === 'excellent') {
        queryStr += ` AND kq.TongDiem >= 9`;
      } else if (trangThai === 'pending') {
        queryStr += ` AND bn.TrangThai LIKE N'%Chờ duyệt%'`;
      }
    }

    queryStr += ` ORDER BY bn.MaBaiNop DESC`;

    const result = await request.query(queryStr);

    // Ghi log tự động vào bảng BaoCaoThongKe (XBC.02)
    try {
      const userId = req.session && req.session.user ? req.session.user.MaNguoiDung : 1;
      const logReq = pool.request();
      logReq.input('userId', sql.Int, userId);
      logReq.input('tenBaoCao', sql.NVarChar, `Xuất file CSV Bảng điểm STEM Robotic (${result.recordset.length} bài)`);
      logReq.input('loaiBaoCao', sql.NVarChar, 'Điểm');
      logReq.input('duLieuThongKe', sql.NVarChar, JSON.stringify({
        soLuong: result.recordset.length,
        filterDuAn: maDuAn || 'all',
        filterTrangThai: trangThai || 'all',
        thoiDiemXuat: new Date().toISOString()
      }));
      logReq.input('dinhDangTep', sql.VarChar, 'CSV');
      await logReq.query(`
        INSERT INTO BaoCaoThongKe (MaNguoiDung, TenBaoCao, LoaiBaoCao, DuLieuThongKe, DinhDangTep, TrangThai)
        VALUES (@userId, @tenBaoCao, @loaiBaoCao, @duLieuThongKe, @dinhDangTep, N'Hoàn thành')
      `);
    } catch (logErr) {
      console.warn('Lỗi ghi log BaoCaoThongKe (CSV):', logErr.message);
    }

    // Helper escape CSV cell
    function escapeCSV(val) {
      if (val === null || val === undefined) return '""';
      const str = String(val);
      return `"${str.replace(/"/g, '""')}"`;
    }

    // CSV Header (Theo bảng chuẩn TKDL.01)
    const headers = [
      'Mã bài nộp',
      'Họ và tên học sinh',
      'Email',
      'Tên bài tập / Dự án',
      'Phân loại',
      'Điểm Code (Tự động)',
      'Kết quả Code',
      'Đánh giá Video (Phần cứng)',
      'Tổng điểm',
      'Trạng thái bài nộp',
      'Thời gian nộp bài',
      'Nhận xét của Giáo viên'
    ];

    let csvContent = '\uFEFF'; // UTF-8 BOM để Excel hiển thị tiếng Việt chuẩn không bị lỗi font
    csvContent += headers.map(escapeCSV).join(',') + '\r\n';

    result.recordset.forEach(row => {
      const rowData = [
        row.MaBaiNop,
        row.TenHocSinh,
        row.Email,
        row.TenBaiTap,
        row.LoaiBaiTap,
        row.DiemCode !== null ? row.DiemCode : '--',
        row.KetQuaCode,
        row.KetQuaVideo,
        row.TongDiem,
        row.TrangThai,
        row.ThoiGianNop,
        row.NhanXet
      ];
      csvContent += rowData.map(escapeCSV).join(',') + '\r\n';
    });

    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `BangDiem_STEM_Robotic_${timestamp}.csv`;

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.status(200).send(csvContent);

  } catch (err) {
    console.error('Lỗi xuất CSV bảng điểm:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi xuất báo cáo CSV' });
  }
});

// POST /api/reports/log-report - Ghi log thủ công khi xuất báo cáo PDF (XBC.02)
router.post('/log-report', isTeacherOrAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.session && req.session.user ? req.session.user.MaNguoiDung : 1;
    const { tenBaoCao, loaiBaoCao, duLieuThongKe, dinhDangTep } = req.body;

    await pool.request()
      .input('userId', sql.Int, userId)
      .input('tenBaoCao', sql.NVarChar, tenBaoCao || 'Báo cáo Bảng điểm STEM Robotic')
      .input('loaiBaoCao', sql.NVarChar, loaiBaoCao || 'Điểm')
      .input('duLieuThongKe', sql.NVarChar, typeof duLieuThongKe === 'object' ? JSON.stringify(duLieuThongKe) : duLieuThongKe)
      .input('dinhDangTep', sql.VarChar, dinhDangTep || 'PDF')
      .query(`
        INSERT INTO BaoCaoThongKe (MaNguoiDung, TenBaoCao, LoaiBaoCao, DuLieuThongKe, DinhDangTep, TrangThai)
        VALUES (@userId, @tenBaoCao, @loaiBaoCao, @duLieuThongKe, @dinhDangTep, N'Hoàn thành')
      `);

    return res.json({ success: true, message: 'Đã lưu lịch sử báo cáo thành công' });
  } catch (err) {
    console.error('Lỗi ghi log báo cáo:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi ghi log báo cáo: ' + err.message });
  }
});

module.exports = router;
