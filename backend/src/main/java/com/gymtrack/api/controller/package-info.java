/**
 * <b>Capa de presentación (Controller).</b>
 *
 * <p>Responsabilidad: recibir las peticiones HTTP, validar el <i>formato</i> de la entrada
 * ({@code @Valid}), delegar en un {@code Service} y traducir el resultado a una respuesta HTTP con el
 * código correcto (200, 201, 204...). Es lo único del sistema que "habla HTTP".
 *
 * <p>Lo que <b>no</b> hace (lección del material: "¿por qué Controller no debería implementar toda la
 * lógica de negocio?"): no aplica reglas de negocio y nunca accede a MongoDB; eso es trabajo del
 * {@code Service} y del {@code Repository}.
 *
 * <p>Dependencias permitidas (vista de desarrollo): {@code service}, {@code dto} y {@code model}.
 */
package com.gymtrack.api.controller;
