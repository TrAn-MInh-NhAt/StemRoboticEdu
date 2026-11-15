@echo off
title STEM Robotic Edu - Khoi Dong He Thong
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================================
echo       STEM ROBOTIC EDU - KHOI DONG HE THONG 1-CLICK
echo ==========================================================
echo.
echo [*] Dang khoi chay PowerShell voi quyen Bypass...

powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0STEM_Robotic_App.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [!] Co loi xay ra khi khoi chay he thong. Ma loi: %ERRORLEVEL%
    echo [*] Vui long kiem tra quyen thuc thi PowerShell hoac chay voi Administrator.
    pause
)
