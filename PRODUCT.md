<p align="center"><strong>ĐẠI HỌC ĐÀ NẴNG<br>TRƯỜNG ĐẠI HỌC SƯ PHẠM<br>KHOA TOÁN-TIN</strong></p>

<p align="center"><img src="PRODUCT_assets/image_01.jpg" alt="Logo trường" width="180"></p>

# PHÂN TÍCH HỆ THỐNG THÔNG TIN

**ĐỀ TÀI:** Xây dựng Website Học tập và Quản lý Đào tạo STEM Robotic cấp Trung học

**Người hướng dẫn khoa học:** TS. Đặng Hùng Vĩ  
**Nhóm sinh viên thực hiện:**
- Phạm Kỳ Hải – 23SPT
- Trần Minh Nhật – 23SPT
- Phạm Thị Hà Vy – 24SPT
- Trần Thế Quân – 24CNTT1
- Nguyễn Thị Thanh Thảo – 24CNTT1

**Lớp:** 24SPT  
**Khóa:** 2024  
**Đà Nẵng, năm 2026**

---

> Nội dung được chuyển từ tài liệu Word gốc. Các sơ đồ/hình ảnh được tách ra thư mục `PRODUCT_assets` và liên kết bằng đường dẫn tương đối.

## Mục lục

- 1. ĐẶT TÊN ĐỀ TÀI — trang 1
    - 1.1. Xác định các mục tiêu cho một Website — trang 1
        - 1.1.1. Tại sao tôi cần một Website? — trang 1
        - 1.1.2. Mục tiêu Website là gì? — trang 1
        - 1.1.3. Hiệu quả hoạt động như thế nào? — trang 1
        - 1.1.4. Tiến độ thực hiện như thế nào? — trang 1
        - 1.1.5. Sự khác biệt so với Website khác như thế nào? — trang 2
    - 1.2. Phân tích người dùng Website — trang 2
        - 1.2.1. Ai là người sẽ truy cập Website của tôi? — trang 2
        - 1.2.2. Người dùng sẽ sử dụng chức năng nào của Website? — trang 2
        - 1.2.3. Mức độ quen thuộc với Website như thế nào? — trang 2
        - 1.2.4. Những ai là đối tượng quan trọng của Website? — trang 2
        - 1.2.5. Nhóm tuổi sẽ truy cập Website? — trang 2
        - 1.2.6. Họ sẽ thấy Website của tôi như thế nào? — trang 2
    - 1.3. Phân tích 5 website đẹp liên quan đề tài với các yêu cầu — trang 3
        - 1.3.1. Bố cục giao diện — trang 3
        - 1.3.2. Màu sắc — trang 3
        - 1.3.3. Các chức năng hiện có — trang 3
        - 1.3.4. Lập ma trận so sánh các chức năng — trang 3
- 2. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (Functional Requirements) — trang 5
    - 2.1. Yêu cầu phi chức năng (Non-Functional Requirements) — trang 6
- 3. PHÂN TÍCH ĐỐI TƯỢNG & NHÓM CHỨC NĂNG (PHÂN HỆ) — trang 6
    - 3.1. Danh sách Đối tượng (Entities) — trang 6
    - 3.2. Phân hệ (Nhóm chức năng) — trang 8
- 4. PHÂN TÍCH CHỨC NĂNG ĐẾN TẬN CÙNG (Chức năng con → Module) — trang 10
    - 4.1. Cấu trúc phân rã chức năng — trang 10
    - 4.2. Mô tả Module (IPO – Input / Process / Output) — trang 10
- 5. LUỒNG DỮ LIỆU LIÊN QUAN ĐẾN ĐỐI TƯỢNG & CHỨC NĂNG — trang 15
    - 5.1. Ma trận Đối tượng – Chức năng (CRUD) — trang 15
    - 5.2. Mô tả luồng dữ liệu chính — trang 16
- 6. THIẾT KẾ CƠ SỞ DỮ LIỆU — trang 17
    - 6.1. Danh sách bảng — trang 17
    - 6.2. Chi tiết thuộc tính từng bảng — trang 18
    - 6.3. Sơ đồ quan hệ (ERD) — trang 25
- 7. CHIA & QUẢN LÝ CÔNG VIỆC THEO NHÓM — trang 25
    - 7.1. Phân công vai trò trong nhóm — trang 25
    - 7.2. Cách thức chia công việc theo giai đoạn — trang 26
    - 7.3. Theo dõi công việc — trang 27
## 1. ĐẶT TÊN ĐỀ TÀI

Tên ứng dụng: Xây dựng Website Học tập và Quản lý Đào tạo STEM Robotic cấp Trung học

- Loại hình/Hành động: Xây dựng Website Học tập & Quản lý.

- Chức năng chính: Đào tạo STEM Robotic & Chấm bài tự động.

- Đối tượng: Học sinh & Giáo viên cấp Trung học.

### 1.1. Xác định các mục tiêu cho một Website

#### 1.1.1. Tại sao tôi cần một Website?

- Giải quyết khó khăn trong việc quản lý và tổ chức dạy học môn STEM Robotic tại các trường trung học hiện nay.

- Cung cấp nền tảng tập trung giúp học sinh vừa học lý thuyết, tra cứu linh kiện, vừa thực hành lập trình và nộp bài đa phương tiện.

- Tự động hóa khâu chấm bài tập lập trình nhằm giảm tải khối lượng công việc cho giáo viên

#### 1.1.2. Mục tiêu Website là gì?

- Về phía Học sinh: Tiếp cận lộ trình học STEM bài bản, thực hành lập trình robot, nộp bài (file code, video sản phẩm) và nhận phản hồi chấm tự động lập tức.

- Về phía Giáo viên: Quản lý lớp học, tạo ngân hàng bài tập, quản lý bộ Test Case, duyệt video thực hành và theo dõi phổ điểm của từng học sinh/lớp.

- Về phía Nhà trường / Tổ chuyên môn: Quản lý chương trình học liệu STEM và theo dõi báo cáo thống kê chất lượng giảng dạy toàn trường.

#### 1.1.3. Hiệu quả hoạt động như thế nào?

- Tăng 60% tốc độ chấm bài và trả kết quả nhờ hệ thống tự động kiểm thử code qua Test Case.

- Tăng tính trực quan trong học tập thông qua việc kết hợp chấm code lập trình và kiểm duyệt video robot vận hành thực tế.

- Tối ưu hóa công tác lưu trữ và tra cứu kho học liệu, sơ đồ lắp ráp và mã nguồn mẫu.

#### 1.1.4. Tiến độ thực hiện như thế nào?

- Giai đoạn 1 (Tuần 1 - 2): Thu thập yêu cầu, phân tích bài toán, xác định phân hệ và dựng đặc tả yêu cầu (SRS).

- Giai đoạn 2 (Tuần 3 - 4): Thiết kế sơ đồ BFD, DFD, ERD và ma trận CRUD.

- Giai đoạn 3 (Tuần 5 - 7): Thiết kế giao diện UI/UX (Frontend) và kết nối Cơ sở dữ liệu, API máy chấm bài (Backend).

- Giai đoạn 4 (Tuần 8): Kiểm thử hệ thống (Unit Test, Integration Test) và hoàn thiện báo cáo thuyết minh.

