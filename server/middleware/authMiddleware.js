/**
 * authMiddleware.js
 * Middleware xác thực và phân quyền theo vai trò người dùng.
 * Hỗ trợ: isLoggedIn, requireRole(), isStudent, isTeacher, isAdmin, isTeacherOrAdmin.
 * Hỗ trợ cả Session (giao diện web) và Headers (x-user-id, x-role, x-admin-role cho API & Automation Test).
 */

function getReqUser(req) {
  if (req.session && req.session.user) return req.session.user;
  // Chỉ cho phép giả lập vai trò qua HTTP Headers trong môi trường dev / automation test
  if (process.env.NODE_ENV !== 'production' && req.headers) {
    if (req.headers['x-admin-role'] === 'Admin') {
      return { MaNguoiDung: 1, HoTen: 'Quản trị viên Hệ thống', VaiTro: 'Admin' };
    }
    if (req.headers['x-role']) {
      let r = req.headers['x-role'];
      try { r = decodeURIComponent(r); } catch(e) {}
      if (r === 'Teacher' || r === 'GiaoVien') r = 'Giáo viên';
      if (r === 'Student' || r === 'HocSinh') r = 'Học sinh';
      const uid = parseInt(req.headers['x-user-id']) || (r === 'Giáo viên' ? 2 : (r === 'Admin' ? 1 : 3));
      return { MaNguoiDung: uid, HoTen: 'User ' + r, VaiTro: r };
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
  if ((req.originalUrl && req.originalUrl.includes('/api/')) || (req.path && req.path.startsWith('/api/'))) {
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

    const userRole = user.VaiTro;
    const isAllowed = roles.some(r => {
      if (r === userRole) return true;
      if (r === 'Học sinh' && (userRole === 'Student' || userRole === 'HocSinh' || (typeof userRole === 'string' && userRole.includes('sinh')))) return true;
      if (r === 'Giáo viên' && (userRole === 'Teacher' || userRole === 'GiaoVien' || (typeof userRole === 'string' && userRole.includes('viên')))) return true;
      if (r === 'Admin' && (typeof userRole === 'string' && userRole.toLowerCase() === 'admin')) return true;
      return false;
    });

    if (!isAllowed) {
      if (req.originalUrl && req.originalUrl.includes('/api/')) {
        return res.status(403).json({ success: false, message: 'Không có quyền truy cập chức năng này.' });
      }
      if (userRole === 'Admin') return res.redirect('/admin');
      if (userRole === 'Giáo viên' || userRole === 'Teacher') return res.redirect('/teacher');
      if (userRole === 'Học sinh' || userRole === 'Student') return res.redirect('/student');
      return res.redirect('/');
    }
    next();
  };
}

const isStudent = requireRole('Học sinh');
const isTeacher = requireRole('Giáo viên');
const isAdmin   = requireRole('Admin');
const isTeacherOrAdmin = requireRole('Giáo viên', 'Admin');

module.exports = { isLoggedIn, requireRole, isStudent, isTeacher, isAdmin, isTeacherOrAdmin };
