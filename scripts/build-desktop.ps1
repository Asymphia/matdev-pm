# Buduje instalator Windows MatDev PM (Electron + API + Next.js)
# Uruchom z folderu matdev-pm:
#   powershell -ExecutionPolicy Bypass -File scripts/build-desktop.ps1

$ErrorActionPreference = 'Stop'

$FrontendRoot = Split-Path -Parent $PSScriptRoot
$BackendRoot = Join-Path (Split-Path -Parent $FrontendRoot) 'matdev-pm-backend'
$ResourcesRoot = Join-Path $FrontendRoot 'desktop-resources'
$ApiOut = Join-Path $ResourcesRoot 'api'
$NextOut = Join-Path $ResourcesRoot 'next'
$NodeOut = Join-Path $ResourcesRoot 'node'

Write-Host '=== MatDev PM - build instalatora Windows ===' -ForegroundColor Cyan
Write-Host ('Frontend: {0}' -f $FrontendRoot)
Write-Host ('Backend:  {0}' -f $BackendRoot)

if (-not (Test-Path $BackendRoot)) {
    throw ('Nie znaleziono backendu: {0}' -f $BackendRoot)
}

Write-Host ''
Write-Host '[1/5] PostgreSQL (wbudowana baza)...' -ForegroundColor Yellow
powershell -ExecutionPolicy Bypass -File (Join-Path $PSScriptRoot 'fetch-postgres.ps1')
if ($LASTEXITCODE -ne 0) { exit 1 }

# 1) Backend - self-contained exe
Write-Host ''
Write-Host '[1/5] Publikacja API (win-x64)...' -ForegroundColor Yellow
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
Write-Host ''
Write-Host '[2/5] Build Next.js...' -ForegroundColor Yellow
Push-Location $FrontendRoot
$env:MATDEV_API_BASE_URL = 'http://127.0.0.1:5196'
$env:NEXT_PUBLIC_MATDEV_API_BASE_URL = 'http://127.0.0.1:5196'
$env:MATDEV_DESKTOP_BUILD = '1'
npm run build
if ($LASTEXITCODE -ne 0) { Pop-Location; exit 1 }
Pop-Location

Write-Host ''
Write-Host '[3/5] Pakowanie Next standalone...' -ForegroundColor Yellow
$StandaloneSrc = Join-Path $FrontendRoot '.next/standalone'
$StaticSrc = Join-Path $FrontendRoot '.next/static'
$PublicSrc = Join-Path $FrontendRoot 'public'

if (-not (Test-Path (Join-Path $StandaloneSrc 'server.js'))) {
    throw 'Brak .next/standalone/server.js - sprawdz output: standalone w next.config.ts'
}

if (Test-Path $NextOut) { Remove-Item $NextOut -Recurse -Force }
Copy-Item $StandaloneSrc $NextOut -Recurse

$NextStaticDest = Join-Path $NextOut '.next/static'
New-Item -ItemType Directory -Path (Split-Path $NextStaticDest) -Force | Out-Null
Copy-Item $StaticSrc $NextStaticDest -Recurse -Force

if (Test-Path $PublicSrc) {
    Copy-Item $PublicSrc (Join-Path $NextOut 'public') -Recurse -Force
}

# Bundled Node.js for Next standalone server (Electron exe cannot run as Node when packaged)
Write-Host ''
Write-Host 'Pakowanie Node.js runtime...' -ForegroundColor Yellow
$NodeSrcDir = Split-Path (Get-Command node).Source -Parent
if (Test-Path $NodeOut) { Remove-Item $NodeOut -Recurse -Force }
New-Item -ItemType Directory -Path $NodeOut | Out-Null
Get-ChildItem $NodeSrcDir -File | Copy-Item -Destination $NodeOut -Force

# Electron compile + loading.html
Write-Host ''
Write-Host '[5/5] Electron + NSIS installer...' -ForegroundColor Yellow
if (Test-Path (Join-Path $FrontendRoot 'release')) {
    Remove-Item (Join-Path $FrontendRoot 'release') -Recurse -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
}
Push-Location $FrontendRoot
npx tsc -p tsconfig.electron.json
Copy-Item (Join-Path $FrontendRoot 'electron/loading.html') (Join-Path $FrontendRoot 'dist-electron/loading.html') -Force
$env:CSC_IDENTITY_AUTO_DISCOVERY = 'false'
npx electron-builder --win nsis
$code = $LASTEXITCODE
Pop-Location

if ($code -ne 0) { exit $code }

Write-Host ''
Write-Host ('Gotowe! Instalator w: {0}\release\' -f $FrontendRoot) -ForegroundColor Green
Get-ChildItem (Join-Path $FrontendRoot 'release') -Filter *.exe | ForEach-Object {
    Write-Host ('  -> {0}' -f $_.FullName)
}
