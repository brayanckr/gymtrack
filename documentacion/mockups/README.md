# Mockups de GymTrack

11 pantallas de media fidelidad (HTML + PNG) que cubren las 17 historias. Incluyen **estados de error y vacíos**, no solo el camino feliz.

| # | Pantalla | Historias |
|---|---|---|
| 01 | ![](png/01-registro.png) | HU-01 · HU-02 |
| 02 | ![](png/02-perfil.png) | HU-03 |
| 03 | ![](png/03-panel-progreso.png) | HU-17 |
| 04 | ![](png/04-objetivos.png) | HU-04 · HU-05 · HU-06 |
| 05 | ![](png/05-catalogo-ejercicios.png) | HU-07 · HU-08 |
| 06 | ![](png/06-rutinas.png) | HU-10 · HU-12 |
| 07 | ![](png/07-crear-rutina.png) | HU-09 |
| 08 | ![](png/08-asignar-rutina.png) | HU-11 |
| 09 | ![](png/09-registrar-sesion.png) | HU-13 |
| 10 | ![](png/10-historial-sesiones.png) | HU-14 |
| 11 | ![](png/11-mediciones.png) | HU-15 · HU-16 |

## Regenerar

Requiere Node y Microsoft Edge (o Chrome, pasando `-Edge`):

```powershell
cd mockups
node build.mjs     # genera html/ y assets/wireframe.css
./render.ps1       # exporta png/
```

El frontend de demo (`gymtrack-frontend`) implementa estas mismas pantallas.
