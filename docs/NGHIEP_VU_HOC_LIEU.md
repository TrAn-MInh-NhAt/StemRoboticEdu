# Đặc Tả Nghiệp Vụ Học Liệu — Phân Hệ 2

> **Tác giả:** Phạm Thị Hà Vy | **Email:** Phamthihavy032@gmail.com
> **Nhánh:** `feature/vy-hoclieu-morong` | **Ngày:** 2026-11-20

---

## 1. Tổng Quan Phân Hệ

Phân hệ 2 quản lý toàn bộ vòng đời học liệu số trong hệ thống STEM Robotic Edu, bao gồm:

| Mã Mô Đun | Tên | Nhóm |
|-----------|-----|-------|
| QTHL.01 | Thêm mới bài giảng & Code mẫu | Quản trị học liệu (GV) |
| QTHL.02 | Cập nhật / Ẩn học liệu | Quản trị học liệu (GV) |
| TCPP.01 | Hiển thị danh mục & Lộ trình học | Tra cứu & Phân phối (HS) |
| TCPP.02 | Tra cứu linh kiện & Bắt lỗi code | Tra cứu & Phân phối (HS) |

---

## 2. Mô Đun QTHL.01 — Thêm Mới Bài Giảng & Code Mẫu

### 2.1 IPO Table

| Thành phần | Chi tiết |
|-----------|---------|
| **Input** | - Tiêu đề bài giảng (NVARCHAR 255)<br>- Nội dung văn bản mô tả (NVARCHAR MAX)<br>- Video hướng dẫn (URL hoặc file upload, hỗ trợ tua chậm 0.5x/0.75x)<br>- Sơ đồ lắp ráp 3D (file hình ảnh hoặc URL SVG vector)<br>- File code mẫu (.ino / .py / .cpp)<br>- Thông số linh kiện đi kèm (JSON: tên, chân kết nối, điện áp, dòng điện)<br>- Chủ đề: Cơ khí / Mạch điện / Lập trình<br>- Trạng thái: Bản nháp / Xuất bản |
| **Processing** | 1. Validate định dạng file (video <= 500MB, ảnh <= 10MB, code <= 1MB)<br>2. Kiểm tra bắt buộc: sơ đồ lắp ráp PHẢI đi kèm thông số linh kiện<br>3. Sinh `MaHocLieu` tự động (prefix theo chủ đề: `CK-`, `MD-`, `LT-`)<br>4. Lưu vào bảng `HocLieu` với `TrangThai = N'Bản nháp'` hoặc `N'Xuất bản'`<br>5. Nếu trạng thái Xuất bản: ghi log vào bảng `NhatKyHeDieu`<br>6. Trigger tính toán `CoCanCapNhat` nếu tỷ lệ lỗi bài liên quan > 30% |
| **Output** | - Bản ghi `HocLieu` mới trong DB<br>- Thông báo xác nhận cho GV (mã học liệu, trạng thái)<br>- Cập nhật cây thư mục chủ đề (TCPP.01) |

### 2.2 Ràng Buộc Nghiệp Vụ

- **BU-01:** Video bắt buộc hỗ trợ tua chậm (0.5x, 0.75x) — sử dụng thuộc tính `playbackRate` HTML5 hoặc player tương thích.
- **BU-02:** Sơ đồ lắp ráp 3D PHẢI đi kèm thông số linh kiện đầy đủ (tên linh kiện, số chân, điện áp hoạt động) để học sinh không nhầm chân kết nối.
- **BU-03:** Chỉ GV có vai trò `MaVaiTro = 2` hoặc Admin `MaVaiTro = 1` mới được thêm học liệu.

### 2.3 Sơ Đồ Luồng

```
GV nhập form
    |
    v
Validate format file
    |-- Lỗi --> Trả về thông báo lỗi chi tiết
    |
    v
Kiểm tra linh kiện bắt buộc (BU-02)
    |-- Thiếu --> Yêu cầu bổ sung thông số
    |
    v
Lưu HocLieu (TrangThai = Bản nháp)
    |
    v
GV chọn "Xuất bản"?
    |-- Có --> Cập nhật TrangThai + Ghi log
    |-- Không --> Giữ Bản nháp
    |
    v
Hiển thị xác nhận + MaHocLieu
```

