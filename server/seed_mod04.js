const { connectDB, sql } = require('./config/db');

async function seed() {
  const pool = await connectDB();
  console.log('Đã kết nối CSDL, bắt đầu seed dữ liệu MOD-03 & MOD-04...');

  // 1. Thêm 2 Lộ trình học (KhoaHocLoTrinh)
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM KhoaHocLoTrinh WHERE TenLoTrinh = N'Lập trình Arduino cơ bản')
    BEGIN
        INSERT INTO KhoaHocLoTrinh (MaNguoiTao, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa, TrangThai)
        VALUES (2, N'Lập trình Arduino cơ bản', N'Lập trình', N'Cơ bản', 1, 
                N'Lộ trình làm quen với lập trình vi điều khiển, cổng I/O và các thuật toán điều khiển tín hiệu căn bản.', N'Đang hoạt động');
    END;

    IF NOT EXISTS (SELECT 1 FROM KhoaHocLoTrinh WHERE TenLoTrinh = N'Điều khiển Robot tránh vật cản')
    BEGIN
        INSERT INTO KhoaHocLoTrinh (MaNguoiTao, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa, TrangThai)
        VALUES (2, N'Điều khiển Robot tránh vật cản', N'Cơ khí & Lập trình', N'Nâng cao', 2, 
                N'Chế tạo khung xe robot, tích hợp cảm biến siêu âm HC-SR04, cầu H L298N và lập trình thuật toán né chướng ngại vật tự động.', N'Đang hoạt động');
    END;
  `);

  // 2. Thêm 2 Dự án thực hành (DuAnBaiTap) có MaDuAnTienQuyet
  await pool.request().query(`
    DECLARE @MaLoTrinh1 INT = (SELECT TOP 1 MaLoTrinh FROM KhoaHocLoTrinh WHERE TenLoTrinh = N'Lập trình Arduino cơ bản');
    DECLARE @MaLoTrinh2 INT = (SELECT TOP 1 MaLoTrinh FROM KhoaHocLoTrinh WHERE TenLoTrinh = N'Điều khiển Robot tránh vật cản');

    IF NOT EXISTS (SELECT 1 FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Dự án 1%')
    BEGIN
        INSERT INTO DuAnBaiTap (MaNguoiDung, MaLoTrinh, MaDuAnTienQuyet, TenDuAn, YeuCauDuAn, NgayGiao, HanNop, CapDo, TrangThai)
        VALUES (2, @MaLoTrinh1, NULL, 
                N'Dự án 1: Lập trình đèn LED nhấp nháy theo tín hiệu (Blink SOS)', 
                N'Viết chương trình điều khiển đèn LED chớp tắt theo tín hiệu mã Morse SOS hoặc tín hiệu đầu vào. Khi nhận tín hiệu 1 thì bật LED (in LED_ON), 0 thì tắt LED (in LED_OFF), SOS thì phát mã tín hiệu cứu hộ (in 3_SHORT_3_LONG_3_SHORT). Bắt buộc nộp cả file mã nguồn (.py/.ino/.cpp) và video quay thực tế mô hình.',
                CURRENT_TIMESTAMP, DATEADD(day, 30, CURRENT_TIMESTAMP), N'Cơ bản', N'Đang mở');
    END;

    DECLARE @MaDuAn1 INT = (SELECT TOP 1 MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Dự án 1%');

    IF NOT EXISTS (SELECT 1 FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Dự án 2%')
    BEGIN
        INSERT INTO DuAnBaiTap (MaNguoiDung, MaLoTrinh, MaDuAnTienQuyet, TenDuAn, YeuCauDuAn, NgayGiao, HanNop, CapDo, TrangThai)
        VALUES (2, @MaLoTrinh2, @MaDuAn1, 
                N'Dự án 2: Xe Robot tự hành tránh vật cản', 
                N'Lập trình thuật toán đọc dữ liệu khoảng cách từ cảm biến siêu âm HC-SR04. Khi khoảng cách >= 20cm robot tiến thẳng, khi < 20cm robot dừng và quay phải. Điều kiện tiên quyết: Phải hoàn thành và đạt Dự án 1.',
                CURRENT_TIMESTAMP, DATEADD(day, 45, CURRENT_TIMESTAMP), N'Nâng cao', N'Đang mở');
    END;
  `);

  // 3. Thêm 3 TestCase mẫu cho Dự án 1
  await pool.request().query(`
    DECLARE @MaDuAn1 INT = (SELECT TOP 1 MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Dự án 1%');
    IF NOT EXISTS (SELECT 1 FROM TestCase WHERE MaDuAn = @MaDuAn1)
    BEGIN
        INSERT INTO TestCase (MaDuAn, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi)
        VALUES 
        (@MaDuAn1, N'1', N'LED_ON', 3.00, N'Kiểm tra tín hiệu 1: phải in ra LED_ON'),
        (@MaDuAn1, N'0', N'LED_OFF', 3.00, N'Kiểm tra tín hiệu 0: phải in ra LED_OFF'),
        (@MaDuAn1, N'SOS', N'3_SHORT_3_LONG_3_SHORT', 4.00, N'Kiểm tra tín hiệu SOS: phải in ra 3_SHORT_3_LONG_3_SHORT');
    END;
  `);

  console.log('✅ Seed dữ liệu MOD-03 & MOD-04 thành công!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Lỗi seed:', err);
  process.exit(1);
});
