package com.gymtrack.api.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.MedicionDtos.MedicionRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.MedicionCorporal;
import com.gymtrack.api.repository.MedicionRepository;

/** Componente funcional «Seguimiento Corporal» (HU-15, 16). */
@Service
public class MedicionService {

    private final MedicionRepository mediciones;
    private final UsuarioService usuarioService;
    private final Clock reloj;

    public MedicionService(MedicionRepository mediciones, UsuarioService usuarioService, Clock reloj) {
        this.mediciones = mediciones;
        this.usuarioService = usuarioService;
        this.reloj = reloj;
    }

    /**
     * HU-15: registra una medición. RN-15: fecha no futura, peso entre 20 y 400 kg, grasa (opcional) entre
     * 1 y 70 y cintura (opcional) mayor que 0. RN-16: no puede haber dos mediciones el mismo día (409).
     */
    public MedicionCorporal registrar(String miembroId, MedicionRequest req) {
        usuarioService.requerirMiembro(miembroId);

        if (req.fecha().isAfter(LocalDate.now(reloj))) {
            throw new ReglaDeNegocioException("La fecha de la medición no puede ser futura");
        }
        if (req.pesoKg() < 20 || req.pesoKg() > 400) {
            throw new ReglaDeNegocioException("El peso debe estar entre 20 y 400 kg");
        }
        if (req.porcentajeGrasa() != null && (req.porcentajeGrasa() < 1 || req.porcentajeGrasa() > 70)) {
            throw new ReglaDeNegocioException("El porcentaje de grasa debe estar entre 1 y 70");
        }
        if (req.cinturaCm() != null && req.cinturaCm() <= 0) {
            throw new ReglaDeNegocioException("La cintura debe ser mayor que 0");
        }
        if (mediciones.existsByMiembroIdAndFecha(miembroId, req.fecha())) {
            throw new ConflictoException("Ya registraste una medición en esa fecha");
        }
        return mediciones.save(new MedicionCorporal(miembroId, req.fecha(), req.pesoKg(), req.porcentajeGrasa(),
                req.cinturaCm()));
    }

    /** HU-16: evolución del miembro en orden cronológico. */
    public List<MedicionCorporal> listar(String miembroId) {
        usuarioService.requerirMiembro(miembroId);
        return mediciones.findByMiembroIdOrderByFechaAsc(miembroId);
    }

    /** Las dos mediciones más recientes (la más nueva primero), para la variación de peso del panel. */
    public List<MedicionCorporal> ultimasDos(String miembroId) {
        return mediciones.findTop2ByMiembroIdOrderByFechaDesc(miembroId);
    }
}
