# Đặc tả Thiết kế UI/UX — STEM Robotic Edu
**Hệ ngôn ngữ thiết kế:** Creative Studio & Neo-Brutalist EdTech  
**Phiên bản:** 1.0 — Nguyễn Thị Thanh Thảo (Phân hệ 5 & 6)  
**Áp dụng cho:** TKDL.01, TKDL.02, XBC.01, XBC.02, TTCĐ.01, DF-05

---

## 1. Triết lý thiết kế

### 1.1 Neo-Brutalist EdTech
- **Khung cứng (Hard shadow):** Mọi thành phần tương tác chính đều có bóng đổ cứng `4px 4px 0` không mờ, tạo cảm giác vật lý rõ ràng.
- **Phẳng hoá tuyệt đối (Flatten Hierarchy):** Không lồng thẻ trong thẻ. Dùng `border-top: 1.5px dashed rgba(11,15,25,0.12)` để phân đoạn, không dùng thẻ con.
- **Không dùng Emoji** trong giao diện. Mọi icon và minh họa phải là SVG vector nội tuyến (inline SVG).
- **Không gradient text.** Chỉ dùng màu đặc (solid color) cho văn bản.
- **Không dùng eyebrow chip kiểu "chip tiêu đề"** (chip nằm trên đầu heading). Dùng `<div class="eyebrow">` chỉ cho labels chức năng, không phải trang trí mù.

### 1.2 Bảng màu chuẩn
| Biến CSS | Giá trị HEX | Dùng cho |
|---|---|---|
| `--c-bg` | `#F4F6F8` | Canvas toàn trang |
| `--c-surface` | `#FFFFFF` | Thẻ nội dung, Modal |
| `--c-text-main` | `#0B0F19` | Chữ chính |
| `--c-text-dim` | `#505F79` | Chữ phụ, nhãn |
| `--c-primary` | `#5A52FF` | Màu thương hiệu, nút CTA |
| `--c-secondary` | `#FF5E5E` | Cảnh báo, lỗi, năng lượng |
| `--c-accent` | `#FFB800` | Vàng Vinh danh, Huy hiệu Top 1 |
| `--c-success` | `#047857` | Trạng thái Pass, Hoàn thành |
| `--c-error` | `#DC2626` | Lỗi hệ thống |
| `--c-dark-console` | `#0B0F19` | Nền tối khoang máy chấm |
| `--c-dark-code` | `#38BDF8` | Telemetry code, log xanh lam |

### 1.3 Typography
| Vai trò | Font | Weight |
|---|---|---|
| Heading, số liệu lớn | `Bricolage Grotesque` | 600, 700, 800 |
| Body, label, nút | `Be Vietnam Pro` | 400, 500, 600, 700 |
| Code, log, terminal | `ui-monospace / JetBrains Mono` | 400 |

### 1.4 Bo góc chuẩn
| Lớp | Giá trị | Áp dụng |
|---|---|---|
| `.bento-card` | `32px` | Card thống kê lớn |
| `.card` | `24px` | Card chức năng, Modal |
| Input, Select | `16px` | Ô nhập liệu |
| Button, Badge | `50px` (pill) | Nút CTA, nhãn trạng thái |

---

## 2. Nền trang & Hiệu ứng không gian

### 2.1 Canvas Dot Pattern
```css
body {
  background-color: #F4F6F8;
  background-image: radial-gradient(rgba(11,15,25,0.05) 2px, transparent 2px);
  background-size: 32px 32px;
  background-position: -1px -1px;
}
```

### 2.2 Blob lơ lửng
Mỗi trang dashboard phải có 3 khối `.blob` cố định:
```html
<div class="blob blob-1"></div>  <!-- Tím xanh, góc trên trái -->
<div class="blob blob-2"></div>  <!-- Đỏ cam, góc giữa phải -->
<div class="blob blob-3"></div>  <!-- Vàng kim, góc dưới giữa -->
```
Các blob dùng `radial-gradient` không có `filter: blur()` để tránh lag trên thiết bị yếu.

---

## 3. Cấu trúc bố cục App Shell

