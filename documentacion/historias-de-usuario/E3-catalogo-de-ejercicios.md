# Épica E3 — Catálogo de ejercicios

El catálogo es la base común de rutinas, sesiones y objetivos de fuerza.

---

## HU-07 — Consultar el catálogo de ejercicios

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro, Entrenador | Must | 2 pts |

**Historia:** Como miembro o entrenador, quiero ver los ejercicios disponibles y filtrarlos por grupo muscular, para encontrar el que necesito.

**Criterios de aceptación**

1. **Dado** que hay ejercicios en el catálogo, **cuando** abro el catálogo, **entonces** veo nombre y grupo muscular de cada uno.
2. **Dado** que filtro por un grupo muscular, **cuando** aplico el filtro, **entonces** solo veo los ejercicios de ese grupo.
3. **Dado** que el catálogo está vacío o el filtro no tiene resultados, **cuando** consulto, **entonces** veo un mensaje claro en lugar de una lista vacía sin explicación.

**Reglas de negocio:** RN-08 · **Mockup:** [05-catalogo-ejercicios](../mockups/png/05-catalogo-ejercicios.png)

---

## HU-08 — Registrar un ejercicio en el catálogo

| Rol | Prioridad | Estimación |
|---|---|---|
| Entrenador | Must | 2 pts |

**Historia:** Como entrenador, quiero añadir ejercicios al catálogo con su grupo muscular y descripción, para poder usarlos en mis rutinas.

**Criterios de aceptación**

1. **Dado** un nombre nuevo y un grupo muscular válido, **cuando** guardo, **entonces** el ejercicio aparece en el catálogo.
2. **Dado** que ya existe un ejercicio con ese nombre (sin distinguir mayúsculas), **cuando** guardo, **entonces** el sistema informa el conflicto.
3. **Dado** que falta el nombre o el grupo muscular, **cuando** guardo, **entonces** el sistema indica el campo faltante.

**Reglas de negocio:** RN-08 · **Mockup:** [05-catalogo-ejercicios](../mockups/png/05-catalogo-ejercicios.png)