#### 1.1.5. Sự khác biệt so với Website khác như thế nào?

- Tích hợp Máy chấm bài tự động (Judge Engine) dành riêng cho mã nguồn lập trình robot cấp trung học.

- Hỗ trợ Nộp bài đa phương tiện (kết hợp cả file code thuật toán và video minh họa robot hoạt động).

- Quản lý linh kiện phần cứng Robotic gắn liền với từng bài giảng thực hành.

### 1.2. Phân tích người dùng Website

#### 1.2.1. Ai là người sẽ truy cập Website của tôi?

- Học sinh trung học (cấp 2, cấp 3).

- Giáo viên bộ môn Tin học / STEM / Công nghệ.

- Quản trị viên hệ thống (Sub Admin).

- Ban giám hiệu / Tổ trưởng chuyên môn.

- Khách truy cập (Học sinh/Phụ huynh tìm hiểu thông tin).

#### 1.2.2. Người dùng sẽ sử dụng chức năng nào của Website?

- Học sinh: Xem bài giảng, tải code mẫu, nộp file bài làm, dán link video sản phẩm, xem kết quả chấm tự động.

- Giáo viên: Soạn bài tập, upload Test Case, duyệt video thực hành, chốt điểm, xem biểu đồ thống kê.

- Admin: Quản lý tài khoản, phân quyền người dùng, cấu hình máy chấm.

#### 1.2.3. Mức độ quen thuộc với Website như thế nào?

- Học sinh & Giáo viên: Mức độ cơ bản đến trung bình (cần giao diện trực quan, thao tác đơn giản, dễ nộp bài và dễ đăng bài).

- Admin / Chuyên gia: Mức độ thành thạo kỹ thuật cao.

#### 1.2.4. Những ai là đối tượng quan trọng của Website?

- Học sinh (đối tượng sử dụng chính để học tập và thực hành).

- Giáo viên (đối tượng điều hành hoạt động dạy học và đánh giá).

#### 1.2.5. Nhóm tuổi sẽ truy cập Website?

- Học sinh: 12 – 18 tuổi.

- Giáo viên & Quản lý: 23 – 60 tuổi.

#### 1.2.6. Họ sẽ thấy Website của tôi như thế nào?

- Giao diện hiện đại, mang phong cách công nghệ / STEM năng động.

- Màu sắc hài hòa, bố cục rõ ràng, điều hướng dễ dàng giữa các mục Bài học – Bài tập – Tra cứu linh kiện.

### 1.3. Phân tích 5 website đẹp liên quan đề tài với các yêu cầu

#### 1.3.1. Bố cục giao diện

- Apple & Nike: Bố cục dạng thẻ/khối tối giản và dạng lưới (Grid layout) linh hoạt; ưu tiên khoảng trắng thoáng mắt, sử dụng hình ảnh sản phẩm chất lượng cao siêu to tràn màn hình để thu hút sự chú ý.

- Canva: Bố cục Dashboard chia làm 2 cột chính (Menu công cụ cố định bên trái, danh mục bài mẫu và không gian thiết kế bên phải), hiển thị các thẻ nội dung gọn gàng, trực quan.

- Airbnb: Thanh tìm kiếm thông minh được đặt làm trung tâm ở đầu trang; bố cục hiển thị danh sách phòng/trải nghiệm dạng thẻ lưới có bo góc thân thiện, giúp tìm kiếm trơn tru.

- Spotify: Bố cục dạng bảng điều khiển đa phương tiện (Sidebar quản lý thư viện bên trái, khung phát nhạc/danh sách bài hát ở giữa và thanh điều khiển cố định bên dưới).

#### 1.3.2. Màu sắc

- Tông màu trung tính, sang trọng (Apple, Nike): Sử dụng gam màu Đen - Trắng - Xám làm nền để làm nổi bật tối đa hình ảnh sản phẩm; kết hợp phông chữ (Typography) to đậm, năng động.

- Tông màu tươi sáng, sáng tạo (Canva): Phối hợp hài hòa các gam màu Pastel nhẹ nhàng (Tím, Xanh dương, Vàng) tạo cảm giác thân thiện, truyền cảm hứng học tập và sáng tạo.

- Tông màu nhận diện nổi bật (Spotify, Airbnb): Spotify sử dụng nền tối (Dark mode) kết hợp màu Xanh lá Neon thương hiệu; Airbnb sử dụng nền Trắng điểm xuyết màu Hồng Đỏ (Rausch) thu hút.

#### 1.3.3. Các chức năng hiện có

- Trình diễn đa phương tiện trực quan: Hiển thị hình ảnh/video chất lượng cao, các banner động quảng bá sản phẩm/bài học.

- Quản lý tài khoản & Phân quyền người dùng: Đăng nhập, đăng ký, quản lý thông tin cá nhân và lịch sử hoạt động.

- Bộ lọc & Tìm kiếm thông minh: Tìm kiếm nhanh theo từ khóa, lọc theo danh mục (như bộ lọc của Nike, Airbnb, Canva).

- Không gian làm việc tương tác (Workplace): Cho phép người dùng thao tác kéo thả, tạo nội dung trực tuyến (Canva) hoặc lưu trữ danh sách cá nhân (Spotify).

#### 1.3.4. Lập ma trận so sánh các chức năng

| Chức năng | Apple | Nike | Canva | Airbnb | Spotify | Website STEM Robotic (Đề xuất) |
| --- | --- | --- | --- | --- | --- | --- |
| Bố cục dạng lưới/thẻ (Card view) tối giản | Có | Có | Có | Có | Có | Có |
| Hiển thị đa phương tiện (Hình ảnh/Video) trực quan | Có | Có | Có | Có | Có | Có |
| Quản lý tài khoản & Phân quyền người dùng | Có | Có | Có | Có | Có | Có |
| Quản lý danh mục bài học & Tra cứu linh kiện STEM | Không | Không | Có | Không | Không | Có |
| Chấm bài code tự động & Duyệt video sản phẩm Robot | Không | Không | Không | Không | Không | Có |

- Nhận xét: Việc phân tích 5 website đẹp (Apple, Nike, Canva, Airbnb, Spotify) giúp hệ thống STEM Robotic học hỏi tư duy thiết kế giao diện UI/UX hiện đại, bố cục thoáng mắt và phối màu chuẩn nhận diện thương hiệu. Từ đó, website của nhóm vừa đảm bảo tính thẩm mỹ cao, vừa tối ưu trải nghiệm học tập và chấm bài cho học sinh, giáo viên.

## 2. ĐẶC TẢ YÊU CẦU CHỨC NĂNG (Functional Requirements)

