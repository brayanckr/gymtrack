package com.gymtrack.api.controller;

import java.net.URI;
import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.gymtrack.api.dto.UsuarioDtos.EntrenadorRequest;
import com.gymtrack.api.dto.UsuarioDtos.EntrenadorResponse;
import com.gymtrack.api.dto.UsuarioDtos.MiembroRequest;
import com.gymtrack.api.dto.UsuarioDtos.MiembroResponse;
import com.gymtrack.api.dto.UsuarioDtos.MiembroUpdateRequest;
import com.gymtrack.api.service.UsuarioService;

import jakarta.validation.Valid;

/**
 * Recursos de usuarios (HU-01, 02, 03): {@code /api/miembros} y {@code /api/entrenadores}.
 * Solo traduce HTTP ⇄ servicio; las reglas (RN-01, RN-02, RN-17) están en {@link UsuarioService}.
 */
@RestController
@RequestMapping("/api")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    /** HU-01. 201 con {@code Location}; 400 datos inválidos; 409 identificación o correo repetidos. */
    @PostMapping("/miembros")
    public ResponseEntity<MiembroResponse> registrarMiembro(@Valid @RequestBody MiembroRequest req) {
        MiembroResponse creado = MiembroResponse.de(usuarioService.crearMiembro(req));
        return ResponseEntity.created(URI.create("/api/miembros/" + creado.id())).body(creado);
    }

    /** HU-02. */
    @PostMapping("/entrenadores")
    public ResponseEntity<EntrenadorResponse> registrarEntrenador(@Valid @RequestBody EntrenadorRequest req) {
        EntrenadorResponse creado = EntrenadorResponse.de(usuarioService.crearEntrenador(req));
        return ResponseEntity.created(URI.create("/api/entrenadores/" + creado.id())).body(creado);
    }

    @GetMapping("/miembros")
    public List<MiembroResponse> listarMiembros() {
        return usuarioService.listarMiembros().stream().map(MiembroResponse::de).toList();
    }

    @GetMapping("/entrenadores")
    public List<EntrenadorResponse> listarEntrenadores() {
        return usuarioService.listarEntrenadores().stream().map(EntrenadorResponse::de).toList();
    }

    /** HU-03: consultar perfil. 404 si no existe. */
    @GetMapping("/miembros/{id}")
    public MiembroResponse obtenerMiembro(@PathVariable String id) {
        return MiembroResponse.de(usuarioService.obtenerMiembro(id));
    }

    @GetMapping("/entrenadores/{id}")
    public EntrenadorResponse obtenerEntrenador(@PathVariable String id) {
        return EntrenadorResponse.de(usuarioService.obtenerEntrenador(id));
    }

    /** HU-03: actualizar nombre, correo y altura. La identificación no se puede cambiar. */
    @PutMapping("/miembros/{id}")
    public MiembroResponse actualizarMiembro(@PathVariable String id, @Valid @RequestBody MiembroUpdateRequest req) {
        return MiembroResponse.de(usuarioService.actualizarMiembro(id, req));
    }
}
