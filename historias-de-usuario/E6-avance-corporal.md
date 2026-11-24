# Épica E6 — Avance

Mediciones corporales y la vista que resume todo el progreso del miembro.

---

## HU-15 — Registrar una medición corporal

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 3 pts |

**Historia:** Como miembro, quiero registrar mi peso (y opcionalmente porcentaje de grasa y cintura) en una fecha, para ver cómo cambia mi cuerpo con el tiempo.

**Criterios de aceptación**

1. **Dado** una fecha no futura y un peso entre 20 y 400 kg, **cuando** guardo, **entonces** la medición queda registrada.
2. **Dado** que agrego porcentaje de grasa (1–70) o cintura (mayor que 0) válidos, **cuando** guardo, **entonces** se guardan junto con el peso.
3. **Dado** que ya registré una medición en esa fecha, **cuando** intento registrar otra, **entonces** el sistema informa el conflicto.
4. **Dado** valores fuera de rango o fecha futura, **cuando** guardo, **entonces** el sistema indica qué corregir.

**Reglas de negocio:** RN-15, RN-16 · **Mockup:** [11-mediciones](../mockups/png/11-mediciones.png)

---

## HU-16 — Ver la evolución de mis mediciones

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Should | 3 pts |

**Historia:** Como miembro, quiero ver mis mediciones en orden cronológico y en una gráfica de peso, para identificar mi tendencia.

**Criterios de aceptación**

1. **Dado** que tengo mediciones, **cuando** abro la evolución, **entonces** veo una gráfica de peso en el tiempo y la tabla de mediciones.
2. **Dado** que tengo una sola medición, **cuando** abro la evolución, **entonces** veo ese punto y un mensaje indicando que se necesitan más para ver tendencia.
3. **Dado** que no tengo mediciones, **cuando** abro la evolución, **entonces** veo un mensaje que me invita a registrar la primera.

**Reglas de negocio:** RN-15 · **Mockup:** [11-mediciones](../mockups/png/11-mediciones.png)

---

## HU-17 — Ver mi panel de progreso

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 5 pts |

**Historia:** Como miembro, quiero un panel que resuma mis objetivos activos, mis sesiones recientes y mi último peso, para saber de un vistazo cómo voy.

**Criterios de aceptación**

1. **Dado** que tengo datos, **cuando** abro el panel, **entonces** veo mi último peso, las sesiones del mes, mis objetivos activos con su avance y mi rutina activa.
2. **Dado** que soy nuevo, **cuando** abro el panel, **entonces** veo cada bloque con su estado vacío y un acceso directo para crear el primer dato.
3. **Dado** que registro una sesión o medición, **cuando** vuelvo al panel, **entonces** los números reflejan el cambio.

**Reglas de negocio:** RN-07 · **Mockup:** [03-panel-progreso](../mockups/png/03-panel-progreso.png)
