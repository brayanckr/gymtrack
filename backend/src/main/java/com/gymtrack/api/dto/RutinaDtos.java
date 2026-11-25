package com.gymtrack.api.dto;

import java.time.LocalDate;
import java.util.List;

import com.gymtrack.api.model.DiaSemana;
import com.gymtrack.api.model.EstadoAsignacion;
import com.gymtrack.api.model.NivelRutina;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** DTO de rutinas y asignaciones (HU-09 a 12). */
public final class RutinaDtos {

    private RutinaDtos() {
    }

    /** Un ejercicio dentro de la rutina que se está creando (parte de la composición Rutina ◆— EjercicioPrescrito). */
    public record EjercicioPrescritoRequest(
            @NotBlank(message = "es obligatorio") String ejercicioId,
            @NotNull(message = "es obligatorio") DiaSemana dia,
            @Min(value = 1, message = "debe ser al menos 1") int series,
            @Min(value = 1, message = "debe ser al menos 1") int repeticiones,
            @Min(value = 0, message = "no puede ser negativo") int descansoSegundos) {
    }

    /** Entrada de {@code POST /api/rutinas} (RN-09: al menos un ejercicio). */
    public record RutinaRequest(
            @NotBlank(message = "es obligatorio") String entrenadorId,
            @NotBlank(message = "es obligatorio") @Size(max = 100, message = "máximo 100 caracteres") String nombre,
            @Size(max = 500, message = "máximo 500 caracteres") String descripcion,
            @NotNull(message = "es obligatorio") NivelRutina nivel,
            @NotEmpty(message = "debe incluir al menos un ejercicio") List<@Valid EjercicioPrescritoRequest> ejercicios) {
    }

    /** Entrada de {@code POST /api/miembros/{id}/asignaciones}. */
    public record AsignacionRequest(
            @NotBlank(message = "es obligatoria") String rutinaId,
            @NotBlank(message = "es obligatorio") String entrenadorId) {
    }

    public record EjercicioPrescritoResponse(int orden, DiaSemana dia, String ejercicioId, String ejercicioNombre,
            int series, int repeticiones, int descansoSegundos) {
    }

    /** Vista resumida para la lista de rutinas (HU-10). */
    public record RutinaResumenResponse(String id, String nombre, NivelRutina nivel, String entrenadorId,
            String entrenadorNombre, int totalEjercicios) {
    }

    /** Detalle de una rutina, con los nombres de los ejercicios ya resueltos para el cliente. */
    public record RutinaResponse(String id, String nombre, String descripcion, NivelRutina nivel,
            String entrenadorId, String entrenadorNombre, List<EjercicioPrescritoResponse> ejercicios) {
    }

    public record AsignacionResponse(String id, String miembroId, String entrenadorId, String rutinaId,
            String rutinaNombre, LocalDate fechaInicio, LocalDate fechaFin, EstadoAsignacion estado) {
    }

    /** Respuesta de {@code GET /api/miembros/{id}/rutina-activa} (HU-12). */
    public record RutinaActivaResponse(AsignacionResponse asignacion, RutinaResponse rutina) {
    }
}
