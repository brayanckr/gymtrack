package com.gymtrack.api.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.api.dto.ObjetivoDtos.ProgresoResponse;
import com.gymtrack.api.dto.PanelDtos.PanelResponse;
import com.gymtrack.api.service.ObjetivoService;
import com.gymtrack.api.service.ProgresoService;

/** Recursos de progreso (HU-05, 17): el panel del miembro y el avance de un objetivo. */
@RestController
@RequestMapping("/api")
public class ProgresoController {

    private final ProgresoService progresoService;
    private final ObjetivoService objetivoService;

    public ProgresoController(ProgresoService progresoService, ObjetivoService objetivoService) {
        this.progresoService = progresoService;
        this.objetivoService = objetivoService;
    }

    /** HU-17: resumen de un vistazo. Los bloques sin datos llegan vacíos o nulos. 404 si el miembro no existe. */
    @GetMapping("/miembros/{miembroId}/panel")
    public PanelResponse panel(@PathVariable String miembroId) {
        return progresoService.panel(miembroId);
    }

    /** Progreso calculado de un objetivo (RN-07). 404 si no existe. */
    @GetMapping("/objetivos/{id}/progreso")
    public ProgresoResponse progresoDeObjetivo(@PathVariable String id) {
        return progresoService.progresoDe(objetivoService.obtener(id));
    }
}
