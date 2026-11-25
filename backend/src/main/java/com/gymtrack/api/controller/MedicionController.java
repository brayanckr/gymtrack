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

import com.gymtrack.api.dto.MedicionDtos.MedicionRequest;
import com.gymtrack.api.dto.MedicionDtos.MedicionResponse;
import com.gymtrack.api.service.MedicionService;

import jakarta.validation.Valid;

/** Recursos de mediciones corporales (HU-15, 16). */
@RestController
@RequestMapping("/api/miembros/{miembroId}/mediciones")
public class MedicionController {

    private final MedicionService medicionService;

    public MedicionController(MedicionService medicionService) {
        this.medicionService = medicionService;
    }

    /** HU-15. 201; 400 (RN-15); 404 si el miembro no existe; 409 si ya hay una medición ese día (RN-16). */
    @PostMapping
    public ResponseEntity<MedicionResponse> registrar(@PathVariable String miembroId,
            @Valid @RequestBody MedicionRequest req) {
        MedicionResponse creada = MedicionResponse.de(medicionService.registrar(miembroId, req));
        return ResponseEntity.created(URI.create("/api/miembros/" + miembroId + "/mediciones")).body(creada);
    }

    /** HU-16: evolución en orden cronológico. */
    @GetMapping
    public List<MedicionResponse> listar(@PathVariable String miembroId) {
        return medicionService.listar(miembroId).stream().map(MedicionResponse::de).toList();
    }
}
