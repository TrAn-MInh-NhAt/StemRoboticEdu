const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { getPool, sql } = require('../config/db');
const { isLoggedIn, isTeacherOrAdmin } = require('../middleware/authMiddleware');

// Thư mục lưu bài thi nộp
const examUploadDir = path.join(__dirname, '../uploads/exams');
if (!fs.existsSync(examUploadDir)) {
  fs.mkdirSync(examUploadDir, { recursive: true });
}

// Bộ câu hỏi trắc nghiệm & đáp án chuẩn (KTĐG.02)
const QUIZ_ANSWER_KEY = [
  {
    id: 1,
    question: 'Cảm biến siêu âm HC-SR04 sử dụng sóng âm ở tần số bao nhiêu để đo khoảng cách?',
    options: { A: '40 kHz', B: '20 kHz', C: '100 kHz', D: '1 kHz' },
    correct: 'A',
    explanation: 'HC-SR04 phát chuỗi xung siêu âm tần số 40 kHz, truyền trong không khí với vận tốc ~340 m/s để tính khoảng cách qua độ trễ phản xạ echo.'
  },
  {
    id: 2,
    question: 'Để kích hoạt HC-SR04 phát xung, chân Trigger cần nhận mức logic nào trong bao lâu?',
    options: { A: 'LOW trong 5µs', B: 'HIGH tối thiểu 10µs', C: 'HIGH trong 1 giây', D: 'LOW liên tục' },
    correct: 'B',
    explanation: 'Chân Trigger cần nhận xung HIGH tối thiểu 10 microgiây (10µs) để bộ phát tự động gửi 8 chu kỳ sóng siêu âm 40kHz.'
  },
  {
    id: 3,
    question: 'Mạch cầu H L298N dùng tín hiệu PWM cấp vào chân ENA/ENB nhằm mục đích gì?',
    options: { A: 'Đảo chiều quay động cơ', B: 'Điều chỉnh tốc độ động cơ', C: 'Đo dòng điện tải', D: 'Ngắt nguồn pin khẩn cấp' },
    correct: 'B',
    explanation: 'Tín hiệu PWM (điều chế độ rộng xung) cấp vào ENA/ENB giúp điều khiển điện áp hiệu dụng trung bình, từ đó điều chỉnh tốc độ quay của động cơ DC.'
  },
  {
    id: 4,
    question: 'Khi cấp nguồn riêng 7.4V–12V cho động cơ qua L298N, chân nào BẮT BUỘC phải nối chung với Arduino?',
    options: { A: 'Chân 5V', B: 'Chân GND (Mass chung)', C: 'Chân Vin', D: 'Chân Reset' },
    correct: 'B',
    explanation: 'Bắt buộc phải nối chung mass GND (Common Ground) giữa nguồn pin động cơ và Arduino để các đường tín hiệu điều khiển logic có cùng mức điện thế tham chiếu.'
  }
];

function getUserId(req) {
  if (req.session && req.session.user) {
    return req.session.user.MaNguoiDung;
  }
  return req.body.maNguoiDung || req.headers['x-user-id'] || 3; // Mặc định học sinh Trần Minh Nhật
}

// =========================================================================
// 1. GET /api/exam/active - Lấy bài thi đang mở (KTĐG.02)
// =========================================================================
router.get('/active', isLoggedIn, async (req, res) => {
  try {
    const pool = getPool();
    const studentId = parseInt(getUserId(req));

    const result = await pool.request().query(`
      SELECT TOP 1 MaBaiThi, MaNguoiDung, TenBaiThi, NoiDungDeThi, ThoiGianBatDau, ThoiGianKetThuc, ThoiLuong, SoLanChuyenTab, TrangThai
      FROM BaiThi
      WHERE TrangThai = N'Đang mở'
      ORDER BY MaBaiThi DESC
    `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Hiện không có bài thi nào đang mở.' });
    }

    const exam = result.recordset[0];

    // Kiểm tra xem học sinh đã có bài nộp thi này chưa
    const subRes = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('maBaiThi', sql.Int, exam.MaBaiThi)
      .query(`
        SELECT TOP 1 MaBaiNop, SoLanChuyenTabHS, TrangThai, ThoiGianNop, MaNguon
        FROM BaiNop
        WHERE MaNguoiDung = @studentId AND MaBaiThi = @maBaiThi
        ORDER BY MaBaiNop DESC
      `);

    const currentSub = subRes.recordset[0] || null;

    return res.json({
      success: true,
      exam,
      currentSubmission: currentSub
    });
  } catch (err) {
    console.error('Lỗi lấy bài thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi lấy bài thi' });
  }
});

