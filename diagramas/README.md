# Diagramas de GymTrack en Visual Paradigm

`gymtrack.vpp` contiene **7 diagramas** de las 5 vistas pedidas (contexto, funcional, lógica ×2, desarrollo, despliegue ×2).
Explicación y verificación de cada una: [`../docs/04-vistas-arquitectonicas.md`](../docs/04-vistas-arquitectonicas.md).

| Vista | Imagen |
|---|---|
| 1. Contexto | [1-contexto.png](exportados/1-contexto.png) |
| 2. Funcional | [2-funcional.png](exportados/2-funcional.png) |
| 3a. Lógica — dominio | [3a-logica-dominio.png](exportados/3a-logica-dominio.png) |
| 3b. Lógica — capas | [3b-logica-capas.png](exportados/3b-logica-capas.png) |
| 4. Desarrollo | [4-desarrollo.png](exportados/4-desarrollo.png) |
| 5a. Despliegue — demostración | [5a-despliegue-demostracion.png](exportados/5a-despliegue-demostracion.png) |
| 5b. Despliegue — objetivo | [5b-despliegue-objetivo.png](exportados/5b-despliegue-objetivo.png) |




### Detalles que costaron descubrir
* `Plugin.bat` exige un `.vpp` existente (`-project`); un archivo vacío no sirve. `run.ps1` usa como *vehículo* un proyecto de ejemplo de la propia instalación de VP
  (0 diagramas/clases) y verifica con conteos que el resultado contenga solo GymTrack.
* `newProject()` lanza `HeadlessException` en modo comando.
* Las rutas con caracteres no ASCII (ej. `ñ`) se deforman al pasar por `.bat`: el trabajo intermedio usa `%LOCALAPPDATA%\gymtrack-vp`.
* Los errores `Cannot run program "wmic"` de la salida son inofensivos (Windows 11 ya no trae `wmic`).
* VP rechaza dos clases con el mismo nombre en un mismo paquete: por eso cada clase se crea dentro de su paquete antes de nombrarse (el modelo de dominio y el diseño por capas comparten nombres).
