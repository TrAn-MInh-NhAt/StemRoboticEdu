const { getPool, connectDB, sql } = require('./config/db');

async function cleanupRoadmaps() {
  try {
    await connectDB();
    const pool = getPool();

    console.log('🔄 Đang dọn dẹp các bản ghi trùng lặp và chuẩn hóa 3 Lộ trình học...');

    // 1. Chuyển toàn bộ Học liệu từ MaLoTrinh 3 -> 1, và MaLoTrinh 4 -> 2
    await pool.request().query(`
      UPDATE HocLieu SET MaLoTrinh = 1 WHERE MaLoTrinh = 3;
      UPDATE HocLieu SET MaLoTrinh = 2 WHERE MaLoTrinh = 4;
    `);

    // 2. Chuyển toàn bộ Dự án từ MaLoTrinh 3 -> 1, và MaLoTrinh 4 -> 2
    await pool.request().query(`
      UPDATE DuAnBaiTap SET MaLoTrinh = 1 WHERE MaLoTrinh = 3;
      UPDATE DuAnBaiTap SET MaLoTrinh = 2 WHERE MaLoTrinh = 4;
    `);

    // 3. Xóa các dự án thử nghiệm trùng lặp sinh ra trong lúc test
    // Trước khi xóa DuAnBaiTap, xóa TestCases và BaiNop liên quan đến các dự án test đó
    await pool.request().query(`
      DELETE FROM TestCase 
      WHERE MaDuAn IN (
        SELECT MaDuAn FROM DuAnBaiTap 
        WHERE TenDuAn LIKE N'Dự án Kiểm Thử QLDA.01%' 
           OR TenDuAn LIKE N'Dự án Test Tự Động%'
           OR TenDuAn LIKE N'Dự án STEM Thử nghiệm QLDA.01%'
      );

      DELETE FROM KetQuaDiem 
      WHERE MaBaiNop IN (
        SELECT MaBaiNop FROM BaiNop 
        WHERE MaDuAn IN (
          SELECT MaDuAn FROM DuAnBaiTap 
          WHERE TenDuAn LIKE N'Dự án Kiểm Thử QLDA.01%' 
             OR TenDuAn LIKE N'Dự án Test Tự Động%'
             OR TenDuAn LIKE N'Dự án STEM Thử nghiệm QLDA.01%'
        )
      );

      DELETE FROM BaiNop 
      WHERE MaDuAn IN (
        SELECT MaDuAn FROM DuAnBaiTap 
        WHERE TenDuAn LIKE N'Dự án Kiểm Thử QLDA.01%' 
           OR TenDuAn LIKE N'Dự án Test Tự Động%'
           OR TenDuAn LIKE N'Dự án STEM Thử nghiệm QLDA.01%'
      );

      DELETE FROM DuAnBaiTap 
      WHERE TenDuAn LIKE N'Dự án Kiểm Thử QLDA.01%' 
         OR TenDuAn LIKE N'Dự án Test Tự Động%'
         OR TenDuAn LIKE N'Dự án STEM Thử nghiệm QLDA.01%';
    `);

    // 4. Xóa các học liệu test trùng lặp
    await pool.request().query(`
      DELETE FROM HocLieu 
      WHERE TenHocLieu LIKE N'Bài giảng Test Tự Động%';
    `);

    // 5. Xóa 2 Lộ trình thừa (3 và 4)
    await pool.request().query(`
      DELETE FROM KhoaHocLoTrinh WHERE MaLoTrinh IN (3, 4);
    `);

    // 6. Cập nhật lại tên và thông tin của 3 Lộ trình chuẩn mực:
    // Lộ trình 1: MaLoTrinh 1
    await pool.request().query(`
      UPDATE KhoaHocLoTrinh
      SET TenLoTrinh = N'Lập trình Vi điều khiển Arduino & Tín hiệu I/O',
          ChuDe = N'Cơ khí & Mạch điện',
          CapDo = N'Cơ bản',
          ThuTuHoc = 1,
          MoTa = N'Làm quen với cấu trúc vi điều khiển Arduino Uno R3, quản lý chân GPIO, đọc nút nhấn, nhấp nháy đèn LED mã Morse SOS và thuật toán xung PWM.'
      WHERE MaLoTrinh = 1;
    `);

    // Lộ trình 2: MaLoTrinh 2
    await pool.request().query(`
      UPDATE KhoaHocLoTrinh
      SET TenLoTrinh = N'Điều khiển Robot Tránh Vật Cản & Cầu H L298N',
          ChuDe = N'Lập trình & Điều khiển',
          CapDo = N'Nâng cao',
          ThuTuHoc = 2,
          MoTa = N'Chế tạo khung xe robot 2 bánh, kết nối cảm biến siêu âm HC-SR04 qua mạch cầu H L298N và lập trình thuật toán né chướng ngại vật tự động.'
      WHERE MaLoTrinh = 2;
    `);

    // Lộ trình 3: MaLoTrinh 5
    await pool.request().query(`
      UPDATE KhoaHocLoTrinh
      SET TenLoTrinh = N'Hệ thống Robot IoT & Thị giác máy tính AI',
          ChuDe = N'AI & IoT',
          CapDo = N'Chuyên sâu',
          ThuTuHoc = 3,
          MoTa = N'Tích hợp ESP32 kết nối IoT qua giao thức MQTT, giải thuật cân bằng quán tính ngược PID và xử lý camera AI nhận diện sa bàn.'
      WHERE MaLoTrinh = 5;
    `);

    // In kiểm tra lại KhoaHocLoTrinh
    const ltRes = await pool.request().query(`
      SELECT MaLoTrinh, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, TrangThai
      FROM KhoaHocLoTrinh
      ORDER BY ThuTuHoc ASC
    `);
    console.log('✅ 3 Lộ trình học sau khi chuẩn hóa:');
    console.table(ltRes.recordset);

    // In kiểm tra lại DuAnBaiTap
    const daRes = await pool.request().query(`
      SELECT MaDuAn, MaLoTrinh, TenDuAn, CapDo, MaDuAnTienQuyet
      FROM DuAnBaiTap
      ORDER BY MaLoTrinh, MaDuAn ASC
    `);
    console.log('✅ Danh sách Dự án chuẩn theo Lộ trình:');
    console.table(daRes.recordset);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi dọn dẹp lộ trình:', err.message);
    process.exit(1);
  }
}

cleanupRoadmaps();
