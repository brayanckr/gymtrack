package com.gymtrack.api.dto;

import java.time.LocalDate;
import java.util.List;

import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoResponse;
import com.gymtrack.api.dto.SesionDtos.SesionResumenResponse;

/** DTO del panel de progreso (HU-17): un resumen de todo lo que el miembro necesita ver de un vistazo. */
public final class PanelDtos {

    private PanelDtos() {
    }

    public record RutinaActivaResumen(String rutinaId, String nombre, LocalDate desde) {
    }

    /**
     * Respuesta de {@code GET /api/miembros/{id}/panel}. Los campos opcionales son {@code null} cuando aún no
     * hay datos (estado vacío de la HU-17): el cliente muestra un acceso directo para crear el primero.
     */
    public record PanelResponse(Double ultimoPesoKg, Double variacionPesoKg, int sesionesDelMes,
            SesionResumenResponse ultimaSesion, List<ObjetivoResponse> objetivosActivos,
            RutinaActivaResumen rutinaActiva) {
    }
}
