package com.gymtrack.api.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.SesionEntrenamiento;

public interface SesionRepository extends MongoRepository<SesionEntrenamiento, String> {

    /** Historial (HU-14): más reciente primero. */
    List<SesionEntrenamiento> findByMiembroIdOrderByFechaDesc(String miembroId);

    /** Sesiones entre dos fechas, ambas incluidas (semana en curso, mes en curso). */
    List<SesionEntrenamiento> findByMiembroIdAndFechaBetween(String miembroId, LocalDate desde, LocalDate hasta);

    /** Sesiones desde una fecha (para el objetivo de fuerza, que mira desde su fecha de inicio). */
    List<SesionEntrenamiento> findByMiembroIdAndFechaGreaterThanEqual(String miembroId, LocalDate desde);
}
