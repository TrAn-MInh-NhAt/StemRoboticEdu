# 📊 BÁO CÁO PHÂN CÔNG NHIỆM VỤ & TIẾN ĐỘ PHÁT TRIỂN HỆ THỐNG
## DỰ ÁN: HỆ THỐNG HỌC TẬP VÀ QUẢN LÝ ĐÀO TẠO STEM ROBOTIC CẤP TRUNG HỌC

> **ĐƠN VỊ:** ĐẠI HỌC ĐÀ NẴNG — TRƯỜNG ĐẠI HỌC SƯ PHẠM — KHOA TOÁN - TIN  
> **HỌC PHẦN:** PHÁT TRIỂN ỨNG DỤNG WEB  
> **GIẢNG VIÊN HƯỚNG DẪN:** TS. Đặng Hùng Vĩ  
> **NHÓM SINH VIÊN THỰC HIỆN:** Nhóm A+ (Lớp 24SPT)  
> **MỐC THỜI GIAN THỰC HIỆN:** 01/11/2026 – 15/11/2026  

---

## PHẦN 1: PHÂN CÔNG NHIỆM VỤ CHI TIẾT 5 THÀNH VIÊN
### (Phủ kín 100% 27/27 Mô Đun IPO & 7/7 Luồng Tự Động DF-01 đến DF-07)

### 1.1. Bảng Tổng Hợp Phân Công Trách Nhiệm

| STT | Thành Viên | Tài Khoản GitHub | Vai Trò Chính | Số Lượng & Mã Mô Đun IPO | Luồng Tự Động | Nhánh Tính Năng (PR) & Sản Phẩm Đóng Góp |
|:---:|:---|:---|:---|:---:|:---:|:---|
| **1** | **Trần Minh Nhật** | `TrAn-MInh-NhAt` | **Trưởng nhóm & Kiến trúc sư trưởng** | **9 mô đun:**<br>`QLTK.01`, `QLTK.02`, `QLTK.03`, `QTHT.01`, `XLBN.01`, `XLBN.02`, `XLBN.03`, `KQBN.01`, `KQBN.02` | `DF-01`<br>`DF-03`<br>`DF-04` | Quản trị nhánh `main`, Release `v2.0.0`–`v2.2.0`, Watchdog `STEM_Robotic_App.ps1`, CI/CD, Review & Merge toàn bộ PR |
| **2** | **Trần Thế Quân** | `tranquan6211-dot` | **Thiết kế Hệ thống & CSDL** | **5 mô đun:**<br>`QTHT.02`, `QTHT.03`, `QLDA.02`, `HTTB.01`, `HTTB.02` | `DF-02`<br>`DF-07` | `feature/quan-csdl-hethong`<br>• `docs/DAC_TA_CSDL.md`<br>• `server/seed_quan_thongbao.js` |
| **3** | **Phạm Thị Hà Vy** | `phamthihavy032-dev` | **Phân tích Nghiệp vụ & Phát triển Học liệu** | **4 mô đun:**<br>`QTHL.01`, `QTHL.02`, `TCPP.01`, `TCPP.02` | `DF-05` | `feature/vy-hoclieu-morong`<br>• `docs/NGHIEP_VU_HOC_LIEU.md`<br>• `server/seed_vy_hoclieu_morong.js` |
| **4** | **Nguyễn Thị Thanh Thảo** | `thanhthao-21` | **Phân tích Chức năng, Báo cáo & UI/UX** | **5 mô đun:**<br>`TKDL.01`, `TKDL.02`, `XBC.01`, `XBC.02`, `TTCĐ.01` | `DF-05` | `feature/thao-ui-baocao`<br>• `docs/THIET_KE_UI_UX.md`<br>• `public/css/responsive-mobile.css` |
| **5** | **Phạm Kỳ Hải** | `kyhaipham95-oss` | **Quản lý Chất lượng & QA Lead** | **4 mô đun:**<br>`QLDA.01`, `KTĐG.01`, `KTĐG.02`, `TTCĐ.02` | `DF-06` | `feature/hai-qa-kiemthu`<br>• `docs/BAO_CAO_KIEM_THU_QA.md`<br>• `server/tests/qa_edge_cases.js` |

