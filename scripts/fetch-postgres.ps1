# Pobiera binaria PostgreSQL (Windows x64) do desktop-resources/postgres
# Zip cache: desktop-resources/.cache/ (gitignore)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.IO.Compression.FileSystem

$FrontendRoot = Split-Path -Parent $PSScriptRoot
$Dest = Join-Path $FrontendRoot 'desktop-resources/postgres'
$Initdb = Join-Path $Dest 'bin/initdb.exe'
$CacheDir = Join-Path $FrontendRoot 'desktop-resources/.cache'

if (Test-Path $Initdb) {
    Write-Host ('PostgreSQL OK: {0}' -f $Initdb) -ForegroundColor Green
    exit 0
}

$Version = '16.6-1'
$Url = "https://get.enterprisedb.com/postgresql/postgresql-$Version-windows-x64-binaries.zip"
$Zip = Join-Path $CacheDir "postgresql-$Version.zip"
$ExtractRoot = Join-Path $CacheDir 'extract'

New-Item -ItemType Directory -Path $CacheDir -Force | Out-Null

$minZipBytes = 150MB
if (-not (Test-Path $Zip) -or (Get-Item $Zip).Length -lt $minZipBytes) {
    Write-Host ('Pobieranie PostgreSQL {0} (~180 MB, jednorazowo)...' -f $Version) -ForegroundColor Yellow
    $tmp = "$Zip.partial"
    if (Test-Path $tmp) { Remove-Item $tmp -Force }
    Invoke-WebRequest -Uri $Url -OutFile $tmp -UseBasicParsing
    Move-Item $tmp $Zip -Force
} else {
    Write-Host ('Zip z cache: {0}' -f $Zip) -ForegroundColor Green
}

Write-Host 'Rozpakowywanie...' -ForegroundColor Yellow
if (Test-Path $ExtractRoot) { Remove-Item $ExtractRoot -Recurse -Force }
New-Item -ItemType Directory -Path $ExtractRoot | Out-Null
[System.IO.Compression.ZipFile]::ExtractToDirectory($Zip, $ExtractRoot)

$PgsqlSrc = Join-Path $ExtractRoot 'pgsql'
if (-not (Test-Path $PgsqlSrc)) {
    throw ('Nie znaleziono folderu pgsql w: {0}' -f $Zip)
}

if (Test-Path $Dest) { Remove-Item $Dest -Recurse -Force }
Move-Item $PgsqlSrc $Dest
Remove-Item $ExtractRoot -Recurse -Force -ErrorAction SilentlyContinue

if (-not (Test-Path $Initdb)) {
    throw 'initdb.exe nie znaleziony po rozpakowaniu'
}

Write-Host ('Gotowe: {0}' -f $Dest) -ForegroundColor Green
