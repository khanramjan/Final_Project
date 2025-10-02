# 🔒 SECURE EMAIL SETUP SCRIPT
# This script sets environment variables WITHOUT exposing credentials in Git

Write-Host "================================" -ForegroundColor Red
Write-Host "SECURE Email Configuration Setup" -ForegroundColor Red
Write-Host "================================" -ForegroundColor Red
Write-Host ""
Write-Host "⚠️  IMPORTANT: This keeps your password OUT of Git!" -ForegroundColor Yellow
Write-Host ""

# Get email password securely
Write-Host "Enter your Gmail App Password (16 characters, no spaces):" -ForegroundColor Green
Write-Host "Get it from: https://myaccount.google.com/apppasswords" -ForegroundColor Cyan
$securePassword = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Set environment variable for current session
$env:EMAIL_PASSWORD = $password
Write-Host ""
Write-Host "✅ Environment variable set for current session!" -ForegroundColor Green

# Ask if user wants to set it permanently
Write-Host ""
Write-Host "Do you want to set this permanently for your user account? (Y/N)" -ForegroundColor Yellow
$setPermanent = Read-Host

if ($setPermanent -eq "Y" -or $setPermanent -eq "y") {
    [System.Environment]::SetEnvironmentVariable("EMAIL_PASSWORD", $password, [System.EnvironmentVariableTarget]::User)
    Write-Host "✅ Environment variable set permanently for your user account!" -ForegroundColor Green
    Write-Host "⚠️  You may need to restart your terminal/IDE for it to take effect." -ForegroundColor Yellow
} else {
    Write-Host "ℹ️  Environment variable is only set for this session." -ForegroundColor Cyan
    Write-Host "   You'll need to run this script again after restart." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Your password is now in environment variable EMAIL_PASSWORD" -ForegroundColor White
Write-Host "  2. It's NOT in appsettings.json or Git" -ForegroundColor White
Write-Host "  3. Start backend: cd backend\DonationManagementSystem.API && dotnet run" -ForegroundColor White
Write-Host ""
Write-Host "🔒 Security:" -ForegroundColor Cyan
Write-Host "  ✅ Password is NOT in version control" -ForegroundColor Green
Write-Host "  ✅ Safe from Git Guardian alerts" -ForegroundColor Green
Write-Host "  ✅ Can be changed without editing code" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
