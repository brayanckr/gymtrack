package com.gymtrack.api.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.AsignacionRutina;
import com.gymtrack.api.model.EstadoAsignacion;

public interface AsignacionRutinaRepository extends MongoRepository<AsignacionRutina, String> {

    /** Historial del miembro, la más reciente primero. */
    List<AsignacionRutina> findByMiembroIdOrderByFechaInicioDesc(String miembroId);

    /** RN-11: como máximo una asignación activa por miembro. */
    Optional<AsignacionRutina> findFirstByMiembroIdAndEstado(String miembroId, EstadoAsignacion estado);
}
