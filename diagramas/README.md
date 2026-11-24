# Diagramas de GymTrack en Visual Paradigm

`gymtrack.vpp` contiene **6 diagramas** de las 5 vistas pedidas (contexto, funcional, lógica, desarrollo, despliegue ×2).
Explicación y verificación de cada una: [`../docs/04-vistas-arquitectonicas.md`](../docs/04-vistas-arquitectonicas.md).

| Vista | Imagen |
|---|---|
| 1. Contexto | [1-contexto.png](exportados/1-contexto.png) |
| 2. Funcional | [2-funcional.png](exportados/2-funcional.png) |
| 3. Lógica — diagrama de clases | [3-logica-clases.png](exportados/3-logica-clases.png) |
| 4. Desarrollo | [4-desarrollo.png](exportados/4-desarrollo.png) |
| 5a. Despliegue — demostración | [5a-despliegue-demostracion.png](exportados/5a-despliegue-demostracion.png) |
| 5b. Despliegue — objetivo | [5b-despliegue-objetivo.png](exportados/5b-despliegue-objetivo.png) |

## ⚠️ Marca de agua en las imágenes

Visual Paradigm arranca en **modo evaluación** cuando se ejecuta por línea de comandos (`getVerifiedLicenseKey: null; state=Evaluating`), por lo que las
imágenes exportadas llevan la marca *evaluation copy*. **El `.vpp` es el entregable**: ábrelo en Visual Paradigm con tu licencia y exporta limpio
(*File → Export → Diagram as Image*, o clic derecho en el diagrama).

## Cómo se generaron (sin MCP)

No hace falta ningún MCP ni automatizar la interfaz: Visual Paradigm trae una **Open API en Java** y scripts de línea de comandos.

1. `vp-plugin/` es un **plugin** (clases `Dsl`, `ContextoView`, `FuncionalView`, `LogicaView`, `DesarrolloView`, `DespliegueView`) que construye el modelo UML
   (elementos reales del repositorio de VP, no dibujos) y los diagramas con la Open API.
2. `scripts\Plugin.bat -project <vpp> -pluginid com.gymtrack.vp.diagrams` lo ejecuta **sin abrir la interfaz** y guarda el proyecto.
3. `scripts\ExportDiagramImage.bat` exporta cada diagrama a PNG.

```powershell
cd diagramas/vp-plugin
./run.ps1        # compila, genera ../gymtrack.vpp y exporta ../exportados/*.png
```

Requisitos: Visual Paradigm 18.x (ruta en los scripts), JDK 11+ y Windows PowerShell. Cierra Visual Paradigm antes de ejecutar.

### Detalles que costaron descubrir
* `Plugin.bat` exige un `.vpp` existente (`-project`); un archivo vacío no sirve. `run.ps1` usa como *vehículo* un proyecto de ejemplo de la propia instalación de VP
  (0 diagramas/clases) y verifica con conteos que el resultado contenga solo GymTrack.
* `newProject()` lanza `HeadlessException` en modo comando.
* Las rutas con caracteres no ASCII (ej. `ñ`) se deforman al pasar por `.bat`: el trabajo intermedio usa `%LOCALAPPDATA%\gymtrack-vp`.
* Los errores `Cannot run program "wmic"` de la salida son inofensivos (Windows 11 ya no trae `wmic`).
* VP rechaza dos clases con el mismo nombre en un mismo paquete: por eso cada clase se crea dentro de su paquete antes de nombrarse (el modelo de dominio y el diseño por capas comparten nombres).
