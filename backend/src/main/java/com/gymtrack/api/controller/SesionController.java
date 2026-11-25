package com.gymtrack.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.api.dto.SesionDtos.SesionRequest;
import com.gymtrack.api.dto.SesionDtos.SesionResponse;
import com.gymtrack.api.dto.SesionDtos.SesionResumenResponse;
import com.gymtrack.api.service.SesionService;

import jakarta.validation.Valid;

/** Recursos de sesiones de entrenamiento (HU-13, 14). */
@RestController
@RequestMapping("/api")
public class SesionController {

    private final SesionService sesionService;

    public SesionController(SesionService sesionService) {
        this.sesionService = sesionService;
    }

    /** HU-13. 201 con el detalle; 400 (RN-13); 404 si el miembro, la rutina o un ejercicio no existen. */
    @PostMapping("/miembros/{miembroId}/sesiones")
    public ResponseEntity<SesionResponse> registrar(@PathVariable String miembroId,
            @Valid @RequestBody SesionRequest req) {
        String id = sesionService.registrar(miembroId, req).getId();
        return ResponseEntity.created(URI.create("/api/sesiones/" + id)).body(sesionService.detalle(id));
    }

    /** HU-14: historial, la más reciente primero. */
    @GetMapping("/miembros/{miembroId}/sesiones")
    public List<SesionResumenResponse> historial(@PathVariable String miembroId) {
        return sesionService.historial(miembroId);
    }

    /** HU-14: detalle con cada serie. */
    @GetMapping("/sesiones/{id}")
    public SesionResponse detalle(@PathVariable String id) {
        return sesionService.detalle(id);
    }
}
