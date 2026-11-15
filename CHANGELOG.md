# 📝 NHẬT KÝ PHÁT TRIỂN & LỊCH SỬ NÂNG CẤP HỆ THỐNG (CHANGELOG)

Dự án: **Hệ thống Học tập & Quản lý Đào tạo STEM Robotic Cấp Trung Học**  
Đơn vị: **Đại học Đà Nẵng — Trường Đại học Sư phạm — Khoa Toán - Tin**  
Giảng viên hướng dẫn: **TS. Đặng Hùng Vĩ**  
Nhóm sinh viên thực hiện: **Nhóm A+ (24SPT)**  
- Phạm Kỳ Hải (23SPT)
- Trần Minh Nhật (23SPT)
- Phạm Thị Hà Vy (24SPT)
- Trần Thế Quân (24CNTT1)
- Nguyễn Thị Thanh Thảo (24CNTT1)

---

## ⚡ [v2.1.0 — Milestone 3] (Ngày 15/11/2026) — HỆ THỐNG KHỞI ĐỘNG TẬP TRUNG 1-CLICK & WATCHDOG DỌN SẠCH CỔNG

Phiên bản tối ưu hóa vận hành, giúp bất kỳ thành viên nhóm hoặc giảng viên nào sau khi tải dự án về từ GitHub đều có thể chạy ngay toàn bộ hệ thống trên mọi máy tính Windows mà không cần cấu hình thủ công.

### 1. Chuẩn Hóa Bộ Khởi Động Động (`STEM_Robotic_App.ps1`)
- **Khử bỏ hoàn toàn đường dẫn tuyệt đối:** Thay thế toàn bộ đường dẫn cứng bằng biến thư mục tương đối động `$PSScriptRoot`, cho phép clone và khởi chạy từ bất kỳ ổ đĩa (`C:`, `D:`, `E:`...) hoặc thư mục bất kỳ.
- **Tự động nhận diện môi trường Python:** Tự động tìm kiếm `python.exe` trong môi trường ảo của dự án (`venv/Scripts/python.exe`, `judge_engine/venv/Scripts/python.exe`) hoặc Python hệ thống.
- **Cơ chế Watchdog giám sát tiến trình thông minh:**
  - Khởi tạo tiến trình giám sát chạy nền liên tục lắng nghe tiến trình giao diện chính.
  - Khi người dùng nhấn phím **[ENTER]** hoặc bấm nút **[X]** đóng cửa sổ Control Panel, Watchdog sẽ lập tức can thiệp: giải phóng sạch sẽ Node.js (Cổng 80) và FastAPI Judge Engine (Cổng 5000), loại bỏ triệt để lỗi xung đột cổng "Port already in use (EADDRINUSE)".

### 2. Tự Động Hóa Tạo Public Link Truy Cập Từ Xa (Cloudflare Tunnel)
- **Cơ chế Auto-Download Binary:** Nếu thư mục gốc chưa có file thực thi `cloudflared.exe` (do được loại trừ khỏi Git để tối ưu dung lượng repo), script sẽ tự động tải phiên bản mới nhất từ Cloudflare GitHub Releases.
- **Tự động tạo URL Public (`trycloudflare.com`):** Mở đường truyền an toàn cho phép máy tính khác, điện thoại hoặc giảng viên truy cập từ xa mà không cần mở port modem router.
- **Tự động Copy vào Clipboard:** Ngay khi đường dẫn Public được cấp phát, URL sẽ được tự động copy vào bộ nhớ tạm để người dùng dán (Ctrl+V) gửi đi ngay.

### 3. Tiện Ích Nhấp Đúp 1-Click Cho Người Dùng Phổ Thông
- **`Start_STEM_Robotic.bat`:** Script batch khởi chạy trực tiếp với tham số `-ExecutionPolicy Bypass`, bỏ qua các rào cản chính sách bảo mật PowerShell của Windows.
- **`Tao_Icon_Desktop.bat`:** Tự động tạo biểu tượng lối tắt (Desktop Shortcut) mang tên **`STEM Robotic Edu`** ngay trên màn hình chính của người dùng, trỏ chính xác về thư mục dự án và thiết lập icon chuẩn hệ thống.

---

## 🚀 [v2.0.0 — Milestone 2] (Ngày 14/11/2026 - Chiều) — NÂNG CẤP TOÀN DIỆN & HOÀN THIỆN 100% 27/27 MÔ ĐUN IPO

