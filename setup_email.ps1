# Quick Email Configuration Script
# Run this script to quickly update your email settings

Write-Host "================================" -ForegroundColor Cyan
Write-Host "Email Verification Setup Wizard" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This wizard will help you configure email verification." -ForegroundColor Yellow
Write-Host ""

# Get email configuration
Write-Host "Enter your Gmail address (e.g., yourname@gmail.com):" -ForegroundColor Green
$email = Read-Host

Write-Host ""
Write-Host "Enter your Gmail App Password (16 characters, no spaces):" -ForegroundColor Green
Write-Host "Don't have one? Get it here: https://myaccount.google.com/apppasswords" -ForegroundColor Yellow
$password = Read-Host -AsSecureString
$passwordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($password))

Write-Host ""
Write-Host "Enter your display name (e.g., Donation Management System):" -ForegroundColor Green
$displayName = Read-Host

# Path to appsettings.json
$appsettingsPath = ".\backend\DonationManagementSystem.API\appsettings.json"

if (Test-Path $appsettingsPath) {
    Write-Host ""
    Write-Host "Reading current configuration..." -ForegroundColor Yellow
    
    # Read the JSON file
    $json = Get-Content $appsettingsPath -Raw | ConvertFrom-Json
    
    # Update email settings
    $json.Email.FromEmail = $email
    $json.Email.Username = $email
    $json.Email.Password = $passwordPlain
    $json.Email.FromName = $displayName
    
    # Save the updated JSON
    $json | ConvertTo-Json -Depth 10 | Set-Content $appsettingsPath
    
    Write-Host ""
    Write-Host "✅ Configuration updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Email Settings:" -ForegroundColor Cyan
    Write-Host "  From Email: $email" -ForegroundColor White
    Write-Host "  Display Name: $displayName" -ForegroundColor White
    Write-Host "  SMTP Host: smtp.gmail.com" -ForegroundColor White
    Write-Host "  SMTP Port: 587" -ForegroundColor White
    Write-Host ""
    Write-Host "🚀 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Start backend: cd backend\DonationManagementSystem.API && dotnet run" -ForegroundColor White
    Write-Host "  2. Start frontend: cd frontend && npm run dev" -ForegroundColor White
    Write-Host "  3. Register a new user to test email verification" -ForegroundColor White
    Write-Host ""
    Write-Host "📧 Check your email inbox for verification emails!" -ForegroundColor Yellow
    
} else {
    Write-Host ""
    Write-Host "❌ Error: appsettings.json not found at $appsettingsPath" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