> 🎯 **DÒNG TỔNG KẾT ĐỐI CHIẾU NGHIỆP VỤ:**  
> **Tổng cộng: 9 + 5 + 4 + 5 + 4 = 27/27 mô đun IPO & 7/7 luồng dữ liệu tự động (DF-01 – DF-07).**  
> *Cam kết: Không có mô đun nào bị bỏ sót; phân định trách nhiệm rõ ràng, độc lập và tương hỗ chặt chẽ.*

---

### 1.2. Mô Tả Chi Tiết Nhiệm Vụ & Sản Phẩm Đóng Góp Của Từng Thành Viên

#### 1. Trần Minh Nhật (`TrAn-MInh-NhAt`) — Trưởng Nhóm & Kiến Trúc Sư Trưởng
- **Phạm vi quản xao:** Bao quát kiến trúc Fullstack phân tán đa nền tảng gồm 3 tầng: Web Application Server (Node.js/Express chạy Port 80), Máy chấm tự động Sandbox cô lập (Python FastAPI chạy Port 5000) và Cơ sở dữ liệu quan hệ Microsoft SQL Server (`StemRoboticDB_V2`).
- **Mô đun IPO trực tiếp phát triển (9/27 mô đun):**
  - `QLTK.01` (Đăng ký tài khoản & Xác thực thông tin đầu vào).
  - `QLTK.02` (Đăng nhập hệ thống & Quản lý phiên làm việc Session an toàn).
  - `QLTK.03` (Khôi phục mật khẩu thông qua mã xác thực OTP 6 số lưu tạm trong CSDL).
  - `QTHT.01` (Phân quyền người dùng RBAC 4 vai trò: Học sinh, Giáo viên, Giám thị, Quản trị viên).
  - `XLBN.01` (Tiếp nhận bài nộp thực hành với ràng buộc kép: File mã nguồn `.py/.cpp/.ino` + Link Video YouTube nghiệm thu cơ khí).
  - `XLBN.02` (Giao tiếp Proxy và kích hoạt máy chấm tự động qua cổng 5000).
  - `XLBN.03` (Máy chấm Sandbox cô lập đo đạc thời gian < 3.0s và bộ giả lập phần cứng `arduino_mock.h`).
  - `KQBN.01` (Giao diện Giảng viên thẩm định Video vận hành cơ khí của học sinh).
  - `KQBN.02` (Cơ chế chốt điểm tổng hợp: 50% điểm thuật toán máy chấm + 50% điểm thao tác phần cứng).
- **Luồng tự động phụ trách (3 luồng):**
  - `DF-01` (Kích hoạt máy chấm tự động -> Đạt 100% TestCase tự chuyển sang trạng thái "Chờ duyệt Video" để Giảng viên chấm).
  - `DF-03` (Tự động đưa chủ đề kỹ thuật lên Top Trending khi đạt ngưỡng > 5 lượt bình chọn).
  - `DF-04` (Bộ phân tích lỗi AST & Compiler bắt lỗi cú pháp dịch sang chỉ dẫn sư phạm tiếng Việt chuẩn mực).
- **Công cụ vận hành & Quản trị mã nguồn:**
  - Xây dựng bộ công cụ điều khiển trung tâm 1-Click Watchdog `STEM_Robotic_App.ps1`, tự động giải phóng sạch cổng 80 & 5000 khi đóng và tích hợp Cloudflare Tunnel phát link public tự động.
  - Thiết lập kịch bản tiện ích `Start_STEM_Robotic.bat` và `Tao_Icon_Desktop.bat`.
  - Thiết lập quy trình CI/CD GitHub Actions, chịu trách nhiệm Code Review và Merge toàn bộ Pull Request của các thành viên vào nhánh `main`.
  - Đóng gói và phát hành chính thức các phiên bản Release từ `v1.0.0`, `v2.0.0`, `v2.1.0` đến `v2.2.0`.

