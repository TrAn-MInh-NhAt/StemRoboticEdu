const { getPool, connectDB, sql } = require('./config/db');

async function structureProjects() {
  try {
    await connectDB();
    const pool = getPool();

    console.log('🔄 Đang cấu trúc 5 Dự án chuẩn mực theo 3 Lộ trình học...');

    // Gỡ bỏ khóa ngoại tham chiếu trước khi xóa
    await pool.request().query(`
      UPDATE NoiDungCongDong SET MaDuAn = 1 WHERE MaDuAn IN (2, 10);
      UPDATE DuAnBaiTap SET MaDuAnTienQuyet = NULL WHERE MaDuAnTienQuyet IN (2, 10);
      DELETE FROM TestCase WHERE MaDuAn IN (2, 10);
      DELETE FROM KetQuaDiem WHERE MaBaiNop IN (SELECT MaBaiNop FROM BaiNop WHERE MaDuAn IN (2, 10));
      DELETE FROM BaiNop WHERE MaDuAn IN (2, 10);
      DELETE FROM DuAnBaiTap WHERE MaDuAn IN (2, 10);
    `);

    // Cập nhật Dự án 1 (Lộ trình 1)
    await pool.request().query(`
      UPDATE DuAnBaiTap
      SET TenDuAn = N'Dự án 1: Lập trình đèn LED nhấp nháy theo tín hiệu (Blink SOS)',
          MaLoTrinh = 1,
          CapDo = N'Cơ bản',
          MaDuAnTienQuyet = NULL,
          YeuCauDuAn = N'Lập trình điều khiển đèn LED nối tại chân GPIO số 13. Khi nhận tín hiệu đầu vào "1", in ra "LED_ON" và bật sáng. Khi nhận tín hiệu "0", in ra "LED_OFF" và tắt. Khi nhận chuỗi tín hiệu cứu hộ khẩn cấp "SOS", phát chuỗi mã Morse chuẩn quốc tế: in ra "3_SHORT_3_LONG_3_SHORT". Nộp file code (.py hoặc .ino) và video ghi lại quá trình vận hành thực tế trên mạch.'
      WHERE MaDuAn = 1;
    `);

    // Cập nhật Dự án 11 (Dự án 2 thuộc Lộ trình 1)
    await pool.request().query(`
      UPDATE DuAnBaiTap
      SET TenDuAn = N'Dự án 2: Đo khoảng cách với Cảm biến siêu âm HC-SR04',
          MaLoTrinh = 1,
          CapDo = N'Cơ bản',
          MaDuAnTienQuyet = 1,
          YeuCauDuAn = N'Lập trình xử lý xung thời gian phản hồi từ chân ECHO của cảm biến siêu âm HC-SR04. Khi nhận thời gian microsecond (µs), tính toán khoảng cách theo công thức d = t / 58.0 (cm) và in ra màn hình Serial đúng định dạng số thập phân. Yêu cầu nộp file mã nguồn (.py / .ino) và video quay cảm biến đo khoảng cách tới vật cản.'
      WHERE MaDuAn = 11;
    `);

    // Cập nhật Dự án 13 (Dự án 3 thuộc Lộ trình 2)
    await pool.request().query(`
      UPDATE DuAnBaiTap
      SET TenDuAn = N'Dự án 3: Xe Robot tự hành né chướng ngại vật qua Cầu H L298N',
          MaLoTrinh = 2,
          CapDo = N'Nâng cao',
          MaDuAnTienQuyet = 11,
          YeuCauDuAn = N'Kết hợp cảm biến siêu âm HC-SR04 và mạch cầu H L298N để điều khiển 2 động cơ DC. Quy tắc điều hướng: Nếu khoảng cách > 20cm, in "FORWARD" (tiến thẳng). Nếu 10cm < khoảng cách <= 20cm, in "TURN_LEFT" (rẽ trái). Nếu khoảng cách <= 10cm, in "BACK_AND_TURN" (lùi lại và quay đầu). Nộp file code và video xe chạy thực tế trong sa bàn mê cung.'
      WHERE MaDuAn = 13;
    `);

    // Cập nhật Dự án 12 (Dự án 4 thuộc Lộ trình 2)
    await pool.request().query(`
      UPDATE DuAnBaiTap
      SET TenDuAn = N'Dự án 4: Giải thuật cân bằng con quay MPU6050 PID đơn giản',
          MaLoTrinh = 2,
          CapDo = N'Nâng cao',
          MaDuAnTienQuyet = 13,
          YeuCauDuAn = N'Viết thuật toán PID mô phỏng điều khiển góc nghiêng cho xe cân bằng 2 bánh. Đầu vào gồm 5 tham số: Setpoint, Góc_hiện_tại, Kp, Ki, Kd. Tính sai số e = Setpoint - Góc_hiện_tại. Nếu sai số = 0 in "Motor: STOP", nếu Output > 0 in "Motor: FORWARD <tốc độ>", nếu Output < 0 in "Motor: BACK <tốc độ>". Nộp code thuật toán và video xe giữ thăng bằng.'
      WHERE MaDuAn = 12;
    `);

    // Cập nhật Dự án 3 (Dự án 5 thuộc Lộ trình 3)
    await pool.request().query(`
      UPDATE DuAnBaiTap
      SET TenDuAn = N'Dự án 5: Xe tự hành 2 bánh cân bằng quán tính & Thị giác AI',
          MaLoTrinh = 5,
          CapDo = N'Chuyên sâu',
          MaDuAnTienQuyet = 12,
          YeuCauDuAn = N'Dự án tốt nghiệp chuyên sâu: Tích hợp hệ thống con quay MPU6050 lọc bù Kalman kết hợp xử lý hình ảnh Camera AI nhận diện màu sắc biển báo sa bàn. Khi nhận diện màu "RED", thực thi "GRAB_AND_DROP_BIN_A". Khi nhận diện màu "BLUE", thực thi "GRAB_AND_DROP_BIN_B". Bắt buộc nộp trọn vẹn mã nguồn và video minh chứng hoạt động thực tế.'
      WHERE MaDuAn = 3;
    `);

    // In danh sách hoàn thiện
    const result = await pool.request().query(`
      SELECT 
        lt.ThuTuHoc,
        lt.TenLoTrinh,
        da.MaDuAn,
        da.TenDuAn,
        da.CapDo,
        da.MaDuAnTienQuyet
      FROM DuAnBaiTap da
      JOIN KhoaHocLoTrinh lt ON da.MaLoTrinh = lt.MaLoTrinh
      ORDER BY lt.ThuTuHoc ASC, da.MaDuAn ASC
    `);

    console.log('✅ Hoàn tất cấu trúc Lộ trình & Dự án:');
    console.table(result.recordset);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi cấu trúc dự án:', err.message);
    process.exit(1);
  }
}

structureProjects();
