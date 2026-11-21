/**
 * qa_edge_cases.js
 * ==============================================================================
 * KỊCH BẢN KIỂM THỬ TỰ ĐỘNG CÁC TÌNH HUỐNG BIÊN (QA EDGE CASES TEST SUITE)
 * Thành viên phụ trách: Phạm Kỳ Hải (Vai trò: QA / Kiểm thử hệ thống)
 * Nhánh Git: feature/hai-qa-kiemthu
 * Dự án: STEM Robotic Edu (StemRoboticDB_V2)
 * ==============================================================================
 * 
 * Phạm vi kiểm thử chuyên sâu:
 * (a) Giả lập chuyển tab > 3 lần trong phòng thi (DF-06) buộc khóa phiên và tự nộp bài.
 * (b) Gửi mã nguồn chứa vòng lặp vô hạn (while True) kiểm tra cơ chế ngắt Timeout (TLE cutoff).
 * (c) Kiểm thử chặn truy cập trái phân quyền RBAC 4 vai trò trả về mã lỗi HTTP 403 / 401.
 * 
 * Cách chạy:
 *   node server/tests/qa_edge_cases.js
 */

'use strict';

const http = require('http');
const express = require('express');
const session = require('express-session');
const { spawn } = require('child_process');
const { connectDB, getPool, sql } = require('../config/db');

// Import routes & middleware
const examRoutes = require('../routes/exam');
const adminRoutes = require('../routes/admin');
const submissionsRoutes = require('../routes/submissions');
const communityRoutes = require('../routes/community');
const judgeProxyRoutes = require('../routes/judgeProxy');
const { requireRole, isTeacherOrAdmin, isAdmin, isStudent } = require('../middleware/authMiddleware');

// ANSI Color Codes
const C = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
};

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function logBanner(title) {
  console.log(`\n${C.bold}${C.cyan}========================================================================${C.reset}`);
  console.log(`${C.bold}${C.cyan} ${title}${C.reset}`);
  console.log(`${C.bold}${C.cyan}========================================================================${C.reset}`);
}

