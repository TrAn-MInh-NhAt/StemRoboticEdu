# 🤖 HỆ THỐNG HỌC TẬP VÀ QUẢN LÝ ĐÀO TẠO STEM ROBOTIC CẤP TRUNG HỌC

> **ĐẠI HỌC ĐÀ NẴNG — TRƯỜNG ĐẠI HỌC SƯ PHẠM — KHOA TOÁN - TIN**  
> **Người hướng dẫn khoa học:** TS. Đặng Hùng Vĩ  
> **Nhóm sinh viên thực hiện:**  
> - Phạm Kỳ Hải (23SPT)  
> - Trần Minh Nhật (23SPT)  
> - Phạm Thị Hà Vy (24SPT)  
> - Trần Thế Quân (24CNTT1)  
> - Nguyễn Thị Thanh Thảo (24CNTT1)  
>
> **Lớp:** 24SPT · **Năm học:** 2026

---

## 📌 Lịch Sử Cập Nhật & Tiến Độ Dự Án (Milestones & Changelog)

| Phiên bản | Mốc Thời Gian | Trạng Thái 27/27 IPO | Luồng DF-01..07 | Kiểm Thử Tự Động | Tài Liệu Chi Tiết |
|:---:|:---:|:---:|:---:|:---:|:---:|
| **v2.0.0 (Milestone 2)** | **14/11/2026 (Chiều)** | **27/27 Hoàn Thành (100%)** | **7/7 Kích Hoạt (100%)** | **37/37 PASS (100%)** | [Xem CHANGELOG.md](CHANGELOG.md) · [Judge Engine Guide](judge_engine/README.md) |
| **v1.0.0 (Milestone 1)** | 14/11/2026 (Sáng) | 19/27 Khởi Tạo | 7/7 Kiến Trúc Cốt Lõi | Sơ bộ | [Xem CHANGELOG.md](CHANGELOG.md) |

> 🎯 **Đánh giá tổng quan:** Hệ thống đã hoàn thiện 100% tất cả 27 mô đun IPO, 7 luồng tự động DF-01 đến DF-07, đạt chuẩn chất lượng NFR-01 (< 10s máy chấm), bảo mật phân quyền RBAC 4 vai trò, và vượt qua toàn bộ 37/37 kịch bản kiểm thử tích hợp E2E (`npm test`). Chi tiết toàn bộ tiến trình lịch sử phát triển xem tại [CHANGELOG.md](CHANGELOG.md).

---

## 📖 1. Giới Thiệu Tổng Quan Dự Án

Hệ thống **STEM Robotic Edu** là nền tảng trực tuyến chuyên sâu hỗ trợ dạy, học và thực hành lập trình điều khiển Robot (C++/Arduino & Python) dành cho học sinh cấp Trung học. Nền tảng giải quyết triệt để bài toán đánh giá sản phẩm thực hành bằng cách kết hợp **Máy chấm tự động Sandbox cô lập (Judge Engine)** kiểm thử mã nguồn và **Quy trình nghiệm thu Video vận hành mô hình thực tế**.

Toàn bộ hệ thống được xây dựng trên nguyên tắc **Single Source of Truth** đối chiếu trực tiếp từ file `PRODUCT.md`, tuân thủ cấu trúc CSDL chuẩn hóa `database_schema.sql` (Database: `StemRoboticDB_V2`) và phong cách thiết kế **Neo-Brutalist & Bento Grid** (`/css/theme.css`).

---

## 🏗️ 2. Kiến Trúc Hệ Thống (Fullstack Microservices)

