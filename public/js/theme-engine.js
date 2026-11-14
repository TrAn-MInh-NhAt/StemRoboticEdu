/**
 * STEM Robotic Edu — Theme Motion & Interaction Engine
 * Chuẩn hóa trải nghiệm 60fps mượt mà, phản hồi Toast chuyên nghiệp & Hiệu ứng nút bấm Neo-Brutalist
 */

(function () {
  'use strict';

  // 1. Hệ thống Toast Notification đồng bộ toàn trang
  window.showToast = function (message, type = 'success') {
    let container = document.getElementById('globalToastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'globalToastContainer';
      container.style.cssText = 'position:fixed; bottom:24px; right:24px; z-index:99999; display:flex; flex-direction:column; gap:10px; pointer-events:none;';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    const isError = (type === 'error');
    const isWarning = (type === 'warning');

    let borderColor = '#047857';
    let bgColor = '#F0FDF4';
    let textColor = '#065F46';
    let iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#047857" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>';

    if (isError) {
      borderColor = '#DC2626';
      bgColor = '#FFF5F5';
      textColor = '#991B1B';
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (isWarning) {
      borderColor = '#D97706';
      bgColor = '#FFFBEB';
      textColor = '#92400E';
      iconSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D97706" stroke-width="2.5"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>';
    }

    toast.className = 'bento-card';
    toast.style.cssText = `
      background: ${bgColor};
      border: 2px solid ${borderColor};
      box-shadow: 4px 4px 0 ${borderColor};
      color: ${textColor};
      padding: 12px 20px;
      font-weight: 700;
      font-size: 0.92rem;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      border-radius: 16px;
      pointer-events: auto;
      max-width: 440px;
      transform: translate3d(0, 20px, 0);
      opacity: 0;
      transition: transform 0.22s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.22s ease;
    `;

    toast.innerHTML = `
      <div style="flex-shrink:0; display:flex; align-items:center;">${iconSvg}</div>
      <div style="line-height:1.45; word-break:break-word;">${message}</div>
    `;

    container.appendChild(toast);

    // Kích hoạt animation xuất hiện
    requestAnimationFrame(() => {
      toast.style.transform = 'translate3d(0, 0, 0)';
      toast.style.opacity = '1';
    });

    // Tự động biến mất
    setTimeout(() => {
      toast.style.transform = 'translate3d(0, 10px, 0)';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 250);
    }, 4000);
  };

  // 2. Nam châm con trỏ 60fps mượt mà (Throttled với requestAnimationFrame)
  function initMagneticButtons() {
    const buttons = document.querySelectorAll('.magnet-btn');
    buttons.forEach((btn) => {
      let isTicking = false;

      btn.addEventListener('mousemove', (e) => {
        if (!isTicking) {
          requestAnimationFrame(() => {
            const rect = btn.getBoundingClientRect();
            const x = (e.clientX - rect.left - rect.width / 2) * 0.15;
            const y = (e.clientY - rect.top - rect.height / 2) * 0.15;
            btn.style.transform = `translate3d(${x}px, ${y}px, 0)`;
            isTicking = false;
          });
          isTicking = true;
        }
      });

      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // 3. Tối ưu xuất hiện ngay lập tức (Giảm trễ thị giác, web siêu mượt)
  function initBouncyScroll() {
    document.querySelectorAll('.bouncy-up').forEach((el) => {
      el.classList.add('visible');
    });
  }

  // 4. Toggle Dropdown Submenu Sidebar thống nhất
  window.toggleSidebarDropdown = function (el) {
    const parent = el.closest('.sidebar-dropdown');
    if (parent) {
      parent.classList.toggle('open');
    }
  };

  // 5. Khởi chạy khi DOM sẵn sàng
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initMagneticButtons();
      initBouncyScroll();
    });
  } else {
    initMagneticButtons();
    initBouncyScroll();
  }
})();
