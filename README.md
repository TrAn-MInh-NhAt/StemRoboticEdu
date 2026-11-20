# STEM ROBOTIC EDU — HỆ THỐNG HỌC TẬP TRỰC TUYẾN VÀ CHẤM BÀI LẬP TRÌNH TỰ ĐỘNG

<p align="center">
  <img src="https://img.shields.io/badge/Node.js-v20%20%7C%20v22-339933?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/FastAPI-Python%203.11-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/SQL%20Server-2019%20%7C%202022-CC292B?style=for-the-badge&logo=microsoft-sql-server&logoColor=white" alt="SQL Server" />
  <img src="https://img.shields.io/badge/IPO%20Modules-27%2F27%20(100%25)-5A52FF?style=for-the-badge" alt="IPO Modules" />
  <img src="https://img.shields.io/badge/Release-v2.3.0-047857?style=for-the-badge&logo=git&logoColor=white" alt="Version" />
</p>

---

## 1. THÔNG TIN ĐỒ ÁN VÀ ĐƠN VỊ THỰC HIỆN

* **Cơ sở đào tạo:** Đại học Đà Nẵng — Trường Đại học Sư phạm
* **Khoa:** Toán - Tin
* **Học phần:** Lập trình Web
* **Giảng viên hướng dẫn khoa học:** TS. Đặng Hùng Vĩ
* **Nhóm sinh viên thực hiện (Nhóm A+):**
  1. **Trần Minh Nhật** (Trưởng nhóm & Kiến trúc sư trưởng — GitHub: `TrAn-MInh-NhAt`)
  2. **Trần Thế Quân** (Thiết kế Hệ thống & CSDL — GitHub: `tranquan6211-dot`)
  3. **Phạm Thị Hà Vy** (Phân tích Nghiệp vụ & Học liệu — GitHub: `phamthihavy032-dev`)
  4. **Nguyễn Thị Thanh Thảo** (Phân tích Chức năng, Báo cáo & UI/UX — GitHub: `thanhthao-21`)
  5. **Phạm Kỳ Hải** (Quản lý Chất lượng & QA Lead — GitHub: `kyhaipham95-oss`)