```
+-----------------------------------------------------------------------------------+
|                        TRÌNH DUYỆT NGƯỜI DÙNG (CLIENT)                            |
|   - Design System: Neo-Brutalist & Bento Grid (/css/theme.css)                    |
|   - Typography: Bricolage Grotesque & Be Vietnam Pro | 100% SVG Vector (Anti-Slop)|
|   - Cổng người dùng: / (Home), /login, /student, /teacher, /exam, /community,     |
|                      /admin, /profile                                             |
+----------------------------------------+------------------------------------------+
                                         | HTTP/REST (Port 80)
                                         v
+-----------------------------------------------------------------------------------+
|                    WEB APPLICATION SERVER (NODE.JS & EXPRESS)                     |
|   - Cổng mạng: Port 80                                                            |
|   - Template Engine: EJS (Server-Side Rendering)                                  |
|   - Cơ chế bảo vệ: Session-based Auth & Role-based Access Control (RBAC)          |
|   - Proxy kết nối: mssql (TDS Protocol) & Judge Proxy Service                    |
+----------------------+------------------------------------+-----------------------+
                       |                                    |
                       | Giao tiếp HTTP REST (Port 5000)   | Truy vấn dữ liệu T-SQL
                       v                                    v
+---------------------------------------+  +----------------------------------------+
|    JUDGE ENGINE (PYTHON FASTAPI)      |  |          MICROSOFT SQL SERVER          |
|  - Cổng mạng: Port 5000               |  |  - CSDL: StemRoboticDB_V2              |
|  - Framework: FastAPI & Uvicorn       |  |  - 12 Bảng chuẩn hóa BCNF              |
|  - Sandbox: Subprocess cô lập (3.0s)  |  |  - Kiểu dữ liệu tiếng Việt NVARCHAR    |
|  - Mock Hardware: arduino_mock.h      |  |  - Bảo toàn lịch sử khi xóa mềm (DF-07)|
|  - Phân tích lỗi: error_analyzer.py   |  |  - Cổng mạng mặc định: 1433            |
+---------------------------------------+  +----------------------------------------+
```

---

## 📋 3. Bảng Đối Chiếu 27/27 Mô Đun IPO & 7 Luồng Tự Động (DF-01 đến DF-07)

Hệ thống đã triển khai đầy đủ và vượt qua kiểm thử tự động 100% cho toàn bộ **27 mô đun IPO** và **7 luồng dữ liệu tự động**:

### Phân Hệ 1: Quản Lý Hệ Thống & Người Dùng
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **QLTK.01** | Đăng ký & Khởi tạo tài khoản | `server/routes/auth.js` | `server/views/login.ejs` |
| **QLTK.02** | Đăng nhập & Xác thực phiên | `server/routes/auth.js` | `server/views/login.ejs` |
| **QLTK.03** | Khôi phục mật khẩu OTP 6 số | `server/routes/auth.js` | `server/views/login.ejs` |
| **QTHT.01** | Phân quyền & Quản lý vai trò | `server/routes/admin.js` | `server/views/dashboard/admin.ejs` |
| **QTHT.02** | Cập nhật hồ sơ & Đổi mật khẩu | `server/routes/auth.js` | `server/views/pages/profile.ejs` |
| **QTHT.03** | Khóa mềm / Vô hiệu hóa tài khoản | `server/routes/admin.js` | `server/views/dashboard/admin.ejs` |
| **DF-07** | Luồng bảo toàn lịch sử khi khóa | `server/routes/admin.js`, `server/routes/auth.js` | `server/views/dashboard/admin.ejs` |

### Phân Hệ 2: Quản Lý Học Liệu & Khóa Học
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **QTHL.01** | Thêm mới bài giảng & học liệu | `server/routes/materials.js` | `server/views/dashboard/teacher.ejs` |
| **QTHL.02** | Cập nhật & Ẩn/Hiện học liệu | `server/routes/materials.js` | `server/views/dashboard/teacher.ejs` |
| **DF-05** | Tắt cờ cảnh báo lỗi khi cập nhật | `server/routes/materials.js` | `server/views/dashboard/teacher.ejs` |
| **TCPP.01** | Cây lộ trình & Học liệu đính kèm | `server/routes/pages.js` | `server/views/dashboard/student.ejs` |
| **TCPP.02** | Trạm tra cứu linh kiện & Bắt lỗi | `server/routes/materials.js` | `server/views/dashboard/student.ejs` |