| Mã YC | Tên yêu cầu | Mô tả chi tiết | Ưu tiên | Nguồn |
| --- | --- | --- | --- | --- |
| FR-01 | Đăng ký & Đăng nhập | Cho phép người dùng đăng nhập/đăng xuất vào hệ thống theo vai trò (Học sinh, Giáo viên, Admin). | Cao | MOD-01 |
| FR-02 | Quản lý Hồ sơ cá nhân | Cho phép người dùng cập nhật thông tin cá nhân, đổi mật khẩu và xem thông tin lớp học. | Trung bình | MOD-01 |
| FR-03 | Tra cứu Bài giảng & Linh kiện | Học sinh xem danh sách bài học STEM, tra cứu sơ đồ nguyên lý và thông số linh kiện Robotic. | Cao | MOD-02 |
| FR-04 | Tải Học liệu & Code mẫu | Cho phép người dùng xem và tải về các đoạn mã nguồn mẫu (.ino, .py) và tài liệu hướng dẫn. | Cao | MOD-02 |
| FR-05 | Tạo & Giao bài tập STEM | Giáo viên tạo đề bài thực hành, thiết lập thời hạn nộp (deadline) và đính kèm bộ Test Case. | Cao | MOD-03 |
| FR-06 | Nộp bài thực hành đa phương tiện | Học sinh tải lên file mã nguồn và dán liên kết video quay lại quá trình robot vận hành. | Cao | MOD-04 |
| FR-07 | Chấm bài lập trình tự động | Hệ thống tự động chuyển file code tới máy chấm, chạy bộ Test Case và trả về kết quả điểm số/log lỗi. | Cao | MOD-04 |
| FR-08 | Duyệt & Chốt điểm bài tập | Giáo viên xem video sản phẩm robot, nhập nhận xét chi tiết và chốt điểm tổng hợp. | Cao | MOD-04 |
| FR-09 | Báo cáo & Thống kê điểm số | Xuất báo cáo danh sách điểm, thống kê phổ điểm theo lớp/khoá học cho Giáo viên và BGH. | Trung bình | MOD-05 |
| FR-10 | Diễn đàn Hỏi đáp & Tương tác | Cho phép học sinh và giáo viên tạo chủ đề thảo luận, trao đổi về các lỗi lập trình robot. | Thấp | MOD-06 |

### 2.1. Yêu cầu phi chức năng (Non-Functional Requirements)

| Mã NFR | Tên yêu cầu | Mô tả chi tiết |
| --- | --- | --- |
| NFR-01 | Hiệu năng (Performance) | Thời gian phản hồi trang web < 2 giây; Hệ thống máy chấm tự động trả kết quả trong vòng < 10 giây kể từ khi học sinh nộp code. |
| NFR-02 | An toàn & Bảo mật (Security) | Mã hóa mật khẩu người dùng (Bcrypt/SHA-256); Phân quyền chặt chẽ theo vai trò (Học sinh, Giáo viên, Admin). |
| NFR-03 | Tương thích & Giao diện (Usability) | Giao diện Responsive hiển thị mượt mà trên cả Máy tính cá nhân (Desktop), Máy tính bảng (Tablet) và Điện thoại. |
| NFR-04 | Độ tin cậy (Reliability) | Hệ thống hoạt động ổn định 99.5%, tự động sao lưu dữ liệu bài nộp và log chấm định kỳ. |

## 3. PHÂN TÍCH ĐỐI TƯỢNG & NHÓM CHỨC NĂNG (PHÂN HỆ)

### 3.1. Danh sách Đối tượng (Entities)

| Mã đối tượng | Tên đối tượng | Mô tả | Thuộc tính chính | Quan hệ với đối tượng khác |
| --- | --- | --- | --- | --- |
| ENT-01 | TAI_KHOAN | Lưu thông tin tài khoản người dùng | MaTaiKhoan, TenNguoiDung, Email, MatKhau, VaiTro, NgayDangKy, TrangThai | Là đối tượng được CHU_DE_HOC, BAI_TAP, BAI_NOP, THAO_LUAN, BINH_CHON, SU_CO và BAO_CAO_THONG_KE tham chiếu thông qua khóa ngoại. |
| ENT-02 | CHU_DE_HOC | Lưu thông tin chủ đề học | MaChuDe, MaNguoiTao, TenChuDe, MoTa | Liên kết với TAI_KHOAN thông qua MaNguoiTao; được HOC_LIEU và BAI_TAP tham chiếu thông qua MaChuDe. |
| ENT-03 | HOC_LIEU | Lưu thông tin học liệu | MaHocLieu, MaChuDe, TieuDe, LoaiHocLieu, URL_File | Liên kết với CHU_DE_HOC thông qua MaChuDe. |
| ENT-04 | BAI_TAP | Lưu thông tin bài tập | MaBaiTap, MaChuDe, MaGiaoVien, TenBaiTap, MoTa, HanNop, DoKho | Liên kết với CHU_DE_HOC và TAI_KHOAN (giáo viên); được TEST_CASE, BAI_NOP và THAO_LUAN tham chiếu. |
| ENT-05 | TEST_CASE | Lưu dữ liệu kiểm thử bài tập | MaTestCase, MaBaiTap, DuLieuInput, KetQuaOutput, TrongSoDiem | Liên kết với BAI_TAP thông qua MaBaiTap. |
| ENT-06 | BAI_NOP | Lưu thông tin bài nộp của học sinh | MaBaiNop, MaHocSinh, MaBaiTap, ThoiDiemNop, FileCode, URL_VideoVanHanh, TrangThai, DiemTong | Liên kết với TAI_KHOAN (học sinh) và BAI_TAP; được KET_QUA_CHAM và BINH_CHON tham chiếu. |
| ENT-07 | MAY_CHAM | Lưu thông tin máy chấm tự động | MaMay, DiaChiAPI, TrangThai | Được KET_QUA_CHAM tham chiếu thông qua MaMay. |
| ENT-08 | KET_QUA_CHAM | Lưu kết quả chấm bài | MaKetQua, MaBaiNop, MaMay, LogLoi, ThoiGianChay_ms, TrangThai | Liên kết với BAI_NOP và MAY_CHAM. |
| ENT-09 | THAO_LUAN | Lưu thông tin thảo luận | MaThaoLuan, MaNguoiTao, MaBaiTap, TieuDe, NoiDung, ThoiDiemTao | Liên kết với TAI_KHOAN và BAI_TAP. |
| ENT-10 | BINH_CHON | Lưu thông tin bình chọn | MaBinhChon, MaBaiNop, MaTaiKhoan, ThoiDiemVote | Liên kết với BAI_NOP và TAI_KHOAN. |
| ENT-11 | SU_CO | Lưu thông tin sự cố | MaSuCo, MaNguoiBaoCao, LoaiSuCo, MoTa, ThoiDiemXayRa, TrangThaiXuLy | Liên kết với TAI_KHOAN thông qua MaNguoiBaoCao. |
| ENT-12 | BAO_CAO_THONG_KE | Lưu thông tin báo cáo thống kê | MaBaoCao, MaNguoiTao, TenBaoCao, LoaiBaoCao, NgayTao, NoiDungTongHop, DuongDanFile, TrangThaiXuLy | Liên kết với TAI_KHOAN thông qua MaNguoiTao. |

### 3.2. Phân hệ (Nhóm chức năng)

