# Test Admin Authentication Script

Write-Host "Testing Admin Authentication..." -ForegroundColor Yellow

# Step 1: Test public endpoint first
Write-Host "1. Testing public campaigns endpoint..." -ForegroundColor Cyan
try {
    $publicResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/campaign/public" -Method GET
    Write-Host "Public endpoint working. Found $($publicResponse.totalCount) campaigns" -ForegroundColor Green
} catch {
    Write-Host "Public endpoint failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Test admin login  
Write-Host "2. Testing admin login..." -ForegroundColor Cyan
$loginBody = @{
    email = "admin@admin.com"
    password = "Admin123!"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "Admin login successful!" -ForegroundColor Green
    Write-Host "User Type: $($loginResponse.user.userType)" -ForegroundColor Green
    $token = $loginResponse.token
    Write-Host "Token length: $($token.Length) characters" -ForegroundColor Green
} catch {
    Write-Host "Admin login failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 3: Test admin campaigns endpoint
Write-Host "3. Testing admin campaigns endpoint..." -ForegroundColor Cyan
$headers = @{
    "Authorization" = "Bearer $token"
    "Content-Type" = "application/json"
}

try {
    $adminResponse = Invoke-RestMethod -Uri "http://localhost:5000/api/campaign/admin/all" -Method GET -Headers $headers
    Write-Host "Admin campaigns endpoint working!" -ForegroundColor Green
    Write-Host "Found $($adminResponse.totalCount) campaigns for admin" -ForegroundColor Green
} catch {
    Write-Host "Admin campaigns failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test completed!" -ForegroundColor Yellow