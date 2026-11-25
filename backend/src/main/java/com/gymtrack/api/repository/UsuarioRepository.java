package com.gymtrack.api.repository;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.Usuario;

/**
 * Acceso a la colección {@code usuarios} sin distinguir el tipo. Sirve para las reglas que valen para
 * <i>todos</i> los usuarios: identificación y correo únicos (RN-01) y "un usuario es de un solo tipo" (RN-02).
 */
public interface UsuarioRepository extends MongoRepository<Usuario, String> {

    boolean existsByIdentificacion(String identificacion);

    boolean existsByCorreo(String correo);

    Optional<Usuario> findByCorreo(String correo);
}
