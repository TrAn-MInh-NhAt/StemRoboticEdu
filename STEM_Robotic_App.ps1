$Host.UI.RawUI.WindowTitle = "STEM Robotic Edu - Control Panel (Port 80 & 5000)"
[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Xác định thư mục gốc dự án theo đường dẫn động của Script
$scriptDir = $PSScriptRoot
if (-not $scriptDir) { $scriptDir = (Get-Item .).FullName }

function Stop-AllServices {
    Write-Host "`n[!] Dang tat Web Server (Port 80), May cham (Port 5000) va ngat Link Public..." -ForegroundColor Yellow
    foreach ($p in @($script:cfProc, $script:webProc, $script:judgeProc)) {
        if ($p -and !$p.HasExited) {
            cmd /c "taskkill /F /T /PID $($p.Id) >nul 2>&1"
        }
    }
    Get-NetTCPConnection -LocalPort 80, 5000 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }
    Write-Host "[✓] DA DONG SACH CONG 80 & 5000!" -ForegroundColor Green
}

try {
    Clear-Host
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "       STEM ROBOTIC EDU - HE THONG DIEU KHIEN TAP TRUNG   " -ForegroundColor Cyan
    Write-Host "==========================================================" -ForegroundColor Cyan
    Write-Host "Thu muc goc: $scriptDir" -ForegroundColor DarkGray

    # Dọn sạch cổng trước khi bật
    Get-NetTCPConnection -LocalPort 80, 5000 -ErrorAction SilentlyContinue | ForEach-Object {
        Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue
    }

    # 1. Bật Judge Engine (Port 5000)
    Write-Host "`n[1/3] Dang bat May cham Judge Engine (Port 5000)..." -ForegroundColor Gray
    $pyExe = "python"
    if (Test-Path "$scriptDir\venv\Scripts\python.exe") { 
        $pyExe = "$scriptDir\venv\Scripts\python.exe" 
    } elseif (Test-Path "$scriptDir\judge_engine\venv\Scripts\python.exe") { 
        $pyExe = "$scriptDir\judge_engine\venv\Scripts\python.exe" 
    }
    $script:judgeProc = Start-Process -FilePath $pyExe -ArgumentList "-m uvicorn main:app --host 0.0.0.0 --port 5000" -WorkingDirectory "$scriptDir\judge_engine" -WindowStyle Hidden -PassThru

    # 2. Bật Web Server Node.js (Port 80)
    Write-Host "[2/3] Dang bat Web Server Node.js (Port 80)..." -ForegroundColor Gray
    $script:webProc = Start-Process -FilePath "node" -ArgumentList "server.js" -WorkingDirectory "$scriptDir\server" -WindowStyle Hidden -PassThru

    # 3. Tạo Link Public Cloudflare Tunnel (Tự động tải nếu chưa có)
    Write-Host "[3/3] Dang chuan bi Link Public truy cap tu xa..." -ForegroundColor Gray
    $cfExe = "$scriptDir\cloudflared.exe"
    if (-not (Test-Path $cfExe)) {
        Write-Host "  -> Chua tim thay cloudflared.exe tai thu muc goc." -ForegroundColor Yellow
        Write-Host "  -> Dang tu dong tai cloudflared.exe tu Cloudflare GitHub..." -ForegroundColor Yellow
        try {
            [Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12
            $cfDownloadUrl = "https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-windows-amd64.exe"
            Invoke-WebRequest -Uri $cfDownloadUrl -OutFile $cfExe -UseBasicParsing -TimeoutSec 60
            Write-Host "  -> Da tai cloudflared.exe thanh cong!" -ForegroundColor Green
        } catch {
            Write-Host "  -> Khong the tu dong tai cloudflared.exe ($($_.Exception.Message)). He thong tiep tuc chay tren localhost:80." -ForegroundColor Red
        }
    }

    $publicUrl = $null
    if (Test-Path $cfExe) {
        $cfLog = "$env:TEMP\stem_cf_tunnel.log"
        if (Test-Path $cfLog) { Remove-Item $cfLog -Force -ErrorAction SilentlyContinue }

        $script:cfProc = Start-Process -FilePath $cfExe -ArgumentList "tunnel --url http://localhost:80" -WorkingDirectory $scriptDir -RedirectStandardError $cfLog -WindowStyle Hidden -PassThru
        for ($i = 0; $i -lt 15; $i++) {
            Start-Sleep -Seconds 1
            if (Test-Path $cfLog) {
                $content = Get-Content $cfLog -Raw -ErrorAction SilentlyContinue
                if ($content -match "(https://[a-zA-Z0-9-]+\.trycloudflare\.com)") {
                    $publicUrl = $matches[1]
                    break
                }
            }
        }
    }

    # 4. Kích hoạt Watchdog giám sát: cứ tắt cửa sổ App (kể cả bấm [X]) là tự động giải phóng sạch Port 80 & 5000
    $pidList = (@($script:judgeProc.Id, $script:webProc.Id, $script:cfProc.Id) | Where-Object { $_ }) -join ','
    $watchScript = @"
Wait-Process -Id $PID -ErrorAction SilentlyContinue
foreach (`$id in @($pidList)) {
    cmd /c "taskkill /F /T /PID `$id >nul 2>&1"
}
Get-NetTCPConnection -LocalPort 80, 5000 -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id `$_.OwningProcess -Force -ErrorAction SilentlyContinue
}
"@
    $encodedCmd = [Convert]::ToBase64String([System.Text.Encoding]::Unicode.GetBytes($watchScript))
    Start-Process -FilePath "powershell.exe" -ArgumentList "-NoProfile -WindowStyle Hidden -EncodedCommand $encodedCmd" -WindowStyle Hidden

    Write-Host "`n----------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host " TRANG THAI: DANG HOAT DONG (PORT 80 & PORT 5000 SAN SANG)" -ForegroundColor Green
    Write-Host " - Link tren may ban : http://localhost" -ForegroundColor White
    if ($publicUrl) {
        Set-Clipboard -Value $publicUrl -ErrorAction SilentlyContinue
        Write-Host " - Link gui moi nguoi: $publicUrl" -ForegroundColor Cyan
        Write-Host "   (Da tu dong COPY link vao Clipboard - Bam Ctrl+V de gui)" -ForegroundColor DarkCyan
    } else {
        Write-Host " - Link Public       : Chua khoi tao (He thong van hoat dong tai http://localhost)" -ForegroundColor Yellow
    }
    Write-Host "----------------------------------------------------------" -ForegroundColor DarkGray
    Write-Host "`n>>> Bam phim [ENTER] hoac dau [X] de TAT HE THONG & KHOA 2 CONG <<<" -ForegroundColor Yellow

    Read-Host | Out-Null
}
finally {
    Stop-AllServices
}