* **Kho lưu trữ chính thức (GitHub):** [https://github.com/TrAn-MInh-NhAt/StemRoboticEdu](https://github.com/TrAn-MInh-NhAt/StemRoboticEdu)
* **Phiên bản phát hành hiện hành:** `v2.3.0` (Mốc bảo vệ đồ án: Tháng 11/2026)

---

## 2. TỔNG QUAN HỆ THỐNG VÀ CÁC ĐIỂM NHẤN KỸ THUẬT

### 2.1. Đặt vấn đề và Mục tiêu giải pháp
Trong giáo dục STEM Robotics cấp Trung học phổ thông, học sinh phải kết hợp song song giữa tư duy lập trình vi điều khiển (C++/Arduino, Python) và kỹ năng thao tác cơ khí phần cứng thực tế. Các hệ thống LMS truyền thống chỉ dừng lại ở mức thu nộp tệp báo cáo tĩnh, không có khả năng kiểm thử tính đúng đắn của thuật toán, cũng như thiếu cơ chế thẩm định xem robot có thực sự vận hành được trên sa bàn hay không.

Hệ thống **STEM Robotic Edu** được thiết kế và triển khai nhằm giải quyết toàn diện bài toán này cho học sinh khối **Lớp 10/1** thông qua quy trình đánh giá kép:
1. **Kiểm tra thuật toán tự động:** Máy chấm biên dịch và kiểm thử mã nguồn cô lập thông qua bộ TestCase đa kịch bản.
2. **Thẩm định vận hành phần cứng:** Giáo viên trực tiếp kiểm duyệt video ghi hình mô hình robot chạy thực tế trước khi chốt điểm chính thức.

### 2.2. Bốn Điểm Nhấn Kỹ Thuật Nổi Bật

1. **Kiến trúc phân tán 3 tầng (3-Tier Microservices) tách biệt tuyệt đối:**
   - **Tầng Web Server (Node.js & Express — Cổng 80):** Tiếp nhận tương tác người dùng, quản lý phiên xác thực (Session RBAC 4 vai trò), render giao diện Server-Side Rendering (SSR với EJS) và điều phối API.
   - **Tầng Máy chấm cô lập (FastAPI Judge Engine — Cổng 5000):** Dịch vụ độc lập viết bằng Python FastAPI, chạy mã nguồn C++ (`g++`), Arduino (`arduino_mock.h`) và Python (`python 3.11`) trong môi trường Sandbox với giới hạn tài nguyên khắt khe (Timeout < 3.0s, RAM < 128MB). Tốc độ trả kết quả trung bình toàn hệ thống đạt chuẩn NFR-01 (< 10 giây).
   - **Tầng Lưu trữ CSDL (Microsoft SQL Server — Cổng 1433):** Cơ sở dữ liệu `StemRoboticDB_V2` gồm 12 bảng chuẩn hóa đạt dạng chuẩn Boyce-Codd (BCNF), bảo toàn toàn vẹn dữ liệu và hỗ trợ xử lý giao dịch đồng thời.

2. **Tự động hóa 7 Luồng Nghiệp vụ Thông minh (`DF-01` đến `DF-07`):**
   - Tự động kích hoạt máy chấm khi học sinh nộp bài và chuyển trạng thái sang "Chờ duyệt Video" ngay khi đạt 100% TestCase (`DF-01`).
   - Tự động mở khóa các dự án và thử thách nâng cao khi đạt điểm yêu cầu (`DF-02`).
   - Tự động nâng hạng chủ đề kỹ thuật lên Top Trending khi đạt ngưỡng tương tác (`DF-03`).
   - Bộ phân tích cú pháp AST tự động dịch mã lỗi biên dịch thô sang chỉ dẫn sư phạm tiếng Việt dễ hiểu cho học sinh (`DF-04`).
   - Tự động gắn cờ cảnh báo chất lượng học liệu khi tỷ lệ học sinh mắc lỗi vượt quá 30% lớp (`DF-05`).
   - Cơ chế giám sát sự tập trung màn hình thi trực tuyến chống gian lận chuyển tab (`DF-06`).
   - Bảo toàn lịch sử học tập khi vô hiệu hóa mềm tài khoản (`DF-07`).

3. **Ngôn ngữ Thiết kế Neo-Brutalist & Creative Studio:**
   - 100% đồ họa vector SVG nội tuyến sắc nét; nghiêm cấm sử dụng Emoji hoặc phông biểu tượng trôi nổi để đảm bảo tính học thuật và trang nhã.
   - Bảng màu tương phản chuẩn WCAG AA: Nền canvas `#F4F6F8` kèm lưới chấm kỹ thuật 32px, khối chức năng Bento Grid, bóng đổ cơ học sắc nét (`4px 4px 0 #5A52FF`).
   - Thư viện chuyển động vật lý: Nam châm con trỏ chuột (`.magnet-btn`), đèn LED nhịp thở cảm biến (`.telemetry-pulse`), và hoạt cảnh cuộn nhịp nhàng (`.bouncy-up`).
   - Tối ưu Responsive đa thiết bị thông qua tệp [public/css/responsive-mobile.css](public/css/responsive-mobile.css) (hỗ trợ Desktop, Tablet thu gọn 72px, Mobile Drawer, và bản in báo cáo PDF chuẩn mực).

4. **Vận hành Tự động hóa 1-Click & Đồng bộ Đa Máy (Watchdog Controller):**
   - Công cụ khởi động [Start_STEM_Robotic.bat](Start_STEM_Robotic.bat) phối hợp cùng [STEM_Robotic_App.ps1](STEM_Robotic_App.ps1) tự động kích hoạt đồng thời cả Web Server (Port 80) và Judge Engine (Port 5000), tự động phát link công khai Cloudflare Tunnel và tự động dọn sạch tiến trình chiếm cổng khi đóng ứng dụng.
   - Hỗ trợ cả 2 phương thức kết nối CSDL: Windows Authentication (không mật khẩu) và SQL Server Authentication (`sa`).

---

## 3. SƠ ĐỒ KIẾN TRÚC HỆ THỐNG VÀ CƠ SỞ DỮ LIỆU

### 3.1. Sơ đồ Luồng Xử Lý Tổng Thể (Architecture Flowchart)

```
+-----------------------------------------------------------------------------------+
|                        TRÌNH DUYỆT NGƯỜI DÙNG (CLIENT)                            |
|   - Design System: Neo-Brutalist, Bento Grid, 100% SVG Vector nội tuyến           |
|   - CSS Framework: /css/theme.css & /css/responsive-mobile.css                    |
|   - Các cổng giao tiếp: Học sinh (/student), Giáo viên (/teacher),                |
|                         Phòng thi (/exam), Cộng đồng (/community), Admin (/admin) |
+----------------------------------------+------------------------------------------+
                                         |
                                         | HTTP/REST (Port 80)
                                         v
+-----------------------------------------------------------------------------------+
|                     TẦNG 1: WEB APPLICATION SERVER (NODE.JS)                      |
|   - Nền tảng: Node.js (v20/v22 LTS) & Express Framework                           |
|   - Render Engine: EJS (Server-Side Rendering)                                    |
|   - Xác thực: Session-based Auth & Middleware phân quyền RBAC 4 vai trò           |
|   - Điều phối luồng dữ liệu & Proxy kết nối máy chấm                              |
+----------------------+------------------------------------+-----------------------+
                       |                                    |
     HTTP POST (Proxy) |                                    | TDS Protocol (Port 1433)
     Mã nguồn + TestCode|                                    | mssql / tedious pool
                       v                                    v
+--------------------------------------+   +----------------------------------------+
|      TẦNG 2: JUDGE ENGINE            |   |     TẦNG 3: CƠ SỞ DỮ LIỆU CHUẨN HÓA    |
|   (Python FastAPI - Cổng 5000)       |   |       (SQL Server: StemRoboticDB_V2)   |
| - Sandbox Process cô lập             |   | - 12 bảng nghiệp vụ chuẩn BCNF         |
| - Bộ giả lập Arduino: arduino_mock.h |   | - Ràng buộc khóa ngoại & Cascade       |
| - Trình biên dịch: g++ / python3     |   | - Thủ tục lưu trữ & Trigger tự động    |
| - AST Error Analyzer (DF-04)         |   | - Dữ liệu thực nghiệm chuẩn Lớp 10/1   |
| - Giới hạn: Timeout 3.0s | 128MB RAM |   | - Lưu vết bài nộp & Bảng điểm          |
+--------------------------------------+   +----------------------------------------+
```

### 3.2. Cấu Trúc 12 Bảng Dữ Liệu Chuẩn BCNF (`StemRoboticDB_V2`)

Chi tiết thiết kế bảng, kiểu dữ liệu, khóa chính, khóa ngoại và chỉ mục được đặc tả đầy đủ trong tài liệu [docs/DAC_TA_CSDL.md](docs/DAC_TA_CSDL.md) và kịch bản khởi tạo [database_schema.sql](database_schema.sql):

| STT | Tên Bảng CSDL | Tên Thực Thể | Mô Tả Chức Năng Nghiệp Vụ |
|:---:|:---|:---|:---|
| 1 | `NguoiDung` | ENT-01 | Quản lý thông tin tài khoản, phân quyền 4 vai trò, lớp học (`10/1`), trạng thái hoạt động và khóa mềm (`DF-07`). |
| 2 | `KhoaHocLoTrinh` | ENT-02 | Danh mục các lộ trình đào tạo STEM Robotics (Cơ khí, Mạch điện & Cảm biến, Lập trình nhúng). |
| 3 | `HocLieu` | ENT-03 | Quản lý kho bài giảng, video hướng dẫn, sơ đồ chân linh kiện và cờ cảnh báo cập nhật chất lượng (`DF-05`). |
| 4 | `DuAnBaiTap` | ENT-04 | Danh sách dự án thực hành, yêu cầu kỹ thuật, thời hạn nộp và liên kết dự án tiên quyết (`DF-02`). |
| 5 | `TestCase` | ENT-04b | Tập hợp dữ liệu đầu vào, kết quả mong đợi, trọng số điểm và gợi ý sửa lỗi dùng cho máy chấm tự động. |
| 6 | `BaiNop` | ENT-05 | Lưu trữ lịch sử nộp bài gồm file mã nguồn, link video nghiệm thu phần cứng và trạng thái chấm (`DF-01`). |
| 7 | `KetQuaDiem` | ENT-06 | Kết quả chi tiết từng lần chấm: Điểm mã nguồn máy chấm (50%), điểm video do giáo viên duyệt (50%) và điểm tổng. |
| 8 | `MayCham` | ENT-07 | Giám sát trạng thái hoạt động, địa chỉ IP/Port, tải CPU và độ trễ phản hồi của máy chấm Sandbox. |
| 9 | `DeThiKiemTra` | ENT-09 | Thiết lập đề thi, thời lượng làm bài, cơ số điểm và cấu hình kích hoạt chế độ giám sát chống chuyển tab (`DF-06`). |
| 10 | `BaiLamKiemTra` | ENT-10 | Ghi nhận bài thi trực tuyến, nhật ký số lần rời màn hình thi (`visibilitychange`) và trạng thái nộp tự động. |
| 11 | `HoTroThongBao` | ENT-08 | Hệ thống phiếu báo sự cố kỹ thuật của học sinh (`HTTB.01`) và thông báo phát sóng khẩn cấp từ ban quản trị (`HTTB.02`). |
| 12 | `ThaoLuan` | ENT-11 | Quản lý bài đăng diễn đàn trao đổi lỗi vi điều khiển, số lượt bình chọn (`Like`), bình luận và thuật toán Top Trending (`DF-03`). |

---

## 4. PHÂN HỆ CHỨC NĂNG (27/27 MÔ ĐUN IPO) VÀ 7 LUỒNG TỰ ĐỘNG HÓA

### 4.1. Bảng Tổng Hợp 6 Phân Hệ và 27 Mô Đun IPO

Hệ thống đáp ứng trọn vẹn 100% tài liệu kiến trúc [PRODUCT.md](PRODUCT.md):

```
+----------------------------------------------------------------------------------------------------+
|                                    TỔNG THỂ 27 MÔ ĐUN IPO                                          |
+------------------------------------+----------------------------------+----------------------------+
| Phân hệ 1: Quản Trị Hệ Thống & TK  | Phân hệ 2: Quản Lý & Tra Cứu HL  | Phân hệ 3: Dự Án & Tiến Độ |
|  - QLTK.01: Đăng ký tài khoản      |  - QTHL.01: Thêm bài giảng/code  |  - QLDA.01: Giao dự án & TC|
|  - QLTK.02: Đăng nhập & Session    |  - QTHL.02: Cập nhật & Ẩn bài    |  - QLDA.02: Mở khóa nâng ca|
|  - QLTK.03: Khôi phục mật khẩu OTP |  - TCPP.01: Cây lộ trình học tập |  - KTĐG.01: Theo dõi lớp   |
|  - QTHT.01: Phân quyền RBAC 4 role |  - TCPP.02: Trạm tra cứu linh kiệ|  - KTĐG.02: Phòng thi onlin|
|  - QTHT.02: Cập nhật hồ sơ cá nhân |                                  |                            |
|  - QTHT.03: Khóa mềm tài khoản     |                                  |                            |
+------------------------------------+----------------------------------+----------------------------+
| Phân hệ 4: Xử Lý Bài Nộp & Chấm ĐT | Phân hệ 5: Thống Kê & Báo Cáo    | Phân hệ 6: Hỗ Trợ & CĐ     |
|  - XLBN.01: Tiếp nhận Code + Video |  - TKDL.01: Thống kê nộp & Điểm  |  - TTCĐ.01: Diễn đàn kỹ thu|
|  - XLBN.02: Máy chấm Sandbox       |  - TKDL.02: Phân tích log lỗi lớp|  - TTCĐ.02: Wall of Fame   |
|  - XLBN.03: Phản hồi kết quả/thời g|  - XBC.01: Top Trending chủ đề   |  - HTTB.01: Phiếu sự cố    |
|  - KQBN.01: Thẩm định video mô hình|  - XBC.02: Xuất bảng điểm CSV/PDF|  - HTTB.02: Thông báo khẩn |
|  - KQBN.02: Chốt điểm tổng hợp     |                                  |                            |
+------------------------------------+----------------------------------+----------------------------+
```

* **Phân hệ 1: Quản trị Hệ thống & Tài khoản Người dùng:**
  - `QLTK.01` (Đăng ký tài khoản), `QLTK.02` (Đăng nhập & Phiên Session), `QLTK.03` (Khôi phục mật khẩu qua mã OTP 6 số).
  - `QTHT.01` (Phân quyền RBAC 4 vai trò), `QTHT.02` (Hồ sơ cá nhân & Đổi mật khẩu), `QTHT.03` (Khóa tài khoản bảo toàn dữ liệu).
* **Phân hệ 2: Quản lý Học liệu & Phân phối Khóa học:**
  - `QTHL.01` (Thêm mới bài giảng & Code mẫu), `QTHL.02` (Cập nhật & Điều kiện ẩn học liệu khi có bài tập đang mở).
  - `TCPP.01` (Hiển thị danh mục & Cây lộ trình STEM), `TCPP.02` (Trạm tra cứu linh kiện, sơ đồ chân & Bắt lỗi cú pháp).
* **Phân hệ 3: Quản lý Dự án Thực hành & Kiểm tra Đánh giá:**
  - `QLDA.01` (Giao dự án STEM & Thiết lập bộ TestCase), `QLDA.02` (Điều kiện mở khóa dự án kế tiếp).
  - `KTĐG.01` (Giám sát tiến độ học tập toàn lớp), `KTĐG.02` (Khởi tạo phiên phòng thi trực tuyến).
* **Phân hệ 4: Xử lý Bài nộp & Chấm điểm Tự động:**
  - `XLBN.01` (Tiếp nhận bài nộp kép: Mã nguồn + Link YouTube), `XLBN.02` (Biên dịch Sandbox cô lập), `XLBN.03` (Đo thời gian chạy & Trả điểm).
  - `KQBN.01` (Giao diện giáo viên duyệt video vận hành), `KQBN.02` (Cơ chế tính điểm 50% Code + 50% Video).
* **Phân hệ 5: Thống kê & Báo cáo Đào tạo:**
  - `TKDL.01` (Thống kê tiến độ & Tỷ lệ nộp bài), `TKDL.02` (Bảng phân tích lỗi vi điều khiển phổ biến).
  - `XBC.01` (Báo cáo chủ đề trao đổi sôi nổi), `XBC.02` (Xuất bảng điểm tổng hợp định dạng CSV BOM UTF-8 và PDF in ấn).
* **Phân hệ 6: Hỗ trợ Kỹ thuật & Tương tác Cộng đồng:**
  - `TTCĐ.01` (Diễn đàn hỏi đáp kỹ thuật kèm bộ lọc), `TTCĐ.02` (Bình chọn chủ đề & Bảng vinh danh Wall of Fame).
  - `HTTB.01` (Gửi phiếu yêu cầu hỗ trợ sự cố), `HTTB.02` (Phát sóng thông báo bảo trì toàn hệ thống).

### 4.2. Bảng 7 Luồng Tự Động Hóa Nghiệp Vụ (`DF-01` đến `DF-07`)

| Mã Luồng | Tên Luồng Tự Động | Sự Kiện Kích Hoạt (Trigger) | Quy Trình Xử Lý Hệ Thống | Kết Quả Đầu Ra |
|:---:|:---|:---|:---|:---|
| `DF-01` | Chuyển trạng thái Thẩm định Video | Học sinh nộp bài và vượt qua 100% TestCase của máy chấm. | Hệ thống cập nhật bản ghi `BaiNop` sang `N'Chờ duyệt Video'` và đưa vào hàng đợi chấm của Giáo viên. | Bài nộp xuất hiện tại Bàn làm việc Giáo viên để nghiệm thu cơ khí. |
| `DF-02` | Mở khóa Thử thách Nâng cao | Học sinh hoàn thành dự án tiên quyết với điểm số $\ge 8.0$. | Kiểm tra ràng buộc `MaDuAnTienQuyet` trong bảng `DuAnBaiTap` để gỡ bỏ trạng thái khóa. | Mở khóa dự án tiếp theo trên cây lộ trình học tập của học sinh. |
| `DF-03` | Nâng hạng Top Trending Diễn đàn | Chủ đề thảo luận nhận được $\ge 5$ lượt bình chọn (Thích). | Đánh dấu bài viết lên khu vực Top Trending và ưu tiên hiển thị đầu trang chủ. | Nhãn nổi bật hiển thị trên bài viết, thúc đẩy văn hóa chia sẻ kiến thức. |
| `DF-04` | Phân tích Log lỗi Sư phạm | Trình biên dịch C++/Python trả về mã lỗi (`stderr`). | Bộ phân tích AST bắt các lỗi cú pháp kinh điển (thiếu dấu `;`, tràn biến, treo vòng lặp) và dịch sang chỉ dẫn tiếng Việt. | Học sinh nhận phản hồi sư phạm cụ thể thay vì thông báo lỗi thô. |
| `DF-05` | Cảnh báo Chất lượng Học liệu | Tỷ lệ nộp bài lỗi của cả lớp đối với một bài học vượt quá 30%. | Đánh dấu cờ `CoCanCapNhat = 1` trong bảng `HocLieu` và hiển thị cảnh báo trên Dashboard Giáo viên. | Giáo viên nắm bắt lỗ hổng kiến thức để bổ sung bài giảng hướng dẫn. |
| `DF-06` | Giám sát Phòng thi Chống Gian lận | Học sinh thi trực tuyến rời màn hình quá 3 lần (`visibilitychange`). | Bộ đếm vi phạm tăng dần; khi chạm ngưỡng 3 lần, hệ thống lập tức niêm phong bài thi và ép nộp tự động. | Bài thi bị khóa kèm biên bản số lần vi phạm được gửi đến Giám thị. |
| `DF-07` | Vô hiệu hóa Mềm Bảo toàn Lịch sử | Quản trị viên thực hiện vô hiệu hóa tài khoản vi phạm. | Cập nhật `TrangThai = N'Đã khóa'` thay vì lệnh `DELETE`, giữ nguyên khóa ngoại và lịch sử bài nộp. | Tài khoản bị từ chối đăng nhập nhưng dữ liệu thống kê lớp không bị sai lệch. |

---

## 5. PHÂN CÔNG NHIỆM VỤ NHÓM VÀ SẢN PHẨM ĐÓNG GÓP (5 THÀNH VIÊN)

Toàn bộ 27 mô đun IPO và 7 luồng tự động hóa được phân định trách nhiệm cụ thể giữa 5 thành viên. Chi tiết quá trình phát triển xem tại tài liệu [docs/BAO_CAO_TIEN_DO_NHOM.md](docs/BAO_CAO_TIEN_DO_NHOM.md):

| STT | Thành Viên & GitHub | Vai Trò Chính | Cụm Mô Đun Phụ Trách | Nhánh Git | Trạng Thái | Sản Phẩm Mã Nguồn & Tài Liệu Gắn Liền |
|:---:|:---|:---|:---:|:---:|:---:|:---|
| **1** | **Trần Minh Nhật**<br>`TrAn-MInh-NhAt` | **Trưởng nhóm & Kiến trúc sư trưởng** | **9 mô đun:**<br>`QLTK.01–03`, `QTHT.01`, `XLBN.01–03`, `KQBN.01–02`<br>Luồng: `DF-01, DF-03, DF-04` | `main` | Đã Hoàn Thành | • Quản trị kiến trúc Fullstack 3 tầng<br>• Bộ điều khiển 1-Click [Start_STEM_Robotic.bat](Start_STEM_Robotic.bat) & [STEM_Robotic_App.ps1](STEM_Robotic_App.ps1)<br>• Bộ kiểm thử 37 bài test [server/tests/full_system_test.js](server/tests/full_system_test.js)<br>• Review và Merge toàn bộ Pull Request |
| **2** | **Trần Thế Quân**<br>`tranquan6211-dot` | **Thiết kế Hệ thống & CSDL** | **5 mô đun:**<br>`QTHT.02–03`, `QLDA.02`, `HTTB.01–02`<br>Luồng: `DF-02, DF-07` | `feature/quan-csdl-hethong` | Đã Merge (PR #2) | • [docs/DAC_TA_CSDL.md](docs/DAC_TA_CSDL.md) (418 dòng đặc tả 12 bảng BCNF)<br>• [server/seed_quan_thongbao.js](server/seed_quan_thongbao.js) (Kịch bản dữ liệu mẫu thông báo & phiếu sự cố) |
| **3** | **Phạm Thị Hà Vy**<br>`phamthihavy032-dev` | **Phân tích Nghiệp vụ & Học liệu** | **4 mô đun:**<br>`QTHL.01–02`, `TCPP.01–02`<br>Luồng: `DF-05` | `feature/vy-hoclieu-morong` | Đã Merge (PR #5) | • [docs/NGHIEP_VU_HOC_LIEU.md](docs/NGHIEP_VU_HOC_LIEU.md) (199 dòng đặc tả Phân hệ 2 & Sơ đồ Pinout linh kiện)<br>• [server/seed_vy_hoclieu_morong.js](server/seed_vy_hoclieu_morong.js) (Dữ liệu học liệu mở rộng chuẩn SQL Server) |
| **4** | **Nguyễn Thị Thanh Thảo**<br>`thanhthao-21` | **Phân tích Chức năng, Báo cáo & UI/UX** | **5 mô đun:**<br>`TKDL.01–02`, `XBC.01–02`, `TTCĐ.01`<br>Luồng: `DF-05` | `feature/thao-ui-baocao` | Đã Merge (PR #3) | • [docs/THIET_KE_UI_UX.md](docs/THIET_KE_UI_UX.md) (461 dòng đặc tả Design System & Bảng vinh danh)<br>• [public/css/responsive-mobile.css](public/css/responsive-mobile.css) (630 dòng CSS tối ưu đa thiết bị) |
| **5** | **Phạm Kỳ Hải**<br>`kyhaipham95-oss` | **Quản lý Chất lượng & QA Lead** | **4 mô đun:**<br>`QLDA.01`, `KTĐG.01–02`, `TTCĐ.02`<br>Luồng: `DF-06` | `feature/hai-qa-kiemthu` | Đang hoàn thiện | • Báo cáo kiểm thử biên phòng thi trực tuyến (`docs/BAO_CAO_KIEM_THU_QA.md`)<br>• Kịch bản kiểm thử biên giám sát chuyển tab (`server/tests/qa_edge_cases.js`) |

> *Ghi chú học thuật:* 100% liên kết tệp của Quân, Thảo, Vy trong bảng trên đều dẫn trực tiếp đến các tệp thực tế đang tồn tại trên nhánh `main`, đảm bảo không phát sinh lỗi liên kết.

---

## 6. CẤU TRÚC THƯ MỤC DỰ ÁN

Cấu trúc mã nguồn được phân bố khoa học theo mô hình phân tách chức năng:

```
LapTrinhWeb/
├── Start_STEM_Robotic.bat         # Tiện ích 1-Click khởi động toàn hệ thống
├── Tao_Icon_Desktop.bat           # Tiện ích tạo lối tắt truy cập ngoài màn hình Desktop
├── STEM_Robotic_App.ps1           # Script PowerShell điều khiển Watchdog, dọn dẹp Port 80/5000
├── database_schema.sql            # Kịch bản DDL tạo lập 12 bảng CSDL StemRoboticDB_V2
├── package.json                   # Cấu hình phụ thuộc Node.js và các lệnh thực thi (npm test, start)
├── .env.example                   # Tệp cấu hình biến môi trường mẫu
├── .env                           # Tệp biến môi trường thực tế (chứa chuỗi kết nối DB)
├── CHANGELOG.md                   # Nhật ký phát hành và nâng cấp phiên bản (v1.0.0 -> v2.3.0)
├── PRODUCT.md                     # Tài liệu đặc tả nguồn (Single Source of Truth: 6 phân hệ, 27 IPO)
├── README.md                      # Tài liệu tổng quan dự án và hướng dẫn vận hành
│
├── docs/                          # Kho tài liệu kỹ thuật chuyên sâu của đồ án
│   ├── BAO_CAO_TIEN_DO_NHOM.md    # Phân công chi tiết 5 thành viên & Nhật ký 5 chặng phát triển
│   ├── DAC_TA_CSDL.md             # Đặc tả 12 bảng CSDL BCNF (Trần Thế Quân)
│   ├── NGHIEP_VU_HOC_LIEU.md      # Đặc tả nghiệp vụ học liệu & Pinout linh kiện (Phạm Thị Hà Vy)
│   ├── THIET_KE_UI_UX.md          # Đặc tả hệ thống thiết kế Neo-Brutalist (Nguyễn Thị Thanh Thảo)
│   └── images/                    # Ảnh chụp minh chứng giao diện thực tế hệ thống
│       ├── 01-trang-chu.png
│       ├── 02-hoc-sinh-may-cham.png
│       ├── 03-giao-vien-canh-bao.png
│       └── 04-phong-thi-chong-gian-lan.png
│
├── public/                        # Tài nguyên tĩnh phía máy khách
│   ├── css/
│   │   ├── theme.css              # Hệ thống phong cách Neo-Brutalist & Bento Grid
│   │   ├── responsive-mobile.css  # Tối ưu giao diện Responsive Mobile, Tablet & Bản in PDF
│   │   ├── global.css             # Thiết lập kiểu chữ và biến màu toàn cục
│   │   └── login.css              # Giao diện khu vực xác thực đăng nhập
│   └── js/
│       └── login.js               # Kịch bản kiểm tra hợp lệ dữ liệu đăng nhập
│
├── server/                        # Tầng Ứng dụng Web Server (Node.js & Express)
│   ├── server.js                  # Điểm khởi chạy chính của Web Server (Cổng 80)
│   ├── config/
│   │   └── db.js                  # Module kết nối SQL Server Connection Pool
│   ├── middleware/
│   │   └── authMiddleware.js      # Bộ lọc xác thực và phân quyền RBAC 4 vai trò
│   ├── routes/                    # Điều hướng API và xử lý nghiệp vụ các phân hệ
│   │   ├── admin.js               # Phân hệ 1: Quản trị tài khoản, Khóa mềm DF-07
│   │   ├── auth.js                # Phân hệ 1: Đăng ký, Đăng nhập, OTP, Hồ sơ
│   │   ├── materials.js           # Phân hệ 2: Học liệu, Tra cứu, Tắt cờ DF-05
│   │   ├── teacher.js             # Phân hệ 3 & 5: Giao bài, Quản lý lớp 10/1
│   │   ├── exam.js                # Phân hệ 3: Phòng thi online, Chống chuyển tab DF-06
│   │   ├── submissions.js         # Phân hệ 4: Nộp bài, Máy chấm, Duyệt video DF-01
│   │   ├── judgeProxy.js          # Phân hệ 4: Proxy chuyển tiếp mã nguồn sang Cổng 5000
│   │   ├── reports.js             # Phân hệ 5: Xuất báo cáo CSV BOM UTF-8 và PDF
│   │   ├── community.js           # Phân hệ 6: Diễn đàn, Wall of Fame, Trending DF-03
│   │   └── support.js             # Phân hệ 6: Phiếu sự cố kỹ thuật, Thông báo khẩn
│   ├── views/                     # Giao diện Server-Side Rendering (EJS Templates)
│   │   ├── index.ejs              # Trang chủ hệ thống & Showcase Bento
│   │   ├── login.ejs              # Cổng đăng nhập, Đăng ký & Quên mật khẩu OTP
│   │   ├── exam.ejs               # Phòng thi trực tuyến giám sát gian lận
│   │   ├── community.ejs          # Diễn đàn kỹ thuật & Bảng vàng vinh danh
│   │   ├── print_report.ejs       # Biểu mẫu in ấn bảng điểm chuẩn sư phạm
│   │   ├── profile.ejs            # Trang thông tin tài khoản cá nhân
│   │   └── dashboard/
│   │       ├── student.ejs        # Không gian học tập, nạp code mẫu & máy chấm
│   │       ├── teacher.ejs        # Bàn làm việc giáo viên duyệt video & cảnh báo DF-05
│   │       └── admin.ejs          # Bảng điều khiển quản trị viên hệ thống
│   ├── seed_full_curriculum.js    # Script nạp lộ trình và bài tập mẫu
│   ├── seed_quan_thongbao.js      # Script nạp dữ liệu thông báo (Trần Thế Quân)
│   ├── seed_vy_hoclieu_morong.js  # Script nạp học liệu mở rộng (Phạm Thị Hà Vy)
│   └── tests/
│       └── full_system_test.js    # Bộ kiểm thử tích hợp 37 bài test tự động (npm test)
│
└── judge_engine/                  # Tầng Máy Chấm Cô Lập (Python FastAPI — Cổng 5000)
    ├── main.py                    # Điểm khởi chạy ứng dụng FastAPI
    ├── requirements.txt           # Danh mục thư viện Python phụ thuộc
    ├── routers/
    │   └── judge.py               # API tiếp nhận yêu cầu chấm và trả telemetry
    └── services/
        ├── sandbox.py             # Bộ thực thi cách ly tiến trình (Subprocess Sandbox)
        ├── runner.py              # So khớp kết quả đầu ra với bộ TestCase
        ├── error_analyzer.py      # Bộ phân tích cú pháp AST bắt lỗi sư phạm (DF-04)
        └── arduino_mock.h         # Thư viện Mock phần cứng vi điều khiển Arduino C++
```

---

## 7. HƯỚNG DẪN CÀI ĐẶT VÀ VẬN HÀNH HỆ THỐNG (TỪ A ĐẾN Z)

### 7.1. Yêu Cầu Môi Trường Cài Đặt
* **Hệ điều hành:** Microsoft Windows 10 / 11 hoặc Windows Server.
* **Môi trường thực thi Node.js:** Phiên bản `v20.x` hoặc `v22.x` LTS.
* **Môi trường thực thi Python:** Phiên bản `3.10+` hoặc `3.11+` (đã thêm vào biến môi trường PATH).
* **Hệ quản trị CSDL:** Microsoft SQL Server (bản Developer hoặc SQL Express 2019/2022) và công cụ SQL Server Management Studio (SSMS).
* **Trình biên dịch mã nguồn (Dành cho máy chấm C++):** `g++` (MinGW-w64) hoặc môi trường thực thi dòng lệnh tiêu chuẩn.

---

### 7.2. Các Bước Cài Đặt Chi Tiết

#### Bước 1: Sao chép mã nguồn từ GitHub
Mở cửa sổ dòng lệnh (Terminal hoặc PowerShell) và thực hiện clone kho lưu trữ:
```bash
git clone https://github.com/TrAn-MInh-NhAt/StemRoboticEdu.git
cd StemRoboticEdu
```

#### Bước 2: Thiết lập Cơ sở dữ liệu SQL Server (`StemRoboticDB_V2`)
1. Khởi động công cụ **SQL Server Management Studio (SSMS)** và kết nối vào máy chủ SQL cục bộ.
2. Mở tệp kịch bản [database_schema.sql](database_schema.sql) trong thư mục gốc dự án.
3. Nhấn **Execute (F5)** để tự động tạo cơ sở dữ liệu `StemRoboticDB_V2` cùng toàn bộ cấu trúc 12 bảng chuẩn BCNF và chỉ mục.

#### Bước 3: Cấu hình tệp biến môi trường `.env`
Sao chép tệp mẫu `.env.example` thành `.env` tại thư mục gốc dự án:
```bash
copy .env.example .env
```
Mở tệp `.env` và điều chỉnh thông số kết nối CSDL phù hợp với môi trường máy của bạn:

* **Trường hợp A: Sử dụng chế độ xác thực Windows (Windows Authentication — Khuyên dùng, không cần mật khẩu sa):**
  ```ini
  PORT=80
  DB_SERVER=ADMIN-PC\SQLEXPRESS
  DB_NAME=StemRoboticDB_V2
  DB_USER=
  DB_PASSWORD=
  DB_PORT=1433
  DB_ENCRYPT=false
  DB_TRUST_CERT=true
  JUDGE_URL=http://localhost:5000
  SESSION_SECRET=stemrobotic_super_secret_key_2026
  ```

* **Trường hợp B: Sử dụng tài khoản SQL Server Authentication (`sa`):**
  ```ini
  PORT=80
  DB_SERVER=localhost
  DB_NAME=StemRoboticDB_V2
  DB_USER=sa
  DB_PASSWORD=MatKhauCuaBan123
  DB_PORT=1433
  DB_ENCRYPT=false
  DB_TRUST_CERT=true
  JUDGE_URL=http://localhost:5000
  SESSION_SECRET=stemrobotic_super_secret_key_2026
  ```

#### Bước 4: Cài đặt các gói thư viện phụ thuộc
* **Cài đặt thư viện Node.js:**
  ```bash
  npm install
  ```
* **Cài đặt thư viện Python cho Máy chấm:**
  ```bash
  cd judge_engine
  pip install -r requirements.txt
  cd ..
  ```

#### Bước 5: Nạp dữ liệu giáo trình và tài khoản mẫu (Seed Database)
Chạy kịch bản nạp dữ liệu hoàn chỉnh để tạo tài khoản, lộ trình học và bài tập mẫu:
```bash
npm run seed
```
*(Tùy chọn: Để nạp thêm thông báo của Quân và học liệu mở rộng của Vy, chạy `node server/seed_quan_thongbao.js` và `node server/seed_vy_hoclieu_morong.js`).*

---

### 7.3. Khởi Chạy Ứng Dụng

#### Cách 1: Khởi chạy Nhanh 1-Click (Khuyên dùng cho Giảng viên & Hội đồng chấm thi)
Nhấp đúp chuột trực tiếp vào tệp:
```text
Start_STEM_Robotic.bat
```
* **Tiện ích tự động hóa:**
  1. Tự động kiểm tra và giải phóng các tiến trình đang chiếm cổng `80` và `5000`.
  2. Khởi động đồng thời cả 2 dịch vụ ngầm: **Judge Engine (FastAPI)** và **Web Application (Node.js)**.
  3. Tự động cấp phát đường dẫn Internet an toàn qua Cloudflare Tunnel (`https://...trycloudflare.com`) và sao chép sẵn vào Clipboard máy tính.
  4. Cơ chế Watchdog giám sát liên tục: Khi người dùng bấm phím **[Enter]** hoặc đóng cửa sổ điều khiển, toàn bộ cổng mạng sẽ được dọn sạch sẽ ngay lập tức.

#### Cách 2: Khởi chạy Thủ công Từng Dịch vụ (Dành cho Lập trình viên)
* **Cửa sổ Terminal 1 — Khởi động Máy chấm FastAPI (Cổng 5000):**
  ```bash
  cd judge_engine
  python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
  ```
* **Cửa sổ Terminal 2 — Khởi động Web Server Node.js (Cổng 80):**
  ```bash
  npm start
  ```
Mở trình duyệt web và truy cập địa chỉ cục bộ: `http://localhost/`.

---

### 7.4. Kiểm Thử Hệ Thống Toàn Diện (End-to-End Test Suite)
Hệ thống tích hợp bộ kịch bản kiểm thử tự động 37 kịch bản bao quát 27 mô đun IPO và 7 luồng tự động:
```bash
npm test
```
*Kết quả kiểm thử đạt chuẩn:* **37/37 Tests Passed (100% PASS)** xác nhận tính sẵn sàng vận hành của toàn bộ hệ thống.

---

## 8. TÀI KHOẢN KIỂM THỬ HỆ THỐNG VÀ DANH MỤC TÀI LIỆU CHUYÊN MÔN

### 8.1. Danh Sách Tài Khoản Kiểm Thử Mặc Định

Để thuận tiện cho giảng viên thẩm định các phân hệ chức năng tương ứng với 4 vai trò RBAC, hệ thống đã thiết lập sẵn các tài khoản với mật khẩu chung là **`1`** (hoặc `123456`):

| Vai Trò Phân Quyền | Họ Và Tên | Email Đăng Nhập | Mật Khẩu | URL Truy Cập Trực Tiếp | Phạm Vi Chức Năng Thử Nghiệm |
|:---|:---|:---|:---:|:---:|:---|
| **Quản Trị Viên (Admin)** | Quản Trị Viên Hệ Thống | `admin@stemrobotic.edu.vn` | `1` | `/admin` | Quản lý người dùng, phân quyền vai trò, khóa mềm tài khoản (`DF-07`), phát thông báo khẩn cấp (`HTTB.02`). |
| **Giáo Viên (Teacher)** | TS. Đặng Hùng Vĩ | `gv.hungvi@stemrobotic.edu.vn` | `1` | `/teacher` | Quản lý lớp 10/1, giao bài & TestCase (`QLDA.01`), thẩm định video học sinh (`DF-01`), nhận cảnh báo học liệu lỗi >30% (`DF-05`). |
| **Học Sinh (Quán quân)** | Trần Minh Nhật | `hs.minhnhat@stemrobotic.edu.vn` | `1` | `/student` | Xem lộ trình học, nạp code mẫu, nộp bài thực hành, tương tác máy chấm tự động, tra cứu mẹo sửa lỗi (`TCPP.02`). |
| **Học Sinh (Thí sinh)** | Lê Hoàng Nam | `hs.hoangnam@stemrobotic.edu.vn` | `1` | `/exam` | Tham gia phòng thi trực tuyến có đồng hồ đếm ngược, thử nghiệm cơ chế bắt vi phạm chuyển tab quá 3 lần (`DF-06`). |

---

### 8.2. Danh Mục Tài Liệu Kỹ Thuật Đính Kèm

Giảng viên và người đánh giá có thể tra cứu chi tiết từng phần nghiên cứu chuyên sâu thông qua các tài liệu học thuật được lưu trữ trong thư mục `docs/`:

1. [docs/BAO_CAO_TIEN_DO_NHOM.md](docs/BAO_CAO_TIEN_DO_NHOM.md): Báo cáo phân công nhiệm vụ chi tiết 5 thành viên phủ kín 27 mô đun IPO, bảng ma trận trách nhiệm và nhật ký 5 chặng phát triển từ 01/11 đến 15/11/2026.
2. [docs/DAC_TA_CSDL.md](docs/DAC_TA_CSDL.md): Bản đặc tả kỹ thuật chi tiết 12 bảng CSDL chuẩn BCNF của CSDL `StemRoboticDB_V2`, giải thích toàn bộ lược đồ quan hệ và logic ràng buộc toàn vẹn dữ liệu (Tác giả: Trần Thế Quân).
3. [docs/NGHIEP_VU_HOC_LIEU.md](docs/NGHIEP_VU_HOC_LIEU.md): Tài liệu đặc tả quy trình nghiệp vụ Phân hệ 2, sơ đồ chân Pinout linh kiện vi điều khiển thực tế và cơ chế tự động cảnh báo học liệu `DF-05` (Tác giả: Phạm Thị Hà Vy).
4. [docs/THIET_KE_UI_UX.md](docs/THIET_KE_UI_UX.md): Đặc tả hệ thống thiết kế Creative Studio & Neo-Brutalist, cấu trúc Bento Grid, quy chuẩn chống AI Slop (100% SVG, không dùng emoji) và nguyên lý tối ưu Responsive đa thiết bị (Tác giả: Nguyễn Thị Thanh Thảo).
5. [PRODUCT.md](PRODUCT.md): Tài liệu đặc tả gốc của dự án (Single Source of Truth), quy định 6 phân hệ, 27 mô đun IPO và 7 luồng tự động hóa.
6. [CHANGELOG.md](CHANGELOG.md): Biên niên sử toàn bộ quá trình phát triển, nâng cấp và hoàn thiện tính năng qua các mốc phát hành từ `v1.0.0` đến `v2.3.0`.

---

## 9. GIẤY PHÉP VÀ BẢN QUYỀN HỌC THUẬT

Đồ án được nghiên cứu và phát triển bởi Nhóm A+ sinh viên Khoa Toán - Tin, Trường Đại học Sư phạm — Đại học Đà Nẵng dưới sự hướng dẫn khoa học của **TS. Đặng Hùng Vĩ**. Toàn bộ mã nguồn và tài liệu kỹ thuật được cung cấp nhằm phục vụ công tác giảng dạy, học tập và nghiên cứu ứng dụng công nghệ giáo dục STEM Robotics.

Mọi quyền được bảo lưu © 2026 Khoa Toán - Tin, Trường Đại học Sư phạm — Đại học Đà Nẵng.
