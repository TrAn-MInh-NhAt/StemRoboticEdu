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

// 1. GET /api/community/posts hoặc /api/thaoluan - Danh sách bài viết & Thảo luận (Đẩy bài mới lên đầu)
const getPostsHandler = async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        ndc.MaNoiDung, ndc.MaNoiDung AS MaThaoLuan, ndc.MaNguoiDung, ndc.MaDuAn, ndc.MaBaiNop,
        ndc.TieuDe, ndc.NoiDung, ndc.LoaiNoiDung, 
        ISNULL(ndc.LuotThich, ndc.SoLuotBinhChon) AS LuotThich,
        ndc.SoLuotBinhChon, ndc.TrangThai, 
        ndc.NgayDang, ndc.NgayDang AS NgayTao,
        nd.HoTen AS TenTacGia, nd.VaiTro AS VaiTroTacGia, nd.Email AS EmailTacGia,
        da.TenDuAn,
        bn.VideoVanHanh,
        (SELECT COUNT(*) FROM BinhLuanThaoLuan bl WHERE bl.MaThaoLuan = ndc.MaNoiDung) AS SoBinhLuan
      FROM NoiDungCongDong ndc
      JOIN NguoiDung nd ON ndc.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN DuAnBaiTap da ON ndc.MaDuAn = da.MaDuAn
      LEFT JOIN BaiNop bn ON ndc.MaBaiNop = bn.MaBaiNop
      WHERE ndc.TrangThai = N'Đã duyệt'
      ORDER BY ndc.NgayDang DESC, ndc.MaNoiDung DESC
    `);

    // Thực thi luồng DF-03: Tự động gắn cờ Top Trending cho các chủ đề có lượt thích/bình chọn cao
    const posts = result.recordset.map((p) => {
      const likes = p.LuotThich || p.SoLuotBinhChon || 0;
      const isTopTrending = (likes >= 20);
      return {
        ...p,
        LuotThich: likes,
        SoLuotBinhChon: likes,
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
};
router.get('/posts', getPostsHandler);
router.get('/', getPostsHandler);

// 2. POST /api/community/posts hoặc /api/thaoluan - Đăng bài viết / Thảo luận mới (TTCĐ.01)
const createPostHandler = async (req, res) => {
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
        INSERT INTO NoiDungCongDong (MaNguoiDung, MaDuAn, TieuDe, NoiDung, LoaiNoiDung, SoLuotBinhChon, LuotThich, TrangThai)
        OUTPUT INSERTED.MaNoiDung, INSERTED.NgayDang
        VALUES (@uid, @daId, @tieuDe, @noiDung, @loai, 1, 1, N'Đã duyệt')
      `);

    return res.json({
      success: true,
      message: 'Đăng chủ đề thảo luận thành công!',
      postId: result.recordset[0].MaNoiDung,
      MaThaoLuan: result.recordset[0].MaNoiDung,
      post: result.recordset[0]
    });
  } catch (err) {
    console.error('Lỗi đăng bài cộng đồng:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng bài' });
  }
};
router.post('/posts', createPostHandler);
router.post('/', createPostHandler);

// 3. POST /api/thaoluan/:id/like hoặc /api/community/posts/:id/vote - Thích bài viết
const likePostHandler = async (req, res) => {
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
        SET LuotThich = ISNULL(LuotThich, 0) + 1,
            SoLuotBinhChon = SoLuotBinhChon + 1
        OUTPUT INSERTED.LuotThich, INSERTED.SoLuotBinhChon
        WHERE MaNoiDung = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài viết' });
    }

    const newLikes = result.recordset[0].LuotThich;
    return res.json({
      success: true,
      message: 'Cảm ơn bạn đã thích bài viết!',
      likes: newLikes,
      votes: newLikes,
      isTopTrending: newLikes >= 20
    });
  } catch (err) {
    console.error('Lỗi like bài viết:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi thích bài viết' });
  }
};
router.post('/posts/:id/like', likePostHandler);
router.post('/:id/like', likePostHandler);
router.post('/posts/:id/vote', likePostHandler);
router.post('/:id/vote', likePostHandler);

// 3.1. POST /api/thaoluan/:id/comment hoặc /api/community/posts/:id/comment - Thêm bình luận
const commentPostHandler = async (req, res) => {
  const postId = parseInt(req.params.id);
  const { noiDung } = req.body;
  const userId = getUserId(req);

  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: 'Mã bài viết không hợp lệ' });
  }
  if (!noiDung || !noiDung.trim()) {
    return res.status(400).json({ success: false, message: 'Vui lòng nhập nội dung bình luận' });
  }

  try {
    const pool = getPool();
    const result = await pool.request()
      .input('maThaoLuan', sql.Int, postId)
      .input('uid', sql.Int, userId)
      .input('noiDung', sql.NVarChar, noiDung.trim())
      .query(`
        INSERT INTO BinhLuanThaoLuan (MaThaoLuan, MaNguoiDung, NoiDung, NgayTao)
        OUTPUT INSERTED.MaBinhLuan, INSERTED.NgayTao
        VALUES (@maThaoLuan, @uid, @noiDung, CURRENT_TIMESTAMP)
      `);

    const newId = result.recordset[0].MaBinhLuan;
    const userRes = await pool.request()
      .input('uid', sql.Int, userId)
      .query(`SELECT HoTen, VaiTro, Lop, Email FROM NguoiDung WHERE MaNguoiDung = @uid`);

    const author = userRes.recordset[0] || { HoTen: 'Học sinh', VaiTro: 'Học sinh', Lop: '10/1' };

    return res.json({
      success: true,
      message: 'Gửi bình luận thành công!',
      comment: {
        MaBinhLuan: newId,
        MaThaoLuan: postId,
        MaNguoiDung: userId,
        NoiDung: noiDung.trim(),
        NgayTao: result.recordset[0].NgayTao,
        TenNguoiBinhLuan: author.HoTen,
        VaiTro: author.VaiTro,
        Lop: author.Lop || '10/1'
      }
    });
  } catch (err) {
    console.error('Lỗi bình luận:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi đăng bình luận' });
  }
};
router.post('/posts/:id/comment', commentPostHandler);
router.post('/:id/comment', commentPostHandler);

