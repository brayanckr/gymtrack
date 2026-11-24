package com.gymtrack.api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.Entrenador;

/** Entrenadores: Spring Data filtra la colección {@code usuarios} por el tipo {@link Entrenador}. */
public interface EntrenadorRepository extends MongoRepository<Entrenador, String> {
}
