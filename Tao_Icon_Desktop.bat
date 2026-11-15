@echo off
title Tao Shortcut Desktop - STEM Robotic Edu
chcp 65001 >nul
cd /d "%~dp0"

echo ==========================================================
echo    TAO LOI TAT DESKTOP CHO HE THONG STEM ROBOTIC EDU
echo ==========================================================
echo.
echo [*] Dang tao loi tat "STEM Robotic Edu" tren man hinh Desktop...

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$ws = New-Object -ComObject WScript.Shell; $desktop = [System.Environment]::GetFolderPath('Desktop'); $shortcutPath = Join-Path $desktop 'STEM Robotic Edu.lnk'; $targetPath = Join-Path '%~dp0' 'Start_STEM_Robotic.bat'; $s = $ws.CreateShortcut($shortcutPath); $s.TargetPath = $targetPath; $s.WorkingDirectory = '%~dp0'; $s.Description = 'He thong Hoc tap & Quan ly Dao tao STEM Robotic Cap Trung Hoc'; $s.IconLocation = '%SystemRoot%\System32\shell32.dll,14'; $s.Save(); Write-Host '[✓] DA TAO LOI TAT THANH CONG TAI DESKTOP:' -ForegroundColor Green; Write-Host ('    ' + $shortcutPath) -ForegroundColor Cyan"

echo.
echo Hoan tat! Ban co the ra man hinh Desktop va nhap dup vao "STEM Robotic Edu" de bat dau.
echo.
pause
