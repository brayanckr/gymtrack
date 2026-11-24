package com.gymtrack.api.dto;

import java.time.LocalDate;

import com.gymtrack.api.model.Entrenador;
import com.gymtrack.api.model.Miembro;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

/**
 * DTO de usuarios (HU-01, 02, 03). Validan solo el <i>formato</i>; las reglas que dependen del contexto
 * (edad mínima, identificación o correo repetidos) las aplica {@code UsuarioService}.
 */
public final class UsuarioDtos {

    private UsuarioDtos() {
    }

    /** Entrada de {@code POST /api/miembros}. */
    public record MiembroRequest(
            @NotBlank(message = "es obligatoria") @Size(max = 30, message = "máximo 30 caracteres") String identificacion,
            @NotBlank(message = "es obligatorio") @Size(max = 100, message = "máximo 100 caracteres") String nombre,
            @NotBlank(message = "es obligatorio") @Email(message = "no es un correo válido") String correo,
            @NotNull(message = "es obligatoria") LocalDate fechaNacimiento,
            @NotNull(message = "es obligatoria") @Min(value = 100, message = "debe estar entre 100 y 250")
            @Max(value = 250, message = "debe estar entre 100 y 250") Integer alturaCm) {
    }

    /** Entrada de {@code POST /api/entrenadores}. */
    public record EntrenadorRequest(
            @NotBlank(message = "es obligatoria") @Size(max = 30, message = "máximo 30 caracteres") String identificacion,
            @NotBlank(message = "es obligatorio") @Size(max = 100, message = "máximo 100 caracteres") String nombre,
            @NotBlank(message = "es obligatorio") @Email(message = "no es un correo válido") String correo,
            @NotBlank(message = "es obligatoria") @Size(max = 100, message = "máximo 100 caracteres") String especialidad) {
    }

    /** Entrada de {@code PUT /api/miembros/{id}}: la identificación y la fecha de nacimiento no se editan (HU-03). */
    public record MiembroUpdateRequest(
            @NotBlank(message = "es obligatorio") @Size(max = 100, message = "máximo 100 caracteres") String nombre,
            @NotBlank(message = "es obligatorio") @Email(message = "no es un correo válido") String correo,
            @NotNull(message = "es obligatoria") @Min(value = 100, message = "debe estar entre 100 y 250")
            @Max(value = 250, message = "debe estar entre 100 y 250") Integer alturaCm) {
    }

    public record MiembroResponse(String id, String tipo, String identificacion, String nombre, String correo,
            LocalDate fechaNacimiento, int alturaCm) {

        public static MiembroResponse de(Miembro m) {
            return new MiembroResponse(m.getId(), "MIEMBRO", m.getIdentificacion(), m.getNombre(), m.getCorreo(),
                    m.getFechaNacimiento(), m.getAlturaCm());
        }
    }

    public record EntrenadorResponse(String id, String tipo, String identificacion, String nombre, String correo,
            String especialidad) {

        public static EntrenadorResponse de(Entrenador e) {
            return new EntrenadorResponse(e.getId(), "ENTRENADOR", e.getIdentificacion(), e.getNombre(),
                    e.getCorreo(), e.getEspecialidad());
        }
    }
}
