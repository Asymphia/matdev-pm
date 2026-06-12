# Jedno kliknięcie — Docker (baza + API) + okno aplikacji Electron
# Uruchom: npm run start:desktop
# albo: powershell -ExecutionPolicy Bypass -File scripts/start-desktop.ps1

$ErrorActionPreference = "Stop"

$FrontendRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Join-Path (Split-Path -Parent $FrontendRoot) "matdev-pm-backend"

Write-Host "=== MatDev PM — start desktop ===" -ForegroundColor Cyan

if (-not (Test-Path $BackendRoot)) {
    throw "Nie znaleziono backendu: $BackendRoot"
}

Write-Host "1/2 Docker (PostgreSQL + API)..." -ForegroundColor Yellow
Push-Location $BackendRoot
docker compose up -d matdev.database matdev.api
if ($LASTEXITCODE -ne 0) {
    Pop-Location
    throw "Docker nie wystartował. Włącz Docker Desktop i spróbuj ponownie."
}
Pop-Location

Write-Host "2/2 Next.js + okno Electron (npm run dev)..." -ForegroundColor Yellow
Push-Location $FrontendRoot
npm run dev
