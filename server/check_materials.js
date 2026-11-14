const { connectDB } = require('./config/db');

async function check() {
  const pool = await connectDB();
  const materials = await pool.request().query("SELECT MaHocLieu, TenHocLieu, LoaiHocLieu, MaLoTrinh, DuongDanTep FROM HocLieu");
  console.table(materials.recordset);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
