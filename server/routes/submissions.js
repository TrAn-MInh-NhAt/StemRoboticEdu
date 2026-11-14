const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const axios = require('axios');
const { getPool, sql } = require('../config/db');

// Cấu hình thư mục lưu file nộp bài
const uploadDir = path.join(__dirname, '../uploads/submissions');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'sub-' + uniqueSuffix + ext);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['.ino', '.cpp', '.py'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận các tệp mã nguồn (.ino, .cpp, .py)'));
    }
  }
});

// Helper lấy MaNguoiDung từ session hoặc request body/headers
function getStudentId(req) {
  if (req.session && req.session.user) {
    return req.session.user.MaNguoiDung;
  }
  return req.body.maNguoiDung || req.headers['x-user-id'] || null;
}

function getTeacherId(req) {
  if (req.session && req.session.user && req.session.user.VaiTro === 'Giáo viên') {
    return req.session.user.MaNguoiDung;
  }
  return req.body.maGiaoVien || req.headers['x-teacher-id'] || 2; // TS. Đặng Hùng Vĩ
}

// =========================================================================
// 1. GET /api/projects - Lấy danh sách dự án & kiểm tra khóa/mở khóa (DF-02)
// =========================================================================
router.get('/projects', async (req, res) => {
  try {
    const pool = getPool();
    const studentId = getStudentId(req) || 3; // Mặc định học sinh Trần Minh Nhật

    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT 
          da.MaDuAn, da.TenDuAn, da.YeuCauDuAn, da.NgayGiao, da.HanNop, da.CapDo, 
          da.TrangThai, da.MaDuAnTienQuyet,
          tq.TenDuAn AS TenDuAnTienQuyet,
          lt.TenLoTrinh,
          -- Kiểm tra bài nộp của học sinh đối với dự án này
          (
            SELECT TOP 1 bn.TrangThai 
            FROM BaiNop bn 
            WHERE bn.MaDuAn = da.MaDuAn AND bn.MaNguoiDung = @studentId 
            ORDER BY bn.MaBaiNop DESC
          ) AS TrangThaiBaiNopHienTai,
          (
            SELECT TOP 1 kq.TongDiem 
            FROM BaiNop bn 
            JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop 
            WHERE bn.MaDuAn = da.MaDuAn AND bn.MaNguoiDung = @studentId 
            ORDER BY bn.MaBaiNop DESC
          ) AS DiemHienTai
        FROM DuAnBaiTap da
        LEFT JOIN DuAnBaiTap tq ON da.MaDuAnTienQuyet = tq.MaDuAn
        LEFT JOIN KhoaHocLoTrinh lt ON da.MaLoTrinh = lt.MaLoTrinh
        ORDER BY da.MaDuAn ASC
      `);

    // Tính toán trạng thái Khóa / Mở khóa cho từng dự án dựa trên MaDuAnTienQuyet (DF-02)
    const projects = [];
    for (const project of result.recordset) {
      let isUnlocked = true;
      let unlockReason = 'Dự án cơ bản';

      if (project.MaDuAnTienQuyet) {
        // Kiểm tra xem học sinh đã có bài nộp đạt cho dự án tiên quyết chưa
        const checkPrereq = await pool.request()
          .input('prereqId', sql.Int, project.MaDuAnTienQuyet)
          .input('studentId', sql.Int, studentId)
          .query(`
            SELECT TOP 1 bn.MaBaiNop, bn.TrangThai, kq.KetQuaVideo, kq.KetQuaCode, kq.TongDiem
            FROM BaiNop bn
            JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
            WHERE bn.MaDuAn = @prereqId AND bn.MaNguoiDung = @studentId
              AND bn.TrangThai = N'Đã chốt điểm'
              AND (kq.KetQuaVideo = N'Đạt' OR kq.TongDiem >= 5.0)
            ORDER BY bn.MaBaiNop DESC
          `);

        if (checkPrereq.recordset.length === 0) {
          isUnlocked = false;
          unlockReason = `Yêu cầu hoàn thành và được chốt điểm Đạt ở '${project.TenDuAnTienQuyet}' (DF-02)`;
        } else {
          isUnlocked = true;
          unlockReason = `Đã mở khóa tự động nhờ hoàn thành '${project.TenDuAnTienQuyet}' (DF-02)`;
        }
      }

      projects.push({
        ...project,
        isUnlocked,
        unlockReason
      });
    }

    return res.json({ success: true, projects });
  } catch (err) {
    console.error('Lỗi lấy danh sách dự án:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy dự án' });
  }
});

// =========================================================================
// 2. POST /api/submissions - Học sinh nộp bài đa phương tiện (XLBN.01, DF-01, DF-04)
// =========================================================================
router.post('/submissions', upload.single('codeFile'), async (req, res) => {
  const pool = getPool();
  try {
    const maDuAn = parseInt(req.body.maDuAn);
    const videoUrl = (req.body.videoUrl || req.body.VideoVanHanh || '').trim();
    const maNguoiDung = parseInt(getStudentId(req));

    // RÀNG BUỘC NGHIỆP VỤ XLBN.01: Bắt buộc cả File Code VÀ Link Video
    if (!req.file || !videoUrl) {
      if (req.file) {
        // Xóa file tải lên nếu thiếu video
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return res.status(400).json({
        success: false,
        message: 'Lỗi nộp bài (XLBN.01): Bắt buộc phải tải lên File mã nguồn (.ino, .cpp, .py) VÀ nhập Link Video vận hành robot thực tế!'
      });
    }

    if (!maDuAn) {
      return res.status(400).json({ success: false, message: 'Thiếu mã dự án (maDuAn)' });
    }

    if (!maNguoiDung) {
      return res.status(401).json({ success: false, message: 'Chưa xác thực danh tính học sinh' });
    }

    // Kiểm tra dự án và điều kiện tiên quyết (DF-02)
    const projectRes = await pool.request()
      .input('maDuAn', sql.Int, maDuAn)
      .query(`SELECT MaDuAn, TenDuAn, MaDuAnTienQuyet, TrangThai FROM DuAnBaiTap WHERE MaDuAn = @maDuAn`);

    if (projectRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Dự án không tồn tại' });
    }

    const project = projectRes.recordset[0];
    if (project.MaDuAnTienQuyet) {
      const prereqCheck = await pool.request()
        .input('prereqId', sql.Int, project.MaDuAnTienQuyet)
        .input('studentId', sql.Int, maNguoiDung)
        .query(`
          SELECT TOP 1 bn.MaBaiNop 
          FROM BaiNop bn
          JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
          WHERE bn.MaDuAn = @prereqId AND bn.MaNguoiDung = @studentId
            AND bn.TrangThai = N'Đã chốt điểm'
            AND (kq.KetQuaVideo = N'Đạt' OR kq.TongDiem >= 5.0)
        `);

      if (prereqCheck.recordset.length === 0) {
        return res.status(403).json({
          success: false,
          message: 'Dự án này đang bị khóa. Bạn phải hoàn thành và được chốt điểm Đạt ở dự án tiên quyết trước (DF-02)!'
        });
      }
    }

    // 1. Lấy danh sách TestCase của Dự án từ SQL Server
    const tcRes = await pool.request()
      .input('maDuAn', sql.Int, maDuAn)
      .query(`
        SELECT MaTestCase, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi
        FROM TestCase
        WHERE MaDuAn = @maDuAn
      `);

    const testCases = tcRes.recordset;
    if (testCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Dự án này chưa có bộ TestCase kiểm thử từ giáo viên.'
      });
    }

    // 2. Lấy cấu hình máy chấm từ bảng MayCham (DiaChiAPI)
    const judgeRes = await pool.request().query(`
      SELECT TOP 1 MaMayCham, TenMayCham, DiaChiAPI, NgonNguHoTro 
      FROM MayCham 
      WHERE TrangThai = N'Đang hoạt động'
    `);

    const mayCham = judgeRes.recordset[0] || {
      MaMayCham: 1,
      DiaChiAPI: 'http://127.0.0.1:5000/api/judge'
    };

    // 3. Đọc mã nguồn và gọi Máy chấm tự động (Python FastAPI)
    const fileContent = fs.readFileSync(req.file.path, 'utf8');
    const judgeUrl = mayCham.DiaChiAPI.replace('localhost', '127.0.0.1') + '-json'; // endpoint judge-json

    let judgeResult;
    try {
      const resp = await axios.post(judgeUrl, {
        code: fileContent,
        filename: req.file.originalname,
        test_cases: testCases,
        time_limit_ms: 5000
      }, { timeout: 12000 });
      judgeResult = resp.data;
    } catch (jErr) {
      console.error('Lỗi kết nối máy chấm tự động:', jErr.message);
      return res.status(502).json({
        success: false,
        message: 'Không thể kết nối tới dịch vụ Máy chấm tự động (Judge Engine cổng 5000). Vui lòng đảm bảo judge engine đang chạy.'
      });
    }

    const diemCode = judgeResult.total_score || 0.0;
    const passedAll = Boolean(judgeResult.passed_all);
    const ketQuaCode = passedAll ? 'Đạt' : 'Không đạt';
    const logLoi = judgeResult.log || '';
    const totalTimeMs = judgeResult.total_time_ms || 0;

    // THỰC THI CHUẨN NGHIỆP VỤ DF-01:
    // Nếu Code đạt 100% TestCase -> Tự động chuyển trạng thái BaiNop sang N'Chờ duyệt Video' để hiển thị sang trang GV.
    // Nếu dưới 100% TestCase -> Giữ nguyên trạng thái N'Đang chấm' (hoặc N'Cần sửa code') để học sinh sửa và nộp lại.
    let trangThaiBaiNop = passedAll ? 'Chờ duyệt Video' : 'Đang chấm';

    // 4. Lưu bài nộp vào bảng BaiNop (ENT-06)
    const relativeFilePath = 'uploads/submissions/' + req.file.filename;
    const insertBaiNop = await pool.request()
      .input('maNguoiDung', sql.Int, maNguoiDung)
      .input('maDuAn', sql.Int, maDuAn)
      .input('maNguon', sql.VarChar(255), relativeFilePath)
      .input('videoVanHanh', sql.VarChar(255), videoUrl)
      .input('trangThai', sql.NVarChar(30), trangThaiBaiNop)
      .query(`
        INSERT INTO BaiNop (MaNguoiDung, MaDuAn, MaNguon, VideoVanHanh, TrangThai)
        OUTPUT INSERTED.MaBaiNop
        VALUES (@maNguoiDung, @maDuAn, @maNguon, @videoVanHanh, @trangThai)
      `);

    const maBaiNop = insertBaiNop.recordset[0].MaBaiNop;

    // 5. THỰC THI CHUẨN NGHIỆP VỤ DF-04: Lưu toàn bộ LogLoi vào bảng KetQuaDiem
    await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .input('maMayCham', sql.Int, mayCham.MaMayCham)
      .input('diemCode', sql.Decimal(5, 2), diemCode)
      .input('ketQuaCode', sql.NVarChar(30), ketQuaCode)
      .input('logLoi', sql.NVarChar(sql.MAX), logLoi)
      .input('thoiGianChay', sql.Int, totalTimeMs)
      .query(`
        INSERT INTO KetQuaDiem (MaBaiNop, MaMayCham, DiemCode, KetQuaCode, LogLoi, ThoiGianChay_ms)
        VALUES (@maBaiNop, @maMayCham, @diemCode, @ketQuaCode, @logLoi, @thoiGianChay)
      `);

    return res.json({
      success: true,
      maBaiNop,
      diemCode,
      ketQuaCode,
      passedAll,
      trangThai: trangThaiBaiNop,
      logLoi,
      message: passedAll 
        ? 'Mã nguồn đã vượt qua 100% Test Case. Trạng thái bài nộp đã tự động chuyển sang "Chờ duyệt Video" (DF-01).' 
        : `Code của bạn chưa vượt qua 100% Test Case (${diemCode}/10.0). Vui lòng xem Log lỗi và nộp lại.`
    });

  } catch (err) {
    console.error('Lỗi xử lý nộp bài:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài: ' + err.message });
  }
});

// =========================================================================
// 2.1 GET /api/submissions/my-history - Học sinh xem lịch sử bài nộp của mình (XLBN.01, KQBN.02)
// =========================================================================
router.get('/submissions/my-history', async (req, res) => {
  try {
    const pool = getPool();
    const studentId = parseInt(getStudentId(req));
    if (!studentId) {
      return res.status(401).json({ success: false, message: 'Vui lòng đăng nhập để xem lịch sử nộp bài' });
    }

    const result = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT 
          bn.MaBaiNop, bn.MaNguoiDung,
          da.MaDuAn, da.TenDuAn, da.CapDo,
          bn.MaNguon, bn.VideoVanHanh, bn.ThoiGianNop, bn.TrangThai,
          kq.DiemCode, kq.KetQuaCode, kq.LogLoi, kq.KetQuaVideo, kq.TongDiem, kq.NhanXet, kq.NgayChotDiem
        FROM BaiNop bn
        LEFT JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
        LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        WHERE bn.MaNguoiDung = @studentId
        ORDER BY bn.MaBaiNop DESC
      `);

    return res.json({ success: true, submissions: result.recordset });
  } catch (err) {
    console.error('Lỗi lấy lịch sử bài nộp:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lịch sử bài nộp' });
  }
});

