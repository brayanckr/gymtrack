package com.gymtrack.api.dto;

import com.gymtrack.api.model.Ejercicio;
import com.gymtrack.api.model.GrupoMuscular;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/** DTO del catálogo de ejercicios (HU-07, 08). */
public final class EjercicioDtos {

    private EjercicioDtos() {
    }

    /**
     * Entrada de {@code POST /api/ejercicios}. Como no hay autenticación, el cliente indica qué entrenador
     * lo registra y {@code EjercicioService} verifica que sea realmente un entrenador (HU-08, RN-12).
     */
    public record EjercicioRequest(
            @NotBlank(message = "es obligatorio") String entrenadorId,
            @NotBlank(message = "es obligatorio") @Size(max = 100, message = "máximo 100 caracteres") String nombre,
            @NotNull(message = "es obligatorio") GrupoMuscular grupoMuscular,
            @Size(max = 500, message = "máximo 500 caracteres") String descripcion) {
    }

    public record EjercicioResponse(String id, String nombre, GrupoMuscular grupoMuscular, String descripcion) {

        public static EjercicioResponse de(Ejercicio e) {
            return new EjercicioResponse(e.getId(), e.getNombre(), e.getGrupoMuscular(), e.getDescripcion());
        }
    }
}
