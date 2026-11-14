const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { getPool, sql } = require('../config/db');

// Thư mục lưu bài thi nộp
const examUploadDir = path.join(__dirname, '../uploads/exams');
if (!fs.existsSync(examUploadDir)) {
  fs.mkdirSync(examUploadDir, { recursive: true });
}

function getUserId(req) {
  if (req.session && req.session.user) {
    return req.session.user.MaNguoiDung;
  }
  return req.body.maNguoiDung || req.headers['x-user-id'] || 3; // Mặc định học sinh Trần Minh Nhật
}

// =========================================================================
// 1. GET /api/exam/active - Lấy bài thi đang mở (KTĐG.02)
// =========================================================================
router.get('/active', async (req, res) => {
  try {
    const pool = getPool();
    const studentId = parseInt(getUserId(req));

    const result = await pool.request().query(`
      SELECT TOP 1 MaBaiThi, MaNguoiDung, TenBaiThi, NoiDungDeThi, ThoiGianBatDau, ThoiGianKetThuc, ThoiLuong, SoLanChuyenTab, TrangThai
      FROM BaiThi
      WHERE TrangThai = N'Đang mở'
      ORDER BY MaBaiThi DESC
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Hiện không có bài thi nào đang mở.' });
    }

    const exam = result.recordset[0];

    // Kiểm tra xem học sinh đã có bài nộp thi này chưa
    const subRes = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('maBaiThi', sql.Int, exam.MaBaiThi)
      .query(`
        SELECT TOP 1 MaBaiNop, SoLanChuyenTabHS, TrangThai, ThoiGianNop, MaNguon
        FROM BaiNop
        WHERE MaNguoiDung = @studentId AND MaBaiThi = @maBaiThi
        ORDER BY MaBaiNop DESC
      `);

    const currentSub = subRes.recordset[0] || null;

    return res.json({
      success: true,
      exam,
      currentSubmission: currentSub
    });
  } catch (err) {
    console.error('Lỗi lấy bài thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bài thi' });
  }
});

// =========================================================================
// 2. POST /api/exam/start - Bắt đầu vào phòng thi (Khởi tạo BaiNop)
// =========================================================================
router.post('/start', async (req, res) => {
  const pool = getPool();
  try {
    const studentId = parseInt(getUserId(req));
    const maBaiThi = parseInt(req.body.maBaiThi);

    if (!maBaiThi) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bài thi (maBaiThi)' });
    }

    // Kiểm tra xem đã có bài thi đang làm chưa
    let subRes = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('maBaiThi', sql.Int, maBaiThi)
      .query(`
        SELECT TOP 1 MaBaiNop, SoLanChuyenTabHS, TrangThai, MaNguon
        FROM BaiNop
        WHERE MaNguoiDung = @studentId AND MaBaiThi = @maBaiThi
        ORDER BY MaBaiNop DESC
      `);

    let submission;
    if (subRes.recordset.length > 0) {
      submission = subRes.recordset[0];
    } else {
      // Khởi tạo bài nộp thi mới
      const insertRes = await pool.request()
        .input('studentId', sql.Int, studentId)
        .input('maBaiThi', sql.Int, maBaiThi)
        .input('maNguon', sql.VarChar(255), 'draft_exam_' + studentId + '.py')
        .input('trangThai', sql.NVarChar(30), 'Đang làm bài')
        .query(`
          INSERT INTO BaiNop (MaNguoiDung, MaDuAn, MaBaiThi, MaNguon, VideoVanHanh, SoLanChuyenTabHS, TrangThai)
          OUTPUT INSERTED.MaBaiNop, INSERTED.SoLanChuyenTabHS, INSERTED.TrangThai
          VALUES (@studentId, NULL, @maBaiThi, @maNguon, NULL, 0, @trangThai)
        `);
      submission = insertRes.recordset[0];
    }

    return res.json({
      success: true,
      submission,
      isLocked: submission.TrangThai.includes('khóa') || submission.SoLanChuyenTabHS > 3
    });
  } catch (err) {
    console.error('Lỗi bắt đầu thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi bắt đầu thi: ' + err.message });
  }
});

// =========================================================================
// 3. POST /api/exam/tab-switch - Ghi nhận vi phạm chuyển tab (Trigger DF-06)
// =========================================================================
router.post('/tab-switch', async (req, res) => {
  const pool = getPool();
  try {
    const maBaiNop = parseInt(req.body.maBaiNop);
    if (!maBaiNop) {
      return res.status(400).json({ success: false, message: 'Thiếu maBaiNop' });
    }

    // 1. Tăng SoLanChuyenTabHS trong bảng BaiNop lên 1
    const updateRes = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`
        UPDATE BaiNop
        SET SoLanChuyenTabHS = SoLanChuyenTabHS + 1
        OUTPUT INSERTED.MaBaiNop, INSERTED.SoLanChuyenTabHS, INSERTED.MaBaiThi, INSERTED.TrangThai
        WHERE MaBaiNop = @maBaiNop
      `);

    if (updateRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp thi' });
    }

    const sub = updateRes.recordset[0];
    const currentCount = sub.SoLanChuyenTabHS;

    // Lấy giới hạn cho phép từ bài thi
    const examRes = await pool.request()
      .input('maBaiThi', sql.Int, sub.MaBaiThi)
      .query(`SELECT SoLanChuyenTab FROM BaiThi WHERE MaBaiThi = @maBaiThi`);

    const maxAllowed = examRes.recordset[0] ? examRes.recordset[0].SoLanChuyenTab : 3;

    // THỰC THI CHUẨN NGHIỆP VỤ DF-06:
    // Nếu SoLanChuyenTabHS > Giới hạn (3 lần): TỰ ĐỘNG KHÓA VÀ THU BÀI THI NGAY LẬP TỨC!
    if (currentCount > maxAllowed) {
      await pool.request()
        .input('maBaiNop', sql.Int, maBaiNop)
        .query(`
          UPDATE BaiNop
          SET TrangThai = N'Đã khóa (DF-06)'
          WHERE MaBaiNop = @maBaiNop
        `);

      return res.json({
        success: true,
        locked: true,
        soLanChuyenTabHS: currentCount,
        maxAllowed,
        message: `BÀI THI ĐÃ BỊ TỰ ĐỘNG KHÓA (DF-06)! Bạn đã chuyển tab ${currentCount}/${maxAllowed} lần, vượt quá giới hạn quy chế thi. Hệ thống đã tự động thu bài.`
      });
    }

    // Nếu chưa vượt quá 3 lần -> Báo động đỏ cảnh báo
    return res.json({
      success: true,
      locked: false,
      soLanChuyenTabHS: currentCount,
      maxAllowed,
      remaining: maxAllowed - currentCount,
      message: `⚠️ CẢNH BÁO VI PHẠM (DF-06): Bạn đã rời khỏi tab thi ${currentCount}/${maxAllowed} lần! Còn lại ${maxAllowed - currentCount} lần cho phép trước khi bài thi bị khóa vĩnh viễn.`
    });

  } catch (err) {
    console.error('Lỗi ghi nhận chuyển tab:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi ghi nhận chuyển tab: ' + err.message });
  }
});

// =========================================================================
// 4. POST /api/exam/submit - Nộp bài thi
// =========================================================================
router.post('/submit', async (req, res) => {
  const pool = getPool();
  try {
    const maBaiNop = parseInt(req.body.maBaiNop);
    const codeContent = req.body.codeContent || '';

    if (!maBaiNop) {
      return res.status(400).json({ success: false, message: 'Thiếu maBaiNop' });
    }

    // Kiểm tra xem bài nộp có bị khóa chưa
    const checkSub = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`SELECT TrangThai, SoLanChuyenTabHS FROM BaiNop WHERE MaBaiNop = @maBaiNop`);

    if (checkSub.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    }

    if (checkSub.recordset[0].TrangThai.includes('khóa')) {
      return res.status(403).json({
        success: false,
        message: 'Bài thi này đã bị khóa do vi phạm quy chế chuyển tab (DF-06). Không thể nộp lại.'
      });
    }

    // Lưu mã nguồn bài thi
    const filename = `exam-sub-${maBaiNop}-${Date.now()}.py`;
    const filePath = path.join(examUploadDir, filename);
    fs.writeFileSync(filePath, codeContent, 'utf8');

    // Cập nhật trạng thái
    await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .input('maNguon', sql.VarChar(255), 'uploads/exams/' + filename)
      .query(`
        UPDATE BaiNop
        SET MaNguon = @maNguon,
            TrangThai = N'Đã nộp bài thi',
            ThoiGianNop = CURRENT_TIMESTAMP
        WHERE MaBaiNop = @maBaiNop
      `);

    return res.json({
      success: true,
      message: '✅ Nộp bài thi thành công! Hệ thống đã tiếp nhận bài làm của bạn.'
    });

  } catch (err) {
    console.error('Lỗi nộp bài thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài thi: ' + err.message });
  }
});

// =========================================================================
// 5. GET /api/analytics/df05-check - Phân tích tỷ lệ lỗi & Cảnh báo Học liệu (DF-05)
// =========================================================================
router.get('/analytics/df05-check', async (req, res) => {
  const pool = getPool();
  try {
    // 1. Phân tích kết quả nộp bài của từng dự án từ bảng KetQuaDiem & BaiNop
    const statsRes = await pool.request().query(`
      SELECT 
        da.MaDuAn, da.TenDuAn, da.MaLoTrinh, lt.TenLoTrinh,
        COUNT(bn.MaBaiNop) AS TongBaiNop,
        SUM(CASE WHEN kq.KetQuaCode = N'Không đạt' OR kq.DiemCode < 5.0 THEN 1 ELSE 0 END) AS SoBaiLoi,
        CAST(
          CASE WHEN COUNT(bn.MaBaiNop) > 0 
               THEN (SUM(CASE WHEN kq.KetQuaCode = N'Không đạt' OR kq.DiemCode < 5.0 THEN 1.0 ELSE 0.0 END) / COUNT(bn.MaBaiNop)) * 100.0
               ELSE 0.0 
          END AS DECIMAL(5,2)
        ) AS TyLeLoiPercent
      FROM DuAnBaiTap da
      JOIN KhoaHocLoTrinh lt ON da.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN BaiNop bn ON da.MaDuAn = bn.MaDuAn
      LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      WHERE bn.MaBaiNop IS NOT NULL
      GROUP BY da.MaDuAn, da.TenDuAn, da.MaLoTrinh, lt.TenLoTrinh
    `);

    const stats = statsRes.recordset;
    const flaggedMaterials = [];

    // THỰC THI CHUẨN NGHIỆP VỤ DF-05:
    // Nếu một bài tập/lộ trình có tỷ lệ bài nộp bị lỗi > 30% (TyLeLoiPercent > 30):
    // Tự động gắn cờ CoCanCapNhat = 1 ở bảng HocLieu liên quan
    for (const item of stats) {
      if (item.TyLeLoiPercent > 30.0 && item.MaLoTrinh) {
        // Cập nhật CoCanCapNhat = 1 ở bảng HocLieu
        await pool.request()
          .input('maLoTrinh', sql.Int, item.MaLoTrinh)
          .query(`
            UPDATE HocLieu
            SET CoCanCapNhat = 1
            WHERE MaLoTrinh = @maLoTrinh
          `);

        // Lấy danh sách học liệu vừa bị gắn cờ
        const hlRes = await pool.request()
          .input('maLoTrinh', sql.Int, item.MaLoTrinh)
          .query(`
            SELECT MaHocLieu, TenHocLieu, LoaiHocLieu, CoCanCapNhat
            FROM HocLieu
            WHERE MaLoTrinh = @maLoTrinh AND CoCanCapNhat = 1
          `);

        flaggedMaterials.push({
          duAn: item.TenDuAn,
          loTrinh: item.TenLoTrinh,
          tyLeLoi: item.TyLeLoiPercent,
          tongBai: item.TongBaiNop,
          soBaiLoi: item.SoBaiLoi,
          hocLieuCanCapNhat: hlRes.recordset
        });
      }
    }

    // Lấy toàn bộ danh sách học liệu đang có CoCanCapNhat = 1
    const allFlaggedRes = await pool.request().query(`
      SELECT hl.MaHocLieu, hl.TenHocLieu, hl.LoaiHocLieu, hl.CoCanCapNhat, lt.TenLoTrinh
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      WHERE hl.CoCanCapNhat = 1
    `);

    return res.json({
      success: true,
      hasWarning: allFlaggedRes.recordset.length > 0,
      stats,
      flaggedMaterials,
      allFlaggedMaterials: allFlaggedRes.recordset,
      message: allFlaggedRes.recordset.length > 0
        ? `Phát hiện học liệu cần cập nhật (DF-05): Có bài tập vượt ngưỡng 30% học sinh mắc lỗi.`
        : `Tỷ lệ hoàn thành ổn định (DF-05): Chưa có bài tập nào vượt ngưỡng 30% lỗi.`
    });

  } catch (err) {
    console.error('Lỗi kiểm tra DF-05:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi phân tích lỗi DF-05: ' + err.message });
  }
});

module.exports = router;
