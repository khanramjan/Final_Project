# Stop any running backend process
Write-Host "Stopping backend..." -ForegroundColor Yellow
Get-Process -Name "DonationManagementSystem.API" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 2

# Start backend
Write-Host "Starting backend..." -ForegroundColor Green
Set-Location "backend\DonationManagementSystem.API"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "dotnet run"
Set-Location "..\..\"

Write-Host "Backend restarted successfully!" -ForegroundColor Green
Write-Host "The backend is now running on http://localhost:5000" -ForegroundColor Cyan
