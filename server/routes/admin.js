const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// Middleware xác thực quyền Admin
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.VaiTro === 'Admin') {
    return next();
  }
  // Cho phép header test nếu có x-admin-role trong môi trường dev / automation test
  if (process.env.NODE_ENV !== 'production' && req.headers['x-admin-role'] === 'Admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối: Yêu cầu vai trò Admin.' });
}

// 1. GET /api/admin/stats - Thống kê tổng quan hệ thống
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const [userStats, projectStats, submissionStats, examStats, judgeStats, classStats] = await Promise.all([
      pool.request().query(`
        SELECT 
          COUNT(*) AS TotalUsers,
          SUM(CASE WHEN VaiTro = N'Học sinh' THEN 1 ELSE 0 END) AS TotalStudents,
          SUM(CASE WHEN VaiTro = N'Giáo viên' THEN 1 ELSE 0 END) AS TotalTeachers,
          SUM(CASE WHEN VaiTro = N'Admin' THEN 1 ELSE 0 END) AS TotalAdmins,
          SUM(CASE WHEN TrangThai != N'Đang hoạt động' THEN 1 ELSE 0 END) AS TotalLockedUsers,
          SUM(CASE WHEN TrangThai = N'Chờ duyệt' OR TrangThaiXacThucThe = N'Chờ duyệt thẻ' THEN 1 ELSE 0 END) AS TotalPendingUsers
        FROM NguoiDung
      `),
      pool.request().query(`SELECT COUNT(*) AS TotalProjects FROM DuAnBaiTap`),
      pool.request().query(`SELECT COUNT(*) AS TotalSubmissions FROM BaiNop`),
      pool.request().query(`SELECT COUNT(*) AS TotalExams FROM BaiThi`),
      pool.request().query(`SELECT COUNT(*) AS TotalJudges FROM MayCham WHERE TrangThai = N'Đang hoạt động'`),
      pool.request().query(`SELECT COUNT(*) AS TotalClasses FROM LopHoc`)
    ]);

    const u = userStats.recordset[0];
    return res.json({
      success: true,
      stats: {
        totalUsers: u.TotalUsers || 0,
        totalStudents: u.TotalStudents || 0,
        totalTeachers: u.TotalTeachers || 0,
        totalAdmins: u.TotalAdmins || 0,
        totalLockedUsers: u.TotalLockedUsers || 0,
        totalPendingUsers: u.TotalPendingUsers || 0,
        totalProjects: projectStats.recordset[0].TotalProjects || 0,
        totalSubmissions: submissionStats.recordset[0].TotalSubmissions || 0,
        totalExams: examStats.recordset[0].TotalExams || 0,
        totalJudges: judgeStats.recordset[0].TotalJudges || 0,
        totalClasses: classStats.recordset[0].TotalClasses || 0
      }
    });
  } catch (err) {
    console.error('Lỗi lấy thống kê Admin:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy thống kê' });
  }
});

// 2. GET /api/admin/users - Danh sách người dùng
router.get('/users', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        nd.MaNguoiDung, nd.HoTen, nd.Email, nd.VaiTro, nd.Lop, nd.TruongHoc, 
        nd.TrangThaiXacThucThe, nd.TrangThai, nd.NgayTao,
        (SELECT COUNT(*) FROM BaiNop bn WHERE bn.MaNguoiDung = nd.MaNguoiDung) AS SoBaiNop
      FROM NguoiDung nd
      ORDER BY nd.MaNguoiDung ASC
    `);

    return res.json({
      success: true,
      users: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách người dùng:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách tài khoản' });
  }
});

// 3. POST /api/admin/users/:id/toggle-lock - THỰC THI LUỒNG DF-07
router.post('/users/:id/toggle-lock', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ' });
  }

  if (userId === 1) {
    return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Quản trị viên gốc' });
  }

  try {
    const pool = getPool();
    const check = await pool.request()
      .input('id', sql.Int, userId)
      .query(`SELECT MaNguoiDung, HoTen, Email, TrangThai FROM NguoiDung WHERE MaNguoiDung = @id`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const currentStatus = check.recordset[0].TrangThai;
    const isCurrentlyActive = (currentStatus === 'Đang hoạt động');
    const newStatus = isCurrentlyActive ? 'Bị khóa' : 'Đang hoạt động';

    await pool.request()
      .input('id', sql.Int, userId)
      .input('newStatus', sql.NVarChar, newStatus)
      .query(`UPDATE NguoiDung SET TrangThai = @newStatus WHERE MaNguoiDung = @id`);

    return res.json({
      success: true,
      message: isCurrentlyActive 
        ? `Đã khóa mềm tài khoản #${userId} theo luồng DF-07. Lịch sử bài nộp được bảo toàn nguyên vẹn.` 
        : `Đã mở khóa tài khoản #${userId} thành công. Người dùng có thể đăng nhập bình thường.`,
      newStatus,
      isLocked: isCurrentlyActive
    });
  } catch (err) {
    console.error('Lỗi chuyển trạng thái tài khoản DF-07:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật trạng thái tài khoản' });
  }
});

