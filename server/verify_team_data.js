const { connectDB } = require('./config/db');

async function testQuery() {
  const pool = await connectDB();
  const roadmaps = await pool.request().query('SELECT MaLoTrinh, TenLoTrinh, ThuTuHoc FROM KhoaHocLoTrinh ORDER BY ThuTuHoc ASC');
  console.log('--- ROADMAPS ---');
  console.table(roadmaps.recordset);

  const projects = await pool.request().query('SELECT MaDuAn, TenDuAn, MaLoTrinh, CapDo FROM DuAnBaiTap ORDER BY MaLoTrinh ASC, TenDuAn ASC');
  console.log('--- PROJECTS ---');
  console.table(projects.recordset);

  const fame = await pool.request().query(`
    SELECT TOP 5 nd.HoTen, da.TenDuAn, kq.TongDiem, kq.KetQuaVideo, ndc.SoLuotBinhChon
    FROM BaiNop bn
    JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
    JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
    JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
    LEFT JOIN NoiDungCongDong ndc ON bn.MaBaiNop = ndc.MaBaiNop
    ORDER BY kq.TongDiem DESC
  `);
  console.log('--- WALL OF FAME ---');
  console.table(fame.recordset);
  process.exit(0);
}
testQuery().catch(console.error);
