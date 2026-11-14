import asyncio
import logging
import os
import re
import subprocess
import tempfile
import time
from typing import Any

logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# Language detection
# ---------------------------------------------------------------------------

def detect_language(filename: str) -> str:
    """Return language tag based on file extension."""
    ext = os.path.splitext(filename)[-1].lower()
    mapping = {
        ".py": "python",
        ".cpp": "cpp",
        ".ino": "arduino",
    }
    return mapping.get(ext, "unknown")


# ---------------------------------------------------------------------------
# Python runner
# ---------------------------------------------------------------------------

def run_python_code(code: str, input_data: str, time_limit_ms: int) -> dict:
    """
    Chạy code Python với input_data, trả về {stdout, stderr, time_ms, success}.
    Đảm bảo thời gian chạy tối đa < 10s (chống treo, timeout).
    """
    # Ràng buộc timeout tối đa 10000ms theo đặc tả yêu cầu NFR-01
    capped_timeout_ms = min(max(time_limit_ms, 1000), 10000)
    timeout_seconds = capped_timeout_ms / 1000.0

    result: dict[str, Any] = {
        "stdout": "",
        "stderr": "",
        "time_ms": 0,
        "success": False,
    }

    tmp_path: str | None = None
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            suffix=".py",
            delete=False,
            encoding="utf-8",
        ) as tmp:
            tmp.write(code)
            tmp_path = tmp.name

        start = time.monotonic()
        proc = subprocess.run(
            ["python", tmp_path],
            input=input_data,
            capture_output=True,
            text=True,
            timeout=timeout_seconds,
            encoding="utf-8",
            errors="replace",
        )
        elapsed_ms = int((time.monotonic() - start) * 1000)

        result["stdout"] = proc.stdout
        result["stderr"] = proc.stderr
        result["time_ms"] = elapsed_ms
        result["success"] = (proc.returncode == 0)

    except subprocess.TimeoutExpired:
        result["stderr"] = f"Lỗi Time Limit Exceeded: Mã nguồn chạy quá thời gian cho phép ({capped_timeout_ms} ms)."
        result["success"] = False
        result["time_ms"] = capped_timeout_ms
    except Exception as exc:
        result["stderr"] = f"Lỗi thực thi (Runtime Error): {exc}"
        result["success"] = False
    finally:
        if tmp_path and os.path.exists(tmp_path):
            try:
                os.remove(tmp_path)
            except OSError:
                pass

    return result


# ---------------------------------------------------------------------------
# Arduino / C++ Simulator & Checker (khi không có g++ / avr-gcc)
# ---------------------------------------------------------------------------

def simulate_arduino_cpp(code: str, input_data: str) -> dict:
    """
    Mô phỏng logic I/O cho code Arduino (.ino) hoặc C++ (.cpp) đối với các bài tập STEM cơ bản:
    Phân tích nhánh điều kiện với Serial.read() / cin và Serial.println() / cout.
    """
    clean_code = re.sub(r'//.*', '', code)
    clean_code = re.sub(r'/\*.*?\*/', '', clean_code, flags=re.DOTALL)
    
    val = input_data.strip()
    
    # Tìm kiếm các mẫu logic cơ bản: if (s == "val" || input == "val" || Serial.read() == '1') Serial.println("OUTPUT")
    # Ví dụ: if (val == "1" ...) Serial.println("LED_ON")
    patterns = [
        # Serial.println("OUTPUT") bên trong khối if có input
        rf'if\s*\([^)]*["\'{val}["\'][^)]*\)[^{{;]*\{{[^}}]*Serial\.println\s*\(\s*["\']([^"\']+)["\']\s*\)',
        rf'if\s*\([^)]*["\'{val}["\'][^)]*\)\s*Serial\.println\s*\(\s*["\']([^"\']+)["\']\s*\)',
        rf'if\s*\([^)]*["\'{val}["\'][^)]*\)[^{{;]*\{{[^}}]*cout\s*<<\s*["\']([^"\']+)["\']',
        rf'if\s*\([^)]*["\'{val}["\'][^)]*\)\s*cout\s*<<\s*["\']([^"\']+)["\']',
        # case 'val': ... Serial.println("OUTPUT")
        rf'case\s+["\'{val}["\']\s*:[^:]*Serial\.println\s*\(\s*["\']([^"\']+)["\']\s*\)',
    ]
    
    for p in patterns:
        m = re.search(p, clean_code, re.DOTALL | re.IGNORECASE)
        if m:
            return {
                "stdout": m.group(1).strip(),
                "stderr": "",
                "time_ms": 15,
                "success": True
            }

    # Nếu không khớp mẫu logic cụ thể, kiểm tra xem có chứa hàm Arduino cơ bản không
    has_setup = bool(re.search(r'void\s+setup\s*\(', clean_code))
    has_loop = bool(re.search(r'void\s+loop\s*\(', clean_code))
    has_main = bool(re.search(r'int\s+main\s*\(', clean_code))

    if not (has_setup and has_loop) and not has_main:
        return {
            "stdout": "",
            "stderr": "Lỗi cú pháp (Syntax Error): Thiếu cấu trúc hàm chuẩn setup()/loop() cho Arduino hoặc main() cho C++.",
            "time_ms": 5,
            "success": False
        }

    return {
        "stdout": "",
        "stderr": f"Logic đầu ra không khớp với tín hiệu kiểm thử '{val}'. Vui lòng kiểm tra lại điều kiện Serial / I/O.",
        "time_ms": 20,
        "success": False
    }


