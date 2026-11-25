# GymTrack — documentación de diseño

Proyecto de *Diseño de Software*: una aplicación para **desarrollar y dar seguimiento al entrenamiento en el gimnasio** (objetivos, rutinas, sesiones,
mediciones y progreso). Esta carpeta contiene el **análisis y el diseño**: historias de usuario con mockups y las cinco vistas arquitectónicas en Visual Paradigm.
El código está en [`../backend`](../backend/README.md) y [`../frontend`](../frontend/README.md).

## Contenido

| Carpeta | Qué hay |
|---|---|
| [`historias-de-usuario/`](historias-de-usuario/README.md) | 17 historias en 6 épicas, criterios Dado/Cuando/Entonces, prioridad y estimación |
| [`mockups/`](mockups/README.md) | 11 pantallas (HTML + PNG) con estados de error y vacíos |
| [`docs/`](docs/) | Reglas de la materia, caso de estudio, reglas de negocio, modelo de dominio, vistas, contrato de API |
| [`diagramas/`](diagramas/README.md) | Imágenes (`exportados/`) y versiones editables (`editables/`, `.drawio`) |

## Las cinco vistas (Visual Paradigm)

Detalle, decisiones y lista de verificación contra el material de la materia: [`docs/04-vistas-arquitectonicas.md`](docs/04-vistas-arquitectonicas.md).

| Vista | Pregunta | Diagrama |
|---|---|---|
| 1. Contexto | ¿Quién interactúa con el sistema? | [diagrama de contexto](diagramas/exportados/1-contexto.png) |
| 2. Funcional | ¿Qué partes funcionales lo forman? | [componentes](diagramas/exportados/2-funcional.png) |
| 3. Lógica | ¿Qué objetos existen y cómo se relacionan? | [diagrama de clases](diagramas/exportados/3-logica-clases.png) |
| 4. Desarrollo | ¿Cómo se organiza el código? | [clases y dependencias](diagramas/exportados/4-desarrollo.png) |
| 5. Despliegue | ¿Dónde se ejecuta cada artefacto? | [demostración](diagramas/exportados/5a-despliegue-demostracion.png) · [objetivo](diagramas/exportados/5b-despliegue-objetivo.png) |


## Cómo seguir el trabajo de la materia

Las historias dicen **qué** (análisis); el modelo de dominio y las vistas dicen **cómo** (diseño); el backend lo implementa.
Trazabilidad HU → componente → clases en [`docs/04-vistas-arquitectonicas.md`](docs/04-vistas-arquitectonicas.md) y HU → endpoint en [`docs/05-contrato-api.md`](docs/05-contrato-api.md).