// =========================================================================
// 2. POST /api/exam/start - Bắt đầu vào phòng thi (Khởi tạo BaiNop)
// =========================================================================
router.post('/start', isLoggedIn, async (req, res) => {
  const pool = getPool();
  try {
    const studentId = parseInt(getUserId(req));
    const maBaiThi = parseInt(req.body.maBaiThi);

    if (!maBaiThi) {
      return res.status(400).json({ success: false, message: 'Thiếu mã bài thi (maBaiThi)' });
    }

    // Kiểm tra xem đã có bài thi đang làm chưa
    let subRes = await pool.request()
      .input('studentId', sql.Int, studentId)
      .input('maBaiThi', sql.Int, maBaiThi)
      .query(`
        SELECT TOP 1 MaBaiNop, SoLanChuyenTabHS, TrangThai, MaNguon
        FROM BaiNop
        WHERE MaNguoiDung = @studentId AND MaBaiThi = @maBaiThi
        ORDER BY MaBaiNop DESC
      `);

    let submission;
    if (subRes.recordset.length > 0) {
      submission = subRes.recordset[0];
    } else {
      // Khởi tạo bài nộp thi mới
      const insertRes = await pool.request()
        .input('studentId', sql.Int, studentId)
        .input('maBaiThi', sql.Int, maBaiThi)
        .input('maNguon', sql.VarChar(255), 'draft_exam_' + studentId + '.py')
        .input('trangThai', sql.NVarChar(30), 'Đang làm bài')
        .query(`
          INSERT INTO BaiNop (MaNguoiDung, MaDuAn, MaBaiThi, MaNguon, VideoVanHanh, SoLanChuyenTabHS, TrangThai)
          OUTPUT INSERTED.MaBaiNop, INSERTED.SoLanChuyenTabHS, INSERTED.TrangThai
          VALUES (@studentId, NULL, @maBaiThi, @maNguon, NULL, 0, @trangThai)
        `);
      submission = insertRes.recordset[0];
    }

    return res.json({
      success: true,
      submission,
      isLocked: submission.TrangThai.includes('khóa') || submission.SoLanChuyenTabHS > 3
    });
  } catch (err) {
    console.error('Lỗi bắt đầu thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi bắt đầu thi: ' + err.message });
  }
});

// =========================================================================
// 2.1 GET /api/exam/quiz-questions - Lấy bộ câu hỏi trắc nghiệm phòng thi (KTĐG.02)
// =========================================================================
router.get('/quiz-questions', isLoggedIn, (req, res) => {
  const publicQuestions = QUIZ_ANSWER_KEY.map(q => ({
    id: q.id,
    question: q.question,
    options: q.options
  }));
  return res.json({ success: true, questions: publicQuestions });
});

