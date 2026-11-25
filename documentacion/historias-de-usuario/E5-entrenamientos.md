# Épica E5 — Entrenamientos

El registro de lo que realmente se hizo: la materia prima del seguimiento.

---

## HU-13 — Registrar una sesión de entrenamiento

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 8 pts |

**Historia:** Como miembro, quiero registrar una sesión indicando fecha, duración y las series que hice (ejercicio, repeticiones y peso), para conservar mi historial y alimentar mi progreso.

**Criterios de aceptación**

1. **Dado** una fecha no futura, una duración mayor que 0 y al menos una serie válida, **cuando** guardo, **entonces** la sesión queda registrada con todas sus series.
2. **Dado** que no agrego ninguna serie, **cuando** intento guardar, **entonces** el sistema exige al menos una.
3. **Dado** que una serie tiene menos de 1 repetición o peso negativo, **cuando** guardo, **entonces** el sistema rechaza la sesión indicando la serie.
4. **Dado** que la fecha es futura, **cuando** guardo, **entonces** el sistema la rechaza.
5. **Dado** que estoy siguiendo mi rutina activa, **cuando** registro la sesión, **entonces** puedo asociarla a esa rutina; **dado** que entreno por mi cuenta, **entonces** puedo registrarla como sesión libre.
6. **Dado** que una serie usa un ejercicio inexistente, **cuando** guardo, **entonces** el sistema informa que no se encontró.
7. **Dado** que uso peso 0 en un ejercicio de peso corporal, **cuando** guardo, **entonces** se acepta.

**Reglas de negocio:** RN-13, RN-14 · **Mockup:** [09-registrar-sesion](../mockups/png/09-registrar-sesion.png)

---

## HU-14 — Consultar mi historial de sesiones

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 3 pts |

**Historia:** Como miembro, quiero ver mis sesiones pasadas, de la más reciente a la más antigua, con sus series, para recordar qué hice y con cuánto peso.

**Criterios de aceptación**

1. **Dado** que tengo sesiones, **cuando** abro el historial, **entonces** las veo ordenadas de la más reciente a la más antigua con fecha, duración y número de series.
2. **Dado** que selecciono una sesión, **cuando** abro su detalle, **entonces** veo cada serie con ejercicio, repeticiones y peso.
3. **Dado** que no tengo sesiones, **cuando** abro el historial, **entonces** veo un mensaje que me invita a registrar la primera.

**Reglas de negocio:** RN-13, RN-18 · **Mockup:** [10-historial-sesiones](../mockups/png/10-historial-sesiones.png)
