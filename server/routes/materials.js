const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// ==============================================================================
// 1. GET /api/materials/lookup - TCPP.02: Tra cứu linh kiện & Bắt lỗi code
// (Đặt trước route /:id để tránh trùng lặp param id)
// ==============================================================================
router.get('/lookup', async (req, res) => {
  const { q } = req.query;
  const keyword = q ? q.trim() : '';

  try {
    const pool = getPool();
    const kwParam = `%${keyword}%`;

    // 1. Tìm trong bảng HocLieu (ưu tiên Linh kiện, Bài giảng, Code mẫu)
    let materialQuery = `
      SELECT 
        hl.MaHocLieu,
        hl.TenHocLieu,
        hl.LoaiHocLieu,
        hl.NoiDung,
        hl.DuongDanTep,
        hl.CoCanCapNhat,
        hl.TrangThai,
        lt.TenLoTrinh,
        nd.HoTen AS TenTacGia
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN NguoiDung nd ON hl.MaNguoiDung = nd.MaNguoiDung
      WHERE hl.TrangThai <> N'Đã ẩn'
    `;

    if (keyword) {
      materialQuery += ` AND (hl.TenHocLieu LIKE @kw OR hl.NoiDung LIKE @kw OR hl.LoaiHocLieu LIKE @kw)`;
    }
    materialQuery += ` ORDER BY CASE WHEN hl.LoaiHocLieu = N'Linh kiện' THEN 1 ELSE 2 END, hl.MaHocLieu DESC`;

    const matReq = pool.request();
    if (keyword) matReq.input('kw', sql.NVarChar, kwParam);
    const matRes = await matReq.query(materialQuery);

    // 2. Tìm trong bảng TestCase (Tra cứu lỗi & Gợi ý sửa lỗi code)
    let tcQuery = `
      SELECT 
        tc.MaTestCase,
        tc.MaDuAn,
        tc.DuLieuDauVao,
        tc.KetQuaDauRa,
        tc.TrongSoDiem,
        tc.GoiYSuaLoi,
        da.TenDuAn,
        da.CapDo
      FROM TestCase tc
      JOIN DuAnBaiTap da ON tc.MaDuAn = da.MaDuAn
      WHERE tc.GoiYSuaLoi IS NOT NULL AND LEN(tc.GoiYSuaLoi) > 0
    `;

    if (keyword) {
      tcQuery += ` AND (tc.GoiYSuaLoi LIKE @kw OR da.TenDuAn LIKE @kw OR tc.DuLieuDauVao LIKE @kw OR tc.KetQuaDauRa LIKE @kw)`;
    }
    tcQuery += ` ORDER BY tc.MaTestCase DESC`;

    const tcReq = pool.request();
    if (keyword) tcReq.input('kw', sql.NVarChar, kwParam);
    const tcRes = await tcReq.query(tcQuery);

    return res.json({
      success: true,
      keyword,
      materials: matRes.recordset,
      errorGuides: tcRes.recordset
    });

  } catch (err) {
    console.error('Lỗi tra cứu linh kiện và sửa lỗi (TCPP.02):', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tra cứu: ' + err.message });
  }
});

// ==============================================================================
// 2. GET /api/materials - Lấy toàn bộ danh sách học liệu cho Giáo viên & Admin
// ==============================================================================
router.get('/', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
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
        FORMAT(hl.NgayTao, 'dd/MM/yyyy HH:mm') AS NgayTao,
        lt.TenLoTrinh,
        nd.HoTen AS TenGiaoVien
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN NguoiDung nd ON hl.MaNguoiDung = nd.MaNguoiDung
      ORDER BY hl.MaHocLieu DESC
    `);

    return res.json({ success: true, materials: result.recordset });
  } catch (err) {
    console.error('Lỗi lấy danh sách học liệu:', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 3. GET /api/materials/:id - Lấy chi tiết 1 học liệu để chỉnh sửa
// ==============================================================================
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`
        SELECT hl.*, lt.TenLoTrinh 
        FROM HocLieu hl
        LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
        WHERE hl.MaHocLieu = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học liệu' });
    }

    return res.json({ success: true, material: result.recordset[0] });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// ==============================================================================
// 4. POST /api/materials - QTHL.01: Thêm mới bài giảng & học liệu
// ==============================================================================
router.post('/', async (req, res) => {
  const { tenHocLieu, loaiHocLieu, noiDung, duongDanTep, maLoTrinh, trangThai } = req.body;
  const userId = req.session && req.session.user ? req.session.user.MaNguoiDung : 2; // TS. Đặng Hùng Vĩ

  if (!tenHocLieu || !tenHocLieu.trim()) {
    return res.status(400).json({ success: false, message: 'Tên học liệu không được để trống' });
  }

  if (!loaiHocLieu) {
    return res.status(400).json({ success: false, message: 'Vui lòng chọn loại học liệu' });
  }

  const cleanNoiDung = noiDung && noiDung.trim() ? noiDung.trim() : null;
  const cleanDuongDanTep = duongDanTep && duongDanTep.trim() ? duongDanTep.trim() : null;
  const parsedLoTrinh = (maLoTrinh && !isNaN(parseInt(maLoTrinh))) ? parseInt(maLoTrinh) : null;
  const cleanTrangThai = trangThai && trangThai.trim() ? trangThai.trim() : 'Xuất bản';

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('userId', sql.Int, userId)
      .input('maLoTrinh', sql.Int, parsedLoTrinh)
      .input('tenHocLieu', sql.NVarChar, tenHocLieu.trim())
      .input('loaiHocLieu', sql.NVarChar, loaiHocLieu)
      .input('noiDung', sql.NVarChar, cleanNoiDung)
      .input('duongDanTep', sql.VarChar, cleanDuongDanTep)
      .input('trangThai', sql.NVarChar, cleanTrangThai)
      .query(`
        INSERT INTO HocLieu (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai)
        OUTPUT INSERTED.MaHocLieu
        VALUES (@userId, @maLoTrinh, @tenHocLieu, @loaiHocLieu, @noiDung, @duongDanTep, 0, @trangThai)
      `);

    const newId = result.recordset[0].MaHocLieu;
    return res.json({
      success: true,
      message: 'Đã thêm học liệu mới thành công vào hệ thống!',
      maHocLieu: newId
    });

  } catch (err) {
    console.error('Lỗi thêm học liệu (QTHL.01):', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thêm học liệu: ' + err.message });
  }
});

// ==============================================================================
// 5. PUT /api/materials/:id - QTHL.02: Chỉnh sửa học liệu & TỰ ĐỘNG TẮT CỜ DF-05
// ==============================================================================
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { tenHocLieu, loaiHocLieu, noiDung, duongDanTep, maLoTrinh, trangThai } = req.body;

  if (!tenHocLieu || !tenHocLieu.trim()) {
    return res.status(400).json({ success: false, message: 'Tên học liệu không được để trống' });
  }

  const cleanNoiDung = noiDung && noiDung.trim() ? noiDung.trim() : null;
  const cleanDuongDanTep = duongDanTep && duongDanTep.trim() ? duongDanTep.trim() : null;
  const parsedLoTrinh = (maLoTrinh && !isNaN(parseInt(maLoTrinh))) ? parseInt(maLoTrinh) : null;
  const cleanTrangThai = trangThai && trangThai.trim() ? trangThai.trim() : 'Xuất bản';

  try {
    const pool = getPool();
    // Cập nhật thông tin học liệu VÀ TỰ ĐỘNG TẮT CỜ CoCanCapNhat = 0 (DF-05 đã khắc phục)
    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('maLoTrinh', sql.Int, parsedLoTrinh)
      .input('tenHocLieu', sql.NVarChar, tenHocLieu.trim())
      .input('loaiHocLieu', sql.NVarChar, loaiHocLieu || 'Bài giảng')
      .input('noiDung', sql.NVarChar, cleanNoiDung)
      .input('duongDanTep', sql.VarChar, cleanDuongDanTep)
      .input('trangThai', sql.NVarChar, cleanTrangThai)
      .query(`
        UPDATE HocLieu
        SET TenHocLieu = @tenHocLieu,
            LoaiHocLieu = @loaiHocLieu,
            NoiDung = @noiDung,
            DuongDanTep = @duongDanTep,
            MaLoTrinh = @maLoTrinh,
            TrangThai = @trangThai,
            CoCanCapNhat = 0
        WHERE MaHocLieu = @id
      `);

    return res.json({
      success: true,
      message: 'Cập nhật học liệu thành công! Cờ cảnh báo chất lượng giảng dạy (DF-05) đã được giải tỏa.'
    });

  } catch (err) {
    console.error('Lỗi cập nhật học liệu (QTHL.02):', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi sửa học liệu: ' + err.message });
  }
});