// =========================================================================
// 3. GET /api/teacher/submissions - Giáo viên xem danh sách bài nộp (KQBN.01)
// =========================================================================
router.get('/teacher/submissions', async (req, res) => {
  try {
    const pool = getPool();
    const result = await pool.request().query(`
      SELECT 
        bn.MaBaiNop, bn.MaNguoiDung, nd.HoTen AS TenHocSinh, nd.Email,
        da.MaDuAn, da.TenDuAn, da.CapDo,
        bn.MaNguon, bn.VideoVanHanh, bn.ThoiGianNop, bn.TrangThai,
        kq.DiemCode, kq.KetQuaCode, kq.LogLoi, kq.KetQuaVideo, kq.TongDiem, kq.NhanXet, kq.NgayChotDiem
      FROM BaiNop bn
      JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
      LEFT JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
      LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      ORDER BY bn.MaBaiNop DESC
    `);

    return res.json({ success: true, submissions: result.recordset });
  } catch (err) {
    console.error('Lỗi lấy danh sách bài nộp:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bài nộp' });
  }
});

// =========================================================================
// 4. POST /api/teacher/grade - Giáo viên Duyệt Video & Chốt điểm (KQBN.02, DF-02)
// =========================================================================
router.post('/teacher/grade', async (req, res) => {
  const pool = getPool();
  try {
    const { maBaiNop, ketQuaVideo, tongDiem, nhanXet } = req.body;
    const maGiaoVien = parseInt(getTeacherId(req));

    if (!maBaiNop || !ketQuaVideo) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp đầy đủ maBaiNop và kết quả kiểm duyệt video (ketQuaVideo).'
      });
    }

    // 1. Kiểm tra bài nộp
    const bnRes = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`
        SELECT bn.MaBaiNop, bn.MaNguoiDung, bn.MaDuAn, bn.TrangThai, kq.DiemCode, kq.KetQuaCode
        FROM BaiNop bn
        LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        WHERE bn.MaBaiNop = @maBaiNop
      `);

    if (bnRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });
    }

    const sub = bnRes.recordset[0];
    const diemFinal = tongDiem !== undefined && tongDiem !== null 
      ? parseFloat(tongDiem) 
      : (sub.DiemCode !== null ? parseFloat(sub.DiemCode) : 10.0);

    // 2. Cập nhật KetQuaDiem
    await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .input('maGiaoVien', sql.Int, maGiaoVien)
      .input('ketQuaVideo', sql.NVarChar(30), ketQuaVideo)
      .input('tongDiem', sql.Decimal(5, 2), diemFinal)
      .input('nhanXet', sql.NVarChar(sql.MAX), nhanXet || 'Đạt yêu cầu mô hình thực tế.')
      .query(`
        UPDATE KetQuaDiem
        SET MaNguoiDung = @maGiaoVien,
            KetQuaVideo = @ketQuaVideo,
            TongDiem = @tongDiem,
            NhanXet = @nhanXet,
            NgayChotDiem = CURRENT_TIMESTAMP
        WHERE MaBaiNop = @maBaiNop
      `);

    // 3. Cập nhật trạng thái BaiNop thành N'Đã chốt điểm'
    await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`
        UPDATE BaiNop
        SET TrangThai = N'Đã chốt điểm'
        WHERE MaBaiNop = @maBaiNop
      `);

    // 4. THỰC THI CHUẨN NGHIỆP VỤ DF-02:
    // Khi Giáo viên chốt điểm Đạt tại KQBN.02, tự động mở khóa dự án nâng cao tiếp theo (MaDuAnTienQuyet) cho học sinh đó.
    let unlockedProjects = [];
    const isPass = (ketQuaVideo === 'Đạt' || ketQuaVideo === 'Pass') && diemFinal >= 5.0;

    if (isPass && sub.MaDuAn) {
      const nextProjectsRes = await pool.request()
        .input('maDuAnCurrent', sql.Int, sub.MaDuAn)
        .query(`
          SELECT MaDuAn, TenDuAn, CapDo 
          FROM DuAnBaiTap 
          WHERE MaDuAnTienQuyet = @maDuAnCurrent
        `);

      unlockedProjects = nextProjectsRes.recordset;
    }

    return res.json({
      success: true,
      message: '✅ Đã chốt điểm và lưu minh chứng thành công (KQBN.02)!',
      maBaiNop,
      tongDiem: diemFinal,
      ketQuaVideo,
      trangThai: 'Đã chốt điểm',
      df02_unlocked: isPass && unlockedProjects.length > 0,
      unlockedProjects: unlockedProjects.map(p => ({
        maDuAn: p.MaDuAn,
        tenDuAn: p.TenDuAn,
        capDo: p.CapDo
      }))
    });

  } catch (err) {
    console.error('Lỗi chốt điểm:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi chốt điểm: ' + err.message });
  }
});

