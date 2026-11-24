package com.gymtrack.api.dto;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Cuerpo uniforme de todos los errores (contrato en {@code docs/05-contrato-api.md}). {@code errores}
 * lista los campos inválidos en un 400 de validación y va vacío en los demás casos.
 */
public record ErrorResponse(LocalDateTime timestamp, int status, String error, String message,
        List<CampoError> errores) {

    /** Un campo inválido y por qué. */
    public record CampoError(String campo, String mensaje) {
    }
}
