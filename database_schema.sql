-- ==========================================================
-- HỆ THỐNG HỌC TẬP & QUẢN LÝ ĐÀO TẠO STEM ROBOTIC (12 BẢNG)
-- Đã chuẩn hóa theo Báo cáo giữa kỳ & Logic Backend
-- ==========================================================
IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'StemRoboticDB_V2')
BEGIN
    CREATE DATABASE StemRoboticDB_V2;
END
GO

USE StemRoboticDB_V2;
GO

-- 1. Bảng Người dùng (ENT-01)
CREATE TABLE NguoiDung (
    MaNguoiDung INT IDENTITY(1,1) PRIMARY KEY,
    HoTen NVARCHAR(100) NOT NULL,
    Email VARCHAR(150) NOT NULL UNIQUE,
    MatKhau VARCHAR(255) NOT NULL,
    VaiTro NVARCHAR(20) NOT NULL DEFAULT N'Học sinh', -- Học sinh, Giáo viên, Admin
    Lop NVARCHAR(50) NULL DEFAULT N'10/1',
    TruongHoc NVARCHAR(200) NULL DEFAULT N'THPT Chuyên STEM',
    AnhTheHocSinh VARCHAR(255) NULL,
    TrangThaiXacThucThe NVARCHAR(50) NULL DEFAULT N'Đã duyệt',
    MaDinhDanhHS VARCHAR(50) NULL,
    SoDienThoai VARCHAR(15) NULL,
    AnhDaiDien VARCHAR(255) NULL,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang hoạt động', -- Phục vụ Soft Delete (DF-07)
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 1b. Bảng Lớp học (Quản lý Lớp 10/1)
CREATE TABLE LopHoc (
    MaLop INT IDENTITY(1,1) PRIMARY KEY,
    TenLop NVARCHAR(50) NOT NULL UNIQUE,
    KhoiLop INT NOT NULL DEFAULT 10,
    NienKhoa NVARCHAR(50) NOT NULL DEFAULT '2025-2026',
    MaGiaoVienCN INT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MoTa NVARCHAR(255) NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng Khóa học / Lộ trình (ENT-02)
CREATE TABLE KhoaHocLoTrinh (
    MaLoTrinh INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiTao INT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TenLoTrinh NVARCHAR(200) NOT NULL,
    ChuDe NVARCHAR(100) NOT NULL, -- Cơ khí, Mạch điện, Lập trình
    CapDo NVARCHAR(50) NOT NULL DEFAULT N'Cơ bản',
    ThuTuHoc INT NOT NULL DEFAULT 1,
    MoTa NVARCHAR(MAX) NULL,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang hoạt động'
);

-- 3. Bảng Học liệu (ENT-03)
CREATE TABLE HocLieu (
    MaHocLieu INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaLoTrinh INT NULL FOREIGN KEY REFERENCES KhoaHocLoTrinh(MaLoTrinh),
    TenHocLieu NVARCHAR(200) NOT NULL,
    LoaiHocLieu NVARCHAR(50) NOT NULL, -- Tài liệu, Video, Sơ đồ 3D, Code mẫu, Linh kiện
    NoiDung NVARCHAR(MAX) NULL,
    DuongDanTep VARCHAR(255) NULL,
    CoCanCapNhat BIT NOT NULL DEFAULT 0, -- Phục vụ DF-05: Gắn cờ khi >30% lớp mắc lỗi
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Bản nháp',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng Dự án / Bài tập (ENT-04)
CREATE TABLE DuAnBaiTap (
    MaDuAn INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaLoTrinh INT NULL FOREIGN KEY REFERENCES KhoaHocLoTrinh(MaLoTrinh),
    MaDuAnTienQuyet INT NULL FOREIGN KEY REFERENCES DuAnBaiTap(MaDuAn), -- Phục vụ DF-02: Mở khóa bài mới
    TenDuAn NVARCHAR(200) NOT NULL,
    YeuCauDuAn NVARCHAR(MAX) NOT NULL,
    NgayGiao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    HanNop DATETIME NOT NULL,
    CapDo NVARCHAR(50) NOT NULL DEFAULT N'Cơ bản',
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang mở'
);

-- 5. Bảng Dữ liệu kiểm thử / Test Case (ENT-05)
CREATE TABLE TestCase (
    MaTestCase INT IDENTITY(1,1) PRIMARY KEY,
    MaDuAn INT NOT NULL FOREIGN KEY REFERENCES DuAnBaiTap(MaDuAn) ON DELETE CASCADE,
    DuLieuDauVao NVARCHAR(MAX) NULL,
    KetQuaDauRa NVARCHAR(MAX) NOT NULL,
    TrongSoDiem DECIMAL(5,2) NOT NULL DEFAULT 1.00,
    GoiYSuaLoi NVARCHAR(MAX) NULL
);

-- 6. Bảng Máy chấm tự động / Judge Engine (ENT-07)
CREATE TABLE MayCham (
    MaMayCham INT IDENTITY(1,1) PRIMARY KEY,
    TenMayCham NVARCHAR(100) NOT NULL,
    DiaChiAPI VARCHAR(255) NOT NULL UNIQUE,
    NgonNguHoTro VARCHAR(100) NOT NULL, -- .ino, .cpp, .py
    DungLuongToiDa INT NOT NULL DEFAULT 5,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang hoạt động'
);

-- 7. Bảng Bài thi trực tuyến (KTĐG.02)
CREATE TABLE BaiThi (
    MaBaiThi INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TenBaiThi NVARCHAR(200) NOT NULL,
    NoiDungDeThi NVARCHAR(MAX) NOT NULL,
    ThoiGianBatDau DATETIME NOT NULL,
    ThoiGianKetThuc DATETIME NOT NULL,
    ThoiLuong INT NOT NULL, -- Phút
    SoLanChuyenTab INT NOT NULL DEFAULT 3, -- [ĐÃ SỬA] Giới hạn tối đa cho phép toàn bài thi (DF-06)
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Chưa mở'
);

-- 8. Bảng Bài nộp đa phương tiện (ENT-06)
CREATE TABLE BaiNop (
    MaBaiNop INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaDuAn INT NULL FOREIGN KEY REFERENCES DuAnBaiTap(MaDuAn),
    MaBaiThi INT NULL FOREIGN KEY REFERENCES BaiThi(MaBaiThi),
    MaNguon VARCHAR(255) NOT NULL, -- Đường dẫn file .ino, .cpp, .py
    VideoVanHanh VARCHAR(255) NULL, -- [ĐÃ SỬA] Cho phép NULL khi làm Bài thi; bắt buộc qua API khi nộp Dự án (XLBN.01)
    SoLanChuyenTabHS INT NOT NULL DEFAULT 0, -- [ĐÃ SỬA] Đếm riêng số lần chuyển tab của từng học sinh (DF-06)
    ThoiGianNop DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang chấm' -- Đang chấm, Chờ duyệt Video (DF-01), Đã chốt điểm
);

-- 9. Bảng Kết quả / Điểm & Log Máy chấm (ENT-08)
CREATE TABLE KetQuaDiem (
    MaKetQua INT IDENTITY(1,1) PRIMARY KEY,
    MaBaiNop INT NOT NULL UNIQUE FOREIGN KEY REFERENCES BaiNop(MaBaiNop),
    MaNguoiDung INT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung), -- Giáo viên duyệt video
    MaMayCham INT NULL FOREIGN KEY REFERENCES MayCham(MaMayCham),
    DiemCode DECIMAL(5,2) NULL,
    KetQuaCode NVARCHAR(30) NULL, -- Đạt hoặc Không đạt
    LogLoi NVARCHAR(MAX) NULL, -- Phục vụ DF-04: Bắt mã lỗi Syntax/Logic
    ThoiGianChay_ms INT NULL,
    KetQuaVideo NVARCHAR(30) NULL, -- Pass/Fail phần cứng (KQBN.01)
    TongDiem DECIMAL(5,2) NULL,
    NhanXet NVARCHAR(MAX) NULL,
    NgayChotDiem DATETIME NULL
);

-- 10. Bảng Báo cáo / Thống kê (ENT-12)
CREATE TABLE BaoCaoThongKe (
    MaBaoCao INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    TenBaoCao NVARCHAR(200) NULL,
    LoaiBaoCao NVARCHAR(100) NOT NULL, -- Điểm, Tiến độ, Log lỗi (TKDL.02), Top Trending (XBC.01)
    DuLieuThongKe NVARCHAR(MAX) NULL,
    DinhDangTep VARCHAR(20) NULL, -- Excel, PDF
    DuongDanTep VARCHAR(255) NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đang xử lý'
);

-- 11. Bảng Nội dung cộng đồng & Bình chọn (ENT-09, ENT-10)
CREATE TABLE NoiDungCongDong (
    MaNoiDung INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    MaDuAn INT NULL FOREIGN KEY REFERENCES DuAnBaiTap(MaDuAn),
    MaBaiNop INT NULL FOREIGN KEY REFERENCES BaiNop(MaBaiNop), -- Phục vụ Wall of Fame (TTCĐ.02)
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    LoaiNoiDung NVARCHAR(50) NOT NULL DEFAULT N'Thảo luận', -- Thảo luận, Chia sẻ lỗi, Vinh danh
    SoLuotBinhChon INT NOT NULL DEFAULT 0,
    LuotThich INT NOT NULL DEFAULT 0,
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Đã duyệt',
    NgayDang DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11.1. Bảng Bình luận Thảo luận (TTCĐ.02)
CREATE TABLE BinhLuanThaoLuan (
    MaBinhLuan INT IDENTITY(1,1) PRIMARY KEY,
    MaThaoLuan INT NOT NULL FOREIGN KEY REFERENCES NoiDungCongDong(MaNoiDung) ON DELETE CASCADE,
    MaNguoiDung INT NOT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    NoiDung NVARCHAR(MAX) NOT NULL,
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. Bảng Hỗ trợ / Thông báo & Sự cố (ENT-11)
CREATE TABLE HoTroThongBao (
    MaHoTro INT IDENTITY(1,1) PRIMARY KEY,
    MaNguoiDung INT NULL FOREIGN KEY REFERENCES NguoiDung(MaNguoiDung),
    LoaiThongTin NVARCHAR(50) NOT NULL, -- Sự cố (HTTB.01), Thông báo bảo trì (HTTB.02)
    TieuDe NVARCHAR(200) NOT NULL,
    NoiDung NVARCHAR(MAX) NOT NULL,
    MucDoUuTien NVARCHAR(30) NULL DEFAULT N'Bình thường',
    TrangThai NVARCHAR(30) NOT NULL DEFAULT N'Chờ xử lý',
    NgayTao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
GO

-- ==========================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA ĐỂ TEST HỆ THỐNG)
-- ==========================================================
INSERT INTO NguoiDung (HoTen, Email, MatKhau, VaiTro, Lop) VALUES
(N'Quản Trị Viên Hệ Thống', 'admin@stemrobotic.edu.vn', '123456', N'Admin', NULL),
(N'TS. Đặng Hùng Vĩ', 'gv.hungvi@stemrobotic.edu.vn', '123456', N'Giáo viên', NULL),
(N'Trần Minh Nhật', 'hs.minhnhat@stemrobotic.edu.vn', '123456', N'Học sinh', N'10/1'),
(N'Phạm Kỳ Hải', 'hs.kyhai@stemrobotic.edu.vn', '123456', N'Học sinh', N'10/1'),
(N'Phạm Thị Hà Vy', 'hs.havy@stemrobotic.edu.vn', '123456', N'Học sinh', N'10/1'),
(N'Trần Thế Quân', 'hs.thequan@stemrobotic.edu.vn', '123456', N'Học sinh', N'10/1'),
(N'Nguyễn Thị Thanh Thảo', 'hs.thanhthao@stemrobotic.edu.vn', '123456', N'Học sinh', N'10/1');

INSERT INTO LopHoc (TenLop, KhoiLop, NienKhoa, MaGiaoVienCN, MoTa) VALUES
(N'10/1', 10, '2025-2026', 2, N'Lớp Chuyên Kỹ Thuật Robotics & Tự Động Hóa 10/1');

INSERT INTO MayCham (TenMayCham, DiaChiAPI, NgonNguHoTro) VALUES
(N'STEM Arduino & Python Judge', 'http://localhost:5000/api/judge', '.ino,.cpp,.py');
GO