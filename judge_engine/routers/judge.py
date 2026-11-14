import json
import logging
import time as _time
from typing import Optional
from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel
from services.runner import run_code

logger = logging.getLogger(__name__)

router = APIRouter()


class JudgeJsonRequest(BaseModel):
    code: str
    filename: Optional[str] = "solution.py"
    test_cases: list[dict]
    time_limit_ms: Optional[int] = 5000


@router.post("/judge")
async def judge_code_multipart(
    file: UploadFile = File(...),
    test_cases: str = Form(...),
    time_limit_ms: int = Form(5000),
):
    """
    Nhận file code (.py/.cpp/.ino), danh sách test case qua multipart/form-data.
    """
    try:
        parsed_test_cases = json.loads(test_cases)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=422, detail=f"test_cases không hợp lệ JSON: {exc}") from exc

    if not isinstance(parsed_test_cases, list) or len(parsed_test_cases) == 0:
        raise HTTPException(status_code=422, detail="test_cases phải là JSON array không rỗng")

    file_content = await file.read()
    filename = file.filename or "submission.py"

    result = await run_code(
        file_content=file_content,
        filename=filename,
        test_cases=parsed_test_cases,
        time_limit_ms=time_limit_ms,
    )
    return result


@router.post("/judge-json")
async def judge_code_json(payload: JudgeJsonRequest):
    """
    Nhận code trực tiếp dạng JSON string, thuận tiện gọi API nhanh.
    """
    if not payload.test_cases:
        raise HTTPException(status_code=422, detail="test_cases không được rỗng")

    result = await run_code(
        file_content=payload.code.encode("utf-8"),
        filename=payload.filename or "submission.py",
        test_cases=payload.test_cases,
        time_limit_ms=payload.time_limit_ms or 5000,
    )
    return result


@router.get("/status")
async def judge_status():
    """
    Trả trạng thái Online/Offline, độ trễ và ngôn ngữ hỗ trợ của Judge Engine.
    """
    start = _time.monotonic()
    latency_ms = int((_time.monotonic() - start) * 1000)
    return {
        "online": True,
        "latency_ms": latency_ms,
        "supported_langs": ["Python", "C++", "Arduino"],
        "version": "2.0.0",
        "service": "STEM Robotic Judge Engine",
    }
