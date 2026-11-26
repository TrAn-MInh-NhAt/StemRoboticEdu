'use strict';
/**
 * hocLieuController.js - Controller dieu phoi nghiep vu Phan he 2 (MVC)
 * Tac gia: Pham Thi Ha Vy (feature/vy-hoclieu-morong)
 * Xu ly: QTHL.01, QTHL.02, TCPP.01, TCPP.02, Luong tu dong DF-05
 */

const path = require('path');
const HocLieuModel = require('../models/hocLieuModel');

// Duong dan view chuan
const VIEW_QUAN_LY = path.resolve(__dirname, '../../views/materials/quan_ly_hoc_lieu.ejs');
const VIEW_TRA_CUU = path.resolve(__dirname, '../../views/materials/tra_cuu_linh_kien.ejs');

class HocLieuController {
  // ==============================================================================
  // 1. GIAO DIEN (VIEWS)
  // ==============================================================================

  /**
   * Render trang quan tri hoc lieu cho Giao vien (QTHL.01 - QTHL.02 - DF-05)
   */
  static async renderQuanLyHocLieu(req, res) {
    try {
      const filters = {
        chuDe: req.query.chuDe || '',
        loaiHocLieu: req.query.loai || '',
        trangThai: req.query.trangThai || '',
        keyword: req.query.q || ''
      };

      const [hocLieuList, loTrinhList, warnings] = await Promise.all([
        HocLieuModel.getAllHocLieu(filters),
        HocLieuModel.getAllLoTrinh(),
        HocLieuModel.getWarningHocLieuDF05()
      ]);

      const user = req.session ? req.session.user : { HoTen: 'Pham Thi Ha Vy', VaiTro: 'Giáo viên' };

      const renderData = {
        title: 'Quản Lý Học Liệu & Code Mẫu - STEM Robotic Edu',
        hocLieuList,
        loTrinhList,
        warnings,
        filters,
        user
      };

      try {
        return res.render(VIEW_QUAN_LY, renderData);
      } catch (errRender) {
        return res.render('materials/quan_ly_hoc_lieu', renderData);
      }
    } catch (error) {
      console.error('[HocLieuController.renderQuanLyHocLieu Error]:', error);
      res.status(500).send('Loi he thong khi tai trang quan ly hoc lieu: ' + error.message);
    }
  }

  /**
   * Render trang tra cuu linh kien Pinout & Bat loi code cho Hoc sinh (TCPP.01 - TCPP.02)
   */
  static async renderTraCuuLinhKien(req, res) {
    try {
      const keyword = (req.query.q || '').trim();

      const [treeData, searchResults] = await Promise.all([
        HocLieuModel.getTreeCurriculum(),
        keyword ? HocLieuModel.lookupComponentAndErrors(keyword) : null
      ]);

      const user = req.session ? req.session.user : { HoTen: 'Học sinh STEM 10/1', VaiTro: 'Học sinh' };

      const renderData = {
        title: 'Tra Cứu Linh Kiện & Bắt Lỗi Code - STEM Robotic Edu',
        treeData,
        searchResults,
        keyword,
        user
      };

      try {
        return res.render(VIEW_TRA_CUU, renderData);
      } catch (errRender) {
        return res.render('materials/tra_cuu_linh_kien', renderData);
      }
    } catch (error) {
      console.error('[HocLieuController.renderTraCuuLinhKien Error]:', error);
      res.status(500).send('Loi he thong khi tai trang tra cuu linh kien: ' + error.message);
    }
  }

  // ==============================================================================
  // 2. API ENDPOINTS (JSON)
  // ==============================================================================

