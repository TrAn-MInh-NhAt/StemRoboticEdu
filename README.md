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

## 📖 1. Giới Thiệu Tổng Quan Dự Án

Hệ thống **STEM Robotic Edu** là nền tảng trực tuyến chuyên sâu hỗ trợ dạy, học và thực hành lập trình điều khiển Robot (C++/Arduino & Python) dành cho học sinh cấp Trung học. Nền tảng giải quyết triệt để bài toán đánh giá sản phẩm thực hành bằng cách kết hợp **Máy chấm tự động (Judge Engine)** kiểm thử mã nguồn và **Quy trình nghiệm thu Video vận hành mô hình thực tế**.

### 1.1. Sáu Phân Hệ Quản Trị (Subsystems)
1. **MOD-01 — Quản lý Hệ thống & Người dùng (`/admin`, `/login`):** Quản lý tài khoản đa vai trò (Admin, Giáo viên, Học sinh), phân quyền truy cập và thực thi cơ chế khóa mềm (Soft Delete).
2. **MOD-02 — Quản lý Học liệu & Khóa học (`/student`, `/teacher`):** Quản lý bài giảng, video hướng dẫn, sơ đồ mạch nguyên lý 3D, code mẫu và cây lộ trình đào tạo từ cơ bản đến nâng cao.
3. **MOD-03 — Quản lý Dự án & Tiến độ (`/teacher`, `/exam`):** Giáo viên giao dự án kèm bộ kiểm thử (Test Case), kiểm soát điều kiện tiên quyết và tổ chức phòng thi trực tuyến.
4. **MOD-04 — Xử lý Bài nộp & Đánh giá (`/student`, Judge Engine):** Tiếp nhận bài nộp đa phương tiện (mã nguồn + link video), tự động biên dịch và chạy Test Case trong môi trường cô lập, trả kết quả và log lỗi tức thì.
5. **MOD-05 — Báo cáo & Thống kê (`/teacher`, `/admin`):** Thống kê chất lượng học tập, phân tích tỷ lệ bài nộp lỗi, cảnh báo cập nhật bài giảng tự động và xuất báo cáo CSV/Excel.
6. **MOD-06 — Tương tác Cộng đồng & Vinh danh (`/community`):** Bảng vinh danh Wall of Fame cho các dự án xuất sắc, diễn đàn trao đổi chuyên môn, hỏi đáp kỹ thuật robot.

### 1.2. Mười Hai Chức Năng Cốt Lõi (Core Capabilities)
- **FR-01:** Đăng ký, đăng nhập và bảo mật phiên theo vai trò.
- **FR-02:** Quản lý hồ sơ cá nhân và trạm học tập.
- **FR-03:** Tra cứu lộ trình đào tạo, sơ đồ linh kiện và nguyên lý mạch.
- **FR-04:** Tải mã nguồn mẫu (`.ino`, `.cpp`, `.py`) và học liệu kỹ thuật.
- **FR-05:** Tạo đề bài thực hành STEM và cấu hình bộ dữ liệu Test Case.
- **FR-06:** Nộp bài thực hành đa phương tiện (Source code & Video vận hành).
- **FR-07:** Máy chấm code tự động tốc độ cao (< 0.05s) qua sandbox cách ly.
- **FR-08:** Giáo viên kiểm duyệt video thực tế, nhập nhận xét sư phạm và chốt điểm.
- **FR-09:** Xuất báo cáo điểm tổng kết (`.csv`) và theo dõi tiến độ cá nhân.
- **FR-10:** Diễn đàn trao đổi lỗi code, thảo luận kỹ thuật và hỏi đáp.
- **FR-11:** Bảng vàng vinh danh (Wall of Fame) và bình chọn dự án robot ấn tượng.
- **FR-12:** Thi trực tuyến chống gian lận chuyển tab có đếm ngược thời gian thực.

