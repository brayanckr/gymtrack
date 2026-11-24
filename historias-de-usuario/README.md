# Historias de usuario — GymTrack

17 historias en 6 épicas, con criterios de aceptación (Dado/Cuando/Entonces), reglas de negocio (`../docs/02-reglas-de-negocio.md`) y mockup.

> Las historias describen **qué** necesita el usuario (análisis). No mencionan rutas, tablas ni clases: eso es **diseño** y vive en los diagramas
> (Bloque 1: confundir análisis con diseño es uno de los errores más comunes).

| ID | Historia | Rol | Prioridad | Pts | Épica | Mockup |
|---|---|---|---|---|---|---|
| HU-01 | Registrarme como miembro | Miembro | Must | 3 | [E1](E1-cuentas-y-perfil.md) | [01](../mockups/png/01-registro.png) |
| HU-02 | Registrarme como entrenador | Entrenador | Must | 2 | [E1](E1-cuentas-y-perfil.md) | [01](../mockups/png/01-registro.png) |
| HU-03 | Consultar y actualizar mi perfil | Miembro | Should | 2 | [E1](E1-cuentas-y-perfil.md) | [02](../mockups/png/02-perfil.png) |
| HU-04 | Definir un objetivo | Miembro | Must | 5 | [E2](E2-objetivos.md) | [04](../mockups/png/04-objetivos.png) |
| HU-05 | Consultar mis objetivos y su progreso | Miembro | Must | 5 | [E2](E2-objetivos.md) | [04](../mockups/png/04-objetivos.png) |
| HU-06 | Cerrar un objetivo | Miembro | Should | 2 | [E2](E2-objetivos.md) | [04](../mockups/png/04-objetivos.png) |
| HU-07 | Consultar el catálogo de ejercicios | Miembro, Entrenador | Must | 2 | [E3](E3-catalogo-de-ejercicios.md) | [05](../mockups/png/05-catalogo-ejercicios.png) |
| HU-08 | Registrar un ejercicio en el catálogo | Entrenador | Must | 2 | [E3](E3-catalogo-de-ejercicios.md) | [05](../mockups/png/05-catalogo-ejercicios.png) |
| HU-09 | Crear una rutina | Entrenador | Must | 5 | [E4](E4-rutinas.md) | [07](../mockups/png/07-crear-rutina.png) |
| HU-10 | Consultar rutinas y su detalle | Miembro, Entrenador | Must | 3 | [E4](E4-rutinas.md) | [06](../mockups/png/06-rutinas.png) |
| HU-11 | Asignar una rutina a un miembro | Entrenador | Must | 3 | [E4](E4-rutinas.md) | [08](../mockups/png/08-asignar-rutina.png) |
| HU-12 | Ver mi rutina activa | Miembro | Must | 2 | [E4](E4-rutinas.md) | [06](../mockups/png/06-rutinas.png) |
| HU-13 | Registrar una sesión de entrenamiento | Miembro | Must | 8 | [E5](E5-entrenamientos.md) | [09](../mockups/png/09-registrar-sesion.png) |
| HU-14 | Consultar mi historial de sesiones | Miembro | Must | 3 | [E5](E5-entrenamientos.md) | [10](../mockups/png/10-historial-sesiones.png) |
| HU-15 | Registrar una medición corporal | Miembro | Must | 3 | [E6](E6-avance-corporal.md) | [11](../mockups/png/11-mediciones.png) |
| HU-16 | Ver la evolución de mis mediciones | Miembro | Should | 3 | [E6](E6-avance-corporal.md) | [11](../mockups/png/11-mediciones.png) |
| HU-17 | Ver mi panel de progreso | Miembro | Must | 5 | [E6](E6-avance-corporal.md) | [03](../mockups/png/03-panel-progreso.png) |

**Total:** 58 puntos · 14 *Must* · 3 *Should*.

## Fuera de alcance

Autenticación y contraseñas, administrador, pagos/membresías, nutrición, notificaciones (ver `../docs/01-caso-de-estudio.md`).

## Cómo leer una historia

Formato: *Como `<rol>` quiero `<acción>` para `<beneficio>`* + criterios *Dado/Cuando/Entonces* verificables.
Los criterios incluyen siempre el camino feliz, los datos inválidos, los conflictos y los estados vacíos.
