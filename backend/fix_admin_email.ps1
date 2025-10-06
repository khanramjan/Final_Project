# Fix Admin Email Verification
# Run this script to update existing admin accounts to have verified email

Write-Host "🔧 Fixing Admin Email Verification..." -ForegroundColor Cyan

$sqlScript = @"
USE DonationDB;

UPDATE Users
SET IsEmailVerified = 1
WHERE UserType = 'admin';

SELECT 
    Id, 
    Email, 
    FirstName, 
    LastName, 
    UserType, 
    IsActive, 
    IsEmailVerified,
    CreatedAt
FROM Users
WHERE UserType = 'admin';
"@

try {
    # Run the SQL script
    sqlcmd -S "RAMJAN\SQLEXPRESS" -Q $sqlScript
    
    Write-Host "✅ Admin email verification fixed!" -ForegroundColor Green
    Write-Host "📧 Admin users can now login without email verification" -ForegroundColor Yellow
}
catch {
    Write-Host "❌ Error: $_" -ForegroundColor Red
    Write-Host "💡 You can also run the SQL script manually: FIX_ADMIN_EMAIL_VERIFICATION.sql" -ForegroundColor Yellow
}
