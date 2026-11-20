/**
 * seed_quan_thongbao.js
 * -------------------------------------------------------
 * Dữ liệu mẫu chuẩn cho bảng HoTroThongBao (ENT-11)
 * Phân hệ 1 & 6: QTHT.02-03, QLDA.02, HTTB.01-02, luồng DF-02, DF-07
 * Tác giả: Trần Thế Quân
 * Nhánh: feature/quan-csdl-hethong
 * -------------------------------------------------------
 */

const { connectDB, sql } = require('./config/db');

async function seed() {
  const pool = await connectDB();
  console.log('[seed_quan_thongbao] ✅ Đang kết nối CSDL, bắt đầu nạp dữ liệu HoTroThongBao...');

  // 1. HTTB.02 — Thông báo hệ thống & Thông báo bảo trì
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe = N'Thông báo bảo trì hệ thống định kỳ')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (1, N'Thông báo', N'Thông báo bảo trì hệ thống định kỳ',
              N'Hệ thống STEM Robotic Edu sẽ tiến hành bảo trì máy chấm và nâng cấp cơ sở dữ liệu từ 23:00 đến 01:00. Học sinh vui lòng lưu lại mã nguồn trước thời gian này.',
              N'Cao', N'Đã gửi');
    END;

    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe = N'Chào mừng năm học mới 2025-2026')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (1, N'Thông báo', N'Chào mừng năm học mới 2025-2026',
              N'Khai giảng khóa học Lập trình Robotics và Điều khiển Tự động Lớp 10/1. Chúc các em học sinh hoàn thành xuất sắc các dự án thực hành!',
              N'Bình thường', N'Đã gửi');
    END;
  `);

  // 2. Hướng dẫn nộp video vận hành thực tế (XLBN.01, KQBN.01)
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe = N'Hướng dẫn nộp video vận hành robot thực tế')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (2, N'Thông báo', N'Hướng dẫn nộp video vận hành robot thực tế',
              N'Yêu cầu bài nộp dự án thực hành: (1) Nộp kèm link video YouTube hoặc Google Drive công khai quay rõ mô hình chạy thực tế; (2) Thời lượng video 30-90 giây, thấy rõ thao tác cấp nguồn và phản hồi cảm biến; (3) Điểm video chiếm 50% tổng điểm dự án.',
              N'Cao', N'Đã gửi');
    END;
  `);

  // 3. Lưu ý phòng thi trực tuyến & Giám sát chuyển tab (KTĐG.02, DF-06)
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe = N'Lưu ý quan trọng: Quy chế phòng thi trực tuyến & Chống chuyển Tab (DF-06)')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (1, N'Thông báo', N'Lưu ý quan trọng: Quy chế phòng thi trực tuyến & Chống chuyển Tab (DF-06)',
              N'Quy định thi trực tuyến: Hệ thống kích hoạt cơ chế Window Focus Tracking. Thí sinh rời màn hình thi quá 3 lần sẽ bị khóa bài và tự động nộp bài ngay lập tức. Đảm bảo kết nối mạng ổn định và đóng các ứng dụng không liên quan trước khi vào thi.',
              N'Cao', N'Đã gửi');
    END;
  `);

  // 4. HTTB.01 — Phiếu phản hồi sự cố & Hỗ trợ kỹ thuật
  await pool.request().query(`
    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe LIKE N'%Không nộp được video%')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (3, N'Sự cố', N'[Ticket] Không nộp được link video YouTube',
              N'Học sinh Trần Minh Nhật báo cáo: Em dán link video YouTube dạng shorts thì hệ thống báo định dạng chưa hỗ trợ. Nhờ Admin kiểm tra hỗ trợ regex link.',
              N'Bình thường', N'Đang xử lý');
    END;

    IF NOT EXISTS (SELECT 1 FROM HoTroThongBao WHERE TieuDe LIKE N'%Lỗi máy chấm timeout%')
    BEGIN
      INSERT INTO HoTroThongBao (MaNguoiDung, LoaiThongTin, TieuDe, NoiDung, MucDoUuTien, TrangThai)
      VALUES (6, N'Sự cố', N'[Ticket] Lỗi máy chấm phản hồi Time Limit Exceeded',
              N'Học sinh Trần Thế Quân báo cáo: Bài tập số 2 nộp code Arduino báo TLE dù vòng lặp loop chạy đúng tiêu chuẩn. Đề xuất kiểm tra lại timeout máy chấm.',
              N'Cao', N'Chờ xử lý');
    END;
  `);

  console.log('[seed_quan_thongbao] ✅ Đã nạp thành công dữ liệu mẫu HoTroThongBao (Thông báo, Hướng dẫn video, Lưu ý phòng thi, Ticket sự cố).');

  return { success: true };
}

// Xuất module hợp lệ
module.exports = {
  seed,
  seedQuanThongBao: seed
};

// Nếu chạy trực tiếp bằng dòng lệnh: node seed_quan_thongbao.js
if (require.main === module) {
  seed()
    .then(() => {
      console.log('[seed_quan_thongbao] 🎉 Hoàn tất!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[seed_quan_thongbao] ❌ Lỗi:', err);
      process.exit(1);
    });
}
