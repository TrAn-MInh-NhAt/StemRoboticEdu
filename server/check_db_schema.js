const { connectDB } = require('./config/db');

async function check() {
  const pool = await connectDB();
  const tables = await pool.request().query("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_TYPE = 'BASE TABLE'");
  console.log('Tables:', tables.recordset.map(t => t.TABLE_NAME));
  
  const cols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'NguoiDung'");
  console.log('NguoiDung columns:', cols.recordset);

  const matCols = await pool.request().query("SELECT COLUMN_NAME, DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'HocLieu'");
  console.log('HocLieu columns:', matCols.recordset);
  
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
