const path = require('path');
require(path.resolve(__dirname, '../../server/node_modules/dotenv')).config({ path: path.resolve(__dirname, '../../.env') });
const { connectDB, getPool, sql } = require('../config/db');

async function fixUnicode() {
  try {
    await connectDB();
    const pool = getPool();

    console.log('🔄 Đang chuẩn hóa Unicode Tiếng Việt cho CSDL StemRoboticDB_V2...');

    // 1. Chuẩn hóa NguoiDung
    await pool.request().query(`
      UPDATE NguoiDung SET
        HoTen = N'Quản Trị Viên Hệ Thống',
        VaiTro = N'Admin',
        TruongHoc = N'THPT Chuyên STEM',
        TrangThaiXacThucThe = N'Đã duyệt',
        TrangThai = N'Đang hoạt động'
      WHERE Email = 'admin@stemrobotic.edu.vn';

      UPDATE NguoiDung SET
        HoTen = N'TS. Đặng Hùng Vĩ',
        VaiTro = N'Giáo viên',
        TruongHoc = N'THPT Chuyên STEM',
        TrangThaiXacThucThe = N'Đã duyệt',
        TrangThai = N'Đang hoạt động'
      WHERE Email = 'gv.hungvi@stemrobotic.edu.vn';

      UPDATE NguoiDung SET
        VaiTro = N'Học sinh',
        Lop = N'10/1',
        TruongHoc = N'THPT Chuyên STEM',
        TrangThaiXacThucThe = N'Đã duyệt',
        TrangThai = N'Đang hoạt động'
      WHERE Email LIKE 'hs.%@stemrobotic.edu.vn';

      UPDATE LopHoc SET
        MoTa = N'Lớp Chuyên Kỹ Thuật Robotics & Tự Động Hóa 10/1'
      WHERE TenLop = N'10/1';

      UPDATE KhoaHocLoTrinh SET
        TrangThai = N'Đang hoạt động'
      WHERE TrangThai IS NOT NULL;

      UPDATE DuAnBaiTap SET
        TrangThai = N'Đang mở'
      WHERE TrangThai IS NOT NULL;

      UPDATE MayCham SET
        TenMayCham = N'STEM Arduino & Python Judge',
        TrangThai = N'Đang hoạt động';
    `);

    console.log('✅ Đã cập nhật xong dữ liệu SQL Server!');

    const resUsers = await pool.request().query('SELECT MaNguoiDung, HoTen, Email, VaiTro, TrangThai FROM NguoiDung');
    console.log('--- NguoiDung ---');
    console.table(resUsers.recordset);

    const resLop = await pool.request().query('SELECT * FROM LopHoc');
    console.log('--- LopHoc ---');
    console.table(resLop.recordset);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi:', err);
    process.exit(1);
  }
}

fixUnicode();
