# Compila el plugin de Visual Paradigm y lo despliega en el workspace del usuario.
# (ASCII a proposito: Windows PowerShell 5.1 lee .ps1 sin BOM como ANSI.)
#   ./build.ps1
$ErrorActionPreference = 'Stop'
$vp  = 'C:\Program Files\Visual Paradigm 18.1'
$jdk = 'C:\Program Files\Eclipse Adoptium\jdk-25.0.4.101-hotspot'
$id  = 'com.gymtrack.vp.diagrams'

$stage = Join-Path $PSScriptRoot "build\$id"
New-Item -ItemType Directory -Force -Path "$stage\classes" | Out-Null

# La JRE que trae VP es Java 11: se compila con --release 11 aunque el JDK sea mas nuevo.
$src = Get-ChildItem (Join-Path $PSScriptRoot 'src') -Recurse -Filter '*.java' | ForEach-Object { $_.FullName }
& "$jdk\bin\javac.exe" --release 11 -encoding UTF-8 -Xlint:-options -cp "$vp\lib\openapi.jar" -d "$stage\classes" $src
if ($LASTEXITCODE -ne 0) { throw 'javac fallo' }

Copy-Item (Join-Path $PSScriptRoot 'plugin.xml') $stage -Force

# Estructura que exige VP: <plugin>/plugin.xml + classes/ (+ lib/ opcional). No se incluye openapi.jar.
$dest = Join-Path $env:APPDATA "VisualParadigm\plugins\$id"
New-Item -ItemType Directory -Force -Path $dest | Out-Null
Copy-Item "$stage\*" $dest -Recurse -Force
Write-Host "Plugin desplegado en $dest"
