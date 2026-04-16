# Run all available automated tests across backend and frontend.
# Includes backend unit/integration and frontend unit/component/integration suites.

$ErrorActionPreference = 'Stop'

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Donation Management System - Test Runner" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$root = $PSScriptRoot

try {
    Write-Host "\n[1/5] Backend unit tests" -ForegroundColor Yellow
    Set-Location "$root\backend"
    dotnet test DonationManagementSystem.Tests\DonationManagementSystem.Tests.csproj --filter "FullyQualifiedName!~Integration"

    Write-Host "\n[2/5] Backend integration tests" -ForegroundColor Yellow
    dotnet test DonationManagementSystem.Tests\DonationManagementSystem.Tests.csproj --filter "FullyQualifiedName~Integration"

    Write-Host "\n[3/5] Frontend unit tests" -ForegroundColor Yellow
    Set-Location "$root\frontend"
    npm run test:unit

    Write-Host "\n[4/5] Frontend component tests" -ForegroundColor Yellow
    npm run test:component

    Write-Host "\n[5/5] Frontend integration tests" -ForegroundColor Yellow
    npm run test:integration

    Write-Host "\nAll test suites completed." -ForegroundColor Green
}
finally {
    Set-Location $root
}
