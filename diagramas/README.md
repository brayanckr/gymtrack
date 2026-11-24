# Diagramas de GymTrack en Visual Paradigm

[`../docs/04-vistas-arquitectonicas.md`](../docs/04-vistas-arquitectonicas.md).

| Vista | Imagen |
|---|---|
| 1. Contexto | [1-contexto.png](exportados/1-contexto.png) |
| 2. Funcional | [2-funcional.png](exportados/2-funcional.png) |
| 3. Lógica — diagrama de clases | [3-logica-clases.png](exportados/3-logica-clases.png) |
| 4. Desarrollo | [4-desarrollo.png](exportados/4-desarrollo.png) |
| 5a. Despliegue — demostración | [5a-despliegue-demostracion.png](exportados/5a-despliegue-demostracion.png) |
| 5b. Despliegue — objetivo | [5b-despliegue-objetivo.png](exportados/5b-despliegue-objetivo.png) |




### Detalles que costaron descubrir
* `Plugin.bat` exige un `.vpp` existente (`-project`); un archivo vacío no sirve. `run.ps1` usa como *vehículo* un proyecto de ejemplo de la propia instalación de VP
  (0 diagramas/clases) y verifica con conteos que el resultado contenga solo GymTrack.
* `newProject()` lanza `HeadlessException` en modo comando.
* Las rutas con caracteres no ASCII (ej. `ñ`) se deforman al pasar por `.bat`: el trabajo intermedio usa `%LOCALAPPDATA%\gymtrack-vp`.
* Los errores `Cannot run program "wmic"` de la salida son inofensivos (Windows 11 ya no trae `wmic`).

### Versión editable en Visual Paradigm Online
La carpeta [`editables/`](editables/) trae los seis diagramas como archivos `.drawio` (formas nativas, no imágenes), generados por `generar-vistas.js` (1 a 4) y `generar-editables.js` (5a y 5b). Para regenerarlos: `cd diagramas/editables && npm install && npm run generar`.
La posición de las cajas y el trazado de las flechas lo calcula el motor de layout **ELK** (`elkjs`): flechas ortogonales, etiquetas fuera de las líneas, y se prueban 300 variantes del layout para quedarse con la de menos cruces
(contexto, lógica y despliegue: 0 cruces; funcional: 3, el mínimo que consigue ELK porque tres componentes dependen a la vez de Usuarios y de Catálogo; desarrollo: 3 — las dependencias servicio→servicio se listan dentro de cada clase como «usa: …» para no saturar el diagrama).
Siguen el modelo de presentación del profesor:
* **1 Contexto:** diagrama de contexto (sistema en círculo, entidades externas, flujos de datos etiquetados).
* **2 Funcional:** **diagrama de componentes** con puertos, interfaces provistas (círculo) y requeridas (socket), y actores; no es de casos de uso.
* **3 Lógica:** diagrama de clases del dominio (atributos tipados, operaciones, multiplicidades).
* **4 Desarrollo:** clases reales (controladores, servicios, estrategias, repositorios y módulos del frontend) con dependencias discontinuas.
* **5 Despliegue:** nodos «device»/«executionEnvironment» con artefactos y protocolos.
* Para editarlos: en Visual Paradigm Online, *Import → draw.io* y elige el archivo; o inserta el XML desde el editor y guarda en tu workspace.
* Los `.png` y el `.vpp` de arriba siguen siendo la salida del plugin de Visual Paradigm Desktop.
* VP rechaza dos clases con el mismo nombre en un mismo paquete: por eso cada clase se crea dentro de su paquete antes de nombrarse (el modelo de dominio y el diseño por capas comparten nombres).
