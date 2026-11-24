package com.gymtrack.api.exception;

/**
 * Los datos están bien formados pero violan una regla de negocio (RN-04, RN-05, RN-09, RN-13, RN-15...).
 * Se traduce a HTTP 400. La validación de <i>formato</i> la hace Bean Validation en el controlador; esta
 * excepción es para reglas que dependen del contexto (fechas respecto de "hoy", combinación de campos...).
 */
public class ReglaDeNegocioException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public ReglaDeNegocioException(String mensaje) {
        super(mensaje);
    }
}
