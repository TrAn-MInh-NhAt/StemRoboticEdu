const { connectDB } = require('./config/db');

async function check() {
  const pool = await connectDB();
  const subs = await pool.request().query(`
    SELECT bn.MaBaiNop, bn.MaNguoiDung, nd.HoTen, bn.MaDuAn, da.TenDuAn, bn.VideoVanHanh, kq.TongDiem, kq.KetQuaVideo
    FROM BaiNop bn
    JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
    JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
    LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
    WHERE kq.TongDiem IS NOT NULL
    ORDER BY kq.TongDiem DESC, bn.MaBaiNop DESC
  `);
  console.table(subs.recordset);
  process.exit(0);
}
check().catch(e => { console.error(e); process.exit(1); });