| Mã phân hệ | Tên phân hệ | Mục đích | Chức năng chính | Đối tượng liên quan |
| --- | --- | --- | --- | --- |
| MOD-01 | Quản lý Hệ thống & Người dùng | Quản lý tài khoản, hồ sơ và quyền truy cập. | 1.1 Quản lý tài khoản;<br>1.2 Quản trị hệ thống & Hồ sơ. | Học sinh, Giáo viên, Admin |
| MOD-02 | Quản lý Học liệu & Khóa học | Quản lý, tra cứu và phân phối học liệu. | 2.1 Quản trị nội dung học liệu;<br>2.2 Tra cứu & Phân phối học liệu. | Học sinh, Giáo viên |
| MOD-03 | Quản lý Dự án & Tiến độ | Giao dự án, theo dõi tiến độ và tổ chức kiểm tra. | 3.1 Tổ chức Dự án & Lộ trình;<br>3.2 Kiểm tra & Đánh giá. | Học sinh, Giáo viên |
| MOD-04 | Xử lý bài nộp & Đánh giá | Tiếp nhận bài nộp, chấm tự động và đánh giá. | 4.1 Tiếp nhận & Chấm tự động;<br>4.2 Đánh giá Kết quả & Phản hồi. | Học sinh, Giáo viên, Máy chấm |
| MOD-05 | Báo cáo, Thống kê | Thống kê kết quả và xuất báo cáo học tập. | 5.1 Thống kê Hiệu suất & Lỗi;<br>5.2 Xuất Báo cáo. | Giáo viên, Admin |
| MOD-06 | Tương tác cộng đồng & Bảo trì hệ thống | Hỗ trợ thảo luận, bình chọn và xử lý sự cố. | 6.1 Tương tác & Vinh danh Cộng đồng;<br>6.2 Hỗ trợ Kỹ thuật & Thông báo. | Học sinh, Giáo viên, Khách, Admin |

![](PRODUCT_assets/image_04.png)

Sơ đồ ER –ERD

## 4. PHÂN TÍCH CHỨC NĂNG ĐẾN TẬN CÙNG (Chức năng con → Module)

### 4.1. Cấu trúc phân rã chức năng

![](PRODUCT_assets/image_03.png)

Sơ đồ BFD

### 4.2. Mô tả Module (IPO – Input / Process / Output)

| Tên Phân hệ (Cấp 1) | Chức năng (Cấp 2) | Mã MĐ | Tên Mô đun (Cấp 3) | Dữ liệu đầu vào (Input) | Dữ liệu đầu ra (Output) |
| --- | --- | --- | --- | --- | --- |
| 1. Quản lý Hệ thống & Người dùng | 1.1 Quản lý tài khoản | QLTK.01 | Đăng ký & Kích hoạt tài khoản | Họ tên, Email, Mật khẩu, Mã OTP/Link xác thực. | Khởi tạo tài khoản Học sinh (Trạng thái: Đang hoạt động). |
| 1. Quản lý Hệ thống & Người dùng | 1.1 Quản lý tài khoản | QLTK.02 | Đăng nhập & Quản lý phiên | Email, Mật khẩu. | Phiên làm việc (Session) tương ứng với Vai trò (Role). |
| 1. Quản lý Hệ thống & Người dùng | 1.1 Quản lý tài khoản | QLTK.03 | Khôi phục mật khẩu (Quên MK) | Email đăng ký, Mã OTP xác thực. | Yêu cầu đổi mật khẩu mới thành công. |
| 1. Quản lý Hệ thống & Người dùng | 1.2 Quản trị hệ thống & Hồ sơ | QTHT.01 | Phân quyền & Giới hạn tính năng | Lệnh phân quyền từ Admin, Mã người dùng, Vai trò. | Cập nhật quyền hạn cho tài khoản Giáo viên/Cán bộ. |
| 1. Quản lý Hệ thống & Người dùng | 1.2 Quản trị hệ thống & Hồ sơ | QTHT.02 | Tra cứu & Cập nhật hồ sơ | Các trường thông tin cá nhân cần sửa (Avatar, SĐT). | Hồ sơ được cập nhật lưu vào CSDL. |
| 1. Quản lý Hệ thống & Người dùng | 1.2 Quản trị hệ thống & Hồ sơ | QTHT.03 | Vô hiệu hóa tài khoản (Khóa/Xóa) | Mã người dùng, Lệnh khóa từ Admin, Lý do. | Tài khoản chuyển trạng thái 'Đã khóa/Ngừng hoạt động'. |
| 2. Quản lý Học liệu & Khóa học | 2.1 Quản trị nội dung học liêu | QTHL.01 | Thêm mới bài giảng & Code mẫu | Text, Video, Sơ đồ lắp ráp (3D), File code mẫu từ GV. | Lưu học liệu mới vào hệ thống (Trạng thái: Bản nháp / Xuất bản). |
| 2. Quản lý Học liệu & Khóa học | 2.1 Quản trị nội dung học liêu | QTHL.02 | Cập nhật / Ẩn học liệu | Mã bài học, Nội dung sửa đổi, Lệnh Ẩn/Hiện. | Bài học được cập nhật hoặc ẩn khỏi người dùng cuối. |
| 2. Quản lý Học liệu & Khóa học | 2.2 Tra cứu & Phân phối học liệu | TCPP.01 | Hiển thị danh mục & Lộ trình học | Tín hiệu truy cập của người dùng. | Cây thư mục chủ đề (Cơ khí, Mạch điện, Lập trình). |
| 2. Quản lý Học liệu & Khóa học | 2.2 Tra cứu & Phân phối học liệu | TCPP.02 | Tra cứu linh kiện & Bắt lỗi code | Từ khóa (Tên linh kiện, Dòng mã lỗi). | Danh sách kết quả tài liệu hoặc mẹo sửa lỗi tương ứng. |
| 3. Quản lý Dự án & Tiến độ | 3.1 Tổ chức Dự án & Lộ trình | QLDA.01 | Giao dự án thực hành | Tên dự án, File yêu cầu, Hạn chót (Deadline), Danh sách lớp/nhóm. | Bài tập hiển thị lên Dashboard của Học sinh. |
| 3. Quản lý Dự án & Tiến độ | 3.1 Tổ chức Dự án & Lộ trình | QLDA.02 | Mở khóa thử thách nâng cao | Kết quả chấm điểm bài trước đó đạt mức Pass (Tự động). | Dự án cấp độ khó hơn được mở khóa cho học sinh. |
| 3. Quản lý Dự án & Tiến độ | 3.2 Kiểm tra & Đánh giá | KTĐG.01 | Theo dõi tiến độ học tập | Lựa chọn Lớp / Nhóm học sinh từ GV. | Bảng thống kê % hoàn thành lộ trình của từng cá nhân. |
| 3. Quản lý Dự án & Tiến độ | 3.2 Kiểm tra & Đánh giá | KTĐG.02 | Tổ chức thi trực tuyến | Đề thi, Thời gian mở/đóng, Danh sách thí sinh. | Giao diện phòng thi khép kín. |
| 4. Xử lý bài nộp & Đánh giá | 4.1 Tiếp nhận & Chấm tự động | XLBN.01 | Nhận bài nộp đa phương tiện | File Code (.cpp, .py) và Video vận hành robot thực tế. | Bài nộp chuyển sang trạng thái "Đang chấm tự động". |
| 4. Xử lý bài nộp & Đánh giá | 4.1 Tiếp nhận & Chấm tự động | XLBN.02 | Biên dịch & Chạy Test Cases | Source Code từ HS và Bộ dữ liệu kiểm thử (Test Cases) từ GV. | Output thực tế đối chiếu với Output chuẩn. |
| 4. Xử lý bài nộp & Đánh giá | 4.1 Tiếp nhận & Chấm tự động | XLBN.03 | Trả kết quả Code & Báo lỗi | Kết quả chấm tự động từ mô đun XLBN.02. | Điểm số Code, highlight dòng code lỗi. |
| 4. Xử lý bài nộp & Đánh giá | 4.2 Đánh giá Kết quả & Phản hồi | KQBN.01 | Kiểm duyệt Video Vận hành | Thông báo chờ duyệt, Video HS, Tiêu chí chấm từ GV. | Điểm số thực tế (Pass/Fail) của khâu lắp ráp phần cứng. |
| 4. Xử lý bài nộp & Đánh giá | 4.2 Đánh giá Kết quả & Phản hồi | KQBN.02 | Chốt điểm & Lưu minh chứng | Quyết định cuối cùng và Nhận xét (Feedback) từ GV. | Hồ sơ điểm lưu vào Database, hiển thị điểm cho HS. |
| 5. Báo cáo, Thống kê | 5.1 Thống kê Hiệu suất & Lỗi | TKDL.01 | Thống kê kết quả nộp bài | Dữ liệu điểm số, tỷ lệ nộp đúng hạn từ Phân hệ 4. | Biểu đồ tròn/cột về tiến độ và chất lượng lớp học. |
| 5. Báo cáo, Thống kê | 5.1 Thống kê Hiệu suất & Lỗi | TKDL.02 | Phân tích Log lỗi lập trình | Dữ liệu lỗi (Syntax, Logic) thu thập ngầm từ máy chấm XLBN.02. | Bảng xếp hạng các lỗi lập trình/lắp ráp phổ biến nhất. |
| 5. Báo cáo, Thống kê | 5.2 Xuất Báo cáo | XBC.01 | Báo cáo & Đánh giá chủ đề | Số lượt view, làm bài, vote yêu thích của các chủ đề. | Danh sách Top Trending Chủ đề và File xuất (Excel/PDF). |
| 5. Báo cáo, Thống kê | 5.2 Xuất Báo cáo | XBC.02 | Xuất file điểm & Kết quả học tập | Tiêu chí lọc từ Giáo viên (Lớp, Học kỳ, Loại file xuất: Excel/PDF). | File báo cáo tổng hợp điểm số, % hoàn thành khóa học của từng học sinh. |
| 6. Tương tác cộng đồng & Bảo trì hệ thống | 6.1 Tương tác & Vinh danh Cộng đồng | TTCĐ.01 | Thảo luận & Chia sẻ lỗi | Text bình luận, hình ảnh, mã lỗi, video. | Topic thảo luận được tạo trên diễn đàn hệ thống. |
| 6. Tương tác cộng đồng & Bảo trì hệ thống | 6.1 Tương tác & Vinh danh Cộng đồng | TTCĐ.02 | Bình chọn & Vinh danh dự án | Lượt Vote/Like từ cộng đồng, Danh sách dự án xuất sắc. | Xếp hạng dự án, trưng bày tại khu vực "Wall of Fame". |
| 6. Tương tác cộng đồng & Bảo trì hệ thống | 6.2 Hỗ trợ Kỹ thuật & Thông báo | HTTB.01 | Quản lý Phản hồi Sự cố | Lỗi báo cáo từ người dùng (Ticket lỗi web, bài sai). | Cảnh báo đẩy về hệ thống của Admin / Kỹ thuật viên. |
| 6. Tương tác cộng đồng & Bảo trì hệ thống | 6.2 Hỗ trợ Kỹ thuật & Thông báo | HTTB.02 | Thông báo hệ thống bảo trì, cập nhật | Nội dung thông báo từ Admin, Nhóm đối tượng nhận (All / GV / HS), Lịch gửi dự kiến. | Banner/Pop-up hiển thị trên giao diện hoặc thông báo đẩy về tài khoản. |

