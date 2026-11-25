package com.gymtrack.api.service;

import java.time.Clock;
import java.time.LocalDate;
import java.time.Period;
import java.util.Collection;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.UsuarioDtos.EntrenadorRequest;
import com.gymtrack.api.dto.UsuarioDtos.MiembroRequest;
import com.gymtrack.api.dto.UsuarioDtos.MiembroUpdateRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.OperacionNoPermitidaException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.Entrenador;
import com.gymtrack.api.model.Miembro;
import com.gymtrack.api.model.Usuario;
import com.gymtrack.api.repository.EntrenadorRepository;
import com.gymtrack.api.repository.MiembroRepository;
import com.gymtrack.api.repository.UsuarioRepository;

/**
 * Componente funcional «Gestión de Usuarios» (HU-01, 02, 03).
 *
 * <p>Además de los casos de uso propios, ofrece a los demás servicios dos operaciones de validación:
 * {@link #requerirMiembro(String)} y {@link #requerirEntrenador(String, String)}. Así, "el miembro debe
 * existir" y "solo un entrenador puede..." se resuelven en un único lugar (vista funcional: los demás
 * componentes dependen de este).
 */
@Service
public class UsuarioService {

    /** RN-17: edad mínima para registrarse como miembro. */
    private static final int EDAD_MINIMA = 14;

    private final UsuarioRepository usuarios;
    private final MiembroRepository miembros;
    private final EntrenadorRepository entrenadores;
    private final Clock reloj;

    public UsuarioService(UsuarioRepository usuarios, MiembroRepository miembros,
            EntrenadorRepository entrenadores, Clock reloj) {
        this.usuarios = usuarios;
        this.miembros = miembros;
        this.entrenadores = entrenadores;
        this.reloj = reloj;
    }

    // ------------------------------------------------------------------ casos de uso

    /** HU-01: registra un miembro. RN-01 (identificación y correo únicos) y RN-17 (altura y edad). */
    public Miembro crearMiembro(MiembroRequest req) {
        String correo = normalizarCorreo(req.correo());
        validarIdentidadLibre(req.identificacion().trim(), correo);

        LocalDate hoy = LocalDate.now(reloj);
        if (!req.fechaNacimiento().isBefore(hoy)) {
            throw new ReglaDeNegocioException("La fecha de nacimiento debe ser una fecha pasada");
        }
        if (Period.between(req.fechaNacimiento(), hoy).getYears() < EDAD_MINIMA) {
            throw new ReglaDeNegocioException("Debes tener al menos " + EDAD_MINIMA + " años para registrarte");
        }
        return miembros.save(new Miembro(req.identificacion().trim(), req.nombre().trim(), correo,
                req.fechaNacimiento(), req.alturaCm()));
    }

    /** HU-02: registra un entrenador. */
    public Entrenador crearEntrenador(EntrenadorRequest req) {
        String correo = normalizarCorreo(req.correo());
        validarIdentidadLibre(req.identificacion().trim(), correo);
        return entrenadores.save(new Entrenador(req.identificacion().trim(), req.nombre().trim(), correo,
                req.especialidad().trim()));
    }

    /** HU-03: actualiza nombre, correo y altura. La identificación no se puede cambiar. */
    public Miembro actualizarMiembro(String id, MiembroUpdateRequest req) {
        Miembro miembro = obtenerMiembro(id);
        String correo = normalizarCorreo(req.correo());
        if (!correo.equals(miembro.getCorreo()) && usuarios.existsByCorreo(correo)) {
            throw new ConflictoException("Ya existe un usuario con ese correo");
        }
        miembro.setNombre(req.nombre().trim());
        miembro.setCorreo(correo);
        miembro.setAlturaCm(req.alturaCm());
        return miembros.save(miembro);
    }

    public List<Miembro> listarMiembros() {
        return todosDeTipo(Miembro.class);
    }

    public List<Entrenador> listarEntrenadores() {
        return todosDeTipo(Entrenador.class);
    }

    public Miembro obtenerMiembro(String id) {
        return porId(id, Miembro.class, "un miembro");
    }

    public Entrenador obtenerEntrenador(String id) {
        return porId(id, Entrenador.class, "un entrenador");
    }

    /**
     * Busca por id y exige el tipo. Se resuelve SIEMPRE por {@link UsuarioRepository} y se comprueba con
     * {@code instanceof}: con MongoDB real, {@code findById}/{@code findAll} de un repositorio de subtipo
     * (MiembroRepository, EntrenadorRepository) <b>no filtran por tipo</b> en la colección compartida
     * {@code usuarios}, y un entrenador podía pasar por miembro (o al revés). Las pruebas con repositorios
     * simulados no lo detectaron; apareció al probar contra MongoDB.
     */
    private <T extends Usuario> T porId(String id, Class<T> tipo, String recurso) {
        return usuarios.findById(id).filter(tipo::isInstance).map(tipo::cast)
                .orElseThrow(() -> RecursoNoEncontradoException.de(recurso, id));
    }

    private <T extends Usuario> List<T> todosDeTipo(Class<T> tipo) {
        return usuarios.findAll().stream().filter(tipo::isInstance).map(tipo::cast).toList();
    }

    // ------------------------------------------------------------------ validaciones para otros servicios

    /** Falla con 404 si el miembro no existe. Devuelve el miembro por comodidad. */
    public Miembro requerirMiembro(String miembroId) {
        return obtenerMiembro(miembroId);
    }

    /**
     * Exige que {@code entrenadorId} sea un entrenador (RN-12). Si el id existe pero es de un miembro la
     * respuesta es 403 (no tiene el rol); si no existe, 404.
     *
     * @param accion lo que se intenta hacer, para el mensaje ("crear rutinas", "asignar rutinas"...)
     */
    public Entrenador requerirEntrenador(String entrenadorId, String accion) {
        Usuario usuario = usuarios.findById(entrenadorId)
                .orElseThrow(() -> RecursoNoEncontradoException.de("un entrenador", entrenadorId));
        if (usuario instanceof Entrenador entrenador) {
            return entrenador;
        }
        throw new OperacionNoPermitidaException("Solo un entrenador puede " + accion);
    }

    /** Nombres de varios usuarios de una vez (id → nombre), para completar respuestas sin consultar uno a uno. */
    public Map<String, String> nombres(Collection<String> ids) {
        Map<String, String> resultado = new HashMap<>();
        for (Usuario u : usuarios.findAllById(ids)) {
            resultado.put(u.getId(), u.getNombre());
        }
        return resultado;
    }

    // ------------------------------------------------------------------ auxiliares

    /** El correo se guarda en minúsculas para que la unicidad (RN-01) no dependa de las mayúsculas. */
    private static String normalizarCorreo(String correo) {
        return correo.trim().toLowerCase();
    }

    private void validarIdentidadLibre(String identificacion, String correo) {
        if (usuarios.existsByIdentificacion(identificacion)) {
            throw new ConflictoException("Ya existe un usuario con esa identificación");
        }
        if (usuarios.existsByCorreo(correo)) {
            throw new ConflictoException("Ya existe un usuario con ese correo");
        }
    }
}
