# Buduje instalator Windows MatDev PM (Electron + API + Next.js)
# Uruchom z folderu matdev-pm:
#   powershell -ExecutionPolicy Bypass -File scripts/build-desktop.ps1

$ErrorActionPreference = "Stop"

$FrontendRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Join-Path (Split-Path -Parent $FrontendRoot) "matdev-pm-backend"
$ResourcesRoot = Join-Path $FrontendRoot "desktop-resources"
$ApiOut = Join-Path $ResourcesRoot "api"
$NextOut = Join-Path $ResourcesRoot "next"

Write-Host "=== MatDev PM — build instalatora Windows ===" -ForegroundColor Cyan
Write-Host "Frontend: $FrontendRoot"
Write-Host "Backend:  $BackendRoot"

if (-not (Test-Path $BackendRoot)) {
    throw "Nie znaleziono backendu: $BackendRoot"
}

# 1) Backend — self-contained exe
Write-Host "`n[1/4] Publikacja API (win-x64)..." -ForegroundColor Yellow
if (Test-Path $ApiOut) { Remove-Item $ApiOut -Recurse -Force }
New-Item -ItemType Directory -Path $ApiOut | Out-Null

Push-Location $BackendRoot
dotnet publish matdev.API/matdev.API.csproj `
    -c Release `
    -r win-x64 `
    --self-contained true `
    -o $ApiOut `
    /p:PublishSingleFile=false
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

# 2) Next.js standalone
Write-Host "`n[2/4] Build Next.js..." -ForegroundColor Yellow
Push-Location $FrontendRoot
$env:MATDEV_API_BASE_URL = "http://127.0.0.1:5196"
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host "`n[3/4] Pakowanie Next standalone..." -ForegroundColor Yellow
$StandaloneSrc = Join-Path $FrontendRoot ".next/standalone"
$StaticSrc = Join-Path $FrontendRoot ".next/static"
$PublicSrc = Join-Path $FrontendRoot "public"

if (-not (Test-Path (Join-Path $StandaloneSrc "server.js"))) {
    throw "Brak .next/standalone/server.js — sprawdz output: standalone w next.config.ts"
}

if (Test-Path $NextOut) { Remove-Item $NextOut -Recurse -Force }
Copy-Item $StandaloneSrc $NextOut -Recurse

$NextStaticDest = Join-Path $NextOut ".next/static"
New-Item -ItemType Directory -Path (Split-Path $NextStaticDest) -Force | Out-Null
Copy-Item $StaticSrc $NextStaticDest -Recurse -Force

if (Test-Path $PublicSrc) {
    Copy-Item $PublicSrc (Join-Path $NextOut "public") -Recurse -Force
}

# Electron compile + loading.html
Write-Host "`n[4/4] Electron + NSIS installer..." -ForegroundColor Yellow
Push-Location $FrontendRoot
npx tsc -p tsconfig.electron.json
Copy-Item (Join-Path $FrontendRoot "electron/loading.html") (Join-Path $FrontendRoot "dist-electron/loading.html") -Force
npx electron-builder --win nsis
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) { exit $code }

Write-Host "`nGotowe! Instalator w: $FrontendRoot\release\" -ForegroundColor Green
Get-ChildItem (Join-Path $FrontendRoot "release") -Filter *.exe | ForEach-Object { Write-Host "  -> $($_.FullName)" }
