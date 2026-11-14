# PROJECT WORKSPACE RULES: STEM ROBOTIC EDU

## 1. Tài liệu nguồn (Single Source of Truth)
- Luôn đọc file `PRODUCT.md` để nắm rõ 6 phân hệ, 27 mô đun IPO và 7 luồng tự động (DF-01 đến DF-07).
- Luôn đối chiếu chính xác tên bảng và tên cột trong file `database_schema.sql` (Database: `StemRoboticDB_V2`). Tuyệt đối không tự bịa thêm tên cột khác với file SQL.

## 2. Cấu hình môi trường & Kết nối SQL Server
- Đọc thông số kết nối từ file `.env` (`PORT=80`, `DB_SERVER=ADMIN-PC\SQLEXPRESS`, `DB_NAME=StemRoboticDB_V2`, `DB_USER=sa`, `DB_TRUST_CERT=true`).
- Mọi dữ liệu hiển thị tiếng Việt đều dùng kiểu `NVARCHAR` trong SQL Server.

## 3. Tiêu chuẩn Giao diện & Chất lượng
- Áp dụng nghiêm ngặt phong cách giao diện "Neo Kinpaku - Paper & Instruments" (nền sáng sủa kết hợp khoang mô phỏng tối màu).
- Loại bỏ hoàn toàn AI Slop (không dùng thẻ eyebrow chip trên đầu tiêu đề, không dùng icon-tile-stack, không dùng gradient text).
- Trước khi báo hoàn thành mỗi tính năng, phải tự chạy kiểm thử kết nối API với SQL Server để đảm bảo không có lỗi truy vấn.

## 4. Hệ thống Thiết kế Thống nhất (Design System - Creative Studio & Neo-Brutalist EdTech)
- **File CSS & Tài nguyên gốc:** Mọi trang (`/`, `/login`, `/student`, `/teacher`, `/exam`, `/community`, `/admin`) BẮT BUỘC dùng chung file `/css/theme.css`, import Google Fonts `Bricolage Grotesque` (600, 700, 800) và `Be Vietnam Pro` (400, 500, 600, 700).
- **Bảng màu chuẩn:**
  - Nền chính (`--c-bg`): `#F4F6F8` kèm lưới chấm `radial-gradient(rgba(11, 15, 25, 0.05) 2px, transparent 2px)` kích thước `32px 32px` và các khối `.blob` mờ `blur(90px)`.
  - Nền thẻ (`--c-surface`): `#FFFFFF` | Viền mảnh: `1px solid rgba(11, 15, 25, 0.06)`.
  - Chữ chính (`--c-text-main`): `#0B0F19` | Chữ phụ (`--c-text-dim`): `#505F79`.
  - Màu thương hiệu: Primary `#5A52FF` (Tím xanh hoàng gia), Secondary `#FF5E5E` (Cam đỏ năng lượng), Accent `#FFB800` (Vàng ánh kim), Success `#047857` (Xanh ngọc bích chuẩn WCAG AA), Error `#DC2626`.
  - Khoang lập trình / Máy chấm Judge / Terminal Log: Nền tối `#0B0F19`, chữ sáng `#F4F6F8`, telemetry code `#38BDF8`, viền bo `24px`.
- **Hình khối & Bóng đổ:**
  - Bo góc: `32px` cho Bento Card lớn, `24px` cho Card chức năng/Modal, `16px` cho Input/Select, `50px` (pill) cho Button và Tech-chip.
  - Nút chính (`.btn-playful`): Nền `#0B0F19` (hoặc `#5A52FF`), viền `2px solid #0B0F19`, đổ bóng cứng `box-shadow: 4px 4px 0 #5A52FF`, khi hover dịch chuyển `translate(-4px, -4px)` và tăng bóng lên `8px 8px 0 #5A52FF` theo đường cong `cubic-bezier(0.16, 1, 0.3, 1)`.
  - Quy tắc Anti-AI-Slop: CẤM dùng Emoji (`🚀`, `🏆`, `🔥`...) trong giao diện; mọi icon, huy hiệu xếp hạng lục giác và minh họa phải dùng SVG vector sắc nét.
  - Tiêu chuẩn phẳng hóa (Flatten Hierarchy): Tuyệt đối không lồng thẻ trong thẻ (no nested cards); dùng đường kẻ ngắt nét đứt `border-top: 1.5px dashed rgba(11, 15, 25, 0.12)` hoặc typographic spacing thay vì đóng khung hộp con.

## 5. Quy chuẩn Đóng Khung Giao Diện & Hoạt Ảnh Sinh Động (UI Frame & Motion Engine)
- **Đóng khung cố định từ nay về sau:** Mọi trang phát triển mới hoặc mở rộng BẮT BUỘC kế thừa 100% phong cách Neo-Brutalist & Bento Grid, sử dụng cấu trúc Canvas `#F4F6F8` + dot pattern 32px + Sidebar/Navbar chuẩn mực. Tuyệt đối không tự ý quay lại các template AI màu be nhạt hoặc phong cách flat đơn điệu.
- **Thư viện Hoạt ảnh Tương tác (Student Engagement Motion):**
  - **Nam châm con trỏ (`.magnet-btn`):** Gắn cho các nút CTA chính, hút nhẹ theo tọa độ chuột `translate(${x * 0.15}px, ${y * 0.15}px)` tạo cảm giác vật lý cơ học sống động.
  - **Khối nền trôi nổi (`.blob` & `@keyframes float`):** Di chuyển chậm 12s tạo chiều sâu không gian phòng lab.
  - **Cuộn xuất hiện nhịp nhàng (`.bouncy-up.visible`):** Sử dụng IntersectionObserver với transition gia tốc `cubic-bezier(0.16, 1, 0.3, 1)`.
  - **Đèn nhịp thở cảm biến (`.telemetry-pulse`):** Đèn LED xanh/vàng/đỏ chỉ báo trạng thái kết nối máy chấm tự động.
  - **Thẻ nhiệm vụ cơ khí (`.mission-card`):** Hover nhấc khối `translateY(-4px)` kèm đổ bóng tăng cường, kích thích học sinh khám phá mở khóa lộ trình.
  - **Huy hiệu Vinh danh Lục giác (`.r-badge`):** Tôn vinh top 1, 2, 3 với màu Vàng ánh kim, Bạc và Đồng nguyên khối.