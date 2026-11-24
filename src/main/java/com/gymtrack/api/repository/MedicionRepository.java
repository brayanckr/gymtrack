package com.gymtrack.api.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.gymtrack.api.model.MedicionCorporal;

public interface MedicionRepository extends MongoRepository<MedicionCorporal, String> {

    /** Evolución (HU-16): orden cronológico. */
    List<MedicionCorporal> findByMiembroIdOrderByFechaAsc(String miembroId);

    /** El "último peso medido" de RN-07. */
    Optional<MedicionCorporal> findFirstByMiembroIdOrderByFechaDesc(String miembroId);

    /** Las dos últimas, para calcular la variación del panel. */
    List<MedicionCorporal> findTop2ByMiembroIdOrderByFechaDesc(String miembroId);

    /** RN-16: una medición por miembro y fecha. */
    boolean existsByMiembroIdAndFecha(String miembroId, LocalDate fecha);
}
