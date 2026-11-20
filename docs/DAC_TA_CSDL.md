# ĐẶC TẢ CƠ SỞ DỮ LIỆU — StemRoboticDB_V2

> **Môn học:** Lập trình Web  
> **Trường:** Đại học Sư phạm – Đại học Đà Nẵng  
> **Nhánh:** `feature/quan-csdl-hethong`  
> **Tác giả:** Trần Thế Quân  
> **Hệ quản trị:** Microsoft SQL Server (`localhost\SQLEXPRESS`)  
> **Nguồn tham chiếu:** `database_schema.sql`, `Bang_Xac_Dinh_Phan_He_STEM_Robotic_Update_Format.pdf`

---

## 1. Tổng quan lược đồ

```
StemRoboticDB_V2 gồm 14 bảng (12 bảng nghiệp vụ chính + LopHoc + BinhLuanThaoLuan)
Chuẩn hoá: BCNF — mọi phụ thuộc hàm đều bởi khoá chính
Mã hoá: NVARCHAR cho tiếng Việt, VARCHAR cho code/email/path
```

### Sơ đồ quan hệ (ER tổng quát)

```
NguoiDung ──< LopHoc (MaGiaoVienCN)
NguoiDung ──< KhoaHocLoTrinh (MaNguoiTao)
NguoiDung ──< HocLieu
NguoiDung ──< DuAnBaiTap
DuAnBaiTap ──< DuAnBaiTap (self-ref: MaDuAnTienQuyet)  ← QLDA.02
DuAnBaiTap ──< TestCase (CASCADE DELETE)
NguoiDung ──< BaiThi
NguoiDung ──< BaiNop
DuAnBaiTap ──< BaiNop
BaiThi ──< BaiNop
BaiNop ──< KetQuaDiem (1:1 UNIQUE)
MayCham ──< KetQuaDiem
NguoiDung ──< KetQuaDiem (GV duyệt video)
NguoiDung ──< NoiDungCongDong
DuAnBaiTap ──< NoiDungCongDong
BaiNop ──< NoiDungCongDong  ← Wall of Fame
NoiDungCongDong ──< BinhLuanThaoLuan (CASCADE DELETE)
NguoiDung ──< BinhLuanThaoLuan
NguoiDung ──< HoTroThongBao  ← HTTB.01, HTTB.02
NguoiDung ──< BaoCaoThongKe
```

---

## 2. Chi tiết từng bảng

---

### 2.1 `NguoiDung` — Người dùng hệ thống (ENT-01)

**Liên quan mô đun:** QLTK.01, QLTK.02, QTHT.02, QTHT.03  
**Luồng nghiệp vụ:** DF-07 (Vô hiệu hoá tài khoản – Soft Delete)

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaNguoiDung` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** tự tăng |
| `HoTen` | NVARCHAR(100) | NOT NULL | — | Họ và tên đầy đủ |
| `Email` | VARCHAR(150) | NOT NULL | — | Email đăng nhập, **UNIQUE** |
| `MatKhau` | VARCHAR(255) | NOT NULL | — | Mật khẩu (đã/chưa hash) |
| `VaiTro` | NVARCHAR(20) | NOT NULL | `'Học sinh'` | Học sinh / Giáo viên / Admin |
| `Lop` | NVARCHAR(50) | NULL | `'10/1'` | Lớp học (NULL với GV, Admin) |
| `TruongHoc` | NVARCHAR(200) | NULL | `'THPT Chuyên STEM'` | Tên trường |
| `AnhTheHocSinh` | VARCHAR(255) | NULL | — | Đường dẫn ảnh thẻ |
| `TrangThaiXacThucThe` | NVARCHAR(50) | NULL | `'Đã duyệt'` | Trạng thái duyệt hồ sơ |
| `MaDinhDanhHS` | VARCHAR(50) | NULL | — | Mã định danh học sinh |
| `SoDienThoai` | VARCHAR(15) | NULL | — | Số điện thoại |
| `AnhDaiDien` | VARCHAR(255) | NULL | — | Đường dẫn avatar |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang hoạt động'` | **Soft Delete (DF-07):** `'Đang hoạt động'` / `'Đã khóa'` / `'Ngừng hoạt động'` |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo tài khoản |

