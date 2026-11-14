/**
 * seed_full_curriculum.js
 * Seed dữ liệu giáo trình STEM Robotic vào StemRoboticDB_V2
 * Dùng MERGE / IF NOT EXISTS – an toàn khi chạy nhiều lần
 */

const path = require('path');
const sql = require(path.join(__dirname, 'node_modules', 'mssql'));

const config = {
  server: 'ADMIN-PC\\SQLEXPRESS',
  database: 'StemRoboticDB_V2',
  user: 'sa',
  password: '1',
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
  },
};

// ID người tạo mặc định (Admin = 1, từ seed data gốc)
const DEFAULT_NGUOI_DUNG = 1;

async function main() {
  let pool;
  try {
    console.log('⏳ Đang kết nối SQL Server...');
    pool = await sql.connect(config);
    console.log('✓ Kết nối thành công!\n');

    // ============================================================
    // 1. SEED LỘ TRÌNH (KhoaHocLoTrinh)
    // ============================================================
    const loTrinhs = [
      {
        id: 'LT01',
        TenLoTrinh: 'Cơ khí & Mạch điện tử Robot nền tảng',
        ChuDe: 'Mạch điện',
        CapDo: 'Cơ bản',
        ThuTuHoc: 1,
        MoTa: 'Lộ trình nền tảng về cơ khí và mạch điện tử cho Robot, bao gồm Arduino, linh kiện cơ bản và sơ đồ mạch.',
      },
      {
        id: 'LT02',
        TenLoTrinh: 'Lập trình Cảm biến & Robot tự hành tránh vật cản',
        ChuDe: 'Lập trình',
        CapDo: 'Trung bình',
        ThuTuHoc: 2,
        MoTa: 'Lập trình cảm biến siêu âm, động cơ DC và giải thuật điều hướng Robot tự hành tránh vật cản.',
      },
      {
        id: 'LT03',
        TenLoTrinh: 'Hệ thống Robot IoT & Thị giác máy tính AI',
        ChuDe: 'AI & IoT',
        CapDo: 'Nâng cao',
        ThuTuHoc: 3,
        MoTa: 'Tích hợp ESP32 kết nối IoT qua MQTT và ứng dụng thị giác máy tính với OpenCV & AI để nhận diện vật thể.',
      },
    ];

    const loTrinhIdMap = {}; // 'LT01' -> MaLoTrinh thực tế trong DB

    for (const lt of loTrinhs) {
      const check = await pool.request()
        .input('TenLoTrinh', sql.NVarChar(200), lt.TenLoTrinh)
        .query(`SELECT MaLoTrinh FROM KhoaHocLoTrinh WHERE TenLoTrinh = @TenLoTrinh`);

      if (check.recordset.length > 0) {
        loTrinhIdMap[lt.id] = check.recordset[0].MaLoTrinh;
        console.log(`→ Lộ trình "${lt.TenLoTrinh}" đã tồn tại, bỏ qua (MaLoTrinh=${loTrinhIdMap[lt.id]})`);
      } else {
        const insert = await pool.request()
          .input('MaNguoiTao', sql.Int, DEFAULT_NGUOI_DUNG)
          .input('TenLoTrinh', sql.NVarChar(200), lt.TenLoTrinh)
          .input('ChuDe', sql.NVarChar(100), lt.ChuDe)
          .input('CapDo', sql.NVarChar(50), lt.CapDo)
          .input('ThuTuHoc', sql.Int, lt.ThuTuHoc)
          .input('MoTa', sql.NVarChar(sql.MAX), lt.MoTa)
          .query(`
            INSERT INTO KhoaHocLoTrinh (MaNguoiTao, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa)
            OUTPUT INSERTED.MaLoTrinh
            VALUES (@MaNguoiTao, @TenLoTrinh, @ChuDe, @CapDo, @ThuTuHoc, @MoTa)
          `);
        loTrinhIdMap[lt.id] = insert.recordset[0].MaLoTrinh;
        console.log(`✓ Lộ trình "${lt.TenLoTrinh}" đã được thêm (MaLoTrinh=${loTrinhIdMap[lt.id]})`);
      }
    }

    // ============================================================
    // 2. SEED HỌC LIỆU (HocLieu)
    // ============================================================
    console.log('\n--- Học Liệu ---');
    const hocLieus = [
      {
        id: 'HL01',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenHocLieu: 'Giới thiệu Arduino Uno R3 – Pinout 14 chân số & 6 chân Analog',
        LoaiHocLieu: 'Bài giảng',
        NoiDung: 'Arduino Uno R3 là bo mạch vi điều khiển phổ biến nhất trong giáo dục STEM. Bo có 14 chân số (D0–D13), trong đó D3/D5/D6/D9/D10/D11 hỗ trợ PWM (~), 6 chân Analog (A0–A5), nguồn 5V/3.3V và GND. Chip ATmega328P hoạt động ở 16MHz, flash 32KB. Kết nối qua USB Type-B để nạp code.',
        DuongDanTep: null,
      },
      {
        id: 'HL02',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenHocLieu: 'Sơ đồ đấu nối HC-SR04 – Cảm biến siêu âm',
        LoaiHocLieu: 'Bài giảng',
        NoiDung: 'Cảm biến siêu âm HC-SR04 đo khoảng cách 2–400cm. Đấu nối: VCC → 5V, GND → GND, Trig → D9 (phát xung 10µs), Echo → D10 (nhận tín hiệu phản hồi). Công thức: Khoảng cách (cm) = thời gian_echo(µs) / 58. Dải đo chính xác: 20–300cm, góc phát ±15°.',
        DuongDanTep: null,
      },
      {
        id: 'HL03',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenHocLieu: 'Mạch cầu H L298N – Điều khiển động cơ DC',
        LoaiHocLieu: 'Linh kiện',
        NoiDung: 'L298N là IC cầu H điều khiển 2 động cơ DC độc lập. 4 chân điều khiển: IN1/IN2 (Motor A) và IN3/IN4 (Motor B). ENA/ENB nối PWM để điều chỉnh tốc độ. IN1=HIGH, IN2=LOW → quay xuôi; IN1=LOW, IN2=HIGH → quay ngược; IN1=IN2=LOW → dừng. Nguồn motor: 6–46V, dòng tối đa 2A/kênh.',
        DuongDanTep: null,
      },
      {
        id: 'HL04',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenHocLieu: 'Code mẫu: LED Nhấp Nháy Morse SOS (.ino)',
        LoaiHocLieu: 'Code mẫu',
        NoiDung: 'Chương trình Arduino phát tín hiệu SOS (... --- ...) qua LED tại chân D13. Dấu chấm (.) = 200ms bật, gạch (-) = 600ms bật, khoảng cách ký tự = 600ms tắt. Vòng lặp vô tận trong loop().',
        DuongDanTep: 'samples/led_sos.ino',
      },
      {
        id: 'HL05',
        MaLoTrinh: loTrinhIdMap['LT02'],
        TenHocLieu: 'Code mẫu: Robot Tránh Vật Cản HC-SR04 (.ino)',
        LoaiHocLieu: 'Code mẫu',
        NoiDung: 'Chương trình Arduino điều khiển robot tránh vật cản dùng HC-SR04. Khoảng cách > 20cm: đi thẳng; ≤ 20cm: rẽ trái; ≤ 10cm: lùi và quay 180°. Tốc độ điều khiển qua PWM ENA/ENB của L298N.',
        DuongDanTep: 'samples/avoid_obstacle.ino',
      },
      {
        id: 'HL06',
        MaLoTrinh: loTrinhIdMap['LT02'],
        TenHocLieu: 'Giải thuật PID – Điều khiển cân bằng Robot 2 bánh',
        LoaiHocLieu: 'Bài giảng',
        NoiDung: 'PID (Proportional–Integral–Derivative) là giải thuật điều khiển vòng kín. Công thức: Output = Kp×e + Ki×∫e×dt + Kd×(de/dt). Trong đó: e = Setpoint − Giá_trị_hiện_tại. Kp điều chỉnh độ nhanh phản hồi, Ki loại bỏ sai số tĩnh, Kd giảm dao động. Áp dụng cho robot 2 bánh cân bằng dùng MPU-6050.',
        DuongDanTep: null,
      },
      {
        id: 'HL07',
        MaLoTrinh: loTrinhIdMap['LT03'],
        TenHocLieu: 'ESP32 & IoT – Kết nối MQTT Broker',
        LoaiHocLieu: 'Bài giảng',
        NoiDung: 'ESP32 là vi điều khiển WiFi/Bluetooth dual-core 240MHz. Kết nối WiFi: WiFi.begin("SSID", "password"); while(WiFi.status()!=WL_CONNECTED) delay(500). Kết nối MQTT Broker (HiveMQ/Mosquitto): client.setServer(broker, 1883); client.connect("ESP32Client"); client.publish("topic", payload); client.subscribe("topic"). Dùng thư viện PubSubClient.',
        DuongDanTep: null,
      },
      {
        id: 'HL08',
        MaLoTrinh: loTrinhIdMap['LT03'],
        TenHocLieu: 'Code mẫu: Nhận diện vật thể OpenCV Python (.py)',
        LoaiHocLieu: 'Code mẫu',
        NoiDung: 'Script Python dùng OpenCV và mô hình YOLO/MobileNet để nhận diện vật thể thời gian thực qua webcam. cv2.VideoCapture(0) để lấy frame, cv2.dnn.readNet() nạp model, net.setInput(blob) và net.forward() để suy luận, vẽ bounding box bằng cv2.rectangle().',
        DuongDanTep: 'samples/detect_object.py',
      },
    ];

    for (const hl of hocLieus) {
      const check = await pool.request()
        .input('TenHocLieu', sql.NVarChar(200), hl.TenHocLieu)
        .query(`SELECT MaHocLieu FROM HocLieu WHERE TenHocLieu = @TenHocLieu`);

      if (check.recordset.length > 0) {
        console.log(`→ Học liệu "${hl.TenHocLieu}" đã tồn tại, bỏ qua`);
      } else {
        await pool.request()
          .input('MaNguoiDung', sql.Int, DEFAULT_NGUOI_DUNG)
          .input('MaLoTrinh', sql.Int, hl.MaLoTrinh)
          .input('TenHocLieu', sql.NVarChar(200), hl.TenHocLieu)
          .input('LoaiHocLieu', sql.NVarChar(50), hl.LoaiHocLieu)
          .input('NoiDung', sql.NVarChar(sql.MAX), hl.NoiDung)
          .input('DuongDanTep', sql.VarChar(255), hl.DuongDanTep)
          .query(`
            INSERT INTO HocLieu (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, TrangThai)
            VALUES (@MaNguoiDung, @MaLoTrinh, @TenHocLieu, @LoaiHocLieu, @NoiDung, @DuongDanTep, N'Đã xuất bản')
          `);
        console.log(`✓ Học liệu "${hl.TenHocLieu}" đã được thêm`);
      }
    }

    // ============================================================
    // 3. SEED DỰ ÁN / BÀI TẬP (DuAnBaiTap)
    // ============================================================
    console.log('\n--- Dự Án / Bài Tập ---');
    const hanNopDefault = new Date('2027-12-31T23:59:59');

    const duAns = [
      {
        id: 'DA01',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenDuAn: 'Lập trình đèn LED nhấp nháy Morse SOS',
        YeuCauDuAn: 'Viết chương trình Python nhận vào một chuỗi ký tự (ví dụ: "SOS", "HI", "A") và in ra mã Morse tương ứng.\n\nQuy tắc Morse:\n- S = ... (3 chấm)\n- O = --- (3 gạch)\n- H = .... (4 chấm)\n- I = .. (2 chấm)\n- A = .- (chấm-gạch)\nKhoảng cách giữa các ký tự là dấu cách.\n\nĐầu vào: Một chuỗi chữ cái in hoa (không có số hoặc ký tự đặc biệt)\nĐầu ra: Mã Morse tương ứng, các ký tự cách nhau bởi dấu cách',
        CapDo: 'Cơ bản',
      },
      {
        id: 'DA02',
        MaLoTrinh: loTrinhIdMap['LT01'],
        TenDuAn: 'Tính khoảng cách siêu âm HC-SR04',
        YeuCauDuAn: 'Viết chương trình Python tính khoảng cách đo được từ cảm biến siêu âm HC-SR04.\n\nCông thức: Khoảng cách (cm) = thời gian_echo (µs) / 58\n\nĐầu vào: Thời gian echo tính bằng microsecond (µs) – số nguyên dương\nĐầu ra: Khoảng cách tính bằng cm, làm tròn 2 chữ số thập phân\n\nVí dụ: 1000µs → 17.24cm, 2900µs → 50.0cm',
        CapDo: 'Cơ bản',
      },
      {
        id: 'DA03',
        MaLoTrinh: loTrinhIdMap['LT02'],
        TenDuAn: 'Giải thuật cân bằng PID đơn giản',
        YeuCauDuAn: 'Viết chương trình Python mô phỏng bộ điều khiển PID cho robot cân bằng 2 bánh.\n\nĐầu vào (1 dòng, cách nhau bởi dấu cách): <Góc_hiện_tại> <Setpoint> <Kp> <Ki> <Kd>\nĐầu ra: "Motor: FORWARD <output>" hoặc "Motor: BACK <output>" hoặc "Motor: STOP"\n\nTính sai số e = Setpoint - Góc_hiện_tại\nOutput PID = Kp*e + Ki*e*dt + Kd*(e/dt) (dt=1)\nNếu |Output| < 1 thì in "Motor: STOP"\nNếu Output > 0 thì "Motor: FORWARD <int(Output)>"\nNếu Output < 0 thì "Motor: BACK <abs(int(Output))>"',
        CapDo: 'Trung bình',
      },
      {
        id: 'DA04',
        MaLoTrinh: loTrinhIdMap['LT02'],
        TenDuAn: 'Điều khiển Robot tránh vật cản',
        YeuCauDuAn: 'Viết chương trình Python mô phỏng logic điều hướng robot tránh vật cản dựa vào khoảng cách đo từ HC-SR04.\n\nĐầu vào: Khoảng cách (cm) – số nguyên\nĐầu ra: Lệnh di chuyển của robot\n\nQuy tắc:\n- Khoảng cách > 20cm → in "FORWARD"\n- 10cm < Khoảng cách ≤ 20cm → in "TURN_LEFT"\n- Khoảng cách ≤ 10cm → in "BACK_AND_TURN"',
        CapDo: 'Trung bình',
      },
    ];

    const duAnIdMap = {}; // 'DA01' -> MaDuAn thực tế

    for (const da of duAns) {
      const check = await pool.request()
        .input('TenDuAn', sql.NVarChar(200), da.TenDuAn)
        .query(`SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn = @TenDuAn`);

      if (check.recordset.length > 0) {
        duAnIdMap[da.id] = check.recordset[0].MaDuAn;
        console.log(`→ Dự án "${da.TenDuAn}" đã tồn tại, bỏ qua (MaDuAn=${duAnIdMap[da.id]})`);
      } else {
        const insert = await pool.request()
          .input('MaNguoiDung', sql.Int, DEFAULT_NGUOI_DUNG)
          .input('MaLoTrinh', sql.Int, da.MaLoTrinh)
          .input('TenDuAn', sql.NVarChar(200), da.TenDuAn)
          .input('YeuCauDuAn', sql.NVarChar(sql.MAX), da.YeuCauDuAn)
          .input('HanNop', sql.DateTime, hanNopDefault)
          .input('CapDo', sql.NVarChar(50), da.CapDo)
          .query(`
            INSERT INTO DuAnBaiTap (MaNguoiDung, MaLoTrinh, TenDuAn, YeuCauDuAn, HanNop, CapDo)
            OUTPUT INSERTED.MaDuAn
            VALUES (@MaNguoiDung, @MaLoTrinh, @TenDuAn, @YeuCauDuAn, @HanNop, @CapDo)
          `);
        duAnIdMap[da.id] = insert.recordset[0].MaDuAn;
        console.log(`✓ Dự án "${da.TenDuAn}" đã được thêm (MaDuAn=${duAnIdMap[da.id]})`);
      }
    }

    // ============================================================
    // 4. SEED TEST CASE (TestCase)
    // ============================================================
    console.log('\n--- Test Cases ---');

    const testCases = [
      // DA01
      { MaDuAn: duAnIdMap['DA01'], DuLieuDauVao: 'SOS',   KetQuaDauRa: '... --- ...',       TrongSoDiem: 3, GoiYSuaLoi: 'Dấu chấm (.) là S, dấu gạch (-) là O' },
      { MaDuAn: duAnIdMap['DA01'], DuLieuDauVao: 'HI',    KetQuaDauRa: '.... ..',            TrongSoDiem: 3, GoiYSuaLoi: 'H=4 chấm, I=2 chấm' },
      { MaDuAn: duAnIdMap['DA01'], DuLieuDauVao: 'A',     KetQuaDauRa: '.-',                 TrongSoDiem: 4, GoiYSuaLoi: 'A trong Morse là chấm-gạch' },
      // DA02
      { MaDuAn: duAnIdMap['DA02'], DuLieuDauVao: '1000',  KetQuaDauRa: '17.24',              TrongSoDiem: 3, GoiYSuaLoi: 'Khoảng cách = thời gian(µs) / 58' },
      { MaDuAn: duAnIdMap['DA02'], DuLieuDauVao: '2900',  KetQuaDauRa: '50.0',               TrongSoDiem: 4, GoiYSuaLoi: '2900µs / 58 = 50.0 cm' },
      { MaDuAn: duAnIdMap['DA02'], DuLieuDauVao: '580',   KetQuaDauRa: '10.0',               TrongSoDiem: 3, GoiYSuaLoi: '580µs / 58 = 10.0 cm' },
      // DA03
      { MaDuAn: duAnIdMap['DA03'], DuLieuDauVao: '0 90 1.0 0.1 0.01',   KetQuaDauRa: 'Motor: FORWARD 85',  TrongSoDiem: 3, GoiYSuaLoi: 'Tính sai số = Setpoint - Góc hiện tại' },
      { MaDuAn: duAnIdMap['DA03'], DuLieuDauVao: '0 0 1.0 0.1 0.01',    KetQuaDauRa: 'Motor: STOP',        TrongSoDiem: 4, GoiYSuaLoi: 'Nếu sai số = 0 thì dừng motor' },
      { MaDuAn: duAnIdMap['DA03'], DuLieuDauVao: '10 90 2.0 0.5 0.1',   KetQuaDauRa: 'Motor: FORWARD 160', TrongSoDiem: 3, GoiYSuaLoi: 'Output PID = Kp*e + Ki*∫e + Kd*de' },
      // DA04
      { MaDuAn: duAnIdMap['DA04'], DuLieuDauVao: '30', KetQuaDauRa: 'FORWARD',         TrongSoDiem: 3, GoiYSuaLoi: 'Nếu khoảng cách > 20cm thì đi thẳng' },
      { MaDuAn: duAnIdMap['DA04'], DuLieuDauVao: '10', KetQuaDauRa: 'TURN_LEFT',       TrongSoDiem: 4, GoiYSuaLoi: 'Nếu khoảng cách <= 20cm thì rẽ trái' },
      { MaDuAn: duAnIdMap['DA04'], DuLieuDauVao: '5',  KetQuaDauRa: 'BACK_AND_TURN',   TrongSoDiem: 3, GoiYSuaLoi: 'Nếu khoảng cách <= 10cm thì lùi và quay' },
    ];

    let tcAdded = 0;
    let tcSkipped = 0;

    for (const tc of testCases) {
      // Kiểm tra trùng theo MaDuAn + DuLieuDauVao + KetQuaDauRa
      const check = await pool.request()
        .input('MaDuAn', sql.Int, tc.MaDuAn)
        .input('DuLieuDauVao', sql.NVarChar(sql.MAX), tc.DuLieuDauVao)
        .input('KetQuaDauRa', sql.NVarChar(sql.MAX), tc.KetQuaDauRa)
        .query(`
          SELECT MaTestCase FROM TestCase
          WHERE MaDuAn = @MaDuAn
            AND DuLieuDauVao = @DuLieuDauVao
            AND KetQuaDauRa = @KetQuaDauRa
        `);

      if (check.recordset.length > 0) {
        console.log(`→ TestCase (DuAn=${tc.MaDuAn}, Input="${tc.DuLieuDauVao}") đã tồn tại, bỏ qua`);
        tcSkipped++;
      } else {
        await pool.request()
          .input('MaDuAn', sql.Int, tc.MaDuAn)
          .input('DuLieuDauVao', sql.NVarChar(sql.MAX), tc.DuLieuDauVao)
          .input('KetQuaDauRa', sql.NVarChar(sql.MAX), tc.KetQuaDauRa)
          .input('TrongSoDiem', sql.Decimal(5, 2), tc.TrongSoDiem)
          .input('GoiYSuaLoi', sql.NVarChar(sql.MAX), tc.GoiYSuaLoi)
          .query(`
            INSERT INTO TestCase (MaDuAn, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi)
            VALUES (@MaDuAn, @DuLieuDauVao, @KetQuaDauRa, @TrongSoDiem, @GoiYSuaLoi)
          `);
        console.log(`✓ TestCase (DuAn=${tc.MaDuAn}, Input="${tc.DuLieuDauVao}" → "${tc.KetQuaDauRa}") đã được thêm`);
        tcAdded++;
      }
    }

    // ============================================================
    // TỔNG KẾT
    // ============================================================
    console.log('\n============================================================');
    console.log('✅ SEED HOÀN THÀNH!');
    console.log(`   • Lộ trình (KhoaHocLoTrinh): ${loTrinhs.length} bản ghi`);
    console.log(`   • Học liệu (HocLieu)        : ${hocLieus.length} bản ghi`);
    console.log(`   • Dự án (DuAnBaiTap)        : ${duAns.length} bản ghi`);
    console.log(`   • TestCase                  : ${testCases.length} bản ghi (thêm mới: ${tcAdded}, bỏ qua: ${tcSkipped})`);
    console.log('============================================================\n');

    await pool.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ LỖI SEED DATA:', err.message);
    if (pool) await pool.close().catch(() => {});
    process.exit(1);
  }
}

main();
