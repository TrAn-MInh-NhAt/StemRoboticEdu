const { getPool, connectDB, sql } = require('./config/db');

async function updateTeamStudents() {
  try {
    await connectDB();
    const pool = getPool();

    console.log('🔄 Đang chuẩn hóa danh sách học sinh theo 5 thành viên trong nhóm đồ án...');

    // 1. Cập nhật học sinh #3: Trần Minh Nhật
    await pool.request()
      .input('id', sql.Int, 3)
      .input('name', sql.NVarChar, 'Trần Minh Nhật')
      .input('email', sql.VarChar, 'hs.minhnhat@stemrobotic.edu.vn')
      .input('pass', sql.VarChar, '123456')
      .query(`
        UPDATE NguoiDung
        SET HoTen = @name, Email = @email, MatKhau = @pass, VaiTro = N'Học sinh', Lop = N'10/1', TrangThai = N'Đang hoạt động'
        WHERE MaNguoiDung = @id
      `);

    // 2. Cập nhật học sinh #4: Phạm Kỳ Hải
    await pool.request()
      .input('id', sql.Int, 4)
      .input('name', sql.NVarChar, 'Phạm Kỳ Hải')
      .input('email', sql.VarChar, 'hs.kyhai@stemrobotic.edu.vn')
      .input('pass', sql.VarChar, '123456')
      .query(`
        UPDATE NguoiDung
        SET HoTen = @name, Email = @email, MatKhau = @pass, VaiTro = N'Học sinh', Lop = N'10/1', TrangThai = N'Đang hoạt động'
        WHERE MaNguoiDung = @id
      `);

    // 3. Cập nhật học sinh #5: Phạm Thị Hà Vy
    await pool.request()
      .input('id', sql.Int, 5)
      .input('name', sql.NVarChar, 'Phạm Thị Hà Vy')
      .input('email', sql.VarChar, 'hs.havy@stemrobotic.edu.vn')
      .input('pass', sql.VarChar, '123456')
      .query(`
        UPDATE NguoiDung
        SET HoTen = @name, Email = @email, MatKhau = @pass, VaiTro = N'Học sinh', Lop = N'10/1', TrangThai = N'Đang hoạt động'
        WHERE MaNguoiDung = @id
      `);

    // 4. Thêm học sinh: Trần Thế Quân
    const checkQuan = await pool.request()
      .input('email', sql.VarChar, 'hs.thequan@stemrobotic.edu.vn')
      .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');

    if (checkQuan.recordset.length === 0) {
      await pool.request()
        .input('name', sql.NVarChar, 'Trần Thế Quân')
        .input('email', sql.VarChar, 'hs.thequan@stemrobotic.edu.vn')
        .input('pass', sql.VarChar, '123456')
        .query(`
          INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro, Lop, TrangThai)
          VALUES (@name, @email, @pass, N'Học sinh', N'10/1', N'Đang hoạt động')
        `);
      console.log('✅ Đã thêm học sinh: Trần Thế Quân (10/1)');
    } else {
      await pool.request()
        .input('name', sql.NVarChar, 'Trần Thế Quân')
        .input('email', sql.VarChar, 'hs.thequan@stemrobotic.edu.vn')
        .query(`UPDATE NguoiDung SET HoTen = @name, Lop = N'10/1', TrangThai = N'Đang hoạt động' WHERE Email = @email`);
    }

    // 5. Thêm học sinh: Nguyễn Thị Thanh Thảo
    const checkThao = await pool.request()
      .input('email', sql.VarChar, 'hs.thanhthao@stemrobotic.edu.vn')
      .query('SELECT MaNguoiDung FROM NguoiDung WHERE Email = @email');

    if (checkThao.recordset.length === 0) {
      await pool.request()
        .input('name', sql.NVarChar, 'Nguyễn Thị Thanh Thảo')
        .input('email', sql.VarChar, 'hs.thanhthao@stemrobotic.edu.vn')
        .input('pass', sql.VarChar, '123456')
        .query(`
          INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro, Lop, TrangThai)
          VALUES (@name, @email, @pass, N'Học sinh', N'10/1', N'Đang hoạt động')
        `);
      console.log('✅ Đã thêm học sinh: Nguyễn Thị Thanh Thảo (10/1)');
    } else {
      await pool.request()
        .input('name', sql.NVarChar, 'Nguyễn Thị Thanh Thảo')
        .input('email', sql.VarChar, 'hs.thanhthao@stemrobotic.edu.vn')
        .query(`UPDATE NguoiDung SET HoTen = @name, Lop = N'10/1', TrangThai = N'Đang hoạt động' WHERE Email = @email`);
    }

    // 6. Xóa các tài khoản test tạm thời sinh ra trong lúc chạy test suite
    await pool.request().query(`
      DELETE FROM NguoiDung
      WHERE Email LIKE 'test_student_%@stem.edu.vn'
    `);

    // In danh sách sau khi cập nhật
    const res = await pool.request().query(`
      SELECT MaNguoiDung, HoTen, Email, VaiTro, TrangThai
      FROM NguoiDung
      ORDER BY MaNguoiDung ASC
    `);

    console.log('📋 Danh sách tài khoản hệ thống chuẩn hóa:');
    console.table(res.recordset);

    process.exit(0);
  } catch (err) {
    console.error('❌ Lỗi cập nhật tài khoản nhóm:', err.message);
    process.exit(1);
  }
}

updateTeamStudents();
