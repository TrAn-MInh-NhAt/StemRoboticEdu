# 📋 BÁO CÁO KIỂM THỬ CHẤT LƯỢNG HỆ THỐNG (QA TEST REPORT)
## DỰ ÁN: HỆ THỐNG HỌC TẬP VÀ QUẢN LÝ ĐÀO TẠO STEM ROBOTIC CẤP TRUNG HỌC
### CƠ SỞ DỮ LIỆU: `StemRoboticDB_V2` (12 BẢNG CHUẨN BCNF)

> **ĐƠN VỊ:** ĐẠI HỌC ĐÀ NẴNG — TRƯỜNG ĐẠI HỌC SƯ PHẠM — KHOA TOÁN - TIN  
> **HỌC PHẦN:** PHÁT TRIỂN ỨNG DỤNG WEB  
> **GIẢNG VIÊN HƯỚNG DẪN:** TS. Đặng Hùng Vĩ  
> **NGƯỜI THỰC HIỆN BÁO CÁO:** Phạm Kỳ Hải (GitHub: `kyhaipham95-oss`) — Vai trò: **Quản lý Chất lượng & QA Lead**  
> **NHÁNH GIT:** `feature/hai-qa-kiemthu`  
> **PHIÊN BẢN HỆ THỐNG:** `v2.2.0`  
> **MÔI TRƯỜNG THỰC THI:** Node.js v24.14.1 | SQL Server 2022 Developer (`LAPTOP-ESAL4VQM\KYHAI`) | Windows Authentication (Trusted Connection)  

---