// =========================================================================
// 5. GET /api/lotrinh - Lấy danh sách Lộ trình học kèm Dự án (MOD-02, MOD-03)
// =========================================================================
router.get('/lotrinh', async (req, res) => {
  try {
    const pool = getPool();
    const studentId = getStudentId(req) || 3;

    // Lấy tất cả lộ trình
    const ltRes = await pool.request().query(`
      SELECT MaLoTrinh, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa, TrangThai
      FROM KhoaHocLoTrinh
      WHERE TrangThai = N'Đang hoạt động'
      ORDER BY ThuTuHoc ASC
    `);

    // Lấy tất cả dự án kèm tiền quyết
    const daRes = await pool.request()
      .input('studentId', sql.Int, studentId)
      .query(`
        SELECT 
          da.MaDuAn, da.MaLoTrinh, da.TenDuAn, da.YeuCauDuAn, da.NgayGiao, da.HanNop, da.CapDo, 
          da.TrangThai, da.MaDuAnTienQuyet,
          tq.TenDuAn AS TenDuAnTienQuyet,
          (
            SELECT TOP 1 bn.TrangThai 
            FROM BaiNop bn 
            WHERE bn.MaDuAn = da.MaDuAn AND bn.MaNguoiDung = @studentId 
            ORDER BY bn.MaBaiNop DESC
          ) AS TrangThaiBaiNopHienTai,
          (
            SELECT TOP 1 kq.TongDiem 
            FROM BaiNop bn 
            JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop 
            WHERE bn.MaDuAn = da.MaDuAn AND bn.MaNguoiDung = @studentId 
            ORDER BY bn.MaBaiNop DESC
          ) AS DiemHienTai
        FROM DuAnBaiTap da
        LEFT JOIN DuAnBaiTap tq ON da.MaDuAnTienQuyet = tq.MaDuAn
        ORDER BY da.MaDuAn ASC
      `);

    // Gán cờ isUnlocked theo DF-02
    const projectsWithLock = [];
    for (const project of daRes.recordset) {
      let isUnlocked = true;
      let unlockReason = 'Dự án cơ bản';

      if (project.MaDuAnTienQuyet) {
        const checkPrereq = await pool.request()
          .input('prereqId', sql.Int, project.MaDuAnTienQuyet)
          .input('studentId', sql.Int, studentId)
          .query(`
            SELECT TOP 1 bn.MaBaiNop, bn.TrangThai, kq.KetQuaVideo, kq.KetQuaCode, kq.TongDiem
            FROM BaiNop bn
            JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
            WHERE bn.MaDuAn = @prereqId AND bn.MaNguoiDung = @studentId
              AND bn.TrangThai = N'Đã chốt điểm'
              AND (kq.KetQuaVideo = N'Đạt' OR kq.TongDiem >= 5.0)
            ORDER BY bn.MaBaiNop DESC
          `);

        if (checkPrereq.recordset.length === 0) {
          isUnlocked = false;
          unlockReason = `Yêu cầu đạt '${project.TenDuAnTienQuyet}' (DF-02)`;
        } else {
          isUnlocked = true;
          unlockReason = `Đã mở khóa qua '${project.TenDuAnTienQuyet}' (DF-02)`;
        }
      }

      projectsWithLock.push({ ...project, isUnlocked, unlockReason });
    }

    // Lấy học liệu đã xuất bản liên kết lộ trình (TCPP.01)
    const hlRes = await pool.request().query(`
      SELECT MaHocLieu, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai
      FROM HocLieu
      WHERE TrangThai = N'Xuất bản'
      ORDER BY MaHocLieu ASC
    `);

    // Ghép dự án và học liệu vào từng lộ trình
    const lotrinhList = ltRes.recordset.map(lt => {
      return {
        ...lt,
        duAnList: projectsWithLock.filter(da => da.MaLoTrinh === lt.MaLoTrinh),
        hocLieuList: hlRes.recordset.filter(hl => hl.MaLoTrinh === lt.MaLoTrinh)
      };
    });

    return res.json({ success: true, lotrinhList });
  } catch (err) {
    console.error('Lỗi lấy danh sách lộ trình:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy lộ trình' });
  }
});

