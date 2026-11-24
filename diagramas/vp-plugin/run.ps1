# Genera las 5 vistas de GymTrack en Visual Paradigm SIN abrir la interfaz y exporta las imagenes.
#   ./run.ps1            -> escribe ..\gymtrack.vpp y ..\exportados\*.png
# Requisitos: Visual Paradigm 18.x instalado (Open API incluida) y JDK. Cierra VP antes de ejecutar.
# (ASCII a proposito: Windows PowerShell 5.1 lee .ps1 sin BOM como ANSI.)
param([string]$OutDir = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
$vp = 'C:\Program Files\Visual Paradigm 18.1'

# VP exporta los PNG con fondo transparente: las lineas negras desaparecen en visores oscuros (GitHub modo
# oscuro). Cada imagen se aplana sobre fondo blanco.
Add-Type -AssemblyName System.Drawing
function Aplanar($ruta) {
  $src = [System.Drawing.Image]::FromFile($ruta)
  $bmp = New-Object System.Drawing.Bitmap($src.Width, $src.Height)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.Clear([System.Drawing.Color]::White)
  $g.DrawImage($src, 0, 0, $src.Width, $src.Height)
  $g.Dispose(); $src.Dispose()
  $bmp.Save($ruta, [System.Drawing.Imaging.ImageFormat]::Png)
  $bmp.Dispose()
}

# VP se lanza via .bat y cmd deforma los caracteres no ASCII de las rutas (ej. la n con tilde):
# todo el trabajo intermedio va a una carpeta ASCII y solo el resultado se copia al repositorio.
$work = Join-Path $env:LOCALAPPDATA 'gymtrack-vp'
New-Item -ItemType Directory -Force -Path "$work\vehiculo" | Out-Null

# Plugin.bat exige un .vpp existente (-project). Se usa un proyecto de ejemplo de la propia
# instalacion de VP (0 diagramas/clases/paquetes) solo como "vehiculo"; el plugin trabaja sobre el.
$arranque = "$work\vehiculo\arranque.vpp"
Copy-Item "$vp\resources\BaggageSchemas.vpp" $arranque -Force

& (Join-Path $PSScriptRoot 'build.ps1')

$vpp = Join-Path $work 'gymtrack.vpp'
$env:HEADLESS = 'true'
$env:GYMTRACK_VPP = $vpp
Push-Location "$vp\scripts"
# VP escribe en stderr trazas inofensivas ("Cannot run program wmic": Windows 11 ya no trae wmic). Se descartan
# con 2>$null y por eso se baja temporalmente el modo estricto; el exito se verifica por los archivos generados.
$ErrorActionPreference = 'Continue'
try {
  Write-Host '== Generando vistas en Visual Paradigm...'
  & .\Plugin.bat -project $arranque -pluginid 'com.gymtrack.vp.diagrams' 2>$null | Select-String '\[GymTrack\]|Saved project'
  if (-not (Test-Path $vpp)) { throw 'El plugin no genero el proyecto .vpp' }
  Copy-Item $vpp (Join-Path $OutDir 'gymtrack.vpp') -Force

  Write-Host '== Exportando imagenes...'
  $exp = Join-Path $OutDir 'exportados'
  New-Item -ItemType Directory -Force -Path $exp | Out-Null
  # diagramas.txt: "archivo|nombre exacto del diagrama" (UTF-8: los nombres llevan tildes)
  foreach ($l in (Get-Content (Join-Path $PSScriptRoot 'diagramas.txt') -Encoding UTF8)) {
    if ($l.Trim() -eq '') { continue }
    $f, $n = $l -split '\|', 2
    $png = Join-Path $exp "$f.png"
    & .\ExportDiagramImage.bat -project $vpp -out $png -diagram $n -type png 2>$null | Out-Null
    if (Test-Path $png) { Aplanar $png; Write-Host "OK  $f.png" } else { Write-Warning "FALLO $f ($n)" }
  }
} finally {
  Pop-Location
}
Write-Host "Listo. Proyecto: $(Join-Path $OutDir 'gymtrack.vpp')"
