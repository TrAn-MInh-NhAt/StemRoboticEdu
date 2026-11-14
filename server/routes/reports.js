const express = require('express');
const router = express.Router();
const { getPool } = require('../config/db');

// GET /api/reports/grades-csv - Xuất bảng điểm chi tiết dạng file .CSV (TKDL.01)
router.get('/grades-csv', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
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
      ORDER BY bn.MaBaiNop DESC
    `);

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

module.exports = router;