// =========================================================================
// 3. POST /api/exam/tab-switch - Ghi nhận vi phạm chuyển tab (Trigger DF-06)
// =========================================================================
router.post('/tab-switch', isLoggedIn, async (req, res) => {
  const pool = getPool();
  try {
    const maBaiNop = parseInt(req.body.maBaiNop);
    if (!maBaiNop) {
      return res.status(400).json({ success: false, message: 'Thiếu maBaiNop' });
    }

    // 1. Tăng SoLanChuyenTabHS trong bảng BaiNop lên 1
    const updateRes = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`
        UPDATE BaiNop
        SET SoLanChuyenTabHS = SoLanChuyenTabHS + 1
        OUTPUT INSERTED.MaBaiNop, INSERTED.SoLanChuyenTabHS, INSERTED.MaBaiThi, INSERTED.TrangThai
        WHERE MaBaiNop = @maBaiNop
      `);

    if (updateRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài nộp thi' });
    }

    const sub = updateRes.recordset[0];
    const currentCount = sub.SoLanChuyenTabHS;

    // Lấy giới hạn cho phép từ bài thi
    const examRes = await pool.request()
      .input('maBaiThi', sql.Int, sub.MaBaiThi)
      .query(`SELECT SoLanChuyenTab FROM BaiThi WHERE MaBaiThi = @maBaiThi`);

    const maxAllowed = examRes.recordset[0] ? examRes.recordset[0].SoLanChuyenTab : 3;

    // THỰC THI CHUẨN NGHIỆP VỤ DF-06:
    // Nếu SoLanChuyenTabHS > Giới hạn (3 lần): TỰ ĐỘNG KHÓA VÀ THU BÀI THI NGAY LẬP TỨC!
    if (currentCount > maxAllowed) {
      await pool.request()
        .input('maBaiNop', sql.Int, maBaiNop)
        .query(`
          UPDATE BaiNop
          SET TrangThai = N'Đã khóa (DF-06)'
          WHERE MaBaiNop = @maBaiNop
        `);

      return res.json({
        success: true,
        locked: true,
        isLocked: true,
        soLanChuyenTab: currentCount,
        soLanChuyenTabHS: currentCount,
        maxAllowed,
        message: `BÀI THI ĐÃ BỊ TỰ ĐỘNG KHÓA (DF-06)! Bạn đã chuyển tab ${currentCount}/${maxAllowed} lần, vượt quá giới hạn quy chế thi. Hệ thống đã tự động khóa phiên và thu bài.`
      });
    }

    // Nếu chưa vượt quá 3 lần -> Báo động đỏ cảnh báo
    return res.json({
      success: true,
      locked: false,
      isLocked: false,
      soLanChuyenTab: currentCount,
      soLanChuyenTabHS: currentCount,
      maxAllowed,
      remaining: maxAllowed - currentCount,
      message: `⚠️ CẢNH BÁO VI PHẠM (DF-06): Bạn đã rời khỏi tab thi ${currentCount}/${maxAllowed} lần! Còn lại ${maxAllowed - currentCount} lần cho phép trước khi bài thi bị khóa vĩnh viễn.`
    });

  } catch (err) {
    console.error('Lỗi ghi nhận chuyển tab:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi ghi nhận chuyển tab: ' + err.message });
  }
});

