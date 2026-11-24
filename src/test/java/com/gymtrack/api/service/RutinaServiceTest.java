package com.gymtrack.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import com.gymtrack.api.dto.RutinaDtos.AsignacionRequest;
import com.gymtrack.api.dto.RutinaDtos.AsignacionResponse;
import com.gymtrack.api.dto.RutinaDtos.EjercicioPrescritoRequest;
import com.gymtrack.api.dto.RutinaDtos.RutinaRequest;
import com.gymtrack.api.exception.OperacionNoPermitidaException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.AsignacionRutina;
import com.gymtrack.api.model.DiaSemana;
import com.gymtrack.api.model.EstadoAsignacion;
import com.gymtrack.api.model.NivelRutina;
import com.gymtrack.api.model.Rutina;
import com.gymtrack.api.repository.AsignacionRutinaRepository;
import com.gymtrack.api.repository.RutinaRepository;

/** RN-09 (rutina con al menos un ejercicio), RN-11 (una sola asignación activa) y RN-12 (solo entrenadores). */
class RutinaServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 23);

    private RutinaRepository rutinas;
    private AsignacionRutinaRepository asignaciones;
    private UsuarioService usuarios;
    private EjercicioService ejercicios;
    private RutinaService servicio;

    @BeforeEach
    void preparar() {
        rutinas = mock(RutinaRepository.class);
        asignaciones = mock(AsignacionRutinaRepository.class);
        usuarios = mock(UsuarioService.class);
        ejercicios = mock(EjercicioService.class);
        Clock reloj = Clock.fixed(HOY.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        servicio = new RutinaService(rutinas, asignaciones, usuarios, ejercicios, reloj);
        when(rutinas.save(any(Rutina.class))).thenAnswer(inv -> inv.getArgument(0));
        when(asignaciones.save(any(AsignacionRutina.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void creaLaRutinaNumerandoSusEjerciciosSegunElOrdenRecibido() {
        RutinaRequest req = new RutinaRequest("t1", "Fuerza 3 días", null, NivelRutina.INTERMEDIO, List.of(
                new EjercicioPrescritoRequest("sentadilla", DiaSemana.LUNES, 5, 5, 120),
                new EjercicioPrescritoRequest("sentadilla", DiaSemana.VIERNES, 3, 8, 90)));

        servicio.crear(req);

        ArgumentCaptor<Rutina> guardada = ArgumentCaptor.forClass(Rutina.class);
        verify(rutinas).save(guardada.capture());
        assertThat(guardada.getValue().getEjercicios()).hasSize(2);
        assertThat(guardada.getValue().getEjercicios().get(0).getOrden()).isEqualTo(1);
        assertThat(guardada.getValue().getEjercicios().get(1).getOrden()).isEqualTo(2);
    }

    @Test
    void unaRutinaSinEjerciciosEsInvalida() {
        RutinaRequest vacia = new RutinaRequest("t1", "Vacía", null, NivelRutina.PRINCIPIANTE, List.of());
        assertThatThrownBy(() -> servicio.crear(vacia)).isInstanceOf(ReglaDeNegocioException.class);
    }

    @Test
    void unEjercicioInexistenteEnLaRutinaEs404() {
        when(ejercicios.obtener("nope")).thenThrow(RecursoNoEncontradoException.de("un ejercicio", "nope"));
        RutinaRequest req = new RutinaRequest("t1", "X", null, NivelRutina.PRINCIPIANTE,
                List.of(new EjercicioPrescritoRequest("nope", DiaSemana.LUNES, 3, 10, 60)));

        assertThatThrownBy(() -> servicio.crear(req)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void asignarUnaNuevaRutinaFinalizaLaActivaAnterior() {
        AsignacionRutina anterior = new AsignacionRutina("m1", "t1", "r0", LocalDate.of(2026, 11, 2));
        when(asignaciones.findFirstByMiembroIdAndEstado("m1", EstadoAsignacion.ACTIVA)).thenReturn(Optional.of(anterior));
        Rutina nueva = new Rutina("Hipertrofia", null, NivelRutina.AVANZADO, "t1", List.of());
        when(rutinas.findById("r1")).thenReturn(Optional.of(nueva));

        AsignacionResponse respuesta = servicio.asignar("m1", new AsignacionRequest("r1", "t1"));

        assertThat(anterior.getEstado()).isEqualTo(EstadoAsignacion.FINALIZADA);
        assertThat(anterior.getFechaFin()).isEqualTo(HOY);
        assertThat(respuesta.estado()).isEqualTo(EstadoAsignacion.ACTIVA);
        assertThat(respuesta.fechaInicio()).isEqualTo(HOY);
        verify(asignaciones, times(2)).save(any(AsignacionRutina.class)); // la anterior y la nueva
    }

    @Test
    void sinRutinaActivaPreviaSoloSeCreaLaNueva() {
        when(asignaciones.findFirstByMiembroIdAndEstado("m1", EstadoAsignacion.ACTIVA)).thenReturn(Optional.empty());
        when(rutinas.findById("r1")).thenReturn(Optional.of(new Rutina("X", null, NivelRutina.AVANZADO, "t1", List.of())));

        servicio.asignar("m1", new AsignacionRequest("r1", "t1"));

        verify(asignaciones, times(1)).save(any(AsignacionRutina.class));
    }

    @Test
    void soloUnEntrenadorPuedeAsignar() {
        when(usuarios.requerirEntrenador("m2", "asignar rutinas"))
                .thenThrow(new OperacionNoPermitidaException("Solo un entrenador puede asignar rutinas"));

        assertThatThrownBy(() -> servicio.asignar("m1", new AsignacionRequest("r1", "m2")))
                .isInstanceOf(OperacionNoPermitidaException.class);
    }

    @Test
    void asignarUnaRutinaInexistenteEs404() {
        when(rutinas.findById("nope")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.asignar("m1", new AsignacionRequest("nope", "t1")))
                .isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void sinRutinaActivaElMensajeEsClaro() {
        when(asignaciones.findFirstByMiembroIdAndEstado("m1", EstadoAsignacion.ACTIVA)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> servicio.rutinaActiva("m1"))
                .isInstanceOf(RecursoNoEncontradoException.class)
                .hasMessageContaining("Aún no te han asignado una rutina");
    }
}
