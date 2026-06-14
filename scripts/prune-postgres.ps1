# Zostawia tylko bin/lib/share — bez pgAdmin (setki MB, psuje electron-builder).

$ErrorActionPreference = 'SilentlyContinue'
$FrontendRoot = Split-Path -Parent $PSScriptRoot
$Dest = Join-Path $FrontendRoot 'desktop-resources/postgres'

if (-not (Test-Path $Dest)) { exit 0 }

foreach ($dir in @('pgAdmin 4', 'doc', 'include', 'StackBuilder', 'installer')) {
    $path = Join-Path $Dest $dir
    if (Test-Path $path) {
        Remove-Item $path -Recurse -Force
        Write-Host ('Usunieto: {0}' -f $dir)
    }
}

Write-Host 'PostgreSQL prune OK' -ForegroundColor Green
