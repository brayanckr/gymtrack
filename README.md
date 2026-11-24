# GymTrack — documentación de diseño

Proyecto de *Diseño de Software*: una aplicación para **desarrollar y dar seguimiento al entrenamiento en el gimnasio** (objetivos, rutinas, sesiones,
mediciones y progreso). Este repositorio contiene el **análisis y el diseño**: historias de usuario con mockups y las cinco vistas arquitectónicas en Visual Paradigm.

| Repositorio | Contenido |
|---|---|
| **[gymtrack-docs](https://github.com/brayanckr/gymtrack-docs)** (este) | Historias de usuario, mockups, modelo de dominio, vistas arquitectónicas (`.vpp`) |
| [gymtrack-backend](https://github.com/brayanckr/gymtrack-backend) | API REST en Java (Spring Boot + MongoDB), tres capas, comentada |
| [gymtrack-frontend](https://github.com/brayanckr/gymtrack-frontend) | Demo web (React) que consume la API |

## Contenido

| Carpeta | Qué hay |
|---|---|
| [`historias-de-usuario/`](historias-de-usuario/README.md) | 17 historias en 6 épicas, criterios Dado/Cuando/Entonces, prioridad y estimación |
| [`mockups/`](mockups/README.md) | 11 pantallas (HTML + PNG) con estados de error y vacíos |
| [`docs/`](docs/) | Reglas de la materia, caso de estudio, reglas de negocio, modelo de dominio, vistas, contrato de API |
| [`diagramas/`](diagramas/README.md) | `gymtrack.vpp` (Visual Paradigm), imágenes y el plugin que lo genera |

## Las cinco vistas (Visual Paradigm)

Detalle, decisiones y lista de verificación contra el material de la materia: [`docs/04-vistas-arquitectonicas.md`](docs/04-vistas-arquitectonicas.md).

| Vista | Pregunta | Diagrama |
|---|---|---|
| 1. Contexto | ¿Quién interactúa con el sistema? | [casos de uso](diagramas/exportados/1-contexto.png) |
| 2. Funcional | ¿Qué partes funcionales lo forman? | [componentes](diagramas/exportados/2-funcional.png) |
| 3. Lógica | ¿Qué objetos existen y cómo se relacionan? | [diagrama de clases](diagramas/exportados/3-logica-clases.png) |
| 4. Desarrollo | ¿Cómo se organiza el código? | [paquetes](diagramas/exportados/4-desarrollo.png) |
| 5. Despliegue | ¿Dónde se ejecuta cada artefacto? | [demostración](diagramas/exportados/5a-despliegue-demostracion.png) · [objetivo](diagramas/exportados/5b-despliegue-objetivo.png) |

> Las imágenes llevan marca de agua *evaluation copy* (Visual Paradigm en modo evaluación por línea de comandos). El `.vpp` es el entregable; ver [`diagramas/README.md`](diagramas/README.md).

## Decisiones declaradas

* **Sin autenticación** (fuera de alcance): la API no autentica; la demo "inicia sesión" eligiendo un perfil.
* **Vistas de contexto y de desarrollo:** el material de la materia no las define formalmente; se usa UML estándar y así se declara.
* **Supuestos por confirmar con el docente:** una rutina activa por miembro, sesión libre sin rutina, tres tipos de objetivo, usuario de un solo tipo
  (ver [`docs/01-caso-de-estudio.md`](docs/01-caso-de-estudio.md)).

## Cómo seguir el trabajo de la materia

Las historias dicen **qué** (análisis); el modelo de dominio y las vistas dicen **cómo** (diseño); el backend lo implementa.
Trazabilidad HU → componente → clases en [`docs/04-vistas-arquitectonicas.md`](docs/04-vistas-arquitectonicas.md) y HU → endpoint en [`docs/05-contrato-api.md`](docs/05-contrato-api.md).
