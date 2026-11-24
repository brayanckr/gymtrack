package com.gymtrack.api.dto;

import java.time.LocalDate;
import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** DTO de sesiones de entrenamiento (HU-13, 14). */
public final class SesionDtos {

    private SesionDtos() {
    }

    /** Una serie realizada. {@code pesoKg = 0} indica ejercicio de peso corporal (RN-13). */
    public record SerieRequest(
            @NotBlank(message = "es obligatorio") String ejercicioId,
            @Min(value = 1, message = "debe ser al menos 1") int repeticiones,
            @DecimalMin(value = "0", message = "no puede ser negativo") double pesoKg) {
    }

    /** Entrada de {@code POST /api/miembros/{id}/sesiones}; {@code rutinaId} nulo = sesión libre (RN-14). */
    public record SesionRequest(
            @NotNull(message = "es obligatoria") LocalDate fecha,
            @Min(value = 1, message = "debe ser mayor que 0") int duracionMinutos,
            String rutinaId,
            @Size(max = 500, message = "máximo 500 caracteres") String notas,
            @NotEmpty(message = "debe incluir al menos una serie") List<@Valid SerieRequest> series) {
    }

    public record SerieResponse(int numeroSerie, String ejercicioId, String ejercicioNombre, int repeticiones,
            double pesoKg) {
    }

    /** Fila del historial (HU-14). */
    public record SesionResumenResponse(String id, LocalDate fecha, int duracionMinutos, String rutinaId,
            String rutinaNombre, int totalSeries) {
    }

    public record SesionResponse(String id, String miembroId, LocalDate fecha, int duracionMinutos,
            String rutinaId, String rutinaNombre, String notas, List<SerieResponse> series) {
    }
}