### 1.3. Bảy Luồng Dữ Liệu Tự Động Hóa Đột Phá (Automated Data Flows)
| Mã luồng | Tên luồng nghiệp vụ | Cơ chế xử lý tự động |
| :---: | :--- | :--- |
| **DF-01** | **Chấm Code Đạt → Duyệt Video** | Học sinh nộp code, máy chấm tự động chạy Test Case. Nếu pass 100%, hệ thống mới kích hoạt trạng thái cho Giáo viên duyệt video phần cứng (tiết kiệm 60% thời gian chấm cho giáo viên). |
| **DF-02** | **Chốt Điểm → Tự Động Mở Khóa Dự Án** | Khi giáo viên chốt điểm bài tập tiên quyết đạt yêu cầu, hệ thống tự động tháo khóa dự án nâng cao tiếp theo trên Dashboard của học sinh mà không cần can thiệp thủ công. |
| **DF-03** | **Bảng Vàng Top Trending & Wall of Fame** | Tự động phân tích điểm tổng kết cao nhất, video robot vận hành thực tế và lượt bình chọn cộng đồng để tôn vinh học sinh lên Bảng Vàng Trang Chủ và `/community`. |
| **DF-04** | **Phân Tích Điểm Yếu & Bắt Log Lỗi** | Máy chấm tự động trích xuất các lỗi biên dịch, lỗi logic và cú pháp đẩy ngầm về cơ sở dữ liệu `KetQuaDiem` để thống kê độ khó của bài tập. |
| **DF-05** | **Tự Động Cảnh Báo Cập Nhật Học Liệu** | Khi một dự án có tỷ lệ học sinh mắc lỗi vượt ngưỡng **> 30%**, hệ thống tự động gắn cờ `CoCanCapNhat = 1` trong bảng `HocLieu` và hiển thị cảnh báo đỏ trên trang của Giáo viên. |
| **DF-06** | **Thi Trực Tuyến Chống Gian Lận Chuyển Tab** | Lắng nghe sự kiện `visibilitychange` & `window.blur`. Mỗi lần rời màn hình thi, tăng cảnh cáo vi phạm. Nếu chuyển tab **> 3 lần**, hệ thống tự động khóa giao diện và cưỡng chế thu bài ngay lập tức. |
| **DF-07** | **Khóa Mềm Tài Khoản (Soft Delete)** | Khi Quản trị viên khóa tài khoản, trạng thái chuyển thành `Đã khóa`. Tài khoản bị từ chối đăng nhập (HTTP 403) nhưng **giữ nguyên 100% dữ liệu lịch sử điểm số** trong bảng `BaiNop` phục vụ báo cáo. |

---

## 🏗️ 2. Kiến Trúc Công Nghệ Hệ Thống

Dự án được xây dựng theo mô hình **Fullstack Microservices phân tán**:

```
+--------------------------------------------------------------------------+
|                     TRÌNH DUYỆT NGƯỜI DÙNG (CLIENT)                      |
|   - Giao diện: Creative Studio & Neo-Brutalist EdTech (/css/theme.css)   |
|   - Typography: Bricolage Grotesque & Be Vietnam Pro | 100% SVG Vector   |
|   - Các cổng: / (Home), /login, /student, /teacher, /exam, /community   |
+-------------------------------------+------------------------------------+
                                      | HTTP Request (Port 80)
                                      v
+--------------------------------------------------------------------------+
|                 WEB APPLICATION SERVER (NODE.JS & EXPRESS)               |
|   - Cổng mạng: Port 80                                                   |
|   - Template Engine: EJS (Server-Side Rendering)                         |
|   - Session & Auth: Express-Session, Role-based Middleware               |
|   - Thư viện kết nối CSDL: mssql (TDS Protocol)                          |
+-------------------+----------------------------------+-------------------+
                    |                                  |
                    | Gọi chấm mã nguồn (Port 5000)   | Truy vấn dữ liệu
                    v                                  v
+------------------------------------+  +----------------------------------+
|  JUDGE ENGINE (PYTHON FASTAPI)     |  |   MICROSOFT SQL SERVER           |
|  - Cổng mạng: Port 5000            |  |   - Database: StemRoboticDB_V2   |
|  - Framework: FastAPI & Uvicorn    |  |   - 12 Bảng chuẩn hóa BCNF       |
|  - Bộ thực thi: Subprocess Sandbox |  |   - Hỗ trợ tiếng Việt NVARCHAR   |
|  - Đối chiếu Test Case (< 0.05s)   |  |   - Port mặc định: 1433          |
+------------------------------------+  +----------------------------------+
```

