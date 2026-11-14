const { connectDB, sql } = require('./config/db');

async function seed() {
  const pool = await connectDB();
  console.log('Bắt đầu seed Bài thi (KTĐG.02) và Học liệu (TKDL.02)...');

  // 1. Seed Bài thi mẫu (KTĐG.02)
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM BaiThi WHERE TenBaiThi LIKE N'%Kỳ thi Đánh giá Năng lực%')
    BEGIN
        INSERT INTO BaiThi (MaNguoiDung, TenBaiThi, NoiDungDeThi, ThoiGianBatDau, ThoiGianKetThuc, ThoiLuong, SoLanChuyenTab, TrangThai)
        VALUES (
            2, 
            N'Kỳ thi Đánh giá Năng lực Lập trình Robot STEM Giữa kỳ',
            N'ĐỀ THI THỰC HÀNH LẬP TRÌNH ĐIỀU KHIỂN ROBOT (Thời gian: 45 phút)

Câu 1 (4 điểm): Viết thuật toán đọc cảm biến khoảng cách HC-SR04 qua tín hiệu xung echo và trigger.
Câu 2 (6 điểm): Viết logic điều khiển 2 động cơ DC qua cầu H L298N: Nếu d < 15cm thì dừng khẩn cấp và quay xe 90 độ tìm đường thoát.

QUY CHẾ PHÒNG THI CHỐNG GIAN LẬN (DF-06):
1. Học sinh làm bài trực tiếp trong giao diện phòng thi, không chuyển tab hoặc thu nhỏ cửa sổ.
2. Hệ thống JS Tracking theo dõi sự kiện chuyển tab (visibilitychange/blur).
3. Mỗi lần rời khỏi tab thi, số lần vi phạm (SoLanChuyenTabHS) sẽ tăng lên 1 và hiện cảnh báo đỏ.
4. Nếu vi phạm quá 3 lần, bài thi sẽ BỊ TỰ ĐỘNG KHÓA VÀ THU BÀI NGAY LẬP TỨC.',
            CURRENT_TIMESTAMP,
            DATEADD(day, 14, CURRENT_TIMESTAMP),
            45,
            3,
            N'Đang mở'
        );
    END;
  `);

  // 2. Seed Học liệu mẫu (HocLieu)
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM HocLieu WHERE TenHocLieu LIKE N'%mã Morse SOS%')
    BEGIN
        INSERT INTO HocLieu (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, CoCanCapNhat, TrangThai)
        VALUES (
            2, 1,
            N'Tài liệu hướng dẫn lập trình xung PWM và mã Morse SOS',
            N'Tài liệu',
            N'Hướng dẫn chi tiết cách cấu hình chân GPIO Arduino, chu kỳ dao động xung và giải thuật phát tín hiệu cứu hộ SOS quốc tế.',
            0,
            N'Đang xuất bản'
        );
    END;

    IF NOT EXISTS (SELECT 1 FROM HocLieu WHERE TenHocLieu LIKE N'%cảm biến siêu âm HC-SR04%')
    BEGIN
        INSERT INTO HocLieu (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, CoCanCapNhat, TrangThai)
        VALUES (
            2, 2,
            N'Sơ đồ mạch điện cảm biến siêu âm HC-SR04 & Thuật toán né vật cản',
            N'Sơ đồ 3D',
            N'Sơ đồ nguyên lý đấu nối chân VCC, Trig, Echo, GND và thuật toán tính khoảng cách bằng tốc độ âm thanh trong không khí.',
            0,
            N'Đang xuất bản'
        );
    END;
  `);

  console.log('✅ Seed Bài thi (KTĐG.02) và Học liệu (TKDL.02) thành công!');
  process.exit(0);
}

seed().catch(err => {
  console.error('❌ Lỗi seed:', err);
  process.exit(1);
});
