/**
 * <b>Modelo de dominio</b> (no es una capa de ejecución): las entidades que existen en el negocio.
 *
 * <p>Sigue el modelo de dominio de {@code docs/03-modelo-de-dominio.md}: mismos conceptos, atributos y
 * relaciones. Decisiones de persistencia en MongoDB:
 * <ul>
 *   <li><b>Composición ⇒ documento embebido:</b> {@code EjercicioPrescrito} vive dentro de
 *       {@code Rutina} y {@code RegistroSerie} dentro de {@code SesionEntrenamiento} (nacen y mueren con su todo).</li>
 *   <li><b>Asociación entre conceptos independientes ⇒ referencia por id</b> ({@code miembroId},
 *       {@code ejercicioId}, {@code rutinaId}...).</li>
 *   <li><b>Herencia:</b> {@code Miembro} y {@code Entrenador} comparten la colección {@code usuarios};
 *       Spring Data guarda el tipo en el campo {@code _class} (el "discriminador").</li>
 * </ul>
 *
 * <p>Este paquete no depende de ningún otro paquete del proyecto.
 */
package com.gymtrack.api.model;