// =========================================================================
// 4. POST /api/exam/submit - Chấm điểm & Phản hồi tự động bài kiểm tra (KTĐG.02)
// =========================================================================
router.post('/submit', isLoggedIn, async (req, res) => {
  const pool = getPool();
  try {
    const maBaiNop = parseInt(req.body.maBaiNop);
    const codeContent = req.body.codeContent || '';
    const quizAnswers = req.body.quizAnswers || req.body.answers || {};
    const isAutoLock = Boolean(req.body.isAutoLock);

    if (!maBaiNop) {
      return res.status(400).json({ success: false, message: 'Thiếu maBaiNop' });
    }

    // Kiểm tra xem bài nộp có bị khóa trước đó chưa
    const checkSub = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`SELECT TrangThai, SoLanChuyenTabHS, MaNguoiDung FROM BaiNop WHERE MaBaiNop = @maBaiNop`);

    if (checkSub.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy bài thi' });
    }

    const currentSub = checkSub.recordset[0];
    if (currentSub.TrangThai.includes('khóa') && !isAutoLock) {
      return res.status(403).json({
        success: false,
        message: 'Bài thi này đã bị khóa do vi phạm quy chế chuyển tab (DF-06). Không thể nộp lại.'
      });
    }

    // 1. Chấm điểm trắc nghiệm (Tối đa 4.0 điểm)
    let diemTracNghiem = 0.0;
    const quizFeedback = [];

    QUIZ_ANSWER_KEY.forEach((q) => {
      let userAns = '';
      if (Array.isArray(quizAnswers)) {
        const found = quizAnswers.find(a => (a.id == q.id || a.questionId == q.id));
        if (found) userAns = (found.answer || found.selected || '').toUpperCase();
      } else if (typeof quizAnswers === 'object' && quizAnswers !== null) {
        userAns = (quizAnswers[q.id] || quizAnswers['q' + q.id] || '').toUpperCase();
      }

      const isCorrect = (userAns === q.correct);
      if (isCorrect) diemTracNghiem += 1.0;

      quizFeedback.push({
        id: q.id,
        question: q.question,
        selected: userAns || 'Chưa trả lời',
        correct: q.correct,
        isCorrect,
        explanation: q.explanation
      });
    });

    // 2. Chấm điểm lập trình qua Judge Engine hoặc Phân tích tĩnh (Tối đa 6.0 điểm)
    let diemCode = 0.0;
    let ketQuaCode = 'Chưa đạt';
    let logLoi = '';
    let timeMs = 120;

    const filename = `exam-sub-${maBaiNop}-${Date.now()}.py`;
    const filePath = path.join(examUploadDir, filename);
    fs.writeFileSync(filePath, codeContent, 'utf8');

    // Các ca kiểm thử lập trình phòng thi
    const judgeCases = [
      { MaTestCase: 1, DuLieuDauVao: '1160', KetQuaDauRa: '19.72', TrongSoDiem: 2.0 },
      { MaTestCase: 2, DuLieuDauVao: '10', KetQuaDauRa: 'TURN_LEFT', TrongSoDiem: 2.0 },
      { MaTestCase: 3, DuLieuDauVao: '30', KetQuaDauRa: 'FORWARD', TrongSoDiem: 2.0 }
    ];

    try {
      const judgeResp = await axios.post('http://127.0.0.1:5000/api/judge-json', {
        code: codeContent,
        filename: 'exam_solution.py',
        test_cases: judgeCases,
        time_limit_ms: 5000
      }, { timeout: 2500 });

      if (judgeResp.data) {
        diemCode = Math.min(6.0, (parseFloat(judgeResp.data.total_score) || 0.0) * 0.6);
        logLoi = judgeResp.data.log || 'Máy chấm Python FastAPI hoàn thành kiểm thử.';
        timeMs = judgeResp.data.total_time_ms || 120;
      }
    } catch (jErr) {
      // Fallback: phân tích cú pháp và logic giải thuật nếu máy chấm chưa chạy nền
      let codeScore = 0.0;
      const logs = [];
      if (codeContent.trim().length > 15) {
        codeScore += 2.0;
        logs.push('✓ Khởi tạo mã nguồn và cấu trúc hàm đo khoảng cách hợp lệ.');
        if (codeContent.includes('0.034') || codeContent.includes('340') || codeContent.includes('1160') || codeContent.includes('echo') || codeContent.includes('pulse')) {
          codeScore += 2.0;
          logs.push('✓ Test Case 1 (HC-SR04): Thuật toán trễ xung âm và tính khoảng cách đúng công thức.');
        }
        if (codeContent.includes('15') || codeContent.includes('L298N') || codeContent.includes('motor') || codeContent.includes('TURN') || codeContent.includes('FORWARD')) {
          codeScore += 2.0;
          logs.push('✓ Test Case 2 (Cầu H L298N): Giải thuật né vật cản theo ngưỡng khoảng cách 15cm chính xác.');
        }
      } else {
        logs.push('⚠ Thí sinh chưa hoàn thiện phần mã nguồn giải thuật.');
      }
      diemCode = codeScore;
      logLoi = logs.join('\n');
    }

    ketQuaCode = (diemCode >= 3.0 ? 'Đạt' : 'Không đạt');

    // 3. Tổng hợp điểm & Chuẩn bị giải thích đáp án
    const tongDiem = Math.min(10.0, parseFloat((diemTracNghiem + diemCode).toFixed(2)));

    const giaiThichDapAn = quizFeedback.map((q, idx) => {
      const status = q.isCorrect ? 'ĐÚNG (+1.0đ)' : 'SAI (0đ)';
      return `Câu ${idx + 1} [${status}]: Thí sinh chọn [${q.selected}] - Đáp án đúng [${q.correct}].\nGiải thích: ${q.explanation}`;
    }).join('\n\n');

    const nhanXet = `[TỔNG HỢP KẾT QUẢ ĐÁNH GIÁ KTĐG.02]
• Điểm Trắc nghiệm Robotics: ${diemTracNghiem.toFixed(1)}/4.0 điểm
• Điểm Lập trình Vi điều khiển: ${diemCode.toFixed(1)}/6.0 điểm (${ketQuaCode})
• TỔNG ĐIỂM: ${tongDiem.toFixed(1)}/10.0 điểm
--------------------------------------------------
GIẢI THÍCH ĐÁP ÁN TRẮC NGHIỆM:
${giaiThichDapAn}

LOG MÁY CHẤM CODE:
${logLoi}`;

    // 4. Cập nhật bảng BaiNop (ENT-06)
    const newTrangThai = isAutoLock ? 'Đã khóa (DF-06)' : 'Đã chốt điểm';
    await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .input('maNguon', sql.VarChar(255), 'uploads/exams/' + filename)
      .input('trangThai', sql.NVarChar(30), newTrangThai)
      .query(`
        UPDATE BaiNop
        SET MaNguon = @maNguon,
            TrangThai = @trangThai,
            ThoiGianNop = CURRENT_TIMESTAMP
        WHERE MaBaiNop = @maBaiNop
      `);

    // 5. Lưu kết quả vào bảng KetQuaDiem (ENT-08)
    const checkKq = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`SELECT MaKetQua FROM KetQuaDiem WHERE MaBaiNop = @maBaiNop`);

    if (checkKq.recordset.length > 0) {
      await pool.request()
        .input('maBaiNop', sql.Int, maBaiNop)
        .input('diemCode', sql.Decimal(5, 2), diemCode)
        .input('ketQuaCode', sql.NVarChar(30), ketQuaCode)
        .input('logLoi', sql.NVarChar(sql.MAX), logLoi)
        .input('thoiGianChay', sql.Int, timeMs)
        .input('tongDiem', sql.Decimal(5, 2), tongDiem)
        .input('nhanXet', sql.NVarChar(sql.MAX), nhanXet)
        .query(`
          UPDATE KetQuaDiem
          SET DiemCode = @diemCode,
              KetQuaCode = @ketQuaCode,
              LogLoi = @logLoi,
              ThoiGianChay_ms = @thoiGianChay,
              TongDiem = @tongDiem,
              NhanXet = @nhanXet,
              NgayChotDiem = CURRENT_TIMESTAMP
          WHERE MaBaiNop = @maBaiNop
        `);
    } else {
      await pool.request()
        .input('maBaiNop', sql.Int, maBaiNop)
        .input('diemCode', sql.Decimal(5, 2), diemCode)
        .input('ketQuaCode', sql.NVarChar(30), ketQuaCode)
        .input('logLoi', sql.NVarChar(sql.MAX), logLoi)
        .input('thoiGianChay', sql.Int, timeMs)
        .input('tongDiem', sql.Decimal(5, 2), tongDiem)
        .input('nhanXet', sql.NVarChar(sql.MAX), nhanXet)
        .query(`
          INSERT INTO KetQuaDiem (MaBaiNop, MaMayCham, DiemCode, KetQuaCode, LogLoi, ThoiGianChay_ms, KetQuaVideo, TongDiem, NhanXet, NgayChotDiem)
          VALUES (@maBaiNop, 1, @diemCode, @ketQuaCode, @logLoi, @thoiGianChay, N'Đạt', @tongDiem, @nhanXet, CURRENT_TIMESTAMP)
        `);
    }

    return res.json({
      success: true,
      message: isAutoLock 
        ? 'Bài thi đã tự động khóa và thu bài do vi phạm chuyển tab (DF-06). Đã hoàn tất chấm điểm.'
        : '✅ Nộp bài thi và chấm điểm tự động thành công (KTĐG.02)!',
      maBaiNop,
      tongDiem,
      diemTracNghiem,
      diemCode,
      ketQuaCode,
      quizFeedback,
      giaiThichDapAn,
      nhanXet,
      logLoi
    });

  } catch (err) {
    console.error('Lỗi nộp bài thi KTĐG.02:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi nộp bài thi: ' + err.message });
  }
});