# ---------------------------------------------------------------------------
# Main entry point
# ---------------------------------------------------------------------------

async def run_code(
    file_content: bytes,
    filename: str,
    test_cases: list[dict],
    time_limit_ms: int = 5000,
) -> dict:
    """
    Chấm bài: detect ngôn ngữ → chạy từng test case → tính điểm → trả JSON kết quả.
    Đạt chuẩn DF-01 & DF-04: Lưu LogLoi chi tiết, xác định passed_all (100% test case pass).
    """
    language = detect_language(filename)
    logs: list[str] = [f"=== STEM JUDGE ENGINE ==="]
    logs.append(f"Ngôn ngữ: {language.upper()} | Tệp: {filename} | Số TestCase: {len(test_cases)}")

    results: list[dict] = []
    total_weight = 0.0
    passed_weight = 0.0

    raw_code = file_content.decode("utf-8", errors="replace")

    for idx, tc in enumerate(test_cases):
        tc_id = tc.get("id") or tc.get("MaTestCase") or f"tc_{idx + 1}"
        input_data = str(tc.get("input") if tc.get("input") is not None else tc.get("DuLieuDauVao", ""))
        expected_raw = str(tc.get("expected_output") if tc.get("expected_output") is not None else tc.get("KetQuaDauRa", ""))
        weight = float(tc.get("weight") or tc.get("TrongSoDiem") or 1.0)
        hint = tc.get("hint") or tc.get("GoiYSuaLoi") or ""

        total_weight += weight

        if language == "python":
            loop = asyncio.get_event_loop()
            run_result = await loop.run_in_executor(
                None,
                run_python_code,
                raw_code,
                input_data,
                time_limit_ms,
            )
        elif language in ("arduino", "cpp"):
            loop = asyncio.get_event_loop()
            run_result = await loop.run_in_executor(
                None,
                simulate_arduino_cpp,
                raw_code,
                input_data,
            )
        else:
            run_result = {
                "stdout": "",
                "stderr": f"Lỗi: Định dạng file '{filename}' không được hỗ trợ (chỉ nhận .ino, .cpp, .py).",
                "time_ms": 0,
                "success": False,
            }

        actual_output = run_result["stdout"].strip()
        expected_output = expected_raw.strip()
        passed = run_result["success"] and (actual_output == expected_output)

        if passed:
            passed_weight += weight

        error_detail = ""
        if not passed:
            if run_result.get("stderr"):
                error_detail = run_result["stderr"].strip()
            else:
                error_detail = f"Sai kết quả đầu ra (Wrong Answer). Mong đợi: '{expected_output}', Thực tế: '{actual_output}'."
            if hint:
                error_detail += f" [Gợi ý: {hint}]"

        tc_log = (
            f"Test #{tc_id}: {'[PASS]' if passed else '[FAIL]'} "
            f"({run_result['time_ms']}ms, Trọng số: {weight}) - "
            f"Input: '{input_data}' | Expected: '{expected_output}' | Actual: '{actual_output}'"
        )
        if error_detail:
            tc_log += f"\n  -> Chi tiết lỗi: {error_detail}"

        logs.append(tc_log)
        logger.info(tc_log)

        results.append(
            {
                "test_case_id": tc_id,
                "passed": passed,
                "actual_output": actual_output,
                "expected_output": expected_output,
                "time_ms": run_result["time_ms"],
                "error_log": error_detail,
            }
        )

    # Tính điểm theo thang 10
    max_score = 10.0
    total_score = round((passed_weight / total_weight * max_score) if total_weight > 0 else 0.0, 2)
    passed_all = (len(results) > 0 and all(r["passed"] for r in results))

    total_time_ms = sum(r["time_ms"] for r in results)

    summary_log = f"\n=== KẾT QUẢ CHẤM: {total_score}/{max_score} điểm | {'ĐẠT 100% TEST CASE (Kích hoạt DF-01)' if passed_all else 'CHƯA ĐẠT 100%'} ==="
    logs.append(summary_log)
    full_log_str = "\n".join(logs)

    return {
        "success": True,
        "language": language,
        "results": results,
        "passed_all": passed_all,
        "total_score": total_score,
        "max_score": max_score,
        "total_time_ms": total_time_ms,
        "log": full_log_str,
    }