// 4. POST /api/admin/users/:id/role - QTHT.01: Phân quyền & Đổi vai trò tài khoản
router.post('/users/:id/role', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { vaiTro } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ' });
  }

  const validRoles = ['Học sinh', 'Giáo viên', 'Admin'];
  if (!validRoles.includes(vaiTro)) {
    return res.status(400).json({ success: false, message: 'Vai trò không hợp lệ. Chỉ chấp nhận: Học sinh, Giáo viên, Admin' });
  }

  if (userId === 1) {
    return res.status(400).json({ success: false, message: 'Không thể thay đổi vai trò của Quản trị viên gốc' });
  }

  try {
    const pool = getPool();
    await pool.request()
      .input('id', sql.Int, userId)
      .input('vaiTro', sql.NVarChar, vaiTro)
      .query('UPDATE NguoiDung SET VaiTro = @vaiTro WHERE MaNguoiDung = @id');

    return res.json({
      success: true,
      message: `Đã cập nhật vai trò người dùng #${userId} thành "${vaiTro}" thành công!`,
      vaiTro
    });
  } catch (err) {
    console.error('Lỗi đổi vai trò QTHT.01:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đổi vai trò: ' + err.message });
  }
});

// ==============================================================================
// 5. QUẢN LÝ LỚP HỌC (QUẢN TRỊ VIÊN & PHÂN CÔNG GVCN)
// ==============================================================================

// GET /api/admin/classes - Lấy danh sách lớp kèm GVCN và số học sinh
router.get('/classes', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        l.MaLop, l.TenLop, l.KhoiLop, l.NienKhoa, l.MaGiaoVienCN, l.MoTa, l.NgayTao,
        nd.HoTen AS TenGiaoVienCN, nd.Email AS EmailGiaoVienCN,
        (SELECT COUNT(*) FROM NguoiDung s WHERE s.Lop = l.TenLop AND s.VaiTro = N'Học sinh') AS SoHocSinh
      FROM LopHoc l
      LEFT JOIN NguoiDung nd ON l.MaGiaoVienCN = nd.MaNguoiDung
      ORDER BY l.KhoiLop ASC, l.TenLop ASC
    `);

    return res.json({
      success: true,
      classes: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách lớp học:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách lớp học' });
  }
});

// GET /api/admin/teachers - Lấy danh sách tài khoản giáo viên để gán GVCN
router.get('/teachers', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT MaNguoiDung, HoTen, Email, SoDienThoai
      FROM NguoiDung
      WHERE VaiTro = N'Giáo viên' AND TrangThai = N'Đang hoạt động'
      ORDER BY HoTen ASC
    `);

    return res.json({
      success: true,
      teachers: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách giáo viên:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách giáo viên' });
  }
});