### Thông số kỹ thuật chi tiết:
- **Node.js**: v20.x hoặc v22.x LTS (Express 4.x, EJS 3.x, mssql 10.x).
- **Python**: v3.10+ hoặc v3.11+ (FastAPI 0.110+, Uvicorn 0.28+, Pytest).
- **Cơ sở dữ liệu**: Microsoft SQL Server 2019 / 2022 (Bản Developer hoặc Express).
- **Design System**: Phong cách Neo-Brutalist, nền giấy ngọc trai `#F4F6F8` kèm lưới chấm 32px, bóng cứng `4px 4px 0`, màu thương hiệu `#5A52FF`, `#FF5E5E`, `#FFB800`, tuyệt đối không dùng Emoji.

---

## 🚀 3. Hướng Dẫn Cài Đặt & Khởi Chạy Từng Bước

Dành cho các thành viên trong nhóm và giảng viên khi clone dự án về máy tính mới.

### Bước 1: Chuẩn bị môi trường máy trạm
- Đảm bảo máy đã cài đặt:
  1. [Node.js (LTS)](https://nodejs.org/) (Kiểm tra bằng lệnh: `node -v`).
  2. [Python 3.10+](https://www.python.org/) (Kiểm tra bằng lệnh: `python --version`).
  3. [Microsoft SQL Server & SSMS](https://www.microsoft.com/en-us/sql-server/sql-server-downloads).

### Bước 2: Thiết lập Cơ sở Dữ liệu SQL Server
1. Mở **SQL Server Management Studio (SSMS)** và kết nối tới máy chủ SQL nội bộ (Ví dụ: `localhost\SQLEXPRESS` hoặc `ADMIN-PC\SQLEXPRESS`).
2. Mở file [database_schema.sql](database_schema.sql) và nhấn **Execute (F5)** để tạo CSDL `StemRoboticDB_V2` gồm 12 bảng và bộ dữ liệu hạt giống mẫu.
3. (Tùy chọn) Chạy thêm các script seed bài thi và diễn đàn bổ sung:
   ```powershell
   cd server
   node seed_exam_and_materials.js
   node seed_mod04.js
   cd ..
   ```

### Bước 3: Cấu hình biến môi trường (`.env`)
Tạo file `.env` tại thư mục gốc của dự án (hoặc sao chép từ file mẫu [.env.example](.env.example)):
```ini
# Cổng máy chủ Web
PORT=80

# Cấu hình SQL Server
DB_SERVER=localhost\\SQLEXPRESS
DB_NAME=StemRoboticDB_V2
DB_USER=sa
DB_PASSWORD=Mật_khẩu_SQL_của_bạn
DB_PORT=1433
DB_ENCRYPT=false
DB_TRUST_CERT=true

# Kết nối Máy chấm Judge
JUDGE_URL=http://localhost:5000

# Phiên đăng nhập
SESSION_SECRET=stemrobotic_secret_key_2026
```

### Bước 4: Cài đặt và khởi chạy Máy chấm Judge Engine (Port 5000)
Mở cửa sổ Terminal thứ nhất:
```powershell
# Di chuyển vào thư mục judge_engine
cd judge_engine

# Tạo môi trường ảo Python (khuyên dùng)
python -m venv venv
.\venv\Scripts\activate

# Cài đặt thư viện phụ thuộc
pip install -r requirements.txt

# Khởi chạy dịch vụ Judge
uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
*Kiểm tra:* Truy cập `http://localhost:5000/docs` để xem tài liệu Swagger API của máy chấm.

### Bước 5: Cài đặt và khởi chạy Web Server (Port 80)
Mở cửa sổ Terminal thứ hai:
```powershell
# Di chuyển vào thư mục server
cd server

# Cài đặt các gói Node.js
npm install

# Khởi chạy ứng dụng
npm start
# hoặc: node server.js
```
*Kiểm tra:* Khi thấy thông báo `✅ Kết nối SQL Server thành công!` và `🚀 Server đang chạy tại http://localhost:80`, mở trình duyệt truy cập `http://localhost/`.

---

## 👥 4. Danh Sách Tài Khoản Mẫu Phục Vụ Thử Nghiệm

Dưới đây là các tài khoản mặc định đã được khởi tạo sẵn trong CSDL để Giảng viên và Hội đồng chấm có thể đăng nhập thử nghiệm toàn diện các vai trò:

| STT | Vai trò | Họ tên | Email đăng nhập | Mật khẩu | Trang quản lý chính |
| :-: | :--- | :--- | :--- | :---: | :--- |
| **1** | **Quản Trị Viên (Admin)** | Quản Trị Viên Hệ Thống | `admin@stemrobotic.edu.vn` | `123456` | `/admin` (Quản trị tài khoản & Khóa mềm DF-07) |
| **2** | **Giáo Viên (Teacher)** | TS. Đặng Hùng Vĩ | `gv.hungvi@stemrobotic.edu.vn` | `123456` | `/teacher` (Giao bài, Chốt điểm DF-04 & Cảnh báo DF-05) |
| **3** | **Học Sinh (Top 1)** | Trần Minh Nhật | `hs.minhnhat@stemrobotic.edu.vn` | `123456` | `/student` (Học tập, nộp bài DF-01 & mở khóa DF-02) |
| **4** | **Học Sinh (Thí sinh)** | Lê Hoàng Nam | `hs.hoangnam@stemrobotic.edu.vn` | `123456` | `/exam` (Phòng thi trực tuyến chống gian lận DF-06) |
| **5** | **Học Sinh (Cộng đồng)** | Nguyễn Mai Phương | `hs.maiphuong@stemrobotic.edu.vn` | `123456` | `/community` (Bình chọn Wall of Fame & Thảo luận) |

---

## 🧪 5. Kịch Bản Kiểm Thử Nhanh Các Luồng Tự Động

- **Kiểm thử DF-01 & DF-02 (Nộp bài và Mở khóa tự động):**  
  Đăng nhập `hs.minhnhat@stemrobotic.edu.vn` -> Truy cập `/student` -> Chọn Dự án 1 -> Dán code mẫu C++ nhấp nháy đèn LED SOS -> Nhấn "Chấm điểm tự động". Máy chấm trả về điểm 10/10 trong < 0.05s -> Chuyển sang tài khoản Giáo viên duyệt Video -> Dự án tiếp theo tự động mở khóa.
- **Kiểm thử DF-05 (Cảnh báo cập nhật học liệu):**  
  Đăng nhập `gv.hungvi@stemrobotic.edu.vn` -> Truy cập `/teacher`. Hệ thống tự động phân tích tỷ lệ bài nộp bị lỗi (>30%) và hiển thị banner cảnh báo đỏ cần cập nhật học liệu PWM/Morse.
- **Kiểm thử DF-06 (Phòng thi chống gian lận):**  
  Đăng nhập `hs.hoangnam@stemrobotic.edu.vn` -> Truy cập `/exam`. Thử chuyển sang tab trình duyệt khác hoặc nhấn Alt+Tab 4 lần -> Hệ thống ghi nhận vi phạm, hiển thị cảnh báo đỏ và cưỡng chế nộp bài, khóa màn hình làm bài.
- **Kiểm thử DF-07 (Khóa mềm tài khoản):**  
  Đăng nhập `admin@stemrobotic.edu.vn` -> Truy cập `/admin` -> Nhấn "Khóa tài khoản" học sinh -> Đăng xuất và đăng nhập lại bằng tài khoản vừa khóa -> Hệ thống từ chối đăng nhập với mã lỗi HTTP 403 nhưng giữ nguyên lịch sử điểm thi.

---

## 📁 6. Cấu Trúc Thư Mục Dự Án

```
LapTrinhWeb/
├── .gitignore                   # Cấu hình loại trừ Git chuẩn (node_modules, venv, .env, log)
├── .env.example                 # Mẫu khai báo thông số kết nối CSDL và Judge
├── database_schema.sql          # Kịch bản DDL khởi tạo 12 bảng CSDL StemRoboticDB_V2
├── GEMINI.md                    # Quy chuẩn thiết kế Neo-Brutalist & Single Source of Truth
├── PRODUCT.md                   # Báo cáo đặc tả hệ thống thông tin (6 phân hệ, 27 mô đun, 7 DF)
├── README.md                    # Tài liệu hướng dẫn cài đặt và vận hành hệ thống
│
├── public/                      # Tài nguyên tĩnh dùng chung
│   ├── css/
│   │   └── theme.css            # Toàn bộ CSS Variables, Bento Grid, Banner và Animations
│   └── js/
│       └── login.js             # Logic xác thực và xử lý từ chối khóa mềm DF-07
│
├── server/                      # Máy chủ ứng dụng (Node.js & Express - Port 80)
│   ├── config/
│   │   └── db.js                # Kết nối Microsoft SQL Server qua thư viện mssql
│   ├── middleware/
│   │   └── authMiddleware.js    # Phân quyền truy cập các Route theo Session Role
│   ├── routes/
│   │   ├── admin.js             # API Quản trị & Luồng DF-07
│   │   ├── auth.js              # API Đăng ký, Đăng nhập, Đăng xuất
│   │   ├── community.js         # API Diễn đàn, Thảo luận & Wall of Fame (DF-03)
│   │   ├── exam.js              # API Phòng thi trực tuyến & Luồng DF-06, DF-05
│   │   ├── pages.js             # Render các trang EJS giao diện
│   │   ├── reports.js           # API Xuất bảng điểm CSV (XBC.02)
│   │   └── submissions.js       # API Nộp bài, Máy chấm & Mở khóa dự án (DF-01, DF-02)
│   ├── views/                   # Template EJS Server-Side Rendering
│   │   ├── dashboard/
│   │   │   ├── admin.js         # Giao diện /admin
│   │   │   ├── student.ejs      # Giao diện /student
│   │   │   └── teacher.ejs      # Giao diện /teacher
│   │   ├── community.ejs        # Giao diện /community
│   │   ├── exam.ejs             # Giao diện /exam
│   │   ├── index.ejs            # Giao diện Trang chủ (/)
│   │   └── login.ejs            # Giao diện /login
│   ├── package.json
│   └── server.js                # Điểm khởi chạy Web Server chính
│
└── judge_engine/                # Máy chấm tự động (Python FastAPI - Port 5000)
    ├── routers/
    │   └── judge.py             # Router tiếp nhận mã nguồn và dữ liệu Test Case
    ├── services/
    │   └── sandbox.py           # Quản lý tiến trình biên dịch C++ & chạy Python an toàn
    ├── requirements.txt         # Thư viện Python (fastapi, uvicorn, pydantic)
    └── main.py                  # Điểm khởi chạy Judge Engine
```

---

## 🛡️ Giấy Phép & Bản Quyền
Dự án được phát triển phục vụ mục đích nghiên cứu và đào tạo STEM tại **Trường Đại học Sư phạm — Đại học Đà Nẵng**. Mọi quyền được bảo lưu © 2026.
