package com.gymtrack.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.gymtrack.api.dto.UsuarioDtos.EntrenadorRequest;
import com.gymtrack.api.dto.UsuarioDtos.MiembroRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.OperacionNoPermitidaException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.Entrenador;
import com.gymtrack.api.model.Miembro;
import com.gymtrack.api.repository.EntrenadorRepository;
import com.gymtrack.api.repository.MiembroRepository;
import com.gymtrack.api.repository.UsuarioRepository;

/** RN-01 (identificación y correo únicos), RN-02 (un solo tipo), RN-12 (rol) y RN-17 (edad). Hoy es 23/11/2026. */
class UsuarioServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 23);

    private UsuarioRepository usuarios;
    private MiembroRepository miembros;
    private EntrenadorRepository entrenadores;
    private UsuarioService servicio;

    @BeforeEach
    void preparar() {
        usuarios = mock(UsuarioRepository.class);
        miembros = mock(MiembroRepository.class);
        entrenadores = mock(EntrenadorRepository.class);
        Clock reloj = Clock.fixed(HOY.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        servicio = new UsuarioService(usuarios, miembros, entrenadores, reloj);
        when(miembros.save(any(Miembro.class))).thenAnswer(inv -> inv.getArgument(0));
        when(entrenadores.save(any(Entrenador.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void registraUnMiembroYGuardaElCorreoEnMinusculas() {
        Miembro m = servicio.crearMiembro(miembro("1001", "Camila@Correo.COM", LocalDate.of(1999, 3, 14), 168));

        assertThat(m.getCorreo()).isEqualTo("camila@correo.com");
        assertThat(m.getIdentificacion()).isEqualTo("1001");
    }

    @Test
    void identificacionRepetidaEsUnConflicto() {
        when(usuarios.existsByIdentificacion("1001")).thenReturn(true);

        assertThatThrownBy(() -> servicio.crearMiembro(miembro("1001", "a@b.co", LocalDate.of(1999, 3, 14), 168)))
                .isInstanceOf(ConflictoException.class).hasMessageContaining("identificación");
        verify(miembros, never()).save(any());
    }

    @Test
    void correoRepetidoEsUnConflicto() {
        when(usuarios.existsByCorreo("a@b.co")).thenReturn(true);

        assertThatThrownBy(() -> servicio.crearMiembro(miembro("1001", "A@B.co", LocalDate.of(1999, 3, 14), 168)))
                .isInstanceOf(ConflictoException.class).hasMessageContaining("correo");
    }

    @Test
    void unEntrenadorNoPuedeReutilizarLaIdentificacionDeUnMiembro() {
        // RN-02: un usuario es de un solo tipo; la comprobación es sobre toda la colección de usuarios.
        when(usuarios.existsByIdentificacion("1001")).thenReturn(true);

        assertThatThrownBy(() -> servicio.crearEntrenador(new EntrenadorRequest("1001", "Andrés", "a@b.co", "Fuerza")))
                .isInstanceOf(ConflictoException.class);
    }

    @Test
    void rechazaMenoresDeCatorceAnios() {
        assertThatThrownBy(() -> servicio.crearMiembro(miembro("1001", "a@b.co", HOY.minusYears(13), 150)))
                .isInstanceOf(ReglaDeNegocioException.class).hasMessageContaining("14");
    }

    @Test
    void aceptaAQuienCumpleCatorceAniosHoy() {
        assertThat(servicio.crearMiembro(miembro("1001", "a@b.co", HOY.minusYears(14), 150))).isNotNull();
    }

    @Test
    void rechazaUnaFechaDeNacimientoQueNoEsPasada() {
        assertThatThrownBy(() -> servicio.crearMiembro(miembro("1001", "a@b.co", HOY, 150)))
                .isInstanceOf(ReglaDeNegocioException.class);
    }

    @Test
    void requerirEntrenadorConElIdDeUnMiembroEs403() {
        when(usuarios.findById("m1")).thenReturn(Optional.of(unMiembro()));

        assertThatThrownBy(() -> servicio.requerirEntrenador("m1", "crear rutinas"))
                .isInstanceOf(OperacionNoPermitidaException.class).hasMessageContaining("crear rutinas");
    }

    @Test
    void requerirEntrenadorAceptaUnEntrenador() {
        Entrenador andres = new Entrenador("900001", "Andrés", "a@b.co", "Fuerza");
        when(usuarios.findById("t1")).thenReturn(Optional.of(andres));

        assertThat(servicio.requerirEntrenador("t1", "crear rutinas")).isSameAs(andres);
    }

    @Test
    void requerirEntrenadorInexistenteEs404() {
        when(usuarios.findById("nadie")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.requerirEntrenador("nadie", "crear rutinas"))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void requerirMiembroInexistenteEs404() {
        when(usuarios.findById("nadie")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.requerirMiembro("nadie")).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void unEntrenadorNoSePuedeUsarComoMiembro() {
        // Regresión hallada con MongoDB real: el id de un entrenador pasaba por miembro.
        when(usuarios.findById("t1")).thenReturn(Optional.of(new Entrenador("900001", "Andrés", "a@b.co", "Fuerza")));

        assertThatThrownBy(() -> servicio.requerirMiembro("t1")).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void laListaDeMiembrosNoIncluyeEntrenadores() {
        // Regresión hallada con MongoDB real: la colección usuarios mezcla ambos tipos.
        when(usuarios.findAll()).thenReturn(java.util.List.of(
                unMiembro(), new Entrenador("900001", "Andrés", "a@b.co", "Fuerza")));

        assertThat(servicio.listarMiembros()).hasSize(1).allMatch(u -> u instanceof Miembro);
        assertThat(servicio.listarEntrenadores()).hasSize(1).allMatch(u -> u instanceof Entrenador);
    }

    private static Miembro unMiembro() {
        return new Miembro("1001", "Camila", "c@b.co", LocalDate.of(1999, 3, 14), 168);
    }

    private static MiembroRequest miembro(String id, String correo, LocalDate nacimiento, int altura) {
        return new MiembroRequest(id, "Camila Rojas", correo, nacimiento, altura);
    }
}
