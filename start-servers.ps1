# Start Both Servers Script

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Starting Backend and Frontend" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Kill any existing processes
Write-Host "[1/3] Cleaning up existing processes..." -ForegroundColor Yellow
Get-Process -Name "DonationManagementSystem.API" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Cleanup complete" -ForegroundColor Green
Write-Host ""

# Start Backend
Write-Host "[2/3] Starting Backend on port 5000..." -ForegroundColor Yellow
$backendPath = "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\backend\DonationManagementSystem.API"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host 'Backend Starting...' -ForegroundColor Green; dotnet run"
Start-Sleep -Seconds 3
Write-Host "✓ Backend starting..." -ForegroundColor Green
Write-Host ""

# Start Frontend
Write-Host "[3/3] Starting Frontend on port 5173..." -ForegroundColor Yellow
$frontendPath = "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\frontend"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host 'Frontend Starting...' -ForegroundColor Green; npm run dev"
Start-Sleep -Seconds 2
Write-Host "✓ Frontend starting..." -ForegroundColor Green
Write-Host ""

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "SERVERS STARTING" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "⏳ Wait 10 seconds for servers to fully start..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Then test:" -ForegroundColor White
Write-Host "  1. Open: http://localhost:5173/campaigns" -ForegroundColor Cyan
Write-Host "  2. Click 'Donate Now'" -ForegroundColor Cyan
Write-Host "  3. Complete donation" -ForegroundColor Cyan
Write-Host "  4. Click 'Success' on SSLCommerz popup" -ForegroundColor Cyan
Write-Host "  5. Success page will show ✓" -ForegroundColor Green
Write-Host "  6. Campaign progress will be updated ✓" -ForegroundColor Green
Write-Host ""
Write-Host "Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5173" -ForegroundColor Cyan
Write-Host ""
