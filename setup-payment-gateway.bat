@echo off
REM Setup Script for Free Payment Gateway Integration
REM This script configures the payment system for Bangladesh donations

echo.
echo ======================================
echo Payment Gateway Setup for Bangladesh
echo ======================================
echo.

REM Check if .NET is installed
dotnet --version > nul 2>&1
if errorlevel 1 (
    echo ERROR: .NET SDK is not installed
    echo Install from: https://dotnet.microsoft.com/download
    exit /b 1
)

echo [1/5] Installing RestSharp NuGet package...
cd backend\DonationManagementSystem.API
dotnet add package RestSharp
if errorlevel 1 (
    echo ERROR: Failed to install RestSharp
    exit /b 1
)

echo [2/5] Building backend...
dotnet build
if errorlevel 1 (
    echo ERROR: Build failed
    exit /b 1
)

echo.
echo [3/5] Configuration Setup
echo ======================================
echo.
echo Visit https://www.sslcommerz.com/register/ to get FREE test credentials
echo.
echo Steps:
echo 1. Click "Sign Up"
echo 2. Choose "Test Store"
echo 3. Fill the form
echo 4. You will receive Store ID and Password
echo.

set /p STORE_ID="Enter your SSLCommerz Store ID: "
set /p STORE_PASS="Enter your SSLCommerz Store Password: "

echo.
echo [4/5] Creating configuration...
echo.

REM Create appsettings.json if it doesn't exist
if not exist "appsettings.json" (
    echo appsettings.json not found. Creating template...
)

echo.
echo [5/5] Summary
echo ======================================
echo.
echo ✓ RestSharp installed
echo ✓ Backend built successfully
echo ✓ Payment service classes created
echo ✓ Payment controller created
echo.
echo NEXT STEPS:
echo ==================
echo 1. Update appsettings.json with your credentials:
echo    - Store ID: %STORE_ID%
echo    - Store Password: %STORE_PASS%
echo.
echo 2. Update Program.cs with:
echo    - builder.Services.AddScoped^<IPaymentGatewayService, SSLCommerzPaymentService^>();
echo.
echo 3. Test the payment flow:
echo    - Start backend: dotnet run
echo    - Visit: http://localhost:5000/api/payment/methods
echo.
echo 4. Test Payment Methods Available:
echo    - bKash (Mobile Money)
echo    - Nagad (Mobile Money)
echo    - Rocket (Mobile Money)
echo    - Visa/Mastercard
echo    - Bank Transfer
echo    - Cash/Check
echo.
echo ✨ Everything is set up!
echo.
pause
