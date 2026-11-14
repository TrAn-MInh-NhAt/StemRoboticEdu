/**
 * judgeProxy.js
 * Proxy API từ Node.js → FastAPI Judge Engine (port 5000).
 * Cung cấp endpoint /api/judge/status cho UI hiển thị trạng thái máy chấm.
 */
const express = require('express');
const http = require('http');
const router = express.Router();
const { isLoggedIn } = require('../middleware/authMiddleware');

// GET /api/judge/status – Kiểm tra trạng thái Judge Engine
router.get('/status', isLoggedIn, (req, res) => {
  const start = Date.now();
  let responded = false;

  function sendResponse(statusObj) {
    if (responded || res.headersSent) return;
    responded = true;
    return res.json(statusObj);
  }

  function checkHealth() {
    if (responded || res.headersSent) return;
    const healthReq = http.request({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 2000,
    }, (hRes) => {
      let hData = '';
      hRes.on('data', chunk => { hData += chunk; });
      hRes.on('end', () => {
        if (hRes.statusCode === 200) {
          return sendResponse({
            success: true,
            online: true,
            latency_ms: Math.max(1, Date.now() - start),
            supported_langs: ['Python', 'C++', 'Arduino'],
            version: '2.0.0',
            service: 'STEM Robotic Judge Engine',
          });
        }
        return sendResponse({ success: false, online: false, latency_ms: null, error: 'Judge Engine offline' });
      });
    });

    healthReq.on('timeout', () => {
      healthReq.destroy();
      sendResponse({ success: false, online: false, latency_ms: null, error: 'Kết nối /health timeout' });
    });

    healthReq.on('error', () => {
      sendResponse({ success: false, online: false, latency_ms: null, error: 'Không kết nối được Judge Engine' });
    });

    healthReq.end();
  }

  const options = {
    hostname: '127.0.0.1',
    port: 5000,
    path: '/api/status',
    method: 'GET',
    timeout: 2500,
  };

  const proxyReq = http.request(options, (proxyRes) => {
    if (proxyRes.statusCode === 404) {
      return checkHealth();
    }
    let data = '';
    proxyRes.on('data', (chunk) => { data += chunk; });
    proxyRes.on('end', () => {
      try {
        const json = JSON.parse(data);
        return sendResponse({
          success: true,
          online: true,
          latency_ms: Math.max(1, Date.now() - start),
          supported_langs: json.supported_langs || ['Python', 'C++', 'Arduino'],
          version: json.version || '2.0.0',
          service: json.service || 'STEM Robotic Judge Engine',
        });
      } catch (e) {
        return checkHealth();
      }
    });
  });

  proxyReq.on('timeout', () => {
    proxyReq.destroy();
    sendResponse({ success: false, online: false, latency_ms: null, error: 'Judge Engine không phản hồi (timeout).' });
  });

  proxyReq.on('error', () => {
    if (!responded) {
      checkHealth();
    }
  });

  proxyReq.end();
});

// GET /api/judge/machines – Danh sách máy chấm từ DB
router.get('/machines', isLoggedIn, async (req, res) => {
  try {
    const { getPool, sql } = require('../config/db');
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT MaMayCham, TenMayCham, DiaChiAPI, NgonNguHoTro, DungLuongToiDa, TrangThai
      FROM MayCham
      ORDER BY MaMayCham ASC
    `);
    return res.json({ success: true, machines: result.recordset });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Lỗi truy vấn danh sách máy chấm: ' + err.message });
  }
});

module.exports = router;
