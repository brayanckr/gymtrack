package com.gymtrack.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.api.dto.EjercicioDtos.EjercicioRequest;
import com.gymtrack.api.dto.EjercicioDtos.EjercicioResponse;
import com.gymtrack.api.model.GrupoMuscular;
import com.gymtrack.api.service.EjercicioService;

import jakarta.validation.Valid;

/** Recurso {@code /api/ejercicios}: el catálogo de ejercicios (HU-07, 08). */
@RestController
@RequestMapping("/api/ejercicios")
public class EjercicioController {

    private final EjercicioService ejercicioService;

    public EjercicioController(EjercicioService ejercicioService) {
        this.ejercicioService = ejercicioService;
    }

    /** HU-07. {@code ?grupoMuscular=PECHO} filtra; un valor desconocido responde 400. Lista vacía = 200. */
    @GetMapping
    public List<EjercicioResponse> listar(@RequestParam(required = false) GrupoMuscular grupoMuscular) {
        return ejercicioService.listar(grupoMuscular).stream().map(EjercicioResponse::de).toList();
    }

    @GetMapping("/{id}")
    public EjercicioResponse obtener(@PathVariable String id) {
        return EjercicioResponse.de(ejercicioService.obtener(id));
    }

    /** HU-08. 201; 400 datos inválidos; 403 si no es un entrenador; 404 si no existe; 409 nombre repetido. */
    @PostMapping
    public ResponseEntity<EjercicioResponse> crear(@Valid @RequestBody EjercicioRequest req) {
        EjercicioResponse creado = EjercicioResponse.de(ejercicioService.crear(req));
        return ResponseEntity.created(URI.create("/api/ejercicios/" + creado.id())).body(creado);
    }
}
