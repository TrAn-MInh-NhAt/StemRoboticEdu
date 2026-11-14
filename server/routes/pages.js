const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');
const { isLoggedIn, requireRole, isTeacherOrAdmin } = require('../middleware/authMiddleware');

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
router.get('/admin', requireRole('Admin'), (req, res) => {
  res.render('dashboard/admin', { user: req.session.user });
});

// GET /teacher
router.get('/teacher', requireRole('Giáo viên'), (req, res) => {
  res.render('dashboard/teacher', { user: req.session.user });
});

// GET /student
router.get('/student', requireRole('Học sinh'), (req, res) => {
  res.render('dashboard/student', { user: req.session.user, activeProjectId: req.query.project || null });
});

// GET /student/project/:id - Trang không gian bài tập & nộp bài chi tiết
router.get('/student/project/:id', requireRole('Học sinh'), (req, res) => {
  res.render('dashboard/student', { user: req.session.user, activeProjectId: req.params.id });
});

// GET /community - Phân hệ Cộng đồng & Wall of Fame (TTCĐ.01, TTCĐ.02, DF-03)
router.get('/community', isLoggedIn, (req, res) => {
  if (req.session.user && req.session.user.VaiTro === 'Học sinh') {
    return res.redirect('/student?view=community-fame');
  }
  res.render('community', { user: req.session.user });
});

// GET /exam - Phòng thi trực tuyến chống gian lận (KTĐG.02 & DF-06)
router.get('/exam', requireRole('Học sinh'), (req, res) => {
  res.render('exam', { user: req.session.user });
});

// ==============================================================================
// MÔ ĐUN QTHT.02: TRA CỨU & CẬP NHẬT HỒ SƠ CÁ NHÂN (/profile)
// ==============================================================================
router.get('/profile', isLoggedIn, async (req, res) => {
  try {
    const pool = getPool();
    const userId = req.session.user.MaNguoiDung;

    // Lấy thông tin chi tiết người dùng
    const userRes = await pool.request()
      .input('id', sql.Int, userId)
      .query(`
        SELECT MaNguoiDung, HoTen, Email, VaiTro, SoDienThoai, AnhDaiDien, TrangThai, NgayTao
        FROM NguoiDung
        WHERE MaNguoiDung = @id
      `);

    const profileData = userRes.recordset[0] || req.session.user;

    // Lấy thống kê hoạt động thực hành
    const statsRes = await pool.request()
      .input('id', sql.Int, userId)
      .query(`
        SELECT 
          COUNT(bn.MaBaiNop) as TongBaiNop,
          ISNULL(MAX(kq.TongDiem), 0) as DiemCaoNhat,
          ISNULL(AVG(kq.TongDiem), 0) as DiemTrungBinh,
          COUNT(CASE WHEN kq.TongDiem >= 5 THEN 1 END) as SoBaiDat
        FROM BaiNop bn
        LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        WHERE bn.MaNguoiDung = @id
      `);

    res.render('profile', {
      user: req.session.user,
      profile: profileData,
      stats: statsRes.recordset[0] || { TongBaiNop: 0, DiemCaoNhat: 0, DiemTrungBinh: 0, SoBaiDat: 0 }
    });
  } catch (err) {
    console.error('Lỗi tải trang hồ sơ cá nhân:', err.message);
    res.render('profile', {
      user: req.session.user,
      profile: req.session.user,
      stats: { TongBaiNop: 0, DiemCaoNhat: 0, DiemTrungBinh: 0, SoBaiDat: 0 }
    });
  }
});

// ==============================================================================
// MÔ ĐUN XBC.02: TRANG XEM TRƯỚC BẢN IN BẢNG ĐIỂM (PRINT PREVIEW / PDF)
// ==============================================================================
router.get('/print-report', isLoggedIn, async (req, res) => {
  if (req.session.user.VaiTro !== 'Giáo viên' && req.session.user.VaiTro !== 'Admin') {
    return res.redirect('/');
  }

  const { maDuAn, trangThai } = req.query;

  try {
    const pool = getPool();
    let queryStr = `
      SELECT 
        bn.MaBaiNop,
        nd.HoTen AS TenHocSinh,
        nd.Email,
        ISNULL(da.TenDuAn, bt.TenBaiThi) AS TenBaiTap,
        da.MaDuAn,
        kq.DiemCode,
        ISNULL(kq.KetQuaCode, N'Chưa chấm') AS KetQuaCode,
        ISNULL(kq.KetQuaVideo, N'Chưa duyệt') AS KetQuaVideo,
        kq.TongDiem,
        bn.TrangThai,
        FORMAT(bn.ThoiGianNop, 'dd/MM/yyyy HH:mm') AS ThoiGianNop,
        ISNULL(kq.NhanXet, N'') AS NhanXet
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
      const logReq = pool.request();
      logReq.input('userId', sql.Int, req.session.user.MaNguoiDung);
      logReq.input('tenBaoCao', sql.NVarChar, `Bản in Bảng điểm Đào tạo STEM Robotic (Tổng số: ${result.recordset.length} bản ghi)`);
      logReq.input('loaiBaoCao', sql.NVarChar, 'Điểm');
      logReq.input('duLieuThongKe', sql.NVarChar, JSON.stringify({
        soLuong: result.recordset.length,
        filterDuAn: maDuAn || 'all',
        filterTrangThai: trangThai || 'all',
        thoiDiemIn: new Date().toISOString()
      }));
      logReq.input('dinhDangTep', sql.VarChar, 'PDF');
      await logReq.query(`
        INSERT INTO BaoCaoThongKe (MaNguoiDung, TenBaoCao, LoaiBaoCao, DuLieuThongKe, DinhDangTep, TrangThai)
        VALUES (@userId, @tenBaoCao, @loaiBaoCao, @duLieuThongKe, @dinhDangTep, N'Hoàn thành')
      `);
    } catch (logErr) {
      console.warn('Lỗi ghi log BaoCaoThongKe:', logErr.message);
    }

    res.render('print_report', {
      user: req.session.user,
      grades: result.recordset,
      filters: { maDuAn: maDuAn || 'all', trangThai: trangThai || 'all' }
    });

  } catch (err) {
    console.error('Lỗi mở bản in bảng điểm:', err.message);
    res.status(500).send('Lỗi khi tải bảng in báo cáo: ' + err.message);
  }
});

// GET /logout
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Lỗi hủy session:', err.message);
    res.redirect('/login');
  });
});

module.exports = router;
