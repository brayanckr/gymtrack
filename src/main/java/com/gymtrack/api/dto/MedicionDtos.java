package com.gymtrack.api.dto;

import java.time.LocalDate;

import com.gymtrack.api.model.MedicionCorporal;

import jakarta.validation.constraints.NotNull;

/** DTO de mediciones corporales (HU-15, 16). Los rangos de RN-15 los aplica {@code MedicionService}. */
public final class MedicionDtos {

    private MedicionDtos() {
    }

    public record MedicionRequest(
            @NotNull(message = "es obligatoria") LocalDate fecha,
            @NotNull(message = "es obligatorio") Double pesoKg,
            Double porcentajeGrasa,
            Double cinturaCm) {
    }

    public record MedicionResponse(String id, String miembroId, LocalDate fecha, double pesoKg,
            Double porcentajeGrasa, Double cinturaCm) {

        public static MedicionResponse de(MedicionCorporal m) {
            return new MedicionResponse(m.getId(), m.getMiembroId(), m.getFecha(), m.getPesoKg(),
                    m.getPorcentajeGrasa(), m.getCinturaCm());
        }
    }
}
