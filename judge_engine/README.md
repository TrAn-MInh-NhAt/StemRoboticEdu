# STEM Robotic Judge Engine (FastAPI — Cổng 5000)

Hệ thống máy chấm tự động cách ly (Sandbox Autograder) phục vụ nền tảng giáo dục **STEM Robotic Edu**, tuân thủ nghiêm ngặt đặc tả kỹ thuật luồng **DF-01**, **DF-04** và phi chức năng **NFR-01** (thời gian phản hồi < 0.05s).

---

## 1. Cấu trúc thư mục & Thành phần

```
judge_engine/
├── main.py                  # Điểm khởi chạy FastAPI (Port 5000), cấu hình CORS, Health check
├── routers/
│   ├── __init__.py
│   └── judge.py             # Điều phối API: /api/judge, /api/judge-json, /api/status, /machines
├── services/
│   ├── __init__.py
│   ├── arduino_mock.h       # Thư viện Mock C++ giả lập phần cứng Arduino (pinMode, Serial, PWM, MPU6050)
│   ├── sandbox.py           # Bộ thực thi Sandbox cô lập tiến trình con với Timeout = 3.0s
│   ├── error_analyzer.py    # Phân tích cú pháp & lỗi runtime bằng Tiếng Việt sư phạm
│   └── runner.py            # Điều phối chấm điểm & tính điểm theo trọng số TestCase
└── README.md                # Tài liệu kỹ thuật máy chấm
```

---

## 2. Lưu đồ 5 Bước Chấm Điểm Tự Động (Execution Lifecycle)

```
[Học sinh nộp Mã nguồn / File .py, .ino, .cpp]
                  │
                  ▼
  [Bước 1: Tiếp nhận & Thẩm định Header]
  • Xác thực payload (code string hoặc upload file multipart)
  • Phân loại định dạng tệp: Python (.py), C++ (.cpp), Arduino Sketch (.ino)
                  │
                  ▼
  [Bước 2: Chuẩn bị Môi trường Sandbox Cô Lập]
  • Ghi mã nguồn ra thư mục tạm thời (Temporary Workspace)
  • Nếu là Arduino (.ino) hoặc C++: liên kết tự động với header giả lập arduino_mock.h
  • Nếu thiếu trình biên dịch g++: kích hoạt bộ mô phỏng dự phòng Fallback Evaluator
                  │
                  ▼
  [Bước 3: Thực thi Sandbox & Nạp Bộ TestCases (NFR-01)]
  • Khởi chạy tiến trình con cô lập (subprocess.run)
  • Nạp từng input từ TestCase.DuLieuDauVao qua stdin
  • Áp đặt giới hạn thời gian Timeout = 3.0s (chống vòng lặp vô hạn While True)
  • Thu thập trọn vẹn stdout, stderr, mã thoát (exit code) và đo thời gian chạy (ms)
                  │
                  ▼
  [Bước 4: Phân Tích Lỗi Sư Phạm Tiếng Việt (DF-04)]
  • Đối chiếu kết quả stdout với TestCase.KetQuaMongDoi (chuẩn hóa trim/lowercase)
  • Nếu phát hiện lỗi (SyntaxError, IndentationError, NameError, Segmentation Fault, Timeout):
    chuyển qua error_analyzer.py tạo thông điệp sư phạm thân thiện kèm gợi ý khắc phục
                  │
                  ▼
  [Bước 5: Tổng Hợp & Phản Hồi Kết Quả JSON (DF-01 / XLBN.03)]
  • Tính toán điểm số chính xác dựa trên trọng số TestCase (TongDiem / 10.0)
  • Trả về JSON: tongDiem, ketQuaChiTiet, thoiGianChay_ms, trangThai (Đạt / Lỗi)
  • Trigger luồng DF-01: Nếu đạt 100% TestCase -> chuyển trạng thái "Chờ duyệt Video"
```

---

## 3. Cơ Chế Sandbox Cô Lập & Khả Năng Đa Ngôn Ngữ

### 3.1. Python (`.py`)
- Thực thi thông qua `sys.executable` trong tiến trình con riêng biệt.
- Ngăn chặn triệt để treo hệ thống bằng `timeout = 3.0s`.
- Bắt trọn vẹn các ngoại lệ runtime và định vị dòng code gây lỗi.

### 3.2. C++ (`.cpp`) & Arduino Sketch (`.ino`)
- Hệ thống tự động bao bọc mã nguồn với `#include "arduino_mock.h"`.
- Giả lập hoàn chỉnh các API phần cứng vi điều khiển Arduino:
  - `pinMode(pin, mode)`, `digitalWrite(pin, val)`, `digitalRead(pin)`.
  - `analogRead(pin)`, `analogWrite(pin, val)`.
  - `Serial.begin(baud)`, `Serial.print()`, `Serial.println()`.
  - `pulseIn(pin, val)`, `millis()`, `delay()`, `map()`, `constrain()`.
