'use strict';
/**
 * seed_vy_hoclieu_morong.js
 * Phan he 2 — Pham Thi Ha Vy (Phamthihavy032@gmail.com)
 * Du lieu mau mo rong: HocLieu, KhoaHocLoTrinh, DuAnBaiTap, TestCase
 * Chuan hoa 100% theo database_schema.sql (StemRoboticDB_V2)
 * Lop: 10/1 | GV phu trach: MaNguoiDung = 2 (TS. Dang Hung Vi)
 *
 * Chay: node server/seed_vy_hoclieu_morong.js
 * Idempotent: kiem tra TenHocLieu, TenLoTrinh, TenDuAn truoc khi chen.
 */

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const sql = require('mssql/msnodesqlv8');

const DB_SERVER = process.env.DB_SERVER || 'localhost';
const DB_NAME   = process.env.DB_NAME   || 'StemRoboticDB_V2';
const DB_USER   = process.env.DB_USER   || '';

function buildConfig() {
  if (!DB_USER) {
    return {
      connectionString:
        'Server=' + DB_SERVER + '\\SQLEXPRESS;Database=' + DB_NAME +
        ';Trusted_Connection=Yes;Driver={ODBC Driver 18 for SQL Server};TrustServerCertificate=Yes;',
      driver: 'msnodesqlv8',
      options: { trustServerCertificate: true },
    };
  }
  return {
    server: DB_SERVER,
    database: DB_NAME,
    user: DB_USER,
    password: process.env.DB_PASSWORD || '',
    options: { trustServerCertificate: true, encrypt: true },
  };
}

// ===========================================================
// 1. DU LIEU MAU: KhoaHocLoTrinh (ENT-02)
// Cot: TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa, TrangThai, MaNguoiTao
// ===========================================================
const LO_TRINH_DATA = [
  {
    TenLoTrinh: 'Co khi Robot STEM',
    ChuDe: 'Co khi',
    CapDo: 'Co ban',
    ThuTuHoc: 1,
    MoTa: 'Kien thuc co khi, lap rap khung xe robot STEM, co cau truyen dong banh xe lop 10/1',
    TrangThai: 'Dang hoat dong',
  },
  {
    TenLoTrinh: 'Mach dien & Linh kien',
    ChuDe: 'Mach dien',
    CapDo: 'Trung cap',
    ThuTuHoc: 2,
    MoTa: 'Dien tu co ban, so do chan Pinout, cam bien TCRT5000, HC-SR04, Servo SG90, cau H L298N',
    TrangThai: 'Dang hoat dong',
  },
  {
    TenLoTrinh: 'Lap trinh Nhung Arduino',
    ChuDe: 'Lap trinh',
    CapDo: 'Nang cao',
    ThuTuHoc: 3,
    MoTa: 'Lap trinh C++ Arduino, thuat toan bam line PID, dieu khien Bluetooth khong day',
    TrangThai: 'Dang hoat dong',
  },
];