> **QTHT.02 — Cập nhật hồ sơ:** Cho phép sửa `HoTen`, `SoDienThoai`, `AnhDaiDien`, `Lop`. **Không cho phép học sinh tự đổi `Email`** (tránh mất liên kết hệ thống).  
> **QTHT.03 / DF-07 — Vô hiệu hoá mềm:** Thay vì xoá dòng, Admin cập nhật `TrangThai = N'Đã khóa'`. Giữ nguyên `MaNguoiDung` và toàn bộ lịch sử nộp bài để không làm sai lệch thống kê lớp.

---

### 2.2 `LopHoc` — Lớp học (ENT-01b)

**Liên quan mô đun:** QTHT.01, KTĐG.01

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaLop` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `TenLop` | NVARCHAR(50) | NOT NULL | — | Tên lớp, **UNIQUE** |
| `KhoiLop` | INT | NOT NULL | `10` | Khối lớp |
| `NienKhoa` | NVARCHAR(50) | NOT NULL | `'2025-2026'` | Niên khoá |
| `MaGiaoVienCN` | INT | NULL | — | **FK → NguoiDung.MaNguoiDung** (Giáo viên chủ nhiệm) |
| `MoTa` | NVARCHAR(255) | NULL | — | Mô tả ngắn về lớp |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo |

---

### 2.3 `KhoaHocLoTrinh` — Khoá học / Lộ trình (ENT-02)

**Liên quan mô đun:** QTHL.01, QTHL.02, TCPP.01

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaLoTrinh` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiTao` | INT | NULL | — | **FK → NguoiDung.MaNguoiDung** (GV tạo) |
| `TenLoTrinh` | NVARCHAR(200) | NOT NULL | — | Tên lộ trình |
| `ChuDe` | NVARCHAR(100) | NOT NULL | — | Cơ khí / Mạch điện / Lập trình |
| `CapDo` | NVARCHAR(50) | NOT NULL | `'Cơ bản'` | Cơ bản / Nâng cao / Chuyên sâu |
| `ThuTuHoc` | INT | NOT NULL | `1` | Thứ tự trong lộ trình học |
| `MoTa` | NVARCHAR(MAX) | NULL | — | Mô tả chi tiết |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang hoạt động'` | Đang hoạt động / Ẩn |

---

### 2.4 `HocLieu` — Học liệu (ENT-03)

**Liên quan mô đun:** QTHL.01, QTHL.02, TCPP.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaHocLieu` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** |
| `MaLoTrinh` | INT | NULL | — | **FK → KhoaHocLoTrinh.MaLoTrinh** |
| `TenHocLieu` | NVARCHAR(200) | NOT NULL | — | Tên bài giảng / tài liệu |
| `LoaiHocLieu` | NVARCHAR(50) | NOT NULL | — | Tài liệu / Video / Sơ đồ 3D / Code mẫu / Linh kiện |
| `NoiDung` | NVARCHAR(MAX) | NULL | — | Nội dung văn bản hoặc HTML |
| `DuongDanTep` | VARCHAR(255) | NULL | — | Đường dẫn file (video, PDF) |
| `CoCanCapNhat` | BIT | NOT NULL | `0` | **DF-05:** Gắn cờ khi >30% lớp mắc lỗi chung |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Bản nháp'` | Bản nháp / Xuất bản / Ẩn |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo |

---

### 2.5 `DuAnBaiTap` — Dự án / Bài tập (ENT-04)

**Liên quan mô đun:** QLDA.01, **QLDA.02**, XLBN.01

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaDuAn` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** (GV giao) |
| `MaLoTrinh` | INT | NULL | — | **FK → KhoaHocLoTrinh.MaLoTrinh** |
| `MaDuAnTienQuyet` | INT | NULL | — | **FK → DuAnBaiTap.MaDuAn** (tự tham chiếu — khoá lộ trình) |
| `TenDuAn` | NVARCHAR(200) | NOT NULL | — | Tên dự án |
| `YeuCauDuAn` | NVARCHAR(MAX) | NOT NULL | — | Mô tả yêu cầu chi tiết |
| `NgayGiao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày giao bài |
| `HanNop` | DATETIME | NOT NULL | — | Deadline nộp bài |
| `CapDo` | NVARCHAR(50) | NOT NULL | `'Cơ bản'` | Cơ bản / Nâng cao |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang mở'` | Đang mở / Đã đóng / Bị khoá |

