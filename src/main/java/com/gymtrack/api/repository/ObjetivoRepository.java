package com.gymtrack.api.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.Objetivo;

public interface ObjetivoRepository extends MongoRepository<Objetivo, String> {

    List<Objetivo> findByMiembroId(String miembroId);

    List<Objetivo> findByMiembroIdAndEstado(String miembroId, EstadoObjetivo estado);
}