// ===========================================================
// 2. DU LIEU MAU: HocLieu (ENT-03)
// Cot: MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai
// ===========================================================
const HOC_LIEU_DATA = [
  // --- Nhom 1: Linh kien & Pinout (TCPP.02) ---
  {
    TenHocLieu: 'Cam bien do line TCRT5000 — Pinout & Thong so ky thuat',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Mach dien',
    NoiDung: 'TCRT5000 la cam bien hong ngoai phan xa chuyen dung cho xe do line robot STEM lop 10/1.\n\n'
      + 'So do chan (Pinout):\n'
      + '- Pin 1 (Anode LED IR): Noi qua tro 220 Ohm len nguon 5V\n'
      + '- Pin 2 (Cathode LED IR): Noi GND\n'
      + '- Pin 3 (Collector Phototransistor): Tin hieu ra Arduino + tro keo 10K len 5V\n'
      + '- Pin 4 (Emitter Phototransistor): Noi GND chung\n\n'
      + 'Thong so ky thuat:\n'
      + '- Dien ap hoat dong: 3.3V - 5V DC\n'
      + '- Khoang cach phat hien: 0.2mm - 15mm (toi uu nhat 5mm cach mat san)\n'
      + '- Buoc song LED IR: 950nm\n'
      + '- Luu y dau noi: Tuyet doi khong dao nguoc cuc gay chay LED phat hong ngoai.',
    DuongDanTep: '/uploads/materials/pinout_tcrt5000.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Dong co Servo SG90 — Pinout & Goc quay PWM',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Mach dien',
    NoiDung: 'SG90 la dong co servo mini goc quay 0-180 do pho bien trong he thong STEM Robotic.\n\n'
      + 'So do day noi (3 day mau):\n'
      + '- Day Nau (GND): Noi cuc am GND Arduino\n'
      + '- Day Do (VCC): 4.8V - 6V (khuyen nghi dung nguon ngoai neu tai co khi nang)\n'
      + '- Day Vang/Cam (PWM Signal): Noi chan Digital ho tro PWM (~D9, ~D10, ~D11)\n\n'
      + 'Thong so hoat dong:\n'
      + '- Moment xoan: 1.8 kg.cm (o dien ap 5V)\n'
      + '- Toc do phan ung: 0.1s cho moi 60 do quay\n'
      + '- Tan so xung dieu khien: 50Hz (chu ky 20ms, xung 500us - 2400us)\n\n'
      + 'Luu y: Chi goi myServo.attach() mot lan trong ham setup().',
    DuongDanTep: '/uploads/materials/pinout_servo_sg90.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Module Bluetooth HC-05 — Pinout & Che do AT Command',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Mach dien',
    NoiDung: 'Module truyen thong khong day HC-05 cho phep ket noi xe robot voi dien thoai/may tinh.\n\n'
      + 'So do chan (Header 6 pin):\n'
      + '- VCC: Cap nguon 3.6V - 6V\n'
      + '- GND: Noi mass chung\n'
      + '- TXD: Dau truyen UART, noi vao chan RX cua Arduino\n'
      + '- RXD: Dau nhan UART, muc logic 3.3V (can mach phan ap 1K/2K khi noi voi Arduino 5V)\n'
      + '- STATE: Chi bao trang thai (HIGH khi da ghep doi thanh cong)\n'
      + '- EN/KEY: Giu HIGH khi bat nguon de vao che do cai dat AT Command\n\n'
      + 'Baudrate mac dinh: 9600 bps (mode truyen) / 38400 bps (mode AT Command).',
    DuongDanTep: '/uploads/materials/pinout_hc05.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Mach cau H L298N — Pinout & Dieu khien dong co DC',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Mach dien',
    NoiDung: 'IC cau H kep L298N cho phep dieu khien dao chieu va dieu toc 2 dong co DC doc lap.\n\n'
      + 'So do chan dieu khien:\n'
      + '- IN1, IN2: Chieu quay dong co A (1-0: Tien, 0-1: Lui, 0-0: Dung)\n'
      + '- IN3, IN4: Chieu quay dong co B (1-0: Tien, 0-1: Lui, 0-0: Dung)\n'
      + '- ENA, ENB: Chan PWM dieu khien toc do motor (0 - 255)\n'
      + '- OUT1, OUT2 / OUT3, OUT4: Dau ra ket noi truc tiep vao 2 cuc motor\n'
      + '- Nguon 12V: Cap nguon dong luc cho dong co (6V - 12V)\n'
      + '- GND: GND chung toan mach\n\n'
      + 'Luu y: Sut ap tren L298N la ~2V do transistor BJT noi bo.',
    DuongDanTep: '/uploads/materials/pinout_l298n.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Cam bien sieu am HC-SR04 — Pinout & Do khoang cach vat can',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Mach dien',
    NoiDung: 'HC-SR04 do khoang cach dua tren thoi gian phan xa song am 40kHz.\n\n'
      + 'So do chan:\n'
      + '- VCC: Nguon 5V on dinh\n'
      + '- Trig: Phat xung kich banh 10 micro-giay\n'
      + '- Echo: Nhan xung phan xa (do rong xung ty le voi khoang cach)\n'
      + '- GND: Mass chung\n\n'
      + 'Cong thuc vat ly: KhoangCach_cm = pulseIn(echoPin, HIGH, 25000) / 58.0\n'
      + 'Goc quet hieu qua: 15 do | Pham vi do: 2cm - 400cm.',
    DuongDanTep: '/uploads/materials/pinout_hcsr04.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Bo mach vi dieu khien Arduino Uno R3 — Toan bo Pinout & Luu y',
    LoaiHocLieu: 'Linh kien',
    ChuDeRef: 'Co khi',
    NoiDung: 'Bo mach vi dieu khien trung tam ATmega328P danh cho chuong trinh STEM Robotic lop 10/1.\n\n'
      + 'He thong chan tin hieu:\n'
      + '- 14 chan Digital I/O (D0 - D13), trong do 6 chan ho tro PWM (~D3, ~D5, ~D6, ~D9, ~D10, ~D11)\n'
      + '- 6 chan Analog Input (A0 - A5, do phan giai 10-bit: 0 - 1023)\n'
      + '- 2 chan Ngat ngoai phan cung: D2 (INT0) va D3 (INT1)\n'
      + '- Giao tiep UART phan cung: D0 (RX), D1 (TX)\n\n'
      + 'Dong dien toi da tren moi chan I/O: 40mA (khuyen nghi an toan 20mA).',
    DuongDanTep: '/uploads/materials/pinout_arduino_uno_r3.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },

  // --- Nhom 2: Bai giang & Code mau (QTHL.01) ---
  {
    TenHocLieu: 'Bai giang: Quy trinh lap rap co khi khung xe robot 2 banh chu dong',
    LoaiHocLieu: 'Video',
    ChuDeRef: 'Co khi',
    NoiDung: 'Huong dan tung buoc lap rap khung acrylic 2 tang cho xe robot STEM lop 10/1.\n\n'
      + '1. Lap 2 dong co DC giam toc vao gia do phia duoi khung xe.\n'
      + '2. Chen banh xe cao su vao truc dong co, can chinh do dong truc.\n'
      + '3. Lap banh caster xoay tu do o phia truoc tao he thong can bang 3 diem.\n'
      + '4. Co dinh de pin va mach cau H L298N o tang 1, Arduino o tang 2.\n'
      + 'Yeu cau ky thuat: Trong tam xe phai nam o khoang giua hai banh chu dong.',
    DuongDanTep: '/uploads/materials/video_lap_rap_khung_xe.mp4',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Bai giang: Dau noi mach dien dong luc Arduino + Cau H L298N',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Mach dien',
    NoiDung: 'So do dau day hoan chinh giua Arduino va khoi dong luc L298N:\n\n'
      + 'Arduino D5 -> L298N ENA (dieu toc dong co A)\n'
      + 'Arduino D6 -> L298N ENB (dieu toc dong co B)\n'
      + 'Arduino D7 -> L298N IN1 | D8 -> IN2\n'
      + 'Arduino D9 -> L298N IN3 | D10 -> IN4\n'
      + 'GND Arduino noi chung GND L298N va cuc am nguon pin.\n'
      + 'Nguon pin 7.4V - 9V noi vao chan 12V cua L298N.',
    DuongDanTep: '/uploads/materials/schematic_l298n_arduino.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Code mau: Thuat toan bam line PID cho xe 2 cam bien TCRT5000',
    LoaiHocLieu: 'Code mau',
    ChuDeRef: 'Lap trinh',
    NoiDung: '// Thuat toan bam line PID don gian hoa cho Arduino Uno R3\n'
      + 'const int ENA = 5, ENB = 6, IN1 = 7, IN2 = 8, IN3 = 9, IN4 = 10;\n'
      + 'const int PIN_LINE_L = A0, PIN_LINE_R = A1;\n'
      + 'float Kp = 25.0, Ki = 0.01, Kd = 15.0;\n'
      + 'float lastErr = 0, integral = 0;\n\n'
      + 'void setup() {\n'
      + '  pinMode(ENA, OUTPUT); pinMode(ENB, OUTPUT);\n'
      + '  pinMode(IN1, OUTPUT); pinMode(IN2, OUTPUT);\n'
      + '  pinMode(IN3, OUTPUT); pinMode(IN4, OUTPUT);\n'
      + '  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n'
      + '  digitalWrite(IN3, HIGH); digitalWrite(IN4, LOW);\n'
      + '}\n\n'
      + 'void loop() {\n'
      + '  int valL = analogRead(PIN_LINE_L);\n'
      + '  int valR = analogRead(PIN_LINE_R);\n'
      + '  float error = valL - valR;\n'
      + '  integral += error;\n'
      + '  float derivative = error - lastErr;\n'
      + '  float output = Kp * error + Ki * integral + Kd * derivative;\n'
      + '  lastErr = error;\n'
      + '  int speedL = constrain(160 + output, 0, 255);\n'
      + '  int speedR = constrain(160 - output, 0, 255);\n'
      + '  analogWrite(ENA, speedL); analogWrite(ENB, speedR);\n'
      + '  delay(10);\n'
      + '}',
    DuongDanTep: '/uploads/materials/code_pid_line_follower.ino',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Bai giang: Dieu khien Servo SG90 qua lenh Serial Monitor',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Lap trinh',
    NoiDung: 'Huong dan dieu khien goc quay servo bang cach truyen ky tu goc tu Serial Monitor.\n\n'
      + '#include <Servo.h>\n'
      + 'Servo myServo;\n'
      + 'void setup() {\n'
      + '  myServo.attach(9);\n'
      + '  Serial.begin(9600);\n'
      + '}\n'
      + 'void loop() {\n'
      + '  if (Serial.available()) {\n'
      + '    int angle = Serial.parseInt();\n'
      + '    angle = constrain(angle, 0, 180);\n'
      + '    myServo.write(angle);\n'
      + '    Serial.print("Da quay goc: "); Serial.println(angle);\n'
      + '  }\n'
      + '}',
    DuongDanTep: '/uploads/materials/servo_serial_control.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Ban nhap',
  },

  // --- Nhom 3: Meo sua loi TestCase & DF-05 (CoCanCapNhat = 1 khi ty le loi > 30%) ---
  {
    TenHocLieu: 'Meo sua loi: Ham pulseIn() bi treo hoac tra ve 0 tren HC-SR04',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Lap trinh',
    NoiDung: 'Loi pho bien: Hoc sinh khong cai dat tham so timeout khien chuong trinh bi dung vo han.\n\n'
      + 'Cach sua chuan:\n'
      + '// SAI: long duration = pulseIn(echoPin, HIGH);\n'
      + '// DUNG: them timeout 25000 micro-giay (~4m)\n'
      + 'long duration = pulseIn(echoPin, HIGH, 25000);\n'
      + 'if (duration == 0) {\n'
      + '  // Xu ly mat tin hieu hoac qua tam do\n'
      + '}\n'
      + 'Kiem tra day noi ECHO phai co tiep xuc tot va nguon 5V du dong.',
    DuongDanTep: '/uploads/materials/fix_pulsein_timeout.pdf',
    CoCanCapNhat: 1, // Luong DF-05: CoCanCapNhat=1 do ty le hoc sinh gap loi nay > 30%
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Meo sua loi: Dong co khong quay do chan ENA/ENB khong duoc cap xung PWM',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Mach dien',
    NoiDung: 'Loi pho bien trong bai tap L298N:\n\n'
      + '1. Quen kich hoat chan ENA va ENB: Mac dinh neu thao jumper thi hai chan nay o trang thai LOW.\n'
      + '   -> Bat buoc phai dung analogWrite(ENA, tocDo) voi tocDo > 80.\n'
      + '2. Dau nham chan Digital khong ho tro PWM vao ENA/ENB.\n'
      + '3. Nguon pin khong chung GND voi Arduino lam sai lech dien ap logic.',
    DuongDanTep: '/uploads/materials/fix_l298n_pwm.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Meo sua loi: Servo SG90 rung lac lien tuc do goi attach() trong loop',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Lap trinh',
    NoiDung: 'Nguyen nhan gay rung lac servo:\n\n'
      + '1. Goi ham attach() lap di lap lai trong void loop() lam xung PWM bi reset lien tuc.\n'
      + '   -> Cach sua: Chi goi attach() duy nhat 1 lan trong void setup().\n'
      + '2. Nguon 5V tu bo Arduino khong du dong khi servo keo tai (can tu 400mA - 800mA).\n'
      + '   -> Giai phap: Gan them tu hoa 100uF song song giua VCC va GND cua servo.',
    DuongDanTep: '/uploads/materials/fix_servo_jitter.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
  {
    TenHocLieu: 'Meo sua loi: Loi bien dich C++ undeclared identifier va thieu thu vien',
    LoaiHocLieu: 'Tai lieu',
    ChuDeRef: 'Lap trinh',
    NoiDung: 'Tong hop cac loi cu phap hoc sinh lop 10/1 thuong gap khi viet code Arduino:\n\n'
      + '1. "error: \'pinMode\' was not declared in this scope": Do go sai chu hoa/thuong (\'pinmode\').\n'
      + '2. "error: expected \';\' before \'}\' token": Thieu dau cham phay cuoi dong lenh truoc do.\n'
      + '3. "fatal error: Servo.h: No such file or directory": Thieu chi thi #include <Servo.h> o dau tep.',
    DuongDanTep: '/uploads/materials/fix_cpp_syntax_errors.pdf',
    CoCanCapNhat: 0,
    TrangThai: 'Xuat ban',
  },
];

// ===========================================================
// 3. DU LIEU MAU: DuAnBaiTap (ENT-04) & TestCase (ENT-05)
// DuAnBaiTap cot: MaNguoiDung, MaLoTrinh, TenDuAn, YeuCauDuAn, NgayGiao, HanNop, CapDo, TrangThai
// TestCase cot: MaDuAn, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi
// ===========================================================
const DU_AN_DATA = [
  {
    TenDuAn: 'Du an 1: Do khoang cach canh bao vat can HC-SR04',
    ChuDeRef: 'Mach dien',
    CapDo: 'Co ban',
    YeuCauDuAn: 'Lap trinh doc cam bien sieu am HC-SR04 va xuat khoang cach cm ra cong Serial. Bat coi hu khi khoang cach nho hon 15cm.',
    HanNop: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 ngay nua
    TrangThai: 'Dang mo',
    TestCases: [
      {
        DuLieuDauVao: 'ECHO_PULSE=1160us',
        KetQuaDauRa: 'DISTANCE=20cm;BUZZER=OFF',
        TrongSoDiem: 1.0,
        GoiYSuaLoi: 'Kiem tra cong thuc tinh khoang cach: cm = duration / 58.0. Dam bao pulseIn co tham so timeout 25000.',
      },
      {
        DuLieuDauVao: 'ECHO_PULSE=580us',
        KetQuaDauRa: 'DISTANCE=10cm;BUZZER=ON',
        TrongSoDiem: 1.0,
        GoiYSuaLoi: 'Canh bao khong bat khi khoang cach < 15cm. Kiem tra cau lenh if (distance < 15) digitalWrite(PIN_BUZZER, HIGH).',
      },
    ],
  },
  {
    TenDuAn: 'Du an 2: Dieu khien goc quay Servo SG90 qua Serial',
    ChuDeRef: 'Lap trinh',
    CapDo: 'Trung cap',
    YeuCauDuAn: 'Lap trinh tiep nhan chuoi goc quay tu Serial (0-180 do) va xuat xung dieu khien servo qua thu vien Servo.h.',
    HanNop: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    TrangThai: 'Dang mo',
    TestCases: [
      {
        DuLieuDauVao: 'INPUT_ANGLE=90',
        KetQuaDauRa: 'SERVO_POS=90;STATUS=OK',
        TrongSoDiem: 1.0,
        GoiYSuaLoi: 'Chi goi myServo.attach() trong setup. Dung constrain(goc, 0, 180) de ngan vuot nguong co khi.',
      },
      {
        DuLieuDauVao: 'INPUT_ANGLE=210',
        KetQuaDauRa: 'SERVO_POS=180;STATUS=CONSTRAINED',
        TrongSoDiem: 1.0,
        GoiYSuaLoi: 'Chua han che goc quay tren 180 do bang ham constrain().',
      },
    ],
  },
  {
    TenDuAn: 'Du an 3: Bam duong tu dong bang thuat toan PID',
    ChuDeRef: 'Lap trinh',
    CapDo: 'Nang cao',
    YeuCauDuAn: 'Lap trinh xe 2 banh BAM LINE lien tuc theo quy dao den tren nen trang su dung 2 cam bien TCRT5000 va cau H L298N.',
    HanNop: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000),
    TrangThai: 'Dang mo',
    TestCases: [
      {
        DuLieuDauVao: 'SENSOR_L=850;SENSOR_R=120',
        KetQuaDauRa: 'ACTION=TURN_LEFT;PWM_L=110;PWM_R=210',
        TrongSoDiem: 1.0,
        GoiYSuaLoi: 'Xe lech phai: Cung cap xung PWM cho banh phai lon hon banh trai de bo cua chinh xac.',
      },
    ],
  },
];

// ===========================================================
// THUC THI SEED DU LIEU
// ===========================================================
async function seed() {
  let pool;
  try {
    console.log('[DB] Ket noi SQL Server ' + DB_NAME + ' ...');
    pool = await sql.connect(buildConfig());
    console.log('[DB] Ket noi thanh cong.\n');

    // 1. KhoaHocLoTrinh
    console.log('=== 1. KhoaHocLoTrinh ===');
    const loTrinhMap = {};
    for (const lt of LO_TRINH_DATA) {
      const chk = await pool.request()
        .input('ten', sql.NVarChar(200), lt.TenLoTrinh)
        .query('SELECT MaLoTrinh FROM KhoaHocLoTrinh WHERE TenLoTrinh = @ten');

      if (chk.recordset.length > 0) {
        loTrinhMap[lt.ChuDe] = chk.recordset[0].MaLoTrinh;
        console.log('  [SKIP] ' + lt.TenLoTrinh + ' (MaLoTrinh = ' + loTrinhMap[lt.ChuDe] + ')');
      } else {
        const ins = await pool.request()
          .input('maTao', sql.Int, 2)
          .input('ten',   sql.NVarChar(200), lt.TenLoTrinh)
          .input('chuDe', sql.NVarChar(100), lt.ChuDe)
          .input('capDo', sql.NVarChar(50),  lt.CapDo)
          .input('thuTu', sql.Int,           lt.ThuTuHoc)
          .input('moTa',  sql.NVarChar(sql.MAX), lt.MoTa)
          .input('tt',    sql.NVarChar(30),  lt.TrangThai)
          .query(
            'INSERT INTO KhoaHocLoTrinh (MaNguoiTao, TenLoTrinh, ChuDe, CapDo, ThuTuHoc, MoTa, TrangThai) ' +
            'OUTPUT INSERTED.MaLoTrinh ' +
            'VALUES (@maTao, @ten, @chuDe, @capDo, @thuTu, @moTa, @tt)'
          );
        loTrinhMap[lt.ChuDe] = ins.recordset[0].MaLoTrinh;
        console.log('  [OK]   ' + lt.TenLoTrinh + ' -> MaLoTrinh = ' + loTrinhMap[lt.ChuDe]);
      }
    }

    // 2. HocLieu
    console.log('\n=== 2. HocLieu ===');
    for (const hl of HOC_LIEU_DATA) {
      const chk = await pool.request()
        .input('ten', sql.NVarChar(200), hl.TenHocLieu)
        .query('SELECT MaHocLieu FROM HocLieu WHERE TenHocLieu = @ten');

      if (chk.recordset.length > 0) {
        console.log('  [SKIP] ' + hl.TenHocLieu.substring(0, 50) + '...');
        continue;
      }

      const maLoTrinh = loTrinhMap[hl.ChuDeRef] || null;
      await pool.request()
        .input('maNd',   sql.Int, 2) // GV: TS. Dang Hung Vi (MaNguoiDung = 2)
        .input('maLt',   sql.Int, maLoTrinh)
        .input('ten',    sql.NVarChar(200), hl.TenHocLieu)
        .input('loai',   sql.NVarChar(50),  hl.LoaiHocLieu)
        .input('noi',    sql.NVarChar(sql.MAX), hl.NoiDung)
        .input('duong',  sql.VarChar(255),  hl.DuongDanTep)
        .input('coCap',  sql.Bit,           hl.CoCanCapNhat)
        .input('tt',     sql.NVarChar(30),  hl.TrangThai)
        .query(
          'INSERT INTO HocLieu (MaNguoiDung, MaLoTrinh, TenHocLieu, LoaiHocLieu, NoiDung, DuongDanTep, CoCanCapNhat, TrangThai) ' +
          'VALUES (@maNd, @maLt, @ten, @loai, @noi, @duong, @coCap, @tt)'
        );
      console.log('  [OK]   ' + hl.TenHocLieu.substring(0, 50));
    }

    // 3. DuAnBaiTap & TestCase
    console.log('\n=== 3. DuAnBaiTap & TestCase ===');
    for (const da of DU_AN_DATA) {
      let maDuAn;
      const chkDA = await pool.request()
        .input('ten', sql.NVarChar(200), da.TenDuAn)
        .query('SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn = @ten');

      const maLoTrinh = loTrinhMap[da.ChuDeRef] || null;

      if (chkDA.recordset.length > 0) {
        maDuAn = chkDA.recordset[0].MaDuAn;
        console.log('  [SKIP] DuAn: ' + da.TenDuAn);
      } else {
        const insDA = await pool.request()
          .input('maNd',   sql.Int, 2)
          .input('maLt',   sql.Int, maLoTrinh)
          .input('ten',    sql.NVarChar(200), da.TenDuAn)
          .input('yc',     sql.NVarChar(sql.MAX), da.YeuCauDuAn)
          .input('han',    sql.DateTime, da.HanNop)
          .input('capDo',  sql.NVarChar(50), da.CapDo)
          .input('tt',     sql.NVarChar(30), da.TrangThai)
          .query(
            'INSERT INTO DuAnBaiTap (MaNguoiDung, MaLoTrinh, TenDuAn, YeuCauDuAn, HanNop, CapDo, TrangThai) ' +
            'OUTPUT INSERTED.MaDuAn ' +
            'VALUES (@maNd, @maLt, @ten, @yc, @han, @capDo, @tt)'
          );
        maDuAn = insDA.recordset[0].MaDuAn;
        console.log('  [OK]   DuAn: ' + da.TenDuAn + ' -> MaDuAn = ' + maDuAn);
      }

      // Chen TestCase
      for (const tc of da.TestCases) {
        const chkTC = await pool.request()
          .input('maDa', sql.Int, maDuAn)
          .input('in',   sql.NVarChar(sql.MAX), tc.DuLieuDauVao)
          .query('SELECT MaTestCase FROM TestCase WHERE MaDuAn = @maDa AND DuLieuDauVao = @in');

        if (chkTC.recordset.length > 0) {
          console.log('    [SKIP] TestCase: ' + tc.DuLieuDauVao);
        } else {
          await pool.request()
            .input('maDa',  sql.Int, maDuAn)
            .input('in',    sql.NVarChar(sql.MAX), tc.DuLieuDauVao)
            .input('out',   sql.NVarChar(sql.MAX), tc.KetQuaDauRa)
            .input('trong', sql.Decimal(5, 2),     tc.TrongSoDiem)
            .input('goiY',  sql.NVarChar(sql.MAX), tc.GoiYSuaLoi)
            .query(
              'INSERT INTO TestCase (MaDuAn, DuLieuDauVao, KetQuaDauRa, TrongSoDiem, GoiYSuaLoi) ' +
              'VALUES (@maDa, @in, @out, @trong, @goiY)'
            );
          console.log('    [OK]   TestCase: ' + tc.DuLieuDauVao);
        }
      }
    }

    // Tong ket
    const stats = await pool.request().query(
      'SELECT ' +
      '(SELECT COUNT(*) FROM KhoaHocLoTrinh) AS TongLoTrinh, ' +
      '(SELECT COUNT(*) FROM HocLieu) AS TongHocLieu, ' +
      '(SELECT COUNT(*) FROM HocLieu WHERE CoCanCapNhat = 1) AS CanCapNhatDF05, ' +
      '(SELECT COUNT(*) FROM DuAnBaiTap) AS TongDuAn, ' +
      '(SELECT COUNT(*) FROM TestCase) AS TongTestCase'
    );
    const r = stats.recordset[0];
    console.log('\n=== TONG KET CSDL StemRoboticDB_V2 ===');
    console.log('  KhoaHocLoTrinh : ' + r.TongLoTrinh);
    console.log('  HocLieu        : ' + r.TongHocLieu + ' (' + r.CanCapNhatDF05 + ' hoc lieu can cap nhat theo luong DF-05)');
    console.log('  DuAnBaiTap     : ' + r.TongDuAn);
    console.log('  TestCase       : ' + r.TongTestCase);
    console.log('\n[HOAN TAT] Du lieu seed hop le 100% database_schema.sql!');
  } catch (err) {
    console.error('[LOI SEED]:', err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

// Chay khi goi truc tiep
if (require.main === module) {
  seed();
}

module.exports = { seed };
