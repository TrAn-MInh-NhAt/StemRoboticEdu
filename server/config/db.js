require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const sql = require('mssql');

const config = {
  server: process.env.DB_SERVER,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    trustServerCertificate: process.env.DB_TRUST_CERT === 'true',
    enableArithAbort: true
  }
};

let pool;

async function connectDB() {
  pool = await sql.connect(config);
  return pool;
}

function getPool() {
  return pool;
}

module.exports = { connectDB, getPool, sql };