```
┌─────────────────────────────────────────────────────┐
│  .sidebar (280px, nền #0B0F19 cố định bên trái)     │
│  ┌─────────────────────────────────────────────────┐ │
│  │ .sidebar-brand (logo + tên hệ thống)            │ │
│  │ .sidebar-user-card (avatar + tên + vai trò)     │ │
│  │ .sidebar-nav (menu điều hướng)                  │ │
│  └─────────────────────────────────────────────────┘ │
│  .main-content (flex:1, padding 32px)                │
│  ┌─────────────────────────────────────────────────┐ │
│  │ .dashboard-view (các view chuyển đổi bằng JS)   │ │
│  └─────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Quy tắc bố cục:**
- Sidebar luôn `position: sticky; height: 100vh` trên desktop.
- Trên mobile (`max-width: 768px`): sidebar ẩn, hiện qua overlay khi bấm nút hamburger.
- `main-content` có `overflow-y: auto` để scroll độc lập.

---

## 4. Thiết kế chi tiết từng mô đun

### 4.1 TKDL.01 — Thống kê kết quả nộp bài

**Mô tả:** Giáo viên xem biểu đồ tiến độ và chất lượng lớp học.

**Cấu trúc trang (view: `analytics`):**
```
┌─ Bento Grid 3 cột ──────────────────────────────────────┐
│ [Tổng bài nộp] [Tỷ lệ Pass] [Tỷ lệ nộp đúng hạn]       │
├──────────────────────────────────────────────────────────┤
│ [Biểu đồ cột — điểm theo dự án]  [Biểu đồ tròn — Pass%]│
├──────────────────────────────────────────────────────────┤
│ [Thanh lọc: Dự án ▼  Trạng thái ▼]    [Xuất CSV] [PDF] │
│ [Bảng danh sách bài nộp]                                 │
└──────────────────────────────────────────────────────────┘
```

**Thẻ số liệu (Stat Card):**
```html
<div class="bento-card">
  <div class="b-icon-box">
    <!-- SVG icon 26x26, stroke currentColor -->
  </div>
  <div class="b-label">TỔNG BÀI NỘP</div>
  <div class="b-value">247</div>
  <div class="b-trend">
    <!-- SVG arrow + "+12 so với tuần trước" -->
  </div>
</div>
```

**Nút xuất báo cáo:**
```html
<button class="btn-playful btn-playful-primary" onclick="exportCSV()">
  <svg><!-- icon download --></svg>
  Xuất CSV
</button>
<button class="btn-playful" onclick="exportPDF()">
  <svg><!-- icon printer --></svg>
  In PDF
</button>
```

---

### 4.2 TKDL.02 — Phân tích Log lỗi & Bảng xếp hạng lỗi

**Mô tả:** Hiển thị bảng xếp hạng các lỗi lập trình/lắp ráp phổ biến nhất.

**Cấu trúc trang (view: `errorRanking`):**
```
┌─ Bảng xếp hạng lỗi ─────────────────────────────────────┐
│ [Lọc: Lớp ▼  Dự án ▼  Loại lỗi ▼  Kỳ ▼]               │
├──────────────────────────────────────────────────────────┤
│ Hạng │ Mã lỗi     │ Mô tả              │ Số lần │ % lớp │
│  1   │ SYNTAX_001 │ Thiếu dấu chấm phẩy│  34    │ 68%   │
│  2   │ LOGIC_003  │ Vòng lặp vô hạn    │  21    │ 42%   │
├──────────────────────────────────────────────────────────┤
│ [Cảnh báo DF-05] Có 2 lỗi vượt ngưỡng >30% ↗           │
└──────────────────────────────────────────────────────────┘
```

**Huy hiệu xếp hạng (SVG lục giác):**
- Hạng 1: `fill="#FFB800"` (Vàng ánh kim)
- Hạng 2: `fill="#94A3B8"` (Bạc)
- Hạng 3: `fill="#C97C3A"` (Đồng)
- Hạng 4+: `fill="#E2E8F0"`, chữ `#505F79`

