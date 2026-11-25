package com.gymtrack.api.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.Miembro;

/** Miembros: Spring Data filtra la colección {@code usuarios} por el tipo {@link Miembro}. */
public interface MiembroRepository extends MongoRepository<Miembro, String> {
}