### Phân Hệ 3: Quản Lý Dự Án & Tiến Độ
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **QLDA.01** | Giao dự án STEM & TestCases | `server/routes/teacher.js`, `server/routes/submissions.js` | `server/views/dashboard/teacher.ejs` |
| **QLDA.02** | Mở khóa thử thách nâng cao | `server/routes/submissions.js` | `server/views/dashboard/student.ejs` |
| **DF-02** | Luồng tự động tháo khóa dự án | `server/routes/submissions.js` | `server/views/dashboard/student.ejs` |
| **KTĐG.01** | Theo dõi tiến độ nộp bài cả lớp | `server/routes/teacher.js` | `server/views/dashboard/teacher.ejs` |
| **KTĐG.02** | Khởi tạo phiên phòng thi trực tuyến | `server/routes/exam.js` | `server/views/exam.ejs` |
| **DF-06** | Giám sát tab & Tự động khóa bài thi | `server/routes/exam.js` | `server/views/exam.ejs` |

### Phân Hệ 4: Xử Lý Bài Nộp & Đánh Giá Máy Chấm
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **XLBN.01** | Tiếp nhận bài nộp (Code + Video) | `server/routes/submissions.js` | `server/views/dashboard/student.ejs` |
| **XLBN.02** | Máy chấm biên dịch Sandbox cô lập | `judge_engine/services/sandbox.py`, `judge_engine/routers/judge.py` | `judge_engine/` (Port 5000) |
| **XLBN.03** | Phản hồi điểm & Thời gian chạy | `judge_engine/services/runner.py`, `server/routes/submissions.js` | `server/views/dashboard/student.ejs` |
| **DF-04** | Bắt log lỗi lập trình sư phạm | `judge_engine/services/error_analyzer.py` | `server/views/dashboard/student.ejs` |
| **DF-01** | Đạt 100% TestCase chuyển duyệt video | `server/routes/submissions.js` | `server/views/dashboard/student.ejs`, `teacher.ejs` |
| **KQBN.01** | Giáo viên kiểm duyệt video vận hành | `server/routes/submissions.js` | `server/views/dashboard/teacher.ejs` |
| **KQBN.02** | Chốt điểm chính thức & Lưu minh chứng | `server/routes/submissions.js` | `server/views/dashboard/teacher.ejs` |

### Phân Hệ 5: Báo Cáo, Thống Kê
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **TKDL.01** | Thống kê nộp bài & Điểm trung bình | `server/routes/admin.js`, `server/routes/teacher.js` | `server/views/dashboard/admin.ejs`, `teacher.ejs` |
| **TKDL.02** | Phân tích tỷ lệ lỗi phổ biến | `server/routes/teacher.js` | `server/views/dashboard/teacher.ejs` |
| **XBC.01** | Bảng xếp hạng & Trích xuất dữ liệu | `server/routes/pages.js`, `server/routes/community.js` | `server/views/index.ejs`, `community.ejs` |
| **DF-03** | Cập nhật Top Trending thời gian thực | `server/routes/community.js`, `server/routes/pages.js` | `server/views/index.ejs`, `community.ejs` |
| **XBC.02** | Xuất bảng điểm CSV & Lưu lịch sử | `server/routes/reports.js` | `server/views/dashboard/teacher.ejs`, `admin.ejs` |

### Phân Hệ 6: Tương Tác Cộng Đồng & Hỗ Trợ Kỹ Thuật
| Mã Mô Đun | Tên Mô Đun IPO / Luồng | File Mã Nguồn Xử Lý | Giao Diện Hiển Thị |
|:---:|:---|:---|:---|
| **TTCĐ.01** | Diễn đàn trao đổi kỹ thuật | `server/routes/community.js` | `server/views/community.ejs` |
| **TTCĐ.02** | Bình chọn dự án & Wall of Fame | `server/routes/community.js` | `server/views/community.ejs` |
| **HTTB.01** | Phiếu phản hồi & Báo cáo sự cố | `server/routes/support.js` | `server/views/dashboard/student.ejs`, `teacher.ejs`, `admin.ejs` |
| **HTTB.02** | Thông báo hệ thống khẩn cấp | `server/routes/support.js` | `server/views/dashboard/student.ejs`, `teacher.ejs`, `admin.ejs` |

---

## 📚 4. Giáo Trình & Lộ Trình Đào Tạo STEM Đã Seed Vào CSDL

