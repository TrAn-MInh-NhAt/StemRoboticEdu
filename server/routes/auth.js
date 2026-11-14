const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ email và mật khẩu' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email)
      .query(`
        SELECT MaNguoiDung, HoTen, Email, MatKhau, VaiTro, TrangThai
        FROM NguoiDung
        WHERE Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.recordset[0];

    // So sánh mật khẩu plaintext (seed data)
    if (password !== user.MatKhau) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra Khóa mềm (Luồng DF-07: Từ chối đăng nhập HTTP 403 nếu bị khóa)
    if (user.TrangThai && user.TrangThai !== 'Đang hoạt động') {
      return res.status(403).json({
        success: false,
        isLocked: true,
        message: `Tài khoản của bạn đã bị khóa bởi Quản trị viên (Luồng DF-07 - Trạng thái: ${user.TrangThai}). Vui lòng liên hệ Admin.`
      });
    }

    // Lưu session
    req.session.user = {
      MaNguoiDung: user.MaNguoiDung,
      HoTen: user.HoTen,
      Email: user.Email,
      VaiTro: user.VaiTro
    };

    return res.json({
      success: true,
      user: {
        MaNguoiDung: user.MaNguoiDung,
        HoTen: user.HoTen,
        VaiTro: user.VaiTro
      }
    });
  } catch (err) {
    console.error('Lỗi đăng nhập API:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server nội bộ' });
  }
});

module.exports = router;
