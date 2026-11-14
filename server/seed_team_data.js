const { connectDB, sql } = require('./config/db');

async function seed() {
  const pool = await connectDB();
  console.log('--- BẮT ĐẦU CHUẨN HÓA DỮ LIỆU NHÓM & LỘ TRÌNH ĐÀO TẠO ---');

  // 1. Dọn dẹp dữ liệu rác từ các đợt test
  await pool.request().query(`
    DELETE FROM TestCase WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
    DELETE FROM KetQuaDiem WHERE MaBaiNop IN (SELECT MaBaiNop FROM BaiNop WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%'));
    DELETE FROM NoiDungCongDong WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
    DELETE FROM BaiNop WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
    DELETE FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%';
    DELETE FROM NguoiDung WHERE Email LIKE '%test_student_%';
  `);
  console.log('✓ Đã dọn dẹp các dự án và tài khoản test tạm thời.');

  // 2. Chuẩn hóa tên và thông tin 5 thành viên nhóm
  await pool.request().query(`
    UPDATE NguoiDung SET HoTen = N'Trần Minh Nhật (23SPT)', MatKhau = '123456', TrangThai = N'Đang hoạt động' WHERE Email = 'hs.minhnhat@stemrobotic.edu.vn';
    UPDATE NguoiDung SET HoTen = N'Phạm Kỳ Hải (23SPT)', MatKhau = '123456', TrangThai = N'Đang hoạt động' WHERE Email = 'hs.kyhai@stemrobotic.edu.vn';
    UPDATE NguoiDung SET HoTen = N'Phạm Thị Hà Vy (24SPT)', MatKhau = '123456', TrangThai = N'Đang hoạt động' WHERE Email = 'hs.havy@stemrobotic.edu.vn';
    UPDATE NguoiDung SET HoTen = N'Trần Thế Quân (24CNTT1)', MatKhau = '123456', TrangThai = N'Đang hoạt động' WHERE Email = 'hs.thequan@stemrobotic.edu.vn';
    UPDATE NguoiDung SET HoTen = N'Nguyễn Thị Thanh Thảo (24CNTT1)', MatKhau = '123456', TrangThai = N'Đang hoạt động' WHERE Email = 'hs.thanhthao@stemrobotic.edu.vn';
  `);
  console.log('✓ Đã chuẩn hóa danh sách 5 thành viên nhóm đồ án.');

  // 3. Chuẩn hóa 3 Lộ Trình Đào Tạo
  await pool.request().query(`
    UPDATE KhoaHocLoTrinh SET 
      TenLoTrinh = N'Lập trình Vi điều khiển Arduino & Tín hiệu I/O',
      MoTa = N'Nền tảng phần cứng Arduino, lập trình chân số GPIO, PWM và giao tiếp ngoại vi cơ bản.',
      ThuTuHoc = 1
    WHERE MaLoTrinh = 1;

    UPDATE KhoaHocLoTrinh SET 
      TenLoTrinh = N'Điều khiển Robot Tránh Vật Cản & Cầu H L298N',
      MoTa = N'Cảm biến siêu âm HC-SR04, mạch công suất cầu H L298N và giải thuật điều hướng né chướng ngại vật.',
      ThuTuHoc = 2
    WHERE MaLoTrinh = 2;

    UPDATE KhoaHocLoTrinh SET 
      TenLoTrinh = N'Hệ thống Robot IoT & Thị giác máy tính AI',
      MoTa = N'Cân bằng con quay gia tốc MPU6050, thuật toán PID và xử lý hình ảnh nhận diện vật thể.',
      ThuTuHoc = 3
    WHERE MaLoTrinh = 3;
  `);
  console.log('✓ Đã chuẩn hóa 3 lộ trình tuần tự không trùng lặp số.');

  // 4. Chuẩn hóa 5 Dự Án Thực Hành
  await pool.request().query(`
    UPDATE DuAnBaiTap SET TenDuAn = N'Dự án 1: Lập trình đèn LED nhấp nháy theo tín hiệu (Blink SOS)', MaLoTrinh = 1, CapDo = N'Cơ bản' WHERE MaDuAn = 1;
    UPDATE DuAnBaiTap SET TenDuAn = N'Dự án 2: Đo khoảng cách với Cảm biến siêu âm HC-SR04', MaLoTrinh = 1, CapDo = N'Cơ bản' WHERE MaDuAn = 11;
    UPDATE DuAnBaiTap SET TenDuAn = N'Dự án 3: Xe Robot tự hành né chướng ngại vật qua Cầu H L298N', MaLoTrinh = 2, CapDo = N'Nâng cao' WHERE MaDuAn = 13;
    UPDATE DuAnBaiTap SET TenDuAn = N'Dự án 4: Giải thuật cân bằng con quay MPU6050 PID đơn giản', MaLoTrinh = 2, CapDo = N'Nâng cao' WHERE MaDuAn = 12;
    UPDATE DuAnBaiTap SET TenDuAn = N'Dự án 5: Xe tự hành 2 bánh cân bằng quán tính & Thị giác AI', MaLoTrinh = 3, CapDo = N'Chuyên sâu' WHERE MaDuAn = 3;
  `);
  console.log('✓ Đã chuẩn hóa thứ tự 5 dự án thực hành.');

  // 5. Seed bài nộp & điểm số cho 5 thành viên nhóm
  // Lấy ID người dùng
  const uRes = await pool.request().query(`
    SELECT MaNguoiDung, Email, HoTen FROM NguoiDung 
    WHERE Email IN (
      'hs.minhnhat@stemrobotic.edu.vn',
      'hs.kyhai@stemrobotic.edu.vn',
      'hs.havy@stemrobotic.edu.vn',
      'hs.thequan@stemrobotic.edu.vn',
      'hs.thanhthao@stemrobotic.edu.vn'
    )
  `);
  const userMap = {};
  uRes.recordset.forEach(u => { userMap[u.Email] = u.MaNguoiDung; });

  const submissionsToSeed = [
    {
      email: 'hs.minhnhat@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/minhnhat_blink_sos.py',
      video: 'https://youtube.com/watch?v=robot_demo_minhnhat_01',
      diemCode: 10.0,
      ketQuaCode: 'Đạt',
      tongDiem: 10.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Thuật toán truyền phát mã Morse SOS chuẩn miligiây, bo mạch lắp ráp rất thẩm mỹ và ổn định.',
      vote: 95,
      fameTitle: 'Robot Phát Tín Hiệu SOS Cứu Hộ Tự Động',
      fameIntro: 'Giải pháp lập trình vi điều khiển tối ưu thời gian trễ không blocking, tích hợp còi buzzer và LED công suất cao.'
    },
    {
      email: 'hs.kyhai@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/kyhai_blink_sos.py',
      video: 'https://youtube.com/watch?v=robot_demo_kyhai_01',
      diemCode: 10.0,
      ketQuaCode: 'Đạt',
      tongDiem: 9.5,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Chương trình sạch đẹp, video thuyết minh rõ ràng các trường hợp kiểm thử đầu vào.',
      vote: 82,
      fameTitle: 'Hệ Thống Đèn Báo Hiệu Đa Tầng Cứu Hộ',
      fameIntro: 'Ứng dụng thuật toán ngắt Timer1 trên Arduino để duy trì tần số chớp LED độc lập với chu trình chính.'
    },
    {
      email: 'hs.havy@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/havy_blink_sos.py',
      video: 'https://youtube.com/watch?v=robot_demo_havy_01',
      diemCode: 10.0,
      ketQuaCode: 'Đạt',
      tongDiem: 9.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Điều chế xung PWM mượt mà, phân loại trạng thái logic chính xác.',
      vote: 76,
      fameTitle: 'Mạch Đèn Cảnh Báo An Toàn Xung PWM',
      fameIntro: 'Tối ưu hóa năng lượng tiêu thụ cho robot cứu hộ hoạt động bằng pin Li-ion 18650.'
    },
    {
      email: 'hs.thequan@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/thequan_blink_sos.py',
      video: 'https://youtube.com/watch?v=robot_demo_thequan_01',
      diemCode: 9.0,
      ketQuaCode: 'Đạt',
      tongDiem: 8.5,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Thiết kế phần cứng chuẩn mực, thời gian phản hồi máy chấm chỉ 28ms.',
      vote: 68,
      fameTitle: 'Hệ Thống Đèn Báo Quán Tính Xe Tự Hành',
      fameIntro: 'Tích hợp bảo vệ chống dòng ngược cho chân số GPIO của Arduino Uno R3.'
    },
    {
      email: 'hs.thanhthao@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/thanhthao_blink_sos.py',
      video: 'https://youtube.com/watch?v=robot_demo_thanhthao_01',
      diemCode: 9.0,
      ketQuaCode: 'Đạt',
      tongDiem: 8.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Hoàn thành tốt các tiêu chí kiểm thử, giao diện lắp ráp gọn gàng.',
      vote: 54,
      fameTitle: 'Module Cảnh Báo LED Thông Minh Cho Robot',
      fameIntro: 'Chương trình nhận tín hiệu điều khiển qua cổng nối tiếp UART với tốc độ 9600 baud.'
    }
  ];

  for (const item of submissionsToSeed) {
    const uid = userMap[item.email];
    if (!uid) continue;

    // Kiểm tra xem đã có bài nộp của học sinh cho dự án này chưa
    const checkSub = await pool.request()
      .input('uid', sql.Int, uid)
      .input('daId', sql.Int, item.maDuAn)
      .query('SELECT MaBaiNop FROM BaiNop WHERE MaNguoiDung = @uid AND MaDuAn = @daId');

    let subId;
    if (checkSub.recordset.length > 0) {
      subId = checkSub.recordset[0].MaBaiNop;
      await pool.request()
        .input('subId', sql.Int, subId)
        .input('video', sql.VarChar, item.video)
        .query("UPDATE BaiNop SET VideoVanHanh = @video, TrangThai = N'Đã chốt điểm' WHERE MaBaiNop = @subId");

      await pool.request()
        .input('subId', sql.Int, subId)
        .input('dCode', sql.Decimal(5,2), item.diemCode)
        .input('kqCode', sql.NVarChar, item.ketQuaCode)
        .input('tongDiem', sql.Decimal(5,2), item.tongDiem)
        .input('kqVideo', sql.NVarChar, item.ketQuaVideo)
        .input('nhanXet', sql.NVarChar, item.nhanXet)
        .query(`
          UPDATE KetQuaDiem SET
            DiemCode = @dCode,
            KetQuaCode = @kqCode,
            TongDiem = @tongDiem,
            KetQuaVideo = @kqVideo,
            NhanXet = @nhanXet,
            ThoiGianChay_ms = 42,
            NgayChotDiem = CURRENT_TIMESTAMP
          WHERE MaBaiNop = @subId
        `);
    } else {
      const insSub = await pool.request()
        .input('uid', sql.Int, uid)
        .input('daId', sql.Int, item.maDuAn)
        .input('source', sql.VarChar, item.source)
        .input('video', sql.VarChar, item.video)
        .query(`
          INSERT INTO BaiNop (MaNguoiDung, MaDuAn, MaNguon, VideoVanHanh, TrangThai)
          OUTPUT INSERTED.MaBaiNop
          VALUES (@uid, @daId, @source, @video, N'Đã chốt điểm')
        `);
      subId = insSub.recordset[0].MaBaiNop;

      await pool.request()
        .input('subId', sql.Int, subId)
        .input('dCode', sql.Decimal(5,2), item.diemCode)
        .input('kqCode', sql.NVarChar, item.ketQuaCode)
        .input('tongDiem', sql.Decimal(5,2), item.tongDiem)
        .input('kqVideo', sql.NVarChar, item.ketQuaVideo)
        .input('nhanXet', sql.NVarChar, item.nhanXet)
        .query(`
          INSERT INTO KetQuaDiem (MaBaiNop, DiemCode, KetQuaCode, TongDiem, KetQuaVideo, NhanXet, ThoiGianChay_ms, NgayChotDiem)
          VALUES (@subId, @dCode, @kqCode, @tongDiem, @kqVideo, @nhanXet, 42, CURRENT_TIMESTAMP)
        `);
    }

    // Cập nhật hoặc thêm vào NoiDungCongDong (Wall of Fame)
    const checkFame = await pool.request()
      .input('subId', sql.Int, subId)
      .query('SELECT MaNoiDung FROM NoiDungCongDong WHERE MaBaiNop = @subId');

    if (checkFame.recordset.length > 0) {
      await pool.request()
        .input('nid', sql.Int, checkFame.recordset[0].MaNoiDung)
        .input('tieuDe', sql.NVarChar, item.fameTitle)
        .input('noiDung', sql.NVarChar, item.fameIntro)
        .input('vote', sql.Int, item.vote)
        .query(`
          UPDATE NoiDungCongDong SET
            TieuDe = @tieuDe,
            NoiDung = @noiDung,
            SoLuotBinhChon = @vote,
            LoaiNoiDung = N'Vinh danh',
            TrangThai = N'Đã duyệt'
          WHERE MaNoiDung = @nid
        `);
    } else {
      await pool.request()
        .input('uid', sql.Int, uid)
        .input('daId', sql.Int, item.maDuAn)
        .input('subId', sql.Int, subId)
        .input('tieuDe', sql.NVarChar, item.fameTitle)
        .input('noiDung', sql.NVarChar, item.fameIntro)
        .input('vote', sql.Int, item.vote)
        .query(`
          INSERT INTO NoiDungCongDong (MaNguoiDung, MaDuAn, MaBaiNop, TieuDe, NoiDung, LoaiNoiDung, SoLuotBinhChon, TrangThai)
          VALUES (@uid, @daId, @subId, @tieuDe, @noiDung, N'Vinh danh', @vote, N'Đã duyệt')
        `);
    }
  }
  console.log('✓ Đã cập nhật kết quả điểm & Wall of Fame cho 5 thành viên nhóm.');

  // 6. Seed các bài thảo luận kỹ thuật (Diễn đàn TTCĐ.01 & Top Trending DF-03)
  const forumPosts = [
    {
      email: 'hs.minhnhat@stemrobotic.edu.vn',
      tieuDe: 'Kinh nghiệm căn chỉnh bộ ba tham số Kp, Ki, Kd cho Robot cân bằng 2 bánh',
      noiDung: 'Khi điều khiển cân bằng với cảm biến MPU6050, nên bắt đầu tăng Kp cho đến khi khung xe dao động nhẹ, sau đó tăng Kd để triệt tiêu dao động giật cục. Chỉ bổ sung Ki khi có sai số tĩnh lệch góc.',
      loai: 'Thảo luận',
      vote: 52
    },
    {
      email: 'hs.kyhai@stemrobotic.edu.vn',
      tieuDe: 'Giải pháp cấp nguồn riêng cho Cầu H L298N để chống sụt áp Arduino Uno',
      noiDung: 'Lưu ý quan trọng: Luôn nối chung GND giữa nguồn pin nuôi động cơ (7.4V - 12V) và bo Arduino, nhưng TUYỆT ĐỐI không lấy chân 5V của Arduino cấp cho động cơ DC vì sẽ gây reset vi điều khiển.',
      loai: 'Chia sẻ lỗi',
      vote: 45
    },
    {
      email: 'hs.thequan@stemrobotic.edu.vn',
      tieuDe: 'Bộ lọc bù Complementary Filter vs Kalman Filter: Lựa chọn nào tối ưu cho học sinh?',
      noiDung: 'Bộ lọc bù: angle = 0.98 * (angle + gyro * dt) + 0.02 * acc_angle. Thuật toán này chiếm chưa tới 20 dòng code C++ và chạy siêu mượt trên ATmega328P mà không tốn nhiều RAM như Kalman.',
      loai: 'Thảo luận',
      vote: 41
    }
  ];

  for (const post of forumPosts) {
    const uid = userMap[post.email];
    if (!uid) continue;

    const checkPost = await pool.request()
      .input('tieuDe', sql.NVarChar, post.tieuDe)
      .query('SELECT MaNoiDung FROM NoiDungCongDong WHERE TieuDe = @tieuDe');

    if (checkPost.recordset.length === 0) {
      await pool.request()
        .input('uid', sql.Int, uid)
        .input('tieuDe', sql.NVarChar, post.tieuDe)
        .input('noiDung', sql.NVarChar, post.noiDung)
        .input('loai', sql.NVarChar, post.loai)
        .input('vote', sql.Int, post.vote)
        .query(`
          INSERT INTO NoiDungCongDong (MaNguoiDung, TieuDe, NoiDung, LoaiNoiDung, SoLuotBinhChon, TrangThai)
          VALUES (@uid, @tieuDe, @noiDung, @loai, @vote, N'Đã duyệt')
        `);
    } else {
      await pool.request()
        .input('nid', sql.Int, checkPost.recordset[0].MaNoiDung)
        .input('vote', sql.Int, post.vote)
        .query('UPDATE NoiDungCongDong SET SoLuotBinhChon = @vote WHERE MaNoiDung = @nid');
    }
  }
  console.log('✓ Đã chuẩn hóa các bài viết thảo luận diễn đàn & Top Trending.');

  console.log('--- HOÀN THÀNH CHUẨN HÓA DỮ LIỆU THÀNH CÔNG 100% ---');
  process.exit(0);
}

seed().catch(err => {
  console.error('Lỗi khi seed dữ liệu:', err);
  process.exit(1);
});
