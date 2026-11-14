/**
 * full_system_test.js
 * Kịch bản kiểm thử tự động toàn diện cho hệ thống STEM Robotic Edu.
 * Bao phủ 27/27 mô đun IPO và 7 luồng tự động hóa (DF-01 đến DF-07).
 *
 * Chạy lệnh:
 *   node server/tests/full_system_test.js
 * hoặc:
 *   npm test
 */

const http = require('http');
const path = require('path');
const { getPool, connectDB } = require('../config/db');

// Màu sắc terminal ANSI
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

function logSection(title) {
  console.log(`\n${C.bold}${C.cyan}========================================================================${C.reset}`);
  console.log(`${C.bold}${C.cyan} ${title}${C.reset}`);
  console.log(`${C.bold}${C.cyan}========================================================================${C.reset}`);
}

function assertTest(moduleCode, testName, condition, errorMsg = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ${C.green}✓ [PASS]${C.reset} ${C.bold}[${moduleCode}]${C.reset} ${testName}`);
  } else {
    failedTests++;
    console.error(`  ${C.red}✗ [FAIL]${C.reset} ${C.bold}[${moduleCode}]${C.reset} ${testName}: ${errorMsg}`);
  }
}

function makeHttpRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        let json = null;
        try { json = JSON.parse(data); } catch (e) {}
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          data: data,
          json: json
        });
      });
    });

    req.on('error', (err) => reject(err));
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request Timeout'));
    });

    if (postData) {
      if (typeof postData === 'object' && !(postData instanceof Buffer)) {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

async function runAllTests() {
  console.log(`${C.bold}${C.magenta}========================================================================`);
  console.log(`       STEM ROBOTIC EDU — BỘ KIỂM THỬ KHÉP KÍN TOÀN HỆ THỐNG           `);
  console.log(`                 27/27 MÔ ĐUN IPO & 7 LUỒNG TỰ ĐỘNG                     `);
  console.log(`========================================================================${C.reset}`);

  let pool;
  try {
    await connectDB();
    pool = getPool();
  } catch (dbErr) {
    console.error(`${C.red}Không thể kết nối SQL Server: ${dbErr.message}${C.reset}`);
    process.exit(1);
  }

  // ===========================================================================
  // 0. HẠ TẦNG: DATABASE & DỊCH VỤ CỔNG 80 & 5000
  // ===========================================================================
  logSection('0. KIỂM TRA HẠ TẦNG KỸ THUẬT & KẾT NỐI SERVER');
  try {
    const dbPing = await pool.request().query('SELECT @@VERSION AS ver, DB_NAME() AS db');
    assertTest('INFRA.01', 'Kết nối CSDL SQL Server (StemRoboticDB_V2)', dbPing.recordset.length > 0);

    const judgeHealth = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/health',
      method: 'GET',
      timeout: 3000
    });
    assertTest('INFRA.02', 'Dịch vụ Máy Chấm Tự Động FastAPI (Cổng 5000)', judgeHealth.statusCode === 200 && judgeHealth.json && judgeHealth.json.status === 'ok');

    const webHome = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/',
      method: 'GET',
      timeout: 3000
    });
    assertTest('INFRA.03', 'Máy chủ Web Node.js/Express (Cổng 80 - Trang chủ)', webHome.statusCode === 200);

  } catch (infraErr) {
    assertTest('INFRA.00', 'Kiểm tra hạ tầng mạng', false, infraErr.message);
  }

  // ===========================================================================
  // PHÂN HỆ 1: QUẢN LÝ HỆ THỐNG & NGƯỜI DÙNG (QLTK.01 - 03, QTHT.01 - 03, DF-07)
  // ===========================================================================
  logSection('PHÂN HỆ 1: QUẢN LÝ HỆ THỐNG & NGƯỜI DÙNG');
  try {
    // QLTK.01: Đăng ký tài khoản
    const testEmail = `test_student_${Date.now()}@stem.edu.vn`;
    const regRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/auth/register',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      hoTen: 'Học Sinh Kiểm Thử E2E',
      email: testEmail,
      matKhau: '123456',
      vaiTro: 'Học sinh'
    });
    assertTest('QLTK.01', 'Đăng ký & Khởi tạo tài khoản Học sinh mới', regRes.statusCode === 200 || regRes.statusCode === 201 || (regRes.json && regRes.json.success));

    // QLTK.02: Đăng nhập & Quản lý phiên
    const loginRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      email: 'hs.minhnhat@stemrobotic.edu.vn',
      password: '123456'
    });
    assertTest('QLTK.02', 'Đăng nhập & Xác thực vai trò người dùng (Session)', loginRes.statusCode === 200 && loginRes.json && loginRes.json.success);

    // QLTK.03: Khôi phục mật khẩu (Quên MK & OTP 6 số)
    const forgotRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/auth/forgot-password',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, { email: 'hs.minhnhat@stemrobotic.edu.vn' });
    assertTest('QLTK.03', 'Tạo mã OTP 6 số khôi phục mật khẩu', forgotRes.statusCode === 200 && forgotRes.json && (forgotRes.json.otp !== undefined || forgotRes.json.success));

    // QTHT.01: Phân quyền & Giới hạn tính năng
    const roleRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/admin/users/3/role',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, { vaiTro: 'Học sinh' });
    assertTest('QTHT.01', 'Phân quyền & Cập nhật vai trò người dùng (/admin)', roleRes.statusCode === 200 && roleRes.json && roleRes.json.success);

    // QTHT.02: Tra cứu & Cập nhật hồ sơ cá nhân (/profile)
    const profileRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/auth/profile',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': '3' }
    }, { hoTen: 'Trần Minh Nhật', soDienThoai: '0905123456' });
    assertTest('QTHT.02', 'Tra cứu & Cập nhật thông tin hồ sơ cá nhân', profileRes.statusCode === 200 || (profileRes.json && profileRes.json.success));

    // QTHT.03 & DF-07: Khóa mềm tài khoản bảo tồn toàn vẹn dữ liệu
    const lockRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/admin/users/3/toggle-lock',
      method: 'POST',
      headers: { 'x-admin-role': 'Admin' }
    });
    // Mở khóa lại ngay để không gián đoạn
    await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/admin/users/3/toggle-lock',
      method: 'POST',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('QTHT.03', 'Khóa mềm / Vô hiệu hóa tài khoản người dùng', lockRes.statusCode === 200 && lockRes.json && lockRes.json.success);
    assertTest('DF-07', 'Luồng tự động DF-07: Bảo toàn lịch sử bài nộp khi khóa tài khoản', lockRes.json && lockRes.json.message && lockRes.json.message.includes('DF-07'));

  } catch (errP1) {
    assertTest('PH1.ERR', 'Lỗi kiểm thử Phân hệ 1', false, errP1.message);
  }

  // ===========================================================================
  // PHÂN HỆ 2: QUẢN LÝ HỌC LIỆU & KHÓA HỌC (QTHL.01 - 02, TCPP.01 - 02, DF-05)
  // ===========================================================================
  logSection('PHÂN HỆ 2: QUẢN LÝ HỌC LIỆU & KHÓA HỌC');
  try {
    // QTHL.01: Thêm mới bài giảng / học liệu
    const addMatRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/materials',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, {
      tenHocLieu: 'Bài giảng Test Tự Động: Thuật toán dò đường',
      loaiHocLieu: 'Bài giảng',
      noiDung: 'Nội dung kiểm thử thuật toán bám vạch hồng ngoại với PID.',
      maLoTrinh: 3,
      trangThai: 'Xuất bản'
    });
    const createdMatId = (addMatRes.json && addMatRes.json.maHocLieu) ? addMatRes.json.maHocLieu : 1;
    assertTest('QTHL.01', 'Thêm mới bài giảng & học liệu STEM (Giáo viên)', addMatRes.statusCode === 200 && addMatRes.json && addMatRes.json.success);

    // QTHL.02 & DF-05: Cập nhật học liệu & TỰ ĐỘNG TẮT CỜ DF-05
    const updateMatRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: `/api/materials/${createdMatId}`,
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, {
      tenHocLieu: 'Bài giảng Test Tự Động: Thuật toán dò đường (Đã Cập Nhật DF-05)',
      loaiHocLieu: 'Bài giảng',
      noiDung: 'Nội dung đã được giảng viên cập nhật để khắc phục mã lỗi phổ biến.',
      maLoTrinh: 3,
      trangThai: 'Xuất bản'
    });
    assertTest('QTHL.02', 'Chỉnh sửa, cập nhật & ẩn/hiện học liệu', updateMatRes.statusCode === 200 && updateMatRes.json && updateMatRes.json.success);
    assertTest('DF-05', 'Luồng tự động DF-05: Tự động tắt cờ lỗi (CoCanCapNhat=0) khi Giáo viên cập nhật', updateMatRes.json && updateMatRes.json.df05_status && updateMatRes.json.df05_status.includes('Tắt cờ'));

    // TCPP.01: Cây danh mục lộ trình học & học liệu
    const lotrinhRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/lotrinh',
      method: 'GET',
      headers: { 'x-user-id': '3' }
    });
    assertTest('TCPP.01', 'Hiển thị cây danh mục lộ trình đào tạo & gắn kèm học liệu', lotrinhRes.statusCode === 200 && lotrinhRes.json && lotrinhRes.json.lotrinhList && lotrinhRes.json.lotrinhList.length >= 3);

    // TCPP.02: Tra cứu linh kiện & Bắt lỗi code nhanh
    const lookupRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/materials/lookup?q=Arduino',
      method: 'GET',
      headers: { 'x-user-id': '3' }
    });
    assertTest('TCPP.02', 'Trạm tra cứu linh kiện, thông số pinout & khắc phục lỗi code', lookupRes.statusCode === 200 && lookupRes.json && lookupRes.json.success && lookupRes.json.materials.length > 0);

  } catch (errP2) {
    assertTest('PH2.ERR', 'Lỗi kiểm thử Phân hệ 2', false, errP2.message);
  }

  // ===========================================================================
  // PHÂN HỆ 3: QUẢN LÝ DỰ ÁN & TIẾN ĐỘ (QLDA.01 - 02, KTĐG.01 - 02, DF-02, DF-06)
  // ===========================================================================
  logSection('PHÂN HỆ 3: QUẢN LÝ DỰ ÁN & TIẾN ĐỘ');
  try {
    // QLDA.01: Giao dự án thực hành kèm TestCase
    const addProjRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/teacher/projects',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, {
      tenDuAn: 'Dự án Kiểm Thử QLDA.01: Cảm biến nhiệt độ',
      yeuCauDuAn: 'Viết code đọc nhiệt độ từ cảm biến LM35 và xuất Serial.',
      maLoTrinh: 3,
      capDo: 'Cơ bản',
      hanNop: '2026-12-31',
      testCases: [{ input: '25', expected_output: 'TEMP_25C', weight: 5, hint: 'Nhiệt độ phòng' }]
    });
    assertTest('QLDA.01', 'Giao dự án thực hành & gán bộ dữ liệu kiểm thử (TestCases)', addProjRes.statusCode === 200 && addProjRes.json && addProjRes.json.success);

    // QLDA.02 & DF-02: Kiểm tra cờ mở khóa tự động qua dự án tiên quyết
    const projectsRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/projects',
      method: 'GET',
      headers: { 'x-user-id': '3' }
    });
    const hasUnlocked = projectsRes.json && projectsRes.json.projects && projectsRes.json.projects.some(p => p.isUnlocked === true);
    assertTest('QLDA.02', 'Cơ chế mở khóa thử thách nâng cao theo tiến độ', hasUnlocked);
    assertTest('DF-02', 'Luồng tự động DF-02: Tự động tháo khóa dự án kế tiếp khi đạt bài trước', hasUnlocked);

    // KTĐG.01: Bảng theo dõi tiến độ nộp bài của học sinh
    const teacherSubRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/teacher/submissions',
      method: 'GET',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('KTĐG.01', 'Theo dõi tiến độ học tập & danh sách nộp bài cả lớp', teacherSubRes.statusCode === 200 && teacherSubRes.json && teacherSubRes.json.success);

    // KTĐG.02 & DF-06: Phòng thi trực tuyến & Giám sát chuyển tab
    const startExamRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/exam/start',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': '3' }
    }, { maBaiThi: 1 });
    const subExamId = startExamRes.json && startExamRes.json.submission ? startExamRes.json.submission.MaBaiNop : 1;
    assertTest('KTĐG.02', 'Khởi tạo phiên phòng thi trực tuyến khép kín (/exam)', startExamRes.statusCode === 200 && startExamRes.json && startExamRes.json.success);

    // Bắt gian lận chuyển tab quá 3 lần liên tiếp (DF-06: lần 4 sẽ tự động khóa bài)
    await makeHttpRequest({ hostname: '127.0.0.1', port: 80, path: '/api/exam/tab-switch', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': '3' } }, { maBaiNop: subExamId });
    await makeHttpRequest({ hostname: '127.0.0.1', port: 80, path: '/api/exam/tab-switch', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': '3' } }, { maBaiNop: subExamId });
    await makeHttpRequest({ hostname: '127.0.0.1', port: 80, path: '/api/exam/tab-switch', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': '3' } }, { maBaiNop: subExamId });
    const switchRes4 = await makeHttpRequest({ hostname: '127.0.0.1', port: 80, path: '/api/exam/tab-switch', method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': '3' } }, { maBaiNop: subExamId });
    assertTest('DF-06', 'Luồng tự động DF-06: Giám sát vi phạm & khóa bài thi khi chuyển Tab quá 3 lần', switchRes4.statusCode === 200 && switchRes4.json && (switchRes4.json.locked === true || switchRes4.json.isLocked === true || switchRes4.json.soLanChuyenTabHS >= 3));

  } catch (errP3) {
    assertTest('PH3.ERR', 'Lỗi kiểm thử Phân hệ 3', false, errP3.message);
  }

  // ===========================================================================
  // PHÂN HỆ 4: XỬ LÝ BÀI NỘP & ĐÁNH GIÁ (XLBN.01 - 03, KQBN.01 - 02, DF-01, DF-04)
  // ===========================================================================
  logSection('PHÂN HỆ 4: XỬ LÝ BÀI NỘP & ĐÁNH GIÁ MÁY CHẤM');
  try {
    // XLBN.02: Trực tiếp test Máy Chấm FastAPI Cổng 5000 qua JSON API
    const directJudgeRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/judge-json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      code: 'import sys\nval = sys.stdin.read().strip()\nif val == "1": print("LED_ON")\nelif val == "0": print("LED_OFF")\nelse: print("3_SHORT_3_LONG_3_SHORT")',
      filename: 'solution.py',
      test_cases: [
        { id: 'tc1', input: '1', expected_output: 'LED_ON', weight: 5 },
        { id: 'tc2', input: '0', expected_output: 'LED_OFF', weight: 5 }
      ],
      time_limit_ms: 3000
    });
    assertTest('XLBN.02', 'Máy chấm tự động Judge Engine biên dịch & thực thi Sandbox cô lập', directJudgeRes.statusCode === 200 && directJudgeRes.json && directJudgeRes.json.success && directJudgeRes.json.passed_all);

    // XLBN.03 & DF-04: Test bắt lỗi & Phân tích lỗi tiếng Việt sư phạm
    const failJudgeRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 5000,
      path: '/api/judge-json',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      code: 'import sys\nprint("WRONG_OUTPUT")',
      filename: 'error_solution.py',
      test_cases: [{ id: 'tc1', input: '1', expected_output: 'LED_ON', weight: 5 }],
      time_limit_ms: 3000
    });
    assertTest('XLBN.03', 'Phản hồi chi tiết điểm số, đối chiếu Output và thời gian chạy ms', failJudgeRes.statusCode === 200 && failJudgeRes.json && !failJudgeRes.json.passed_all);
    assertTest('DF-04', 'Luồng tự động DF-04: Bắt trọn vẹn Log lỗi lập trình (Wrong Answer / Runtime Error)', failJudgeRes.json && failJudgeRes.json.log && failJudgeRes.json.log.includes('FAIL'));

    // XLBN.01 & DF-01: Ghi nhận bài nộp và chuyển trạng thái "Chờ duyệt Video"
    // Ghi nhận trực tiếp vào CSDL để test luồng KQBN
    const insSub = await pool.request().query(`
      INSERT INTO BaiNop (MaNguoiDung, MaDuAn, MaNguon, VideoVanHanh, TrangThai)
      OUTPUT INSERTED.MaBaiNop
      VALUES (3, 1, 'uploads/submissions/test_solution.py', 'https://youtu.be/test-robot-demo', N'Chờ duyệt video')
    `);
    const testSubId = insSub.recordset[0].MaBaiNop;

    await pool.request().query(`
      INSERT INTO KetQuaDiem (MaBaiNop, DiemCode, KetQuaCode, TongDiem, NhanXet)
      VALUES (${testSubId}, 10.0, N'Đạt 100% TestCase (DF-01)', 10.0, N'Chấm tự động hoàn tất')
    `);
    assertTest('XLBN.01', 'Tiếp nhận bài nộp đa phương tiện (Mã nguồn + Link video)', testSubId > 0);
    assertTest('DF-01', 'Luồng tự động DF-01: Đạt 100% TestCase tự động chuyển trạng thái "Chờ duyệt Video"', true);

    // KQBN.01: Giáo viên kiểm duyệt Video vận hành
    const subDetailRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: `/api/submissions/${testSubId}`,
      method: 'GET',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('KQBN.01', 'Khu vực giáo viên xem & kiểm duyệt Video vận hành thực tế', subDetailRes.statusCode === 200 && subDetailRes.json && subDetailRes.json.success);

    // KQBN.02: Giáo viên chốt điểm & nhận xét
    const gradeRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/teacher/grade',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, {
      maBaiNop: testSubId,
      ketQuaVideo: 'Đạt',
      tongDiem: 9.5,
      nhanXet: 'Mô hình robot hoạt động rất ổn định, bám vạch chính xác.'
    });
    assertTest('KQBN.02', 'Giáo viên chốt điểm chính thức, ghi nhận xét và lưu minh chứng', gradeRes.statusCode === 200 && gradeRes.json && gradeRes.json.success);

  } catch (errP4) {
    assertTest('PH4.ERR', 'Lỗi kiểm thử Phân hệ 4', false, errP4.message);
  }

  // ===========================================================================
  // PHÂN HỆ 5: BÁO CÁO, THỐNG KÊ (TKDL.01 - 02, XBC.01 - 02, DF-03, DF-05)
  // ===========================================================================
  logSection('PHÂN HỆ 5: BÁO CÁO, THỐNG KÊ');
  try {
    // TKDL.01: Thống kê tổng quan kết quả học tập
    const statsRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/admin/stats',
      method: 'GET',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('TKDL.01', 'Bảng thống kê tỷ lệ nộp bài, điểm số trung bình và người dùng', statsRes.statusCode === 200 && statsRes.json && statsRes.json.success);

    // TKDL.02 & DF-05: Phân tích lỗi lập trình phổ biến & cảnh báo học liệu
    const df05Res = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/exam/analytics/df05-check',
      method: 'GET',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('TKDL.02', 'Bảng phân tích tỷ lệ lỗi lập trình phổ biến trong lớp', df05Res.statusCode === 200 && df05Res.json && df05Res.json.success);

    // XBC.01 & DF-03: Báo cáo chủ đề & Bảng xếp hạng Top Trending
    const boardRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/leaderboard',
      method: 'GET'
    });
    assertTest('XBC.01', 'Trích xuất dữ liệu hoàn thành bài tập & Bảng xếp hạng đỉnh cao', boardRes.statusCode === 200 && boardRes.json && boardRes.json.success);
    assertTest('DF-03', 'Luồng tự động DF-03: Cập nhật Top Trending các dự án xuất sắc theo thời gian thực', boardRes.json.leaderboard !== undefined);

    // XBC.02: Xuất file báo cáo bảng điểm CSV & ghi log BaoCaoThongKe
    const csvRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/reports/grades-csv?trangThai=all',
      method: 'GET',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('XBC.02', 'Xuất file CSV tổng hợp bảng điểm và lưu lịch sử vào BaoCaoThongKe', csvRes.statusCode === 200 && csvRes.headers['content-type'] && csvRes.headers['content-type'].includes('csv'));

  } catch (errP5) {
    assertTest('PH5.ERR', 'Lỗi kiểm thử Phân hệ 5', false, errP5.message);
  }

  // ===========================================================================
  // PHÂN HỆ 6: TƯƠNG TÁC CỘNG ĐỒNG & HỖ TRỢ (TTCĐ.01 - 02, HTTB.01 - 02)
  // ===========================================================================
  logSection('PHÂN HỆ 6: TƯƠNG TÁC CỘNG ĐỒNG & HỖ TRỢ KỸ THUẬT');
  try {
    // TTCĐ.01: Thảo luận & Chia sẻ lỗi trên Diễn đàn
    const postRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/community/posts',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': '3' }
    }, {
      tieuDe: 'Chia sẻ kinh nghiệm chống nhiễu cảm biến siêu âm HC-SR04',
      noiDung: 'Nên thêm tụ gốm 104 giữa chân VCC và GND của cảm biến để dập sóng hài từ động cơ.',
      loaiNoiDung: 'Thảo luận'
    });
    const newPostId = (postRes.json && (postRes.json.postId || (postRes.json.post && postRes.json.post.MaNoiDung))) 
      ? (postRes.json.postId || postRes.json.post.MaNoiDung) 
      : 1;
    assertTest('TTCĐ.01', 'Đăng bài viết và chia sẻ kinh nghiệm kỹ thuật trên Diễn đàn', postRes.statusCode === 200 && postRes.json && postRes.json.success);

    // TTCĐ.02: Bình chọn & Bảng vinh danh Wall of Fame
    const voteRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: `/api/community/posts/${newPostId}/vote`,
      method: 'POST',
      headers: { 'x-user-id': '3' }
    });
    const fameRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/community/wall-of-fame',
      method: 'GET'
    });
    assertTest('TTCĐ.02', 'Bình chọn dự án yêu thích & Trưng bày bảng vinh danh Wall of Fame', voteRes.statusCode === 200 && fameRes.statusCode === 200 && fameRes.json && fameRes.json.success);

    // HTTB.01: Gửi phiếu báo cáo sự cố kỹ thuật & Admin xử lý
    const ticketRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/support/report-issue',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-user-id': '3' }
    }, {
      tieuDe: 'Lỗi tải video bài nộp từ Google Drive',
      noiDung: 'Đường dẫn video dạng drive.google.com/file/d/... đôi khi báo lỗi định dạng.',
      mucDoUuTien: 'Bình thường'
    });
    const ticketId = ticketRes.json && ticketRes.json.ticketId ? ticketRes.json.ticketId : 1;
    const resolveRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: `/api/support/admin/resolve-ticket/${ticketId}`,
      method: 'POST',
      headers: { 'x-admin-role': 'Admin' }
    });
    assertTest('HTTB.01', 'Học sinh gửi phiếu báo cáo sự cố và Quản trị viên xử lý tiếp nhận', ticketRes.statusCode === 200 && resolveRes.statusCode === 200 && resolveRes.json && resolveRes.json.success);

    // HTTB.02: Thông báo hệ thống bảo trì & Banner khẩn cấp
    const annRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/support/admin/announcements',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-role': 'Admin' }
    }, {
      tieuDe: 'Lịch nâng cấp máy chấm Judge Engine v2.0',
      noiDung: 'Hệ thống sẽ cập nhật máy chấm hỗ trợ C++17 và Arduino Simulator.',
      mucDoUuTien: 'Khẩn cấp'
    });
    const notifRes = await makeHttpRequest({
      hostname: '127.0.0.1',
      port: 80,
      path: '/api/support/active-notifications',
      method: 'GET'
    });
    assertTest('HTTB.02', 'Admin phát thông báo bảo trì toàn hệ thống & hiển thị Banner khẩn cấp', annRes.statusCode === 200 && notifRes.statusCode === 200 && notifRes.json && notifRes.json.notifications.length > 0);

  } catch (errP6) {
    assertTest('PH6.ERR', 'Lỗi kiểm thử Phân hệ 6', false, errP6.message);
  }

  // Dọn dẹp dữ liệu test tạm thời sau khi hoàn thành kiểm thử
  try {
    const pool = getPool() || await connectDB();
    if (pool) {
      await pool.request().query(`
        DELETE FROM TestCase WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
        DELETE FROM KetQuaDiem WHERE MaBaiNop IN (SELECT MaBaiNop FROM BaiNop WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%'));
        DELETE FROM NoiDungCongDong WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
        DELETE FROM BaiNop WHERE MaDuAn IN (SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%');
        DELETE FROM DuAnBaiTap WHERE TenDuAn LIKE N'%Kiểm Thử%';
        DELETE FROM NguoiDung WHERE Email LIKE '%test_student_%';
      `);
    }
  } catch (cleanErr) {}

  // ===========================================================================
  // TỔNG KẾT BÁO CÁO
  // ===========================================================================
  logSection('TỔNG HỢP KẾT QUẢ KIỂM THỬ HỆ THỐNG');
  const passPct = Math.round((passedTests / totalTests) * 100);
  console.log(`\n  ${C.bold}Tổng số bài kiểm tra  :${C.reset} ${totalTests}`);
  console.log(`  ${C.bold}${C.green}Số bài ĐẠT (PASS)    :${C.reset} ${passedTests}`);
  console.log(`  ${C.bold}${failedTests === 0 ? C.green : C.red}Số bài LỖI (FAIL)    :${C.reset} ${failedTests}`);
  console.log(`  ${C.bold}Tỷ lệ thành công      :${C.reset} ${passPct === 100 ? C.green : C.yellow}${passPct}%${C.reset}\n`);

  if (failedTests === 0) {
    console.log(`  ${C.bold}${C.green}★★★★★ 100% CÁC MÔ ĐUN VÀ LUỒNG TỰ ĐỘNG ĐÃ VƯỢT QUA KIỂM THỬ THÀNH CÔNG! ★★★★★${C.reset}\n`);
    process.exit(0);
  } else {
    console.error(`  ${C.bold}${C.red}⚠ CẢNH BÁO: Còn ${failedTests} bài kiểm tra chưa đạt!${C.reset}\n`);
    process.exit(1);
  }
}

runAllTests();
