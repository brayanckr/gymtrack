package com.gymtrack.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

import com.gymtrack.api.model.SesionEntrenamiento;

public interface SesionRepository extends MongoRepository<SesionEntrenamiento, String> {

    /** Historial (HU-14): más reciente primero. */
    List<SesionEntrenamiento> findByMiembroIdOrderByFechaDesc(String miembroId);

    /**
     * Sesiones entre dos fechas, <b>ambas incluidas</b> (semana en curso, mes en curso).
     *
     * <p>Consulta explícita a propósito: el {@code Between} derivado de Spring Data MongoDB es <i>exclusivo</i>
     * ({@code $gt/$lt}) y dejaba fuera la sesión del lunes (primer día de la semana) o del primer y último día
     * del mes. Las pruebas con repositorios simulados no lo detectaron; apareció al probar con MongoDB real.
     */
    @Query("{ 'miembroId': ?0, 'fecha': { '$gte': ?1, '$lte': ?2 } }")
    List<SesionEntrenamiento> findByMiembroIdAndFechaBetween(String miembroId, LocalDate desde, LocalDate hasta);

    /** Sesiones desde una fecha (para el objetivo de fuerza, que mira desde su fecha de inicio). */
    List<SesionEntrenamiento> findByMiembroIdAndFechaGreaterThanEqual(String miembroId, LocalDate desde);
}
