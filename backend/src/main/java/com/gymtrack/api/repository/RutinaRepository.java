package com.gymtrack.api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.Rutina;

/** Rutinas con sus ejercicios prescritos embebidos: no hace falta un repositorio para las partes. */
public interface RutinaRepository extends MongoRepository<Rutina, String> {
}