## MỤC LỤC
1. [Tổng Quan & Phạm Vi Kiểm Thử](#1-tổng-quan--phạm-vi-kiểm-thử)
2. [Môi Trường Kiểm Thử & Cấu Hình CSDL Cục Bộ](#2-môi-trường-kiểm-thử--cấu-hình-csdl-cục-bộ)
3. [Ma Trận Kiểm Thử 27 Mô Đun IPO (6 Phân Hệ)](#3-ma-trận-kiểm-thử-27-mô-đun-ipo-6-phân-hệ)
   - 3.1. Phân hệ 1: Quản lý Hệ thống & Người dùng (QLTK.01 – QTHT.03)
   - 3.2. Phân hệ 2: Quản lý Học liệu & Khóa học (QTHL.01 – TCPP.02)
   - 3.3. Phân hệ 3: Quản lý Dự án & Tiến độ (QLDA.01 – KTĐG.02)
   - 3.4. Phân hệ 4: Xử lý Bài nộp & Đánh giá (XLBN.01 – KQBN.02)
   - 3.5. Phân hệ 5: Báo cáo & Thống kê (TKDL.01 – XBC.02)
   - 3.6. Phân hệ 6: Tương tác Cộng đồng & Bảo trì (TTCĐ.01 – HTTB.02)
4. [Kiểm Thử 7 Luồng Tự Động Hóa Dữ Liệu (DF-01 đến DF-07)](#4-kiểm-thử-7-luồng-tự-động-hóa-dữ-liệu-df-01-đến-df-07)
5. [Kiểm Thử Phân Quyền RBAC 4 Vai Trò (Admin, Giáo viên, Học sinh, Khách)](#5-kiểm-thử-phân-quyền-rbac-4-vai-trò)
6. [Kiểm Thử Chuyên Sâu Tình Huống Biên (Edge Cases)](#6-kiểm-thử-chuyên-sâu-tình-huống-biên-edge-cases)
   - 6.1. Giám sát & Khóa bài thi phòng thi trực tuyến khi chuyển tab > 3 lần (DF-06)
   - 6.2. Cơ chế ngắt thời gian Timeout (TLE cutoff) với vòng lặp vô hạn `while(true)`
   - 6.3. Lọc từ khóa vi phạm & Gắn nhãn "Đã giải quyết" diễn đàn (TTCĐ.02)
7. [Kiểm Thử Phi Chức Năng (NFR: Hiệu năng, Bảo mật, Giao diện Neo-Brutalist)](#7-kiểm-thử-phi-chức-năng-nfr)
8. [Kết Luận & Khuyến Nghị Nghiệm Thu Của QA Lead](#8-kết-luận--khuyến-nghị-nghiệm-thu-của-qa-lead)

---

## 1. TỔNG QUAN & PHẠM VI KIỂM THỬ

### 1.1. Mục tiêu kiểm thử
Báo cáo kiểm thử chất lượng này được thực hiện bởi **Phạm Kỳ Hải (QA Lead)** nhằm mục đích:
1. Thẩm định tính toàn vẹn và mức độ hoàn thiện của **27 mô đun IPO** (thuộc 6 phân hệ lớn) theo đúng tài liệu đặc tả `PRODUCT.md`.
2. Kiểm tra tính chính xác của **7 luồng dữ liệu tự động hóa** (DF-01 đến DF-07), bảo đảm các trigger nghiệp vụ vận hành khép kín giữa Web Server và SQL Server.
3. Rà soát ma trận bảo mật **phân quyền RBAC 4 vai trò** (Admin, Giáo viên, Học sinh, Khách), chặn triệt để các hành vi leo quyền trái phép (HTTP 401 / HTTP 403).
4. Thực thi kịch bản kiểm thử tự động các trường hợp biên (`server/tests/qa_edge_cases.js`): chống gian lận chuyển tab > 3 lần trong phòng thi (DF-06), ngắt vòng lặp vô hạn `while(true)`, và lọc từ khóa tiêu chuẩn cộng đồng (TTCĐ.02).

### 1.2. Thống kê tổng hợp số lượng kiểm thử
- **Tổng số Test Cases (TC) thực hiện:** 65 ca kiểm thử.
- **Số ca Pass (Đạt):** 65 / 65 (Tỷ lệ: **100.0%**).
- **Số ca Fail (Lỗi):** 0 ca.
- **Trạng thái hệ thống:** Sẵn sàng nghiệm thu (Ready for Production Release).

---

## 2. MÔI TRƯỜNG KIỂM THỬ & CẤU HÌNH CSDL CỤC BỘ

### 2.1. Cấu hình phần cứng & môi trường phát triển
- **Thiết bị kiểm thử:** `LAPTOP-ESAL4VQM` (Intel Core i5 / 16GB RAM / SSD NVMe).
- **Hệ điều hành:** Microsoft Windows 10/11 Home Single Language (Build 26300).
- **Hệ quản trị CSDL:** Microsoft SQL Server 2022 (RTM) - 16.0.1000.6 (X64) Developer Edition.
- **Tên Server / Instance:** `LAPTOP-ESAL4VQM\KYHAI`.
- **Cổng TCP kết nối:** Dynamic Port `49924` (kèm hỗ trợ TCP `1433`).
- **Cơ chế xác thực CSDL:** Windows Authentication (Trusted Connection via `msnodesqlv8` & ODBC Driver 17 for SQL Server).
- **Tên CSDL:** `StemRoboticDB_V2` (12 bảng quan hệ chuẩn BCNF).
- **Web Server:** Node.js v24.14.1, Express v4.18.2, EJS v3.1.9 (Cổng 80).
- **Sandbox Judge Engine:** Python 3.12.1, FastAPI, Uvicorn (Cổng 5000).

### 2.2. Kiểm tra cấu trúc 12 bảng CSDL chuẩn BCNF
| STT | Tên Bảng (Entity) | Khóa Chính (PK) | Khóa Ngoại (FK) | Mục Đích Lưu Trữ |
|:---:|:---|:---|:---|:---|
| 1 | `NguoiDung` (ENT-01) | `MaNguoiDung` | — | Tài khoản 4 vai trò, ảnh thẻ HS, lớp 10/1, Soft Delete |
| 2 | `LopHoc` (ENT-01b) | `MaLop` | `MaGiaoVienCN` → `NguoiDung` | Lớp chuyên Robotics (10/1, GV chủ nhiệm) |
| 3 | `KhoaHocLoTrinh` (ENT-02) | `MaLoTrinh` | `MaNguoiTao` → `NguoiDung` | 3 lộ trình tuần tự: Cơ khí, Mạch điện, Lập trình AI |
| 4 | `HocLieu` (ENT-03) | `MaHocLieu` | `MaLoTrinh` → `KhoaHocLoTrinh` | Bài giảng, video, sơ đồ 3D, cờ cảnh báo `CoCanCapNhat` (DF-05) |
| 5 | `DuAnBaiTap` (ENT-04) | `MaDuAn` | `MaLoTrinh`, `MaDuAnTienQuyet` | 5 dự án thực hành, ràng buộc mở khóa tuần tự (DF-02) |
| 6 | `TestCase` (ENT-05) | `MaTestCase` | `MaDuAn` → `DuAnBaiTap` (Cascade) | Dữ liệu đầu vào, đầu ra chuẩn, trọng số điểm, gợi ý sửa lỗi |
| 7 | `MayCham` (ENT-07) | `MaMayCham` | — | Cấu hình máy chấm Python FastAPI (`http://localhost:5000`) |
| 8 | `BaiThi` (KTĐG.02) | `MaBaiThi` | `MaNguoiDung` → `NguoiDung` | Đề thi trực tuyến, thời lượng, giới hạn chuyển tab (DF-06) |
| 9 | `BaiNop` (ENT-06) | `MaBaiNop` | `MaDuAn`, `MaBaiThi`, `MaNguoiDung` | File code `.py/.ino`, link video YouTube, bộ đếm `SoLanChuyenTabHS` |
| 10 | `KetQuaDiem` (ENT-08) | `MaKetQua` | `MaBaiNop` → `BaiNop` (Unique) | Điểm code, điểm video, tổng điểm, log lỗi máy chấm, nhận xét |
| 11 | `NoiDungCongDong` (ENT-09) | `MaNoiDung` | `MaDuAn`, `MaBaiNop`, `MaNguoiDung` | Bài thảo luận, kinh nghiệm gỡ lỗi, Wall of Fame, trạng thái giải quyết |
| 12 | `BinhLuanThaoLuan` | `MaBinhLuan` | `MaThaoLuan` → `NoiDungCongDong` | Bình luận phân cấp giải đáp kỹ thuật |
| 13 | `BaoCaoThongKe` (ENT-12) | `MaBaoCao` | `MaNguoiDung` → `NguoiDung` | Báo cáo tiến độ lớp 10/1, bảng điểm Excel, Top Trending |
| 14 | `HoTroThongBao` (ENT-11) | `MaHoTro` | `MaNguoiDung` → `NguoiDung` | Thông báo bảo trì, hướng dẫn nộp bài, ticket báo sự cố |

---

## 3. MA TRẬN KIỂM THỬ 27 MÔ ĐUN IPO (6 PHÂN HỆ)

### 3.1. Phân hệ 1: Quản lý Hệ thống & Người dùng
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH1-01 | **QLTK.01** | POST `/api/auth/register` với Email mới, Họ tên, Mật khẩu >= 6 ký tự | Tạo tài khoản Học sinh mới, mã HTTP 201, trạng thái 'Đang hoạt động' | Tạo thành công bản ghi trong bảng `NguoiDung`, HTTP 200/201 | **PASS** |
| TC-PH1-02 | **QLTK.01** | POST `/api/auth/register` với Email đã tồn tại trong CSDL | Báo lỗi trùng email, HTTP 400, không tạo thêm bản ghi | Báo "Email đã tồn tại trên hệ thống", HTTP 400 | **PASS** |
| TC-PH1-03 | **QLTK.02** | POST `/api/auth/login` với email và mật khẩu đúng | Khởi tạo Session người dùng, trả về vai trò và redirect về Dashboard tương ứng | Đăng nhập thành công, lưu session `req.session.user`, HTTP 200 | **PASS** |
| TC-PH1-04 | **QLTK.02** | POST `/api/auth/login` với sai mật khẩu | Báo lỗi "Sai mật khẩu hoặc email", HTTP 401 | Phản hồi thông báo lỗi chính xác, HTTP 401 | **PASS** |
| TC-PH1-05 | **QLTK.03** | POST `/api/auth/forgot-password` với email đăng ký | Tạo mã xác nhận khôi phục mật khẩu, HTTP 200 | Trả mã OTP mô phỏng và hướng dẫn đặt lại mật khẩu | **PASS** |
| TC-PH1-06 | **QTHT.01** | POST `/api/admin/users/:id/role` với vai trò mới từ Admin | Cập nhật cột `VaiTro` trong `NguoiDung`, chỉ cho phép Admin thực thi | Cập nhật vai trò chuẩn xác, người dùng không phải Admin bị chặn 403 | **PASS** |
| TC-PH1-07 | **QTHT.02** | POST `/api/profile` cập nhật Số điện thoại, Ảnh đại diện, Trường học | Dữ liệu hồ sơ mới được cập nhật trong `NguoiDung`, hiển thị tức thì trên giao diện | Cập nhật thành công vào SQL Server, HTTP 200 | **PASS** |
| TC-PH1-08 | **QTHT.03** | POST `/api/admin/users/:id/lock` thực hiện khóa tài khoản (DF-07) | Chuyển `TrangThai` thành 'Đã khóa' (Soft Delete), vẫn giữ nguyên bài nộp trong `BaiNop` | Tài khoản bị khóa, điểm số cũ vẫn được bảo lưu trọn vẹn | **PASS** |

### 3.2. Phân hệ 2: Quản lý Học liệu & Khóa học
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH2-01 | **QTHL.01** | POST `/api/materials` tạo học liệu mới: Pinout Arduino, Video, Sơ đồ 3D | Lưu vào bảng `HocLieu` với `TrangThai` = 'Đang hoạt động', HTTP 201 | Thêm mới học liệu thành công, liên kết đúng `MaLoTrinh` | **PASS** |
| TC-PH2-02 | **QTHL.02** | PUT `/api/materials/:id` cập nhật nội dung bài giảng và lệnh ẩn | Cập nhật nội dung trong `HocLieu`, chuyển trạng thái 'Đã ẩn' | Học liệu cập nhật chuẩn xác, không hiển thị phía học sinh | **PASS** |
| TC-PH2-03 | **TCPP.01** | GET `/api/lotrinh` truy vấn cây thư mục 3 lộ trình học | Trả về 3 lộ trình (Cơ khí, Mạch điện, Lập trình AI) kèm danh sách bài giảng | Trả đủ 3 lộ trình tuần tự và các học liệu liên kết | **PASS** |
| TC-PH2-04 | **TCPP.02** | GET `/api/materials/search?q=HC-SR04` tìm kiếm linh kiện | Trả về danh sách tài liệu đấu nối và code mẫu cảm biến siêu âm | Trả về bài học cảm biến HC-SR04 và mẹo chống nhiễu | **PASS** |

### 3.3. Phân hệ 3: Quản lý Dự án & Tiến độ (Phạm Kỳ Hải phụ trách)
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH3-01 | **QLDA.01** | POST `/api/teacher/projects` tạo bài tập Blink SOS kèm bộ 3 TestCases | Lưu vào `DuAnBaiTap` và `TestCase`, mở cổng nộp bài cho học sinh lớp 10/1 | Dự án tạo thành công (`MaDuAn`), lưu đủ 3 TestCases, HTTP 200 | **PASS** |
| TC-PH3-02 | **QLDA.01** | POST `/api/teacher/projects` bỏ trống tiêu đề hoặc yêu cầu | Trả về lỗi validate dữ liệu đầu vào, HTTP 400 | Phản hồi "Vui lòng nhập đầy đủ Tên dự án và Yêu cầu dự án", HTTP 400 | **PASS** |
| TC-PH3-03 | **QLDA.02** | Học sinh hoàn thành Dự án 1 đạt điểm Pass (DF-02) | Hệ thống tự động tháo cờ khóa, mở Dự án 2 (HC-SR04) cho học sinh | Dự án 2 chuyển từ trạng thái khóa sang mở khóa tự động | **PASS** |
| TC-PH3-04 | **KTĐG.01** | GET `/api/exam/active` kiểm tra phòng thi trực tuyến đang mở | Trả về đề thi `BaiThi` kèm thời lượng 45 phút và giới hạn chuyển tab = 3 | Hiển thị đầy đủ thông tin phòng thi và đồng hồ đếm ngược | **PASS** |
| TC-PH3-05 | **KTĐG.02** | POST `/api/exam/tab-switch` gọi sự kiện chuyển tab lần 1 – 3 | Ghi nhận vi phạm, tăng `SoLanChuyenTabHS`, trả về cảnh báo vàng/đỏ | Đếm đúng số lần chuyển tab, chưa khóa ở lần 1-3 | **PASS** |
| TC-PH3-06 | **KTĐG.02** | POST `/api/exam/tab-switch` lần 4 (vượt quá 3 lần cho phép) | Kích hoạt DF-06: Tự động khóa bài thi, cập nhật `TrangThai` = 'Đã khóa (DF-06)' | Khóa phiên ngay lập tức, chặn nộp lại với mã HTTP 403 | **PASS** |
| TC-PH3-07 | **KTĐG.02** | POST `/api/exam/submit` nộp bài kiểm tra kèm đáp án trắc nghiệm + code | Chấm trắc nghiệm (max 4.0đ) + Chấm code (max 6.0đ), lưu vào `KetQuaDiem` | Tính điểm tổng kết chính xác, xuất giải thích đáp án chi tiết | **PASS** |

### 3.4. Phân hệ 4: Xử lý Bài nộp & Đánh giá
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH4-01 | **XLBN.01** | POST `/api/submit-project` nộp code `.py` + link YouTube video | Ràng buộc đủ 2 điều kiện, lưu `BaiNop` với trạng thái 'Đang chấm tự động' | Bài nộp ghi nhận thành công vào CSDL, lưu đường dẫn file nộp | **PASS** |
| TC-PH4-02 | **XLBN.01** | POST `/api/submit-project` thiếu link video YouTube khi nộp dự án | Bị từ chối với HTTP 400: Yêu cầu bắt buộc phải có video vận hành | Báo lỗi thiếu video minh chứng phần cứng, HTTP 400 | **PASS** |
| TC-PH4-03 | **XLBN.02** | Gửi mã nguồn sang FastAPI Judge Engine (Port 5000) chạy TestCases | Đối chiếu Output thực tế và Output mong đợi, tính điểm tổng kết | Máy chấm thực thi độc lập, đo thời gian chạy < 3.0 giây | **PASS** |
| TC-PH4-04 | **XLBN.03** | Thuật toán chạy đúng 100% TestCase (DF-01) | Tự động chuyển trạng thái bài nộp sang 'Chờ duyệt Video' để GV chấm | Kích hoạt đúng luồng DF-01, không yêu cầu can thiệp thủ công | **PASS** |
| TC-PH4-05 | **XLBN.03** | Mã nguồn bị lỗi cú pháp / sai logic TestCases | Bắt mã lỗi, gán `TrangThai` = 'Chưa đạt — Cần sửa code', đẩy log lỗi về CSDL | Ghi nhận mã lỗi vào `LogLoi` của `KetQuaDiem` | **PASS** |
| TC-PH4-06 | **KQBN.01** | POST `/api/submissions/:id/grade-video` Giáo viên thẩm định video phần cứng | Giáo viên đánh giá Đạt/Không đạt video, nhập nhận xét sư phạm | Cập nhật `KetQuaVideo` trong `KetQuaDiem`, lưu minh chứng | **PASS** |
| TC-PH4-07 | **KQBN.02** | POST `/api/submissions/:id/finalize` Chốt điểm tổng hợp | Tính điểm tổng: `DiemCode * 0.5 + DiemVideo * 0.5`, lưu `NgayChotDiem` | Chốt điểm thành công, học sinh xem được điểm trên Dashboard | **PASS** |

### 3.5. Phân hệ 5: Báo cáo, Thống kê
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH5-01 | **TKDL.01** | GET `/api/reports/class-progress` thống kê lớp 10/1 | Trả về tổng số bài nộp, tỷ lệ đạt, số dự án hoàn thành của từng học sinh | Trích xuất dữ liệu tổng hợp chính xác theo lớp 10/1 | **PASS** |
| TC-PH5-02 | **TKDL.02** | GET `/api/analytics/check-df05` quét các bài tập có tỷ lệ lỗi > 30% | Phát hiện bài tập vượt ngưỡng, gắn cờ `CoCanCapNhat` = 1 trong `HocLieu` (DF-05) | Tự động gắn cờ cảnh báo học liệu cần bổ sung hướng dẫn | **PASS** |
| TC-PH5-03 | **XBC.01** | GET `/api/reports/top-trending` thống kê chủ đề được yêu thích (DF-03) | Xếp hạng chủ đề có tần suất nộp bài và lượt thích cao nhất | Trả về bảng xếp hạng Top Trending kèm huy hiệu vinh danh | **PASS** |
| TC-PH5-04 | **XBC.02** | GET `/api/reports/export-excel` xuất bảng điểm lớp 10/1 | Xuất dữ liệu bảng điểm học sinh sang tệp CSV/Excel đầy đủ cột | Tạo luồng tải tệp định dạng CSV/Excel chuẩn UTF-8 | **PASS** |

### 3.6. Phân hệ 6: Tương tác Cộng đồng & Bảo trì (Phạm Kỳ Hải phụ trách TTCĐ.02)
| Mã TC | Mã MĐ | Kịch Bản Đầu Vào (Input) | Kết Quả Mong Đợi (Expected) | Kết Quả Thực Tế (Actual) | Trạng Thái |
|:---|:---|:---|:---|:---|:---:|
| TC-PH6-01 | **TTCĐ.01** | POST `/api/community/posts` đăng bài hỏi đáp kỹ thuật hợp lệ | Lưu bài viết vào `NoiDungCongDong`, hiển thị lên đầu diễn đàn | Đăng bài thành công, cấp mã `MaNoiDung`, HTTP 200 | **PASS** |
| TC-PH6-02 | **TTCĐ.01** | POST `/api/community/posts/:id/like` học sinh thích bài viết | Tăng `LuotThich` và `SoLuotBinhChon` lên 1, phản hồi tức thì | Tăng số lượt thích chính xác, tự động kích hoạt DF-03 khi đạt ngưỡng | **PASS** |
| TC-PH6-03 | **TTCĐ.02** | GET `/api/community/wall-of-fame` xem bảng vinh danh dự án xuất sắc | Hiển thị top học sinh có điểm cao nhất, kèm video YouTube nhúng trực tiếp | Trả về danh sách top 1, 2, 3 lớp 10/1 kèm huy hiệu lục giác | **PASS** |
| TC-PH6-04 | **TTCĐ.02** | POST `/api/community/posts/:id/resolve` tác giả gắn nhãn "Đã giải quyết" | Cập nhật `TrangThai` = 'Đã giải quyết', hiển thị badge xanh lá | Gắn nhãn thành công, người lạ cố gắn nhãn bị chặn 403 | **PASS** |
| TC-PH6-05 | **TTCĐ.02** | POST `/api/community/posts` chứa từ khóa cấm (cheat, hack điểm, thô tục) | Chặn bài viết, trả mã HTTP 400 và thông báo vi phạm tiêu chuẩn cộng đồng | Chặn thành công, không lưu nội dung bẩn vào CSDL | **PASS** |
| TC-PH6-06 | **HTTB.01** | POST `/api/support/tickets` gửi báo cáo sự cố kỹ thuật mạch điện | Lưu vào `HoTroThongBao` với `LoaiThongTin` = 'Sự cố', trạng thái 'Chờ xử lý' | Ghi nhận ticket lỗi đẩy về danh sách quản lý của Admin | **PASS** |
| TC-PH6-07 | **HTTB.02** | GET `/api/support/announcements` xem thông báo lịch thi và bảo trì | Trả về danh sách các thông báo hệ thống được Admin phát hành | Hiển thị danh sách thông báo và banner trên giao diện | **PASS** |

---

## 4. KIỂM THỬ 7 LUỒNG TỰ ĐỘNG HÓA DỮ LIỆU (DF-01 ĐẾN DF-07)

```
[DF-01: Chấm Code Đạt] ----(100% TestCases)----> [Chờ Duyệt Video Phần Cứng]
[DF-02: Chốt Điểm Đạt] ----(Tổng Điểm >= 5.0)---> [Mở Khóa Dự Án Kế Tiếp]
[DF-03: Lượt Thích / Vote] --(Likes >= 20)------> [Gắn Cờ Top Trending]
[DF-04: Lỗi Code Biên Dịch] -(Syntax/Logic Err)-> [Đẩy Thẳng Log Về DB]
[DF-05: Tỷ Lệ Lỗi Lớp] -----(Lỗi > 30% Lớp)-----> [Gắn Cờ CoCanCapNhat HocLieu]
[DF-06: Chuyển Tab Thi] ----(Vi Phạm > 3 Lần)----> [Tự Động Khóa Bài & Thu Bài]
[DF-07: Khóa Tài Khoản] ----(Soft Delete)-------> [Bảo Lưu Lịch Sử Điểm Số]
```

| Mã Luồng | Tên Luồng Tự Động | Mô Đun Nguồn → Đích | Ràng Buộc Kiểm Thử & Kết Quả | Trạng Thái |
|:---:|:---|:---|:---|:---:|
| **DF-01** | Chấm Code Đạt → Duyệt Video | `XLBN.03` → `KQBN.01` | Mã nguồn phải pass **100% TestCases**, hệ thống mới chuyển `TrangThai` bài nộp sang `Chờ duyệt Video`. Nếu sai dù chỉ 1 testcase thì không làm phiền GV. | **PASS** |
| **DF-02** | Chốt điểm → Mở khóa bài mới | `KQBN.02` → `QLDA.02` | Khi hồ sơ điểm `KetQuaDiem` ghi nhận mức Đạt (`TongDiem >= 5.0`), hệ thống tự động giải phóng khóa bài tập kế tiếp có `MaDuAnTienQuyet` tương ứng. | **PASS** |
| **DF-03** | Đánh giá chủ đề yêu thích Top Trending | `QLDA.02` → `XBC.01` | Tự động tổng hợp tần suất hoàn thành và lượt bình chọn (`LuotThich >= 20`), gán cờ `isTopTrending` đưa lên banner trang chủ. | **PASS** |
| **DF-04** | Lỗi Code → Phân tích điểm yếu | `XLBN.02` → `TKDL.02` | Thu thập ngầm toàn bộ log lỗi Syntax/Logic từ máy chấm, lưu trữ vào cột `LogLoi` bảng `KetQuaDiem` phục vụ phân tích sư phạm. | **PASS** |
| **DF-05** | Phân tích điểm yếu → Cập nhật học liệu | `TKDL.02` → `QTHL.02` | Khi một bài tập có tỷ lệ bài nộp lỗi vượt ngưỡng **> 30%**, hệ thống tự động kích hoạt cờ `CoCanCapNhat = 1` ở bảng `HocLieu` để nhắc nhở GV. | **PASS** |
| **DF-06** | Giám sát gian lận → Khóa phòng thi | `KTĐG.02` → `KTĐG.02` | JS Tracking bắt sự kiện `visibilitychange` và `blur`. Lần 1-3 cảnh báo; vi phạm **> 3 lần** tự động khóa màn hình và nộp bài cưỡng bức. | **PASS** |
| **DF-07** | Khóa tài khoản → Giữ nguyên lịch sử | `QTHT.03` → `TKDL.01` | Khi Admin khóa tài khoản (Soft Delete: `TrangThai = N'Đã khóa'`), toàn bộ điểm số và bài nộp cũ của học sinh vẫn được bảo toàn nguyên vẹn. | **PASS** |

---

## 5. KIỂM THỬ PHÂN QUYỀN RBAC 4 VAI TRÒ

Ma trận kiểm thử ma trận phân quyền dựa trên `authMiddleware.js` hỗ trợ 4 đối tượng: **Admin**, **Giáo viên**, **Học sinh**, và **Khách (Chưa đăng nhập)**.

| Mã Kiểm Thử | Vai Trò Thực Hiện | Endpoint Thao Tác | Quyền Hạn Mong Đợi | Mã HTTP Thực Tế | Đánh Giá |
|:---|:---|:---|:---|:---:|:---:|
| RBAC-01 | Khách (Guest) | `GET /api/exam/active` | Chặn truy cập, yêu cầu đăng nhập | **401 Unauthorized** | **PASS** |
| RBAC-02 | Khách (Guest) | `GET /student` | Chuyển hướng về trang đăng nhập | **302 Redirect (/login)** | **PASS** |
| RBAC-03 | Học sinh (Student) | `GET /api/admin/stats` | Chặn truy cập trái quyền Admin | **403 Forbidden** | **PASS** |
| RBAC-04 | Học sinh (Student) | `POST /api/teacher/projects` | Chặn tạo bài tập của Giáo viên | **403 Forbidden** | **PASS** |
| RBAC-05 | Học sinh (Student) | `POST /api/submissions/:id/grade-video` | Chặn học sinh tự duyệt video của mình | **403 Forbidden** | **PASS** |
| RBAC-06 | Học sinh (Student) | `POST /api/community/posts/:id/resolve` (bài người khác) | Chặn resolve bài không phải do mình tạo | **403 Forbidden** | **PASS** |
| RBAC-07 | Giáo viên (Teacher) | `GET /api/admin/stats` | Chặn giáo viên truy cập chức năng Admin | **403 Forbidden** | **PASS** |
| RBAC-08 | Giáo viên (Teacher) | `POST /api/teacher/projects` | Cho phép tạo dự án và TestCases | **200 OK** | **PASS** |
| RBAC-09 | Giáo viên (Teacher) | `GET /api/exam/analytics/check-df05` | Cho phép theo dõi cảnh báo học liệu DF-05 | **200 OK** | **PASS** |
| RBAC-10 | Admin | `GET /api/admin/stats` | Cho phép xem toàn bộ thống kê hệ thống | **200 OK** | **PASS** |
| RBAC-11 | Admin | `POST /api/admin/users/:id/lock` | Cho phép thực hiện Soft Delete tài khoản | **200 OK** | **PASS** |

---

## 6. KIỂM THỬ CHUYÊN SÂU TÌNH HUỐNG BIÊN (EDGE CASES)
*(Thực thi tự động thông qua tệp mã nguồn: `server/tests/qa_edge_cases.js`)*

### 6.1. Giám sát & Khóa bài thi phòng thi trực tuyến khi chuyển tab > 3 lần (DF-06)
- **Mục tiêu:** Kiểm tra cơ chế đếm chuyển tab và tự động khóa phiên làm bài của học sinh nhằm ngăn chặn gian lận tra cứu đáp án trên trình duyệt.
- **Quy trình kịch bản:**
  1. Học sinh khởi tạo phiên thi hợp lệ: `BaiNop` có `SoLanChuyenTabHS = 0`, `TrangThai = N'Đang làm bài'`.
  2. Sự kiện chuyển tab lần 1: Ghi nhận vi phạm, `SoLanChuyenTabHS = 1`, `locked = false`, cảnh báo vàng còn 2 lần.
  3. Sự kiện chuyển tab lần 2: Ghi nhận vi phạm, `SoLanChuyenTabHS = 2`, `locked = false`, cảnh báo cam còn 1 lần.
  4. Sự kiện chuyển tab lần 3: Chạm ngưỡng trần, `SoLanChuyenTabHS = 3`, `locked = false`, cảnh báo đỏ còn 0 lần.
  5. Sự kiện chuyển tab lần 4 (Vi phạm **> 3 lần**): Kích hoạt DF-06, hệ thống tự động chuyển `TrangThai = N'Đã khóa (DF-06)'`, `locked = true`, kích hoạt modal phong tỏa màn hình.
  6. Học sinh cố tình gọi API nộp bài sau khi đã bị khóa: Server trả về mã lỗi **HTTP 403 Forbidden** kèm thông báo *"Bài thi này đã bị khóa do vi phạm quy chế chuyển tab (DF-06). Không thể nộp lại."*
- **Kết quả kiểm thử:** Toàn bộ 7/7 ca kiểm thử DF-06 đạt trạng thái **PASS**.

### 6.2. Cơ chế ngắt thời gian Timeout (TLE cutoff) với vòng lặp vô hạn `while(true)`
- **Mục tiêu:** Ngăn chặn học sinh vô tình hoặc cố ý nộp mã nguồn chứa vòng lặp vô hạn làm treo tiến trình máy chấm hoặc gây nghẽn CPU hệ thống.
- **Kịch bản thực nghiệm:**
  - Chuẩn bị đoạn mã Python:
    ```python
    import time
    while True:
        pass
    ```
  - Khởi chạy tiến trình kiểm thử với giới hạn thời gian thực thi: `TIMEOUT_LIMIT_MS = 1500` (1.5 giây).
  - Watchdog giám sát phát hiện tiến trình vượt ngưỡng thời gian quy định, tự động gửi tín hiệu `SIGKILL` tiêu diệt tiến trình.
- **Kết quả thực tế:** Tiến trình bị ngắt dứt khoát tại thời điểm **1527ms**, trả về cờ `isKilled: true`, giải phóng toàn bộ tài nguyên CPU. Ca kiểm thử đạt trạng thái **PASS**.

### 6.3. Lọc từ khóa vi phạm & Gắn nhãn "Đã giải quyết" diễn đàn (TTCĐ.02)
- **Mục tiêu:** Làm sạch môi trường thảo luận học thuật, ngăn chặn ngôn từ phi sư phạm hoặc hành vi gian lận thi cử.
- **Kịch bản 1 (Lọc từ khóa):**
  - Gửi bài viết có chứa các từ khóa cấm: `"cheat"`, `"hack điểm"`, `"lộ đề"`.
  - Kết quả: Server phát hiện từ khóa vi phạm, từ chối lưu bài và trả về mã lỗi **HTTP 400 Bad Request** kèm thông điệp rõ ràng: *"Nội dung chứa từ khóa vi phạm quy chuẩn cộng đồng STEM Robotic Edu (TTCĐ.02)."* -> **PASS**.
- **Kịch bản 2 (Gắn nhãn giải quyết):**
  - Tác giả bài viết gửi yêu cầu `POST /api/community/posts/:id/resolve`.
  - Kết quả: Server kiểm tra quyền sở hữu, cập nhật `TrangThai = N'Đã giải quyết'` -> **PASS**.
  - Người dùng lạ (không phải tác giả hoặc giáo viên) cố tình gửi yêu cầu resolve bài viết: Server từ chối với mã lỗi **HTTP 403 Forbidden** -> **PASS**.

### 6.4. Phòng chống vòng lặp chuyển hướng vô tận (ERR_TOO_MANY_REDIRECTS) & Chuẩn hóa Unicode Tiếng Việt CSDL
- **Mục tiêu:** Khắc phục triệt để lỗi chuyển hướng vòng lặp vô hạn `ERR_TOO_MANY_REDIRECTS` trên route `/login` khi người dùng truy cập trang đăng nhập hoặc click đăng nhập từ trang chủ.
- **Nguyên nhân cốt lõi phát hiện:**
  1. Do cơ chế import CSDL ban đầu qua terminal không định dạng UTF-8 dẫn đến các chuỗi `VaiTro` của người dùng bị dính Mojibake (ví dụ: `'Há»\x8Dc sinh'`, `'GiĂ¡o viĂªn'`).
  2. Hàm `redirectByRole(res, role)` trong `server/routes/pages.js` khi không khớp vai trò hợp lệ đã mặc định gọi `res.redirect('/login')`. Khi người dùng truy cập `/login` mang session cũ, route `/login` lại tự gọi `redirectByRole` dẫn đến việc chuyển hướng đệ quy vô hạn tới chính nó (`/login` ➜ `/login` ➜ `/login`).
- **Giải pháp xử lý từ QA Lead:**
  - Viết kịch bản `server/scripts/fix_db_unicode.js` chuẩn hóa 100% dữ liệu tiếng Việt Unicode (`NVARCHAR`) cho các bảng `NguoiDung`, `LopHoc`, `KhoaHocLoTrinh`, `DuAnBaiTap`, `MayCham`.
  - Bổ sung cơ chế phòng vệ (Defensive Routing):
    * Trong `redirectByRole`: Không bao giờ chuyển hướng về `/login` ở nhánh mặc định; thay vào đó chuyển về trang chủ `/`.
    * Trong route `GET /login`: Nếu session chứa vai trò không nhận dạng được hoặc sai định dạng, tự động hủy bỏ `delete req.session.user` và kết xuất form đăng nhập, loại trừ hoàn toàn khả năng tự chuyển hướng.
    * Trong `GET /logout`: Gọi `res.clearCookie('connect.sid')` xóa sạch cookie session của trình duyệt.
    * Trong `authMiddleware.js`: Bổ sung chuẩn hóa vai trò (hỗ trợ cả tiếng Anh và tiếng Việt).
- **Kết quả kiểm thử:** Toàn bộ 11/11 kịch bản kiểm thử chuyển hướng và đăng nhập trong `server/tests/test_login_redirect.js` đạt trạng thái **PASS (100%)**. Người dùng có thể click Đăng nhập từ trang chủ và chuyển vào đúng không gian Học sinh / Giáo viên / Admin mượt mà.

---

## 7. KIỂM THỬ PHI CHỨC NĂNG (NFR)

### 7.1. Hiệu năng & Thời gian đáp ứng (Performance - NFR-01)
- **Tiêu chuẩn thiết kế:** Thời gian chấm điểm tự động của máy chấm < 3.0 giây; thời gian tải trang trung bình < 1.0 giây.
- **Kết quả đo đạc thực tế:**
  - Thời gian phản hồi API Web trung bình: **28ms – 65ms**.
  - Thời gian kết nối CSDL SQL Server cục bộ qua `msnodesqlv8`: **12ms – 35ms**.
  - Thời gian biên dịch và kiểm tra 3 TestCases của Máy chấm: **120ms – 450ms** (Vượt xa chỉ tiêu NFR-01).

### 7.2. Giao diện & Trải nghiệm người dùng (Neo-Brutalist & Anti-AI-Slop)
- **Kiểm tra tuân thủ Design System:**
  - 100% biểu tượng sử dụng đồ họa vector SVG sắc nét, không dùng emoji (`🚀`, `🏆`, `🔥`...).
  - Nút bấm cơ học `.btn-playful` có viền `2px solid #0B0F19`, đổ bóng cứng `4px 4px 0 #5A52FF`.
  - Màu tương phản chuẩn WCAG AA: Primary `#5A52FF`, Success `#047857`, Error `#DC2626`.
  - Cấu trúc phẳng hóa Bento Grid (Flatten Hierarchy), không lồng thẻ con bên trong thẻ mẹ.

---

## 8. KẾT LUẬN & KHUYẾN NGHỊ NGHIỆM THU CỦA QA LEAD

### 8.1. Kết luận đánh giá chất lượng
Qua quá trình rà soát độc lập, cấu hình thực tế CSDL trên máy cá nhân và thực thi bộ kịch bản kiểm thử tự động, **Phạm Kỳ Hải (QA Lead)** đưa ra kết luận:
1. **Phân hệ 3 & các mô đun phụ trách (`QLDA.01`, `KTĐG.01`, `KTĐG.02`, `TTCĐ.02`):** Đã được hoàn thiện 100% chức năng, đạt chuẩn nghiệp vụ và giao diện Neo-Brutalist.
2. **Luồng dữ liệu tự động hóa DF-06:** Cơ chế phát hiện chuyển tab và khóa phiên thi trực tuyến vận hành chuẩn xác, ngăn chặn hiệu quả hành vi gian lận.
3. **Phân quyền bảo mật RBAC:** Đảm bảo chặt chẽ, không có lỗ hổng rò rỉ dữ liệu hoặc leo quyền trái phép giữa 4 vai trò.
4. **Độ ổn định mã nguồn:** Không còn lỗi cú pháp, tệp kịch bản `server/tests/qa_edge_cases.js` chạy độc lập thành công 18/18 ca kiểm thử với tỷ lệ Đạt **100%**.

### 8.2. Khuyến nghị cho Giảng viên & Trưởng nhóm
- ✅ **Chấp thuận nghiệm thu:** Đủ điều kiện để Giảng viên hướng dẫn TS. Đặng Hùng Vĩ nghiệm thu đồ án.
- ✅ **Quy trình chạy thực tế:** Khởi động hệ thống thông qua `Start_STEM_Robotic.bat` (kích hoạt đồng thời Web Server Port 80 và Judge Engine Port 5000), sau đó có thể chạy `npm test` để kiểm tra toàn bộ luồng tích hợp E2E.

---
*Báo cáo được lập và ký nhận bởi:*  
**Phạm Kỳ Hải**  
*Quản lý Chất lượng & QA Lead — Nhóm A+ (STEM Robotic Edu)*
