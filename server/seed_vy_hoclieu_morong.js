'use strict';
/**
 * seed_vy_hoclieu_morong.js
 * Phan he 2 — Pham Thi Ha Vy (Phamthihavy032@gmail.com)
 * Du lieu mau mo rong: HocLieu, KhoaHocLoTrinh, DuAnBaiTap, TestCase
 * Lop: 10/1 | GV phu trach: MaNguoiDung = 2
 * Chay: node server/seed_vy_hoclieu_morong.js
 * Idempotent: skip neu ban ghi da ton tai (kiem tra TieuDe).
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
// DU LIEU MAU: KhoaHocLoTrinh
// ===========================================================
var KHOA_HOC = [
  {
    TenKhoaHoc: 'Co khi Robot STEM',
    MoTa: 'Kien thuc co khi, lap rap khung robot, co cau truyen dong',
    CapDo: 'Co ban',
  },
  {
    TenKhoaHoc: 'Mach dien & Linh kien',
    MoTa: 'Dien tu, cam bien, module giao tiep khong day',
    CapDo: 'Trung cap',
  },
  {
    TenKhoaHoc: 'Lap trinh Nhung',
    MoTa: 'Arduino C++, Python MicroPython, dieu khien robot nang cao',
    CapDo: 'Nang cao',
  },
];

// ===========================================================
// DU LIEU MAU: HocLieu
// ===========================================================
var HOC_LIEU_DATA = [
  // --- NHOM 1: Linh kien & Pinout ---
  {
    TieuDe: 'Cam bien do line TCRT5000 — Pinout & Thong so',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'TCRT5000 la cam bien hong ngoai phan xa dung de do line tren xe robot.\n\n'
      + 'So do chan:\n'
      + '- Pin 1 (Anode LED IR): Noi qua dien tro 220 Ohm den VCC 5V\n'
      + '- Pin 2 (Cathode LED IR): GND\n'
      + '- Pin 3 (Collector Phototransistor): Noi den duong tin hieu + dien tro 10K len VCC\n'
      + '- Pin 4 (Emitter Phototransistor): GND\n\n'
      + 'Thong so ky thuat:\n'
      + '- Dien ap hoat dong: 3.3V - 5V\n'
      + '- Khoang cach phat hien: 0.2mm - 15mm (toi uu 5mm)\n'
      + '- Buoc song LED IR: 950nm\n'
      + '- Luu y: Khong ket noi nguoc cuc — LED IR se bi hong vinh vien.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'TCRT5000 cam bien hong ngoai do line pinout so do chan',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Dong co Servo SG90 — Pinout & Goc quay',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'SG90 la servo mini pho bien trong robot STEM, goc quay 0-180 do.\n\n'
      + 'So do day:\n'
      + '- Day Nau (GND): GND Arduino\n'
      + '- Day Do (VCC): 5V (khuyen nghi dung nguon 5V rieng khi tai nang)\n'
      + '- Day Vang/Cam (Signal PWM): Chan Digital co dau ~ tren Arduino (D9, D10, D11)\n\n'
      + 'Thong so ky thuat:\n'
      + '- Moment xoan: 1.8 kg.cm (5V)\n'
      + '- Toc do quay: 0.1s/60 do\n'
      + '- Tan so PWM: 50Hz; xung dieu khien: 500us (0 do) - 2400us (180 do)\n'
      + '- Dien ap hoat dong: 4.8V - 6V\n\n'
      + 'Luu y:\n'
      + '- Khong cau hinh goc quay vuot qua gioi han co hoc (< 0 do hoac > 180 do) se lam nong motor.\n'
      + '- Dung Servo.h de dieu khien, KHONG dung analogWrite truc tiep.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'SG90 servo goc quay PWM pinout so do day',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Module Bluetooth HC-05 — Pinout & AT Command',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'HC-05 la module Bluetooth Classic 2.0 dung de truyen du lieu khong day giua Arduino va dien thoai.\n\n'
      + 'So do chan (6 chan):\n'
      + '- VCC: 3.6V - 6V (5V tu Arduino OK)\n'
      + '- GND: GND\n'
      + '- TXD: Noi vao chan RX cua Arduino (can chia ap 1K+2K neu Arduino 5V)\n'
      + '- RXD: Noi vao chan TX cua Arduino\n'
      + '- STATE: Tin hieu trang thai ket noi (HIGH = da ket noi)\n'
      + '- EN/KEY: Dua HIGH khi khoi dong de vao che do AT Command\n\n'
      + 'Cac lenh AT co ban:\n'
      + '  AT              -> OK\n'
      + '  AT+NAME=Robot01 -> Doi ten thiet bi\n'
      + '  AT+BAUD=4       -> Dat baudrate 9600\n'
      + '  AT+PSWD=1234    -> Doi ma PIN\n\n'
      + 'Luu y: Module hoat dong o 3.3V logic — dung mach chia ap dien tro cho chan RXD neu dung Arduino 5V.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'HC-05 bluetooth AT command pinout serial UART',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Mach cau H L298N — Pinout & Dieu khien dong co DC',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'L298N la IC mach cau H kep, dieu khien 2 dong co DC doc lap hoac 1 dong co buoc.\n\n'
      + 'So do chan quan trong:\n'
      + '- IN1, IN2: Chieu quay dong co A (10=tien, 01=lui, 00/11=dung)\n'
      + '- IN3, IN4: Chieu quay dong co B\n'
      + '- ENA: PWM dieu khien toc do dong co A (chan ~ Arduino)\n'
      + '- ENB: PWM dieu khien toc do dong co B\n'
      + '- OUT1, OUT2: Dau ra dong co A\n'
      + '- OUT3, OUT4: Dau ra dong co B\n'
      + '- 12V: Nguon chinh cho dong co (6V-35V)\n'
      + '- 5V: Co the lay 5V ra nuoi Arduino (jump 5V enable)\n'
      + '- GND: Chung GND\n\n'
      + 'Luu y:\n'
      + '- Dien ap roi tren L298N khoang 2V — dong co 6V can cap nguon 8V.\n'
      + '- ENA/ENB phai duoc kich HIGH (hoac PWM) moi dong co chay.\n'
      + '- Lam mat IC bang tan nhiet khi tai dong > 1A.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'L298N cau H dong co DC PWM dieu khien pinout',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Cam bien sieu am HC-SR04 — Pinout & Tinh khoang cach',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'HC-SR04 phat xung sieu am 40kHz va do thoi gian ECHO de tinh khoang cach vat can.\n\n'
      + 'So do chan:\n'
      + '- VCC: 5V\n'
      + '- Trig: Chan Digital out — phat xung TRIG 10us\n'
      + '- Echo: Chan Digital in — do do rong xung ECHO\n'
      + '- GND: GND\n\n'
      + 'Cong thuc: khoangCach_cm = pulseIn(echoPin, HIGH) / 58.0\n\n'
      + 'Code mau:\n'
      + '  digitalWrite(trigPin, LOW); delayMicroseconds(2);\n'
      + '  digitalWrite(trigPin, HIGH); delayMicroseconds(10);\n'
      + '  digitalWrite(trigPin, LOW);\n'
      + '  long duration = pulseIn(echoPin, HIGH, 25000);\n'
      + '  float cm = duration / 58.0;\n\n'
      + 'Luu y:\n'
      + '- Goc phat song: 15 do — dat thang vuong goc voi vat can.\n'
      + '- Khoang cach: 2cm - 400cm.\n'
      + '- Neu pulseIn tra ve 0: kiem tra day noi ECHO, nguon 5V du.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'HC-SR04 sieu am khoang cach pulseIn TRIG ECHO',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Arduino Uno R3 — Pinout toan bo & Huong dan khoi dong',
    LoaiHocLieu: 'Linh kien',
    NoiDung: 'Arduino Uno R3 la bo dieu khien chinh cua kit STEM Robotic lop 10.\n\n'
      + 'Chan Digital (D0-D13):\n'
      + '- D0 (RX), D1 (TX): UART Serial — tranh dung khi debug qua Serial Monitor\n'
      + '- D2, D3: Ngat ngoai (attachInterrupt)\n'
      + '- D3, D5, D6, D9, D10, D11: Ho tro PWM (dau ~)\n'
      + '- D13: LED tich hop tren bo mach\n\n'
      + 'Chan Analog (A0-A5): Doc gia tri 0-1023 (10-bit ADC, Vref = 5V)\n\n'
      + 'Nguon:\n'
      + '- Vin: 7V-12V qua jack DC; 5V, 3.3V: chan nguon ra co dieu ap\n\n'
      + 'Luu y:\n'
      + '- KHONG cap qua 40mA tren bat ky chan Digital.\n'
      + '- Dung Serial.begin(9600) truoc khi dung Serial.print().\n'
      + '- Bo nho Flash 32KB, SRAM 2KB — tranh khai bao mang lon trong loop().',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'Arduino Uno R3 pinout chan analog digital PWM UART',
    CoCanCapNhat: 0,
    NhomChuDe: 'Co khi',
  },

  // --- NHOM 2: Bai giang & Code mau ---
  {
    TieuDe: 'Bai giang: Lap rap khung xe robot do line co ban',
    LoaiHocLieu: 'Bai giang',
    NoiDung: 'Muc tieu: Hoc sinh lap rap hoan chinh khung xe robot 2 banh sau 60 phut.\n\n'
      + 'Vat lieu:\n'
      + '- 1x Khung xe acrylic 2 tang\n'
      + '- 2x Dong co DC 6V giam toc (1:48)\n'
      + '- 2x Banh xe cao su 65mm\n'
      + '- 1x Banh caster\n'
      + '- 4x Vit M3 x 10mm\n\n'
      + 'Cac buoc lap rap:\n'
      + '1. Gan dong co vao khung tang duoi bang vit M3.\n'
      + '2. Lap banh xe vao truc dong co (kiem tra banh thang hang).\n'
      + '3. Gan banh caster o phia truoc.\n'
      + '4. Dat Arduino + L298N len tang tren, can bang trong tam.\n'
      + '5. Dan day: Dong co A -> OUT1/OUT2 (L298N), Dong co B -> OUT3/OUT4.\n\n'
      + 'Luu y co khi:\n'
      + '- Hai dong co phai quay dung chieu (test rieng tung dong co truoc).\n'
      + '- Trong tam nam giua 2 banh chu dong de xe quay tai cho duoc.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'lap rap robot xe do line khung banh dong co co khi',
    CoCanCapNhat: 0,
    NhomChuDe: 'Co khi',
  },
  {
    TieuDe: 'Bai giang: Mach dien Arduino + L298N dieu khien 2 dong co DC',
    LoaiHocLieu: 'Bai giang',
    NoiDung: 'Muc tieu: Dau noi chinh xac mach dieu khien 2 dong co DC qua L298N.\n\n'
      + 'So do noi day:\n'
      + '  Arduino D5  -> L298N ENA\n'
      + '  Arduino D6  -> L298N ENB\n'
      + '  Arduino D7  -> L298N IN1\n'
      + '  Arduino D8  -> L298N IN2\n'
      + '  Arduino D9  -> L298N IN3\n'
      + '  Arduino D10 -> L298N IN4\n'
      + '  Arduino GND -> L298N GND\n'
      + '  Nguon 9V    -> L298N 12V\n\n'
      + 'Code mau kiem tra:\n'
      + '  digitalWrite(7, HIGH); digitalWrite(8, LOW);  // Mo A tien\n'
      + '  digitalWrite(9, HIGH); digitalWrite(10, LOW); // Mo B tien\n'
      + '  analogWrite(5, 200); analogWrite(6, 200);     // Toc do 78%\n\n'
      + 'Loi thuong gap:\n'
      + '- Dong co khong quay: Kiem tra ENA/ENB co duoc HIGH khong.\n'
      + '- Dong co quay nguoc: Doi IN1<->IN2 hoac IN3<->IN4.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'L298N dong co DC dau noi mach dien bai giang',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Bai giang: Lap trinh PID don gian dieu khien xe do line',
    LoaiHocLieu: 'Bai giang',
    NoiDung: 'Muc tieu: Hieu va ap dung PID co ban de xe bam sat duong.\n\n'
      + 'Khai niem:\n'
      + '- P (Proportional): Dieu chinh ty le voi sai so hien tai\n'
      + '- I (Integral): Bu sai so tich luy theo thoi gian\n'
      + '- D (Derivative): Chong dao dong, phan ung voi toc do thay doi sai so\n\n'
      + 'Code mau (2 cam bien TCRT5000):\n'
      + '  float Kp=25, Ki=0.01, Kd=15;\n'
      + '  float lastErr=0, integral=0;\n'
      + '  void loop() {\n'
      + '    int s1 = analogRead(A0);\n'
      + '    int s2 = analogRead(A1);\n'
      + '    float error = s1 - s2;\n'
      + '    integral += error;\n'
      + '    float derivative = error - lastErr;\n'
      + '    float output = Kp*error + Ki*integral + Kd*derivative;\n'
      + '    lastErr = error;\n'
      + '    int speedL = constrain(150 + output, 0, 255);\n'
      + '    int speedR = constrain(150 - output, 0, 255);\n'
      + '    analogWrite(ENA, speedL); analogWrite(ENB, speedR);\n'
      + '  }\n\n'
      + 'Tu chinh: Bat dau Kp=20, tang dan den khi xe bam duong tot ma khong dao dong.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'PID do line dieu khien xe lap trinh Arduino TCRT5000',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Bai giang: Dieu khien Servo SG90 theo goc chi dinh qua Serial',
    LoaiHocLieu: 'Bai giang',
    NoiDung: 'Muc tieu: Viet chuong trinh dieu khien Servo SG90 quay dung goc qua Serial Monitor.\n\n'
      + 'Code mau:\n'
      + '  #include <Servo.h>\n'
      + '  Servo myServo;\n'
      + '  void setup() { myServo.attach(9); Serial.begin(9600); }\n'
      + '  void loop() {\n'
      + '    if (Serial.available()) {\n'
      + '      int goc = Serial.parseInt();\n'
      + '      goc = constrain(goc, 0, 180);\n'
      + '      myServo.write(goc);\n'
      + '      Serial.print("Goc: "); Serial.println(goc);\n'
      + '    }\n'
      + '  }\n\n'
      + 'Bai tap: Ket hop Servo + HC-SR04 lam canh tay robot tranh vat can.\n\n'
      + 'Luu y:\n'
      + '- attach() chi duoc goi 1 lan trong setup().\n'
      + '- write(goc) nhan gia tri 0-180.\n'
      + '- detach() de giai phong chan PWM khi khong dung Servo.',
    TrangThai: 'Ban nhap',
    TuKhoaTimKiem: 'Servo SG90 goc quay PWM Serial attach write detach',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Bai giang: Giao tiep Bluetooth HC-05 dieu khien robot tu dien thoai',
    LoaiHocLieu: 'Bai giang',
    NoiDung: 'Muc tieu: Truyen lenh tu dien thoai Android qua Bluetooth den Arduino dieu khien xe robot.\n\n'
      + 'Phan cung:\n'
      + '- Arduino Uno R3 + HC-05 (noi RX/TX qua SoftwareSerial)\n'
      + '- Dien thoai Android cai "Serial Bluetooth Terminal" (mien phi)\n\n'
      + 'Code mau:\n'
      + '  #include <SoftwareSerial.h>\n'
      + '  SoftwareSerial BT(2, 3); // RX=D2, TX=D3\n'
      + '  void setup() { BT.begin(9600); Serial.begin(9600); }\n'
      + '  void loop() {\n'
      + '    if (BT.available()) {\n'
      + '      char cmd = BT.read();\n'
      + '      switch(cmd) {\n'
      + '        case "F": forward();  break;\n'
      + '        case "B": backward(); break;\n'
      + '        case "L": turnLeft(); break;\n'
      + '        case "R": turnRight();break;\n'
      + '        case "S": stopAll();  break;\n'
      + '      }\n'
      + '    }\n'
      + '  }\n\n'
      + 'Luu y: Rut day TX/RX HC-05 ra khi nap code, sau do cam lai.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'HC-05 Bluetooth SoftwareSerial dieu khien robot dien thoai',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Code mau: Doc cam bien sieu am HC-SR04 & hien thi LCD 16x2',
    LoaiHocLieu: 'Code mau',
    NoiDung: '#include <LiquidCrystal_I2C.h>\n'
      + 'LiquidCrystal_I2C lcd(0x27, 16, 2);\n'
      + 'const int trigPin = 7, echoPin = 6;\n'
      + 'void setup() {\n'
      + '  pinMode(trigPin, OUTPUT); pinMode(echoPin, INPUT);\n'
      + '  lcd.init(); lcd.backlight(); Serial.begin(9600);\n'
      + '}\n'
      + 'void loop() {\n'
      + '  digitalWrite(trigPin, LOW); delayMicroseconds(2);\n'
      + '  digitalWrite(trigPin, HIGH); delayMicroseconds(10);\n'
      + '  digitalWrite(trigPin, LOW);\n'
      + '  long duration = pulseIn(echoPin, HIGH, 25000);\n'
      + '  if (duration == 0) { lcd.setCursor(0,0); lcd.print("Loi: Khong tin hieu"); return; }\n'
      + '  float cm = duration / 58.0;\n'
      + '  lcd.clear();\n'
      + '  lcd.setCursor(0,0); lcd.print("Khoang cach:");\n'
      + '  lcd.setCursor(0,1); lcd.print(cm, 1); lcd.print(" cm");\n'
      + '  delay(200);\n'
      + '}',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'HC-SR04 LCD khoang cach code mau pulseIn LiquidCrystal',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Code mau: TCRT5000 doc analog & phat hien vach den trang',
    LoaiHocLieu: 'Code mau',
    NoiDung: 'const int sensorPin = A0;\n'
      + 'const int NGUONG = 500; // Chinh nguong tuy mat nen\n'
      + 'void setup() { Serial.begin(9600); pinMode(sensorPin, INPUT); }\n'
      + 'void loop() {\n'
      + '  int giatri = analogRead(sensorPin); // 0-1023\n'
      + '  Serial.print("Gia tri: "); Serial.println(giatri);\n'
      + '  if (giatri < NGUONG) {\n'
      + '    Serial.println("-> VACH DEN (hap thu IR)");\n'
      + '  } else {\n'
      + '    Serial.println("-> NEN TRANG (phan xa IR)");\n'
      + '  }\n'
      + '  delay(100);\n'
      + '}\n'
      + '// Luu y: Nguong thay doi theo anh sang moi truong. Hieu chinh truoc khi su dung.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'TCRT5000 analogRead nguong vach den trang do line sensor',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },

  // --- NHOM 3: Meo sua loi (TCPP.02 + DF-05) ---
  {
    TieuDe: 'Meo sua loi: pulseIn() tra ve 0 — HC-SR04 khong co tin hieu',
    LoaiHocLieu: 'Meo sua loi',
    NoiDung: 'Loi: pulseIn(echoPin, HIGH) luon tra ve 0.\n\n'
      + 'Nguyen nhan thuong gap:\n'
      + '1. Day noi ECHO bi long hoac bi dao chan voi Trig.\n'
      + '2. Nguon 5V khong du dong (HC-SR04 can >100mA).\n'
      + '3. Vat can qua gan (<2cm) hoac qua xa (>400cm).\n'
      + '4. Thieu timeout trong pulseIn — may mac ket vo han.\n\n'
      + 'Cach sua:\n'
      + '  // SAI:  long dur = pulseIn(echoPin, HIGH);\n'
      + '  // DUNG: them timeout 25ms\n'
      + '  long dur = pulseIn(echoPin, HIGH, 25000);\n'
      + '  if (dur == 0) { Serial.println("Timeout!"); return; }\n\n'
      + 'Kiem tra phan cung:\n'
      + '- Do dien trang ECHO-GND: phai ~0 Ohm\n'
      + '- Do dien ap VCC HC-SR04: phai 4.8V-5.2V',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'pulseIn timeout HC-SR04 loi 0 sua loi ECHO khoang cach',
    CoCanCapNhat: 1,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Meo sua loi: Servo SG90 rung lien tuc hoac sai goc',
    LoaiHocLieu: 'Meo sua loi',
    NoiDung: 'Loi: Servo rung, run hoac quay sai goc du da goi myServo.write(goc).\n\n'
      + 'Nguyen nhan:\n'
      + '1. Nguon 5V chung voi Arduino khong du dong cho Servo (can 400-700mA).\n'
      + '2. Goi myServo.attach() nhieu lan trong loop().\n'
      + '3. Gia tri goc vuot ngoai [0, 180].\n'
      + '4. Day tin hieu dat gan day dong co (nhieu dien tu).\n\n'
      + 'Cach sua:\n'
      + '  // SAI: goi attach trong loop\n'
      + '  // DUNG:\n'
      + '  void setup() { myServo.attach(9); } // Chi 1 lan\n'
      + '  void loop() {\n'
      + '    int goc = constrain(input, 0, 180);\n'
      + '    myServo.write(goc);\n'
      + '    delay(500);\n'
      + '  }\n\n'
      + 'Nguon: Dung tu dien hoa 100uF song song voi nguon Servo.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'Servo SG90 rung sai goc attach loop sua loi PWM constrain',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Meo sua loi: L298N — Dong co khong quay du da cap nguon',
    LoaiHocLieu: 'Meo sua loi',
    NoiDung: 'Loi: Dong co ket noi L298N nhung khong quay.\n\n'
      + 'Danh sach kiem tra:\n'
      + '1. ENA/ENB chua duoc kich:\n'
      + '   -> analogWrite(ENA, 200); hoac digitalWrite(ENA, HIGH);\n'
      + '   -> Neu co jumper tren ENA/ENB thi thao jumper ra va dung PWM.\n'
      + '2. IN1=IN2 hoac IN3=IN4 (tat dong co):\n'
      + '   -> Phai dung dau: IN1=HIGH, IN2=LOW (tien).\n'
      + '3. Nguon 12V chua noi:\n'
      + '   -> Kiem tra jack barrel cuc tinh (trung tam duong).\n'
      + '   -> Do dien ap: phai > 6V tai chan 12V cua L298N.\n'
      + '4. Dien ap roi qua lon:\n'
      + '   -> L298N roi ~2V. Dong co 5V can cap nguon >= 7V.\n\n'
      + 'Test nhanh:\n'
      + '  digitalWrite(IN1, HIGH); digitalWrite(IN2, LOW);\n'
      + '  analogWrite(ENA, 255);\n'
      + '  // Neu van khong quay: loi phan cung L298N.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'L298N dong co khong quay ENA ENB sua loi nguon',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
  {
    TieuDe: 'Meo sua loi: Loi bien dich C++ — undeclared identifier & missing semicolon',
    LoaiHocLieu: 'Meo sua loi',
    NoiDung: 'Cac loi bien dich pho bien nhat trong Arduino IDE:\n\n'
      + '1. X was not declared in this scope:\n'
      + '   Nguyen nhan: Dung bien truoc khi khai bao, hoac sai pham vi.\n'
      + '   Sua: Khai bao bien o dau chuong trinh, truoc setup().\n\n'
      + '2. Expected ; before }:\n'
      + '   Nguyen nhan: Thieu dau cham phay cuoi cau lenh.\n'
      + '   Sua: Kiem tra dong truoc dau } phai co ;.\n\n'
      + '3. No such file or directory (#include errors):\n'
      + '   Nguyen nhan: Chua cai thu vien.\n'
      + '   Sua: Sketch -> Include Library -> Manage Libraries -> Tim cai.\n\n'
      + '4. A function-definition is not allowed here:\n'
      + '   Nguyen nhan: Dinh nghia ham long nhau.\n'
      + '   Sua: Chuyen dinh nghia ham ra ngoai setup() va loop().\n\n'
      + 'Meo: Doc ky dong loi dau tien — no thuong keo theo cac loi gia sau.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'loi bien dich C++ undeclared identifier semicolon include Arduino IDE',
    CoCanCapNhat: 0,
    NhomChuDe: 'Lap trinh',
  },
  {
    TieuDe: 'Meo sua loi: HC-05 Bluetooth khong ghep doi duoc voi dien thoai',
    LoaiHocLieu: 'Meo sua loi',
    NoiDung: 'Loi: Dien thoai khong tim thay HC-05 hoac ghep doi that bai.\n\n'
      + 'Kiem tra tung buoc:\n'
      + '1. Den LED tren HC-05:\n'
      + '   - Nhap nhanh 2 lan/giay = chua ghep doi (binh thuong)\n'
      + '   - Nhap 1 lan/2 giay = da ghep doi thanh cong\n'
      + '   - Khong nhap = chua co nguon hoac bi hong\n'
      + '2. Ma PIN mac dinh: 1234 hoac 0000.\n'
      + '3. Dien thoai khong tim thay HC-05:\n'
      + '   - Bat Bluetooth va scan lai.\n'
      + '   - Android 12+ yeu cau cap quyen vi tri (Location) cho Bluetooth.\n'
      + '4. SoftwareSerial bi nhieu:\n'
      + '   - Dat dung baud rate: BT.begin(9600) va app cung dat 9600.\n'
      + '   - Khong dung D0/D1 cho SoftwareSerial.',
    TrangThai: 'Xuat ban',
    TuKhoaTimKiem: 'HC-05 Bluetooth ghep doi khong ket noi AT command LED sua loi',
    CoCanCapNhat: 0,
    NhomChuDe: 'Mach dien',
  },
];

// ===========================================================
// DU LIEU MAU: TestCase (TCPP.02 / DF-05)
// ===========================================================
var TEST_CASES_DATA = [
  {
    TenDuAn: 'Xe do line co ban lop 10',
    TieuDeBaiTap: 'Bai tap 1: Do khoang cach bang HC-SR04',
    GoiYSuaLoi: 'Kiem tra pulseIn timeout 25ms. Neu tra ve 0: kiem tra day noi ECHO, nguon 5V du.',
    TyLeLoi: 0.42,
  },
  {
    TenDuAn: 'Xe do line co ban lop 10',
    TieuDeBaiTap: 'Bai tap 2: Dieu khien Servo SG90 theo goc',
    GoiYSuaLoi: 'Chi goi attach() trong setup(). Dung constrain(goc, 0, 180). Nguon Servo rieng biet.',
    TyLeLoi: 0.18,
  },
  {
    TenDuAn: 'Robot Bluetooth dieu khien tu xa',
    TieuDeBaiTap: 'Bai tap 3: Truyen lenh Bluetooth HC-05',
    GoiYSuaLoi: 'Dat dung baudrate 9600 ca hai phia. Rut day TX/RX khi nap code.',
    TyLeLoi: 0.25,
  },
  {
    TenDuAn: 'Xe do line PID lop 10',
    TieuDeBaiTap: 'Bai tap 4: Lap trinh PID xe do line TCRT5000',
    GoiYSuaLoi: 'Bat dau Kp=20, Kd=10. Tang Kp neu xe chay cham. Tang Kd neu dao dong. Ki giu nho.',
    TyLeLoi: 0.35,
  },
  {
    TenDuAn: 'Robot Bluetooth dieu khien tu xa',
    TieuDeBaiTap: 'Bai tap 5: Dieu khien 2 dong co qua L298N',
    GoiYSuaLoi: 'ENA/ENB phai duoc cap PWM. IN1 khac IN2 de dong co quay. Nguon >=7V cho dong co 5V.',
    TyLeLoi: 0.31,
  },
];

// ===========================================================
// THUC THI SEED
// ===========================================================
async function seed() {
  var pool;
  try {
    console.log('[DB] Connecting to ' + DB_NAME + ' ...');
    pool = await sql.connect(buildConfig());
    console.log('[DB] Connected OK\n');

    // --- KhoaHocLoTrinh ---
    console.log('=== KhoaHocLoTrinh ===');
    var maKhoaMap = {};
    for (var i = 0; i < KHOA_HOC.length; i++) {
      var kh = KHOA_HOC[i];
      var check = await pool.request()
        .input('ten', sql.NVarChar, kh.TenKhoaHoc)
        .query('SELECT MaKhoaHoc FROM KhoaHocLoTrinh WHERE TenKhoaHoc = @ten');
      if (check.recordset.length > 0) {
        maKhoaMap[kh.TenKhoaHoc] = check.recordset[0].MaKhoaHoc;
        console.log('  [SKIP] ' + kh.TenKhoaHoc + ' (MaKhoaHoc=' + maKhoaMap[kh.TenKhoaHoc] + ')');
      } else {
        var ins = await pool.request()
          .input('ten', sql.NVarChar, kh.TenKhoaHoc)
          .input('mo',  sql.NVarChar, kh.MoTa)
          .input('cap', sql.NVarChar, kh.CapDo)
          .query('INSERT INTO KhoaHocLoTrinh (TenKhoaHoc, MoTa, CapDo) OUTPUT INSERTED.MaKhoaHoc VALUES (@ten, @mo, @cap)');
        maKhoaMap[kh.TenKhoaHoc] = ins.recordset[0].MaKhoaHoc;
        console.log('  [OK]   ' + kh.TenKhoaHoc + ' -> MaKhoaHoc=' + maKhoaMap[kh.TenKhoaHoc]);
      }
    }

    var chuDeMap = {
      'Co khi':    maKhoaMap['Co khi Robot STEM'],
      'Mach dien': maKhoaMap['Mach dien & Linh kien'],
      'Lap trinh': maKhoaMap['Lap trinh Nhung'],
    };

    // --- HocLieu ---
    console.log('\n=== HocLieu ===');
    for (var j = 0; j < HOC_LIEU_DATA.length; j++) {
      var hl = HOC_LIEU_DATA[j];
      var chk = await pool.request()
        .input('tieu', sql.NVarChar, hl.TieuDe)
        .query('SELECT MaHocLieu FROM HocLieu WHERE TieuDe = @tieu');
      if (chk.recordset.length > 0) {
        console.log('  [SKIP] ' + hl.TieuDe.substring(0, 55));
        continue;
      }
      var maKhoa = chuDeMap[hl.NhomChuDe] || null;
      await pool.request()
        .input('tieu', sql.NVarChar,          hl.TieuDe)
        .input('loai', sql.NVarChar(100),      hl.LoaiHocLieu)
        .input('noi',  sql.NVarChar(sql.MAX),  hl.NoiDung)
        .input('tt',   sql.NVarChar(50),       hl.TrangThai)
        .input('ma',   sql.Int,                2)
        .input('mk',   sql.Int,                maKhoa)
        .input('tk',   sql.NVarChar(500),      hl.TuKhoaTimKiem)
        .input('ccu',  sql.Bit,                hl.CoCanCapNhat)
        .query('INSERT INTO HocLieu (TieuDe, LoaiHocLieu, NoiDung, TrangThai, MaNguoiDung, MaKhoaHoc, TuKhoaTimKiem, CoCanCapNhat) '
             + 'VALUES (@tieu, @loai, @noi, @tt, @ma, @mk, @tk, @ccu)');
      console.log('  [OK]   ' + hl.TieuDe.substring(0, 55));
    }

    // --- DuAnBaiTap + TestCase ---
    console.log('\n=== DuAnBaiTap & TestCase ===');
    for (var k = 0; k < TEST_CASES_DATA.length; k++) {
      var tc = TEST_CASES_DATA[k];
      var maDuAn;
      var chkDA = await pool.request()
        .input('ten', sql.NVarChar, tc.TenDuAn)
        .query('SELECT MaDuAn FROM DuAnBaiTap WHERE TenDuAn = @ten');
      if (chkDA.recordset.length > 0) {
        maDuAn = chkDA.recordset[0].MaDuAn;
      } else {
        var insDA = await pool.request()
          .input('ten', sql.NVarChar, tc.TenDuAn)
          .input('ma',  sql.Int, 2)
          .query('INSERT INTO DuAnBaiTap (TenDuAn, MaNguoiDung) OUTPUT INSERTED.MaDuAn VALUES (@ten, @ma)');
        maDuAn = insDA.recordset[0].MaDuAn;
      }

      var chkTC = await pool.request()
        .input('tieu', sql.NVarChar, tc.TieuDeBaiTap)
        .query('SELECT MaTestCase FROM TestCase WHERE TieuDe = @tieu');
      if (chkTC.recordset.length > 0) {
        console.log('  [SKIP] TestCase: ' + tc.TieuDeBaiTap.substring(0, 45));
        continue;
      }
      await pool.request()
        .input('mada', sql.Int,                maDuAn)
        .input('tieu', sql.NVarChar,           tc.TieuDeBaiTap)
        .input('goiy', sql.NVarChar(sql.MAX),  tc.GoiYSuaLoi)
        .input('tyLe', sql.Float,              tc.TyLeLoi)
        .query('INSERT INTO TestCase (MaDuAn, TieuDe, GoiYSuaLoi, TyLeLoi) VALUES (@mada, @tieu, @goiy, @tyLe)');

      if (tc.TyLeLoi > 0.30) {
        await pool.request()
          .input('goiy', sql.NVarChar, tc.GoiYSuaLoi.substring(0, 10))
          .query('UPDATE HocLieu SET CoCanCapNhat = 1 WHERE CoCanCapNhat = 0 AND TuKhoaTimKiem LIKE (N\'%\' + @goiy + N\'%\')');
        console.log('  [DF-05] TyLeLoi=' + (tc.TyLeLoi * 100).toFixed(0) + '% > 30% -> CoCanCapNhat=1');
      }
      console.log('  [OK]   TestCase: ' + tc.TieuDeBaiTap.substring(0, 45));
    }

    // Bao cao cuoi
    var counts = await pool.request().query(
      'SELECT '
      + '(SELECT COUNT(*) FROM KhoaHocLoTrinh) AS KhoaHoc,'
      + '(SELECT COUNT(*) FROM HocLieu)        AS HocLieu,'
      + '(SELECT COUNT(*) FROM DuAnBaiTap)     AS DuAn,'
      + '(SELECT COUNT(*) FROM TestCase)       AS TestCase,'
      + '(SELECT COUNT(*) FROM HocLieu WHERE CoCanCapNhat=1) AS CanCapNhat'
    );
    var r = counts.recordset[0];
    console.log('\n=== KET QUA CUOI ===');
    console.log('  KhoaHocLoTrinh : ' + r.KhoaHoc);
    console.log('  HocLieu        : ' + r.HocLieu + ' (' + r.CanCapNhat + ' can cap nhat DF-05)');
    console.log('  DuAnBaiTap     : ' + r.DuAn);
    console.log('  TestCase       : ' + r.TestCase);
    console.log('\n[SEED HOAN THANH] Phan he 2 — Pham Thi Ha Vy');
  } catch (err) {
    console.error('[LOI] ' + err.message);
    process.exit(1);
  } finally {
    if (pool) await pool.close();
  }
}

seed();
module.exports = { seed };
