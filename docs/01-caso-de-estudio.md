# Caso de estudio: GymTrack

## Problema

Las personas que entrenan en un gimnasio suelen llevar su avance en notas sueltas o de memoria: no saben si cumplen sus metas,
qué hicieron en la sesión anterior ni cómo evoluciona su peso. Los entrenadores diseñan rutinas pero no tienen un lugar
donde asignarlas y ver si se están siguiendo.

**GymTrack** es una aplicación para **desarrollar y dar seguimiento al entrenamiento en el gimnasio**: definir objetivos,
consultar rutinas, registrar sesiones y mediciones corporales, y ver el avance.

## Actores

| Actor | Descripción |
|---|---|
| **Miembro** | Persona que entrena. Define objetivos, sigue una rutina, registra sesiones y mediciones, ve su progreso. |
| **Entrenador** | Profesional que mantiene el catálogo de ejercicios, diseña rutinas y las asigna a miembros. |

## Alcance (dentro)

Registro de usuarios · objetivos con progreso calculado · catálogo de ejercicios · rutinas y su asignación ·
registro de sesiones de entrenamiento · mediciones corporales · panel de progreso.

## Fuera de alcance (decisiones declaradas)

| Tema | Decisión |
|---|---|
| Autenticación / contraseñas / roles de administrador | **Fuera de alcance.** La API de esta entrega no autentica. El frontend de demo "inicia sesión" eligiendo un perfil existente. Es una limitación consciente; se documenta como trabajo futuro. |
| Pagos, membresías, control de acceso al gimnasio | No se modela. |
| Nutrición, wearables, notificaciones | No se modela. |
| Infraestructura avanzada (balanceo, contenedores orquestados, alta disponibilidad) | Reservada para cursos posteriores; el material la excluye explícitamente. |

## Stack (el de la materia)

* Backend: **Java + Spring Boot**, tres capas (Controller → Service → Repository), **MongoDB**.
* API **REST** con JSON; códigos HTTP 200/201/204/400/404/409/500.
* Frontend de demostración: aplicación web (SPA) que consume la API.

## Supuestos pendientes de confirmar con el docente

Se marcan para no "inventar" reglas (Bloque 3: *las multiplicidades no se inventan*):

1. Un miembro solo puede tener **una** rutina activa a la vez (RN-11).
2. Una sesión puede registrarse **sin** rutina asociada (sesión libre) (RN-14).
3. Los tipos de objetivo se limitan a tres medibles con datos del propio sistema (RN-03).
4. Entrenador y miembro son tipos exclusivos de usuario (RN-02).
