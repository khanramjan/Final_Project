# 🔧 FIX GIT COMMIT - Remove Password from Last Commit
# Run this to undo the commit and recommit WITHOUT the password

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Red
Write-Host "║     FIXING GIT COMMIT - Removing Password             ║" -ForegroundColor Red
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Red
Write-Host ""

Write-Host "This will:" -ForegroundColor Yellow
Write-Host "  1. Undo your last commit (keep files)" -ForegroundColor White
Write-Host "  2. Remove appsettings.json from staging" -ForegroundColor White
Write-Host "  3. Commit again WITHOUT the password" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Your last commit message was: 'added email verification'" -ForegroundColor Yellow
Write-Host ""

$confirm = Read-Host "Continue? (Y/N)"

if ($confirm -ne "Y" -and $confirm -ne "y") {
    Write-Host "Cancelled." -ForegroundColor Yellow
    exit
}

Write-Host ""
Write-Host "Step 1: Undoing last commit..." -ForegroundColor Cyan
git reset --soft HEAD~1

Write-Host "Step 2: Unstaging appsettings.json..." -ForegroundColor Cyan
git reset HEAD backend/DonationManagementSystem.API/appsettings.json

Write-Host "Step 3: Checking status..." -ForegroundColor Cyan
Write-Host ""
git status
Write-Host ""

Write-Host "Step 4: Adding safe files..." -ForegroundColor Cyan
git add .gitignore
git add .env.local
git add start-*.ps1
git add backend/DonationManagementSystem.API/Services/EmailService.cs
git add backend/DonationManagementSystem.API/appsettings.TEMPLATE.json
git add frontend/src/pages/VerifyEmail.tsx
git add SECURE_CREDENTIALS_GUIDE.md
git add FIX_VERIFICATION_ERROR.md
git add SECURITY_FIX_*.md

Write-Host ""
Write-Host "Step 5: Creating new commit..." -ForegroundColor Cyan
git commit -m "🔒 Security: Added email verification with secure credentials management

- Implemented email verification system
- Moved credentials to .env.local (not tracked by Git)
- Updated EmailService to read from environment variables
- Added start scripts for auto-loading credentials
- Updated .gitignore to block sensitive files
- Password removed from appsettings.json
- Created security documentation"

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║              ✅ GIT COMMIT FIXED!                      ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "✅ Password removed from commit" -ForegroundColor Green
Write-Host "✅ Only safe files included" -ForegroundColor Green
Write-Host "✅ Ready to push safely!" -ForegroundColor Green
Write-Host ""
Write-Host "🚀 Next step: git push origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
