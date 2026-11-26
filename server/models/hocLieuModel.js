'use strict';
/**
 * hocLieuModel.js - Model truy van CSDL cho Phan he 2 (StemRoboticDB_V2)
 * Tac gia: Pham Thi Ha Vy (feature/vy-hoclieu-morong)
 * Bang su dung: HocLieu, KhoaHocLoTrinh, DuAnBaiTap, TestCase, NguoiDung
 * Tuan thu: database_schema.sql (khong dung cot ngoai schema)
 */

const { getPool, sql } = require('../config/db');

class HocLieuModel {
  /**
   * Lay danh sach tat ca lo trinh hoc
   */
  static async getAllLoTrinh() {
    const pool = getPool();
    const query = `
      SELECT 
        MaLoTrinh,
        TenLoTrinh,
        ChuDe,
        CapDo,
        ThuTuHoc,
        MoTa,
        TrangThai
      FROM KhoaHocLoTrinh
      ORDER BY ThuTuHoc ASC, MaLoTrinh ASC
    `;
    const result = await pool.request().query(query);
    return result.recordset;
  }

  /**
   * Lay danh sach hoc lieu co bo loc (Chu de, Loai hoc lieu, Trang thai, Co canh bao DF-05)
   */
  static async getAllHocLieu(filters = {}) {
    const pool = getPool();
    const request = pool.request();
    let whereClauses = [];

    if (filters.chuDe) {
      request.input('chuDe', sql.NVarChar(100), filters.chuDe);
      whereClauses.push('lt.ChuDe = @chuDe');
    }

    if (filters.loaiHocLieu) {
      request.input('loaiHocLieu', sql.NVarChar(50), filters.loaiHocLieu);
      whereClauses.push('hl.LoaiHocLieu = @loaiHocLieu');
    }

    if (filters.trangThai) {
      request.input('trangThai', sql.NVarChar(30), filters.trangThai);
      whereClauses.push('hl.TrangThai = @trangThai');
    }

    if (filters.coCanCapNhat !== undefined && filters.coCanCapNhat !== null) {
      request.input('coCanCapNhat', sql.Bit, filters.coCanCapNhat ? 1 : 0);
      whereClauses.push('hl.CoCanCapNhat = @coCanCapNhat');
    }

    if (filters.keyword) {
      request.input('keyword', sql.NVarChar(200), `%${filters.keyword.trim()}%`);
      whereClauses.push('(hl.TenHocLieu LIKE @keyword OR hl.NoiDung LIKE @keyword)');
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

    const query = `
      SELECT 
        hl.MaHocLieu,
        hl.MaNguoiDung,
        hl.MaLoTrinh,
        hl.TenHocLieu,
        hl.LoaiHocLieu,
        hl.NoiDung,
        hl.DuongDanTep,
        hl.CoCanCapNhat,
        hl.TrangThai,
        hl.NgayTao,
        lt.TenLoTrinh,
        lt.ChuDe,
        lt.CapDo AS CapDoLoTrinh,
        nd.HoTen AS TenGiaoVien
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN NguoiDung nd ON hl.MaNguoiDung = nd.MaNguoiDung
      ${whereSql}
      ORDER BY hl.CoCanCapNhat DESC, hl.NgayTao DESC
    `;

    const result = await request.query(query);
    return result.recordset;
  }

  /**
   * Lay chi tiet 1 hoc lieu theo MaHocLieu
   */
  static async getHocLieuById(id) {
    const pool = getPool();
    const query = `
      SELECT 
        hl.MaHocLieu,
        hl.MaNguoiDung,
        hl.MaLoTrinh,
        hl.TenHocLieu,
        hl.LoaiHocLieu,
        hl.NoiDung,
        hl.DuongDanTep,
        hl.CoCanCapNhat,
        hl.TrangThai,
        hl.NgayTao,
        lt.TenLoTrinh,
        lt.ChuDe,
        lt.CapDo AS CapDoLoTrinh,
        nd.HoTen AS TenGiaoVien
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN NguoiDung nd ON hl.MaNguoiDung = nd.MaNguoiDung
      WHERE hl.MaHocLieu = @id
    `;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(query);
    return result.recordset[0] || null;
  }

  /**
   * QTHL.01: Them moi bai giang & code mau
   */
  static async createHocLieu(data) {
    const pool = getPool();
    const query = `
      INSERT INTO HocLieu 
        (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai)
      OUTPUT INSERTED.*
      VALUES 
        (@maNguoiDung, @maLoTrinh, @tenHocLieu, @loaiHocLieu, @noiDung, @duongDanTep, @coCanCapNhat, @trangThai)
    `;

    const result = await pool.request()
      .input('maNguoiDung', sql.Int, data.maNguoiDung || 2)
      .input('maLoTrinh', sql.Int, data.maLoTrinh || null)
      .input('tenHocLieu', sql.NVarChar(200), data.tenHocLieu)
      .input('loaiHocLieu', sql.NVarChar(50), data.loaiHocLieu || 'Tai lieu')
      .input('noiDung', sql.NVarChar(sql.MAX), data.noiDung || '')
      .input('duongDanTep', sql.VarChar(255), data.duongDanTep || null)
      .input('coCanCapNhat', sql.Bit, data.coCanCapNhat ? 1 : 0)
      .input('trangThai', sql.NVarChar(30), data.trangThai || 'Ban nhap')
      .query(query);

    return result.recordset[0];
  }

  /**
   * QTHL.02 & DF-05: Cap nhat hoc lieu
   * Neu hoc lieu dang co CoCanCapNhat = 1, khi GV sua noi dung se tu dong tat co CoCanCapNhat = 0
   */
  static async updateHocLieu(id, data) {
    const pool = getPool();
    const query = `
      UPDATE HocLieu
      SET 
        TenHocLieu = COALESCE(@tenHocLieu, TenHocLieu),
        LoaiHocLieu = COALESCE(@loaiHocLieu, LoaiHocLieu),
        NoiDung = COALESCE(@noiDung, NoiDung),
        DuongDanTep = COALESCE(@duongDanTep, DuongDanTep),
        MaLoTrinh = COALESCE(@maLoTrinh, MaLoTrinh),
        TrangThai = COALESCE(@trangThai, TrangThai),
        CoCanCapNhat = @coCanCapNhat
      OUTPUT INSERTED.*
      WHERE MaHocLieu = @id
    `;

    // Mac dinh neu khong chi dinh co thi tu dong tat co DF-05 ve 0 khi sua
    const coCanCapNhatVal = data.coCanCapNhat !== undefined ? (data.coCanCapNhat ? 1 : 0) : 0;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('tenHocLieu', sql.NVarChar(200), data.tenHocLieu || null)
      .input('loaiHocLieu', sql.NVarChar(50), data.loaiHocLieu || null)
      .input('noiDung', sql.NVarChar(sql.MAX), data.noiDung !== undefined ? data.noiDung : null)
      .input('duongDanTep', sql.VarChar(255), data.duongDanTep !== undefined ? data.duongDanTep : null)
      .input('maLoTrinh', sql.Int, data.maLoTrinh || null)
      .input('trangThai', sql.NVarChar(30), data.trangThai || null)
      .input('coCanCapNhat', sql.Bit, coCanCapNhatVal)
      .query(query);

    return result.recordset[0] || null;
  }

  /**
   * QTHL.02: Kiem tra rang buoc lien mach truoc khi an hoc lieu
   * Neu hoc lieu nam trong LoTrinh co BaiTap hoac KyThi dang mo -> Khong cho an
   */
  static async checkActiveReferences(id) {
    const pool = getPool();
    const hocLieu = await this.getHocLieuById(id);
    if (!hocLieu) {
      return { exists: false, canHide: false, reason: 'Hoc lieu khong ton tai' };
    }

    if (!hocLieu.MaLoTrinh) {
      return { exists: true, canHide: true, activeExercises: [], activeExams: [] };
    }

    // 1. Kiem tra DuAnBaiTap dang mo thuoc lo trinh nay
    const queryBaiTap = `
      SELECT MaDuAn, TenDuAn, HanNop, TrangThai
      FROM DuAnBaiTap
      WHERE MaLoTrinh = @maLoTrinh
        AND (TrangThai = N'Dang mo' OR HanNop >= GETDATE())
    `;
    const resBaiTap = await pool.request()
      .input('maLoTrinh', sql.Int, hocLieu.MaLoTrinh)
      .query(queryBaiTap);

    // 2. Kiem tra BaiThi dang dien ra (chua ket thuc)
    const queryBaiThi = `
      SELECT MaBaiThi, TenBaiThi, ThoiGianKetThuc, TrangThai
      FROM BaiThi
      WHERE ThoiGianKetThuc >= GETDATE()
        AND TrangThai IN (N'Dang mo', N'Dang thi')
    `;
    const resBaiThi = await pool.request().query(queryBaiThi);

    const activeExercises = resBaiTap.recordset;
    const activeExams = resBaiThi.recordset;

    const canHide = activeExercises.length === 0;

    return {
      exists: true,
      canHide,
      hocLieu,
      activeExercises,
      activeExams,
      reason: canHide 
        ? null 
        : `Hoc lieu dang thuoc Lo trinh "${hocLieu.TenLoTrinh}" co ${activeExercises.length} bai tap dang mo.`
    };
  }

  /**
   * QTHL.02: Chuyen trang thai hoc lieu sang An / Xuat ban
   */
  static async setStatus(id, trangThai) {
    const pool = getPool();
    const query = `
      UPDATE HocLieu
      SET TrangThai = @trangThai
      OUTPUT INSERTED.*
      WHERE MaHocLieu = @id
    `;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('trangThai', sql.NVarChar(30), trangThai)
      .query(query);
    return result.recordset[0] || null;
  }

  /**
   * TCPP.01: Hien thi danh muc & Cay lo trinh hoc
   */
  static async getTreeCurriculum() {
    const pool = getPool();

    // 1. Lay danh sach lo trinh
    const queryLoTrinh = `
      SELECT 
        MaLoTrinh, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa
      FROM KhoaHocLoTrinh
      WHERE TrangThai = N'Dang hoat dong'
      ORDER BY ThuTuHoc ASC, MaLoTrinh ASC
    `;
    const loTrinhList = (await pool.request().query(queryLoTrinh)).recordset;

    // 2. Lay hoc lieu da xuat ban
    const queryHocLieu = `
      SELECT 
        MaHocLieu, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai
      FROM HocLieu
      WHERE TrangThai = N'Xuat ban'
      ORDER BY MaHocLieu ASC
    `;
    const hocLieuList = (await pool.request().query(queryHocLieu)).recordset;

    // 3. Gom nhom theo 3 chu de lon: Co khi, Mach dien, Lap trinh
    const categories = {
      'Co khi': [],
      'Mach dien': [],
      'Lap trinh': []
    };

    loTrinhList.forEach(lt => {
      const items = hocLieuList.filter(hl => hl.MaLoTrinh === lt.MaLoTrinh);
      const node = {
        ...lt,
        items
      };
      if (categories[lt.ChuDe]) {
        categories[lt.ChuDe].push(node);
      } else {
        categories['Lap trinh'].push(node);
      }
    });

    return categories;
  }

  /**
   * TCPP.02: Tra cuu linh kien Pinout & Bat loi code tu dong
   */
  static async lookupComponentAndErrors(keyword = '') {
    const pool = getPool();
    const kwParam = `%${keyword.trim()}%`;

    // 1. Tra cuu linh kien / hoc lieu
    const queryHocLieu = `
      SELECT 
        hl.MaHocLieu,
        hl.TenHocLieu,
        hl.LoaiHocLieu,
        hl.NoiDung,
        hl.DuongDanTep,
        hl.CoCanCapNhat,
        lt.TenLoTrinh,
        lt.ChuDe
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      WHERE hl.TrangThai = N'Xuat ban'
        AND (
          hl.TenHocLieu LIKE @kwParam 
          OR hl.NoiDung LIKE @kwParam
          OR lt.ChuDe LIKE @kwParam
        )
      ORDER BY 
        CASE WHEN hl.LoaiHocLieu = N'Linh kien' THEN 1 ELSE 2 END,
        hl.CoCanCapNhat DESC,
        hl.MaHocLieu ASC
    `;
    const resHocLieu = await pool.request()
      .input('kwParam', sql.NVarChar(200), kwParam)
      .query(queryHocLieu);

    // 2. Tra cuu meo sua loi tu TestCase
    const queryTestCase = `
      SELECT 
        tc.MaTestCase,
        tc.MaDuAn,
        tc.DuLieuDauVao,
        tc.KetQuaDauRa,
        tc.GoiYSuaLoi,
        da.TenDuAn
      FROM TestCase tc
      JOIN DuAnBaiTap da ON tc.MaDuAn = da.MaDuAn
      WHERE tc.GoiYSuaLoi LIKE @kwParam
         OR da.TenDuAn LIKE @kwParam
         OR tc.DuLieuDauVao LIKE @kwParam
      ORDER BY tc.MaTestCase ASC
    `;
    const resTestCase = await pool.request()
      .input('kwParam', sql.NVarChar(200), kwParam)
      .query(queryTestCase);

    return {
      keyword,
      componentsAndGuides: resHocLieu.recordset,
      codeFixTips: resTestCase.recordset
    };
  }

  /**
   * DF-05: Danh sach cac hoc lieu dang can cap nhat do ty le loi > 30%
   */
  static async getWarningHocLieuDF05() {
    const pool = getPool();
    const query = `
      SELECT 
        hl.MaHocLieu,
        hl.TenHocLieu,
        hl.LoaiHocLieu,
        hl.NoiDung,
        hl.CoCanCapNhat,
        hl.TrangThai,
        lt.TenLoTrinh,
        lt.ChuDe
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      WHERE hl.CoCanCapNhat = 1
      ORDER BY hl.MaHocLieu ASC
    `;
    const result = await pool.request().query(query);
    return result.recordset;
  }
}

module.exports = HocLieuModel;
