const express = require('express');
const router = express.Router();
const { getPool, sql } = require('../config/db');

// Helper lấy MaNguoiDung từ session hoặc header
function getUserId(req) {
  if (req.session && req.session.user) {
    return req.session.user.MaNguoiDung;
  }
  return req.headers['x-user-id'] || 3; // Fallback
}

// 1. GET /api/community/posts - Danh sách bài viết & Top Trending (DF-03)
router.get('/posts', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        ndc.MaNoiDung, ndc.MaNguoiDung, ndc.MaDuAn, ndc.MaBaiNop,
        ndc.TieuDe, ndc.NoiDung, ndc.LoaiNoiDung, ndc.SoLuotBinhChon, ndc.TrangThai, ndc.NgayDang,
        nd.HoTen AS TenTacGia, nd.VaiTro AS VaiTroTacGia, nd.Email AS EmailTacGia,
        da.TenDuAn,
        bn.VideoVanHanh
      FROM NoiDungCongDong ndc
      JOIN NguoiDung nd ON ndc.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN DuAnBaiTap da ON ndc.MaDuAn = da.MaDuAn
      LEFT JOIN BaiNop bn ON ndc.MaBaiNop = bn.MaBaiNop
      WHERE ndc.TrangThai = N'Đã duyệt'
      ORDER BY ndc.SoLuotBinhChon DESC, ndc.NgayDang DESC
    `);

    // Thực thi luồng DF-03: Tự động gắn cờ Top Trending cho các chủ đề có lượt bình chọn cao nhất
    const posts = result.recordset.map((p, idx) => {
      // Gắn cờ Top Trending cho top 3 bài viết có lượt vote >= 40
      const isTopTrending = (idx < 3 && p.SoLuotBinhChon >= 40);
      return {
        ...p,
        isTopTrending
      };
    });

    return res.json({
      success: true,
      posts
    });
  } catch (err) {
    console.error('Lỗi lấy bài viết cộng đồng:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bài viết cộng đồng' });
  }
});

// 2. POST /api/community/posts - Đăng bài viết / Thảo luận / Chia sẻ lỗi mới (TTCĐ.01)
router.post('/posts', async (req, res) => {
  const { tieuDe, noiDung, loaiNoiDung, maDuAn } = req.body;
  const userId = getUserId(req);

  if (!tieuDe || !noiDung) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập đầy đủ tiêu đề và nội dung' });
  }

  const loai = loaiNoiDung || 'Thảo luận';
  const duAnId = maDuAn ? parseInt(maDuAn) : null;

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('uid', sql.Int, userId)
      .input('daId', sql.Int, duAnId)
      .input('tieuDe', sql.NVarChar, tieuDe)
      .input('noiDung', sql.NVarChar, noiDung)
      .input('loai', sql.NVarChar, loai)
      .query(`
        INSERT INTO NoiDungCongDong (MaNguoiDung, MaDuAn, TieuDe, NoiDung, LoaiNoiDung, SoLuotBinhChon, TrangThai)
        OUTPUT INSERTED.MaNoiDung, INSERTED.NgayDang
        VALUES (@uid, @daId, @tieuDe, @noiDung, @loai, 1, N'Đã duyệt')
      `);

    return res.json({
      success: true,
      message: 'Đăng chủ đề thảo luận thành công!',
      postId: result.recordset[0].MaNoiDung,
      post: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi đăng bài cộng đồng:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng bài' });
  }
});

// 3. POST /api/community/posts/:id/vote - Bình chọn bài viết (Tăng SoLuotBinhChon)
router.post('/posts/:id/vote', async (req, res) => {
  const postId = parseInt(req.params.id);

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: 'Mã bài viết không hợp lệ' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, postId)
      .query(`
        UPDATE NoiDungCongDong
        SET SoLuotBinhChon = SoLuotBinhChon + 1
        OUTPUT INSERTED.SoLuotBinhChon
        WHERE MaNoiDung = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    const newVoteCount = result.recordset[0].SoLuotBinhChon;
    return res.json({
      success: true,
      message: 'Cảm ơn bạn đã bình chọn!',
      votes: newVoteCount,
      isTopTrending: newVoteCount >= 40
    });
  } catch (err) {
    console.error('Lỗi vote bài viết:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi bình chọn' });
  }
});