// =========================================================================
// 6. POST /api/teacher/projects - Giáo viên giao dự án mới + TestCase (QLDA.01)
// =========================================================================
router.post('/teacher/projects', async (req, res) => {
  const pool = getPool();
  try {
    const { tenDuAn, maLoTrinh, maDuAnTienQuyet, yeuCauDuAn, hanNop, capDo, testCases } = req.body;
    const maGiaoVien = parseInt(getTeacherId(req));

    if (!tenDuAn || !yeuCauDuAn) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng nhập đầy đủ Tên dự án và Yêu cầu dự án.'
      });
    }

    const hanNopVal = hanNop ? new Date(hanNop) : new Date(Date.now() + 30 * 24 * 3600 * 1000);
    const capDoVal = capDo || 'Cơ bản';
    const maLoTrinhVal = maLoTrinh ? parseInt(maLoTrinh) : null;
    const maDuAnTienQuyetVal = maDuAnTienQuyet ? parseInt(maDuAnTienQuyet) : null;

    // 1. Tạo dự án trong DuAnBaiTap
    const insertProject = await pool.request()
      .input('maGiaoVien', sql.Int, maGiaoVien)
      .input('maLoTrinh', sql.Int, maLoTrinhVal)
      .input('maDuAnTienQuyet', sql.Int, maDuAnTienQuyetVal)
      .input('tenDuAn', sql.NVarChar(200), tenDuAn)
      .input('yeuCauDuAn', sql.NVarChar(sql.MAX), yeuCauDuAn)
      .input('hanNop', sql.DateTime, hanNopVal)
      .input('capDo', sql.NVarChar(50), capDoVal)
      .query(`
        INSERT INTO DuAnBaiTap (MaNguoiDung, MaLoTrinh, MaDuAnTienQuyet, TenDuAn, YeuCauDuAn, HanNop, CapDo, TrangThai)
        OUTPUT INSERTED.MaDuAn
        VALUES (@maGiaoVien, @maLoTrinh, @maDuAnTienQuyet, @tenDuAn, @yeuCauDuAn, @hanNop, @capDo, N'Đang mở')
      `);

    const newMaDuAn = insertProject.recordset[0].MaDuAn;

    // 2. Thêm danh sách TestCase nếu có
    if (Array.isArray(testCases) && testCases.length > 0) {
      for (const tc of testCases) {
        if (tc.expectedOutput) {
          await pool.request()
            .input('maDuAn', sql.Int, newMaDuAn)
            .input('input', sql.NVarChar(sql.MAX), tc.input || '')
            .input('output', sql.NVarChar(sql.MAX), tc.expectedOutput)
            .input('weight', sql.Decimal(5, 2), tc.weight || 1.0)
            .input('hint', sql.NVarChar(sql.MAX), tc.hint || '')
            .query(`
              INSERT INTO TestCase (MaDuAn, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi)
              VALUES (@maDuAn, @input, @output, @weight, @hint)
            `);
        }
      }
    }

    return res.json({
      success: true,
      message: '✅ Đã giao dự án thực hành và khởi tạo bộ TestCase thành công (QLDA.01)!',
      maDuAn: newMaDuAn,
      tenDuAn
    });

  } catch (err) {
    console.error('Lỗi giao dự án:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi giao dự án: ' + err.message });
  }
});