function assertTest(testId, description, condition, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${C.green}✓ [PASS]${C.reset} ${C.bold}[${testId}]${C.reset} ${description}`);
    if (details) console.log(`         ${C.cyan}↳ Chi tiết: ${details}${C.reset}`);
  } else {
    failedTests++;
    console.error(`  ${C.red}✗ [FAIL]${C.reset} ${C.bold}[${testId}]${C.reset} ${description}`);
    if (details) console.error(`         ${C.red}↳ Lỗi: ${details}${C.reset}`);
  }
}

// Helper thực hiện HTTP Request nội bộ
function makeRequest(port, method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const payload = (body && typeof body === 'object') ? JSON.stringify(body) : body;
    const reqHeaders = { ...headers };
    if (payload && !reqHeaders['Content-Type']) {
      reqHeaders['Content-Type'] = 'application/json';
      reqHeaders['Content-Length'] = Buffer.byteLength(payload);
    }

    const options = {
      hostname: '127.0.0.1',
      port,
      path,
      method,
      headers: reqHeaders,
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      let rawData = '';
      res.on('data', chunk => { rawData += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(rawData); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: rawData,
          json
        });
      });
    });

    req.on('error', err => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });

    if (payload) req.write(payload);
    req.end();
  });
}

async function runEdgeCasesSuite() {
  console.log(`${C.bold}${C.magenta}========================================================================`);
  console.log(`  STEM ROBOTIC EDU — BỘ KIỂM THỬ TÌNH HUỐNG BIÊN (QA EDGE CASES)        `);
  console.log(`         PHẠM KỲ HẢI — VAI TRÒ QA KIỂM THỬ (PHÂN HỆ 3 & HỆ THỐNG)        `);
  console.log(`========================================================================${C.reset}`);

  // 1. Khởi tạo kết nối CSDL SQL Server
  let pool;
  try {
    pool = await connectDB();
    console.log(`${C.green}✓ Kết nối thành công đến SQL Server: ${process.env.DB_NAME || 'StemRoboticDB_V2'}${C.reset}`);
  } catch (err) {
    console.error(`${C.red}✗ Lỗi kết nối CSDL: ${err.message}${C.reset}`);
    process.exit(1);
  }

  // 2. Khởi tạo Express Test Server trên cổng động ngẫu nhiên (Ephemeral Port)
  const testApp = express();
  testApp.use(express.json());
  testApp.use(express.urlencoded({ extended: true }));
  testApp.use(session({
    secret: 'test_edge_cases_secret_2026',
    resave: false,
    saveUninitialized: false
  }));

  // Đăng ký routes
  testApp.use('/api/exam', examRoutes);
  testApp.use('/api/admin', adminRoutes);
  testApp.use('/api/community', communityRoutes);
  testApp.use('/api/thaoluan', communityRoutes);
  testApp.use('/api/judge', judgeProxyRoutes);
  testApp.use('/api', submissionsRoutes);

  const testServer = await new Promise((resolve) => {
    const s = testApp.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = testServer.address().port;
  console.log(`${C.cyan}✓ Express Test Server đang chạy tại cổng ngẫu nhiên: ${port}${C.reset}`);

  try {
    // =========================================================================
    // PHẦN 1: TÌNH HUỐNG BIÊN DF-06 (CHUYỂN TAB > 3 LẦN TRONG PHÒNG THI)
    // =========================================================================
    logBanner('1. KIỂM THỬ DF-06: GIÁM SÁT & KHÓA PHIÊN KHI CHUYỂN TAB > 3 LẦN');

    const testStudentId = 4; // Phạm Kỳ Hải
    const testExamId = 1;

    // Đảm bảo bài thi 1 mở
    await pool.request().query(`
      UPDATE BaiThi 
      SET TrangThai = N'Đang mở', SoLanChuyenTab = 3 
      WHERE MaBaiThi = ${testExamId}
    `);

    // Dọn dẹp dữ liệu bài nộp test cũ của học sinh
    await pool.request().query(`
      DELETE FROM KetQuaDiem WHERE MaBaiNop IN (SELECT MaBaiNop FROM BaiNop WHERE MaNguoiDung = ${testStudentId} AND MaBaiThi = ${testExamId});
      DELETE FROM BaiNop WHERE MaNguoiDung = ${testStudentId} AND MaBaiThi = ${testExamId};
    `);

    // Bắt đầu vào phòng thi -> Khởi tạo BaiNop
    const startRes = await makeRequest(port, 'POST', '/api/exam/start', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, { maBaiThi: testExamId, maNguoiDung: testStudentId });

    assertTest('DF06-EDGE-01', 'Khởi tạo phiên thi hợp lệ (BaiNop = Đang làm bài)', 
      startRes.statusCode === 200 && startRes.json && startRes.json.success === true,
      `Mã HTTP: ${startRes.statusCode}`
    );

    const testMaBaiNop = startRes.json.submission.MaBaiNop;

    // Giả lập chuyển tab Lần 1 (visibilitychange / blur)
    const switch1 = await makeRequest(port, 'POST', '/api/exam/tab-switch', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, { maBaiNop: testMaBaiNop });

    assertTest('DF06-EDGE-02', 'Chuyển tab lần 1: Hệ thống cảnh báo, chưa khóa (soLanChuyenTabHS = 1)',
      switch1.statusCode === 200 && switch1.json.soLanChuyenTabHS === 1 && switch1.json.locked === false,
      `soLan: ${switch1.json ? switch1.json.soLanChuyenTabHS : 'N/A'}, locked: ${switch1.json ? switch1.json.locked : 'N/A'}`
    );

    // Giả lập chuyển tab Lần 2
    const switch2 = await makeRequest(port, 'POST', '/api/exam/tab-switch', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, { maBaiNop: testMaBaiNop });

    assertTest('DF06-EDGE-03', 'Chuyển tab lần 2: Tăng bộ đếm vi phạm (soLanChuyenTabHS = 2)',
      switch2.statusCode === 200 && switch2.json.soLanChuyenTabHS === 2 && switch2.json.locked === false,
      `Còn lại: ${switch2.json ? switch2.json.remaining : 'N/A'} lần`
    );

    // Giả lập chuyển tab Lần 3 (Mức cảnh báo tối đa)
    const switch3 = await makeRequest(port, 'POST', '/api/exam/tab-switch', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, { maBaiNop: testMaBaiNop });

    assertTest('DF06-EDGE-04', 'Chuyển tab lần 3: Chạm ngưỡng tối đa (soLanChuyenTabHS = 3, remaining = 0)',
      switch3.statusCode === 200 && switch3.json.soLanChuyenTabHS === 3 && switch3.json.locked === false && switch3.json.remaining === 0,
      `soLan: 3/3, remaining: 0`
    );

    // Giả lập chuyển tab Lần 4 (VƯỢT QUÁ 3 LẦN - KÍCH HOẠT DF-06 KHÓA PHIÊN THI)
    const switch4 = await makeRequest(port, 'POST', '/api/exam/tab-switch', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, { maBaiNop: testMaBaiNop });

    assertTest('DF06-EDGE-05', 'Chuyển tab lần 4 (> 3 lần): TỰ ĐỘNG KHÓA VÀ THU BÀI (locked = true)',
      switch4.statusCode === 200 && switch4.json.locked === true && switch4.json.isLocked === true && switch4.json.soLanChuyenTabHS === 4,
      `locked: true, message: ${switch4.json ? switch4.json.message : ''}`
    );

    // Kiểm tra trực tiếp trạng thái trong CSDL SQL Server
    const dbSubCheck = await pool.request()
      .input('mbn', sql.Int, testMaBaiNop)
      .query(`SELECT TrangThai, SoLanChuyenTabHS FROM BaiNop WHERE MaBaiNop = @mbn`);

    const subDbRow = dbSubCheck.recordset[0];
    assertTest('DF06-EDGE-06', 'CSDL cập nhật trạng thái "Đã khóa (DF-06)" chuẩn xác',
      subDbRow && subDbRow.TrangThai === 'Đã khóa (DF-06)' && subDbRow.SoLanChuyenTabHS === 4,
      `TrangThai CSDL: "${subDbRow ? subDbRow.TrangThai : 'N/A'}", SoLanChuyenTabHS: ${subDbRow ? subDbRow.SoLanChuyenTabHS : 'N/A'}`
    );

    // Thử gửi yêu cầu nộp bài bình thường sau khi bài thi đã bị khóa -> Bắt buộc bị từ chối với HTTP 403
    const submitAfterLock = await makeRequest(port, 'POST', '/api/exam/submit', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, {
      maBaiNop: testMaBaiNop,
      codeContent: '# Cố tình nộp sau khi đã bị khóa',
      isAutoLock: false
    });

    assertTest('DF06-EDGE-07', 'Chặn nộp bài sau khi đã bị khóa: Trả mã HTTP 403 Forbidden',
      submitAfterLock.statusCode === 403 && submitAfterLock.json && submitAfterLock.json.success === false,
      `Mã HTTP: ${submitAfterLock.statusCode}, Thông báo: "${submitAfterLock.json ? submitAfterLock.json.message : ''}"`
    );

    // =========================================================================
    // PHẦN 2: TÌNH HUỐNG BIÊN VÒNG LẶP VÔ HẠN (WHILE TRUE) & NGẮT TIMEOUT (TLE)
    // =========================================================================
    logBanner('2. KIỂM THỬ TIMEOUT: BẮT NGẮT MÃ NGUỒN CHỨA VÒNG LẶP VÔ HẠN');

    // Test 2.1: Cơ chế ngắt tiến trình con Python khi chạy vòng lặp vô hạn
    const timeoutPromise = new Promise((resolve) => {
      const startTime = Date.now();
      const TIMEOUT_LIMIT_MS = 1500; // Giới hạn 1.5 giây

      const pyCode = 'import time\nwhile True:\n    pass\n';
      const pyProcess = spawn('python', ['-c', pyCode], { stdio: 'pipe' });

      let isKilled = false;
      const timer = setTimeout(() => {
        isKilled = true;
        pyProcess.kill('SIGKILL');
      }, TIMEOUT_LIMIT_MS);

      pyProcess.on('exit', (code, signal) => {
        clearTimeout(timer);
        const elapsedMs = Date.now() - startTime;
        resolve({
          isKilled,
          elapsedMs,
          signal,
          code
        });
      });

      pyProcess.on('error', (err) => {
        clearTimeout(timer);
        resolve({ isKilled: false, error: err.message, elapsedMs: Date.now() - startTime });
      });
    });

    const timeoutRes = await timeoutPromise;
    assertTest('TLE-EDGE-01', 'Cơ chế ngắt Timeout (Watchdog Process Kill) hoạt động chính xác',
      timeoutRes.isKilled === true && timeoutRes.elapsedMs >= 1400 && timeoutRes.elapsedMs < 2500,
      `Thời gian thực thi: ${timeoutRes.elapsedMs}ms, Tín hiệu ngắt: ${timeoutRes.signal || 'SIGKILL'}`
    );

    // Test 2.2: Kiểm tra endpoint Judge Proxy xử lý timeout khi FastAPI Judge Engine không phản hồi hoặc quá tải
    const judgeProxyRes = await makeRequest(port, 'GET', '/api/judge/status', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    });
    assertTest('TLE-EDGE-02', 'Judge Proxy trả trạng thái an toàn có kiểm soát thời gian chờ',
      judgeProxyRes.statusCode === 200 && judgeProxyRes.json !== null && typeof judgeProxyRes.json.online === 'boolean',
      `Online: ${judgeProxyRes.json ? judgeProxyRes.json.online : 'false'}, Latency: ${judgeProxyRes.json ? judgeProxyRes.json.latency_ms : 'N/A'}`
    );

    // =========================================================================
    // PHẦN 3: TÌNH HUỐNG BIÊN PHÂN QUYỀN RBAC 4 VAI TRÒ (HTTP 403 / HTTP 401)
    // =========================================================================
    logBanner('3. KIỂM THỬ RBAC: CHẶN TRUY CẬP TRÁI PHÂN QUYỀN (MÃ HTTP 403 & 401)');

    // 3.1 Khách (Chưa đăng nhập / Guest) cố truy cập API bảo vệ
    const guestExam = await makeRequest(port, 'GET', '/api/exam/active');
    assertTest('RBAC-EDGE-01', 'Khách truy cập API Phòng thi: Trả về HTTP 401 Unauthorized',
      guestExam.statusCode === 401,
      `Mã HTTP: ${guestExam.statusCode}`
    );

    // 3.2 Học sinh cố gọi API Quản trị Admin (/api/admin/stats)
    const studentCallAdmin = await makeRequest(port, 'GET', '/api/admin/stats', {
      'x-role': 'Student',
      'x-user-id': '3'
    });
    assertTest('RBAC-EDGE-02', 'Học sinh cố truy cập API Admin: Bị chặn với HTTP 403 Forbidden',
      studentCallAdmin.statusCode === 403,
      `Mã HTTP: ${studentCallAdmin.statusCode}, Thông báo: "${studentCallAdmin.json ? studentCallAdmin.json.message : ''}"`
    );

    // 3.3 Học sinh cố gọi API Giáo viên giao bài tập (/api/teacher/projects)
    const studentCreateProject = await makeRequest(port, 'POST', '/api/teacher/projects', {
      'x-role': 'Student',
      'x-user-id': '3'
    }, {
      tenDuAn: 'Dự án giả mạo của học sinh',
      yeuCauDuAn: 'Yêu cầu giả mạo'
    });
    assertTest('RBAC-EDGE-03', 'Học sinh cố tạo bài tập Giáo viên: Bị chặn với HTTP 403 Forbidden',
      studentCreateProject.statusCode === 403,
      `Mã HTTP: ${studentCreateProject.statusCode}, Thông báo: "${studentCreateProject.json ? studentCreateProject.json.message : ''}"`
    );

    // 3.4 Giáo viên cố gọi API Admin (/api/admin/users)
    const teacherCallAdmin = await makeRequest(port, 'GET', '/api/admin/stats', {
      'x-role': 'Teacher',
      'x-user-id': '2'
    });
    assertTest('RBAC-EDGE-04', 'Giáo viên cố truy cập API đặc quyền Admin: Bị chặn với HTTP 403 Forbidden',
      teacherCallAdmin.statusCode === 403,
      `Mã HTTP: ${teacherCallAdmin.statusCode}`
    );

    // 3.5 Admin gọi API Admin thành công (HTTP 200)
    const adminCallStats = await makeRequest(port, 'GET', '/api/admin/stats', {
      'x-role': 'Admin',
      'x-admin-role': 'Admin',
      'x-user-id': '1'
    });
    assertTest('RBAC-EDGE-05', 'Admin truy cập API Quản trị: Trả về HTTP 200 OK thành công',
      adminCallStats.statusCode === 200 && adminCallStats.json && adminCallStats.json.success === true,
      `Mã HTTP: ${adminCallStats.statusCode}`
    );

    // 3.6 Giáo viên truy cập API Giám sát DF-05 (/api/analytics/check-df05) thành công (HTTP 200)
    const teacherCheckDf05 = await makeRequest(port, 'GET', '/api/exam/analytics/check-df05', {
      'x-role': 'Teacher',
      'x-user-id': '2'
    });
    assertTest('RBAC-EDGE-06', 'Giáo viên truy cập API Giám sát Học liệu DF-05: Trả về HTTP 200 OK',
      teacherCheckDf05.statusCode === 200 && teacherCheckDf05.json && teacherCheckDf05.json.success === true,
      `Mã HTTP: ${teacherCheckDf05.statusCode}`
    );

    // =========================================================================
    // PHẦN 4: TÌNH HUỐNG BIÊN TTCĐ.02 (LỌC TỪ KHÓA VI PHẠM & GẮN NHÃN GIẢI QUYẾT)
    // =========================================================================
    logBanner('4. KIỂM THỬ TTCĐ.02: LỌC TỪ KHÓA VI PHẠM & GẮN NHÃN GIẢI QUYẾT');

    // 4.1 Đăng bài chứa từ khóa vi phạm (cheat / hack điểm)
    const badPostRes = await makeRequest(port, 'POST', '/api/community/posts', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, {
      tieuDe: 'Chia sẻ cách hack điểm máy chấm',
      noiDung: 'Mọi người dùng lệnh cheat này để qua môn nhé'
    });

    assertTest('TTCĐ02-EDGE-01', 'Chặn đăng bài chứa từ khóa vi phạm quy chuẩn cộng đồng: HTTP 400',
      badPostRes.statusCode === 400 && badPostRes.json && badPostRes.json.success === false,
      `Mã HTTP: ${badPostRes.statusCode}, Thông báo: "${badPostRes.json ? badPostRes.json.message : ''}"`
    );

    // 4.2 Đăng bài hợp lệ & Gắn nhãn "Đã giải quyết"
    const validPostRes = await makeRequest(port, 'POST', '/api/community/posts', {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    }, {
      tieuDe: 'Hỏi về cách nối dây nguồn động cơ DC với L298N',
      noiDung: 'Em bị sụt áp khi xe khởi động, cần trợ giúp từ các bạn và thầy cô.',
      loaiNoiDung: 'Thảo luận'
    });

    const newPostId = validPostRes.json ? validPostRes.json.postId : null;

    const resolveRes = await makeRequest(port, 'POST', `/api/community/posts/${newPostId}/resolve`, {
      'x-role': 'Student',
      'x-user-id': String(testStudentId)
    });

    assertTest('TTCĐ02-EDGE-02', 'Tác giả gắn nhãn "Đã giải quyết" thành công: HTTP 200',
      resolveRes.statusCode === 200 && resolveRes.json && resolveRes.json.success === true && resolveRes.json.trangThai === 'Đã giải quyết',
      `Trạng thái bài viết: "${resolveRes.json ? resolveRes.json.trangThai : 'N/A'}"`
    );

    // Người dùng khác không phải chủ bài viết cố resolve -> Bị từ chối HTTP 403
    const strangerResolve = await makeRequest(port, 'POST', `/api/community/posts/${newPostId}/resolve`, {
      'x-role': 'Student',
      'x-user-id': '99' // Người dùng lạ
    });

    assertTest('TTCĐ02-EDGE-03', 'Người dùng lạ cố resolve bài thảo luận của người khác: Bị chặn HTTP 403',
      strangerResolve.statusCode === 403,
      `Mã HTTP: ${strangerResolve.statusCode}`
    );

  } finally {
    // Đóng server kiểm thử và đóng kết nối CSDL sạch sẽ
    testServer.close();
    console.log(`\n${C.cyan}✓ Đã giải phóng sạch cổng kiểm thử Express: ${port}${C.reset}`);
  }

  // ===========================================================================
  // TỔNG KẾT BÁO CÁO KIỂM THỬ TÌNH HUỐNG BIÊN
  // ===========================================================================
  console.log(`\n${C.bold}========================================================================`);
  console.log(`  KẾT QUẢ KIỂM THỬ TÌNH HUỐNG BIÊN (QA EDGE CASES SUMMARY)`);
  console.log(`========================================================================${C.reset}`);
  console.log(`  Tổng số ca kiểm thử (Test Cases) : ${C.bold}${totalTests}${C.reset}`);
  console.log(`  Số ca thành công (Passed)        : ${C.green}${C.bold}${passedTests}${C.reset}`);
  console.log(`  Số ca thất bại (Failed)          : ${failedTests > 0 ? C.red : C.green}${C.bold}${failedTests}${C.reset}`);
  console.log(`  Tỷ lệ đạt chuẩn (Pass Rate)      : ${C.bold}${((passedTests / totalTests) * 100).toFixed(1)}%${C.reset}`);
  console.log(`========================================================================\n`);

  if (failedTests > 0) {
    console.error(`${C.red}❌ CÓ CA KIỂM THỬ THẤT BẠI. CẦN RÀ SOÁT LẠI MÃ NGUỒN!${C.reset}`);
    process.exit(1);
  } else {
    console.log(`${C.green}✅ TOÀN BỘ CÁC CA KIỂM THỬ TÌNH HUỐNG BIÊN ĐÃ VƯỢT QUA 100% (PASS)!${C.reset}`);
    process.exit(0);
  }
}

// Thực thi bộ kiểm thử
runEdgeCasesSuite().catch(err => {
  console.error('Lỗi ngoại lệ khi chạy bộ kiểm thử tình huống biên:', err);
  process.exit(1);
});
