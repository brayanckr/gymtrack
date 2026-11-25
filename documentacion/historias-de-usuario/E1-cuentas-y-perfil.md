# Épica E1 — Cuentas y perfil

Permite que miembros y entrenadores existan en GymTrack. *(Sin contraseñas: ver "Fuera de alcance" en `docs/01-caso-de-estudio.md`.)*

---

## HU-01 — Registrarme como miembro

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Must | 3 pts |

**Historia:** Como persona que entrena en el gimnasio, quiero registrarme con mis datos básicos, para poder llevar el seguimiento de mi entrenamiento.

**Criterios de aceptación**

1. **Dado** que no estoy registrado, **cuando** envío identificación, nombre, correo, fecha de nacimiento y altura válidos, **entonces** quedo registrado como miembro y veo la confirmación con mi perfil.
2. **Dado** que ya existe un usuario con mi identificación o mi correo, **cuando** intento registrarme, **entonces** el sistema me informa del conflicto y no crea un segundo registro.
3. **Dado** que dejo un campo obligatorio vacío o con formato inválido (correo, altura fuera de rango, menor de 14 años), **cuando** envío el formulario, **entonces** veo qué campo corregir y no se registra nada.

**Reglas de negocio:** RN-01, RN-02, RN-17 · **Mockup:** [01-registro](../mockups/png/01-registro.png)

---

## HU-02 — Registrarme como entrenador

| Rol | Prioridad | Estimación |
|---|---|---|
| Entrenador | Must | 2 pts |

**Historia:** Como entrenador, quiero registrarme indicando mi especialidad, para poder crear rutinas y asignarlas a miembros.

**Criterios de aceptación**

1. **Dado** que no estoy registrado, **cuando** envío identificación, nombre, correo y especialidad válidos, **entonces** quedo registrado como entrenador.
2. **Dado** que mi identificación o correo ya existen, **cuando** intento registrarme, **entonces** el sistema informa el conflicto.
3. **Dado** que ya estoy registrado como miembro, **cuando** intento registrarme como entrenador con la misma identificación, **entonces** el sistema lo rechaza (un usuario es de un solo tipo).

**Reglas de negocio:** RN-01, RN-02 · **Mockup:** [01-registro](../mockups/png/01-registro.png)

---

## HU-03 — Consultar y actualizar mi perfil

| Rol | Prioridad | Estimación |
|---|---|---|
| Miembro | Should | 2 pts |

**Historia:** Como miembro, quiero ver y corregir mi nombre, correo y altura, para mantener mis datos al día.

**Criterios de aceptación**

1. **Dado** que estoy registrado, **cuando** abro mi perfil, **entonces** veo mis datos actuales.
2. **Dado** que cambio mi altura a un valor válido, **cuando** guardo, **entonces** el perfil muestra el nuevo valor.
3. **Dado** que cambio mi correo por uno que usa otra persona, **cuando** guardo, **entonces** el sistema informa el conflicto y conserva mi correo anterior.
4. **Dado** que mi identificación identifica mi cuenta, **cuando** edito el perfil, **entonces** no puedo modificarla.

**Reglas de negocio:** RN-01, RN-17 · **Mockup:** [02-perfil](../mockups/png/02-perfil.png)
