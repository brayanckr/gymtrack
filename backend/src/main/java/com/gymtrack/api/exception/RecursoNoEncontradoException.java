package com.gymtrack.api.exception;

/** El recurso pedido no existe (miembro, ejercicio, rutina...). Se traduce a HTTP 404. */
public class RecursoNoEncontradoException extends RuntimeException {

    private static final long serialVersionUID = 1L;

    public RecursoNoEncontradoException(String mensaje) {
        super(mensaje);
    }

    /** Atajo para el mensaje habitual: "No existe un miembro con id 123". */
    public static RecursoNoEncontradoException de(String recurso, String id) {
        return new RecursoNoEncontradoException("No existe " + recurso + " con id " + id);
    }
}