// POST /api/admin/classes - Thêm lớp học mới
router.post('/classes', requireAdmin, async (req, res) => {
  const { tenLop, khoiLop, nienKhoa, maGiaoVienCN, moTa } = req.body;

  if (!tenLop) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập tên lớp (ví dụ: 10/1, 10/2)' });
  }

  try {
    const pool = getPool();
    // Kiểm tra lớp đã tồn tại chưa
    const check = await pool.request()
      .input('tenLop', sql.NVarChar, tenLop.trim())
      .query(`SELECT MaLop FROM LopHoc WHERE TenLop = @tenLop`);

    if (check.recordset.length > 0) {
      return res.status(400).json({ success: false, message: `Lớp "${tenLop}" đã tồn tại trong hệ thống` });
    }

    const ins = await pool.request()
      .input('tenLop', sql.NVarChar, tenLop.trim())
      .input('khoiLop', sql.Int, parseInt(khoiLop) || 10)
      .input('nienKhoa', sql.NVarChar, nienKhoa || '2025-2026')
      .input('maGiaoVienCN', sql.Int, maGiaoVienCN ? parseInt(maGiaoVienCN) : 2) // Mặc định TS. Đặng Hùng Vĩ
      .input('moTa', sql.NVarChar, moTa || `Lớp học STEM Robotics ${tenLop}`)
      .query(`
        INSERT INTO LopHoc (TenLop, KhoiLop, NienKhoa, MaGiaoVienCN, MoTa)
        OUTPUT INSERTED.MaLop, INSERTED.TenLop
        VALUES (@tenLop, @khoiLop, @nienKhoa, @maGiaoVienCN, @moTa)
      `);

    return res.status(201).json({
      success: true,
      message: `Tạo lớp "${tenLop}" thành công!`,
      class: ins.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi tạo lớp học:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tạo lớp học: ' + err.message });
  }
});

// PUT /api/admin/classes/:id - Cập nhật thông tin lớp / phân công GVCN
router.put('/classes/:id', requireAdmin, async (req, res) => {
  const maLop = parseInt(req.params.id);
  const { tenLop, khoiLop, nienKhoa, maGiaoVienCN, moTa } = req.body;

  if (isNaN(maLop)) {
    return res.status(400).json({ success: false, message: 'Mã lớp không hợp lệ' });
  }

  try {
    const pool = getPool();
    await pool.request()
      .input('maLop', sql.Int, maLop)
      .input('tenLop', sql.NVarChar, tenLop ? tenLop.trim() : '10/1')
      .input('khoiLop', sql.Int, parseInt(khoiLop) || 10)
      .input('nienKhoa', sql.NVarChar, nienKhoa || '2025-2026')
      .input('maGiaoVienCN', sql.Int, parseInt(maGiaoVienCN) || 2)
      .input('moTa', sql.NVarChar, moTa || '')
      .query(`
        UPDATE LopHoc
        SET TenLop = @tenLop, KhoiLop = @khoiLop, NienKhoa = @nienKhoa, 
            MaGiaoVienCN = @maGiaoVienCN, MoTa = @moTa
        WHERE MaLop = @maLop
      `);

    return res.json({
      success: true,
      message: 'Cập nhật phân công lớp học thành công!'
    });
  } catch (err) {
    console.error('Lỗi cập nhật lớp học:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi cập nhật lớp học: ' + err.message });
  }
});

// ==============================================================================
// 6. HÀNG ĐỢI DUYỆT TÀI KHOẢN & XÁC THỰC THẺ HỌC SINH (PENDING APPROVAL QUEUE)
// ==============================================================================

// GET /api/admin/pending-students - Lấy danh sách học sinh đang chờ duyệt
router.get('/pending-students', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        nd.MaNguoiDung, nd.HoTen, nd.Email, nd.Lop, nd.TruongHoc,
        nd.AnhTheHocSinh, nd.TrangThaiXacThucThe, nd.TrangThai, nd.NgayTao,
        nd.MaDinhDanhHS
      FROM NguoiDung nd
      WHERE nd.TrangThai = N'Chờ duyệt' OR nd.TrangThaiXacThucThe LIKE N'%Chờ duyệt%'
      ORDER BY nd.MaNguoiDung DESC
    `);

    return res.json({
      success: true,
      students: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách học sinh chờ duyệt:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy danh sách chờ duyệt' });
  }
});

// POST /api/admin/approve-student/:id - Admin phê duyệt kích hoạt tài khoản
router.post('/approve-student/:id', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ' });
  }

  try {
    const pool = getPool();
    await pool.request()
      .input('id', sql.Int, userId)
      .query(`
        UPDATE NguoiDung
        SET TrangThai = N'Đang hoạt động',
            TrangThaiXacThucThe = N'Đã xác thực (Admin duyệt)'
        WHERE MaNguoiDung = @id
      `);

    return res.json({
      success: true,
      message: `Đã phê duyệt tài khoản #${userId} thành công. Học sinh có thể đăng nhập vào lớp!`
    });
  } catch (err) {
    console.error('Lỗi duyệt học sinh Admin:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi duyệt học sinh: ' + err.message });
  }
});

// POST /api/admin/reject-student/:id - Admin từ chối duyệt
router.post('/reject-student/:id', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);
  const { lyDo } = req.body;

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ' });
  }

  try {
    const pool = getPool();
    await pool.request()
      .input('id', sql.Int, userId)
      .query(`
        UPDATE NguoiDung
        SET TrangThai = N'Bị từ chối duyệt',
            TrangThaiXacThucThe = N'Từ chối duyệt thẻ'
        WHERE MaNguoiDung = @id
      `);

    return res.json({
      success: true,
      message: `Đã từ chối duyệt tài khoản #${userId}.`
    });
  } catch (err) {
    console.error('Lỗi từ chối duyệt học sinh Admin:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi từ chối duyệt học sinh' });
  }
});

module.exports = router;