![](PRODUCT_assets/image_02.png)

Sơ đồ quy trình xử lý tổng thể

## 5. LUỒNG DỮ LIỆU LIÊN QUAN ĐẾN ĐỐI TƯỢNG & CHỨC NĂNG

### 5.1. Ma trận Đối tượng – Chức năng (CRUD)

| Đối tượng \ Chức năng | Tạo (C) | Đọc (R) | Cập nhật (U) | Xóa (2D) | Ghi chú |
| --- | --- | --- | --- | --- | --- |
| Người dùng | HS, GV, Admin | HS, GV, Admin | HS, GV, Admin | Admin | Quản lý tài khoản, hồ sơ và phân quyền. |
| Học liệu | GV | HS, GV, Admin | GV | GV | Bao gồm bài giảng, tài liệu, code mẫu và danh mục học liệu. |
| Khóa học / Lộ trình | GV, HT | HS, GV | GV, HT | GV | Tổ chức nội dung học theo chủ đề và cấp độ. |
| Dự án / Bài tập | GV | HS, GV | GV | GV | Giao dự án, thiết lập hạn nộp và mở khóa thử thách. |
| Bài thi | GV | HS, GV | GV | GV | Quản lý đề thi, thời gian và danh sách thí sinh. |
| Bài nộp | HS | HS, GV | HS | HT | Gồm Code và Video; kiểm tra dữ liệu trước khi chuyển chấm. |
| Kết quả / Điểm | HT, GV | HS, GV | GV, HT | Không áp dụng | Lưu kết quả chấm Code, duyệt Video, điểm và nhận xét. |
| Báo cáo / Thống kê | HT, GV | GV, Admin | HT | Không áp dụng | Tổng hợp tiến độ, kết quả học tập và lỗi lập trình. |
| Nội dung cộng đồng | HS, GV | HS, GV, KH | HS, GV | HS, GV | Gồm chủ đề thảo luận, chia sẻ lỗi và bình chọn dự án. |
| Hỗ trợ / Thông báo | HS, GV, Admin, HT | HS, GV, Admin | Admin | Admin | Gồm phiếu phản hồi sự cố và thông báo hệ thống. |

### 5.2. Mô tả luồng dữ liệu chính

