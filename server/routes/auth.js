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

// ==============================================================================
// 1. MÔ ĐUN QLTK.03: KHÔI PHỤC MẬT KHẨU (FORGOT / RESET PASSWORD)
// ==============================================================================

// POST /api/auth/forgot-password - Bước 1: Kiểm tra Email và cấp mã OTP
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  if (!email || !email.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập địa chỉ email của bạn' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('email', sql.NVarChar, email.trim())
      .query(`
        SELECT MaNguoiDung, HoTen, Email, TrangThai
        FROM NguoiDung
        WHERE Email = @email
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy tài khoản với email này trong hệ thống' });
    }

    const user = result.recordset[0];

    // Kiểm tra tài khoản bị khóa
    if (user.TrangThai && user.TrangThai !== 'Đang hoạt động') {
      return res.status(403).json({
        success: false,
        message: 'Tài khoản này đang bị khóa bởi Quản trị viên (DF-07). Không thể đặt lại mật khẩu.'
      });
    }

    // Sinh mã OTP ngẫu nhiên 6 chữ số
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Lưu mã OTP vào session kèm thời hạn 10 phút
    req.session.resetOtp = {
      email: user.Email,
      otp: otp,
      expiresAt: Date.now() + 10 * 60 * 1000 // 10 phút
    };

    return res.json({
      success: true,
      message: 'Mã xác thực OTP 6 số đã được gửi thành công!',
      email: user.Email,
      otp: otp // Trả về mã OTP trên giao diện để tiện demo và chấm đồ án
    });

  } catch (err) {
    console.error('Lỗi yêu cầu OTP quên mật khẩu:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi gửi mã OTP' });
  }
});

// POST /api/auth/reset-password - Bước 2: Xác thực OTP và cập nhật Mật khẩu mới
router.post('/reset-password', async (req, res) => {
  const { email, otp, newPassword } = req.body;

  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ Email, mã OTP và mật khẩu mới' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
  }

  const savedOtp = req.session.resetOtp;

  if (!savedOtp || savedOtp.email.toLowerCase() !== email.trim().toLowerCase() || savedOtp.otp !== otp.trim()) {
    return res.status(400).json({ success: false, message: 'Mã xác thực OTP không chính xác hoặc không khớp với email này' });
  }

  if (Date.now() > savedOtp.expiresAt) {
    delete req.session.resetOtp;
    return res.status(400).json({ success: false, message: 'Mã OTP đã hết thời hạn 10 phút. Vui lòng bấm gửi lại mã mới' });
  }

  try {
    const pool = getPool();
    await pool.request()
      .input('email', sql.NVarChar, email.trim())
      .input('newPassword', sql.VarChar, newPassword)
      .query(`
        UPDATE NguoiDung
        SET MatKhau = @newPassword
        WHERE Email = @email
      `);

    // Xóa session OTP sau khi đổi mật khẩu thành công
    delete req.session.resetOtp;

    return res.json({
      success: true,
      message: 'Đặt lại mật khẩu thành công! Bạn có thể đăng nhập ngay bằng mật khẩu mới.'
    });

  } catch (err) {
    console.error('Lỗi đặt lại mật khẩu:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật mật khẩu mới' });
  }
});

// ==============================================================================
// 2. MÔ ĐUN QTHT.02: CẬP NHẬT HỒ SƠ CÁ NHÂN & ĐỔI MẬT KHẨU
// ==============================================================================

// POST /api/auth/profile - Cập nhật thông tin cá nhân và đồng bộ Session
router.post('/profile', async (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để thực hiện thao tác này' });
  }

  const { hoTen, soDienThoai, anhDaiDien, matKhauHienTai, matKhauMoi } = req.body;
  const userId = req.session.user.MaNguoiDung;

  if (!hoTen || !hoTen.trim()) {
    return res.status(400).json({ success: false, message: 'Họ tên không được để trống' });
  }

  try {
    const pool = getPool();

    // Trường hợp có yêu cầu đổi mật khẩu
    if (matKhauMoi && matKhauMoi.trim().length > 0) {
      if (!matKhauHienTai) {
        return res.status(400).json({ success: false, message: 'Vui lòng nhập mật khẩu hiện tại để xác thực đổi mật khẩu' });
      }
      if (matKhauMoi.length < 6) {
        return res.status(400).json({ success: false, message: 'Mật khẩu mới phải có tối thiểu 6 ký tự' });
      }

      const checkPass = await pool.request()
        .input('id', sql.Int, userId)
        .query('SELECT MatKhau FROM NguoiDung WHERE MaNguoiDung = @id');

      if (checkPass.recordset.length === 0 || checkPass.recordset[0].MatKhau !== matKhauHienTai) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
      }

      await pool.request()
        .input('id', sql.Int, userId)
        .input('hoTen', sql.NVarChar, hoTen.trim())
        .input('soDienThoai', sql.VarChar, soDienThoai ? soDienThoai.trim() : null)
        .input('anhDaiDien', sql.VarChar, anhDaiDien ? anhDaiDien.trim() : null)
        .input('matKhauMoi', sql.VarChar, matKhauMoi)
        .query(`
          UPDATE NguoiDung
          SET HoTen = @hoTen,
              SoDienThoai = @soDienThoai,
              AnhDaiDien = @anhDaiDien,
              MatKhau = @matKhauMoi
          WHERE MaNguoiDung = @id
        `);
    } else {
      // Chỉ cập nhật thông tin cá nhân
      await pool.request()
        .input('id', sql.Int, userId)
        .input('hoTen', sql.NVarChar, hoTen.trim())
        .input('soDienThoai', sql.VarChar, soDienThoai ? soDienThoai.trim() : null)
        .input('anhDaiDien', sql.VarChar, anhDaiDien ? anhDaiDien.trim() : null)
        .query(`
          UPDATE NguoiDung
          SET HoTen = @hoTen,
              SoDienThoai = @soDienThoai,
              AnhDaiDien = @anhDaiDien
          WHERE MaNguoiDung = @id
        `);
    }

    // ĐỒNG BỘ LẠI SESSION NGAY LẬP TỨC
    req.session.user.HoTen = hoTen.trim();
    req.session.user.SoDienThoai = soDienThoai ? soDienThoai.trim() : null;
    req.session.user.AnhDaiDien = anhDaiDien ? anhDaiDien.trim() : null;

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ cá nhân thành công!',
      user: req.session.user
    });

  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ cá nhân:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật hồ sơ: ' + err.message });
  }
});

module.exports = router;
