package com.gymtrack.api.service;

import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.EjercicioDtos.EjercicioRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.model.Ejercicio;
import com.gymtrack.api.model.GrupoMuscular;
import com.gymtrack.api.repository.EjercicioRepository;

/**
 * Componente funcional «Catálogo de Ejercicios» (HU-07, 08). Es un componente de datos maestros: rutinas,
 * sesiones y objetivos lo usan para comprobar que un ejercicio existe.
 */
@Service
public class EjercicioService {

    private final EjercicioRepository ejercicios;
    private final UsuarioService usuarioService;

    public EjercicioService(EjercicioRepository ejercicios, UsuarioService usuarioService) {
        this.ejercicios = ejercicios;
        this.usuarioService = usuarioService;
    }

    /** HU-07: lista el catálogo, opcionalmente filtrado por grupo muscular. Lista vacía si no hay resultados. */
    public List<Ejercicio> listar(GrupoMuscular grupo) {
        return grupo == null ? ejercicios.findAll() : ejercicios.findByGrupoMuscular(grupo);
    }

    public Ejercicio obtener(String id) {
        return ejercicios.findById(id).orElseThrow(() -> RecursoNoEncontradoException.de("un ejercicio", id));
    }

    /**
     * HU-08: registra un ejercicio. Solo un entrenador puede hacerlo (RN-12) y el nombre es único sin
     * distinguir mayúsculas (RN-08).
     */
    public Ejercicio crear(EjercicioRequest req) {
        usuarioService.requerirEntrenador(req.entrenadorId(), "registrar ejercicios en el catálogo");
        String nombre = req.nombre().trim();
        if (ejercicios.existsByNombreIgnoreCase(nombre)) {
            throw new ConflictoException("Ya existe un ejercicio con ese nombre");
        }
        String descripcion = req.descripcion() == null ? null : req.descripcion().trim();
        return ejercicios.save(new Ejercicio(nombre, req.grupoMuscular(), descripcion));
    }

    /** Nombres de varios ejercicios de una vez (id → nombre), para completar respuestas de rutinas y sesiones. */
    public Map<String, String> nombres(Collection<String> ids) {
        Map<String, String> resultado = new HashMap<>();
        for (Ejercicio e : ejercicios.findAllById(ids)) {
            resultado.put(e.getId(), e.getNombre());
        }
        return resultado;
    }
}
