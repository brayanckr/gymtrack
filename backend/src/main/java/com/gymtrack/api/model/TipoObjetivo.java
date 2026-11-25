package com.gymtrack.api.model;

/**
 * Los tres tipos de objetivo medibles con datos del propio sistema (RN-03). Cada uno obtiene su
 * "valor actual" de una fuente distinta (ver {@code service.progreso.EstrategiaProgreso}).
 */
public enum TipoObjetivo {
    /** Llegar a un peso corporal: se mide con la última {@link MedicionCorporal}. */
    PESO_CORPORAL,
    /** Entrenar N veces por semana: se mide con las sesiones de la semana en curso. */
    FRECUENCIA_SEMANAL,
    /** Levantar cierto peso en un ejercicio: se mide con el mayor peso de las series registradas. */
    FUERZA_EJERCICIO
}
