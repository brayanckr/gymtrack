# Épica E2 — Objetivos

El miembro define metas medibles y ve cuánto ha avanzado hacia ellas.

---

## HU-04 — Definir un objetivo

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 5 pts |

**Historia:** Como miembro, quiero definir un objetivo (bajar o subir de peso, entrenar un número de veces por semana, o levantar cierto peso en un ejercicio), para tener una meta clara que perseguir.

**Criterios de aceptación**

1. **Dado** que elijo el tipo *peso corporal*, **cuando** indico valor inicial, meta y fecha límite válidos, **entonces** el objetivo queda activo con la fecha de hoy como inicio.
2. **Dado** que elijo el tipo *fuerza en un ejercicio*, **cuando** selecciono un ejercicio del catálogo, el peso inicial, la meta y la fecha límite, **entonces** el objetivo queda activo asociado a ese ejercicio.
3. **Dado** que elijo *fuerza* y no selecciono ejercicio, **cuando** intento guardar, **entonces** el sistema me pide el ejercicio.
4. **Dado** que la meta es igual al valor inicial, o la fecha límite no es posterior a hoy, **cuando** intento guardar, **entonces** el sistema rechaza el objetivo explicando el motivo.
5. **Dado** que elijo *frecuencia semanal*, **cuando** indico cuántas sesiones por semana quiero, **entonces** el objetivo queda activo sin pedir ejercicio.

**Reglas de negocio:** RN-03, RN-04, RN-05, RN-06 · **Mockup:** [04-objetivos](../mockups/png/04-objetivos.png)

---

## HU-05 — Consultar mis objetivos y su progreso

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 5 pts |

**Historia:** Como miembro, quiero ver mis objetivos con el porcentaje de avance de cada uno, para saber qué tan cerca estoy de lograrlos.

**Criterios de aceptación**

1. **Dado** que tengo objetivos, **cuando** abro la lista, **entonces** veo cada uno con tipo, meta, fecha límite, estado y porcentaje de avance.
2. **Dado** un objetivo de peso corporal, **cuando** registro una nueva medición, **entonces** el avance se recalcula con mi último peso.
3. **Dado** un objetivo de frecuencia semanal, **cuando** registro sesiones en la semana en curso, **entonces** el avance refleja sesiones realizadas sobre la meta.
4. **Dado** un objetivo de fuerza, **cuando** registro una serie con más peso en ese ejercicio, **entonces** el avance refleja el mayor peso levantado desde que inicié el objetivo.
5. **Dado** que aún no hay datos para un objetivo, **cuando** lo consulto, **entonces** el avance es 0 %. **Dado** que superé la meta, **entonces** el avance muestra 100 % (no más).
6. **Dado** que no tengo objetivos, **cuando** abro la lista, **entonces** veo un mensaje que me invita a crear el primero.

**Reglas de negocio:** RN-07 · **Mockup:** [04-objetivos](../mockups/png/04-objetivos.png)

---

## HU-06 — Cerrar un objetivo

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Should | 2 pts |

**Historia:** Como miembro, quiero marcar un objetivo como cumplido o cancelarlo, para mantener mi lista de metas vigente.

**Criterios de aceptación**

1. **Dado** un objetivo activo, **cuando** lo marco como cumplido, **entonces** su estado es *cumplido* y deja de contarse como activo.
2. **Dado** un objetivo activo, **cuando** lo cancelo, **entonces** su estado es *cancelado*.
3. **Dado** un objetivo ya cumplido o cancelado, **cuando** intento cambiar su estado, **entonces** el sistema lo rechaza.

**Reglas de negocio:** RN-06 · **Mockup:** [04-objetivos](../mockups/png/04-objetivos.png)
