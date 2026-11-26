'use strict';
/**
 * hocLieuRoutes.js - Route dinh tuyen MVC cho Phan he 2
 * Tac gia: Pham Thi Ha Vy (feature/vy-hoclieu-morong)
 * Quan ly Hoc lieu (QTHL.01 - QTHL.02), Tra cuu Linh kien (TCPP.01 - TCPP.02), Canh bao DF-05
 */

const express = require('express');
const router = express.Router();
const HocLieuController = require('../controllers/hocLieuController');

// ==============================================================================
// 1. GIAO DIEN (VIEWS)
// ==============================================================================

// Giao dien Quan ly hoc lieu cho Giao vien (QTHL.01, QTHL.02, DF-05)
router.get('/', HocLieuController.renderQuanLyHocLieu);
router.get('/quan-ly', HocLieuController.renderQuanLyHocLieu);

// Giao dien Tra cuu linh kien Pinout & Bat loi code cho Hoc sinh (TCPP.01, TCPP.02)
router.get('/tra-cuu', HocLieuController.renderTraCuuLinhKien);

// ==============================================================================
// 2. API ENDPOINTS (JSON)
// ==============================================================================

// TCPP.01: Cay lo trinh hoc logic theo 3 chu de (Co khi, Mach dien, Lap trinh)
router.get('/api/tree', HocLieuController.apiGetTree);

// TCPP.02: Tra cuu linh kien Pinout & Goi y sua loi code
router.get('/api/lookup', HocLieuController.apiLookup);

// DF-05: Danh sach hoc lieu co ty le loi > 30% can cap nhat
router.get('/api/warnings', HocLieuController.apiGetWarnings);

// QTHL.01 & QTHL.02: Danh sach va chi tiet hoc lieu
router.get('/api/list', HocLieuController.apiGetList);
router.get('/api/detail/:id', HocLieuController.apiGetDetail);

// QTHL.01: Them moi hoc lieu & code mau
router.post('/api/create', HocLieuController.apiCreate);

// QTHL.02 & DF-05: Cap nhat noi dung hoc lieu (tu dong tat co canh bao khi cap nhat)
router.put('/api/update/:id', HocLieuController.apiUpdate);
router.post('/api/update/:id', HocLieuController.apiUpdate); // Ho tro form POST truyen thong

// QTHL.02: An / Xuat ban hoc lieu (Kiem tra rang buoc khong cho an neu dang co bai tap mo)
router.post('/api/hide/:id', HocLieuController.apiToggleHide);

module.exports = router;