| Mã luồng | Tên luồng | Từ | Đến | Dữ liệu trao đổi | Điều kiện |
| --- | --- | --- | --- | --- | --- |
| DF-01 | Chấm Code Đạt -> Duyệt Video | (XLBN.03) Trả kết quả Code & Báo lỗi | (KQBN.01) Kiểm duyệt Video Vận hành | Code phải chạy đúng 100% Test Case, hệ thống mới chuyển trạng thái sang "Chờ duyệt Video" và báo cho GV. | GV không tốn thời gian xem video phần cứng của học sinh nếu phần mềm (Code) viết sai. |
| DF-02 | Chốt điểm -> Mở khóa bài mới | (KQBN.02) Chốt điểm & Lưu minh chứng | (QLDA.02) Mở khóa thử thách nâng cao | Khi hồ sơ điểm ghi nhận mức Đạt, hệ thống tự động tháo khóa dự án cấp độ khó hơn tiếp theo. | Tạo lộ trình học tập liền mạch, cá nhân hóa mà Giáo viên không cần click duyệt thủ công. |
| DF-03 | Chốt điểm, mở khóa bài mới -> Phân tích chủ đề được học sinh thích làm và có kết quả tốt nhất | (QLDA.02) Mở khóa thử thách nâng cao | (XBC.01) Báo cáo & Đánh giá chủ đề | Hệ thống tự động trích xuất dữ liệu tần suất hoàn thành bài tập (Pass rate) để cập nhật bảng xếp hạng "Top Trending" các chủ đề theo thời gian thực. | Cung cấp Insight ngay lập tức cho Giáo viên để biết chủ đề Robotic nào đang hấp dẫn và phù hợp với năng lực học sinh nhất. |
| DF-04 | Lỗi Code -> Phân tích điểm yếu | (XLBN.02) Biên dịch & Chạy Test Cases | (TKDL.02) Phân tích Log lỗi lập trình | Bắt ngầm các mã lỗi (Syntax, Logic) từ máy chấm tự động đẩy thẳng về Database thống kê. | Giúp GV nhận biết ngay lập tức số đông cả lớp đang yếu mảng kiến thức lập trình nào nhất. |
| DF-05 | Phân tích điểm yếu -> Ghi log và cập nhật học liệu (Giáo viên chủ động) | (TKDL.02) Phân tích Log lỗi lập trình | (QTHL.02) Cập nhật / Ẩn học liệu | Khi một mã lỗi xuất hiện vượt ngưỡng (VD: > 30% lớp mắc phải), hệ thống tự động gắn cờ (Flag) bài giảng và nhắc GV bổ sung tài liệu hướng dẫn. | Tạo ra vòng lặp cải tiến chất lượng giảng dạy. Bài giảng luôn được cập nhật và khắc phục đúng vào điểm yếu của học sinh. |
| DF-06 | Gian lận -> Cảnh cáo (có giới hạn) -> Khóa bài thi | (KTĐG.02) Tổ chức thi trực tuyến | (KTĐG.02) Tổ chức thi trực tuyến | JS Tracking bắt sự kiện Window Focus. Nếu thí sinh chuyển Tab quá 3 lần sẽ bị hệ thống cảnh cáo, nếu tiếp diễn thì tự động khóa nộp bài. | Đảm bảo tính công bằng khi kiểm tra trực tuyến, khả thi hơn việc cài phần mềm chặn tab. |
| DF-07 | Khóa TK -> Giữ nguyên Lịch sử | (QTHT.03) Vô hiệu hóa tài khoản (Khóa/Xóa) | (TKDL.01) Thống kê kết quả nộp bài | Khi Admin khóa tài khoản (Soft Delete), ID học sinh bị ẩn nhưng vẫn giữ nguyên điểm các bài đã nộp. | Không làm sụt giảm tổng số lượng bài tập và tỷ lệ hoàn thành trên Dashboard của Giáo viên. |

## 6. THIẾT KẾ CƠ SỞ DỮ LIỆU

### 6.1. Danh sách bảng

| Tên bảng | Mô tả | Khóa chính | Khóa ngoại | Ghi chú |
| --- | --- | --- | --- | --- |
| Người dùng | Lưu tài khoản, thông tin cá nhân và vai trò của học sinh, giáo viên, quản trị viên. | Mã người dùng | Không có | Quản lý đăng nhập, phân quyền và khóa tài khoản. |
| Học liệu | Lưu bài giảng, tài liệu, video, sơ đồ lắp ráp và mã nguồn mẫu. | Mã học liệu | Mã người dùng | Giáo viên tạo và cập nhật học liệu. |
| Khóa học / Lộ trình | Quản lý danh mục chủ đề, khóa học và thứ tự các nội dung học tập. | Mã lộ trình | Mã học liệu | Hỗ trợ phân loại theo cấp độ và chủ đề. |
| Dự án / Bài tập | Lưu thông tin dự án thực hành, yêu cầu, hạn nộp và điều kiện mở khóa. | Mã dự án | Mã người dùng, Mã lộ trình | Giáo viên giao dự án cho học sinh. |
| Bài thi | Quản lý đề thi, thời gian thi và thông tin tổ chức thi trực tuyến. | Mã bài thi | Mã người dùng | Theo dõi thời gian và hành vi chuyển tab. |
| Bài nộp | Lưu mã nguồn, video vận hành robot và trạng thái nộp bài. | Mã bài nộp | Mã người dùng, Mã dự án, Mã bài thi | Bắt buộc nộp đủ Code và Video theo yêu cầu. |
| Kết quả / Điểm | Lưu kết quả chấm Code, kiểm duyệt Video, điểm số và nhận xét. | Mã kết quả | Mã bài nộp, Mã người dùng | Kết quả được sử dụng để mở khóa lộ trình. |
| Báo cáo / Thống kê | Tổng hợp tiến độ học tập, kết quả bài nộp và lỗi lập trình. | Mã báo cáo | Mã người dùng | Hỗ trợ thống kê và xuất báo cáo. |
| Nội dung cộng đồng | Quản lý chủ đề thảo luận, chia sẻ lỗi và bình chọn dự án. | Mã nội dung | Mã người dùng, Mã dự án | Hỗ trợ tương tác và vinh danh dự án. |
| Hỗ trợ / Thông báo | Quản lý phản hồi sự cố và thông báo bảo trì, cập nhật hệ thống. | Mã hỗ trợ | Mã người dùng | Theo dõi trạng thái xử lý và gửi thông báo. |
| Dữ liệu kiểm thử (Test Case) | Lưu trữ bộ dữ liệu đầu vào (Input) và kết quả chuẩn (Output) để đối chiếu khi chấm code. | Mã Test Case | Mã dự án | Giáo viên thiết lập để làm tiêu chí chấm điểm tự động cho học sinh. |
| Máy chấm tự động (Judge) | Lưu thông tin cấu hình, ngôn ngữ hỗ trợ và địa chỉ API của server thực thi mã nguồn. | Mã máy chấm | Không có | Tiếp nhận code từ hệ thống, chạy thử với Test Case và trả về kết quả. |

### 6.2. Chi tiết thuộc tính từng bảng

Bảng: [Người dùng]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã người dùng | INT | Không | Tự tăng | Mã định danh người dùng | PK |
| Họ tên | VARCHAR(100) | Không | Không | Họ và tên người dùng |  |
| Email | VARCHAR(150) | Không | Không | Email đăng nhập | UNIQUE |
| Mật khẩu | VARCHAR(255) | Không | Không | Mật khẩu đã mã hóa |  |
| Vai trò | VARCHAR(20) | Không | Học sinh | Vai trò người dùng |  |
| Số điện thoại | VARCHAR(15) | Có | NULL | Số điện thoại liên hệ |  |
| Ảnh đại diện | VARCHAR(255) | Có | NULL | Đường dẫn ảnh đại diện |  |
| Trạng thái | VARCHAR(30) | Không | Đang hoạt động | Trạng thái tài khoản |  |
| Ngày tạo | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm tạo tài khoản |  |

