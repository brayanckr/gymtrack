package com.gymtrack.api.exception;

/**
 * La operación choca con el estado actual de los datos: identificación o correo repetidos (RN-01),
 * nombre de ejercicio repetido (RN-08), objetivo ya cerrado (RN-06), medición duplicada (RN-16).
 * Se traduce a HTTP 409.
 */
public class ConflictoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ConflictoException(String mensaje) {
        super(mensaje);
    }
}
