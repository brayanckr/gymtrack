package com.gymtrack.api.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.Ejercicio;
import com.gymtrack.api.model.GrupoMuscular;

public interface EjercicioRepository extends MongoRepository<Ejercicio, String> {

    List<Ejercicio> findByGrupoMuscular(GrupoMuscular grupoMuscular);

    /** RN-08: el nombre es único sin distinguir mayúsculas. */
    boolean existsByNombreIgnoreCase(String nombre);
}
