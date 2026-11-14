const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// Middleware xác thực quyền Admin
function requireAdmin(req, res, next) {
  if (req.session && req.session.user && req.session.user.VaiTro === 'Admin') {
    return next();
  }
  // Cho phép header test nếu có x-admin-role
  if (req.headers['x-admin-role'] === 'Admin') {
    return next();
  }
  return res.status(403).json({ success: false, message: 'Quyền truy cập bị từ chối: Yêu cầu vai trò Admin.' });
}

// 1. GET /api/admin/stats - Thống kê tổng quan hệ thống
router.get('/stats', requireAdmin, async (req, res) => {
  try {
    const pool = getPool();

    const [userStats, projectStats, submissionStats, examStats, judgeStats] = await Promise.all([
      pool.request().query(`
        SELECT 
          COUNT(*) AS TotalUsers,
          SUM(CASE WHEN VaiTro = N'Học sinh' THEN 1 ELSE 0 END) AS TotalStudents,
          SUM(CASE WHEN VaiTro = N'Giáo viên' THEN 1 ELSE 0 END) AS TotalTeachers,
          SUM(CASE WHEN VaiTro = N'Admin' THEN 1 ELSE 0 END) AS TotalAdmins,
          SUM(CASE WHEN TrangThai != N'Đang hoạt động' THEN 1 ELSE 0 END) AS TotalLockedUsers
        FROM NguoiDung
      `),
      pool.request().query(`SELECT COUNT(*) AS TotalProjects FROM DuAnBaiTap`),
      pool.request().query(`SELECT COUNT(*) AS TotalSubmissions FROM BaiNop`),
      pool.request().query(`SELECT COUNT(*) AS TotalExams FROM BaiThi`),
      pool.request().query(`SELECT COUNT(*) AS TotalJudges FROM MayCham WHERE TrangThai = N'Đang hoạt động'`)
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
        totalProjects: projectStats.recordset[0].TotalProjects || 0,
        totalSubmissions: submissionStats.recordset[0].TotalSubmissions || 0,
        totalExams: examStats.recordset[0].TotalExams || 0,
        totalJudges: judgeStats.recordset[0].TotalJudges || 0
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
        nd.MaNguoiDung, nd.HoTen, nd.Email, nd.VaiTro, nd.SoDienThoai, nd.TrangThai, nd.NgayTao,
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

// 3. POST /api/admin/users/:id/toggle-lock - THỰC THI LUỒNG DF-07 (Khóa mềm tài khoản, bảo toàn lịch sử)
router.post('/users/:id/toggle-lock', requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.id);

  if (isNaN(userId)) {
    return res.status(400).json({ success: false, message: 'Mã người dùng không hợp lệ' });
  }

  // Không cho phép tự khóa tài khoản Admin số 1
  if (userId === 1) {
    return res.status(400).json({ success: false, message: 'Không thể khóa tài khoản Quản trị viên gốc' });
  }

  try {
    const pool = getPool();

    // 1. Kiểm tra trạng thái hiện tại
    const check = await pool.request()
      .input('id', sql.Int, userId)
      .query(`SELECT MaNguoiDung, HoTen, Email, TrangThai FROM NguoiDung WHERE MaNguoiDung = @id`);

    if (check.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy người dùng' });
    }

    const currentStatus = check.recordset[0].TrangThai;
    const isCurrentlyActive = (currentStatus === 'Đang hoạt động');
    const newStatus = isCurrentlyActive ? 'Bị khóa (DF-07)' : 'Đang hoạt động';

    // 2. Cập nhật Khóa mềm (KHÔNG xóa cứng để bảo toàn lịch sử nộp bài trong BaiNop & KetQuaDiem theo DF-07)
    await pool.request()
      .input('id', sql.Int, userId)
      .input('newStatus', sql.NVarChar, newStatus)
      .query(`UPDATE NguoiDung SET TrangThai = @newStatus WHERE MaNguoiDung = @id`);

    console.log(`[DF-07] Đã chuyển trạng thái tài khoản #${userId} (${check.recordset[0].Email}) thành: ${newStatus}`);

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

module.exports = router;
