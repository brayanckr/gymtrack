package com.gymtrack.api.service.progreso;

import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;

/**
 * Contrato para obtener el <b>valor actual</b> de un objetivo (RN-07).
 *
 * <p>Es una <i>interfaz</i> en el sentido del Bloque 5: define qué puede hacer un objeto sin imponer cómo.
 * Cada tipo de objetivo mide su avance con una fuente distinta, así que hay una implementación por tipo y
 * {@code ProgresoService} elige la correcta con {@link #soporta()}. Añadir un cuarto tipo de objetivo
 * significa añadir una clase, sin tocar las existentes.
 */
public interface EstrategiaProgreso {

    /** Tipo de objetivo que esta estrategia sabe medir. */
    TipoObjetivo soporta();

    /**
     * Valor actual del objetivo, en la misma unidad que {@code valorInicial} y {@code valorMeta}.
     * Si todavía no hay datos devuelve el valor inicial, de modo que el progreso sea 0 % (RN-07).
     */
    double valorActual(Objetivo objetivo);
}