- **Fallback Evaluator Dự Phòng:** Trường hợp máy chủ chạy trên môi trường không cài sẵn trình biên dịch `g++`, Sandbox tự động chuyển sang bộ giải tích logic mã nguồn (Pattern Matching & I/O Emulation), đảm bảo khi clone mã nguồn về bất kỳ máy tính nào của nhóm cũng chấm được 100% ngay lập tức.

---

## 4. Danh sách Endpoints API

| Phương thức | Endpoint | Mô tả | Payload mẫu |
|---|---|---|---|
| `GET` | `/health` | Kiểm tra trạng thái máy chấm | Không |
| `GET` | `/api/status` | Đo độ trễ (latency_ms), ngôn ngữ hỗ trợ | Không |
| `GET` | `/api/judge/machines` | Danh sách máy chấm trong cụm phân tán | Không |
| `POST` | `/api/judge` | Chấm điểm file đính kèm (Multipart) | `file`, `test_cases` (JSON), `time_limit_ms` |
| `POST` | `/api/judge-json` | Chấm điểm chuỗi mã nguồn trực tiếp | JSON: `{ code, filename, test_cases, time_limit_ms }` |

---

## 5. Mẫu Dữ Liệu Trao Đổi (JSON Schema)

### 5.1. Yêu cầu Chấm Điểm (Request Payload)
```json
{
  "code": "val = input()\nif val == '1':\n    print('LED_ON')\nelse:\n    print('LED_OFF')",
  "filename": "solution.py",
  "time_limit_ms": 3000,
  "test_cases": [
    {
      "MaTestCase": 1,
      "DuLieuDauVao": "1",
      "KetQuaMongDoi": "LED_ON",
      "TrongSo": 5,
      "GoiYSuaLoi": "Kiểm tra điều kiện val == '1' để bật đèn"
    },
    {
      "MaTestCase": 2,
      "DuLieuDauVao": "0",
      "KetQuaMongDoi": "LED_OFF",
      "TrongSo": 5,
      "GoiYSuaLoi": "Kiểm tra nhánh else để tắt đèn"
    }
  ]
}
```

### 5.2. Phản Hồi Thành Công Đạt 100% (Pass — Kích Hoạt Luồng DF-01)
```json
{
  "success": true,
  "tongDiem": 10.0,
  "diemToiDa": 10.0,
  "tiLeDat": "100.0%",
  "thoiGianChay_ms": 38.5,
  "ketQuaChiTiet": [
    {
      "test_case_id": 1,
      "status": "PASS",
      "input": "1",
      "expected_output": "LED_ON",
      "actual_output": "LED_ON",
      "diemDat": 5.0,
      "execution_time_ms": 18.2
    },
    {
      "test_case_id": 2,
      "status": "PASS",
      "input": "0",
      "expected_output": "LED_OFF",
      "actual_output": "LED_OFF",
      "diemDat": 5.0,
      "execution_time_ms": 20.3
    }
  ],
  "thongDiepSuPham": "Chúc mừng em! Toàn bộ 2/2 TestCases đều chính xác tuyệt đối. Hệ thống đã kích hoạt luồng DF-01 chuyển bài sang trạng thái Chờ duyệt Video vận hành thực tế."
}
```

### 5.3. Phản Hồi Bắt Lỗi Lập Trình (Fail — Kích Hoạt Luồng DF-04)
```json
{
  "success": true,
  "tongDiem": 5.0,
  "diemToiDa": 10.0,
  "tiLeDat": "50.0%",
  "thoiGianChay_ms": 42.1,
  "ketQuaChiTiet": [
    {
      "test_case_id": 1,
      "status": "PASS",
      "input": "1",
      "expected_output": "LED_ON",
      "actual_output": "LED_ON",
      "diemDat": 5.0
    },
    {
      "test_case_id": 2,
      "status": "FAIL",
      "input": "0",
      "expected_output": "LED_OFF",
      "actual_output": "LED_ON",
      "diemDat": 0.0,
      "error_type": "Wrong Answer",
      "goi_y_sua_loi": "Kiểm tra nhánh else để tắt đèn"
    }
  ],
  "thongDiepSuPham": "Chương trình của em chạy được nhưng kết quả ở TestCase #2 chưa khớp. Gợi ý: Kiểm tra nhánh else để xuất đúng chuỗi LED_OFF."
}
```

---

## 6. Hướng dẫn Khởi chạy Độc lập

```powershell
# Di chuyển vào thư mục máy chấm
cd d:\Nam4\LapTrinhWeb\judge_engine

# Cài đặt thư viện Python
pip install fastapi uvicorn pydantic python-multipart

# Khởi chạy dịch vụ tại cổng 5000
python -m uvicorn main:app --host 0.0.0.0 --port 5000 --reload
```
