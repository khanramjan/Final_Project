# ============================================================
# Render Environment Variable Setup Script
# Run this after getting your API key from:
# https://dashboard.render.com/u/settings -> API Keys
# ============================================================

# --- FILL THESE IN ---
$apiKey    = "YOUR_RENDER_API_KEY"   # from dashboard.render.com/u/settings
$serviceId = "YOUR_SERVICE_ID"       # from your service URL: dashboard.render.com/web/srv-XXXXXX

# --- ENV VARS TO SET ---
$envVars = @{
    "ConnectionStrings__DefaultConnection" = "Host=db.iohqieylqdoghlpeykzt.supabase.co;Port=5432;Database=postgres;Username=postgres;Password=@Rramjan_kh08;SSL Mode=Require;Trust Server Certificate=true;Pooling=false;"
    "Jwt__SecretKey"                       = "CHANGE_THIS_TO_A_SECURE_SECRET_KEY_AT_LEAST_32_CHARACTERS_LONG"
    "Jwt__Issuer"                          = "DonationManagementSystem.API"
    "Jwt__Audience"                        = "DonationManagementSystem.Client"
    "AppSettings__FrontendUrl"             = "https://donation-management-frontend-ten.vercel.app"
    "Email__SmtpHost"                      = "smtp.gmail.com"
    "Email__SmtpPort"                      = "587"
    "Email__FromEmail"                     = "001abuhanif001@gmail.com"
    "Email__FromName"                      = "Donation Management System"
    "Email__Username"                      = "001abuhanif001@gmail.com"
    "Email__Password"                      = "kaofzcrkpxjmgzhk"
    "Email__EnableSsl"                     = "true"
    "Sms__Provider"                        = "console"
}

$headers = @{
    "Authorization" = "Bearer $apiKey"
    "Content-Type"  = "application/json"
    "Accept"        = "application/json"
}

Write-Host "`n==> Setting environment variables on Render service: $serviceId`n"

foreach ($key in $envVars.Keys) {
    $url  = "https://api.render.com/v1/services/$serviceId/env-vars/$key"
    $body = @{ value = $envVars[$key] } | ConvertTo-Json

    try {
        $result = Invoke-RestMethod -Uri $url -Method Put -Headers $headers -Body $body
        Write-Host "  [OK] $key"
    } catch {
        Write-Host "  [FAIL] $key - $($_.Exception.Message)"
    }
}

Write-Host "`n==> Triggering redeploy..."
$deployUrl = "https://api.render.com/v1/services/$serviceId/deploys"
$deployBody = '{"clearCache": "do_not_clear"}'
try {
    $deploy = Invoke-RestMethod -Uri $deployUrl -Method Post -Headers $headers -Body $deployBody
    Write-Host "  [OK] Redeploy triggered. Deploy ID: $($deploy.id)"
} catch {
    Write-Host "  [FAIL] Redeploy - $($_.Exception.Message)"
}

Write-Host "`nDone! Check https://dashboard.render.com for deploy status."