> **QLDA.02 — Mở khoá thử thách nâng cao (DF-02):**  
> `MaDuAnTienQuyet` xác định bài tiền quyết. Khi `KetQuaDiem.KetQuaCode = 'Đạt'` cho bài tiền quyết, hệ thống tự động cập nhật `TrangThai = 'Đang mở'` cho bài tiếp theo mà không cần GV can thiệp.

---

### 2.6 `TestCase` — Dữ liệu kiểm thử (ENT-05)

**Liên quan mô đun:** XLBN.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaTestCase` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaDuAn` | INT | NOT NULL | — | **FK → DuAnBaiTap.MaDuAn** (ON DELETE CASCADE) |
| `DuLieuDauVao` | NVARCHAR(MAX) | NULL | — | Input test case (có thể rỗng với bài không có stdin) |
| `KetQuaDauRa` | NVARCHAR(MAX) | NOT NULL | — | Expected output chuẩn |
| `TrongSoDiem` | DECIMAL(5,2) | NOT NULL | `1.00` | Trọng số điểm của test case |
| `GoiYSuaLoi` | NVARCHAR(MAX) | NULL | — | Gợi ý sửa lỗi khi HS fail test case này |

---

### 2.7 `MayCham` — Máy chấm tự động / Judge Engine (ENT-07)

**Liên quan mô đun:** XLBN.02, XLBN.03

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaMayCham` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `TenMayCham` | NVARCHAR(100) | NOT NULL | — | Tên hệ thống chấm |
| `DiaChiAPI` | VARCHAR(255) | NOT NULL | — | Endpoint API, **UNIQUE** |
| `NgonNguHoTro` | VARCHAR(100) | NOT NULL | — | `.ino`, `.cpp`, `.py` |
| `DungLuongToiDa` | INT | NOT NULL | `5` | Giới hạn file (MB) |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang hoạt động'` | Đang hoạt động / Bảo trì |

---

### 2.8 `BaiThi` — Bài thi trực tuyến (KTĐG.02)

**Liên quan mô đun:** KTĐG.02, DF-06 (Window Focus Tracking)

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaBaiThi` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** (GV tổ chức) |
| `TenBaiThi` | NVARCHAR(200) | NOT NULL | — | Tên bài thi |
| `NoiDungDeThi` | NVARCHAR(MAX) | NOT NULL | — | Nội dung đề (JSON hoặc văn bản) |
| `ThoiGianBatDau` | DATETIME | NOT NULL | — | Giờ mở đề |
| `ThoiGianKetThuc` | DATETIME | NOT NULL | — | Giờ đóng đề |
| `ThoiLuong` | INT | NOT NULL | — | Thời lượng làm bài (phút) |
| `SoLanChuyenTab` | INT | NOT NULL | `3` | **DF-06:** Số lần chuyển tab tối đa; vượt quá → tự nộp |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Chưa mở'` | Chưa mở / Đang mở / Đã kết thúc |

---

### 2.9 `BaiNop` — Bài nộp đa phương tiện (ENT-06)

**Liên quan mô đun:** XLBN.01, XLBN.02, DF-01, DF-06

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaBaiNop` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** (Học sinh) |
| `MaDuAn` | INT | NULL | — | **FK → DuAnBaiTap.MaDuAn** (nullable với bài thi) |
| `MaBaiThi` | INT | NULL | — | **FK → BaiThi.MaBaiThi** (nullable với dự án) |
| `MaNguon` | VARCHAR(255) | NOT NULL | — | Đường dẫn file code (.ino/.cpp/.py) |
| `VideoVanHanh` | VARCHAR(255) | NULL | — | Video vận hành robot (NULL với bài thi, bắt buộc dự án) |
| `SoLanChuyenTabHS` | INT | NOT NULL | `0` | **DF-06:** Đếm số lần chuyển tab của từng HS |
| `ThoiGianNop` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Thời điểm nộp |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang chấm'` | Đang chấm / Chờ duyệt Video / Đã chốt điểm |

---