Phiên bản cột mốc số 2 đánh dấu bước hoàn thiện toàn bộ các yêu cầu nghiệp vụ từ Báo cáo Phân tích Thiết kế Hệ thống, chuẩn hóa máy chấm sandbox phân tán, nạp cơ sở dữ liệu giáo trình thực tế và tích hợp bộ kiểm thử tự động khép kín.

### 1. Hoàn Thiện Nghiệp Vụ Cốt Lõi (Đạt 100% 27/27 Mô Đun IPO & 7 Luồng Tự Động)
- **Phân Hệ 1 (Quản trị Người dùng & Xác thực SSO):**
  - **`QLTK.03` (Quên mật khẩu & Khôi phục bằng OTP 6 số):** Triển khai API `/api/auth/forgot-password` và `/api/auth/reset-password-otp`, sinh mã OTP 6 số lưu an toàn trong CSDL kèm thời hạn hiệu lực (TTL 10 phút), hỗ trợ modal khôi phục tài khoản tức thì tại trang đăng nhập.
  - **`QTHT.02` (Hồ sơ cá nhân & Đổi mật khẩu tự phục vụ):** Xây dựng trang `/profile` độc lập, hỗ trợ cập nhật thông tin cá nhân (Họ tên, Số điện thoại, Trường học, Khối lớp, URL Ảnh đại diện) và xác thực đổi mật khẩu cũ sang mới kèm hash bcrypt an toàn.
  - **`QTHT.01` & `QTHT.03` (Phân quyền & Khóa mềm tài khoản - Luồng `DF-07`):** Quản trị viên (`/admin`) có quyền nâng/hạ vai trò người dùng và khóa tài khoản khi học sinh tốt nghiệp hoặc vi phạm, bảo toàn trọn vẹn lịch sử nộp bài và điểm số mà không xóa vật lý khỏi SQL Server.
- **Phân Hệ 2 (Quản lý Học liệu & Khóa học):**
  - **`QTHL.01` (Thêm mới Học liệu & Linh kiện):** Giáo viên (`/teacher`) có thể soạn thảo và xuất bản bài giảng lý thuyết, sơ đồ chân phần cứng (Pinout) và mã nguồn mẫu.
  - **`QTHL.02` (Chỉnh sửa & Ẩn/Hiện học liệu):** Giáo viên cập nhật nội dung học liệu; nếu bài tập liên quan đang có học sinh thực hiện, hệ thống đưa ra cảnh báo an toàn và tự động tắt cờ `CoCanCapNhat = 0` (Luồng `DF-05`).
  - **`TCPP.02` (Trạm Tra cứu Linh kiện & Từ điển Bắt lỗi):** Bổ sung tra cứu vi điều khiển Arduino Uno R3, mạch cầu H L298N, cảm biến siêu âm HC-SR04 kèm tài liệu phân tích nguyên nhân - giải pháp các lỗi phổ biến (lỗi chân PWM, sụt áp nguồn động cơ, ngắt xung delay).
- **Phân Hệ 4 (Xử lý Bài Nộp & Kiểm Duyệt Video):**
  - **`XLBN.01` -> `XLBN.03` (Ràng buộc kép & Chấm điểm tự động):** Học sinh bắt buộc phải gửi file mã nguồn (`.py`, `.cpp`, `.ino`) hoặc nhập code trực tiếp VÀ đính kèm liên kết Video nghiệm thu thực tế.
  - **Luồng `DF-01` (Chuyển trạng thái thông minh):** Nếu mã nguồn vượt qua 100% TestCase của máy chấm, bài nộp tự động chuyển sang trạng thái `Chờ duyệt Video` và hiển thị trên Dashboard Giáo viên để nghiệm thu cơ khí.
  - **Luồng `DF-04` (Bắt lỗi sư phạm):** Phân tích lỗi cú pháp, thiếu thư viện hoặc sai logic đầu ra và trả về gợi ý sửa lỗi bằng tiếng Việt chuẩn sư phạm.
- **Phân Hệ 5 (Thống Kê, Báo Cáo & Xếp Hạng):**
  - **`XBC.02` (Lọc & Xuất Báo Cáo Đào Tạo):** Hỗ trợ xuất dữ liệu bảng điểm học sinh sang định dạng CSV/PDF phục vụ báo cáo hội đồng sư phạm.
  - **`TTCĐ.02` (Bảng Vinh Danh Top Dự Án Xuất Sắc - Wall of Fame):** Tự động vinh danh các dự án đạt điểm tối đa kèm video YouTube phát trực tiếp sinh động.
