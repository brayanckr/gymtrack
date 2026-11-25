# Reglas de la materia aplicadas a GymTrack

Resumen de lo que establece el material de *Diseño de Software* (Bloques 1, 2, 3, 5, lectura previa del Bloque 7,
"De la Web a una API REST con Spring Boot y MongoDB" y "Diagramas de despliegue UML") y de cómo lo aplica este proyecto.
Cada regla se usa como **lista de verificación** de los diagramas y del código.

> Nota de alcance: el material cubre de forma directa los modelos de dominio, las clases, los componentes (vista funcional),
> las tres capas (vista lógica) y el despliegue. **No** define formalmente las *vistas de contexto* ni de *desarrollo*;
> para esas dos se aplica la notación UML estándar (ver sección 6) y esa decisión queda declarada aquí.

## 1. Proceso (Bloque 1)

| Regla | Cómo se aplica |
|---|---|
| Requisito = **qué**; diseño = **cómo**. No mezclarlos. | Las historias de usuario no mencionan endpoints, tablas ni clases. El diseño vive en `docs/` y en los diagramas. |
| UML es una herramienta de comunicación, no el diseño en sí. | Cada diagrama se acompaña de la decisión que justifica. |
| Arquitectura ≠ diseño. | La arquitectura (capas, tecnologías) está en las vistas de contexto/funcional/despliegue; el diseño (clases) en la lógica. |
| Código = resultado de decisiones previas. | El backend sigue el modelo lógico; hay trazabilidad HU → componente → clase. |

## 2. Del requisito al modelo conceptual (Bloque 2)

* Conceptos del dominio = elementos del negocio, **independientes de la tecnología**.
* No son conceptos: `Controller`, `Service`, tablas, botones, bases de datos.
* Técnicas: sustantivos relevantes, lenguaje del negocio, preguntas (¿qué?, ¿quién?, ¿con qué?, ¿bajo qué reglas?).
* Distinguir **obra vs. copia** (Libro/Ejemplar). En GymTrack: **Ejercicio** (catálogo) vs. **EjercicioPrescrito** / **RegistroSerie** (uso concreto).

## 3. Modelo de dominio (Bloque 3)

Incluye: conceptos, atributos relevantes, **relaciones con nombre** (se leen como frase del negocio), **multiplicidades justificadas**, reglas.
No incluye: métodos, controladores, servicios, tablas, tecnologías.

* Pregunta de atributo/concepto: ¿solo describe o tiene identidad y relaciones propias? → concepto.
* **Las multiplicidades no se inventan**: cada una cita la regla de negocio que la justifica (`docs/03-modelo-de-dominio.md`).
* Notación: `1`, `0..1`, `0..*`, `1..*`.
* Estilo de referencia (imagen de clase): `Estudiante 1 —realiza→ 0..* Prestamo`, con atributos listados y sin operaciones.

## 4. Relaciones estructurales e interfaces (Bloque 5)

| Relación | Pregunta guía | Uso en GymTrack |
|---|---|---|
| Asociación | ¿Se conocen/colaboran sin controlar la existencia del otro? | Miembro–Objetivo, Rutina–Ejercicio, Sesión–Miembro… |
| Agregación | ¿"Tiene" pero no controla su existencia? Tener una `List` no basta. | **No se usa**: ningún concepto agrupa a otros con ciclo de vida independiente sin ser asociación. No se fuerza. |
| Composición | ¿La parte nace y muere con el todo? | Rutina ◆— EjercicioPrescrito; SesionEntrenamiento ◆— RegistroSerie |
| Herencia | ¿"Es un tipo de"? ¿Se puede usar donde se espera el padre? | Usuario ◁— Miembro / Entrenador |
| Interfaz | Contrato de operaciones sin imponer el cómo. | `EstrategiaProgreso` (3 implementaciones) |

* La herencia **no** lleva multiplicidades y se dibuja con triángulo hueco hacia la superclase.
* No se usa herencia solo para reutilizar código.

## 5. Capas y API REST (lectura Bloque 7 y "De la Web a una API REST")

* Tres capas: **Controller** (HTTP, validación de formato) → **Service** (reglas de negocio, casos de uso) → **Repository** (persistencia).
* Las entidades de dominio **no son una cuarta capa**; se dibujan aparte.
* Relación Controller→Service→Repository = asociación (referencia por inyección); uso temporal = dependencia.
* Rutas nombran recursos; el método HTTP expresa la operación. Códigos: 200, 201, 204, 400, 404, 409, 500.
* Contrato mínimo de una operación: método y ruta, parámetros, entrada, respuesta de éxito, errores previstos.
* MongoDB: documento/colección, `_id`, decisión **embeber vs. referenciar** justificada (composición → embebido; asociación entre conceptos independientes → referencia).
* Jerarquía en una colección con discriminador (patrón `tipo`) — aquí aplicado a `usuarios`.
* El controlador **no** accede directamente a MongoDB ni contiene reglas de negocio.

## 6. Vistas arquitectónicas pedidas

| Vista | Pregunta que responde | Elementos UML usados | Reglas de verificación |
|---|---|---|---|
| **Contexto** | ¿Quién y qué interactúa con el sistema? | Sistema como caja negra, actores, sistemas externos, interacciones con protocolo/etiqueta | Sin estructura interna; actores y externos coinciden con las HU; no añadir externos no pedidos. *(No definida en el material: UML estándar.)* |
| **Funcional** | ¿Qué partes funcionales forman la solución? | Componentes, interfaces provistas/requeridas, puertos, dependencias | Agrupaciones cohesivas con responsabilidad de alto nivel (Bloque 5); cada HU cae en un componente. |
| **Lógica** | ¿Qué objetos existen y cómo se relacionan? | Diagrama de clases: modelo de dominio + diseño por capas | Reglas de las secciones 3, 4 y 5. |
| **Desarrollo** | ¿Cómo se organiza el código y qué depende de qué? | Paquetes/módulos, repositorios, dependencias de compilación | Dependencias en un solo sentido (Controller→Service→Repository→Model); dominio sin dependencias de capas superiores. *(No definida en el material: UML estándar.)* |
| **Despliegue** | ¿Dónde se ejecutan los artefactos y cómo se conectan? | `«device»`, `«executionEnvironment»`, `«artifact»`, rutas de comunicación con protocolo | Ver sección 7. |

## 7. Despliegue (material "Diagramas de despliegue UML")

* Nodo `«device»` = recurso físico/virtual; `«executionEnvironment»` = navegador, JVM, motor MongoDB; `«artifact»` = unidad desplegable (`gymtrack-api.jar`), **no** una clase de dominio.
* Capas lógicas **≠** servidores: Controller/Service/Repository corren juntos en una JVM.
* Errores a evitar: tres servidores por capa; flechas de herencia entre servidores; omitir cliente o comunicaciones; confundir `Libro` con `editorial.jar`; dibujar MongoDB Atlas dentro de la JVM; añadir balanceadores/contenedores no pedidos.
* Representar el despliegue real **o** un escenario hipotético claramente identificado.
* Lista de verificación: Corrección · Artefactos · Comunicación (protocolos) · Coherencia con las capas · Claridad.
