package com.gymtrack.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.ObjetivoRepository;

/** Reglas RN-04, RN-05 y RN-06 sobre la creación y el cierre de objetivos. Hoy es 23/11/2026. */
class ObjetivoServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 23);

    private ObjetivoRepository repo;
    private EjercicioService ejercicios;
    private ObjetivoService servicio;

    @BeforeEach
    void preparar() {
        repo = mock(ObjetivoRepository.class);
        ejercicios = mock(EjercicioService.class);
        Clock reloj = Clock.fixed(HOY.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        servicio = new ObjetivoService(repo, mock(UsuarioService.class), ejercicios, reloj);
        when(repo.save(any(Objetivo.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void creaUnObjetivoDePesoActivoQueEmpiezaHoy() {
        Objetivo creado = servicio.crear("m1", peso(82, 75, HOY.plusDays(70)));

        assertThat(creado.getEstado()).isEqualTo(EstadoObjetivo.ACTIVO);
        assertThat(creado.getFechaInicio()).isEqualTo(HOY);
        assertThat(creado.getEjercicioId()).isNull();
    }

    @Test
    void rechazaMetaIgualAlValorInicial() {
        assertThatThrownBy(() -> servicio.crear("m1", peso(80, 80, HOY.plusDays(10))))
                .isInstanceOf(ReglaDeNegocioException.class).hasMessageContaining("igual");
    }

    @Test
    void rechazaFechaLimiteQueNoEsPosteriorAHoy() {
        assertThatThrownBy(() -> servicio.crear("m1", peso(82, 75, HOY)))
                .isInstanceOf(ReglaDeNegocioException.class).hasMessageContaining("posterior");
    }

    @Test
    void laFrecuenciaPuedeIniciarEnCeroPeroElPesoNo() {
        ObjetivoRequest frecuencia = new ObjetivoRequest(TipoObjetivo.FRECUENCIA_SEMANAL, "4 por semana", 0.0, 4.0,
                HOY.plusDays(30), null);
        assertThat(servicio.crear("m1", frecuencia).getValorInicial()).isZero();

        ObjetivoRequest pesoEnCero = peso(0, 75, HOY.plusDays(30));
        assertThatThrownBy(() -> servicio.crear("m1", pesoEnCero)).isInstanceOf(ReglaDeNegocioException.class);
    }

    @Test
    void unObjetivoDeFuerzaExigeEjercicio() {
        ObjetivoRequest sinEjercicio = new ObjetivoRequest(TipoObjetivo.FUERZA_EJERCICIO, "Press 80", 60.0, 80.0,
                HOY.plusDays(30), null);
        assertThatThrownBy(() -> servicio.crear("m1", sinEjercicio))
                .isInstanceOf(ReglaDeNegocioException.class).hasMessageContaining("ejercicio");
    }

    @Test
    void unObjetivoDeFuerzaConEjercicioInexistenteEs404() {
        when(ejercicios.obtener("nope")).thenThrow(RecursoNoEncontradoException.de("un ejercicio", "nope"));
        ObjetivoRequest req = new ObjetivoRequest(TipoObjetivo.FUERZA_EJERCICIO, "Press 80", 60.0, 80.0,
                HOY.plusDays(30), "nope");

        assertThatThrownBy(() -> servicio.crear("m1", req)).isInstanceOf(RecursoNoEncontradoException.class);
    }

    @Test
    void losObjetivosQueNoSonDeFuerzaNoAdmitenEjercicio() {
        ObjetivoRequest req = new ObjetivoRequest(TipoObjetivo.PESO_CORPORAL, "Bajar", 82.0, 75.0,
                HOY.plusDays(30), "press");
        assertThatThrownBy(() -> servicio.crear("m1", req)).isInstanceOf(ReglaDeNegocioException.class);
    }

    @Test
    void cierraUnObjetivoActivoComoCumplido() {
        Objetivo activo = objetivoActivo();
        when(repo.findById("o1")).thenReturn(Optional.of(activo));

        assertThat(servicio.cambiarEstado("o1", EstadoObjetivo.CUMPLIDO).getEstado()).isEqualTo(EstadoObjetivo.CUMPLIDO);
    }

    @Test
    void unObjetivoCerradoNoCambiaDeEstado() {
        Objetivo cerrado = objetivoActivo();
        cerrado.setEstado(EstadoObjetivo.CANCELADO);
        when(repo.findById("o1")).thenReturn(Optional.of(cerrado));

        assertThatThrownBy(() -> servicio.cambiarEstado("o1", EstadoObjetivo.CUMPLIDO))
                .isInstanceOf(ConflictoException.class);
    }

    @Test
    void noSePuedeReabrirUnObjetivo() {
        assertThatThrownBy(() -> servicio.cambiarEstado("o1", EstadoObjetivo.ACTIVO))
                .isInstanceOf(ReglaDeNegocioException.class);
    }

    private static ObjetivoRequest peso(double inicial, double meta, LocalDate limite) {
        return new ObjetivoRequest(TipoObjetivo.PESO_CORPORAL, "Bajar a " + meta + " kg", inicial, meta, limite, null);
    }

    private static Objetivo objetivoActivo() {
        return new Objetivo("m1", null, TipoObjetivo.PESO_CORPORAL, "Bajar", 82, 75, HOY, HOY.plusDays(70));
    }
}
