Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Complete System Restart Script" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Kill all existing processes
Write-Host "[1/5] Stopping all existing processes..." -ForegroundColor Yellow
Get-Process -Name "DonationManagementSystem.API" -ErrorAction SilentlyContinue | Stop-Process -Force
Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -like "*vite*" } | Stop-Process -Force
Start-Sleep -Seconds 2
Write-Host "✓ Processes stopped" -ForegroundColor Green
Write-Host ""

# Step 2: Clean build artifacts
Write-Host "[2/5] Cleaning build artifacts..." -ForegroundColor Yellow
if (Test-Path "backend\DonationManagementSystem.API\bin") {
    Remove-Item -Path "backend\DonationManagementSystem.API\bin" -Recurse -Force -ErrorAction SilentlyContinue
}
if (Test-Path "backend\DonationManagementSystem.API\obj") {
    Remove-Item -Path "backend\DonationManagementSystem.API\obj" -Recurse -Force -ErrorAction SilentlyContinue
}
Write-Host "✓ Clean complete" -ForegroundColor Green
Write-Host ""

# Step 3: Start Backend
Write-Host "[3/5] Starting backend on port 5000..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\DELL\Desktop\Final Project\Donation_Management_System\backend\DonationManagementSystem.API'; Write-Host 'Starting Backend...' -ForegroundColor Green; dotnet run"
Write-Host "✓ Backend starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 5
Write-Host ""

# Step 4: Start Frontend
Write-Host "[4/5] Starting frontend on port 5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\DELL\Desktop\Final Project\Donation_Management_System\frontend'; Write-Host 'Starting Frontend...' -ForegroundColor Green; npm run dev"
Write-Host "✓ Frontend starting in new window..." -ForegroundColor Green
Start-Sleep -Seconds 3
Write-Host ""

# Step 5: Instructions
Write-Host "[5/5] System Status" -ForegroundColor Yellow
Write-Host ""
Write-Host "✓ Backend should be starting at: http://localhost:5000" -ForegroundColor Green
Write-Host "✓ Frontend should be starting at: http://localhost:5173" -ForegroundColor Green
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "NEXT STEPS:" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "1. Wait 10 seconds for both servers to fully start" -ForegroundColor White
Write-Host "2. Open browser: http://localhost:5173" -ForegroundColor White
Write-Host "3. Test direct URL: http://localhost:5173/payment/success?tran_id=TEST&value_b=1" -ForegroundColor White
Write-Host "4. If you see the success page, everything is working!" -ForegroundColor White
Write-Host "5. If still 404, press F12 in browser and check Console tab for errors" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to exit this script..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