**Thanh progress tỷ lệ % lớp:**
```html
<div class="error-bar-wrap">
  <div class="error-bar" style="width: 68%; background: var(--c-secondary);"></div>
</div>
```
Nếu `>= 30%`: thanh màu `--c-secondary` (#FF5E5E) + icon cảnh báo SVG.  
Nếu `< 30%`: thanh màu `--c-primary` (#5A52FF).

---

### 4.3 XBC.01 — Báo cáo chủ đề trending + xuất Excel/PDF

**Mô tả:** Giáo viên xem Top chủ đề diễn đàn được quan tâm nhất; xuất file báo cáo.

**Cấu trúc trang (view: `trendingTopics`):**
```
┌─ Top Trending Chủ đề ───────────────────────────────────┐
│ [Lọc: Tuần này ▼  Tất cả lớp ▼]  [Xuất Excel] [Xuất PDF]│
├──────────────────────────────────────────────────────────┤
│ # │ Tiêu đề           │ Lượt xem │ Vote │ Bình luận │ Hot│
│ 1 │ Lỗi servo bước... │   156    │  34  │    12     │ ★  │
├──────────────────────────────────────────────────────────┤
│ [Thanh điểm Trending = view*1 + vote*3 + comment*2]      │
└──────────────────────────────────────────────────────────┘
```

**Nhãn "HOT" (SVG badge, không dùng emoji):**
```html
<span class="hot-badge">
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
       stroke="var(--c-secondary)" stroke-width="2.5">
    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2z"/>
    <path d="M12 6v6l4 2"/>
  </svg>
  HOT
</span>
```

---

### 4.4 XBC.02 — Xuất file điểm

**Mô tả:** Giáo viên xuất bảng điểm tổng hợp dạng CSV, Excel, hoặc PDF.

**Bộ lọc xuất báo cáo:**
```html
<div class="export-toolbar">
  <select class="select-filter" name="maDuAn"><!-- Dự án --></select>
  <select class="select-filter" name="hocKy"><!-- Học kỳ --></select>
  <select class="select-filter" name="maLop"><!-- Lớp --></select>
  <select class="select-filter" name="trangThai"><!-- Trạng thái --></select>

  <button class="btn-playful btn-playful-primary" onclick="exportCSV()">
    <svg><!-- download icon --></svg> CSV
  </button>
  <button class="btn-playful" onclick="exportExcel()">
    <svg><!-- table icon --></svg> Excel
  </button>
  <button class="btn-playful btn-playful-secondary" onclick="exportPDF()">
    <svg><!-- printer icon --></svg> PDF
  </button>
</div>
```

**Luồng xuất file:**
- **CSV:** `GET /api/reports/grades-csv?maDuAn=&hocKy=&maLop=&trangThai=` → download trực tiếp.
- **Excel:** `GET /api/reports/grades-excel?...` → download `.xlsx` (cần cài `exceljs` server-side).
- **PDF:** Mở `window.open('/print-report?...')` → trang `print_report.ejs` → `window.print()`.

---

### 4.5 TTCĐ.01 — Thảo luận & Lọc từ khóa diễn đàn

**Mô tả:** Học sinh/Giáo viên tạo và tìm kiếm chủ đề thảo luận lỗi lập trình.

**Thanh tìm kiếm (search box):**
```html
<div class="search-bar-wrap">
  <div class="search-input-group">
    <svg class="search-icon" width="18" height="18" viewBox="0 0 24 24"
         fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
    <input type="text" class="search-input" id="communitySearch"
           placeholder="Tìm kiếm chủ đề, mã lỗi, từ khóa..."
           oninput="filterPosts(this.value)">
  </div>
</div>
```

**CSS search bar:**
```css
.search-bar-wrap { margin-bottom: 24px; }
.search-input-group {
  position: relative;
  display: flex;
  align-items: center;
}
.search-icon {
  position: absolute;
  left: 16px;
  color: var(--c-text-dim);
  pointer-events: none;
}
.search-input {
  width: 100%;
  padding: 14px 20px 14px 48px;
  border-radius: var(--radius-input);
  border: 2px solid rgba(11,15,25,0.10);
  background: var(--c-surface);
  font-family: var(--f-body);
  font-size: 0.95rem;
  color: var(--c-text-main);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 2px 2px 0 var(--c-primary);
}
.search-input:focus {
  outline: none;
  border-color: var(--c-primary);
  box-shadow: 4px 4px 0 var(--c-primary);
}
```

**API endpoint cần có:**
```
GET /api/community/posts?search=<keyword>&page=1&limit=20
```

---

### 4.6 DF-05 — Cảnh báo lỗi vượt ngưỡng >30%

**Mô tả:** Banner cảnh báo tự động xuất hiện trong dashboard giáo viên khi lỗi vượt ngưỡng.

**Banner cảnh báo (không dùng emoji):**
```html
<div class="alert-banner alert-warning" id="df05Alert" style="display:none;">
  <div class="alert-icon">
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
         stroke="var(--c-warning)" stroke-width="2.5">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>
  </div>
  <div class="alert-body">
    <strong>Cảnh báo DF-05:</strong>
    <span id="df05Message">Có lỗi lập trình vượt ngưỡng 30% lớp — cần bổ sung học liệu.</span>
  </div>
  <a href="javascript:void(0)" onclick="switchTeacherView('errorRanking')"
     class="alert-action">Xem chi tiết</a>
</div>
```

**CSS banner:**
```css
.alert-banner {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 20px;
  border-radius: var(--radius-input);
  margin-bottom: 20px;
  border: 2px solid transparent;
}
.alert-warning {
  background: var(--c-warning-bg);
  border-color: var(--c-warning);
  box-shadow: 3px 3px 0 var(--c-warning);
}
.alert-action {
  margin-left: auto;
  font-weight: 700;
  color: var(--c-warning);
  white-space: nowrap;
  text-decoration: underline;
}
```

---

## 5. Bảng Vinh danh (Wall of Fame)

### 5.1 Huy hiệu lục giác SVG
Mọi huy hiệu hạng phải dùng SVG polygon lục giác, không dùng CSS clip-path hay hình ảnh raster:

```html
<!-- Hạng 1 — Vàng -->
<div class="r-badge">
  <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"
             fill="#FFB800" stroke="#0B0F19" stroke-width="1.5"/>
  </svg>
  <span>1</span>
</div>

<!-- Hạng 2 — Bạc -->
<div class="r-badge">
  <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"
             fill="#94A3B8" stroke="#0B0F19" stroke-width="1.5"/>
  </svg>
  <span>2</span>
</div>

<!-- Hạng 3 — Đồng -->
<div class="r-badge">
  <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
    <polygon points="21,2 38,11.5 38,30.5 21,40 4,30.5 4,11.5"
             fill="#C97C3A" stroke="#0B0F19" stroke-width="1.5"/>
  </svg>
  <span>3</span>
</div>
```

### 5.2 Danh sách xếp hạng
```html
<ul class="rank-list">
  <li class="rank-item">
    <div class="r-user">
      <div class="r-badge"><!-- SVG lục giác vàng --></div>
      <div>
        <div class="r-name">Nguyễn Văn A</div>
        <div class="r-class">Lớp 10/1</div>
      </div>
    </div>
    <div class="r-score">9.8</div>
  </li>
</ul>
```

**Phân đoạn giữa các hàng:** `border-top: 1.5px dashed rgba(11,15,25,0.12)` — không dùng card lồng nhau.

---

## 6. Quy tắc Anti-AI-Slop bắt buộc

| Cấm | Dùng thay thế |
|---|---|
| Emoji (`🚀 🏆 🔥`) | SVG icon nội tuyến |
| Gradient text (`background-clip: text`) | Màu đặc `--c-primary` |
| Card lồng card | Dùng `border-top dashed` phân đoạn |
| `filter: blur()` cho blob | `radial-gradient` trực tiếp |
| Icon từ font icon (FontAwesome, Material Icons) | SVG nội tuyến |
| Chip eyebrow trang trí | Chỉ dùng `.eyebrow` cho label chức năng |
| Box-shadow mờ kiểu `0 0 20px rgba(...)` cho CTA | Bóng cứng `4px 4px 0 color` |

---

## 7. Xuất báo cáo CSV/PDF — Quy trình chuẩn

### 7.1 CSV
1. Frontend gọi `fetch('/api/reports/grades-csv?...')` với header `Authorization`.
2. Server trả về `Content-Type: text/csv; charset=utf-8` với BOM `\uFEFF`.
3. Frontend dùng `Blob + URL.createObjectURL` để trigger download:
```javascript
async function exportCSV() {
  const params = new URLSearchParams({ maDuAn, hocKy, maLop, trangThai });
  const res = await fetch(`/api/reports/grades-csv?${params}`);
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `BangDiem_STEM_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
```

### 7.2 PDF (Window Print)
1. Frontend mở tab mới: `window.open('/print-report?maDuAn=&hocKy=&maLop=')`.
2. Server render `print_report.ejs` với dữ liệu đầy đủ.
3. View tự động gọi `window.print()` trong `DOMContentLoaded`.
4. Log được ghi vào `BaoCaoThongKe` qua `POST /api/reports/log-report`.

### 7.3 Excel (cần implement)
1. Cài `exceljs`: `npm install exceljs --save`.
2. Route: `GET /api/reports/grades-excel`.
3. Server tạo workbook, style header màu `#5A52FF`, trả về `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`.
4. Frontend nhận và download tương tự CSV.

---

## 8. Tiêu chuẩn responsive

> File CSS responsive riêng: `public/css/responsive-mobile.css`  
> Import sau `theme.css` trong mọi trang có dashboard.

**Breakpoints:**
| Breakpoint | Kích thước | Hành vi |
|---|---|---|
| Desktop | `> 1024px` | Sidebar 280px cố định |
| Tablet | `769px – 1024px` | Sidebar thu gọn 72px (chỉ icon) |
| Mobile | `<= 768px` | Sidebar ẩn, hamburger menu |
| Small mobile | `<= 480px` | Font scale nhỏ hơn, padding giảm |

Chi tiết triển khai: xem `public/css/responsive-mobile.css`.