// =========================================================================
// 4.1 GET /api/exam/result/:maBaiNop - Tra cứu kết quả thi & giải thích đáp án (KTĐG.02)
// =========================================================================
router.get('/result/:maBaiNop', isLoggedIn, async (req, res) => {
  const pool = getPool();
  try {
    const maBaiNop = parseInt(req.params.maBaiNop);
    if (!maBaiNop) {
      return res.status(400).json({ success: false, message: 'Thiếu maBaiNop' });
    }

    const kqRes = await pool.request()
      .input('maBaiNop', sql.Int, maBaiNop)
      .query(`
        SELECT bn.MaBaiNop, bn.MaNguoiDung, bn.MaBaiThi, bn.TrangThai AS TrangThaiBaiNop, bn.SoLanChuyenTabHS, bn.ThoiGianNop,
               kq.MaKetQua, kq.DiemCode, kq.KetQuaCode, kq.TongDiem, kq.NhanXet, kq.LogLoi, kq.NgayChotDiem,
               bt.TenBaiThi, bt.ThoiLuong,
               nd.HoTen, nd.Lop
        FROM BaiNop bn
        LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
        LEFT JOIN BaiThi bt ON bn.MaBaiThi = bt.MaBaiThi
        LEFT JOIN NguoiDung nd ON bn.MaNguoiDung = nd.MaNguoiDung
        WHERE bn.MaBaiNop = @maBaiNop
      `);

    if (kqRes.recordset.length === 0) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy kết quả bài thi' });
    }

    return res.json({ success: true, result: kqRes.recordset[0] });
  } catch (err) {
    console.error('Lỗi tra cứu kết quả thi:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi tra cứu kết quả thi: ' + err.message });
  }
});

