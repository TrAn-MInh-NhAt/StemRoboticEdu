const { connectDB, sql } = require('./config/db');

async function migrate() {
  const pool = await connectDB();
  console.log('--- BẮT ĐẦU MIGRATION HỆ THỐNG LỚP HỌC & THƯ VIỆN HỌC LIỆU ---');

  // 1. Tạo bảng LopHoc nếu chưa có
  await pool.request().query(`
    IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LopHoc')
    BEGIN
      CREATE TABLE LopHoc (
        MaLop INT IDENTITY(1,1) PRIMARY KEY,
        TenLop NVARCHAR(50) NOT NULL UNIQUE,
        KhoiLop INT NOT NULL DEFAULT 10,
        NienKhoa NVARCHAR(20) NOT NULL DEFAULT '2025-2026',
        MaGiaoVienCN INT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
        MoTa NVARCHAR(255) NULL,
        NgayTao DATETIME DEFAULT CURRENT_TIMESTAMP
      );
      PRINT 'Created table LopHoc';
    END
  `);

  // 2. Thêm cột vào NguoiDung (Lop, TruongHoc, AnhTheHocSinh, TrangThaiXacThucThe, MaDinhDanhHS)
  await pool.request().query(`
    IF COL_LENGTH('NguoiDung', 'Lop') IS NULL
      ALTER TABLE NguoiDung ADD Lop NVARCHAR(50) NULL DEFAULT N'10/1';
    IF COL_LENGTH('NguoiDung', 'TruongHoc') IS NULL
      ALTER TABLE NguoiDung ADD TruongHoc NVARCHAR(100) NULL DEFAULT N'THPT Chuyên STEM';
    IF COL_LENGTH('NguoiDung', 'AnhTheHocSinh') IS NULL
      ALTER TABLE NguoiDung ADD AnhTheHocSinh VARCHAR(255) NULL;
    IF COL_LENGTH('NguoiDung', 'TrangThaiXacThucThe') IS NULL
      ALTER TABLE NguoiDung ADD TrangThaiXacThucThe NVARCHAR(50) NULL DEFAULT N'Đã xác thực';
    IF COL_LENGTH('NguoiDung', 'MaDinhDanhHS') IS NULL
      ALTER TABLE NguoiDung ADD MaDinhDanhHS VARCHAR(50) NULL;
  `);
  console.log('✓ Đã cập nhật cấu trúc bảng NguoiDung với trường Lớp & Thẻ học sinh.');

  // 3. Thêm cột MaDuAn, VideoUrl vào HocLieu nếu chưa có
  await pool.request().query(`
    IF COL_LENGTH('HocLieu', 'MaDuAn') IS NULL
      ALTER TABLE HocLieu ADD MaDuAn INT NULL FOREIGN KEY REFERENCES DuAnBaiTap(MaDuAn);
    IF COL_LENGTH('HocLieu', 'VideoUrl') IS NULL
      ALTER TABLE HocLieu ADD VideoUrl VARCHAR(255) NULL;
    IF COL_LENGTH('HocLieu', 'CodeMau') IS NULL
      ALTER TABLE HocLieu ADD CodeMau NVARCHAR(MAX) NULL;
  `);
  console.log('✓ Đã liên kết HocLieu trực tiếp với MaDuAn và hỗ trợ Video Youtube / Code mẫu.');

  // 4. Seed Lớp 10/1 và gán Thầy Đặng Hùng Vĩ làm GVCN
  const gvRes = await pool.request().query("SELECT MaNguoiDung FROM NguoiDung WHERE Email = 'gv.hungvi@stemrobotic.edu.vn'");
  const gvId = gvRes.recordset.length > 0 ? gvRes.recordset[0].MaNguoiDung : 2;

  await pool.request()
    .input('gvId', sql.Int, gvId)
    .query(`
      IF NOT EXISTS (SELECT * FROM LopHoc WHERE TenLop = N'10/1')
      BEGIN
        INSERT INTO LopHoc (TenLop, KhoiLop, NienKhoa, MaGiaoVienCN, MoTa)
        VALUES (N'10/1', 10, '2025-2026', @gvId, N'Lớp Chuyên Kỹ Thuật Robotics & Tự Động Hóa 10/1');
      END
      ELSE
      BEGIN
        UPDATE LopHoc SET MaGiaoVienCN = @gvId, MoTa = N'Lớp Chuyên Kỹ Thuật Robotics & Tự Động Hóa 10/1' WHERE TenLop = N'10/1';
      END
    `);
  console.log('✓ Đã khởi tạo Lớp 10/1 và phân công TS. Đặng Hùng Vĩ làm Giáo viên chủ nhiệm.');

  // 5. Cập nhật tất cả 5 học sinh về Lớp 10/1
  await pool.request().query(`
    UPDATE NguoiDung SET 
      Lop = N'10/1',
      TruongHoc = N'THPT Chuyên STEM',
      TrangThaiXacThucThe = N'Đã xác thực',
      MaDinhDanhHS = 'HS10-01-001',
      AnhTheHocSinh = '/images/cards/student_card_minhnhat.png'
    WHERE Email = 'hs.minhnhat@stemrobotic.edu.vn';

    UPDATE NguoiDung SET 
      Lop = N'10/1',
      TruongHoc = N'THPT Chuyên STEM',
      TrangThaiXacThucThe = N'Đã xác thực',
      MaDinhDanhHS = 'HS10-01-002',
      AnhTheHocSinh = '/images/cards/student_card_kyhai.png'
    WHERE Email = 'hs.kyhai@stemrobotic.edu.vn';

    UPDATE NguoiDung SET 
      Lop = N'10/1',
      TruongHoc = N'THPT Chuyên STEM',
      TrangThaiXacThucThe = N'Đã xác thực',
      MaDinhDanhHS = 'HS10-01-003',
      AnhTheHocSinh = '/images/cards/student_card_havy.png'
    WHERE Email = 'hs.havy@stemrobotic.edu.vn';

    UPDATE NguoiDung SET 
      Lop = N'10/1',
      TruongHoc = N'THPT Chuyên STEM',
      TrangThaiXacThucThe = N'Đã xác thực',
      MaDinhDanhHS = 'HS10-01-004',
      AnhTheHocSinh = '/images/cards/student_card_thequan.png'
    WHERE Email = 'hs.thequan@stemrobotic.edu.vn';

    UPDATE NguoiDung SET 
      Lop = N'10/1',
      TruongHoc = N'THPT Chuyên STEM',
      TrangThaiXacThucThe = N'Đã xác thực',
      MaDinhDanhHS = 'HS10-01-005',
      AnhTheHocSinh = '/images/cards/student_card_thanhthao.png'
    WHERE Email = 'hs.thanhthao@stemrobotic.edu.vn';
  `);
  console.log('✓ Đã cập nhật 5 học sinh vào danh sách Lớp 10/1.');

  // 6. Gán MaDuAn chính xác cho từng học liệu để học sinh tra cứu đúng trọng tâm bài tập
  // Dự án 1: Blink SOS
  await pool.request().query(`
    UPDATE HocLieu SET MaDuAn = 1, VideoUrl = 'https://www.youtube-nocookie.com/embed/fJWR73zp1Pc'
    WHERE TenHocLieu LIKE N'%Morse SOS%' OR TenHocLieu LIKE N'%Arduino Uno R3 – Pinout%';

    -- Dự án 2: Siêu âm HC-SR04
    UPDATE HocLieu SET MaDuAn = 11, VideoUrl = 'https://www.youtube-nocookie.com/embed/ZejQOX69K5M'
    WHERE TenHocLieu LIKE N'%HC-SR04%';

    -- Dự án 3: Cầu H L298N
    UPDATE HocLieu SET MaDuAn = 13, VideoUrl = 'https://www.youtube-nocookie.com/embed/dyjo_ggnkVU'
    WHERE TenHocLieu LIKE N'%L298N%';

    -- Dự án 4: Cân bằng MPU6050 & PID
    UPDATE HocLieu SET MaDuAn = 12, VideoUrl = 'https://www.youtube-nocookie.com/embed/4BoIE8YLSQE'
    WHERE TenHocLieu LIKE N'%PID%' OR TenHocLieu LIKE N'%MPU6050%';

    -- Dự án 5: Xe 2 bánh AI
    UPDATE HocLieu SET MaDuAn = 3, VideoUrl = 'https://www.youtube-nocookie.com/embed/wqn3IT0T65g'
    WHERE TenHocLieu LIKE N'%OpenCV%' OR TenHocLieu LIKE N'%ESP32%';
  `);
  console.log('✓ Đã gán MaDuAn & Video YouTube trực quan cho từng bài học.');

  console.log('--- HOÀN TẤT MIGRATION THÀNH CÔNG ---');
  process.exit(0);
}

migrate().catch(e => { console.error('Migration error:', e); process.exit(1); });
