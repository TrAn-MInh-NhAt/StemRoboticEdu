const { connectDB, sql } = require('./config/db');

async function seedFame() {
  const pool = await connectDB();
  console.log('--- CHUẨN HÓA BẢNG VINH DANH CHO 5 THÀNH VIÊN LỚP 10/1 ---');

  // Xóa các bài nộp cũ dư thừa để dữ liệu sạch sẽ
  await pool.request().query(`
    DELETE FROM KetQuaDiem WHERE MaBaiNop IN (SELECT MaBaiNop FROM BaiNop WHERE MaDuAn IN (1, 11, 13, 12, 3));
    DELETE FROM NoiDungCongDong WHERE MaBaiNop IS NOT NULL;
    DELETE FROM BaiNop WHERE MaDuAn IN (1, 11, 13, 12, 3);
  `);
  console.log('✓ Đã dọn dẹp các bài nộp trùng lặp.');

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

  const fameList = [
    {
      email: 'hs.minhnhat@stemrobotic.edu.vn',
      maDuAn: 1,
      source: 'uploads/submissions/minhnhat_blink_sos.py',
      video: 'https://www.youtube.com/watch?v=fJWR7dBuc18',
      diemCode: 10.0,
      ketQuaCode: 'Đạt',
      tongDiem: 10.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Thuật toán truyền phát mã Morse SOS chuẩn xác tuyệt đối theo miligiây, bo mạch lắp ráp rất thẩm mỹ và ổn định.',
      vote: 98,
      fameTitle: 'Robot Phát Tín Hiệu SOS Cứu Hộ Tự Động',
      fameIntro: 'Giải pháp lập trình vi điều khiển tối ưu thời gian trễ không blocking, tích hợp còi buzzer và LED công suất cao.'
    },
    {
      email: 'hs.kyhai@stemrobotic.edu.vn',
      maDuAn: 11,
      source: 'uploads/submissions/kyhai_hcsr04.py',
      video: 'https://www.youtube.com/watch?v=ZejQOX69K5M',
      diemCode: 9.5,
      ketQuaCode: 'Đạt',
      tongDiem: 9.5,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Khử nhiễu sóng siêu âm bằng bộ lọc trung vị xuất sắc, video quay góc quay thực nghiệm rất trực quan.',
      vote: 86,
      fameTitle: 'Trạm Đo Khoảng Cách Siêu Âm HC-SR04 Chống Nhiễu',
      fameIntro: 'Ứng dụng thuật toán ngắt xung Timer để tính toán khoảng cách vật cản chính xác tới 0.1cm.'
    },
    {
      email: 'hs.havy@stemrobotic.edu.vn',
      maDuAn: 13,
      source: 'uploads/submissions/havy_l298n.py',
      video: 'https://www.youtube.com/watch?v=dyjo_9KaUEc',
      diemCode: 9.0,
      ketQuaCode: 'Đạt',
      tongDiem: 9.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Điều khiển cầu H L298N chuyển hướng mượt mà, phản xạ né vật cản nhạy bén trên sa bàn phòng lab.',
      vote: 78,
      fameTitle: 'Xe Robot Né Chướng Ngại Vật 2 Bánh Vi Sai',
      fameIntro: 'Tối ưu phân bố công suất PWM cho 2 động cơ DC, hạn chế giật bánh khi chuyển hướng 90 độ.'
    },
    {
      email: 'hs.thequan@stemrobotic.edu.vn',
      maDuAn: 12,
      source: 'uploads/submissions/thequan_mpu6050.py',
      video: 'https://www.youtube.com/watch?v=0v7M3b0u0sM',
      diemCode: 8.5,
      ketQuaCode: 'Đạt',
      tongDiem: 8.5,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Bộ lọc bù Complementary Filter triệt tiêu trôi dạt góc con quay tốt, đáp ứng tần số 100Hz.',
      vote: 72,
      fameTitle: 'Thuật Toán Cân Bằng MPU6050 & Bộ Điều Khiển PID',
      fameIntro: 'Giải thuật tính toán sai số góc nghiêng xe 2 bánh, phản hồi lực kéo động cơ để giữ thăng bằng.'
    },
    {
      email: 'hs.thanhthao@stemrobotic.edu.vn',
      maDuAn: 3,
      source: 'uploads/submissions/thanhthao_blink_sos.py',
      video: 'https://www.youtube.com/watch?v=kUHmYKWwuWs',
      diemCode: 8.0,
      ketQuaCode: 'Đạt',
      tongDiem: 8.0,
      ketQuaVideo: 'Đạt',
      nhanXet: 'Hoàn thành tốt các tiêu chí kiểm thử đầu vào, phần cứng bố trí dây nối mạch rất ngăn nắp.',
      vote: 65,
      fameTitle: 'Module Cảnh Báo An Toàn Xung Nhịp Robot',
      fameIntro: 'Chương trình nhận tín hiệu điều khiển qua cổng nối tiếp UART với tốc độ 9600 baud chuẩn.'
    }
  ];

  for (const item of fameList) {
    const uid = userMap[item.email];
    if (!uid) continue;

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
    const subId = insSub.recordset[0].MaBaiNop;

    await pool.request()
      .input('subId', sql.Int, subId)
      .input('dCode', sql.Decimal(5,2), item.diemCode)
      .input('kqCode', sql.NVarChar, item.ketQuaCode)
      .input('tongDiem', sql.Decimal(5,2), item.tongDiem)
      .input('kqVideo', sql.NVarChar, item.ketQuaVideo)
      .input('nhanXet', sql.NVarChar, item.nhanXet)
      .query(`
        INSERT INTO KetQuaDiem (MaBaiNop, DiemCode, KetQuaCode, TongDiem, KetQuaVideo, NhanXet, ThoiGianChay_ms, NgayChotDiem)
        VALUES (@subId, @dCode, @kqCode, @tongDiem, @kqVideo, @nhanXet, 38, CURRENT_TIMESTAMP)
      `);

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

  console.log('✓ Đã cập nhật 5 cỗ máy xuất sắc của 5 thành viên nhóm lên Bảng Vinh Danh.');
  process.exit(0);
}

seedFame().catch(e => { console.error('Seed fame error:', e); process.exit(1); });