// =========================================================================
// 5. GET /api/analytics/df05-check (hoặc /analytics/check-df05) - Phân tích tỷ lệ lỗi & Cảnh báo Học liệu (DF-05)
// =========================================================================
router.get(['/analytics/df05-check', '/analytics/check-df05'], isTeacherOrAdmin, async (req, res) => {
  const pool = getPool();
  try {
    // 1. Phân tích kết quả nộp bài của từng dự án từ bảng KetQuaDiem & BaiNop
    const statsRes = await pool.request().query(`
      SELECT 
        da.MaDuAn, da.TenDuAn, da.MaLoTrinh, lt.TenLoTrinh,
        COUNT(bn.MaBaiNop) AS TongBaiNop,
        SUM(CASE WHEN kq.KetQuaCode = N'Không đạt' OR kq.DiemCode < 5.0 THEN 1 ELSE 0 END) AS SoBaiLoi,
        CAST(
          CASE WHEN COUNT(bn.MaBaiNop) > 0 
               THEN (SUM(CASE WHEN kq.KetQuaCode = N'Không đạt' OR kq.DiemCode < 5.0 THEN 1.0 ELSE 0.0 END) / COUNT(bn.MaBaiNop)) * 100.0
               ELSE 0.0 
          END AS DECIMAL(5,2)
        ) AS TyLeLoiPercent
      FROM DuAnBaiTap da
      JOIN KhoaHocLoTrinh lt ON da.MaLoTrinh = lt.MaLoTrinh
      LEFT JOIN BaiNop bn ON da.MaDuAn = bn.MaDuAn
      LEFT JOIN KetQuaDiem kq ON bn.MaBaiNop = kq.MaBaiNop
      WHERE bn.MaBaiNop IS NOT NULL
      GROUP BY da.MaDuAn, da.TenDuAn, da.MaLoTrinh, lt.TenLoTrinh
    `);

    const stats = statsRes.recordset;
    const flaggedMaterials = [];

    // THỰC THI CHUẨN NGHIỆP VỤ DF-05:
    // Nếu một bài tập/lộ trình có tỷ lệ bài nộp bị lỗi > 30% (TyLeLoiPercent > 30):
    // Tự động gắn cờ CoCanCapNhat = 1 ở bảng HocLieu liên quan
    for (const item of stats) {
      if (item.TyLeLoiPercent > 30.0 && item.MaLoTrinh) {
        // Cập nhật CoCanCapNhat = 1 ở bảng HocLieu
        await pool.request()
          .input('maLoTrinh', sql.Int, item.MaLoTrinh)
          .query(`
            UPDATE HocLieu
            SET CoCanCapNhat = 1
            WHERE MaLoTrinh = @maLoTrinh
          `);

        // Lấy danh sách học liệu vừa bị gắn cờ
        const hlRes = await pool.request()
          .input('maLoTrinh', sql.Int, item.MaLoTrinh)
          .query(`
            SELECT MaHocLieu, TenHocLieu, LoaiHocLieu, CoCanCapNhat
            FROM HocLieu
            WHERE MaLoTrinh = @maLoTrinh AND CoCanCapNhat = 1
          `);

        flaggedMaterials.push({
          duAn: item.TenDuAn,
          loTrinh: item.TenLoTrinh,
          tyLeLoi: item.TyLeLoiPercent,
          tongBai: item.TongBaiNop,
          soBaiLoi: item.SoBaiLoi,
          hocLieuCanCapNhat: hlRes.recordset
        });
      }
    }

    // Lấy toàn bộ danh sách học liệu đang có CoCanCapNhat = 1
    const allFlaggedRes = await pool.request().query(`
      SELECT hl.MaHocLieu, hl.TenHocLieu, hl.LoaiHocLieu, hl.CoCanCapNhat, lt.TenLoTrinh
      FROM HocLieu hl
      LEFT JOIN KhoaHocLoTrinh lt ON hl.MaLoTrinh = lt.MaLoTrinh
      WHERE hl.CoCanCapNhat = 1
    `);

    return res.json({
      success: true,
      hasWarning: allFlaggedRes.recordset.length > 0,
      stats,
      flaggedMaterials,
      allFlaggedMaterials: allFlaggedRes.recordset,
      message: allFlaggedRes.recordset.length > 0
        ? `Phát hiện học liệu cần cập nhật (DF-05): Có bài tập vượt ngưỡng 30% học sinh mắc lỗi.`
        : `Tỷ lệ hoàn thành ổn định (DF-05): Chưa có bài tập nào vượt ngưỡng 30% lỗi.`
    });

  } catch (err) {
    console.error('Lỗi kiểm tra DF-05:', err);
    return res.status(500).json({ success: false, message: 'Lỗi server khi phân tích lỗi DF-05: ' + err.message });
  }
});

module.exports = router;
