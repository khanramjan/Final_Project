# 🚀 Auto Setup Environment - Run Before Starting Backend
# This script loads environment variables from .env.local automatically

Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║     Loading Environment Variables from .env.local     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$envFilePath = ".\.env.local"

if (Test-Path $envFilePath) {
    Write-Host "✅ Found .env.local file" -ForegroundColor Green
    Write-Host "Loading variables..." -ForegroundColor Yellow
    Write-Host ""
    
    # Read and parse .env.local file
    Get-Content $envFilePath | ForEach-Object {
        $line = $_.Trim()
        
        # Skip empty lines and comments
        if ($line -and -not $line.StartsWith("#")) {
            # Split on first = only
            $parts = $line -split '=', 2
            if ($parts.Count -eq 2) {
                $key = $parts[0].Trim()
                $value = $parts[1].Trim()
                
                # Set environment variable for current session
                [Environment]::SetEnvironmentVariable($key, $value, "Process")
                Write-Host "  ✓ Set: $key" -ForegroundColor Green
            }
        }
    }
    
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Green
    Write-Host "║       ✅ Environment Variables Loaded Successfully     ║" -ForegroundColor Green
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Green
    Write-Host ""
    Write-Host "🚀 Starting Backend Server..." -ForegroundColor Cyan
    Write-Host ""
    
    # Start the backend
    Set-Location "backend\DonationManagementSystem.API"
    dotnet run
    
} else {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════════════════╗" -ForegroundColor Red
    Write-Host "║  ❌ ERROR: .env.local file not found!                 ║" -ForegroundColor Red
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Red
    Write-Host ""
    Write-Host "📝 Creating .env.local template..." -ForegroundColor Yellow
    Write-Host ""
    
    # Create template
    @"
# 🔒 LOCAL ENVIRONMENT VARIABLES
# Add your sensitive credentials here

# Email Configuration
EMAIL_PASSWORD=your-gmail-app-password-here

# Add other secrets as needed
# JWT_SECRET=your-secret-key
# DATABASE_PASSWORD=your-db-password
"@ | Out-File -FilePath $envFilePath -Encoding UTF8
    
    Write-Host "✅ Created .env.local template" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  Please edit .env.local and add your credentials" -ForegroundColor Yellow
    Write-Host "   Then run this script again." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Press any key to open .env.local in notepad..." -ForegroundColor Gray
    $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
    
    notepad .env.local
}
