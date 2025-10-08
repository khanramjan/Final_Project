# Quick Fix Script for Volunteer Profile
# This script verifies and activates your volunteer profile

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Volunteer Profile Quick Fix" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Connection string - update if needed
$serverName = "localhost"
$databaseName = "DonationManagementSystem"

Write-Host "Connecting to database: $databaseName on $serverName..." -ForegroundColor Yellow

# SQL Query to check current profile
$checkQuery = @"
SELECT 
    vp.Id AS ProfileId,
    u.Email,
    u.FirstName + ' ' + u.LastName AS Name,
    vp.Status,
    vp.IsVerified,
    vp.Rank,
    vp.AcceptEmailNotifications
FROM VolunteerProfiles vp
JOIN Users u ON vp.UserId = u.Id;
"@

# SQL Query to fix the profile
$fixQuery = @"
-- Activate and verify the volunteer profile
UPDATE VolunteerProfiles 
SET Status = 'active', 
    IsVerified = 1, 
    VerifiedAt = GETDATE(),
    VerifiedBy = 2,
    AcceptEmailNotifications = 1,
    AcceptSmsNotifications = 1;

-- Show updated profile
SELECT 
    vp.Id AS ProfileId,
    u.Email,
    vp.Status,
    vp.IsVerified,
    vp.Rank,
    vp.AcceptEmailNotifications
FROM VolunteerProfiles vp
JOIN Users u ON vp.UserId = u.Id;
"@

try {
    Write-Host "`n1. Checking current volunteer profiles..." -ForegroundColor Yellow
    $checkResult = Invoke-Sqlcmd -ServerInstance $serverName -Database $databaseName -Query $checkQuery -TrustServerCertificate
    
    if ($checkResult) {
        Write-Host "`nCurrent Volunteer Profiles:" -ForegroundColor Cyan
        $checkResult | Format-Table -AutoSize
        
        Write-Host "`n2. Fixing volunteer profile..." -ForegroundColor Yellow
        $fixResult = Invoke-Sqlcmd -ServerInstance $serverName -Database $databaseName -Query $fixQuery -TrustServerCertificate
        
        Write-Host "`n✅ SUCCESS! Updated Volunteer Profiles:" -ForegroundColor Green
        $fixResult | Format-Table -AutoSize
        
        Write-Host "`n========================================" -ForegroundColor Green
        Write-Host "✅ Volunteer profile verified and activated!" -ForegroundColor Green
        Write-Host "========================================" -ForegroundColor Green
        
        Write-Host "`nNow you can:" -ForegroundColor Yellow
        Write-Host "1. Create a campaign requesting volunteers with YOUR rank" -ForegroundColor White
        Write-Host "2. Check 'Needs Volunteers' ☑️" -ForegroundColor White
        Write-Host "3. Set volunteer count for your rank (e.g., if rank is 'gold', set Gold = 1)" -ForegroundColor White
        Write-Host "4. Check 'Automatically send volunteer requests' ☑️" -ForegroundColor White
        Write-Host "5. Submit the campaign" -ForegroundColor White
        Write-Host "`nYou should receive the volunteer request!`n" -ForegroundColor Cyan
    }
    else {
        Write-Host "`n❌ No volunteer profiles found in database" -ForegroundColor Red
    }
}
catch {
    Write-Host "`n❌ ERROR: $_" -ForegroundColor Red
    Write-Host "`nMake sure:" -ForegroundColor Yellow
    Write-Host "1. SQL Server is running" -ForegroundColor White
    Write-Host "2. Database name is correct: $databaseName" -ForegroundColor White
    Write-Host "3. You have SqlServer PowerShell module installed" -ForegroundColor White
    Write-Host "   Run: Install-Module -Name SqlServer -AllowClobber" -ForegroundColor Gray
}