### 2.10 `KetQuaDiem` — Kết quả & Điểm số (ENT-08)

**Liên quan mô đun:** XLBN.03, KQBN.01, KQBN.02, TKDL.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaKetQua` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaBaiNop` | INT | NOT NULL | — | **FK → BaiNop.MaBaiNop**, **UNIQUE** (quan hệ 1:1) |
| `MaNguoiDung` | INT | NULL | — | **FK → NguoiDung.MaNguoiDung** (GV duyệt video) |
| `MaMayCham` | INT | NULL | — | **FK → MayCham.MaMayCham** |
| `DiemCode` | DECIMAL(5,2) | NULL | — | Điểm phần code (máy chấm) |
| `KetQuaCode` | NVARCHAR(30) | NULL | — | `'Đạt'` hoặc `'Không đạt'` |
| `LogLoi` | NVARCHAR(MAX) | NULL | — | **DF-04:** Log mã lỗi Syntax/Logic |
| `ThoiGianChay_ms` | INT | NULL | — | Thời gian chạy thực tế (ms) |
| `KetQuaVideo` | NVARCHAR(30) | NULL | — | `'Pass'` / `'Fail'` phần cứng |
| `TongDiem` | DECIMAL(5,2) | NULL | — | Điểm tổng cuối (code + video) |
| `NhanXet` | NVARCHAR(MAX) | NULL | — | Nhận xét của GV |
| `NgayChotDiem` | DATETIME | NULL | — | Ngày GV chốt điểm |

---

### 2.11 `NoiDungCongDong` — Nội dung cộng đồng (ENT-09, ENT-10)

**Liên quan mô đun:** TTCĐ.01, TTCĐ.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaNoiDung` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** |
| `MaDuAn` | INT | NULL | — | **FK → DuAnBaiTap.MaDuAn** |
| `MaBaiNop` | INT | NULL | — | **FK → BaiNop.MaBaiNop** (Wall of Fame – TTCĐ.02) |
| `TieuDe` | NVARCHAR(200) | NOT NULL | — | Tiêu đề topic / bài chia sẻ |
| `NoiDung` | NVARCHAR(MAX) | NOT NULL | — | Nội dung (text, link video, code lỗi) |
| `LoaiNoiDung` | NVARCHAR(50) | NOT NULL | `'Thảo luận'` | Thảo luận / Chia sẻ lỗi / Vinh danh |
| `SoLuotBinhChon` | INT | NOT NULL | `0` | Số lượt bình chọn (chống vote ảo) |
| `LuotThich` | INT | NOT NULL | `0` | Số lượt thích |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đã duyệt'` | Chờ duyệt / Đã duyệt / Bị ẩn |
| `NgayDang` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày đăng |

---

### 2.12 `BinhLuanThaoLuan` — Bình luận (ENT-10b)

**Liên quan mô đun:** TTCĐ.01, TTCĐ.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaBinhLuan` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaThaoLuan` | INT | NOT NULL | — | **FK → NoiDungCongDong.MaNoiDung** (ON DELETE CASCADE) |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** |
| `NoiDung` | NVARCHAR(MAX) | NOT NULL | — | Nội dung bình luận |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo |

---

### 2.13 `HoTroThongBao` — Hỗ trợ & Thông báo (ENT-11)

**Liên quan mô đun:** **HTTB.01** (Quản lý Phản hồi Sự cố) + **HTTB.02** (Thông báo hệ thống)

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaHoTro` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NULL | — | **FK → NguoiDung.MaNguoiDung** (người gửi/tạo) |
| `LoaiThongTin` | NVARCHAR(50) | NOT NULL | — | `'Sự cố'` (HTTB.01) / `'Thông báo'` (HTTB.02) |
| `TieuDe` | NVARCHAR(200) | NOT NULL | — | Tiêu đề ticket / thông báo |
| `NoiDung` | NVARCHAR(MAX) | NOT NULL | — | Nội dung chi tiết |
| `MucDoUuTien` | NVARCHAR(30) | NULL | `'Bình thường'` | Thấp / Bình thường / Cao / Khẩn cấp |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Chờ xử lý'` | **HTTB.01:** Chờ xử lý / Đang xử lý / Đã khắc phục |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo |

