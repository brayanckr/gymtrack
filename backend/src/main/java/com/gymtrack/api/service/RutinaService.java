package com.gymtrack.api.service;

import java.time.Clock;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.PanelDtos.RutinaActivaResumen;
import com.gymtrack.api.dto.RutinaDtos.AsignacionRequest;
import com.gymtrack.api.dto.RutinaDtos.AsignacionResponse;
import com.gymtrack.api.dto.RutinaDtos.EjercicioPrescritoRequest;
import com.gymtrack.api.dto.RutinaDtos.EjercicioPrescritoResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaActivaResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaRequest;
import com.gymtrack.api.dto.RutinaDtos.RutinaResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaResumenResponse;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.AsignacionRutina;
import com.gymtrack.api.model.EjercicioPrescrito;
import com.gymtrack.api.model.EstadoAsignacion;
import com.gymtrack.api.model.Rutina;
import com.gymtrack.api.repository.AsignacionRutinaRepository;
import com.gymtrack.api.repository.RutinaRepository;

/**
 * Componente funcional «Gestión de Rutinas» (HU-09, 10, 11, 12): crear rutinas, consultarlas y asignarlas.
 */
@Service
public class RutinaService {

    private final RutinaRepository rutinas;
    private final AsignacionRutinaRepository asignaciones;
    private final UsuarioService usuarioService;
    private final EjercicioService ejercicioService;
    private final Clock reloj;

    public RutinaService(RutinaRepository rutinas, AsignacionRutinaRepository asignaciones,
            UsuarioService usuarioService, EjercicioService ejercicioService, Clock reloj) {
        this.rutinas = rutinas;
        this.asignaciones = asignaciones;
        this.usuarioService = usuarioService;
        this.ejercicioService = ejercicioService;
        this.reloj = reloj;
    }

    // ------------------------------------------------------------------ rutinas

    /**
     * HU-09: crea una rutina a nombre de un entrenador. RN-09: al menos un ejercicio del catálogo, con
     * series ≥ 1, repeticiones ≥ 1 y descanso ≥ 0. Los ejercicios se numeran según el orden recibido.
     */
    public Rutina crear(RutinaRequest req) {
        usuarioService.requerirEntrenador(req.entrenadorId(), "crear rutinas");
        if (req.ejercicios() == null || req.ejercicios().isEmpty()) {
            throw new ReglaDeNegocioException("Una rutina necesita al menos un ejercicio");
        }
        List<EjercicioPrescrito> prescritos = new ArrayList<>();
        int orden = 1;
        for (EjercicioPrescritoRequest e : req.ejercicios()) {
            ejercicioService.obtener(e.ejercicioId()); // 404 si el ejercicio no existe
            if (e.series() < 1 || e.repeticiones() < 1 || e.descansoSegundos() < 0) {
                throw new ReglaDeNegocioException("Series y repeticiones deben ser al menos 1 y el descanso no puede ser negativo");
            }
            prescritos.add(new EjercicioPrescrito(orden++, e.dia(), e.ejercicioId(), e.series(), e.repeticiones(),
                    e.descansoSegundos()));
        }
        String descripcion = req.descripcion() == null ? null : req.descripcion().trim();
        return rutinas.save(new Rutina(req.nombre().trim(), descripcion, req.nivel(), req.entrenadorId(), prescritos));
    }

    /** HU-10: lista resumida de rutinas con el nombre del entrenador. */
    public List<RutinaResumenResponse> listar() {
        List<Rutina> todas = rutinas.findAll();
        Set<String> entrenadorIds = new HashSet<>();
        todas.forEach(r -> entrenadorIds.add(r.getEntrenadorId()));
        Map<String, String> nombres = usuarioService.nombres(entrenadorIds);
        return todas.stream()
                .map(r -> new RutinaResumenResponse(r.getId(), r.getNombre(), r.getNivel(), r.getEntrenadorId(),
                        nombres.get(r.getEntrenadorId()), r.getEjercicios().size()))
                .toList();
    }

    public Rutina obtener(String id) {
        return rutinas.findById(id).orElseThrow(() -> RecursoNoEncontradoException.de("una rutina", id));
    }

    /** HU-10: detalle de una rutina con los nombres de sus ejercicios. */
    public RutinaResponse detalle(String id) {
        return aDetalle(obtener(id));
    }

    /** Nombre de una rutina, o {@code null} si el id es nulo o ya no existe. */
    public String nombre(String rutinaId) {
        if (rutinaId == null) {
            return null;
        }
        return rutinas.findById(rutinaId).map(Rutina::getNombre).orElse(null);
    }