Dữ liệu được nạp tự động qua script idempotent `server/seed_full_curriculum.js`:

1. **Lộ trình #01: Lập trình Arduino Cơ bản & Tín hiệu I/O (`KhoaHocLoTrinh #1`)**
   - **Học liệu & Linh kiện:** Bo mạch Arduino Uno R3, Đèn LED & Điện trở hạn dòng, Kỹ thuật điều chế xung PWM.
   - **Dự án thực hành:** Dự án 1 — Lập trình đèn LED nhấp nháy theo mã tín hiệu Morse SOS (`DuAnBaiTap #1`).
   - **TestCases chấm tự động:** 3 TestCases (Input `1` -> `LED_ON`, Input `0` -> `LED_OFF`, Input `SOS` -> `3_SHORT_3_LONG_3_SHORT`).
2. **Lộ trình #02: Điều Khiển Robot Tránh Vật Cản & Cầu H L298N (`KhoaHocLoTrinh #2`)**
   - **Học liệu & Linh kiện:** Cảm biến siêu âm HC-SR04 đo khoảng cách, Mạch cầu H L298N điều khiển 2 kênh động cơ DC.
   - **Dự án thực hành:** Dự án 2 — Robot dò đường và tự động né chướng ngại vật trong mê cung (`DuAnBaiTap #2`).
   - **TestCases chấm tự động:** 3 TestCases (Khoảng cách an toàn `> 20cm`, Phanh gấp `<= 10cm`, Rẽ nhánh `LEFT/RIGHT`).
   - **Cơ chế tiên quyết (`DF-02`):** Yêu cầu hoàn thành Dự án 1 trước khi mở khóa.
3. **Lộ trình #03: Xe Tự Hành Cân Bằng 2 Bánh & Thị Giác AI (`KhoaHocLoTrinh #3`)**
   - **Học liệu & Linh kiện:** Cảm biến góc nghiêng con quay MPU6050 I2C, Thuật toán cân bằng PID (Proportional-Integral-Derivative).
   - **Dự án thực hành:** Dự án 3 — Xe tự hành 2 bánh cân bằng quán tính ngược (`DuAnBaiTap #3`).
   - **TestCases chấm tự động:** 3 TestCases (Góc bù nghiêng `ANGLE_TILT`, Hiệu chỉnh công suất `PWM_DUTY`, Phanh hãm `STOP`).
   - **Cơ chế thẩm định (`DF-01`):** Chấm đạt 100% TestCase -> Giáo viên duyệt video xe chạy thực tế trên sa bàn.

---

## 👥 5. Danh Sách Tài Khoản Mẫu Phục Vụ Đánh Giá & Demo

| Vai trò | Họ tên | Email đăng nhập | Mật khẩu | Chức năng chính |
|:---|:---|:---|:---:|:---|
| **Quản Trị Viên (Admin)** | Quản Trị Viên Hệ Thống | `admin@stemrobotic.edu.vn` | `123456` | `/admin` — Quản trị tài khoản, Khóa mềm (`DF-07`), Xử lý sự cố (`HTTB.01`), Phát thông báo bảo trì (`HTTB.02`) |
| **Giáo Viên (Teacher)** | TS. Đặng Hùng Vĩ | `gv.hungvi@stemrobotic.edu.vn` | `123456` | `/teacher` — Duyệt video (`DF-01`), Chốt điểm, Giao dự án & TestCase (`QLDA.01`), Quản lý học liệu (`QTHL.01/02`) |
| **Học Sinh (Quán quân)** | Trần Minh Nhật | `hs.minhnhat@stemrobotic.edu.vn` | `123456` | `/student` — Lộ trình học, Nạp code mẫu, Máy chấm tự động, Tra cứu linh kiện & sửa lỗi (`TCPP.02`) |
| **Học Sinh (Thí sinh)** | Lê Hoàng Nam | `hs.hoangnam@stemrobotic.edu.vn` | `123456` | `/exam` — Tham gia phòng thi trực tuyến khép kín, Kiểm thử giám sát chuyển tab (`DF-06`) |

---

## 🧪 6. Chạy Kiểm Thử Khép Kín Hệ Thống (E2E Test Suite)

