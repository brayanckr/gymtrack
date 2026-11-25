# Contrato de la API REST de GymTrack

Diseño del contrato antes de programar (lectura del Bloque 7: *método y ruta, parámetros, entrada, respuesta de éxito y errores previstos*).
Las rutas **nombran recursos**; el método HTTP expresa la operación. Base: `/api`. Formato: JSON (`application/json`).

## Códigos y cuerpo de error

| Código | Cuándo |
|---|---|
| 200 OK | Consulta o actualización correcta |
| 201 Created | Recurso creado (con `Location`) |
| 400 Bad Request | Datos inválidos (formato o regla de validación) |
| 403 Forbidden | Quien actúa existe pero no tiene el rol (ej. un miembro intenta crear un ejercicio) |
| 404 Not Found | Recurso inexistente (miembro, ejercicio, rutina…) |
| 409 Conflict | Choca con el estado actual (identificación/correo repetido, medición duplicada, objetivo ya cerrado, nombre de ejercicio repetido) |
| 500 Internal Server Error | Fallo inesperado (sin detalles internos al cliente) |

```json
{ "timestamp": "2026-11-23T10:15:30", "status": 400, "error": "Bad Request",
  "message": "Datos inválidos", "errores": [ { "campo": "alturaCm", "mensaje": "debe estar entre 100 y 250" } ] }
```

> **Sin autenticación** (fuera de alcance). Donde una regla exige un rol (HU-08, 09, 11) el cliente envía `entrenadorId` y la API verifica que sea un **entrenador**.
> Las rutas `/miembros/{miembroId}/…` reflejan RN-18 aunque, sin autenticación, no se pueda hacer cumplir.

## Recursos

### Usuarios — HU-01, 02, 03
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `POST /api/miembros` | `{identificacion, nombre, correo, fechaNacimiento, alturaCm}` | 201 `MiembroResponse` | 400, 409 (identificación/correo, RN-01) |
| `POST /api/entrenadores` | `{identificacion, nombre, correo, especialidad}` | 201 `EntrenadorResponse` | 400, 409 |
| `GET /api/miembros` · `GET /api/entrenadores` | — | 200 lista | — |
| `GET /api/miembros/{id}` · `GET /api/entrenadores/{id}` | — | 200 | 404 |
| `PUT /api/miembros/{id}` | `{nombre, correo, alturaCm}` (la identificación no se edita) | 200 | 400, 404, 409 |

### Catálogo de ejercicios — HU-07, 08
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `GET /api/ejercicios?grupoMuscular=PECHO` | filtro opcional | 200 lista (vacía si no hay) | 400 (grupo desconocido) |
| `GET /api/ejercicios/{id}` | — | 200 | 404 |
| `POST /api/ejercicios` | `{entrenadorId, nombre, grupoMuscular, descripcion}` | 201 | 400, 403, 404, 409 (RN-08) |

### Objetivos — HU-04, 05, 06
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `POST /api/miembros/{miembroId}/objetivos` | `{tipo, descripcion, valorInicial, valorMeta, fechaLimite, ejercicioId?}` | 201 `ObjetivoResponse` (con `progreso` 0 %) | 400 (RN-04/05), 404 (miembro/ejercicio) |
| `GET /api/miembros/{miembroId}/objetivos?estado=ACTIVO` | filtro opcional | 200 lista con `progreso` calculado (RN-07) | 404 |
| `GET /api/objetivos/{id}` | — | 200 | 404 |
| `GET /api/objetivos/{id}/progreso` | — | 200 `{valorActual, porcentaje}` (RN-07) | 404 |
| `PATCH /api/objetivos/{id}/estado` | `{estado: "CUMPLIDO" \| "CANCELADO"}` | 200 | 400, 404, 409 (RN-06) |

`tipo` ∈ `PESO_CORPORAL`, `FRECUENCIA_SEMANAL`, `FUERZA_EJERCICIO`. `progreso` = `{valorActual, porcentaje}`.