#### 2. Trần Thế Quân (`tranquan6211-dot`) — Thiết Kế Hệ Thống & CSDL (Database Architect)
- **Phạm vi phụ trách:** Thiết kế chuẩn hóa toàn bộ mô hình dữ liệu quan hệ SQL Server `StemRoboticDB_V2`, lập sơ đồ thực thể liên kết ERD và sơ đồ phân rã chức năng BFD; đảm bảo 12 bảng đạt chuẩn dạng chuẩn Boyce-Codd (BCNF), lưu trữ dữ liệu tiếng Việt chuẩn `NVARCHAR`.
- **Mô đun IPO trực tiếp phát triển (5/27 mô đun):**
  - `QTHT.02` (Trang hồ sơ cá nhân `/profile`, cập nhật thông tin học sinh và tự đổi mật khẩu hash bcrypt).
  - `QTHT.03` (Khóa mềm tài khoản người dùng khi học sinh tốt nghiệp hoặc vi phạm).
  - `QLDA.02` (Cơ chế quản lý lộ trình bài tập mở khóa tuần tự).
  - `HTTB.01` (Hệ thống tiếp nhận phiếu báo cáo sự cố kỹ thuật từ học sinh và giáo viên).
  - `HTTB.02` (Cổng phát sóng thông báo khẩn cấp và lịch bảo trì toàn hệ thống từ Quản trị viên).
- **Luồng tự động phụ trách (2 luồng):**
  - `DF-02` (Tự động mở khóa dự án/bài tập kế tiếp trong lộ trình ngay khi học sinh đạt điểm chuẩn ở bài tập tiên quyết).
  - `DF-07` (Quy trình khóa mềm tài khoản an toàn: Chuyển cờ `TrangThai = 0`, ngắt phiên đăng nhập nhưng bảo toàn 100% dữ liệu lịch sử nộp bài và điểm số phục vụ thanh tra).
- **Nhánh tính năng (Pull Request):**
  - Nhánh: `feature/quan-csdl-hethong`.
  - Sản phẩm đóng góp: Tài liệu đặc tả CSDL `docs/DAC_TA_CSDL.md` và tập kịch bản dữ liệu thông báo mẫu `server/seed_quan_thongbao.js`.

#### 3. Phạm Thị Hà Vy (`phamthihavy032-dev`) — Phân Tích Nghiệp Vụ & Phát Triển Học Liệu (Curriculum Specialist)
- **Phạm vi phụ trách:** Khảo sát khung chương trình giáo dục phổ thông môn Tin học và STEM Robotic cấp Trung học (lứa tuổi 12-18); thiết kế cấu trúc 3 nhánh lộ trình học tập, biên soạn 8 bộ học liệu số chuyên sâu (kết hợp lý thuyết cơ khí, nguyên lý điện tử, kỹ thuật lập trình vi điều khiển) và bảng tra cứu sơ đồ chân phần cứng (Pinout Diagram).
- **Mô đun IPO trực tiếp phát triển (4/27 mô đun):**
  - `QTHL.01` (Biên soạn và đăng tải học liệu, bài giảng lý thuyết và sơ đồ chân phần cứng).
  - `QTHL.02` (Cập nhật, chỉnh sửa, ẩn/hiện học liệu kèm cơ chế an toàn khi đang có học sinh thực hành).
  - `TCPP.01` (Tra cứu danh mục lộ trình học tập, bài giảng điện tử và video minh họa).
  - `TCPP.02` (Trạm tra cứu linh kiện phần cứng: Bo mạch Arduino Uno R3, Cảm biến siêu âm HC-SR04, Cầu H L298N và cẩm nang bắt lỗi xung/nguồn điện).
- **Luồng tự động phụ trách (1 luồng):**
  - `DF-05` (Phát hiện học liệu có tỷ lệ học sinh gặp lỗi cao > 30% và tự động tắt cờ cảnh báo `CoCanCapNhat = 0` ngay khi Giảng viên cập nhật nội dung học liệu mới).
- **Nhánh tính năng (Pull Request):**
  - Nhánh: `feature/vy-hoclieu-morong`.
  - Sản phẩm đóng góp: Hồ sơ nghiệp vụ học liệu `docs/NGHIEP_VU_HOC_LIEU.md` và tập kịch bản nạp học liệu mở rộng `server/seed_vy_hoclieu_morong.js`.

