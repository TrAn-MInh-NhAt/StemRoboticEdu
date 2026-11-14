"""
error_analyzer.py – Phân tích lỗi và trả thông báo tiếng Việt dễ hiểu
cho học sinh cấp 2–3 (không dùng thuật ngữ kỹ thuật khó).
"""
import re

# Bảng lỗi Python → thông báo tiếng Việt
_PYTHON_ERRORS = [
    (r"SyntaxError", "Lỗi cú pháp: Em đã gõ sai cấu trúc lệnh. Hãy kiểm tra lại dấu ngoặc, dấu hai chấm hoặc từ khóa."),
    (r"IndentationError", "Lỗi thụt lề: Hãy kiểm tra lại khoảng trắng đầu dòng. Python rất quan trọng về thụt lề đều nhau."),
    (r"NameError.*'(\w+)'", "Lỗi tên biến: Em dùng biến '{1}' nhưng chưa tạo nó. Hãy kiểm tra xem đã gán giá trị cho biến chưa."),
    (r"TypeError", "Lỗi kiểu dữ liệu: Em đang thực hiện phép tính với các loại dữ liệu không phù hợp (ví dụ: số + chữ)."),
    (r"ZeroDivisionError", "Lỗi chia cho 0: Em đang chia một số cho 0. Hãy kiểm tra lại mẫu số của phép chia."),
    (r"IndexError", "Lỗi chỉ số: Em đang truy cập vị trí không tồn tại trong danh sách. Hãy kiểm tra lại số chỉ mục."),
    (r"ValueError", "Lỗi giá trị: Dữ liệu đầu vào không đúng định dạng mong đợi. Hãy kiểm tra lại kiểu dữ liệu."),
    (r"RecursionError", "Lỗi đệ quy vô hạn: Chương trình gọi chính nó mà không có điều kiện dừng. Hãy thêm điều kiện thoát."),
    (r"Time Limit|TimeoutExpired|quá thời gian", "Lỗi Vượt Giới Hạn Thời Gian: Chương trình chạy quá lâu. Hãy kiểm tra xem có vòng lặp vô tận không."),
    (r"ModuleNotFoundError|ImportError", "Lỗi nhập thư viện: Module em dùng không có trên hệ thống chấm bài. Chỉ dùng thư viện có sẵn của Python."),
]

# Bảng lỗi C++/Arduino → thông báo tiếng Việt
_CPP_ERRORS = [
    (r"expected ';'", "Thiếu dấu chấm phẩy ';' cuối dòng lệnh. Hãy kiểm tra và bổ sung."),
    (r"undeclared identifier|'(\w+)' was not declared", "Biến hoặc hàm '{1}' chưa được khai báo. Hãy khai báo trước khi sử dụng."),
    (r"linker command failed|undefined reference", "Lỗi liên kết: Hàm em gọi không được định nghĩa. Hãy kiểm tra tên hàm."),
    (r"expected '\)'|expected '\('", "Thiếu hoặc thừa dấu ngoặc. Hãy đếm lại số dấu mở và đóng ngoặc."),
    (r"no matching function", "Hàm được gọi không khớp với định nghĩa. Kiểm tra lại tên hàm và các tham số."),
    (r"expected '}'|expected '{'", "Thiếu hoặc thừa dấu ngoặc nhọn. Hãy kiểm tra khối lệnh."),
    (r"Time Limit|quá thời gian", "Lỗi Vượt Giới Hạn Thời Gian: Chương trình chạy quá lâu. Hãy kiểm tra vòng lặp."),
]


def analyze(
    stderr: str,
    stdout: str,
    expected: str,
    lang: str,
    hint: str = "",
) -> dict:
    """
    Phân tích lỗi và trả về:
    {is_correct, score_pct, message_vi, hint_vi}
    """
    actual = stdout.strip()
    expected_clean = expected.strip()
    is_correct = (actual == expected_clean) and (not stderr.strip())

    if is_correct:
        return {
            "is_correct": True,
            "score_pct": 100,
            "message_vi": "Chính xác! Kết quả đầu ra khớp hoàn toàn.",
            "hint_vi": "",
        }

    # --- Tìm thông báo lỗi phù hợp ---
    error_table = _PYTHON_ERRORS if lang == "python" else _CPP_ERRORS
    message_vi = ""

    for pattern, msg in error_table:
        m = re.search(pattern, stderr, re.IGNORECASE)
        if m:
            # Nếu có nhóm bắt được tên biến/hàm thì thay vào
            try:
                message_vi = msg.format(*[""] + list(m.groups()))
            except (IndexError, KeyError):
                message_vi = msg
            break

    if not message_vi:
        if stderr.strip():
            message_vi = "Chương trình gặp lỗi khi chạy. Hãy đọc kỹ thông báo bên dưới và sửa lại."
        elif actual != expected_clean:
            message_vi = (
                f"Sai kết quả đầu ra. "
                f"Hệ thống mong đợi: '{expected_clean}', "
                f"nhưng em xuất ra: '{actual}'. "
                f"Hãy kiểm tra lại công thức tính toán."
            )
        else:
            message_vi = "Chưa đạt. Hãy kiểm tra lại logic chương trình."

    hint_vi = hint if hint else ""

    return {
        "is_correct": False,
        "score_pct": 0,
        "message_vi": message_vi,
        "hint_vi": hint_vi,
    }
