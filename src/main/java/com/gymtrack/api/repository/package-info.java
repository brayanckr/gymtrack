/**
 * <b>Capa de datos (Repository).</b>
 *
 * <p>Responsabilidad: persistir y recuperar documentos de MongoDB. Son interfaces que extienden
 * {@code MongoRepository}: Spring Data genera la implementación a partir del nombre de cada método
 * (por ejemplo {@code findByMiembroId}). Aquí solo hay consultas; ninguna regla de negocio.
 *
 * <p>Dependencia permitida: {@code model} (los tipos que persiste).
 */
package com.gymtrack.api.repository;