// =========================================================================
// 7. GET /api/submissions/:id - Xem chi tiết bài nộp & LogLoi (DF-04)
// =========================================================================
router.get('/submissions/:id', async (req, res) => {
  try {
    const pool = getPool();
    const id = parseInt(req.params.id);

    const result = await pool.request()
      .input('id', sql.Int, id)
      .query(`
        SELECT 
          bn.MaBaiNop, bn.MaNguoiDung, nd.HoTen AS TenHocSinh, nd.Email,
          da.MaDuAn, da.TenDuAn, da.CapDo,
          bn.MaNguon, bn.VideoVanHanh, bn.ThoiGianNop, bn.TrangThai,
          kq.DiemCode, kq.KetQuaCode, kq.LogLoi, kq.ThoiGianChay_ms,
          kq.KetQuaVideo, kq.TongDiem, kq.NhanXet, kq.NgayChotDiem,
          mc.TenMayCham, mc.DiaChiAPI
        FROM BaiNop bn
        JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
        LEFT JOIN DuAnBaiTap da ON bn.MaDuAn = da.MaDuAn
        LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        LEFT JOIN MayCham mc ON kq.MaMayCham = mc.MaMayCham
        WHERE bn.MaBaiNop = @id
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp' });
    }

    return res.json({ success: true, submission: result.recordset[0] });
  } catch (err) {
    console.error('Lỗi lấy chi tiết bài nộp:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy chi tiết bài nộp' });
  }
});

module.exports = router;