---

## 3. Mô Đun QTHL.02 — Cập Nhật / Ẩn Học Liệu

### 3.1 IPO Table

| Thành phần | Chi tiết |
|-----------|---------|
| **Input** | - Mã bài học (`MaHocLieu`) từ danh sách GV<br>- Nội dung sửa đổi (một hoặc nhiều trường)<br>- Lệnh hành động: Lưu bản nháp / Xuất bản / Ẩn / Hiện |
| **Processing** | 1. Xác thực GV sở hữu học liệu (`MaNguoiDung` khớp)<br>2. **Kiểm tra ràng buộc Ẩn (BU-04):** Truy vấn `BaiTap` và `KyThi` xem có record đang mở (`ThoiGianDong > GETDATE()`) liên kết tới `MaHocLieu` không<br>3. Nếu có ràng buộc: chặn hành động Ẩn, trả về cảnh báo kèm danh sách bài tập/kỳ thi liên quan và thời hạn kết thúc<br>4. Nếu không có ràng buộc: cập nhật `TrangThai = N'Ẩn'` hoặc ghi nhận chỉnh sửa<br>5. Ghi log thay đổi vào `NhatKyHeDieu` |
| **Output** | - Bản ghi `HocLieu` được cập nhật<br>- Cảnh báo (nếu bị chặn ẩn)<br>- Danh sách bài tập/kỳ thi liên quan kèm thời hạn |

### 3.2 Ràng Buộc Nghiệp Vụ

- **BU-04 (Tính liền mạch):** Nếu học liệu đang được tham chiếu bởi bài tập hoặc kỳ thi chưa kết thúc, hệ thống PHẢI cảnh báo GV và từ chối lệnh Ẩn cho đến khi quá thời hạn nộp bài / hết kỳ thi.

### 3.3 Sơ Đồ Luồng

```
GV chọn học liệu cần sửa/ẩn
    |
    v
Hành động = Ẩn?
    |-- Có --> Kiểm tra BaiTap & KyThi đang mở
    |          |-- Có ràng buộc --> CHẶN + Cảnh báo danh sách
    |          |-- Không --> Cập nhật TrangThai = Ẩn
    |-- Không --> Lưu chỉnh sửa nội dung
    |
    v
Ghi log NhatKyHeDieu
    |
    v
Trả về kết quả cho GV
```

### 3.4 Sequence Diagram — Kiểm Tra Ràng Buộc Ẩn

```
GV         Server API       DB (HocLieu)   DB (BaiTap/KyThi)
 |               |               |               |
 |--PUT /hide--> |               |               |
 |               |--SELECT MaHocLieu-----------> |
 |               |<--Có records đang mở--------- |
 |               |                               |
 |<--403 + List--|               |               |
 |  cảnh báo     |               |               |
```

---

## 4. Mô Đun TCPP.01 — Hiển Thị Danh Mục & Lộ Trình Học

### 4.1 IPO Table

| Thành phần | Chi tiết |
|-----------|---------|
| **Input** | - Tín hiệu truy cập trang (GET `/hoc-lieu`)<br>- Token xác thực học sinh (`MaNguoiDung`)<br>- Bộ lọc tùy chọn: Chủ đề, Cấp độ |
| **Processing** | 1. Truy vấn `KhoaHocLoTrinh` lấy danh sách khóa học theo thứ tự `ThuTuHienThi`<br>2. Với mỗi khóa học, truy vấn `HocLieu` có `TrangThai = N'Xuất bản'`<br>3. Phân nhóm theo chủ đề: Cơ khí / Mạch điện / Lập trình<br>4. Sắp xếp từ Cơ bản đến Nâng cao theo trường `CapDo`<br>5. Tính % hoàn thành của HS (nếu có lịch sử học) |
| **Output** | - Cây thư mục chủ đề dạng sơ đồ logic (JSON + render frontend)<br>- Danh sách học liệu trong mỗi nhánh, kèm badge Cơ bản / Trung cấp / Nâng cao<br>- % tiến độ học tập cá nhân |