#### 4. Nguyễn Thị Thanh Thảo (`thanhthao-21`) — Phân Tích Chức Năng, Báo Cáo & UI/UX (Frontend & Analytics Designer)
- **Phạm vi phụ trách:** Xây dựng hệ thống thiết kế Creative Studio & Neo-Brutalist thống nhất toàn diện trên nền `/css/theme.css` (lưới canvas chấm 32px, nút bấm cơ học `.btn-playful` đổ bóng cứng 4px, 100% icon SVG vector sắc nét, bố cục Bento Grid phẳng hóa); thiết kế các bảng điều khiển trực quan hóa dữ liệu và biểu mẫu in ấn báo cáo chuẩn sư phạm.
- **Mô đun IPO trực tiếp phát triển (5/27 mô đun):**
  - `TKDL.01` (Bảng điều khiển phân tích kết quả học tập, tỷ lệ hoàn thành lộ trình và biểu đồ phân bổ điểm).
  - `TKDL.02` (Hệ thống phát hiện bất thường: Cảnh báo bài tập có tỷ lệ nộp bài lỗi vượt ngưỡng 30%).
  - `XBC.01` (Trích xuất báo cáo tổng hợp tiến độ học tập toàn khóa).
  - `XBC.02` (Bộ lọc dữ liệu nâng cao và xuất bảng điểm học sinh sang định dạng CSV/PDF chuẩn trường học).
  - `TTCĐ.01` (Không gian diễn đàn trao đổi kỹ thuật, đặt câu hỏi gỡ lỗi và bình chọn giải pháp hữu ích).
- **Luồng tự động phụ trách (1 luồng):**
  - `DF-05` (Thuật toán quét tỷ lệ lỗi bài nộp tổng hợp, kích hoạt cờ cảnh báo bài tập có vấn đề sư phạm hiển thị trực tiếp trên Dashboard Giảng viên).
- **Nhánh tính năng (Pull Request):**
  - Nhánh: `feature/thao-ui-baocao`.
  - Sản phẩm đóng góp: Tài liệu thiết kế giao diện UI/UX `docs/THIET_KE_UI_UX.md` và gói định kiểu tương thích thiết bị di động `public/css/responsive-mobile.css`.

#### 5. Phạm Kỳ Hải (`kyhaipham95-oss`) — Quản Lý Chất Lượng & QA Lead (Test Engineer)
- **Phạm vi phụ trách:** Thiết lập ma trận kiểm thử chất lượng hệ thống, thiết kế bộ dữ liệu 12 Test Cases chuẩn mực kiểm tra thuật toán máy chấm tự động; xây dựng kịch bản kiểm thử tích hợp E2E khép kín toàn bộ hệ thống (`full_system_test.js`); rà soát các lỗ hổng bảo mật phân quyền RBAC và kiểm tra ràng buộc phi chức năng (NFR-01: thời gian máy chấm < 3 giây).
- **Mô đun IPO trực tiếp phát triển (4/27 mô đun):**
  - `QLDA.01` (Quản lý ngân hàng đề bài dự án thực hành và bộ tiêu chí kiểm thử phần cứng).
  - `KTĐG.01` (Khởi tạo và cấu hình phòng thi trực tuyến: thời gian làm bài, cấu trúc câu hỏi và điều kiện nộp bài).
  - `KTĐG.02` (Phòng thi trực tuyến ứng dụng công nghệ giám sát chuyển tab qua Page Visibility API).
  - `TTCĐ.02` (Bảng vinh danh Top dự án Robotic xuất sắc - Wall of Fame tích hợp phát video YouTube trực tiếp).
- **Luồng tự động phụ trách (1 luồng):**
  - `DF-06` (Cơ chế chống gian lận tự động: Phát hiện học sinh chuyển tab hoặc rời màn hình thi, cảnh báo vi phạm và tự động khóa màn hình nộp bài khi vi phạm quá 3 lần).
- **Nhánh tính năng (Pull Request):**
  - Nhánh: `feature/hai-qa-kiemthu`.
  - Sản phẩm đóng góp: Báo cáo kiểm thử chất lượng `docs/BAO_CAO_KIEM_THU_QA.md` và bộ kịch bản kiểm thử trường hợp biên `server/tests/qa_edge_cases.js`.