    // ------------------------------------------------------------------ asignaciones

    /**
     * HU-11: asigna una rutina a un miembro. RN-12: la asigna un entrenador existente a un miembro
     * existente. RN-11: si el miembro ya tenía una rutina activa, esa se finaliza hoy.
     */
    public AsignacionResponse asignar(String miembroId, AsignacionRequest req) {
        usuarioService.requerirMiembro(miembroId);
        usuarioService.requerirEntrenador(req.entrenadorId(), "asignar rutinas");
        Rutina rutina = obtener(req.rutinaId());

        LocalDate hoy = LocalDate.now(reloj);
        asignaciones.findFirstByMiembroIdAndEstado(miembroId, EstadoAsignacion.ACTIVA).ifPresent(anterior -> {
            anterior.finalizar(hoy);
            asignaciones.save(anterior);
        });
        AsignacionRutina nueva = asignaciones.save(new AsignacionRutina(miembroId, req.entrenadorId(),
                rutina.getId(), hoy));
        return aAsignacion(nueva, rutina.getNombre());
    }

    /** HU-12: historial de asignaciones del miembro, la más reciente primero. */
    public List<AsignacionResponse> historial(String miembroId) {
        usuarioService.requerirMiembro(miembroId);
        List<AsignacionRutina> lista = asignaciones.findByMiembroIdOrderByFechaInicioDesc(miembroId);
        Map<String, String> nombres = nombresDeRutinas(lista.stream().map(AsignacionRutina::getRutinaId).toList());
        return lista.stream().map(a -> aAsignacion(a, nombres.get(a.getRutinaId()))).toList();
    }

    /** HU-12: rutina activa del miembro. Si no tiene, 404 con un mensaje claro. */
    public RutinaActivaResponse rutinaActiva(String miembroId) {
        usuarioService.requerirMiembro(miembroId);
        AsignacionRutina activa = asignaciones.findFirstByMiembroIdAndEstado(miembroId, EstadoAsignacion.ACTIVA)
                .orElseThrow(() -> new RecursoNoEncontradoException("Aún no te han asignado una rutina"));
        RutinaResponse detalle = aDetalle(obtener(activa.getRutinaId()));
        return new RutinaActivaResponse(aAsignacion(activa, detalle.nombre()), detalle);
    }

    /** Resumen de la rutina activa para el panel (HU-17), o {@code null} si no hay. */
    public RutinaActivaResumen resumenActiva(String miembroId) {
        return asignaciones.findFirstByMiembroIdAndEstado(miembroId, EstadoAsignacion.ACTIVA)
                .map(a -> new RutinaActivaResumen(a.getRutinaId(), nombre(a.getRutinaId()), a.getFechaInicio()))
                .orElse(null);
    }

    // ------------------------------------------------------------------ conversiones

    private RutinaResponse aDetalle(Rutina r) {
        Set<String> ids = new HashSet<>();
        r.getEjercicios().forEach(e -> ids.add(e.getEjercicioId()));
        Map<String, String> nombresEjercicio = ejercicioService.nombres(ids);
        String entrenador = usuarioService.nombres(List.of(r.getEntrenadorId())).get(r.getEntrenadorId());
        List<EjercicioPrescritoResponse> ejercicios = r.getEjercicios().stream()
                .map(e -> new EjercicioPrescritoResponse(e.getOrden(), e.getDia(), e.getEjercicioId(),
                        nombresEjercicio.get(e.getEjercicioId()), e.getSeries(), e.getRepeticiones(),
                        e.getDescansoSegundos()))
                .toList();
        return new RutinaResponse(r.getId(), r.getNombre(), r.getDescripcion(), r.getNivel(), r.getEntrenadorId(),
                entrenador, ejercicios);
    }

    private static AsignacionResponse aAsignacion(AsignacionRutina a, String rutinaNombre) {
        return new AsignacionResponse(a.getId(), a.getMiembroId(), a.getEntrenadorId(), a.getRutinaId(), rutinaNombre,
                a.getFechaInicio(), a.getFechaFin(), a.getEstado());
    }

    private Map<String, String> nombresDeRutinas(Collection<String> ids) {
        Map<String, String> resultado = new HashMap<>();
        for (Rutina r : rutinas.findAllById(ids)) {
            resultado.put(r.getId(), r.getNombre());
        }
        return resultado;
    }
}