Bảng: [Học liệu]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã học liệu | INT | Không | Tự tăng | Mã định danh học liệu | PK |
| Mã người dùng | INT | Không | Không | Giáo viên tạo học liệu | FK |
| Tên học liệu | VARCHAR(200) | Không | Không | Tên bài giảng hoặc tài liệu |  |
| Loại học liệu | VARCHAR(50) | Không | Không | Phân loại tài liệu, video, Code |  |
| Nội dung | TEXT | Có | NULL | Nội dung bài giảng |  |
| Đường dẫn tệp | VARCHAR(255) | Có | NULL | Đường dẫn tài liệu hoặc video |  |
| Trạng thái | VARCHAR(30) | Không | Bản nháp | Trạng thái xuất bản |  |
| Ngày tạo | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm tạo học liệu |  |

Bảng: [Khóa học / Lộ trình]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã lộ trình | INT | Không | Tự tăng | Mã định danh lộ trình | PK |
| Mã học liệu | INT | Có | NULL | Học liệu thuộc lộ trình | FK |
| Tên lộ trình | VARCHAR(200) | Không | Không | Tên khóa học hoặc lộ trình |  |
| Chủ đề | VARCHAR(100) | Không | Không | Cơ khí, mạch điện, lập trình |  |
| Cấp độ | VARCHAR(50) | Không | Cơ bản | Mức độ học tập |  |
| Thứ tự học | INT | Không | 1 | Thứ tự nội dung trong lộ trình |  |
| Mô tả | TEXT | Có | NULL | Nội dung giới thiệu lộ trình |  |
| Trạng thái | VARCHAR(30) | Không | Đang hoạt động | Trạng thái lộ trình |  |

Bảng: [Dự án / Bài tập]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã dự án | INT | Không | Tự tăng | Mã định danh dự án | PK |
| Mã người dùng | INT | Không | Không | Giáo viên giao dự án | FK |
| Mã lộ trình | INT | Có | NULL | Lộ trình liên quan | FK |
| Tên dự án | VARCHAR(200) | Không | Không | Tên dự án thực hành |  |
| Yêu cầu dự án | TEXT | Không | Không | Nội dung và yêu cầu thực hiện |  |
| Ngày giao | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm giao dự án |  |
| Hạn nộp | DATETIME | Không | Không | Thời hạn hoàn thành |  |
| Cấp độ | VARCHAR(50) | Không | Cơ bản | Độ khó của dự án |  |
| Trạng thái | VARCHAR(30) | Không | Đang mở | Trạng thái dự án |  |

Bảng: [Bài thi]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã bài thi | INT | Không | Tự tăng | Mã định danh bài thi | PK |
| Mã người dùng | INT | Không | Không | Giáo viên tổ chức bài thi | FK |
| Tên bài thi | VARCHAR(200) | Không | Không | Tên bài thi |  |
| Nội dung đề thi | TEXT | Không | Không | Nội dung và yêu cầu bài thi |  |
| Thời gian bắt đầu | DATETIME | Không | Không | Thời điểm mở bài thi |  |
| Thời gian kết thúc | DATETIME | Không | Không | Thời điểm đóng bài thi |  |
| Thời lượng | INT | Không | Không | Thời gian làm bài tính bằng phút |  |
| Số lần chuyển tab | INT | Không | 0 | Số lần học sinh chuyển tab |  |
| Trạng thái | VARCHAR(30) | Không | Chưa mở | Trạng thái bài thi |  |

Bảng: [Bài nộp]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã bài nộp | INT | Không | Tự tăng | Mã định danh bài nộp | PK |
| Mã người dùng | INT | Không | Không | Học sinh thực hiện bài nộp | FK |
| Mã dự án | INT | Có | NULL | Dự án được thực hiện | FK |
| Mã bài thi | INT | Có | NULL | Bài thi liên quan | FK |
| Mã nguồn | VARCHAR(255) | Không | Không | Đường dẫn tệp Code |  |
| Video vận hành | VARCHAR(255) | Không | Không | Đường dẫn video robot |  |
| Thời gian nộp | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm nộp bài |  |
| Trạng thái | VARCHAR(30) | Không | Đang chấm | Trạng thái xử lý bài nộp |  |

Bảng: [Kết quả / Điểm]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã kết quả | INT | Không | Tự tăng | Mã định danh kết quả | PK |
| Mã bài nộp | INT | Không | Không | Bài nộp được đánh giá | FK |
| Mã người dùng | INT | Không | Không | Giáo viên đánh giá | FK |
| Điểm Code | DECIMAL(5,2) | Có | NULL | Điểm chấm tự động |  |
| Kết quả Code | VARCHAR(30) | Có | NULL | Đạt hoặc không đạt |  |
| Kết quả Video | VARCHAR(30) | Có | NULL | Kết quả kiểm duyệt video |  |
| Tổng điểm | DECIMAL(5,2) | Có | NULL | Điểm tổng kết |  |
| Nhận xét | TEXT | Có | NULL | Nhận xét của giáo viên |  |
| Ngày chốt điểm | DATETIME | Có | NULL | Thời điểm hoàn tất đánh giá |  |

Bảng: [Báo cáo / Thống kê]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã báo cáo | INT | Không | Tự tăng | Mã định danh báo cáo | PK |
| Mã người dùng | INT | Không | Không | Người tạo hoặc yêu cầu báo cáo | FK |
| Loại báo cáo | VARCHAR(100) | Không | Không | Báo cáo điểm, tiến độ, lỗi |  |
| Dữ liệu thống kê | TEXT | Có | NULL | Nội dung dữ liệu tổng hợp |  |
| Định dạng tệp | VARCHAR(20) | Có | NULL | Excel hoặc PDF |  |
| Đường dẫn tệp | VARCHAR(255) | Có | NULL | Vị trí lưu báo cáo |  |
| Ngày tạo | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm tạo báo cáo |  |
| Trạng thái | VARCHAR(30) | Không | Đang xử lý | Trạng thái xuất báo cáo |  |

Bảng: [Nội dung cộng đồng]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã nội dung | INT | Không | Tự tăng | Mã định danh nội dung | PK |
| Mã người dùng | INT | Không | Không | Người đăng nội dung | FK |
| Mã dự án | INT | Có | NULL | Dự án được chia sẻ hoặc bình chọn | FK |
| Tiêu đề | VARCHAR(200) | Không | Không | Tiêu đề bài đăng |  |
| Nội dung | TEXT | Không | Không | Nội dung thảo luận hoặc chia sẻ lỗi |  |
| Loại nội dung | VARCHAR(50) | Không | Thảo luận | Phân loại nội dung |  |
| Số lượt bình chọn | INT | Không | 0 | Tổng lượt bình chọn |  |
| Trạng thái | VARCHAR(30) | Không | Chờ duyệt | Trạng thái kiểm duyệt |  |
| Ngày đăng | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm đăng nội dung |  |

Bảng: [Hỗ trợ / Thông báo]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã hỗ trợ | INT | Không | Tự tăng | Mã định danh phiếu hỗ trợ hoặc thông báo | PK |
| Mã người dùng | INT | Có | NULL | Người gửi yêu cầu hoặc tạo thông báo | FK |
| Loại thông tin | VARCHAR(50) | Không | Không | Phiếu hỗ trợ hoặc thông báo hệ thống |  |
| Tiêu đề | VARCHAR(200) | Không | Không | Tiêu đề yêu cầu hoặc thông báo |  |
| Nội dung | TEXT | Không | Không | Nội dung chi tiết |  |
| Mức độ ưu tiên | VARCHAR(30) | Có | Bình thường | Mức độ xử lý hoặc cảnh báo |  |
| Trạng thái | VARCHAR(30) | Không | Chờ xử lý | Trạng thái xử lý thông tin |  |
| Ngày tạo | DATETIME | Không | CURRENT_TIMESTAMP | Thời điểm tạo |  |