- **Phân Hệ 6 (Tương Tác Cộng Đồng & Hỗ Trợ Kỹ Thuật):**
  - **`HTTB.01` (Báo cáo Sự cố Kỹ thuật):** Modal gửi phản ánh lỗi máy chấm hoặc đề bài dành cho học sinh/giáo viên.
  - **`HTTB.02` (Phát Thông báo Toàn Hệ thống):** Admin phát sóng banner bảo trì, thông báo khẩn cấp đẩy trực tiếp lên Dashboard người dùng.
  - **`TTCĐ.01` & `DF-03` (Diễn đàn gỡ lỗi & Thuật toán Top Trending):** Bình chọn Upvote và tự động đánh dấu chủ đề kỹ thuật nổi bật khi đạt trên 5 lượt thích.

### 2. Chuẩn Hóa Máy Chấm Tự Động (Judge Engine — Cổng 5000)
- **Kiến trúc mô-đun:**
  - `judge_engine/main.py`: Khởi tạo ứng dụng FastAPI, tích hợp middleware CORS và định tuyến REST API.
  - `judge_engine/routers/judge.py`: Endpoint `/judge/run` tiếp nhận payload `source_code`, `language` và mảng `test_cases`.
  - `judge_engine/services/sandbox.py`: Quản lý môi trường thực thi cô lập bằng `subprocess.run`, giới hạn tài nguyên `timeout = 3.0s` (đáp ứng tiêu chuẩn NFR-01 < 10 giây).
  - `judge_engine/services/arduino_mock.h`: Thư viện C++ giả lập môi trường Arduino phần cứng (`pinMode`, `digitalWrite`, `analogWrite`, `pulseIn`, `Serial.print/println`), cho phép biên dịch và kiểm thử sketch `.ino` chuẩn xác mà không cần phần cứng vật lý cắm vào server.
  - `judge_engine/services/error_analyzer.py`: Bộ máy phân tích AST và chuỗi lỗi (SyntaxError, IndentationError, NameError, Timeout, lỗi dấu chấm phẩy C++) dịch thành lời chỉ dẫn sư phạm tiếng Việt.
  - `judge_engine/README.md`: Hướng dẫn cấu hình, cài đặt dependencies và kiểm thử máy chấm độc lập.

### 3. Nạp Bộ Giáo Trình & Dữ Liệu STEM Robotic Thực Tế (`seed_full_curriculum.js`)
- **3 Lộ trình học tập liên hoàn (`LoTrinh`):**
  1. *Lộ trình 1: Lập trình Arduino cơ bản*
  2. *Lộ trình 2: Tích hợp cảm biến & Xử lý tín hiệu*
  3. *Lộ trình 3: Điều khiển chuyển động Robot tự hành*
- **8 Học liệu & Sơ đồ chân chuẩn (`HocLieu`):**
  - Giới thiệu Arduino Uno R3, Pinout 14 chân số & 6 chân Analog.
  - Cảm biến siêu âm HC-SR04: Nguyên lý phản hồi sóng âm và công thức đo khoảng cách.
  - Mạch công suất cầu H L298N: Đấu nối tải động cơ DC và băm xung PWM.
  - Kỹ thuật điều chế xung PWM và giải thuật PID điều khiển bám vạch.
  - Các bài giảng video YouTube trực quan và mã nguồn mẫu (.ino/.py).
- **4 Dự án thực hành STEM kèm 12 Test Cases chuẩn (`DuAn` & `TestCase`):**
  - *Dự án 1: Nhấp nháy đèn LED theo mã tín hiệu SOS (Blink SOS)*
  - *Dự án 2: Đo khoảng cách và cảnh báo vật cản bằng cảm biến HC-SR04*
  - *Dự án 3: Băm xung PWM điều khiển tốc độ động cơ DC qua cầu H L298N*
  - *Dự án 4: Thuật toán PID bám line cho Robot dò đường tự hành*