### 4.2 Cấu Trúc Cây Thư Mục

```
Lộ trình học STEM Robotic
├── Cơ khí
│   ├── [Cơ bản]   Giới thiệu linh kiện cơ bản
│   ├── [Cơ bản]   Sơ đồ lắp ráp robot đơn giản
│   └── [Nâng cao] Thiết kế cơ cấu truyền động
├── Mạch điện
│   ├── [Cơ bản]   Arduino Uno R3 — Pinout & khởi động
│   ├── [Trung cấp] Mạch cầu H L298N điều khiển động cơ
│   └── [Nâng cao] Bluetooth HC-05 & truyền dữ liệu không dây
└── Lập trình
    ├── [Cơ bản]   Lập trình LED nhấp nháy
    ├── [Trung cấp] Đọc cảm biến siêu âm HC-SR04
    └── [Nâng cao] PID điều khiển xe dò line
```

---

## 5. Mô Đun TCPP.02 — Tra Cứu Linh Kiện & Bắt Lỗi Code

### 5.1 IPO Table

| Thành phần | Chi tiết |
|-----------|---------|
| **Input** | - Từ khóa tên linh kiện (vd: "TCRT5000", "HC-SR04")<br>- Dòng mã lỗi từ trình biên dịch (vd: `error: 'pinMode' was not declared`)<br>- Mã lỗi TestCase từ máy chấm tự động |
| **Processing** | 1. Tìm kiếm FULLTEXT trong `HocLieu.TuKhoaTimKiem`<br>2. Nếu từ khóa là lỗi code: match với `TestCase.GoiYSuaLoi` và `HocLieu.LoaiHocLieu = N'Mẹo sửa lỗi'`<br>3. Thuật toán gợi ý thông minh: lấy top-5 kết quả liên quan nhất (cosine similarity trên tags)<br>4. Nếu tỷ lệ lỗi bài > 30%: đánh dấu `HocLieu.CoCanCapNhat = 1` và kích hoạt DF-05 |
| **Output** | - Danh sách tài liệu kết quả tìm kiếm (tên, mô tả ngắn, link chi tiết)<br>- Mẹo sửa lỗi inline kèm đoạn code ví dụ đúng<br>- Gợi ý tài liệu liên quan tự động (Related content) |

### 5.2 Ví Dụ Gợi Ý Thông Minh

| Lỗi Học Sinh Nhập | Gợi Ý Trả Về |
|-------------------|--------------|
| `pulseIn() timeout` | Hướng dẫn HC-SR04: Kiểm tra khoảng cách >4m hoặc dây nối lỏng |
| `Servo not rotating` | Hướng dẫn SG90: Kiểm tra chân PWM, nguồn 5V riêng |
| `error: undeclared identifier` | Mẹo C++: Thêm `#include <Servo.h>` hoặc kiểm tra tên biến |
| `L298N motor not spinning` | Hướng dẫn L298N: Kiểm tra chân ENA/ENB phải HIGH |

---

## 6. Luồng Dữ Liệu DF-05 — Cập Nhật Học Liệu Khi Tỷ Lệ Lỗi > 30%

### 6.1 Mô Tả Luồng

Luồng DF-05 tự động phát hiện khi tỷ lệ làm bài lỗi vượt ngưỡng 30% và thông báo GV cập nhật/bổ sung học liệu hướng dẫn.

### 6.2 IPO Table DF-05

| Thành phần | Chi tiết |
|-----------|---------|
| **Trigger** | Máy chấm tự động cập nhật kết quả `TestCase` → Stored Procedure tính tỷ lệ lỗi theo `MaHocLieu` |
| **Điều kiện** | `TyLeLoi = (SoLanLoi / TongLanNop) > 0.30` trong vòng 7 ngày gần nhất |
| **Processing** | 1. Cập nhật `HocLieu.CoCanCapNhat = 1` cho học liệu liên quan<br>2. Tạo thông báo tự động cho GV phụ trách (`MaNguoiDung` của học liệu)<br>3. Ghi log vào `NhatKyHeDieu` với mức độ `WARN`<br>4. Hiển thị banner cảnh báo trên dashboard GV |
| **Output** | - Cờ `CoCanCapNhat = 1` trong bảng `HocLieu`<br>- Thông báo đẩy cho GV<br>- Báo cáo: danh sách lỗi phổ biến nhất (top 5 lỗi) kèm tần suất |