Bảng: [Dữ liệu kiểm thử / Test Case]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã Test Case | INT | Không | Tự tăng | Mã định danh dữ liệu kiểm thử | PK |
| Mã dự án | INT | Không | Không | Liên kết với bài tập/dự án được kiểm thử | FK |
| Dữ liệu đầu vào | TEXT | Có | NULL | Dữ liệu truyền vào khi chạy Code (Input) |  |
| Kết quả đầu ra | TEXT | Không | Không | Kết quả chuẩn mong đợi để đối chiếu (Output) |  |
| Trọng số điểm | DECIMAL(5,2) | Không | 1.00 | Điểm cộng nếu Code vượt qua Test Case này |  |
| Gợi ý sửa lỗi | TEXT | Có | NULL | Gợi ý hiển thị cho học sinh nếu chạy sai |  |

[Máy chấm tự động / Judge Engine]

| Tên cột | Kiểu dữ liệu | Null | Default | Mô tả | Ràng buộc |
| --- | --- | --- | --- | --- | --- |
| Mã máy chấm | INT | Không | Tự tăng | Mã định danh server máy chấm | PK |
| Tên máy chấm | VARCHAR(100) | Không | Không | Tên gợi nhớ (VD: Arduino Judge, Python Judge) |  |
| Địa chỉ API | VARCHAR(255) | Không | Không | Endpoint URL để hệ thống gửi file Code tới | UNIQUE |
| Ngôn ngữ hỗ trợ | VARCHAR(100) | Không | Không | Định dạng file hỗ trợ (VD: .ino, .cpp, .py) |  |
| Dung lượng tối đa | INT | Không | 5 | Giới hạn dung lượng file Code (MB) |  |
| Trạng thái | VARCHAR(30) | Không | Đang hoạt động | Trạng thái của server máy chấm |  |

### 6.3. Sơ đồ quan hệ (ERD)

| STT | Bảng thứ nhất | Quan hệ | Bảng thứ hai |
| --- | --- | --- | --- |
| 1 | Người dùng | 1 – N | Học liệu |
| 2 | Học liệu | 1 – N | Khóa học / Lộ trình |
| 3 | Khóa học / Lộ trình | 1 – N | Dự án / Bài tập |
| 4 | Người dùng | 1 – N | Dự án / Bài tập |
| 5 | Người dùng | 1 – N | Bài thi |
| 6 | Người dùng | 1 – N | Bài nộp |
| 7 | Dự án / Bài tập | 1 – N | Bài nộp |
| 8 | Bài thi | 1 – N | Bài nộp |
| 9 | Bài nộp | 1 – 1 | Kết quả / Điểm |
| 10 | Người dùng | 1 – N | Nội dung cộng đồng |
| 11 | Người dùng | 1 – N | Báo cáo / Thống kê |
| 12 | Người dùng | 1 – N | Hỗ trợ / Thông báo |

## 7. CHIA & QUẢN LÝ CÔNG VIỆC THEO NHÓM

### 7.1. Phân công vai trò trong nhóm

| STT | Vai trò | Trách nhiệm chính | Người phụ trách |
| --- | --- | --- | --- |
| 1 | Trưởng nhóm | Điều phối toàn bộ, phân công, kiểm soát tiến độ, giao tiếp với khách hàng/PO | Trần Minh Nhật |
| 2 | Phân tích nghiệp vụ | Thu thập & làm rõ yêu cầu, viết đặc tả, kiểm soát phạm vi | Phạm Thị Hà Vy |
| 3 | Thiết kế hệ thống | Phân tích đối tượng, thiết kế phân hệ, thiết kế CSDL, vẽ sơ đồ quan hệ | Trần Thế Quân |
| 4 | Phân tích chức năng | Phân rã chức năng đến module IPO, ma trận CRUD, luồng dữ liệu | Nguyễn Thị Thanh Thảo |
| 5 | Quản lý chất lượng (QA) | Kiểm tra chéo (Review) các bản thiết kế, rà soát tính logic giữa CSDL và Luồng dữ liệu, hỗ trợ kỹ thuật. | Phạm Kỳ Hải |

### 7.2. Cách thức chia công việc theo giai đoạn

| Giai đoạn | Công việc chính | Người phụ trách chính | Người hỗ trợ | Thời gian ước lượng |
| --- | --- | --- | --- | --- |
| 1. Đặt tên & Xác định bài toán | Viết mục 1 | Phạm Thị Hà Vy | Trần Minh Nhật | 2 tuần |
| 2. Đặc tả yêu cầu (SRS) | Viết FR, NFR, ràng buộc | Phạm Thị Hà Vy | Phạm Kỳ Hải | 2 tuần |
| 3. Phân tích đối tượng & phân hệ | Lập danh sách đối tượng, phân hệ | Nguyễn Thị Thanh Thảo | Trần Minh Nhật | 2 tuần |
| 4. Phân rã chức năng → Module IPO | Phân rã chức năng + viết bảng IPO cho từng module | Nguyễn Thị Thanh Thảo | Phạm Kỳ Hải | 2 tuần |
| 5. Ma trận CRUD & Luồng dữ liệu | Lập ma trận CRUD + mô tả luồng dữ liệu | Trần Thế Quân | Nguyễn Thị Thanh Thảo | 2 tuần |
| 6. Thiết kế CSDL & ERD | Thiết kế bảng, thuộc tính, quan hệ, vẽ ERD | Trần Thế Quân | Phạm Kỳ Hải | 2 tuần |
| 7. Tổng hợp & Hoàn thiện báo cáo | Định dạng format, rà soát logic toàn bộ tài liệu, in ấn báo cáo | Trần Minh Nhật, Phạm Kỳ Hải | Cả nhóm | 2 tuần |

### 7.3. Theo dõi công việc

| Ngày | Người thực hiện | Task đang làm | % hoàn thành | Deadline |
| --- | --- | --- | --- | --- |
| 01/11 | Phạm Thị Hà Vy | Chốt tên đề tài, mục tiêu và đặc tả yêu cầu (Phần 1, 2) | 100% | 11/11 |
| 01/11 | Nguyễn Thị Thanh Thảo | Phân tích đối tượng, phân rã chức năng IPO (Phần 3, 4) | 100% | 11/11 |
| 01/11 | Trần Thế Quân | Thiết kế CSDL, ma trận CRUD và sơ đồ ERD (Phần 5, 6) | 100% | 11/11 |
| 01/11 | Phạm Kỳ Hải | Rà soát lỗi logic CSDL, kiểm tra thực thể TEST_CASE | 100% | 11/11 |
| 01/11 | Trần Minh Nhật | Rà soát lỗi logic bài làm, tổng hợp rà soát bảng | 100% | 11/11 |