> **HTTB.01 — Phân loại ticket sự cố:** `LoaiThongTin = N'Sự cố'`. Admin/kỹ thuật viên theo dõi vòng đời qua cột `TrangThai`.  
> **HTTB.02 — Thông báo hệ thống:** `LoaiThongTin = N'Thông báo'`. Thông báo bảo trì khẩn (`MucDoUuTien = 'Khẩn cấp'`) được hiển thị dạng pop-up bắt buộc xác nhận.  
> **Phân luồng ưu tiên:** `MucDoUuTien = 'Cao'/'Khẩn cấp'` → banner chặn màn hình; `'Bình thường'` → banner thông thường.

---

### 2.14 `BaoCaoThongKe` — Báo cáo / Thống kê (ENT-12)

**Liên quan mô đun:** TKDL.01, TKDL.02, XBC.01, XBC.02

| Cột | Kiểu | Rỗng | Mặc định | Mô tả |
|-----|------|------|----------|-------|
| `MaBaoCao` | INT IDENTITY(1,1) | NOT NULL | — | **Khoá chính** |
| `MaNguoiDung` | INT | NOT NULL | — | **FK → NguoiDung.MaNguoiDung** (GV/Admin yêu cầu) |
| `TenBaoCao` | NVARCHAR(200) | NULL | — | Tên báo cáo |
| `LoaiBaoCao` | NVARCHAR(100) | NOT NULL | — | Điểm / Tiến độ / Log lỗi / Top Trending |
| `DuLieuThongKe` | NVARCHAR(MAX) | NULL | — | JSON dữ liệu thống kê |
| `DinhDangTep` | VARCHAR(20) | NULL | — | `'Excel'` / `'PDF'` |
| `DuongDanTep` | VARCHAR(255) | NULL | — | Đường dẫn file xuất |
| `NgayTao` | DATETIME | NOT NULL | `CURRENT_TIMESTAMP` | Ngày tạo |
| `TrangThai` | NVARCHAR(30) | NOT NULL | `'Đang xử lý'` | Đang xử lý / Hoàn thành / Lỗi |

---

## 3. Phân tích chuẩn hoá BCNF

| Bảng | Phụ thuộc hàm (FD) | Khoá chính | BCNF? |
|------|-------------------|------------|-------|
| `NguoiDung` | `MaNguoiDung → tất cả cột` | `MaNguoiDung` | ✅ |
| `LopHoc` | `MaLop → tất cả cột` | `MaLop` | ✅ |
| `KhoaHocLoTrinh` | `MaLoTrinh → tất cả cột` | `MaLoTrinh` | ✅ |
| `HocLieu` | `MaHocLieu → tất cả cột` | `MaHocLieu` | ✅ |
| `DuAnBaiTap` | `MaDuAn → tất cả cột` | `MaDuAn` | ✅ |
| `TestCase` | `MaTestCase → tất cả cột` | `MaTestCase` | ✅ |
| `MayCham` | `MaMayCham → tất cả; DiaChiAPI → tất cả` | `MaMayCham` | ✅ |
| `BaiThi` | `MaBaiThi → tất cả cột` | `MaBaiThi` | ✅ |
| `BaiNop` | `MaBaiNop → tất cả cột` | `MaBaiNop` | ✅ |
| `KetQuaDiem` | `MaKetQua → tất cả; MaBaiNop → tất cả (UNIQUE)` | `MaKetQua` | ✅ |
| `NoiDungCongDong` | `MaNoiDung → tất cả cột` | `MaNoiDung` | ✅ |
| `BinhLuanThaoLuan` | `MaBinhLuan → tất cả cột` | `MaBinhLuan` | ✅ |
| `HoTroThongBao` | `MaHoTro → tất cả cột` | `MaHoTro` | ✅ |
| `BaoCaoThongKe` | `MaBaoCao → tất cả cột` | `MaBaoCao` | ✅ |

> **Kết luận:** Toàn bộ 14 bảng đạt chuẩn BCNF. Không có phụ thuộc bắc cầu hay phụ thuộc một phần. Mỗi thuộc tính phi khoá đều phụ thuộc đầy đủ vào khoá chính.

---

## 4. Các ràng buộc và quy tắc nghiệp vụ quan trọng

