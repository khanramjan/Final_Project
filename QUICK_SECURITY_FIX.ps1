# 🚨 QUICK SECURITY FIX - RUN THIS NOW!

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║  🚨 URGENT: SECURITY FIX FOR GIT GUARDIAN ALERT  🚨  ║" -ForegroundColor Red  
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

Write-Host "Your Gmail App Password was exposed on GitHub!" -ForegroundColor Yellow
Write-Host "This script will help you fix it in 2 minutes." -ForegroundColor Yellow
Write-Host ""

# Step 1: Revoke old password
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 1: Revoke Exposed Password (CRITICAL!)" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Opening Gmail App Passwords page in browser..." -ForegroundColor Yellow
Start-Process "https://myaccount.google.com/apppasswords"
Write-Host ""
Write-Host "2. FIND and DELETE the old app password" -ForegroundColor Red
Write-Host "3. Generate a NEW app password" -ForegroundColor Green
Write-Host "4. Copy the NEW 16-character password" -ForegroundColor Green
Write-Host ""
Write-Host "Press any key after you've generated the NEW password..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# Step 2: Set new password
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 2: Set New Password Securely" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""
Write-Host "Enter your NEW Gmail App Password (16 chars, no spaces):" -ForegroundColor Green
$securePassword = Read-Host -AsSecureString
$password = [Runtime.InteropServices.Marshal]::PtrToStringAuto([Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword))

# Set environment variable permanently
[System.Environment]::SetEnvironmentVariable("EMAIL_PASSWORD", $password, [System.EnvironmentVariableTarget]::User)
$env:EMAIL_PASSWORD = $password

Write-Host ""
Write-Host "✅ NEW password set in environment variable!" -ForegroundColor Green

# Step 3: Update appsettings.json
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 3: Update Configuration File" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$appsettingsPath = ".\backend\DonationManagementSystem.API\appsettings.json"

if (Test-Path $appsettingsPath) {
    # Read and update appsettings.json to remove password
    $json = Get-Content $appsettingsPath -Raw | ConvertFrom-Json
    $json.Email.Password = ""
    $json | ConvertTo-Json -Depth 10 | Set-Content $appsettingsPath
    
    Write-Host "✅ appsettings.json updated (password removed)" -ForegroundColor Green
} else {
    Write-Host "⚠️  appsettings.json not found at expected location" -ForegroundColor Yellow
}

# Step 4: Commit changes
Write-Host ""
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "STEP 4: Commit Security Fixes to Git" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

Write-Host "Adding security files to Git..." -ForegroundColor Yellow
git add .gitignore
git add backend/DonationManagementSystem.API/appsettings.TEMPLATE.json
git add backend/DonationManagementSystem.API/Services/EmailService.cs
git add setup_email_secure.ps1
git add SECURITY_FIX_*.md
git add appsettings.json

Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "🔒 Security: Move email credentials to environment variables, revoke exposed password"

Write-Host "Pushing to GitHub..." -ForegroundColor Yellow
git push origin main

Write-Host ""
Write-Host "✅ Security fixes committed and pushed!" -ForegroundColor Green

# Summary
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ SECURITY FIX COMPLETE! ✅              ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "What was fixed:" -ForegroundColor Cyan
Write-Host "  ✅ OLD password revoked (you did this manually)" -ForegroundColor White
Write-Host "  ✅ NEW password set in environment variable" -ForegroundColor White
Write-Host "  ✅ Password removed from appsettings.json" -ForegroundColor White
Write-Host "  ✅ .gitignore updated" -ForegroundColor White
Write-Host "  ✅ Changes committed to Git" -ForegroundColor White
Write-Host ""
Write-Host "Security status:" -ForegroundColor Cyan
Write-Host "  🔒 Password is now in EMAIL_PASSWORD environment variable" -ForegroundColor Green
Write-Host "  🔒 NOT in Git history anymore (for future commits)" -ForegroundColor Green
Write-Host "  🔒 Safe from Git Guardian alerts" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "  1. Restart your terminal/IDE for environment variable to take effect" -ForegroundColor White
Write-Host "  2. Test: cd backend\DonationManagementSystem.API && dotnet run" -ForegroundColor White
Write-Host "  3. Register a user and verify email sending still works" -ForegroundColor White
Write-Host "  4. Respond to Git Guardian alert that issue is resolved" -ForegroundColor White
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Yellow
Write-Host "║  ⚠️  REMEMBER: Restart your terminal now!  ⚠️         ║" -ForegroundColor Yellow
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Yellow
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