---

## PHẦN 2: CHI TIẾT 5 CHẶNG PHÁT TRIỂN TOÀN DIỆN
### (Từ ngày 01/11/2026 đến ngày 15/11/2026)

```
+---------------------------------------------------------------------------------------------------+
|                            TIẾN TRÌNH 5 CHẶNG PHÁT TRIỂN DỰ ÁN                                     |
+-------------------+-------------------+-------------------+-------------------+-------------------+
|  CHẶNG 1          |  CHẶNG 2          |  CHẶNG 3          |  CHẶNG 4          |  CHẶNG 5          |
|  (01/11 - 03/11)  |  (04/11 - 06/11)  |  (07/11 - 09/11)  |  (10/11 - 12/11)  |  (13/11 - 15/11)  |
|  • Khảo sát &     |  • Node.js Core   |  • Judge Engine   |  • Phòng thi DF-06|  • E2E 37/37 PASS |
|    Đặc tả 27 IPO  |  • Auth & RBAC    |    FastAPI (5000) |  • Cảnh báo DF-05 |  • 1-Click &      |
|  • CSDL 12 Bảng   |  • 3 Lộ trình     |  • SandBox 3.0s   |  • Xuất CSV / PDF |    Watchdog       |
|  • Neo-Brutalist  |  • 8 Học liệu     |  • Thẩm định Video|  • Diễn đàn DF-03 |  • Release GitHub |
|    Design System  |  • 12 Test Cases  |  • Mở khóa DF-02  |  • Khóa mềm DF-07 |  • Hoàn tất Docs  |
+-------------------+-------------------+-------------------+-------------------+-------------------+
```

---

### 📅 Chặng 1: Khảo Sát Nghiệp Vụ, Đặc Tả Yêu Cầu & Thiết Kế Kiến Trúc Nền Tảng
**Thời gian:** 01/11/2026 – 03/11/2026  
**Mục tiêu:** Xác lập cơ sở lý thuyết, kiến trúc hệ thống và chuẩn hóa tài liệu kỹ thuật Single Source of Truth.

- **Nội dung thực hiện chi tiết:**
  1. **Khảo sát nghiệp vụ thực tế:** Nhóm tiến hành khảo sát thực tế việc giảng dạy môn Tin học và các câu lạc bộ STEM Robotic tại trường phổ thông; nhận diện nút thắt cổ chai: Giáo viên mất quá nhiều thời gian kiểm tra code thủ công và không có công cụ nghiệm thu mô hình robot từ xa.
  2. **Xây dựng tài liệu đặc tả `PRODUCT.md`:** Định nghĩa chi tiết 6 phân hệ lớn, 27 mô đun vào - xử lý - ra (IPO) và 7 luồng dữ liệu tự động (`DF-01` đến `DF-07`).
  3. **Thiết kế Cơ sở dữ liệu quan hệ (`database_schema.sql`):** Thành viên Trần Thế Quân chủ trì thiết kế CSDL `StemRoboticDB_V2` trên Microsoft SQL Server gồm 12 bảng chuẩn hóa BCNF: `NguoiDung`, `LopHoc`, `LoTrinh`, `HocLieu`, `DuAn`, `TestCase`, `BaiNop`, `ChiTietKetQua`, `BangVinhDanh`, `DienDan_ChuDe`, `DienDan_BinhLuan`, `HoTro_BaoCao`. Toàn bộ dữ liệu tiếng Việt sử dụng `NVARCHAR`.
  4. **Xây dựng Hệ thống thiết kế Design System (`theme.css`):** Thành viên Nguyễn Thị Thanh Thảo xây dựng khung giao diện Neo-Brutalist & Bento Grid, chấm dứt hoàn toàn AI Slop, sử dụng lưới chấm 32px canvas và các nút bấm cơ học đổ bóng cứng.
  5. **Lập kế hoạch kiểm thử QA:** Thành viên Phạm Kỳ Hải xây dựng ma trận kiểm thử và đặt ra các chỉ số ràng buộc phi chức năng (NFR-01: Máy chấm phản hồi < 10 giây, NFR-02: Chuẩn tương phản WCAG AA).

---

