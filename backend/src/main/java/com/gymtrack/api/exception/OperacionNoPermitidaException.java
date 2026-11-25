package com.gymtrack.api.exception;

/**
 * Quien actúa existe pero no tiene el rol que la operación exige (RN-12: solo un entrenador crea
 * ejercicios y rutinas o asigna rutinas). Se traduce a HTTP 403.
 */
public class OperacionNoPermitidaException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public OperacionNoPermitidaException(String mensaje) {
        super(mensaje);
    }
}
