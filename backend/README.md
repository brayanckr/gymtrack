# GymTrack — API REST (backend)

API en **Java + Spring Boot + MongoDB** para el seguimiento del entrenamiento en el gimnasio: objetivos con progreso calculado, catálogo de ejercicios, rutinas y su asignación,
sesiones de entrenamiento, mediciones corporales y panel de progreso. Parte de un proyecto de *Diseño de Software*; el análisis y el diseño están en
[`../documentacion`](../documentacion/README.md) (historias de usuario, modelo de dominio, las cinco vistas en Visual Paradigm y el contrato de la API).

## Arquitectura (tres capas, como en la materia)

```
Cliente HTTP ──► controller ──► service ──► repository ──► MongoDB
                    │              │            │
                    └──── dto ─────┴────────────┴──► model (dominio, no es una capa)
```

| Paquete (`com.gymtrack.api`) | Responsabilidad |
|---|---|
| `controller` | Recibe HTTP, valida el **formato** (`@Valid`) y devuelve el código correcto. Sin reglas de negocio, sin acceso a MongoDB. |
| `service` | Casos de uso y **reglas de negocio** (RN-xx). Un servicio por componente funcional. |
| `service.progreso` | Patrón **Estrategia**: `EstrategiaProgreso` (interfaz) con una implementación por tipo de objetivo. |
| `repository` | Interfaces `MongoRepository`; consultas derivadas por nombre. |
| `model` | Entidades del dominio. Composición ⇒ documento **embebido**; asociación ⇒ **referencia por id**; herencia ⇒ una colección. |
| `dto` | Mensajes JSON (`record`s) con validaciones de formato. |
| `exception` | Excepciones de negocio y `GlobalExceptionHandler` (400, 403, 404, 409, 500 con cuerpo uniforme). |
| `config` | CORS, reloj inyectable (`Clock`) y datos de ejemplo. |

Todo el código está comentado en español explicando **por qué** (regla de negocio o decisión de diseño que lo justifica), no solo qué hace.

## Ejecutar

Requisitos: **JDK 17 o superior** y un MongoDB en `localhost:27017`.

```powershell
docker compose up -d          # MongoDB local (o usa una instalación nativa)
./mvnw spring-boot:run        # API en http://localhost:8080  (Linux/macOS: ./mvnw)
```

La primera vez carga datos de ejemplo (2 entrenadores, 2 miembros, 7 ejercicios, 3 rutinas, objetivos, sesiones y mediciones) para que la demo no empiece vacía.
Perfil de demo: **Camila Rojas** (miembro) y **Andrés Pardo** (entrenador).

| Variable | Por defecto | Para qué |
|---|---|---|
| `MONGODB_URI` | `mongodb://localhost:27017/gymtrack` | Otra base, p. ej. MongoDB Atlas (la cadena de conexión **no** se versiona) |
| `GYMTRACK_SEED` | `true` | `false` desactiva los datos de ejemplo |
| `GYMTRACK_CORS_ORIGINS` | `http://localhost:5173,http://localhost:4173` | Orígenes del frontend |

JAR ejecutable (el artefacto `gymtrack-api.jar` de la vista de despliegue): `./mvnw package` → `java -jar target/gymtrack-api.jar`.

## Probar

```powershell
./mvnw test        # 56 pruebas, no necesitan MongoDB
```

* **Servicios** con Mockito y reloj fijo: cada regla de negocio (RN-01…RN-17) tiene su caso, incluidos los límites (ej. quien cumple 14 años hoy).
* **Estrategias de progreso** con su fuente de datos simulada.
* **Capa web** con `MockMvc`: cada excepción llega con su código HTTP y el cuerpo de error uniforme.
* **Contexto completo**: arranca todo Spring, lo que valida el grafo de dependencias y los nombres de las consultas derivadas.

> Las pruebas **no** ejercitan MongoDB real. Por eso además se probó la API contra MongoDB 9 y contra el frontend, y esa prueba encontró tres errores que los mocks no podían ver (ya corregidos y con prueba de regresión donde es posible):
> 1. `Between` derivado de Spring Data MongoDB es **exclusivo**: dejaba fuera la sesión del lunes en el objetivo de frecuencia semanal (ahora es una consulta explícita `$gte/$lte`).
> 2. `findAll` y `findById` de un repositorio de subtipo **no filtran por tipo** en la colección compartida `usuarios`: `/api/miembros` devolvía también a los entrenadores.
> 3. Consecuencia del anterior: un **miembro podía crear ejercicios** (debía ser 403). Ahora el tipo se comprueba siempre en `UsuarioService`.
>
> Para repetirlo: `docker compose up -d` (o MongoDB local), `./mvnw spring-boot:run` y el frontend con `npm run dev`.

## Ejemplos

```powershell
# Panel de un miembro (usa el id que devuelve GET /api/miembros)
curl http://localhost:8080/api/miembros
curl http://localhost:8080/api/miembros/<id>/panel

# Registrar una medición (409 si ya hay una ese día; 400 si el peso está fuera de 20–400 kg)
curl -X POST http://localhost:8080/api/miembros/<id>/mediciones -H "Content-Type: application/json" `
  -d '{\"fecha\":\"2026-11-23\",\"pesoKg\":78.0}'
```

Contrato completo (rutas, entradas, códigos y trazabilidad HU → endpoint): [`05-contrato-api.md`](../documentacion/docs/05-contrato-api.md).

## Decisiones declaradas

* **Sin autenticación** (fuera de alcance): donde una regla exige un rol, el cliente envía `entrenadorId` y la API comprueba que sea un entrenador (403 si no lo es).
* **El progreso no se guarda**: se calcula en cada consulta (RN-07) para que nunca quede desactualizado.
* **Spring Boot 3.5 / Java 17** (se compila para 17 y funciona en JVM posteriores; probado con 25).
