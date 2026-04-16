# Local Test Run Guide

This guide explains how to run every test suite locally in this repository.

## 1) Prerequisites

- Node.js 18+ (recommended 20+)
- npm
- .NET SDK (same major version used by backend project)
- Playwright browser binaries (Chromium)

Install frontend dependencies:

  cd frontend
  npm install

Install Playwright browser runtime once:

  npx playwright install chromium

## 2) Frontend Tests (from frontend folder)

All frontend tests:

  npm run test:all

Unit tests only:

  npm run test:unit

Component tests only:

  npm run test:component

Integration tests only:

  npm run test:integration

API contract tests:

  npm run test:contract

Coverage report:

  npm run test:coverage

Playwright E2E (headless):

  npm run test:e2e

Playwright E2E interactive UI mode:

  npm run test:e2e:ui

Playwright E2E headed mode:

  npx playwright test --headed

## 3) Backend Tests (from backend folder)

Run all backend tests:

  dotnet test DonationManagementSystem.Tests/DonationManagementSystem.Tests.csproj

Run backend unit tests only:

  dotnet test DonationManagementSystem.Tests/DonationManagementSystem.Tests.csproj --filter "FullyQualifiedName!~Integration"

Run backend integration tests only:

  dotnet test DonationManagementSystem.Tests/DonationManagementSystem.Tests.csproj --filter "FullyQualifiedName~Integration"

## 4) Full Cross-Project Run (from repository root)

Run all available suites using the helper script:

  ./test-all.ps1

This script runs:
- Backend unit
- Backend integration
- Frontend unit
- Frontend component
- Frontend integration

## 5) How to Validate Tests Are Really Working

Use a fail-then-pass check:

1. Make one assertion intentionally wrong in a test.
2. Run the related test command and confirm it fails.
3. Restore the assertion and confirm it passes.

For Playwright specifically:
- Use headed mode or UI mode so you can watch browser actions.
- On failure, inspect Playwright trace artifacts.

## 6) Known Local Environment Note

In some OneDrive or policy-restricted Windows environments, backend test execution may be blocked by application control policy with error code 0x800711C7.

If this happens:
- Frontend tests can still run normally.
- Backend project can build, but test discovery/execution may be blocked by local policy.

## 7) File Map

- Frontend scripts: frontend/package.json
- Playwright config: frontend/playwright.config.ts
- E2E specs: frontend/e2e/
- Vitest config: frontend/vitest.config.ts
- Backend test project: backend/DonationManagementSystem.Tests/DonationManagementSystem.Tests.csproj
- Cross-project runner: test-all.ps1