// ==============================================================================
// 6. QTHL.02: Ẩn / Hiện học liệu (Hỗ trợ PATCH /:id/toggle & POST /:id/toggle-status)
// Kèm cơ chế cảnh báo khi lộ trình đang có bài thi hoặc dự án mở
// ==============================================================================
async function handleToggleMaterialStatus(req, res) {
  const { id } = req.params;
  const { force } = req.body || {};

  try {
    const pool = getPool();
    const hlRes = await pool.request()
      .input('id', sql.Int, parseInt(id))
      .query(`SELECT MaHocLieu, TenHocLieu, MaLoTrinh, TrangThai FROM HocLieu WHERE MaHocLieu = @id`);

    if (hlRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy học liệu' });
    }

    const hl = hlRes.recordset[0];
    const isCurrentlyHidden = (hl.TrangThai === 'Đã ẩn');
    const targetStatus = isCurrentlyHidden ? 'Xuất bản' : 'Đã ẩn';

    // Nếu chuẩn bị Ẩn học liệu: Kiểm tra xem lộ trình có Dự án hoặc Bài thi đang hoạt động không
    if (!isCurrentlyHidden && !force && hl.MaLoTrinh) {
      const activeProjRes = await pool.request()
        .input('maLoTrinh', sql.Int, hl.MaLoTrinh)
        .query(`
          SELECT COUNT(*) as ActiveProjects 
          FROM DuAnBaiTap 
          WHERE MaLoTrinh = @maLoTrinh AND TrangThai IN (N'Đang mở', N'Đang diễn ra', N'Đang hoạt động')
        `);

      const activeProjectsCount = activeProjRes.recordset[0].ActiveProjects || 0;

      if (activeProjectsCount > 0) {
        return res.json({
          success: false,
          requireConfirmation: true,
          activeProjectsCount,
          message: `Lộ trình này hiện có ${activeProjectsCount} dự án đang mở cho học sinh nộp bài. Việc ẩn học liệu có thể ảnh hưởng đến kết quả làm bài của học sinh. Bạn có chắc chắn muốn ẩn học liệu này không?`
        });
      }
    }

    // Thực hiện đổi trạng thái
    await pool.request()
      .input('id', sql.Int, parseInt(id))
      .input('newStatus', sql.NVarChar, targetStatus)
      .query(`UPDATE HocLieu SET TrangThai = @newStatus WHERE MaHocLieu = @id`);

    return res.json({
      success: true,
      newStatus: targetStatus,
      message: `Đã chuyển trạng thái học liệu sang "${targetStatus}" thành công!`
    });

  } catch (err) {
    console.error('Lỗi chuyển trạng thái học liệu (QTHL.02):', err.message);
    return res.status(500).json({ success: false, message: err.message });
  }
}

router.patch('/:id/toggle', handleToggleMaterialStatus);
router.post('/:id/toggle', handleToggleMaterialStatus);
router.post('/:id/toggle-status', handleToggleMaterialStatus);

module.exports = router;
