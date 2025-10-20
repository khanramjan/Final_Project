@echo off
echo ========================================
echo Starting Backend and Frontend
echo ========================================
echo.

REM Kill existing processes
echo [1/3] Stopping existing processes...
taskkill /F /IM DonationManagementSystem.API.exe >nul 2>&1
taskkill /F /IM node.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Done.
echo.

REM Start Backend
echo [2/3] Starting Backend on port 5000...
cd /d "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\backend\DonationManagementSystem.API"
start "Backend Server" cmd /k "echo Backend Starting... && dotnet run"
timeout /t 3 /nobreak >nul
echo Backend starting in new window...
echo.

REM Start Frontend
echo [3/3] Starting Frontend on port 5173...
cd /d "C:\Users\DELL\Desktop\Final Project\Donation_Management_System\frontend"
start "Frontend Server" cmd /k "echo Frontend Starting... && npm run dev"
timeout /t 2 /nobreak >nul
echo Frontend starting in new window...
echo.

echo ========================================
echo SERVERS STARTING
echo ========================================
echo.
echo Backend: http://localhost:5000
echo Frontend: http://localhost:5173
echo.
echo Wait 10 seconds for servers to start, then:
echo   1. Open: http://localhost:5173/campaigns
echo   2. Make a donation
echo   3. Click Success on SSLCommerz popup
echo   4. Watch backend window for logs
echo   5. Success page should appear!
echo.
pause