### 4. Nâng Cấp Quản Lý Lớp Học & Tự Động Hóa Xác Thực Học Sinh
- **Quản lý Lớp 10/1 cho GVCN TS. Đặng Hùng Vĩ:** Tab chuyên biệt trên Dashboard Giảng viên theo dõi sĩ số, tiến độ học tập và danh sách học sinh cần hỗ trợ.
- **Admin Quản lý Lớp & Duyệt Thẻ:** Bổ sung tính năng tạo lớp học mới, phân công GVCN và quy trình duyệt tài khoản kết hợp nhận diện thẻ học sinh tự động.
- **Tài khoản Học sinh chuẩn nhóm A+:** Cập nhật thông tin các thành viên nhóm làm bài mẫu thử nghiệm (`hs.minhnhat`, `hs.quocbinh`, `hs.kyhai`, `hs.havy`, `hs.thanhthao`).
- **Trang chủ (`index.ejs`):** Bố cục Bento Grid 4 cột cân xứng, bổ sung khung phát YouTube Showroom mô hình Robot tự cân bằng và bảng xếp hạng thành tích thời gian thực.
- **Tối ưu hóa giao diện (Anti-Slop):** Loại bỏ hoàn toàn các mã kỹ thuật đóng mở ngoặc `(DF-xx)`, `(IPO.xx)` trên toàn bộ giao diện người dùng, mang lại trải nghiệm phần mềm trực quan, thẩm mỹ cao.

### 5. Kiểm Thử Hệ Thống Tự Động (E2E Integration Testing)
- Bộ kiểm thử toàn diện `server/tests/full_system_test.js` (chạy qua lệnh `npm test`):
  - **Kết quả:** **37/37 bài test ĐẠT (100% PASS)**.
  - Rà soát toàn bộ các phân hệ từ QLTK, QTHT, QTHL, TCPP, QLDA, KTĐG, XLBN, KQBN, XBC đến TTCĐ, HTTB.

---

## 🛠️ [v1.0.0 — Milestone 1] (Ngày 14/11/2026 - Sáng) — KHỞI TẠO KIẾN TRÚC PHÂN TÁN & CỐT LÕI HỆ THỐNG

Phiên bản nền tảng đặt nền móng kiến trúc kỹ thuật và cơ sở dữ liệu quan hệ cho toàn bộ hệ thống.

### 1. Kiến Trúc Phân Tán Đa Nền Tảng
- **Web Server:** Node.js v20 + Express.js chạy trên cổng 80, kết nối SQL Server thông qua thư viện `mssql` (TDS Protocol).
- **Judge Server:** Python 3.12 + FastAPI chạy trên cổng 5000, xử lý chấm code độc lập.
- **CSDL Quan hệ:** Microsoft SQL Server (`StemRoboticDB_V2`), thiết kế 12 bảng chuẩn hóa BCNF (Boyce-Codd Normal Form) với toàn bộ chuỗi ký tự tiếng Việt lưu dưới định dạng `NVARCHAR`.

### 2. Triển Khai 19/27 Mô Đun Cốt Lõi & 7 Luồng Dữ Liệu Tự Động
- Thiết lập hệ thống đăng ký, đăng nhập xác thực phiên Session (Cookie-based).
- Triển khai cây lộ trình học tập, danh mục bài tập và cơ chế nộp bài sơ bộ.
- Xây dựng luồng tự động mở khóa bài tập khi hoàn thành điều kiện tiên quyết (`DF-02`).
- Xây dựng phòng thi trực tuyến có cơ chế phát hiện chuyển tab thông qua JS Visibility API (`KTĐG.02` & `DF-06`).
- Xây dựng Bảng tổng hợp điểm và diễn đàn trao đổi kỹ thuật.

### 3. Hệ Thống Thiết Kế Thống Nhất (Creative Studio & Neo-Brutalist EdTech)
- Xây dựng file định kiểu dùng chung `/css/theme.css`.
- Hệ màu chuẩn: Nền `#F4F6F8` với lưới chấm 32px, Surface `#FFFFFF`, Accent `#FFB800`, Primary `#5A52FF`, Success `#047857`, Error `#DC2626`.
- Typography chuẩn mực: Google Fonts `Bricolage Grotesque` và `Be Vietnam Pro`.
- Nút bấm cơ học `.btn-playful` với hiệu ứng đổ bóng cứng 4px và nam châm tương tác `.magnet-btn`.
- Khoang máy chấm và bảng điều khiển telemetry màu tối `#0B0F19`, chữ sáng `#F4F6F8`, telemetry code `#38BDF8`.
- Triệt tiêu hoàn toàn emoji, sử dụng 100% icon SVG vector sắc nét.
