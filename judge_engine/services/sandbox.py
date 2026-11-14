"""
sandbox.py – Wrapper chạy code cô lập cho STEM Judge Engine.
Hỗ trợ: Python (.py), C++ (.cpp), Arduino (.ino).
"""
import os
import sys
import re
import subprocess
import tempfile
import time
from typing import Optional

# Thư mục chứa arduino_mock.h
_SERVICES_DIR = os.path.dirname(os.path.abspath(__file__))


class Sandbox:
    """Chạy code học sinh trong tiến trình con cô lập."""

    DEFAULT_TIMEOUT = 3.0  # giây – đảm bảo NFR-01 < 10s

    def run(
        self,
        code: str,
        lang: str,
        stdin: str = "",
        timeout: Optional[float] = None,
    ) -> dict:
        """
        Chạy code và trả về dict:
        {stdout, stderr, exit_code, time_ms, lang}
        """
        t = timeout or self.DEFAULT_TIMEOUT
        if lang == "python":
            return self._run_python(code, stdin, t)
        elif lang in ("cpp", "arduino"):
            return self._run_cpp(code, stdin, t, lang)
        else:
            return {
                "stdout": "",
                "stderr": f"Ngôn ngữ '{lang}' không được hỗ trợ. Chỉ nhận .py, .cpp, .ino.",
                "exit_code": -1,
                "time_ms": 0,
                "lang": lang,
            }

    # ------------------------------------------------------------------
    def _run_python(self, code: str, stdin: str, timeout: float) -> dict:
        tmp_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=".py", delete=False, encoding="utf-8"
            ) as f:
                f.write(code)
                tmp_path = f.name

            start = time.monotonic()
            proc = subprocess.run(
                [sys.executable, tmp_path],
                input=stdin,
                capture_output=True,
                text=True,
                timeout=timeout,
                encoding="utf-8",
                errors="replace",
            )
            elapsed = int((time.monotonic() - start) * 1000)
            return {
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "exit_code": proc.returncode,
                "time_ms": elapsed,
                "lang": "python",
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"Lỗi Vượt Giới Hạn Thời Gian: Chương trình chạy quá {int(timeout*1000)} ms.",
                "exit_code": -1,
                "time_ms": int(timeout * 1000),
                "lang": "python",
            }
        except Exception as e:
            return {
                "stdout": "",
                "stderr": f"Lỗi hệ thống: {e}",
                "exit_code": -1,
                "time_ms": 0,
                "lang": "python",
            }
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except OSError:
                    pass

    # ------------------------------------------------------------------
    def _run_cpp(self, code: str, stdin: str, timeout: float, lang: str) -> dict:
        """Compile bằng g++ với arduino_mock.h, chạy executable."""
        # Kiểm tra g++ có sẵn không
        if not self._has_gpp():
            return self._fallback_cpp(code, stdin, lang)

        src_suffix = ".ino" if lang == "arduino" else ".cpp"
        src_path = None
        exe_path = None
        try:
            with tempfile.NamedTemporaryFile(
                mode="w", suffix=src_suffix, delete=False, encoding="utf-8"
            ) as f:
                f.write(code)
                src_path = f.name

            exe_path = src_path.replace(src_suffix, ".exe" if os.name == "nt" else "")

            # Thêm #include arduino mock nếu là Arduino
            include_flag = []
            if lang == "arduino":
                mock_path = os.path.join(_SERVICES_DIR, "arduino_mock.h")
                include_flag = [f"-include{mock_path}", "-lstdc++"]

            compile_cmd = [
                "g++", "-std=c++17", "-O0", "-o", exe_path, src_path
            ] + include_flag

            comp_start = time.monotonic()
            comp = subprocess.run(
                compile_cmd,
                capture_output=True, text=True, timeout=15.0,
                encoding="utf-8", errors="replace"
            )
            if comp.returncode != 0:
                return {
                    "stdout": "",
                    "stderr": comp.stderr,
                    "exit_code": comp.returncode,
                    "time_ms": int((time.monotonic() - comp_start) * 1000),
                    "lang": lang,
                }

            # Chạy executable
            run_start = time.monotonic()
            proc = subprocess.run(
                [exe_path],
                input=stdin,
                capture_output=True, text=True, timeout=timeout,
                encoding="utf-8", errors="replace"
            )
            elapsed = int((time.monotonic() - run_start) * 1000)
            return {
                "stdout": proc.stdout,
                "stderr": proc.stderr,
                "exit_code": proc.returncode,
                "time_ms": elapsed,
                "lang": lang,
            }
        except subprocess.TimeoutExpired:
            return {
                "stdout": "",
                "stderr": f"Lỗi Vượt Giới Hạn Thời Gian: Chương trình chạy quá {int(timeout*1000)} ms.",
                "exit_code": -1,
                "time_ms": int(timeout * 1000),
                "lang": lang,
            }
        except Exception as e:
            return self._fallback_cpp(code, stdin, lang)
        finally:
            for p in [src_path, exe_path]:
                if p and os.path.exists(p):
                    try:
                        os.remove(p)
                    except OSError:
                        pass

    def _has_gpp(self) -> bool:
        try:
            subprocess.run(["g++", "--version"], capture_output=True, timeout=3)
            return True
        except (FileNotFoundError, subprocess.TimeoutExpired):
            return False

    def _fallback_cpp(self, code: str, stdin: str, lang: str) -> dict:
        """Fallback Evaluator bằng regex khi không có g++."""
        from services.runner import simulate_arduino_cpp
        result = simulate_arduino_cpp(code, stdin)
        result["lang"] = lang
        result["exit_code"] = 0 if result.get("success") else 1
        return result
