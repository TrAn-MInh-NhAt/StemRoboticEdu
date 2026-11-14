const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { isLoggedIn, isAdmin } = require('../middleware/authMiddleware');

// ==============================================================================
// 1. POST /api/support/report-issue - HTTB.01: Gửi phiếu báo cáo sự cố kỹ thuật
// Dành cho Học sinh (/student) và Giáo viên (/teacher)
// ==============================================================================
router.post('/report-issue', isLoggedIn, async (req, res) => {
  const { tieuDe, noiDung, mucDoUuTien } = req.body;
  const userId = (req.session && req.session.user) 
    ? req.session.user.MaNguoiDung 
    : (parseInt(req.headers['x-user-id']) || 3);

  if (!tieuDe || !tieuDe.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tiêu đề sự cố kỹ thuật.' });
  }

  if (!noiDung || !noiDung.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng mô tả chi tiết sự cố bạn gặp phải.' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('loaiThongTin', sql.NVarChar, 'Sự cố')
      .input('tieuDe', sql.NVarChar, tieuDe.trim())
      .input('noiDung', sql.NVarChar, noiDung.trim())
      .input('mucDoUuTien', sql.NVarChar, mucDoUuTien || 'Bình thường')
      .input('trangThai', sql.NVarChar, 'Chờ xử lý')
      .query(`
        INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
        OUTPUT INSERTED.MaHoTro, INSERTED.NgayTao
        VALUES (@userId, @loaiThongTin, @tieuDe, @noiDung, @mucDoUuTien, @trangThai)
      `);

    const newTicket = result.recordset[0];
    return res.json({
      success: true,
      ticketId: newTicket.MaHoTro,
      message: `Đã gửi phiếu báo cáo sự cố #${newTicket.MaHoTro} thành công! Đội ngũ Kỹ thuật viên & Quản trị sẽ tiếp nhận và xử lý sớm nhất.`
    });

  } catch (err) {
    console.error('Lỗi gửi báo cáo sự cố (HTTB.01):', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi gửi phiếu sự cố: ' + err.message });
  }
});

// ==============================================================================
// 2. GET /api/support/active-notifications - HTTB.02: Lấy thông báo hệ thống đang hoạt động
// Hiển thị tự động trên đầu trang /student và /teacher
// ==============================================================================
router.get('/active-notifications', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        h.MaHoTro,
        h.MaNguoiDung,
        h.LoaiThongTin,
        h.TieuDe,
        h.NoiDung,
        h.MucDoUuTien,
        h.TrangThai,
        FORMAT(h.NgayTao, 'dd/MM/yyyy HH:mm') AS NgayTaoFmt,
        h.NgayTao,
        nd.HoTen AS NguoiGui,
        nd.VaiTro AS VaiTroNguoiGui
      FROM HoTroThongBao h
      LEFT JOIN NguoiDung nd ON h.MaNguoiDung = nd.MaNguoiDung
      WHERE h.LoaiThongTin = N'Thông báo' AND h.TrangThai = N'Đang hoạt động'
      ORDER BY 
        CASE WHEN h.MucDoUuTien = N'Khẩn cấp' THEN 1 ELSE 2 END,
        h.MaHoTro DESC
    `);

    return res.json({
      success: true,
      notifications: result.recordset
    });

  } catch (err) {
    console.error('Lỗi lấy thông báo hệ thống (HTTB.02):', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 3. GET /api/support/admin/tickets - HTTB.01: Danh sách phiếu sự cố cho Admin
// ==============================================================================
router.get('/admin/tickets', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        h.MaHoTro,
        h.MaNguoiDung,
        h.LoaiThongTin,
        h.TieuDe,
        h.NoiDung,
        h.MucDoUuTien,
        h.TrangThai,
        FORMAT(h.NgayTao, 'dd/MM/yyyy HH:mm') AS NgayTaoFmt,
        h.NgayTao,
        nd.HoTen AS NguoiBaoCao,
        nd.Email AS EmailNguoiBaoCao,
        nd.VaiTro AS VaiTroNguoiBaoCao
      FROM HoTroThongBao h
      LEFT JOIN NguoiDung nd ON h.MaNguoiDung = nd.MaNguoiDung
      WHERE h.LoaiThongTin = N'Sự cố'
      ORDER BY 
        CASE WHEN h.TrangThai = N'Chờ xử lý' THEN 1 ELSE 2 END,
        CASE WHEN h.MucDoUuTien = N'Khẩn cấp' THEN 1 ELSE 2 END,
        h.MaHoTro DESC
    `);

    return res.json({
      success: true,
      tickets: result.recordset
    });

  } catch (err) {
    console.error('Lỗi lấy danh sách sự cố (HTTB.01):', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 4. POST /api/support/admin/resolve-ticket/:id - HTTB.01: Đánh dấu Đã xử lý phiếu sự cố
// ==============================================================================
router.post('/admin/resolve-ticket/:id', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        UPDATE HoTroThongBao
        SET TrangThai = N'Đã xử lý'
        WHERE MaHoTro = @id AND LoaiThongTin = N'Sự cố'
      `);

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy phiếu sự cố tương ứng.' });
    }

    return res.json({
      success: true,
      message: `Đã cập nhật trạng thái phiếu sự cố #${id} sang "Đã xử lý"!`
    });

  } catch (err) {
    console.error('Lỗi xử lý sự cố (HTTB.01):', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 5. GET /api/support/admin/announcements - HTTB.02: Danh sách thông báo cho Admin
// ==============================================================================
router.get('/admin/announcements', isAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        h.MaHoTro,
        h.MaNguoiDung,
        h.LoaiThongTin,
        h.TieuDe,
        h.NoiDung,
        h.MucDoUuTien,
        h.TrangThai,
        FORMAT(h.NgayTao, 'dd/MM/yyyy HH:mm') AS NgayTaoFmt,
        h.NgayTao,
        nd.HoTen AS NguoiPhatThongBao
      FROM HoTroThongBao h
      LEFT JOIN NguoiDung nd ON h.MaNguoiDung = nd.MaNguoiDung
      WHERE h.LoaiThongTin = N'Thông báo'
      ORDER BY h.MaHoTro DESC
    `);

    return res.json({
      success: true,
      announcements: result.recordset
    });

  } catch (err) {
    console.error('Lỗi lấy danh sách thông báo admin (HTTB.02):', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 6. POST /api/support/admin/announcements - HTTB.02: Gửi thông báo hệ thống mới
// ==============================================================================
router.post('/admin/announcements', isAdmin, async (req, res) => {
  const { tieuDe, noiDung, mucDoUuTien } = req.body;
  const adminId = (req.session && req.session.user) ? req.session.user.MaNguoiDung : 1;

  if (!tieuDe || !tieuDe.trim()) {
    return res.status(400).json({ success: false, message: 'Tiêu đề thông báo không được để trống.' });
  }

  if (!noiDung || !noiDung.trim()) {
    return res.status(400).json({ success: false, message: 'Nội dung thông báo không được để trống.' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('adminId', sql.Int, adminId)
      .input('loaiThongTin', sql.NVarChar, 'Thông báo')
      .input('tieuDe', sql.NVarChar, tieuDe.trim())
      .input('noiDung', sql.NVarChar, noiDung.trim())
      .input('mucDoUuTien', sql.NVarChar, mucDoUuTien || 'Bình thường')
      .input('trangThai', sql.NVarChar, 'Đang hoạt động')
      .query(`
        INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
        OUTPUT INSERTED.MaHoTro
        VALUES (@adminId, @loaiThongTin, @tieuDe, @noiDung, @mucDoUuTien, @trangThai)
      `);

    const newId = result.recordset[0].MaHoTro;
    return res.json({
      success: true,
      announcementId: newId,
      message: 'Đã phát thông báo hệ thống thành công! Thông báo sẽ tự động hiển thị trên giao diện của Học sinh và Giáo viên.'
    });

  } catch (err) {
    console.error('Lỗi tạo thông báo hệ thống (HTTB.02):', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo thông báo: ' + err.message });
  }
});

// ==============================================================================
// 7. POST /api/support/admin/announcements/:id/toggle - HTTB.02: Ẩn/Hiện thông báo
// ==============================================================================
router.post('/admin/announcements/:id/toggle', isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const pool = getPool();
    const findRes = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query('SELECT MaHoTro, TrangThai FROM HoTroThongBao WHERE MaHoTro = @id AND LoaiThongTin = N\'Thông báo\'');

    if (findRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy thông báo tương ứng.' });
    }

    const currentStatus = findRes.recordset[0].TrangThai;
    const newStatus = (currentStatus === 'Đang hoạt động') ? 'Đã gỡ' : 'Đang hoạt động';

    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('newStatus', sql.NVarChar, newStatus)
      .query('UPDATE HoTroThongBao SET TrangThai = @newStatus WHERE MaHoTro = @id');

    return res.json({
      success: true,
      newStatus,
      message: `Đã chuyển trạng thái thông báo #${id} sang "${newStatus}"!`
    });

  } catch (err) {
    console.error('Lỗi chuyển trạng thái thông báo:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
