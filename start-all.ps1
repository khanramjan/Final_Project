# 🚀 START BOTH SERVERS (Backend + Frontend)
# This script starts both servers in separate windows

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║    Starting Donation Management System Servers        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$scriptPath = $PSScriptRoot

# Start Backend in new window
Write-Host "🔧 Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-backend.ps1" -WorkingDirectory $scriptPath

Start-Sleep -Seconds 2

# Start Frontend in new window
Write-Host "��� Starting Frontend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-File", "$scriptPath\start-frontend.ps1" -WorkingDirectory $scriptPath

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ Both Servers Starting!                 ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "Backend will be on: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will be on: http://localhost:5173 or 5174" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Two new windows opened for backend and frontend" -ForegroundColor Yellow
Write-Host "   Check those windows for server status" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
