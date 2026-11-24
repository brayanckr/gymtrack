# GymTrack — demo web (frontend)

Aplicación de una sola página (**React + Vite + TypeScript**) que implementa las 11 pantallas de los mockups de **gymtrack-docs** y consume la API REST de **gymtrack-backend**.
Es la demostración del proyecto de *Diseño de Software*; no es una app de producción (sin autenticación, ver "Decisiones").

## Ejecutar

Requisito: Node 20 o superior.

```powershell
npm install
```

**A. Demostración sin backend** (datos en memoria, útil para ver la interfaz de inmediato):

```powershell
npm run demo          # http://localhost:5173
```

**B. Con el backend real** (la API en `http://localhost:8080` con MongoDB; ver `gymtrack-backend`):

```powershell
npm run dev           # http://localhost:5173
# o la versión compilada:
npm run build ; npm run preview     # http://localhost:4173
```

Otra URL de API: `VITE_API_URL=https://mi-servidor npm run dev`. El backend ya permite por CORS los puertos 5173 y 4173.

Perfiles de ejemplo (los mismos que carga el backend): **Camila Rojas** (miembro) y **Andrés Pardo** (entrenador).

## Estructura (vista de desarrollo)

| Carpeta `src/` | Responsabilidad |
|---|---|
| `pages/` | Una pantalla por mockup. Cubren los estados **cargando, vacío, error y éxito**. |
| `components/` | Piezas reutilizables: `Layout` (menú por rol), `Campo`, `BarraProgreso`, `GraficaLinea`, `Estado`. |
| `api/` | `contrato.ts` (lo que la UI necesita de la API), `http.ts` (implementación real), `mock.ts` (datos en memoria con las mismas reglas), `error.ts`. |
| `state/` | Perfil elegido (`SesionContext`) y el hook de carga `useAsync`. |
| `types/` | Tipos TypeScript del contrato (reflejan los DTO del backend). |

Las páginas solo conocen la interfaz `GymApi`: cambiar de API real a demo es cambiar **una** variable (`VITE_USE_MOCK`), no tocar pantallas.

## Pantallas ↔ mockups ↔ historias

| Ruta | Mockup | Historias | Rol |
|---|---|---|---|
| `/` | — | elegir perfil | ambos |
| `/registro` | 01 | HU-01, HU-02 | — |
| `/perfil` | 02 | HU-03 | miembro |
| `/panel` | 03 | HU-17 | miembro |
| `/objetivos` | 04 | HU-04, 05, 06 | miembro |
| `/catalogo` | 05 | HU-07, 08 | ambos (alta solo entrenador) |
| `/rutinas` | 06 | HU-10, 12 | ambos |
| `/rutinas/nueva` | 07 | HU-09 | entrenador |
| `/rutinas/asignar` | 08 | HU-11 | entrenador |
| `/sesion/nueva` | 09 | HU-13 | miembro |
| `/historial` | 10 | HU-14 | miembro |
| `/mediciones` | 11 | HU-15, 16 | miembro |

## Probar y verificar

```powershell
npm test            # fórmula de progreso (los mismos casos que el backend), fechas y conversión de números
npm run build       # tsc con tipado estricto + build de producción
```

Además del `build`, se recorrió la interfaz en un navegador en modo demostración: selección de perfil, panel con progreso calculado, validación de formularios con errores junto a cada campo y el flujo de entrenador (asignar una rutina avisando que finaliza la activa).

También se probó **contra el backend real con MongoDB** (`npm run dev` + API en 8080): los perfiles y el panel cargan desde la base, CORS funciona desde el navegador, un 409 de la API (medición en una fecha ocupada) se muestra en pantalla y una medición válida se guarda y aparece en la gráfica y la tabla.

## Decisiones

* **Sin autenticación** (fuera de alcance): "iniciar sesión" es elegir un perfil existente; se recuerda en `localStorage` (solo `id`, tipo y nombre).
* **Un campo numérico vacío se envía como `null`, no como `0`**, para que la API responda "es obligatorio" en lugar de aceptar un valor que el usuario no escribió.
* **404 de "rutina activa" no es un error de pantalla**: significa "aún no tienes una" y se muestra como estado vacío.
* El **modo demostración replica las reglas del backend** (RN-xx, códigos 400/403/404/409 y la fórmula de progreso) para que el comportamiento visible sea el mismo; no sustituye a la API.