  /**
   * API: Lay danh sach hoc lieu
   */
  static async apiGetList(req, res) {
    try {
      const filters = {
        chuDe: req.query.chuDe,
        loaiHocLieu: req.query.loaiHocLieu,
        trangThai: req.query.trangThai,
        keyword: req.query.keyword,
        coCanCapNhat: req.query.coCanCapNhat !== undefined ? req.query.coCanCapNhat === 'true' : undefined
      };
      const list = await HocLieuModel.getAllHocLieu(filters);
      res.json({ success: true, count: list.length, data: list });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API: Chi tiet 1 hoc lieu
   */
  static async apiGetDetail(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Ma hoc lieu khong hop le' });
      }
      const item = await HocLieuModel.getHocLieuById(id);
      if (!item) {
        return res.status(404).json({ success: false, message: 'Khong tim thay hoc lieu' });
      }
      res.json({ success: true, data: item });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API QTHL.01: Them moi bai giang & code mau
   * Rang buoc nghiep vu:
   * - So do 3D bat buoc co thong so linh kien di kem trong NoiDung
   * - Video mac dinh ho tro che do xem va tua cham
   */
  static async apiCreate(req, res) {
    try {
      const { tenHocLieu, loaiHocLieu, noiDung, duongDanTep, maLoTrinh, trangThai } = req.body;

      if (!tenHocLieu || !tenHocLieu.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Tieu de hoc lieu (TenHocLieu) la bat buoc.'
        });
      }

      // Rang buoc chuan hoa QTHL.01 cho So do 3D
      if (loaiHocLieu === 'Sơ đồ 3D' || loaiHocLieu === 'So do 3D') {
        if (!noiDung || !noiDung.trim()) {
          return res.status(400).json({
            success: false,
            message: 'Rang buoc QTHL.01: So do lap rap 3D bat buoc phai co thong so linh kien va so do chan di kem de hoc sinh khong dau nham.'
          });
        }
      }

      const maNguoiDung = (req.session && req.session.user && req.session.user.MaNguoiDung) ? req.session.user.MaNguoiDung : 2;

      const created = await HocLieuModel.createHocLieu({
        maNguoiDung,
        maLoTrinh: maLoTrinh ? parseInt(maLoTrinh, 10) : null,
        tenHocLieu: tenHocLieu.trim(),
        loaiHocLieu: loaiHocLieu || 'Tai lieu',
        noiDung: noiDung || '',
        duongDanTep: duongDanTep || null,
        coCanCapNhat: 0,
        trangThai: trangThai || 'Ban nhap'
      });

      res.status(201).json({
        success: true,
        message: 'Them moi hoc lieu thanh cong.',
        data: created
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API QTHL.02 & DF-05: Cap nhat noi dung hoc lieu
   * Luong DF-05: Tu dong tat co CoCanCapNhat = 0 sau khi GV bo sung noi dung huong dan
   */
  static async apiUpdate(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Ma hoc lieu khong hop le' });
      }

      const existing = await HocLieuModel.getHocLieuById(id);
      if (!existing) {
        return res.status(404).json({ success: false, message: 'Hoc lieu khong ton tai' });
      }

      const { tenHocLieu, loaiHocLieu, noiDung, duongDanTep, maLoTrinh, trangThai } = req.body;

      // DF-05: Neu hoc lieu dang co co CoCanCapNhat = 1, khi GV cap nhat noi dung se tu dong tat co
      const coCanCapNhatReset = 0;

      const updated = await HocLieuModel.updateHocLieu(id, {
        tenHocLieu,
        loaiHocLieu,
        noiDung,
        duongDanTep,
        maLoTrinh: maLoTrinh ? parseInt(maLoTrinh, 10) : undefined,
        trangThai,
        coCanCapNhat: coCanCapNhatReset
      });

      res.json({
        success: true,
        message: existing.CoCanCapNhat 
          ? 'Cap nhat hoc lieu thanh cong. Da tu dong tat co canh bao ty le loi (DF-05).' 
          : 'Cap nhat hoc lieu thanh cong.',
        data: updated
      });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API QTHL.02: An hoac hien hoc lieu (Co kiem tra rang buoc tinh lien mach)
   * Neu bai hoc nam trong ki thi hoac bai tap dang mo -> CANH BAO VA CHAN AN
   */
  static async apiToggleHide(req, res) {
    try {
      const id = parseInt(req.params.id, 10);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: 'Ma hoc lieu khong hop le' });
      }

      const hocLieu = await HocLieuModel.getHocLieuById(id);
      if (!hocLieu) {
        return res.status(404).json({ success: false, message: 'Khong tim thay hoc lieu' });
      }

      const isHiding = hocLieu.TrangThai !== 'Ẩn' && hocLieu.TrangThai !== 'An';

      if (isHiding) {
        // KIEM TRA RANG BUOC TINH LIEN MACH (QTHL.02)
        const checkRef = await HocLieuModel.checkActiveReferences(id);
        if (!checkRef.canHide) {
          return res.status(400).json({
            success: false,
            blocked: true,
            message: 'KHONG THE AN HOC LIEU: ' + checkRef.reason,
            activeExercises: checkRef.activeExercises,
            activeExams: checkRef.activeExams,
            warning: 'Hoc lieu dang duoc hoc sinh su dung de lam bai tap / thi truc tuyen. Vui long doi den khi het han nop bai de an.'
          });
        }

        const result = await HocLieuModel.setStatus(id, 'Ẩn');
        return res.json({
          success: true,
          message: `Da an hoc lieu "${hocLieu.TenHocLieu}". Hoc sinh se khong con nhin thay hoc lieu nay.`,
          data: result
        });
      } else {
        // Mo lai hoc lieu (Xuat ban)
        const result = await HocLieuModel.setStatus(id, 'Xuất bản');
        return res.json({
          success: true,
          message: `Da xuat ban lai hoc lieu "${hocLieu.TenHocLieu}".`,
          data: result
        });
      }
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API TCPP.01: Cay lo trinh hoc tap logic (Co khi, Mach dien, Lap trinh)
   */
  static async apiGetTree(req, res) {
    try {
      const tree = await HocLieuModel.getTreeCurriculum();
      res.json({ success: true, data: tree });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API TCPP.02: Tra cuu linh kien Pinout & Bat loi code tu dong
   */
  static async apiLookup(req, res) {
    try {
      const keyword = req.query.q || req.query.keyword || '';
      const result = await HocLieuModel.lookupComponentAndErrors(keyword);
      res.json({ success: true, data: result });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  /**
   * API DF-05: Danh sach cac hoc lieu ty le loi > 30% can bo sung huong dan
   */
  static async apiGetWarnings(req, res) {
    try {
      const warnings = await HocLieuModel.getWarningHocLieuDF05();
      res.json({ success: true, count: warnings.length, data: warnings });
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = HocLieuController;