### 📅 Chặng 2: Xây Dựng Lõi Web Server Node.js & Xác Thực Người Dùng (Auth & RBAC)
**Thời gian:** 04/11/2026 – 06/11/2026  
**Mục tiêu:** Xây dựng khung ứng dụng Web Express.js Port 80, hệ thống phân quyền 4 vai trò và nạp cây học liệu nền tảng.

- **Nội dung thực hiện chi tiết:**
  1. **Khởi tạo kiến trúc Web Server:** Thành viên Trần Minh Nhật cấu hình Node.js/Express trên Port 80, thiết lập thư viện `mssql` kết nối Pool an toàn tới SQL Server `ADMIN-PC\SQLEXPRESS`.
  2. **Triển khai phân hệ xác thực SSO (`QLTK.01`, `QLTK.02`, `QLTK.03`):** Xây dựng trang đăng nhập tập trung, kiểm tra mật khẩu bằng thuật toán băm an toàn `bcrypt`, quản lý phiên qua Cookie Session và chuẩn bị cơ chế OTP khôi phục mật khẩu.
  3. **Thiết lập Middleware phân quyền RBAC (`authMiddleware.js`):** Kiểm soát phân quyền nghiêm ngặt 4 vai trò (`isStudent`, `isTeacher`, `isAdmin`), tự động điều hướng người dùng về đúng không gian làm việc tương ứng sau khi đăng nhập.
  4. **Xây dựng cổng giao diện Server-Side Rendering (EJS):** Hoàn thiện các trang giao diện cốt lõi: Trang chủ Bento (`index.ejs`), Cổng học sinh (`student.ejs`), Bàn làm việc giáo viên (`teacher.ejs`), Cổng quản trị (`admin.ejs`).
  5. **Thiết lập cây lộ trình & 8 bài học liệu chuẩn:** Thành viên Phạm Thị Hà Vy xây dựng cấu trúc 3 lộ trình học tập liên hoàn và nhập liệu 8 bài học cơ bản về Arduino Uno R3, Cảm biến siêu âm HC-SR04 và Mạch cầu H L298N (`QTHL.01`, `TCPP.01`).
  6. **Thiết kế 12 bộ TestCase ban đầu:** Thành viên Phạm Kỳ Hải biên soạn dữ liệu đầu vào/đầu ra chuẩn cho 4 bài tập thực hành lập trình robot đầu tiên.

---

### 📅 Chặng 3: Phát Triển Máy Chấm Tự Động FastAPI (Judge Engine) & Quy Trình Nghiệm Thu Kép
**Thời gian:** 07/11/2026 – 09/11/2026  
**Mục tiêu:** Xây dựng trọn vẹn dịch vụ máy chấm tự động Python FastAPI Port 5000, giả lập phần cứng và luồng nghiệm thu Video thực tế.

- **Nội dung thực hiện chi tiết:**
  1. **Xây dựng Judge Engine phân tán (`judge_engine/`):** Thành viên Trần Minh Nhật xây dựng dịch vụ FastAPI chạy trên Port 5000, cấu hình CORS và định tuyến REST API `/judge/run`.
  2. **Cơ chế Sandbox an toàn & Giới hạn tài nguyên:** Triển khai `judge_engine/services/sandbox.py` sử dụng `subprocess.run` với thời gian thực thi tối đa `timeout = 3.0s`, ngăn chặn vòng lặp vô hạn và tràn bộ nhớ.
  3. **Giả lập bo mạch phần cứng Arduino C++ (`arduino_mock.h`):** Xây dựng bộ mock header C++ giả lập các hàm `pinMode`, `digitalWrite`, `pulseIn`, `Serial.println`, cho phép chấm mã nguồn `.ino/.cpp` chính xác 100% trên server mà không cần cắm bo mạch vật lý.
  4. **Ràng buộc kép & Luồng tự động DF-01 (`XLBN.01` -> `XLBN.03`):** Học sinh bắt buộc phải nộp mã nguồn VÀ nhập link Video YouTube nghiệm thu cơ khí. Khi code vượt qua 100% TestCase, hệ thống tự động kích hoạt luồng `DF-01` chuyển trạng thái sang `Chờ duyệt Video` và gửi lên Dashboard Giáo viên.
  5. **Thẩm định Video & Chốt điểm (`KQBN.01`, `KQBN.02`):** Giảng viên xem video vận hành robot trực tiếp trên giao diện và thực hiện chốt điểm phần cứng, hoàn tất chu trình đánh giá kết hợp.
  6. **Cơ chế mở khóa tự động DF-02 (`QLDA.02`):** Thành viên Trần Thế Quân lập trình trigger logic: Học sinh hoàn thành bài tập tiên quyết với kết quả Đạt sẽ tự động mở khóa bài tập tiếp theo trên lộ trình học.
  7. **Trạm tra cứu linh kiện phần cứng (`TCPP.02`):** Thành viên Phạm Thị Hà Vy hoàn thiện giao diện tra cứu sơ đồ chân Pinout và cẩm nang bắt lỗi xung/nguồn điện.