// 3.2. GET /api/thaoluan/:id/comments hoặc /api/community/posts/:id/comments - Lấy danh sách bình luận
const getCommentsHandler = async (req, res) => {
  const postId = parseInt(req.params.id);
  if (isNaN(postId)) {
    return res.status(400).json({ success: false, message: 'Mã bài viết không hợp lệ' });
  }
  try {
    const pool = getPool();
    const result = await pool.request()
      .input('id', sql.Int, postId)
      .query(`
        SELECT 
          bl.MaBinhLuan, bl.MaThaoLuan, bl.MaNguoiDung, bl.NoiDung, bl.NgayTao,
          nd.HoTen AS TenNguoiBinhLuan, nd.VaiTro, nd.Lop, nd.Email
        FROM BinhLuanThaoLuan bl
        JOIN NguoiDung nd ON bl.MaNguoiDung = nd.MaNguoiDung
        WHERE bl.MaThaoLuan = @id
        ORDER BY bl.NgayTao ASC, bl.MaBinhLuan ASC
      `);

    return res.json({
      success: true,
      comments: result.recordset
    });
  } catch (err) {
    console.error('Lỗi lấy danh sách bình luận:', err.message);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bình luận' });
  }
};
router.get('/posts/:id/comments', getCommentsHandler);
router.get('/:id/comments', getCommentsHandler);

// Helper chuẩn hóa YouTube Video ID & Embed/Direct URL
function extractYoutubeId(url) {
  if (!url) return '';
  const match = url.match(/(?:youtu\.be\/|(?:youtube\.com|youtube-nocookie\.com)\/(?:watch\?.*v=|embed\/|v\/|shorts\/))([a-zA-Z0-9_-]{11})/i);
  return (match && match[1]) ? match[1] : '';
}

function toYoutubeEmbed(url, defaultId = 'fJWR7dBuc18') {
  const id = extractYoutubeId(url) || defaultId;
  return `https://www.youtube.com/embed/${id}?rel=0`;
}

function toYoutubeDirect(url, defaultId = 'fJWR7dBuc18') {
  const id = extractYoutubeId(url) || defaultId;
  return `https://www.youtube.com/watch?v=${id}`;
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
          (
            SELECT COUNT(DISTINCT b2.MaDuAn)
            FROM BaiNop b2
            JOIN KetQuaDiem k2 ON b2.MaBaiNop = k2.MaBaiNop
            WHERE b2.MaNguoiDung = nd.MaNguoiDung
              AND (b2.TrangThai IN (N'Đã duyệt', N'Đã chốt điểm') OR k2.TongDiem >= 10.0 OR k2.KetQuaVideo = N'Đạt')
          ) AS SoDuAnHoanThanh,
          (
            SELECT COUNT(*) FROM DuAnBaiTap WHERE TrangThai != N'Đã đóng'
          ) AS TongSoDuAn,
          ROW_NUMBER() OVER (PARTITION BY bn.MaNguoiDung ORDER BY kq.TongDiem DESC, bn.MaBaiNop DESC) AS rn
        FROM BaiNop bn
        JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
        JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
        JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        WHERE nd.VaiTro = N'Học sinh' 
          AND nd.TrangThai = N'Đang hoạt động'
          AND kq.TongDiem IS NOT NULL 
          AND (kq.KetQuaVideo = N'Đạt' OR kq.TongDiem >= 8.0)
      )
      SELECT TOP 6 * FROM RankedFame WHERE rn = 1
      ORDER BY TongDiem DESC, DiemCode DESC, MaBaiNop DESC
    `);

    // Gắn cấp độ danh hiệu & tiến trình hoàn thành cho từng học sinh
    const wallOfFame = result.recordset.map((item, idx) => {
      const soDuAnHoanThanh = item.SoDuAnHoanThanh || 1;
      const tongSoDuAn = item.TongSoDuAn || 5;
      const tienTrinhPhanTram = Math.min(100, Math.round((soDuAnHoanThanh / Math.max(1, tongSoDuAn)) * 100));
      const soDuAnDat = `${soDuAnHoanThanh}/${tongSoDuAn} Dự án`;

      const diem = parseFloat(item.TongDiem) || 0;
      let danhHieu = 'Thành Viên Tích Cực';
      if (diem >= 10.0 && soDuAnHoanThanh >= 2) {
        danhHieu = 'Bậc Thầy Robotics';
      } else if (diem >= 9.0) {
        danhHieu = 'Kỹ Sư Trẻ Tài Năng';
      } else if (diem >= 8.0) {
        danhHieu = 'Lập Trình Viên Khởi Sắc';
      }

      const ytId = extractYoutubeId(item.VideoVanHanh) || 'fJWR7dBuc18';
      return {
        ...item,
        Lop: item.Lop || '10/1',
        TruongHoc: item.TruongHoc || 'THPT Chuyên STEM',
        DanhHieu: danhHieu,
        TienTrinhPhanTram: tienTrinhPhanTram,
        SoDuAnDat: soDuAnDat,
        VideoId: ytId,
        EmbedUrl: `https://www.youtube.com/embed/${ytId}?rel=0`,
        DirectUrl: `https://www.youtube.com/watch?v=${ytId}`
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