### 6.3 Sơ Đồ Luồng DF-05

```
Máy chấm chấm bài
    |
    v
Cập nhật TestCase (KetQua = Sai)
    |
    v
SP_TinhTyLeLoi chạy (mỗi 1 giờ hoặc theo trigger)
    |
    v
TyLeLoi > 30%?
    |-- Không --> Kết thúc (không làm gì)
    |-- Có  --> Cập nhật CoCanCapNhat = 1
                    |
                    v
               Tạo thông báo cho GV phụ trách
                    |
                    v
               GV xem dashboard --> Thấy banner cảnh báo
                    |
                    v
               GV cập nhật/bổ sung học liệu (QTHL.01 / QTHL.02)
                    |
                    v
               Sau khi cập nhật: Reset CoCanCapNhat = 0
```

### 6.4 Quy Trình GV Phản Hồi DF-05

1. GV đăng nhập hệ thống, thấy banner: **"Học liệu [Tên] có tỷ lệ lỗi >30%. Cần bổ sung hướng dẫn."**
2. GV xem báo cáo lỗi phổ biến (top-5 lỗi từ `TestCase.GoiYSuaLoi`)
3. GV cập nhật nội dung học liệu hoặc thêm học liệu "Mẹo sửa lỗi" mới (QTHL.01)
4. Hệ thống tự động reset `CoCanCapNhat = 0` và ghi log "GV đã cập nhật"

---

## 7. Ma Trận Phụ Thuộc Module

| Module | Phụ thuộc | Bảng DB chính |
|--------|-----------|---------------|
| QTHL.01 | Xác thực GV | `HocLieu`, `KhoaHocLoTrinh` |
| QTHL.02 | QTHL.01, BaiTap, KyThi | `HocLieu`, `BaiTap`, `KyThi` |
| TCPP.01 | QTHL.01 | `HocLieu`, `KhoaHocLoTrinh` |
| TCPP.02 | TCPP.01, TestCase | `HocLieu`, `TestCase` |
| DF-05 | TCPP.02, QTHL.02 | `HocLieu`, `TestCase`, `NhatKyHeDieu` |

---

## 8. Bảng Cột Sử Dụng (Từ database_schema.sql)

### Bảng `HocLieu`

| Cột | Kiểu | Mô tả trong Phân hệ 2 |
|-----|------|----------------------|
| `MaHocLieu` | INT IDENTITY | Khóa chính, tự sinh |
| `TieuDe` | NVARCHAR(255) | Tiêu đề bài giảng |
| `LoaiHocLieu` | NVARCHAR(100) | Phân loại: Bài giảng / Linh kiện / Mẹo sửa lỗi |
| `NoiDung` | NVARCHAR(MAX) | Mô tả & nội dung chi tiết |
| `TrangThai` | NVARCHAR(50) | Bản nháp / Xuất bản / Ẩn |
| `MaNguoiDung` | INT | GV phụ trách |
| `MaKhoaHoc` | INT | Liên kết `KhoaHocLoTrinh` |
| `CoCanCapNhat` | BIT | Cờ DF-05: 1 = cần cập nhật |

### Bảng `KhoaHocLoTrinh`

| Cột | Kiểu | Mô tả |
|-----|------|-------|
| `MaKhoaHoc` | INT IDENTITY | Khóa chính |
| `TenKhoaHoc` | NVARCHAR(255) | Tên khóa / chủ đề |
| `MoTa` | NVARCHAR(MAX) | Mô tả lộ trình |
| `CapDo` | NVARCHAR(50) | Cơ bản / Trung cấp / Nâng cao |

---

*Tài liệu tuân thủ chuẩn Neo-Brutalist, không dùng emoji, 100% văn bản kỹ thuật.*
*Phiên bản: 1.0 — Phạm Thị Hà Vy — StemRoboticEdu Phân hệ 2*
