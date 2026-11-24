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

import com.gymtrack.api.dto.RutinaDtos.AsignacionRequest;
import com.gymtrack.api.dto.RutinaDtos.AsignacionResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaActivaResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaRequest;
import com.gymtrack.api.dto.RutinaDtos.RutinaResponse;
import com.gymtrack.api.dto.RutinaDtos.RutinaResumenResponse;
import com.gymtrack.api.service.RutinaService;

import jakarta.validation.Valid;

/** Recursos de rutinas y de su asignación a miembros (HU-09, 10, 11, 12). */
@RestController
@RequestMapping("/api")
public class RutinaController {

    private final RutinaService rutinaService;

    public RutinaController(RutinaService rutinaService) {
        this.rutinaService = rutinaService;
    }

    /** HU-09. 201 con el detalle; 400 (RN-09); 403 si quien crea no es entrenador; 404 ejercicio inexistente. */
    @PostMapping("/rutinas")
    public ResponseEntity<RutinaResponse> crear(@Valid @RequestBody RutinaRequest req) {
        String id = rutinaService.crear(req).getId();
        return ResponseEntity.created(URI.create("/api/rutinas/" + id)).body(rutinaService.detalle(id));
    }

    /** HU-10: lista resumida. */
    @GetMapping("/rutinas")
    public List<RutinaResumenResponse> listar() {
        return rutinaService.listar();
    }

    /** HU-10: detalle con ejercicios y nombres. 404 si no existe. */
    @GetMapping("/rutinas/{id}")
    public RutinaResponse detalle(@PathVariable String id) {
        return rutinaService.detalle(id);
    }

    /** HU-11. 201; finaliza la rutina activa anterior (RN-11); 403 si quien asigna no es entrenador. */
    @PostMapping("/miembros/{miembroId}/asignaciones")
    public ResponseEntity<AsignacionResponse> asignar(@PathVariable String miembroId,
            @Valid @RequestBody AsignacionRequest req) {
        AsignacionResponse creada = rutinaService.asignar(miembroId, req);
        return ResponseEntity.created(URI.create("/api/miembros/" + miembroId + "/asignaciones")).body(creada);
    }

    /** HU-12: historial de asignaciones. */
    @GetMapping("/miembros/{miembroId}/asignaciones")
    public List<AsignacionResponse> historial(@PathVariable String miembroId) {
        return rutinaService.historial(miembroId);
    }

    /** HU-12: rutina activa. 404 si el miembro todavía no tiene una. */
    @GetMapping("/miembros/{miembroId}/rutina-activa")
    public RutinaActivaResponse rutinaActiva(@PathVariable String miembroId) {
        return rutinaService.rutinaActiva(miembroId);
    }
}