Dự án trang bị bộ kịch bản kiểm thử toàn diện 37/37 bài test tự động bao quát toàn bộ 27 mô đun và 7 luồng tự động.

Chạy lệnh kiểm thử bằng 1 câu lệnh duy nhất:
```bash
npm test
```
*Hoặc thực thi trực tiếp:*
```bash
node server/tests/full_system_test.js
```

### Kết quả đầu ra mẫu:
```
========================================================================
       STEM ROBOTIC EDU — BỘ KIỂM THỬ KHÉP KÍN TOÀN HỆ THỐNG           
                 27/27 MÔ ĐUN IPO & 7 LUỒNG TỰ ĐỘNG                     
========================================================================

========================================================================
 0. KIỂM TRA HẠ TẦNG KỸ THUẬT & KẾT NỐI SERVER
========================================================================
  ✓ [PASS] [INFRA.01] Kết nối CSDL SQL Server (StemRoboticDB_V2)
  ✓ [PASS] [INFRA.02] Dịch vụ Máy Chấm Tự Động FastAPI (Cổng 5000)
  ✓ [PASS] [INFRA.03] Máy chủ Web Node.js/Express (Cổng 80 - Trang chủ)

========================================================================
 PHÂN HỆ 1 ĐẾN PHÂN HỆ 6: 27 MÔ ĐUN IPO & 7 LUỒNG TỰ ĐỘNG (DF-01..07)
========================================================================
  ✓ [PASS] 37/37 Bài kiểm thử đạt yêu cầu tuyệt đối!
  ★★★★★ 100% CÁC MÔ ĐUN VÀ LUỒNG TỰ ĐỘNG ĐÃ VƯỢT QUA KIỂM THỬ THÀNH CÔNG! ★★★★★
```

---

## 🚀 7. Hướng Dẫn Cài Đặt & Vận Hành Từ A - Z

### Bước 1: Yêu cầu môi trường
- **Node.js**: v20.x hoặc v22.x LTS.
- **Python**: v3.10+ hoặc v3.11+.
- **Microsoft SQL Server**: 2019 hoặc 2022 (Developer / Express).

### Bước 2: Thiết lập Cơ sở dữ liệu SQL Server
1. Mở **SQL Server Management Studio (SSMS)**.
2. Mở file [database_schema.sql](database_schema.sql) và nhấn **Execute (F5)** để tạo CSDL `StemRoboticDB_V2`.
3. Chạy script seed dữ liệu chuẩn hóa:
   ```bash
   node server/seed_full_curriculum.js
   ```

### Bước 3: Cấu hình tệp `.env`
Tạo file `.env` tại thư mục gốc của dự án:
```ini
PORT=80
DB_SERVER=ADMIN-PC\\SQLEXPRESS
DB_NAME=StemRoboticDB_V2
DB_USER=sa
DB_PASSWORD=YourPassword123
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true
JUDGE_URL=http://localhost:5000
SESSION_SECRET=stem_robotic_secure_session_2026
```

### Bước 4: Khởi chạy Máy chấm tự động (Judge Engine — Cổng 5000)
```powershell
cd judge_engine
pip install fastapi uvicorn pydantic python-multipart
python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```

### Bước 5: Khởi chạy Máy chủ Web (Node.js Express — Cổng 80)
```powershell
cd server
npm install
npm start
```
Truy cập trình duyệt: `http://localhost/`.

---

## 📁 8. Cấu Trúc Mã Nguồn Dự Án