### Rutinas y asignaciones — HU-09, 10, 11, 12
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `POST /api/rutinas` | `{entrenadorId, nombre, descripcion, nivel, ejercicios:[{ejercicioId, dia, series, repeticiones, descansoSegundos}]}` | 201 `RutinaResponse` | 400 (RN-09), 403, 404 |
| `GET /api/rutinas` | — | 200 lista resumida | — |
| `GET /api/rutinas/{id}` | — | 200 detalle con ejercicios y nombres | 404 |
| `POST /api/miembros/{miembroId}/asignaciones` | `{rutinaId, entrenadorId}` | 201 `AsignacionResponse` (finaliza la activa previa, RN-11) | 403, 404 |
| `GET /api/miembros/{miembroId}/asignaciones` | — | 200 historial | 404 |
| `GET /api/miembros/{miembroId}/rutina-activa` | — | 200 `{asignacion, rutina}` | 404 (sin rutina activa) |

### Sesiones de entrenamiento — HU-13, 14
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `POST /api/miembros/{miembroId}/sesiones` | `{fecha, duracionMinutos, rutinaId?, notas?, series:[{ejercicioId, repeticiones, pesoKg}]}` | 201 `SesionResponse` | 400 (RN-13), 404 (miembro/rutina/ejercicio) |
| `GET /api/miembros/{miembroId}/sesiones` | — | 200 lista, **más reciente primero** | 404 |
| `GET /api/sesiones/{id}` | — | 200 detalle con series | 404 |

### Mediciones — HU-15, 16
| Método y ruta | Entrada | Éxito | Errores |
|---|---|---|---|
| `POST /api/miembros/{miembroId}/mediciones` | `{fecha, pesoKg, porcentajeGrasa?, cinturaCm?}` | 201 | 400 (RN-15), 404, 409 (RN-16) |
| `GET /api/miembros/{miembroId}/mediciones` | — | 200 lista **cronológica** | 404 |

### Panel de progreso — HU-17
| Método y ruta | Éxito | Errores |
|---|---|---|
| `GET /api/miembros/{miembroId}/panel` | 200 `{ultimoPesoKg, variacionPesoKg, sesionesDelMes, ultimaSesion, objetivosActivos[], rutinaActiva?}` | 404 |

## Trazabilidad HU → endpoint

| HU | Endpoint(s) |
|---|---|
| 01 · 02 | `POST /miembros` · `POST /entrenadores` |
| 03 | `GET/PUT /miembros/{id}` |
| 04 · 05 · 06 | `POST/GET /miembros/{id}/objetivos`, `PATCH /objetivos/{id}/estado` |
| 07 · 08 | `GET/POST /ejercicios` |
| 09 · 10 | `POST/GET /rutinas`, `GET /rutinas/{id}` |
| 11 · 12 | `POST/GET /miembros/{id}/asignaciones`, `GET /miembros/{id}/rutina-activa` |
| 13 · 14 | `POST/GET /miembros/{id}/sesiones` |
| 15 · 16 | `POST/GET /miembros/{id}/mediciones` |
| 17 | `GET /miembros/{id}/panel` |

## Decisiones de persistencia (MongoDB)

| Colección | Contenido | Decisión embeber vs. referenciar |
|---|---|---|
| `usuarios` | `Miembro` y `Entrenador`; el tipo lo guarda Spring Data en el campo `_class` (discriminador) | Jerarquía en una colección (patrón del material) |
| `ejercicios` | `Ejercicio` | — |
| `objetivos` | `Objetivo` con `miembroId`, `ejercicioId?` | **Referencias**: asociaciones entre conceptos independientes |
| `rutinas` | `Rutina` con `ejercicios[]` **embebidos** | **Embebido**: composición (el ejercicio prescrito nace y muere con la rutina) |
| `asignaciones` | `AsignacionRutina` con `miembroId`, `entrenadorId`, `rutinaId` | Referencias |
| `sesiones` | `SesionEntrenamiento` con `series[]` **embebidas** y `rutinaId?` | **Embebido**: composición |
| `mediciones` | `MedicionCorporal` con `miembroId` (único por miembro y fecha) | Referencia |
