package com.gymtrack.api.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.SesionDtos.SerieRequest;
import com.gymtrack.api.dto.SesionDtos.SerieResponse;
import com.gymtrack.api.dto.SesionDtos.SesionRequest;
import com.gymtrack.api.dto.SesionDtos.SesionResponse;
import com.gymtrack.api.dto.SesionDtos.SesionResumenResponse;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.RegistroSerie;
import com.gymtrack.api.model.SesionEntrenamiento;
import com.gymtrack.api.repository.SesionRepository;

/** Componente funcional «Registro de Entrenamientos» (HU-13, 14). */
@Service
public class SesionService {

    private final SesionRepository sesiones;
    private final UsuarioService usuarioService;
    private final EjercicioService ejercicioService;
    private final RutinaService rutinaService;
    private final Clock reloj;

    public SesionService(SesionRepository sesiones, UsuarioService usuarioService,
            EjercicioService ejercicioService, RutinaService rutinaService, Clock reloj) {
        this.sesiones = sesiones;
        this.usuarioService = usuarioService;
        this.ejercicioService = ejercicioService;
        this.rutinaService = rutinaService;
        this.reloj = reloj;
    }

    /**
     * HU-13: registra una sesión con todas sus series. RN-13: fecha no futura, duración &gt; 0, al menos una
     * serie y cada serie con un ejercicio del catálogo, repeticiones ≥ 1 y peso ≥ 0. RN-14: la rutina es
     * opcional; si se indica, debe existir.
     */
    public SesionEntrenamiento registrar(String miembroId, SesionRequest req) {
        usuarioService.requerirMiembro(miembroId);

        if (req.fecha().isAfter(LocalDate.now(reloj))) {
            throw new ReglaDeNegocioException("La fecha de la sesión no puede ser futura");
        }
        if (req.duracionMinutos() < 1) {
            throw new ReglaDeNegocioException("La duración debe ser mayor que 0");
        }
        if (req.series() == null || req.series().isEmpty()) {
            throw new ReglaDeNegocioException("Una sesión necesita al menos una serie");
        }

        String rutinaId = req.rutinaId() == null || req.rutinaId().isBlank() ? null : req.rutinaId();
        if (rutinaId != null) {
            rutinaService.obtener(rutinaId); // 404 si la rutina no existe
        }

        List<RegistroSerie> series = new ArrayList<>();
        int numero = 1;
        for (SerieRequest s : req.series()) {
            ejercicioService.obtener(s.ejercicioId()); // 404 si el ejercicio no existe
            if (s.repeticiones() < 1 || s.pesoKg() < 0) {
                throw new ReglaDeNegocioException(
                        "La serie " + numero + " no es válida: repeticiones ≥ 1 y peso ≥ 0");
            }
            series.add(new RegistroSerie(numero++, s.ejercicioId(), s.repeticiones(), s.pesoKg()));
        }
        String notas = req.notas() == null || req.notas().isBlank() ? null : req.notas().trim();
        return sesiones.save(new SesionEntrenamiento(miembroId, rutinaId, req.fecha(), req.duracionMinutos(),
                notas, series));
    }

    /** HU-14: historial del miembro, de la más reciente a la más antigua. */
    public List<SesionResumenResponse> historial(String miembroId) {
        usuarioService.requerirMiembro(miembroId);
        return sesiones.findByMiembroIdOrderByFechaDesc(miembroId).stream().map(this::aResumen).toList();
    }

    /** HU-14: detalle de una sesión con cada serie (ejercicio, repeticiones y peso). */
    public SesionResponse detalle(String id) {
        SesionEntrenamiento s = sesiones.findById(id)
                .orElseThrow(() -> RecursoNoEncontradoException.de("una sesión", id));
        Set<String> ids = new HashSet<>();
        s.getSeries().forEach(serie -> ids.add(serie.getEjercicioId()));
        Map<String, String> nombres = ejercicioService.nombres(ids);
        List<SerieResponse> series = s.getSeries().stream()
                .map(r -> new SerieResponse(r.getNumeroSerie(), r.getEjercicioId(), nombres.get(r.getEjercicioId()),
                        r.getRepeticiones(), r.getPesoKg()))
                .toList();
        return new SesionResponse(s.getId(), s.getMiembroId(), s.getFecha(), s.getDuracionMinutos(), s.getRutinaId(),
                rutinaService.nombre(s.getRutinaId()), s.getNotas(), series);
    }

    // ------------------------------------------------------------------ consultas para el panel (HU-17)

    /** Cantidad de sesiones del miembro en el mes en curso. */
    public int contarDelMes(String miembroId) {
        LocalDate hoy = LocalDate.now(reloj);
        LocalDate primero = hoy.withDayOfMonth(1);
        LocalDate ultimo = hoy.withDayOfMonth(hoy.lengthOfMonth());
        return sesiones.findByMiembroIdAndFechaBetween(miembroId, primero, ultimo).size();
    }

    /** La sesión más reciente del miembro, o {@code null} si todavía no tiene ninguna. */
    public SesionResumenResponse ultima(String miembroId) {
        return sesiones.findByMiembroIdOrderByFechaDesc(miembroId).stream().findFirst().map(this::aResumen)
                .orElse(null);
    }

    private SesionResumenResponse aResumen(SesionEntrenamiento s) {
        return new SesionResumenResponse(s.getId(), s.getFecha(), s.getDuracionMinutos(), s.getRutinaId(),
                rutinaService.nombre(s.getRutinaId()), s.getSeries().size());
    }
}