### 4.1 Luồng DF-07 — Vô hiệu hoá tài khoản (Soft Delete)

```
QTHT.03 / Admin gửi lệnh khoá
  → UPDATE NguoiDung SET TrangThai = N'Đã khóa' WHERE MaNguoiDung = ?
  → Hệ thống trả về DF-07 khi TrangThai <> N'Đang hoạt động'
  → Giữ nguyên ID, BaiNop, KetQuaDiem để không lệch thống kê
```

### 4.2 Luồng DF-02 — Mở khoá lộ trình (QLDA.02)

```
KetQuaDiem.KetQuaCode = 'Đạt'
  → Trigger / API: Tìm DuAnBaiTap có MaDuAnTienQuyet = MaDuAn vừa đạt
  → UPDATE DuAnBaiTap SET TrangThai = 'Đang mở' WHERE MaDuAnTienQuyet = ?
  → Học sinh thấy thẻ dự án mới xuất hiện trên Dashboard
```

### 4.3 Luồng DF-06 — Giám sát thi (Window Focus Tracking)

```
BaiThi.SoLanChuyenTab = 3  (giới hạn toàn bài)
BaiNop.SoLanChuyenTabHS  (đếm thực tế từng HS)
  → Nếu SoLanChuyenTabHS >= SoLanChuyenTab:
       → Tự động nộp bài: INSERT INTO BaiNop + UPDATE TrangThai = 'Đang chấm'
```

### 4.4 Quan hệ 1:1 — `BaiNop` ↔ `KetQuaDiem`

```sql
MaBaiNop INT NOT NULL UNIQUE  -- Ràng buộc UNIQUE đảm bảo 1 bài nộp chỉ có 1 kết quả
```

### 4.5 Cascade Delete — `DuAnBaiTap` → `TestCase`

```sql
ON DELETE CASCADE  -- Xoá dự án → tự xoá toàn bộ test case liên quan
```

---

## 5. Dữ liệu mẫu ban đầu (Seed Data)

### Người dùng mặc định

| MaNguoiDung | HoTen | Email | VaiTro | TrangThai |
|-------------|-------|-------|--------|-----------|
| 1 | Quản Trị Viên Hệ Thống | admin@stemrobotic.edu.vn | Admin | Đang hoạt động |
| 2 | TS. Đặng Hùng Vĩ | gv.hungvi@stemrobotic.edu.vn | Giáo viên | Đang hoạt động |
| 3 | Trần Minh Nhật | hs.minhnhat@stemrobotic.edu.vn | Học sinh | Đang hoạt động |
| 4 | Phạm Kỳ Hải | hs.kyhai@stemrobotic.edu.vn | Học sinh | Đang hoạt động |
| 5 | Phạm Thị Hà Vy | hs.havy@stemrobotic.edu.vn | Học sinh | Đang hoạt động |
| 6 | Trần Thế Quân | hs.thequan@stemrobotic.edu.vn | Học sinh | Đang hoạt động |
| 7 | Nguyễn Thị Thanh Thảo | hs.thanhthao@stemrobotic.edu.vn | Học sinh | Đang hoạt động |

> Mật khẩu mặc định tất cả: `123456`

### Máy chấm mặc định

| MaMayCham | TenMayCham | DiaChiAPI | NgonNguHoTro |
|-----------|------------|-----------|--------------|
| 1 | STEM Arduino & Python Judge | http://localhost:5000/api/judge | .ino,.cpp,.py |

---

## 6. Hướng dẫn chạy seed dữ liệu thông báo

```bash
# Từ thư mục gốc dự án
cd D:\tkw\StemRoboticEdu-main\StemRoboticEdu-main
node server/seed_quan_thongbao.js
```

Script sẽ:
1. Kết nối `StemRoboticDB_V2` trên `localhost\SQLEXPRESS`  
2. Thêm 9 bản ghi mẫu vào `HoTroThongBao` (5 Thông báo + 4 Sự cố)  
3. In bảng thống kê theo `LoaiThongTin` và `TrangThai`  
4. An toàn với `IF NOT EXISTS` — chạy nhiều lần không bị lỗi trùng

---

*Tài liệu được tạo ngày 20/11/2026 — Trần Thế Quân — Nhánh `feature/quan-csdl-hethong`*
