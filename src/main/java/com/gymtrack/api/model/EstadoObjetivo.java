package com.gymtrack.api.model;

/** Ciclo de vida de un objetivo (RN-06): {@code ACTIVO → CUMPLIDO | CANCELADO}; un objetivo cerrado no cambia. */
public enum EstadoObjetivo {
    ACTIVO,
    CUMPLIDO,
    CANCELADO
}
