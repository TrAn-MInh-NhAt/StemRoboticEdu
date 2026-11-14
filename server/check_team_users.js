const { connectDB } = require('./config/db');

async function check() {
  const pool = await connectDB();
  const res = await pool.request().query("SELECT MaNguoiDung, HoTen, Email, VaiTro, TrangThai FROM NguoiDung WHERE VaiTro = N'Học sinh'");
  console.table(res.recordset);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
