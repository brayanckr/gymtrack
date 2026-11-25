# Reglas de negocio

Fuente única de las reglas que justifican multiplicidades, validaciones y códigos de error.
Cada historia de usuario cita las reglas que usa.

| ID | Regla |
|---|---|
| **RN-01** | Cada usuario tiene una `identificacion` única y un `correo` único y con formato válido. |
| **RN-02** | Un usuario es **miembro** o **entrenador**, nunca ambos. |
| **RN-03** | Un objetivo pertenece a un único miembro y es de uno de tres tipos: `PESO_CORPORAL`, `FRECUENCIA_SEMANAL`, `FUERZA_EJERCICIO`. |
| **RN-04** | `valorInicial` y `valorMeta` son positivos (la frecuencia puede iniciar en 0) y distintos entre sí; `fechaLimite` es posterior a `fechaInicio`. |
| **RN-05** | Un objetivo `FUERZA_EJERCICIO` exige un ejercicio del catálogo; los demás tipos no admiten ejercicio. |
| **RN-06** | Estados del objetivo: `ACTIVO` → `CUMPLIDO` o `CANCELADO`. Un objetivo cerrado no cambia de estado. |
| **RN-07** | El progreso de un objetivo **se calcula, no se ingresa**: `(actual − inicial) / (meta − inicial)` acotado a 0–100 %. `actual` es: último peso medido (`PESO_CORPORAL`); sesiones de la semana en curso (`FRECUENCIA_SEMANAL`); mayor peso levantado en el ejercicio desde `fechaInicio` (`FUERZA_EJERCICIO`). Sin datos, el progreso es 0 %. |
| **RN-08** | El nombre de un ejercicio es único en el catálogo (sin distinguir mayúsculas) y tiene un grupo muscular. |
| **RN-09** | Una rutina la crea un entrenador existente y contiene **al menos un** ejercicio prescrito con series ≥ 1, repeticiones ≥ 1 y descanso ≥ 0 s. |
| **RN-10** | Un ejercicio prescrito pertenece a una sola rutina y desaparece con ella. |
| **RN-11** | Un miembro tiene como máximo **una** asignación de rutina `ACTIVA`. Al asignar otra, la anterior pasa a `FINALIZADA` con `fechaFin` = hoy. |
| **RN-12** | Solo un entrenador existente asigna rutinas, a un miembro existente. |
| **RN-13** | Una sesión no tiene fecha futura, dura más de 0 minutos y contiene **al menos una** serie; cada serie referencia un ejercicio del catálogo, con repeticiones ≥ 1 y `pesoKg` ≥ 0 (0 = peso corporal). |
| **RN-14** | Una sesión puede seguir una rutina o ser libre. Si referencia una rutina, esta debe existir. |
| **RN-15** | Una medición no tiene fecha futura; `pesoKg` entre 20 y 400; `porcentajeGrasa` (opcional) entre 1 y 70; `cinturaCm` (opcional) > 0. |
| **RN-16** | No puede haber dos mediciones del mismo miembro en la misma fecha (conflicto). |
| **RN-17** | Un miembro tiene altura entre 100 y 250 cm y fecha de nacimiento pasada que implique al menos 14 años. |
| **RN-18** | Un miembro solo consulta y modifica sus propios datos de seguimiento (objetivos, sesiones, mediciones). *(En esta entrega se refleja en el diseño de rutas; sin autenticación no se puede hacer cumplir.)* |
