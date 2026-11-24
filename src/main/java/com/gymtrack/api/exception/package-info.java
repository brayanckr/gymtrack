/**
 * Excepciones de negocio y su traducción a HTTP.
 *
 * <p>Cada excepción corresponde a un código del contrato ({@code docs/05-contrato-api.md}):
 * {@code ReglaDeNegocioException} → 400, {@code OperacionNoPermitidaException} → 403,
 * {@code RecursoNoEncontradoException} → 404 y {@code ConflictoException} → 409.
 * {@code GlobalExceptionHandler} las convierte en un cuerpo de error uniforme, de modo que ningún
 * controlador necesita bloques {@code try/catch}.
 */
package com.gymtrack.api.exception;
