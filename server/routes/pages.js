const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { isLoggedIn } = require('../middleware/authMiddleware');

function redirectByRole(res, role) {
  if (role === 'Admin') return res.redirect('/admin');
  if (role === 'Giáo viên') return res.redirect('/teacher');
  if (role === 'Học sinh') return res.redirect('/student');
  return res.redirect('/login');
}

// GET / → Trang Chủ chính thức từ giaodien8.html
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT TOP 5 
        nd.MaNguoiDung, nd.HoTen, nd.Email,
        MAX(kq.TongDiem) as DiemCaoNhat,
        COUNT(bn.MaBaiNop) as SoBaiNop,
        AVG(kq.TongDiem) as DiemTrungBinh
      FROM NguoiDung nd
      JOIN BaiNop bn ON nd.MaNguoiDung = bn.MaNguoiDung
      JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      WHERE kq.TongDiem IS NOT NULL
      GROUP BY nd.MaNguoiDung, nd.HoTen, nd.Email
      ORDER BY DiemCaoNhat DESC, DiemTrungBinh DESC
    `);

    const statsRes = await pool.request().query(`
      SELECT 
        COUNT(MaBaiNop) as TongBaiNop,
        AVG(ISNULL(ThoiGianChay_ms, 25)) as ThoiGianTrungBinh_ms
      FROM KetQuaDiem
    `);

    res.render('index', {
      user: req.session ? req.session.user : null,
      leaderboard: result.recordset,
      stats: statsRes.recordset[0] || { TongBaiNop: 0, ThoiGianTrungBinh_ms: 25 }
    });
  } catch (err) {
    console.error('Lỗi tải dữ liệu trang chủ:', err);
    res.render('index', {
      user: req.session ? req.session.user : null,
      leaderboard: [],
      stats: { TongBaiNop: 0, ThoiGianTrungBinh_ms: 25 }
    });
  }
});

// GET /api/leaderboard - API dữ liệu thật Bảng Xếp Hạng Đỉnh Cao
router.get('/api/leaderboard', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT TOP 5 
        nd.MaNguoiDung, nd.HoTen, nd.Email,
        MAX(kq.TongDiem) as DiemCaoNhat,
        COUNT(bn.MaBaiNop) as SoBaiNop,
        AVG(kq.TongDiem) as DiemTrungBinh
      FROM NguoiDung nd
      JOIN BaiNop bn ON nd.MaNguoiDung = bn.MaNguoiDung
      JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      WHERE kq.TongDiem IS NOT NULL
      GROUP BY nd.MaNguoiDung, nd.HoTen, nd.Email
      ORDER BY DiemCaoNhat DESC, DiemTrungBinh DESC
    `);
    return res.json({ success: true, leaderboard: result.recordset });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// GET /login
router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    return redirectByRole(res, req.session.user.VaiTro);
  }
  res.render('login', { error: null });
});

// POST /login (Form fallback nếu không dùng fetch)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.render('login', { error: 'Vui lòng nhập đầy đủ email và mật khẩu' });
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
      return res.render('login', { error: 'Email hoặc mật khẩu không đúng' });
    }

    const user = result.recordset[0];

    // So sánh mật khẩu
    if (password !== user.MatKhau) {
      return res.render('login', { error: 'Email hoặc mật khẩu không đúng' });
    }

    // Kiểm tra Khóa mềm (Luồng DF-07)
    if (user.TrangThai && user.TrangThai !== 'Đang hoạt động') {
      return res.render('login', { error: `Tài khoản đã bị khóa bởi Quản trị viên (DF-07 - ${user.TrangThai}). Vui lòng liên hệ Admin.` });
    }

    req.session.user = {
      MaNguoiDung: user.MaNguoiDung,
      HoTen: user.HoTen,
      Email: user.Email,
      VaiTro: user.VaiTro
    };

    return redirectByRole(res, user.VaiTro);
  } catch (err) {
    console.error('Lỗi đăng nhập trang:', err.message);
    return res.render('login', { error: 'Lỗi server, vui lòng thử lại' });
  }
});

// GET /admin
router.get('/admin', isLoggedIn, (req, res) => {
  if (req.session.user.VaiTro !== 'Admin') {
    return res.redirect('/login');
  }
  res.render('dashboard/admin', { user: req.session.user });
});

// GET /teacher
router.get('/teacher', isLoggedIn, (req, res) => {
  if (req.session.user.VaiTro !== 'Giáo viên') {
    return res.redirect('/login');
  }
  res.render('dashboard/teacher', { user: req.session.user });
});

// GET /student
router.get('/student', isLoggedIn, (req, res) => {
  if (req.session.user.VaiTro !== 'Học sinh') {
    return res.redirect('/login');
  }
  res.render('dashboard/student', { user: req.session.user });
});

// GET /community - Phân hệ Cộng đồng & Wall of Fame (TTCĐ.01, TTCĐ.02, DF-03)
router.get('/community', isLoggedIn, (req, res) => {
  res.render('community', { user: req.session.user });
});

// GET /exam - Phòng thi trực tuyến chống gian lận (KTĐG.02 & DF-06)
router.get('/exam', isLoggedIn, (req, res) => {
  if (req.session.user.VaiTro !== 'Học sinh') {
    return res.redirect('/login');
  }
  res.render('exam', { user: req.session.user });
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Lỗi hủy session:', err.message);
    res.redirect('/login');
  });
});

module.exports = router;