```
LapTrinhWeb/
├── .env                         # Biến môi trường kết nối CSDL và Judge
├── database_schema.sql          # Kịch bản DDL 12 bảng CSDL StemRoboticDB_V2
├── GEMINI.md                    # Quy chuẩn thiết kế Neo-Brutalist & Single Source of Truth
├── PRODUCT.md                   # Đặc tả hệ thống (6 phân hệ, 27 mô đun, 7 DF)
├── README.md                    # Tài liệu tổng quan dự án và hướng dẫn vận hành
├── package.json                 # Cấu hình scripts (npm test, npm start, npm run seed)
│
├── public/                      # Tài nguyên tĩnh phía máy khách
│   ├── css/
│   │   └── theme.css            # Hệ thống thiết kế Neo-Brutalist, Bento Grid, Keyframes
│   └── js/
│       └── login.js             # Logic xác thực đăng nhập và thông báo
│
├── server/                      # Ứng dụng Web Server chính (Node.js & Express)
│   ├── config/
│   │   └── db.js                # Quản lý Connection Pool kết nối SQL Server
│   ├── middleware/
│   │   └── authMiddleware.js    # Phân quyền RBAC (isStudent, isTeacher, isAdmin)
│   ├── routes/
│   │   ├── admin.js             # Phân hệ 1: Quản trị tài khoản, Khóa mềm DF-07
│   │   ├── auth.js              # Phân hệ 1: Đăng ký, Đăng nhập, OTP, Hồ sơ cá nhân
│   │   ├── community.js         # Phân hệ 6: Diễn đàn, Wall of Fame, Bình chọn DF-03
│   │   ├── exam.js              # Phân hệ 3: Phòng thi trực tuyến, Chuyển tab DF-06
│   │   ├── judgeProxy.js        # Phân hệ 4: Proxy máy chấm, Giám sát trạng thái
│   │   ├── materials.js         # Phân hệ 2: Quản lý học liệu, Tắt cờ DF-05, Tra cứu
│   │   ├── pages.js             # Render SSR các trang EJS
│   │   ├── reports.js           # Phân hệ 5: Xuất bảng điểm CSV, Báo cáo in ấn
│   │   ├── submissions.js       # Phân hệ 4: Nộp bài, Máy chấm, Duyệt video DF-01/DF-02
│   │   ├── support.js           # Phân hệ 6: Phiếu báo cáo sự cố, Thông báo bảo trì
│   │   └── teacher.js           # Phân hệ 3 & 5: Giao bài, Quản lý lớp, Thống kê
│   ├── views/                   # Giao diện Server-Side Rendering (EJS)
│   │   ├── dashboard/
│   │   │   ├── admin.ejs        # Bảng điều khiển Quản trị viên
│   │   │   ├── student.ejs      # Không gian học tập & Nộp bài học sinh
│   │   │   └── teacher.ejs      # Cổng thông tin Giảng viên
│   │   ├── community.ejs        # Diễn đàn & Bảng vinh danh Wall of Fame
│   │   ├── exam.ejs             # Phòng thi trực tuyến chống gian lận
│   │   ├── index.ejs            # Trang chủ hệ thống & Showcase Bento
│   │   ├── login.ejs            # Trang đăng nhập, đăng ký & quên mật khẩu
│   │   ├── pages/profile.ejs    # Trang hồ sơ cá nhân & Đổi mật khẩu
│   │   └── print_report.ejs     # Mẫu in bảng điểm chuẩn trường học
│   ├── seed_full_curriculum.js  # Kịch bản nạp giáo trình và lộ trình mẫu
│   ├── tests/
│   │   └── full_system_test.js  # Kịch bản kiểm thử tự động 27 mô đun (npm test)
│   └── server.js                # Điểm khởi chạy Web Server
│
└── judge_engine/                # Dịch vụ máy chấm tự động (Python FastAPI)
    ├── routers/
    │   └── judge.py             # Điều phối API máy chấm và trạng thái
    ├── services/
    │   ├── arduino_mock.h       # Mock phần cứng Arduino C++
    │   ├── error_analyzer.py    # Phân tích cú pháp & Bắt log lỗi sư phạm DF-04
    │   ├── runner.py            # Chấm điểm đối chiếu TestCase và đo thời gian
    │   └── sandbox.py           # Bộ thực thi Sandbox cô lập (Timeout 3.0s)
    ├── main.py                  # Điểm khởi chạy FastAPI
    └── README.md                # Tài liệu kỹ thuật chi tiết của máy chấm
```

---

## 🛡️ Giấy Phép & Bản Quyền
Dự án được phát triển phục vụ mục đích nghiên cứu và đào tạo STEM tại **Trường Đại học Sư phạm — Đại học Đà Nẵng**. Mọi quyền được bảo lưu © 2026.
