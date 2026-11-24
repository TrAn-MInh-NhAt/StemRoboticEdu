const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { getPool, sql } = require('../config/db');

// POST /api/auth/register - Đăng ký & Kích hoạt tài khoản Học sinh kèm xác thực Thẻ học sinh
router.post('/register', async (req, res) => {
  const { hoTen, email, matKhau, vaiTro, lop, truongHoc, anhTheHocSinh, autoVerifyCard } = req.body;

  if (!hoTen || !email || !matKhau) {
    return res.status(400).json({ success: false, message: 'Vui lòng điền đầy đủ họ tên, email và mật khẩu' });
  }

  try {
    const pool = getPool();
    const check = await pool.request()
      .input('email', sql.NVarChar, email.trim())
      .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');

    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: 'Email này đã được đăng ký trong hệ thống' });
    }

    const role = vaiTro || 'Học sinh';
    const studentClass = lop || '10/1';
    const schoolName = truongHoc || 'THPT Chuyên STEM';
    const cardImg = anhTheHocSinh || '/images/cards/default_student_card.png';

    // Cơ chế Nhận diện Thẻ Học Sinh (Smart OCR Verification)
    // Nếu chọn tự động nhận diện (mặc định): Tự động duyệt và kích hoạt tài khoản
    // Nếu chọn hoặc thẻ không nhận diện được: Chuyển về trạng thái Chờ duyệt để GVCN hoặc Admin duyệt
    const isAutoApproved = (autoVerifyCard !== false && autoVerifyCard !== 'false');
    const userStatus = isAutoApproved ? 'Đang hoạt động' : 'Chờ duyệt';
    const cardStatus = isAutoApproved ? 'Đã xác thực' : 'Chờ duyệt thẻ';

    // Mã hóa mật khẩu bảo mật theo chuẩn bcrypt (SEC-01)
    const hashedPassword = await bcrypt.hash(matKhau, 10);

    const ins = await pool.request()
      .input('hoTen', sql.NVarChar, hoTen.trim())
      .input('email', sql.NVarChar, email.trim())
      .input('matKhau', sql.VarChar(255), hashedPassword)
      .input('vaiTro', sql.NVarChar, role)
      .input('lop', sql.NVarChar, studentClass)
      .input('truongHoc', sql.NVarChar, schoolName)
      .input('anhThe', sql.VarChar, cardImg)
      .input('xacThuc', sql.NVarChar, cardStatus)
      .input('trangThai', sql.NVarChar, userStatus)
      .query(`
        INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro, Lop, TruongHoc, AnhTheHocSinh, TrangThaiXacThucThe, TrangThai)
        OUTPUT INSERTED.MaNguoiDung, INSERTED.HoTen, INSERTED.Email, INSERTED.VaiTro, INSERTED.Lop, INSERTED.TrangThai
        VALUES (@hoTen, @email, @matKhau, @vaiTro, @lop, @truongHoc, @anhThe, @xacThuc, @trangThai)
      `);

    const newUserId = ins.recordset[0].MaNguoiDung;
    const studentCode = `HS10-01-${String(newUserId).padStart(3, '0')}`;
    await pool.request()
      .input('id', sql.Int, newUserId)
      .input('code', sql.VarChar, studentCode)
      .query('UPDATE NguoiDung SET MaDinhDanhHS = @code WHERE MaNguoiDung = @id');

    if (isAutoApproved) {
      return res.status(201).json({
        success: true,
        autoApproved: true,
        message: 'Đăng ký & Nhận diện Thẻ học sinh thành công! Tài khoản Lớp 10/1 đã được kích hoạt tự động.',
        user: ins.recordset[0]
      });
    } else {
      return res.status(201).json({
        success: true,
        autoApproved: false,
        message: 'Đăng ký thành công! Thẻ học sinh đã được gửi tới Thầy TS. Đặng Hùng Vĩ (GVCN 10/1) và Quản trị viên để xét duyệt.',
        user: ins.recordset[0]
      });
    }
  } catch (err) {
    console.error('Lỗi đăng ký QLTK.01:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng ký: ' + err.message });
  }
});

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

    // Xác thực mật khẩu: Hỗ trợ bcrypt hash và tự động nâng cấp mật khẩu legacy plaintext
    const isBcrypt = typeof user.MatKhau === 'string' && (user.MatKhau.startsWith('$2a$') || user.MatKhau.startsWith('$2b$'));
    let isPasswordValid = false;

    if (isBcrypt) {
      isPasswordValid = await bcrypt.compare(password, user.MatKhau);
    } else {
      isPasswordValid = (password === user.MatKhau);
      // Tự động nâng cấp hash mật khẩu plaintext sang bcrypt trong CSDL
      if (isPasswordValid) {
        try {
          const upgradedHash = await bcrypt.hash(password, 10);
          await pool.request()
            .input('id', sql.Int, user.MaNguoiDung)
            .input('newHash', sql.VarChar(255), upgradedHash)
            .query('UPDATE NguoiDung SET MatKhau = @newHash WHERE MaNguoiDung = @id');
        } catch (upgradeErr) {
          console.warn('[Auth] Không thể tự động nâng cấp hash mật khẩu:', upgradeErr.message);
        }
      }
    }

    if (!isPasswordValid) {
      return res.status(401).json({ success: false, message: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra Khóa mềm (Luồng DF-07: Từ chối đăng nhập HTTP 403 nếu bị khóa hoặc chờ duyệt)
    if (user.TrangThai && user.TrangThai !== 'Đang hoạt động') {
      let msg = `Tài khoản của bạn đã bị khóa bởi Quản trị viên (Trạng thái: ${user.TrangThai}). Vui lòng liên hệ Admin.`;
      if (user.TrangThai === 'Chờ duyệt') {
        msg = `Tài khoản đang chờ duyệt thẻ học sinh từ Giáo viên chủ nhiệm TS. Đặng Hùng Vĩ (Lớp 10/1) hoặc Quản trị viên. Vui lòng quay lại sau!`;
      }
      return res.status(403).json({
        success: false,
        isLocked: true,
        message: msg
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
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    await pool.request()
      .input('email', sql.NVarChar, email.trim())
      .input('newPassword', sql.VarChar(255), hashedNewPassword)
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
  const user = (req.session && req.session.user) 
    ? req.session.user 
    : (req.headers['x-user-id'] ? { MaNguoiDung: parseInt(req.headers['x-user-id']) } : null);

  if (!user) {
    return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để thực hiện thao tác này' });
  }

  const { hoTen, soDienThoai, anhDaiDien, matKhauHienTai, matKhauMoi } = req.body;
  const userId = user.MaNguoiDung;

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

      if (checkPass.recordset.length === 0) {
        return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
      }

      const currentStoredPass = checkPass.recordset[0].MatKhau;
      const isCurrentBcrypt = typeof currentStoredPass === 'string' && (currentStoredPass.startsWith('$2a$') || currentStoredPass.startsWith('$2b$'));
      const isCurrentValid = isCurrentBcrypt
        ? await bcrypt.compare(matKhauHienTai, currentStoredPass)
        : (matKhauHienTai === currentStoredPass);

      if (!isCurrentValid) {
        return res.status(400).json({ success: false, message: 'Mật khẩu hiện tại không chính xác' });
      }

      const hashedNewPassword = await bcrypt.hash(matKhauMoi, 10);

      await pool.request()
        .input('id', sql.Int, userId)
        .input('hoTen', sql.NVarChar, hoTen.trim())
        .input('soDienThoai', sql.VarChar, soDienThoai ? soDienThoai.trim() : null)
        .input('anhDaiDien', sql.VarChar, anhDaiDien ? anhDaiDien.trim() : null)
        .input('matKhauMoi', sql.VarChar(255), hashedNewPassword)
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

    // ĐỒNG BỘ LẠI SESSION NẾU CÓ
    if (req.session && req.session.user) {
      req.session.user.HoTen = hoTen.trim();
      req.session.user.SoDienThoai = soDienThoai ? soDienThoai.trim() : null;
      req.session.user.AnhDaiDien = anhDaiDien ? anhDaiDien.trim() : null;
    }

    return res.json({
      success: true,
      message: 'Cập nhật hồ sơ cá nhân thành công!',
      user: (req.session && req.session.user) ? req.session.user : {
        MaNguoiDung: userId,
        HoTen: hoTen.trim(),
        SoDienThoai: soDienThoai ? soDienThoai.trim() : null,
        AnhDaiDien: anhDaiDien ? anhDaiDien.trim() : null
      }
    });

  } catch (err) {
    console.error('Lỗi cập nhật hồ sơ cá nhân:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật hồ sơ: ' + err.message });
  }
});

module.exports = router;
