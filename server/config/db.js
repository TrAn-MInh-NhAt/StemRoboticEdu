require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const isTrustedConnection = process.env.DB_TRUSTED_CONNECTION === 'true' || (!process.env.DB_USER && !process.env.DB_PASSWORD);
let sql;

if (isTrustedConnection) {
  try {
    sql = require('mssql/msnodesqlv8');
  } catch (err) {
    sql = require('mssql');
  }
} else {
  sql = require('mssql');
}

let pool = null;

async function connectDB() {
  if (pool) return pool;

  const serverRaw = process.env.DB_SERVER || 'localhost';
  const dbName = process.env.DB_NAME || 'StemRoboticDB_V2';
  const trustCert = process.env.DB_TRUST_CERT === 'true';
  const port = process.env.DB_PORT;

  if (isTrustedConnection) {
    let serverTarget = serverRaw;
    if (port) {
      const hostOnly = serverRaw.split('\\')[0];
      serverTarget = `${hostOnly},${port}`;
    }

    const connStr = `Driver={ODBC Driver 17 for SQL Server};Server=${serverTarget};Database=${dbName};Trusted_Connection=yes;TrustServerCertificate=${trustCert ? 'yes' : 'no'};`;

    try {
      pool = await sql.connect({
        connectionString: connStr,
        options: {
          trustServerCertificate: trustCert,
          enableArithAbort: true
        }
      });
      console.log(`[SQL Server] Connected successfully to ${dbName} via Windows Authentication (${serverTarget})`);
      return pool;
    } catch (err) {
      if (serverTarget !== serverRaw) {
        try {
          const fallbackConnStr = `Driver={ODBC Driver 17 for SQL Server};Server=${serverRaw};Database=${dbName};Trusted_Connection=yes;TrustServerCertificate=${trustCert ? 'yes' : 'no'};`;
          pool = await sql.connect({
            connectionString: fallbackConnStr,
            options: {
              trustServerCertificate: trustCert,
              enableArithAbort: true
            }
          });
          console.log(`[SQL Server] Connected successfully to ${dbName} via Windows Authentication (${serverRaw})`);
          return pool;
        } catch (fallbackErr) {
          console.error('[SQL Server] Fallback Windows Auth connection failed:', fallbackErr.message || fallbackErr);
        }
      }
      console.error('[SQL Server] Connection error (Windows Auth):', err.message || err);
      throw err;
    }
  } else {
    const config = {
      server: serverRaw,
      database: dbName,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      port: port ? parseInt(port, 10) : undefined,
      options: {
        trustServerCertificate: trustCert,
        enableArithAbort: true
      }
    };
    try {
      pool = await sql.connect(config);
      console.log(`[SQL Server] Connected successfully to ${dbName} via SQL Auth (${serverRaw})`);
      return pool;
    } catch (err) {
      console.error('[SQL Server] Connection error (SQL Auth):', err.message || err);
      throw err;
    }
  }
}

function getPool() {
  return pool;
}

module.exports = { connectDB, getPool, sql };