---

### 📅 Chặng 4: Hoàn Thiện Các Phân Hệ Mở Rộng, Chống Gian Lận & Cảnh Báo Chất Lượng
**Thời gian:** 10/11/2026 – 12/11/2026  
**Mục tiêu:** Bổ sung các mô đun phòng thi trực tuyến, phân tích thống kê lỗi, xuất báo cáo đào tạo, hỗ trợ kỹ thuật và diễn đàn.

- **Nội dung thực hiện chi tiết:**
  1. **Phòng thi trực tuyến chống gian lận (`KTĐG.01`, `KTĐG.02` & Luồng `DF-06`):** Thành viên Phạm Kỳ Hải tích hợp Page Visibility API trên trang `/exam`, tự động đếm số lần học sinh chuyển tab hoặc thu nhỏ trình duyệt; cảnh báo nhắc nhở và tự động khóa màn hình nộp bài thi nếu vi phạm quá 3 lần.
  2. **Thuật toán quét tỷ lệ lỗi bài tập & Luồng `DF-05` (`TKDL.02`, `QTHL.02`):** Thành viên Nguyễn Thị Thanh Thảo và Phạm Thị Hà Vy phối hợp xây dựng tính năng tự động phát hiện bài tập có tỷ lệ nộp bài lỗi vượt ngưỡng 30%, gắn cờ cảnh báo trên giao diện Giáo viên để kịp thời cập nhật lại đề bài hoặc mã nguồn mẫu.
  3. **Hệ thống phân tích học tập & Xuất báo cáo (`TKDL.01`, `XBC.01`, `XBC.02`):** Thành viên Nguyễn Thị Thanh Thảo hoàn thiện bảng điều khiển thống kê điểm số và chức năng trích xuất bảng điểm học sinh sang file CSV và định dạng in ấn PDF chuẩn sư phạm.
  4. **Phân hệ Báo cáo sự cố & Thông báo bảo trì (`HTTB.01`, `HTTB.02`):** Thành viên Trần Thế Quân xây dựng modal gửi phản ánh lỗi kỹ thuật và bảng phát thông báo bảo trì toàn hệ sinh thái từ Quản trị viên.
  5. **Diễn đàn kỹ thuật & Luồng `DF-03` (`TTCĐ.01`):** Triển khai tính năng đăng bài hỏi đáp, cơ chế bình chọn Upvote giải pháp hay và tự động đẩy bài viết lên mục Nổi bật khi đạt trên 5 lượt bình chọn.
  6. **Cơ chế khóa mềm bảo toàn dữ liệu DF-07 (`QTHT.03`):** Quản trị viên khóa tài khoản học sinh đã tốt nghiệp bằng cách cập nhật cờ trạng thái, bảo toàn nguyên vẹn 100% lịch sử nộp bài và điểm số trong SQL Server.

---

### 📅 Chặng 5: Kiểm Thử Toàn Diện E2E, Tối Ưu Vận Hành 1-Click & Đóng Gói Phát Hành
**Thời gian:** 13/11/2026 – 15/11/2026  
**Mục tiêu:** Kiểm thử khép kín toàn bộ hệ thống, tự động hóa khởi động bằng 1 cú nhấp đúp và đóng gói xuất bản GitHub.

