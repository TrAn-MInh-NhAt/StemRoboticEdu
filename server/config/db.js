require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mssql = require('mssql');

let pool;
let activeSql = mssql;

async function connectDB() {
  const server = process.env.DB_SERVER || 'localhost\\SQLEXPRESS';
  const database = process.env.DB_NAME || 'StemRoboticDB_V2';
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const trustCert = process.env.DB_TRUST_CERT === 'true';
  const isTrusted = process.env.DB_TRUSTED_CONNECTION === 'true';

  // 1. Kết nối qua msnodesqlv8 (Hỗ trợ Shared Memory / Windows Authentication và TDS khi SQL Server chạy local)
  if (isTrusted || !user || process.env.DB_DRIVER === 'msnodesqlv8') {
    try {
      const sqlV8 = require('mssql/msnodesqlv8');
      const connStr = process.env.DB_CONNECTION_STRING ||
        `Driver={ODBC Driver 18 for SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=${trustCert ? 'Yes' : 'No'};`;
      const p = new sqlV8.ConnectionPool({ connectionString: connStr });
      await p.connect();
      pool = p;
      activeSql = sqlV8;
      return pool;
    } catch (v8Err) {
      console.warn('⚠️ Kết nối msnodesqlv8 (Windows Auth) gặp lỗi, chuyển thử TDS:', v8Err.message);
    }
  }

  // 2. Thử kết nối qua TDS / Tedious (SQL Server Authentication)
  try {
    const config = {
      server: server,
      database: database,
      user: user,
      password: password,
      port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : undefined,
      connectionTimeout: 5000,
      options: {
        trustServerCertificate: trustCert,
        enableArithAbort: true
      }
    };
    pool = await mssql.connect(config);
    activeSql = mssql;
    return pool;
  } catch (tediousErr) {
    // 3. Fallback sang msnodesqlv8 nếu TDS thất bại
    console.warn('⚠️ Kết nối qua Tedious thất bại, tự động fallback sang msnodesqlv8...');
    const sqlV8 = require('mssql/msnodesqlv8');
    const connStr = `Driver={ODBC Driver 18 for SQL Server};Server=${server};Database=${database};Trusted_Connection=Yes;TrustServerCertificate=Yes;`;
    const p = new sqlV8.ConnectionPool({ connectionString: connStr });
    await p.connect();
    pool = p;
    activeSql = sqlV8;
    return pool;
  }
}

function getPool() {
  return pool;
}

module.exports = {
  connectDB,
  getPool,
  get sql() { return activeSql; }
};
