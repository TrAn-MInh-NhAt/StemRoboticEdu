/* ============================================================
   STEM Robotic — login.js
   Xử lý form đăng nhập qua fetch API (Hỗ trợ từ chối DF-07)
   ============================================================ */

(function () {
  'use strict';

  const form     = document.getElementById('loginForm');
  const btnLogin = document.getElementById('btnLogin');
  const errorMsg = document.getElementById('errorMsg');

  if (!form) return;

  function showError(msg, isLocked) {
    errorMsg.innerHTML = isLocked ? `<strong>TÀI KHOẢN BỊ KHÓA (DF-07):</strong><br>${msg}` : msg;
    errorMsg.style.display = 'block';
    if (isLocked) {
      errorMsg.style.background = '#FFE4E6';
      errorMsg.style.color = '#BE123C';
      errorMsg.style.borderColor = '#FECDD3';
    }
  }

  function hideError() {
    errorMsg.textContent = '';
    errorMsg.style.display = 'none';
  }

  function setLoading(isLoading) {
    btnLogin.disabled = isLoading;
    btnLogin.textContent = isLoading ? 'Đang xác thực...' : 'Đăng nhập hệ thống';
  }

  function redirectByRole(vaiTro) {
    const routes = {
      'Admin':     '/admin',
      'Giáo viên': '/teacher',
      'Học sinh':  '/student'
    };
    const path = routes[vaiTro] || '/';
    window.location.href = path;
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();
    hideError();

    const email    = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
      showError('Vui lòng nhập đầy đủ email và mật khẩu.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      let data;
      try {
        data = await res.json();
      } catch {
        throw new Error('Phản hồi từ máy chủ không hợp lệ.');
      }

      if (res.ok && data.success) {
        redirectByRole(data.user.VaiTro);
      } else {
        const isLocked = (res.status === 403) || (data && data.isLocked);
        showError(data.message || 'Đăng nhập thất bại. Vui lòng thử lại.', isLocked);
        setLoading(false);
      }
    } catch (err) {
      showError(err.message || 'Không thể kết nối máy chủ. Vui lòng thử lại.');
      setLoading(false);
    }
  });
})();