// Helper chuẩn hóa YouTube embed URL
function toYoutubeEmbed(url) {
  if (!url) return 'https://www.youtube-nocookie.com/embed/fJWR73zp1Pc';
  if (url.includes('youtube-nocookie.com/embed/')) return url;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube-nocookie.com/embed/${match[1]}`;
  }
  return 'https://www.youtube-nocookie.com/embed/fJWR73zp1Pc';
}

// 4. GET /api/community/wall-of-fame - Bảng vinh danh dự án xuất sắc (TTCĐ.02)
router.get('/wall-of-fame', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      WITH RankedFame AS (
        SELECT 
          bn.MaBaiNop, bn.VideoVanHanh, bn.ThoiGianNop,
          nd.MaNguoiDung, nd.HoTen AS TenHocSinh, nd.Email, nd.Lop, nd.TruongHoc,
          da.TenDuAn, da.CapDo,
          kq.TongDiem, kq.DiemCode, kq.KetQuaVideo, kq.NhanXet,
          (
            SELECT TOP 1 ndc.SoLuotBinhChon 
            FROM NoiDungCongDong ndc 
            WHERE ndc.MaBaiNop = bn.MaBaiNop 
            ORDER BY ndc.SoLuotBinhChon DESC
          ) AS SoLuotBinhChon,
          (
            SELECT TOP 1 ndc.NoiDung 
            FROM NoiDungCongDong ndc 
            WHERE ndc.MaBaiNop = bn.MaBaiNop 
            ORDER BY ndc.SoLuotBinhChon DESC
          ) AS LoiGioiThieu,
          ROW_NUMBER() OVER (PARTITION BY bn.MaNguoiDung ORDER BY kq.TongDiem DESC, bn.MaBaiNop DESC) AS rn
        FROM BaiNop bn
        JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
        JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
        JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        WHERE kq.TongDiem IS NOT NULL AND (kq.KetQuaVideo = N'Đạt' OR kq.TongDiem >= 8.0)
      )
      SELECT TOP 6 * FROM RankedFame WHERE rn = 1
      ORDER BY TongDiem DESC, DiemCode DESC, MaBaiNop DESC
    `);

    // Gắn cấp độ danh hiệu & tiến trình hoàn thành cho từng học sinh
    const wallOfFame = result.recordset.map((item, idx) => {
      let danhHieu = 'Thành Viên Tích Cực';
      let tienTrinhPhanTram = 60;
      let soDuAnDat = '3/5 Dự án';

      const diem = parseFloat(item.TongDiem) || 0;
      if (diem >= 10.0) {
        danhHieu = 'Bậc Thầy Robotics';
        tienTrinhPhanTram = 100;
        soDuAnDat = '5/5 Dự án';
      } else if (diem >= 9.0) {
        danhHieu = 'Kỹ Sư Trẻ Tài Năng';
        tienTrinhPhanTram = 80;
        soDuAnDat = '4/5 Dự án';
      } else if (diem >= 8.0) {
        danhHieu = 'Lập Trình Viên Khởi Sắc';
        tienTrinhPhanTram = 60;
        soDuAnDat = '3/5 Dự án';
      }

      return {
        ...item,
        Lop: item.Lop || '10/1',
        TruongHoc: item.TruongHoc || 'THPT Chuyên STEM',
        DanhHieu: danhHieu,
        TienTrinhPhanTram: tienTrinhPhanTram,
        SoDuAnDat: soDuAnDat,
        EmbedUrl: toYoutubeEmbed(item.VideoVanHanh)
      };
    });

    return res.json({
      success: true,
      wallOfFame
    });
  } catch (err) {
    console.error('Lỗi lấy Wall of Fame:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tải Bảng vinh danh' });
  }
});

module.exports = router;
