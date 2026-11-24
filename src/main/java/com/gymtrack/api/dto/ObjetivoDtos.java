package com.gymtrack.api.dto;

import java.time.LocalDate;

import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** DTO de objetivos (HU-04, 05, 06). */
public final class ObjetivoDtos {

    private ObjetivoDtos() {
    }

    /**
     * Entrada de {@code POST /api/miembros/{id}/objetivos}. La fecha de inicio no se envía: es hoy (HU-04).
     * Las reglas RN-04 y RN-05 (valores, fecha límite, ejercicio según el tipo) las aplica el servicio.
     */
    public record ObjetivoRequest(
            @NotNull(message = "es obligatorio") TipoObjetivo tipo,
            @NotBlank(message = "es obligatoria") @Size(max = 200, message = "máximo 200 caracteres") String descripcion,
            @NotNull(message = "es obligatorio") Double valorInicial,
            @NotNull(message = "es obligatoria") Double valorMeta,
            @NotNull(message = "es obligatoria") LocalDate fechaLimite,
            String ejercicioId) {
    }

    /** Entrada de {@code PATCH /api/objetivos/{id}/estado}. Solo se admite cerrar el objetivo (RN-06). */
    public record EstadoObjetivoRequest(@NotNull(message = "es obligatorio") EstadoObjetivo estado) {
    }

    /** Progreso <b>calculado</b> (RN-07): no existe como dato guardado. */
    public record ProgresoResponse(double valorActual, double porcentaje) {
    }

    public record ObjetivoResponse(String id, String miembroId, String ejercicioId, TipoObjetivo tipo,
            String descripcion, double valorInicial, double valorMeta, LocalDate fechaInicio,
            LocalDate fechaLimite, EstadoObjetivo estado, ProgresoResponse progreso) {

        public static ObjetivoResponse de(Objetivo o, ProgresoResponse progreso) {
            return new ObjetivoResponse(o.getId(), o.getMiembroId(), o.getEjercicioId(), o.getTipo(),
                    o.getDescripcion(), o.getValorInicial(), o.getValorMeta(), o.getFechaInicio(),
                    o.getFechaLimite(), o.getEstado(), progreso);
        }
    }
}
