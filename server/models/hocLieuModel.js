'use strict';
/**
 * hocLieuModel.js - Model truy vấn CSDL cho Phân hệ 2 (StemRoboticDB_V2)
 * Tác giả: Phạm Thị Hà Vy (feature/vy-hoclieu-morong)
 * Bảng sử dụng: HocLieu, KhoaHocLoTrinh, DuAnBaiTap, TestCase, NguoiDung
 * Tuân thủ 100% database_schema.sql: sử dụng chuỗi tiếng Việt CÓ DẤU với tiền tố N'...'
 */

const { getPool, sql } = require('../config/db');

class HocLieuModel {
  /**
   * Lấy danh sách tất cả lộ trình học
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
   * Lấy danh sách học liệu có bộ lọc (Chủ đề, Loại học liệu, Trạng thái, Cờ cảnh báo DF-05)
   * Chuẩn hóa tiếng Việt có dấu khớp database_schema.sql
   */
  static async getAllHocLieu(filters = {}) {
    const pool = getPool();
    const request = pool.request();
    let whereClauses = [];

    if (filters.chuDe) {
      request.input('chuDe', sql.NVarChar(100), filters.chuDe);
      whereClauses.push(`(
        lt.ChuDe = @chuDe 
        OR (lt.ChuDe = N'Co khi' AND @chuDe = N'Cơ khí')
        OR (lt.ChuDe = N'Mach dien' AND @chuDe = N'Mạch điện')
        OR (lt.ChuDe = N'Lap trinh' AND @chuDe = N'Lập trình')
      )`);
    }

    if (filters.loaiHocLieu) {
      request.input('loaiHocLieu', sql.NVarChar(50), filters.loaiHocLieu);
      whereClauses.push(`(
        hl.LoaiHocLieu = @loaiHocLieu
        OR (hl.LoaiHocLieu = N'Linh kien' AND @loaiHocLieu = N'Linh kiện')
        OR (hl.LoaiHocLieu = N'Code mau' AND @loaiHocLieu = N'Code mẫu')
        OR (hl.LoaiHocLieu = N'Tai lieu' AND @loaiHocLieu = N'Tài liệu')
        OR (hl.LoaiHocLieu = N'So do 3D' AND @loaiHocLieu = N'Sơ đồ lắp ráp')
        OR (hl.LoaiHocLieu = N'Meo sua loi' AND @loaiHocLieu = N'Mẹo sửa lỗi')
      )`);
    }

    if (filters.trangThai) {
      request.input('trangThai', sql.NVarChar(30), filters.trangThai);
      whereClauses.push(`(
        hl.TrangThai = @trangThai
        OR (hl.TrangThai = N'Xuat ban' AND @trangThai = N'Xuất bản')
        OR (hl.TrangThai = N'Ban nhap' AND @trangThai = N'Bản nháp')
        OR (hl.TrangThai = N'An' AND @trangThai = N'Ẩn')
      )`);
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
   * Lấy chi tiết 1 học liệu theo MaHocLieu
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
   * QTHL.01: Thêm mới bài giảng & code mẫu
   * Chuẩn hóa giá trị mặc định có dấu: N'Bản nháp', N'Tài liệu'
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

    // Chuẩn hóa loại học liệu có dấu
    let loaiHocLieu = data.loaiHocLieu || 'Tài liệu';
    if (loaiHocLieu === 'Linh kien') loaiHocLieu = 'Linh kiện';
    if (loaiHocLieu === 'Code mau') loaiHocLieu = 'Code mẫu';
    if (loaiHocLieu === 'Tai lieu') loaiHocLieu = 'Tài liệu';
    if (loaiHocLieu === 'So do 3D') loaiHocLieu = 'Sơ đồ lắp ráp';
    if (loaiHocLieu === 'Meo sua loi') loaiHocLieu = 'Mẹo sửa lỗi';

    // Chuẩn hóa trạng thái có dấu
    let trangThai = data.trangThai || 'Bản nháp';
    if (trangThai === 'Ban nhap') trangThai = 'Bản nháp';
    if (trangThai === 'Xuat ban') trangThai = 'Xuất bản';
    if (trangThai === 'An') trangThai = 'Ẩn';

    const result = await pool.request()
      .input('maNguoiDung', sql.Int, data.maNguoiDung || 2)
      .input('maLoTrinh', sql.Int, data.maLoTrinh || null)
      .input('tenHocLieu', sql.NVarChar(200), data.tenHocLieu)
      .input('loaiHocLieu', sql.NVarChar(50), loaiHocLieu)
      .input('noiDung', sql.NVarChar(sql.MAX), data.noiDung || '')
      .input('duongDanTep', sql.VarChar(255), data.duongDanTep || null)
      .input('coCanCapNhat', sql.Bit, data.coCanCapNhat ? 1 : 0)
      .input('trangThai', sql.NVarChar(30), trangThai)
      .query(query);

    return result.recordset[0];
  }

  /**
   * QTHL.02 & DF-05: Cập nhật học liệu
   * Nếu học liệu đang có CoCanCapNhat = 1, khi GV sửa nội dung sẽ tự động tắt cờ CoCanCapNhat = 0
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

    // Chuẩn hóa loại học liệu có dấu nếu có truyền vào
    let loaiHocLieu = data.loaiHocLieu || null;
    if (loaiHocLieu === 'Linh kien') loaiHocLieu = 'Linh kiện';
    if (loaiHocLieu === 'Code mau') loaiHocLieu = 'Code mẫu';
    if (loaiHocLieu === 'Tai lieu') loaiHocLieu = 'Tài liệu';
    if (loaiHocLieu === 'So do 3D') loaiHocLieu = 'Sơ đồ lắp ráp';
    if (loaiHocLieu === 'Meo sua loi') loaiHocLieu = 'Mẹo sửa lỗi';

    // Chuẩn hóa trạng thái có dấu nếu có truyền vào
    let trangThai = data.trangThai || null;
    if (trangThai === 'Ban nhap') trangThai = 'Bản nháp';
    if (trangThai === 'Xuat ban') trangThai = 'Xuất bản';
    if (trangThai === 'An') trangThai = 'Ẩn';

    // Mặc định tự động tắt cờ DF-05 về 0 khi giáo viên cập nhật bài học
    const coCanCapNhatVal = data.coCanCapNhat !== undefined ? (data.coCanCapNhat ? 1 : 0) : 0;

    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('tenHocLieu', sql.NVarChar(200), data.tenHocLieu || null)
      .input('loaiHocLieu', sql.NVarChar(50), loaiHocLieu)
      .input('noiDung', sql.NVarChar(sql.MAX), data.noiDung !== undefined ? data.noiDung : null)
      .input('duongDanTep', sql.VarChar(255), data.duongDanTep !== undefined ? data.duongDanTep : null)
      .input('maLoTrinh', sql.Int, data.maLoTrinh || null)
      .input('trangThai', sql.NVarChar(30), trangThai)
      .input('coCanCapNhat', sql.Bit, coCanCapNhatVal)
      .query(query);

    return result.recordset[0] || null;
  }

  /**
   * QTHL.02: Kiểm tra ràng buộc liền mạch trước khi ẩn học liệu
   * Sử dụng chuỗi trạng thái có dấu: N'Đang mở', N'Đang thi' khớp database_schema.sql
   */
  static async checkActiveReferences(id) {
    const pool = getPool();
    const hocLieu = await this.getHocLieuById(id);
    if (!hocLieu) {
      return { exists: false, canHide: false, reason: 'Học liệu không tồn tại' };
    }

    if (!hocLieu.MaLoTrinh) {
      return { exists: true, canHide: true, activeExercises: [], activeExams: [] };
    }

    // 1. Kiểm tra DuAnBaiTap đang mở thuộc lộ trình này (TrangThai = N'Đang mở')
    const queryBaiTap = `
      SELECT MaDuAn, TenDuAn, HanNop, TrangThai
      FROM DuAnBaiTap
      WHERE MaLoTrinh = @maLoTrinh
        AND (TrangThai IN (N'Đang mở', N'Dang mo') OR HanNop >= GETDATE())
    `;
    const resBaiTap = await pool.request()
      .input('maLoTrinh', sql.Int, hocLieu.MaLoTrinh)
      .query(queryBaiTap);

    // 2. Kiểm tra BaiThi đang diễn ra (chưa kết thúc)
    const queryBaiThi = `
      SELECT MaBaiThi, TenBaiThi, ThoiGianKetThuc, TrangThai
      FROM BaiThi
      WHERE ThoiGianKetThuc >= GETDATE()
        AND TrangThai IN (N'Đang mở', N'Đang thi', N'Dang mo', N'Dang thi')
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
        : `Học liệu đang thuộc Lộ trình "${hocLieu.TenLoTrinh}" có ${activeExercises.length} bài tập đang mở.`
    };
  }

  /**
   * QTHL.02: Chuyển trạng thái học liệu sang N'Ẩn' / N'Xuất bản'
   */
  static async setStatus(id, trangThai) {
    const pool = getPool();

    // Chuẩn hóa trạng thái có dấu
    let normalizedStatus = trangThai;
    if (trangThai === 'An' || trangThai === 'Ẩn') normalizedStatus = 'Ẩn';
    else if (trangThai === 'Xuat ban' || trangThai === 'Xuất bản') normalizedStatus = 'Xuất bản';
    else if (trangThai === 'Ban nhap' || trangThai === 'Bản nháp') normalizedStatus = 'Bản nháp';

    const query = `
      UPDATE HocLieu
      SET TrangThai = @trangThai
      OUTPUT INSERTED.*
      WHERE MaHocLieu = @id
    `;
    const result = await pool.request()
      .input('id', sql.Int, id)
      .input('trangThai', sql.NVarChar(30), normalizedStatus)
      .query(query);
    return result.recordset[0] || null;
  }

  /**
   * TCPP.01: Hiển thị danh mục & Cây lộ trình học
   * Lọc trạng thái lộ trình N'Đang hoạt động', trạng thái học liệu N'Xuất bản'
   * Gom nhóm theo 3 chủ đề tiếng Việt có dấu: N'Cơ khí', N'Mạch điện', N'Lập trình'
   */
  static async getTreeCurriculum() {
    const pool = getPool();

    // 1. Lấy danh sách lộ trình đang hoạt động
    const queryLoTrinh = `
      SELECT 
        MaLoTrinh, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa
      FROM KhoaHocLoTrinh
      WHERE TrangThai IN (N'Đang hoạt động', N'Dang hoat dong')
      ORDER BY ThuTuHoc ASC, MaLoTrinh ASC
    `;
    const loTrinhList = (await pool.request().query(queryLoTrinh)).recordset;

    // 2. Lấy học liệu đã xuất bản
    const queryHocLieu = `
      SELECT 
        MaHocLieu, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai
      FROM HocLieu
      WHERE TrangThai IN (N'Xuất bản', N'Xuat ban')
      ORDER BY MaHocLieu ASC
    `;
    const hocLieuList = (await pool.request().query(queryHocLieu)).recordset;

    // 3. Gom nhóm theo 3 chủ đề tiếng Việt CÓ DẤU: Cơ khí, Mạch điện, Lập trình
    const categories = {
      'Cơ khí': [],
      'Mạch điện': [],
      'Lập trình': []
    };

    loTrinhList.forEach(lt => {
      const items = hocLieuList.filter(hl => hl.MaLoTrinh === lt.MaLoTrinh);
      const node = {
        ...lt,
        items
      };
      const chuDe = (lt.ChuDe || '').trim();
      if (chuDe === 'Cơ khí' || chuDe === 'Co khi') {
        categories['Cơ khí'].push(node);
      } else if (chuDe === 'Mạch điện' || chuDe === 'Mach dien') {
        categories['Mạch điện'].push(node);
      } else {
        categories['Lập trình'].push(node);
      }
    });

    return categories;
  }

  /**
   * TCPP.02: Tra cứu linh kiện Pinout & Bắt lỗi code tự động
   * Lọc trạng thái N'Xuất bản', ưu tiên phân loại N'Linh kiện'
   */
  static async lookupComponentAndErrors(keyword = '') {
    const pool = getPool();
    const kwParam = `%${keyword.trim()}%`;

    // 1. Tra cứu linh kiện / học liệu (TrangThai = N'Xuất bản', ưu tiên LoaiHocLieu = N'Linh kiện')
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
      WHERE hl.TrangThai IN (N'Xuất bản', N'Xuat ban')
        AND (
          hl.TenHocLieu LIKE @kwParam 
          OR hl.NoiDung LIKE @kwParam
          OR lt.ChuDe LIKE @kwParam
        )
      ORDER BY 
        CASE WHEN hl.LoaiHocLieu IN (N'Linh kiện', N'Linh kien') THEN 1 ELSE 2 END,
        hl.CoCanCapNhat DESC,
        hl.MaHocLieu ASC
    `;
    const resHocLieu = await pool.request()
      .input('kwParam', sql.NVarChar(200), kwParam)
      .query(queryHocLieu);

    // 2. Tra cứu mẹo sửa lỗi từ TestCase
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
   * DF-05: Danh sách các học liệu đang cần cập nhật do tỷ lệ lỗi > 30%
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
