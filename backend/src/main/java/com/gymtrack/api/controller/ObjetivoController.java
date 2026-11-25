package com.gymtrack.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.api.dto.ObjetivoDtos.EstadoObjetivoRequest;
import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoRequest;
import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoResponse;
import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.service.ObjetivoService;
import com.gymtrack.api.service.ProgresoService;

import jakarta.validation.Valid;

/**
 * Recursos de objetivos (HU-04, 05, 06). El objetivo se crea y se lista <i>dentro del miembro</i>
 * ({@code /api/miembros/{miembroId}/objetivos}, reflejo de RN-18) y se consulta o cierra por su propio id.
 * Las respuestas incluyen el progreso calculado por {@link ProgresoService}.
 */
@RestController
@RequestMapping("/api")
public class ObjetivoController {

    private final ObjetivoService objetivoService;
    private final ProgresoService progresoService;

    public ObjetivoController(ObjetivoService objetivoService, ProgresoService progresoService) {
        this.objetivoService = objetivoService;
        this.progresoService = progresoService;
    }

    /** HU-04. 201; 400 (RN-04/05); 404 si el miembro o el ejercicio no existen. */
    @PostMapping("/miembros/{miembroId}/objetivos")
    public ResponseEntity<ObjetivoResponse> definir(@PathVariable String miembroId,
            @Valid @RequestBody ObjetivoRequest req) {
        ObjetivoResponse creado = progresoService.responder(objetivoService.crear(miembroId, req));
        return ResponseEntity.created(URI.create("/api/objetivos/" + creado.id())).body(creado);
    }

    /** HU-05. {@code ?estado=ACTIVO} filtra. Cada objetivo trae su progreso. */
    @GetMapping("/miembros/{miembroId}/objetivos")
    public List<ObjetivoResponse> listar(@PathVariable String miembroId,
            @RequestParam(required = false) EstadoObjetivo estado) {
        return progresoService.objetivosConProgreso(miembroId, estado);
    }

    @GetMapping("/objetivos/{id}")
    public ObjetivoResponse obtener(@PathVariable String id) {
        return progresoService.responder(objetivoService.obtener(id));
    }

    /** HU-06. 200; 400 si se pide ACTIVO; 404; 409 si el objetivo ya estaba cerrado (RN-06). */
    @PatchMapping("/objetivos/{id}/estado")
    public ObjetivoResponse cambiarEstado(@PathVariable String id, @Valid @RequestBody EstadoObjetivoRequest req) {
        return progresoService.responder(objetivoService.cambiarEstado(id, req.estado()));
    }
}
