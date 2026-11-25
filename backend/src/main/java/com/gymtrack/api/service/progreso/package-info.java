/**
 * Cálculo del progreso de un objetivo (RN-07) con el patrón <b>Estrategia</b>.
 *
 * <p>{@link com.gymtrack.api.service.progreso.EstrategiaProgreso} es el <i>contrato</i> (interfaz,
 * Bloque 5): dado un objetivo, entrega el "valor actual". Hay una implementación por tipo de objetivo
 * (peso corporal, frecuencia semanal, fuerza en un ejercicio) porque cada tipo obtiene ese valor de una
 * fuente distinta. La fórmula del porcentaje es la misma para todos y vive en {@code ProgresoService}.
 */
package com.gymtrack.api.service.progreso;
