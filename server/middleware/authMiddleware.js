/**
 * authMiddleware.js
 * Middleware xác thực và phân quyền theo vai trò người dùng.
 * Hỗ trợ: isLoggedIn, requireRole(), isStudent, isTeacher, isAdmin, isTeacherOrAdmin.
 * Hỗ trợ cả Session (giao diện web) và Headers (x-user-id, x-role, x-admin-role cho API & Automation Test).
 */

function getReqUser(req) {
  if (req.session && req.session.user) return req.session.user;
  if (req.headers) {
    if (req.headers['x-admin-role'] === 'Admin') {
      return { MaNguoiDung: 1, HoTen: 'Quản trị viên Hệ thống', VaiTro: 'Admin' };
    }
    if (req.headers['x-role']) {
      const uid = parseInt(req.headers['x-user-id']) || (req.headers['x-role'] === 'Giáo viên' ? 2 : (req.headers['x-role'] === 'Admin' ? 1 : 3));
      return { MaNguoiDung: uid, HoTen: 'User ' + req.headers['x-role'], VaiTro: req.headers['x-role'] };
    }
    if (req.headers['x-user-id']) {
      const uid = parseInt(req.headers['x-user-id']);
      let role = 'Học sinh';
      if (uid === 1) role = 'Admin';
      else if (uid === 2) role = 'Giáo viên';
      return { MaNguoiDung: uid, HoTen: 'Người dùng #' + uid, VaiTro: role };
    }
  }
  return null;
}

function isLoggedIn(req, res, next) {
  const user = getReqUser(req);
  if (user) {
    if (!req.session) req.session = {};
    if (!req.session.user) req.session.user = user;
    return next();
  }
  if (req.path && req.path.startsWith('/api/')) {
    return res.status(401).json({ success: false, message: 'Chưa đăng nhập. Vui lòng đăng nhập để tiếp tục.' });
  }
  return res.redirect('/login');
}

/**
 * requireRole(...roles) – Middleware kiểm tra vai trò người dùng.
 * Nếu không có quyền: API trả 403 JSON, trang trả redirect /login.
 */
function requireRole(...roles) {
  return (req, res, next) => {
    const user = getReqUser(req);
    if (!user) {
      if (req.originalUrl && req.originalUrl.includes('/api/')) {
        return res.status(401).json({ success: false, message: 'Chưa đăng nhập.' });
      }
      return res.redirect('/login');
    }
    if (!req.session) req.session = {};
    if (!req.session.user) req.session.user = user;

    if (!roles.includes(user.VaiTro)) {
      if (req.originalUrl && req.originalUrl.includes('/api/')) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập chức năng này.' });
      }
      return res.redirect('/login');
    }
    next();
  };
}

const isStudent = requireRole('Học sinh');
const isTeacher = requireRole('Giáo viên');
const isAdmin   = requireRole('Admin');
const isTeacherOrAdmin = requireRole('Giáo viên', 'Admin');

module.exports = { isLoggedIn, requireRole, isStudent, isTeacher, isAdmin, isTeacherOrAdmin };