- **Nội dung thực hiện chi tiết:**
  1. **Xây dựng bộ kiểm thử tích hợp tự động E2E (`server/tests/full_system_test.js`):** Thành viên Phạm Kỳ Hải và Trần Minh Nhật phối hợp xây dựng kịch bản kiểm thử toàn diện, quét qua tất cả các endpoint API của 27 mô đun IPO và 7 luồng tự động. Kết quả: **37/37 Test Case ĐẠT (100% PASS)** khi chạy lệnh `npm test`.
  2. **Chuẩn hóa công cụ khởi động tập trung 1-Click (`STEM_Robotic_App.ps1`):** Khử bỏ hoàn toàn đường dẫn cứng, sử dụng `$PSScriptRoot` động; tích hợp cơ chế Watchdog giám sát đóng sạch Port 80 & 5000 khi người dùng thoát, ngăn ngừa triệt để lỗi kẹt cổng EADDRINUSE; tự động tải `cloudflared.exe` và cấp phát Public URL gửi giảng viên.
  3. **Tạo tiện ích nhấp đúp `.bat`:** Tạo file `Start_STEM_Robotic.bat` (chạy script với quyền bypass) và `Tao_Icon_Desktop.bat` (tạo lối tắt ra màn hình Desktop).
  4. **Khắc phục lỗi điều hướng phân hệ Giáo viên (v2.2.0):** Xử lý dứt điểm lỗi cú pháp JavaScript trong `teacher.ejs`, khôi phục menu chuyển đổi tab nghiệp vụ và luồng tải danh sách bài nộp chờ duyệt video.
  5. **Đóng gói phát hành các mốc Release trên GitHub:**
     - **v1.0.0 (Milestone 1 - 14/11):** Khởi tạo kiến trúc 3 tầng phân tán và 19 mô đun cốt lõi.
     - **v2.0.0 (Milestone 2 - 14/11):** Hoàn thành 100% 27/27 mô đun IPO, nạp giáo trình thực tế và tài liệu kỹ thuật máy chấm.
     - **v2.1.0 (Milestone 3 - 15/11):** Tích hợp bộ khởi động 1-Click Watchdog và phát link Cloudflare Public.
     - **v2.2.0 (15/11):** Sửa lỗi điều hướng giáo viên, nạp ảnh thực tế `docs/images/` và hoàn thiện hồ sơ dự án.
  6. **Hoàn thiện hệ thống tài liệu theo dõi tiến độ:** Đồng bộ thông tin phân công nhiệm vụ và lịch sử phát triển trên `README.md`, `CHANGELOG.md` và `docs/BAO_CAO_TIEN_DO_NHOM.md`.

---

## 🏆 KẾT LUẬN & ĐÁNH GIÁ CHẤT LƯỢNG DỰ ÁN

1. **Về Khối Lượng Chức Năng:** Dự án đã hoàn thành **27/27 mô đun IPO (100%)** và vận hành trơn tru **7/7 luồng dữ liệu tự động (DF-01 đến DF-07)** theo đúng đặc tả yêu cầu trong `PRODUCT.md`.
2. **Về Kiến Trúc & CSDL:** Hệ thống vận hành ổn định trên mô hình kiến trúc phân tán hiện đại (Node.js + Python FastAPI + SQL Server), CSDL gồm 12 bảng đạt chuẩn chuẩn hóa BCNF, bảo toàn tính toàn vẹn dữ liệu.
3. **Về Giao Diện & Trải Nghiệm:** Áp dụng xuất sắc phong cách thiết kế Neo-Brutalist & Bento Grid, loại bỏ triệt để AI Slop, tối ưu hóa thao tác trực quan cho học sinh và công cụ chấm điểm cho giảng viên.
4. **Về Tinh Thần Làm Việc Nhóm:** Cả 5 thành viên trong nhóm A+ đã thể hiện tinh thần trách nhiệm cao độ, hoàn thành đúng tiến độ từng mốc cam kết, phối hợp nhịp nhàng từ khâu thiết kế CSDL, phát triển backend, tối ưu giao diện đến kiểm thử chất lượng QA.

---
*Báo cáo được hoàn thiện và ký xác nhận bởi toàn bộ 5 thành viên Nhóm A+ ngày 15 tháng 11 năm 2026.*
