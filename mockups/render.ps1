# Exporta mockups/html/*.html a mockups/png/*.png usando Edge en modo headless.
# Uso (desde la carpeta mockups):  node build.mjs ; ./render.ps1
# (Archivo en ASCII a proposito: Windows PowerShell 5.1 lee .ps1 sin BOM como ANSI.)
param(
  [string]$Edge = 'C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe',
  [int]$Width = 1280,
  [int]$Height = 900
)
$ErrorActionPreference = 'Stop'
if (-not (Test-Path $Edge)) { throw "No se encontro Edge en $Edge. Pasa -Edge con la ruta de msedge.exe o chrome.exe." }

$root = $PSScriptRoot
$png = Join-Path $root 'png'
New-Item -ItemType Directory -Force -Path $png | Out-Null

Get-ChildItem (Join-Path $root 'html') -Filter '*.html' | ForEach-Object {
  $out = Join-Path $png ($_.BaseName + '.png')
  $url = ([System.Uri]$_.FullName).AbsoluteUri
  & $Edge --headless=new --disable-gpu --hide-scrollbars "--window-size=$Width,$Height" "--screenshot=$out" $url | Out-Null
  # Edge escribe el archivo de forma asincrona; esperamos a que exista.
  $t = 0; while (-not (Test-Path $out) -and $t -lt 40) { Start-Sleep -Milliseconds 250; $t++ }
  if (Test-Path $out) { Write-Host "OK  $($_.BaseName).png" } else { Write-Warning "FALLO $($_.BaseName)" }
}
