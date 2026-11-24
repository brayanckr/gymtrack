package com.gymtrack.api.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.ObjetivoRepository;

/**
 * Componente funcional «Gestión de Objetivos» (HU-04, 05, 06).
 *
 * <p>Guarda y valida objetivos. <b>No calcula el progreso</b>: eso es responsabilidad de
 * {@code ProgresoService}, que depende de este servicio (vista lógica, diseño por capas).
 */
@Service
public class ObjetivoService {

    private final ObjetivoRepository objetivos;
    private final UsuarioService usuarioService;
    private final EjercicioService ejercicioService;
    private final Clock reloj;

    public ObjetivoService(ObjetivoRepository objetivos, UsuarioService usuarioService,
            EjercicioService ejercicioService, Clock reloj) {
        this.objetivos = objetivos;
        this.usuarioService = usuarioService;
        this.ejercicioService = ejercicioService;
        this.reloj = reloj;
    }

    /** HU-04: define un objetivo activo que empieza hoy. Aplica RN-04 y RN-05. */
    public Objetivo crear(String miembroId, ObjetivoRequest req) {
        usuarioService.requerirMiembro(miembroId);

        double inicial = req.valorInicial();
        double meta = req.valorMeta();
        LocalDate hoy = LocalDate.now(reloj);

        // RN-04: valores positivos (la frecuencia puede iniciar en 0) y distintos entre sí.
        if (meta <= 0 || inicial < 0 || (inicial == 0 && req.tipo() != TipoObjetivo.FRECUENCIA_SEMANAL)) {
            throw new ReglaDeNegocioException("El valor inicial y la meta deben ser positivos");
        }
        if (inicial == meta) {
            throw new ReglaDeNegocioException("La meta no puede ser igual al valor inicial");
        }
        // RN-04: la fecha límite debe ser posterior a la fecha de inicio (hoy).
        if (!req.fechaLimite().isAfter(hoy)) {
            throw new ReglaDeNegocioException("La fecha límite debe ser posterior a hoy");
        }

        // RN-05: solo los objetivos de fuerza llevan ejercicio, y es obligatorio en ellos.
        String ejercicioId = req.ejercicioId() == null || req.ejercicioId().isBlank() ? null : req.ejercicioId();
        if (req.tipo() == TipoObjetivo.FUERZA_EJERCICIO) {
            if (ejercicioId == null) {
                throw new ReglaDeNegocioException("Un objetivo de fuerza requiere un ejercicio del catálogo");
            }
            ejercicioService.obtener(ejercicioId); // 404 si no existe
        } else if (ejercicioId != null) {
            throw new ReglaDeNegocioException("Solo los objetivos de fuerza admiten un ejercicio");
        }

        return objetivos.save(new Objetivo(miembroId, ejercicioId, req.tipo(), req.descripcion().trim(),
                inicial, meta, hoy, req.fechaLimite()));
    }

    /** HU-05: objetivos del miembro, opcionalmente filtrados por estado. */
    public List<Objetivo> listar(String miembroId, EstadoObjetivo estado) {
        usuarioService.requerirMiembro(miembroId);
        return estado == null ? objetivos.findByMiembroId(miembroId)
                : objetivos.findByMiembroIdAndEstado(miembroId, estado);
    }

    public Objetivo obtener(String id) {
        return objetivos.findById(id).orElseThrow(() -> RecursoNoEncontradoException.de("un objetivo", id));
    }

    /**
     * HU-06: cierra un objetivo como cumplido o cancelado (RN-06). Un objetivo ya cerrado no cambia de
     * estado (409) y no se puede "reabrir" (400).
     */
    public Objetivo cambiarEstado(String id, EstadoObjetivo nuevo) {
        if (nuevo == EstadoObjetivo.ACTIVO) {
            throw new ReglaDeNegocioException("Un objetivo solo se puede cerrar como CUMPLIDO o CANCELADO");
        }
        Objetivo objetivo = obtener(id);
        if (!objetivo.estaActivo()) {
            throw new ConflictoException("El objetivo ya está " + objetivo.getEstado() + " y no puede cambiar de estado");
        }
        objetivo.setEstado(nuevo);
        return objetivos.save(objetivo);
    }
}
