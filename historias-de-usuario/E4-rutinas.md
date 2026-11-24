# Épica E4 — Rutinas

Los entrenadores diseñan y asignan; los miembros consultan y siguen.

---

## HU-09 — Crear una rutina

| Rol | Prioridad | Estimación |
|---|---|---|
| Entrenador | Must | 5 pts |

**Historia:** Como entrenador, quiero crear una rutina con nombre, nivel y una lista de ejercicios con series, repeticiones y descanso, para ofrecer un plan estructurado.

**Criterios de aceptación**

1. **Dado** un nombre, un nivel y al menos un ejercicio del catálogo con series, repeticiones y descanso válidos, **cuando** guardo, **entonces** la rutina queda creada a mi nombre.
2. **Dado** que no agrego ningún ejercicio, **cuando** intento guardar, **entonces** el sistema exige al menos uno.
3. **Dado** que indico series o repeticiones menores que 1, o un descanso negativo, **cuando** guardo, **entonces** el sistema rechaza la rutina.
4. **Dado** que incluyo un ejercicio que no existe en el catálogo, **cuando** guardo, **entonces** el sistema informa que no se encontró.
5. **Dado** que quiero entrenar el mismo ejercicio en dos días distintos, **cuando** lo agrego dos veces, **entonces** ambos quedan en la rutina con su orden.

**Reglas de negocio:** RN-09, RN-10 · **Mockup:** [07-crear-rutina](../mockups/png/07-crear-rutina.png)

---

## HU-10 — Consultar rutinas y su detalle

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro, Entrenador | Must | 3 pts |

**Historia:** Como miembro o entrenador, quiero ver la lista de rutinas y el detalle de una (ejercicios por día con series, repeticiones y descanso), para decidir cuál usar.

**Criterios de aceptación**

1. **Dado** que hay rutinas, **cuando** abro la lista, **entonces** veo nombre, nivel y entrenador de cada una.
2. **Dado** que selecciono una rutina, **cuando** abro su detalle, **entonces** veo sus ejercicios ordenados con series, repeticiones y descanso.
3. **Dado** que consulto una rutina que no existe, **cuando** abro el detalle, **entonces** veo que no se encontró.

**Reglas de negocio:** RN-09 · **Mockup:** [06-rutinas](../mockups/png/06-rutinas.png)

---

## HU-11 — Asignar una rutina a un miembro

| Rol | Prioridad | Estimación |
|---|---|---|
| Entrenador | Must | 3 pts |

**Historia:** Como entrenador, quiero asignar una rutina a un miembro, para que sepa qué entrenar.

**Criterios de aceptación**

1. **Dado** un miembro sin rutina activa, **cuando** le asigno una rutina, **entonces** la asignación queda activa con la fecha de hoy.
2. **Dado** un miembro con una rutina activa, **cuando** le asigno otra, **entonces** la anterior queda finalizada con fecha de fin de hoy y la nueva queda activa.
3. **Dado** que el miembro o la rutina no existen, **cuando** asigno, **entonces** el sistema informa que no se encontró y no crea la asignación.
4. **Dado** que quien asigna no es un entrenador registrado, **cuando** intenta asignar, **entonces** el sistema lo rechaza.

**Reglas de negocio:** RN-11, RN-12 · **Mockup:** [08-asignar-rutina](../mockups/png/08-asignar-rutina.png)

---

## HU-12 — Ver mi rutina activa

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 2 pts |

**Historia:** Como miembro, quiero ver mi rutina activa con sus ejercicios, para saber qué me toca entrenar hoy.

**Criterios de aceptación**

1. **Dado** que tengo una rutina activa, **cuando** abro "Mi rutina", **entonces** veo su detalle y desde cuándo está asignada.
2. **Dado** que no tengo rutina activa, **cuando** abro "Mi rutina", **entonces** veo un mensaje que indica que aún no me han asignado una.
3. **Dado** que quiero ver mis asignaciones anteriores, **cuando** abro el historial de asignaciones, **entonces** veo las finalizadas con sus fechas.

**Reglas de negocio:** RN-11 · **Mockup:** [06-rutinas](../mockups/png/06-rutinas.png)
