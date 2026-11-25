package com.gymtrack.api.service.progreso;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import java.time.Clock;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.Test;

import com.gymtrack.api.model.MedicionCorporal;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.RegistroSerie;
import com.gymtrack.api.model.SesionEntrenamiento;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.MedicionRepository;
import com.gymtrack.api.repository.SesionRepository;

/** Cada estrategia entrega el "valor actual" desde su propia fuente de datos (RN-07). */
class EstrategiasProgresoTest {

    private static final LocalDate INICIO = LocalDate.of(2026, 11, 1);
    private static final LocalDate LIMITE = LocalDate.of(2027, 1, 31);

    @Test
    void pesoCorporalUsaElUltimoPesoMedido() {
        MedicionRepository mediciones = mock(MedicionRepository.class);
        when(mediciones.findFirstByMiembroIdOrderByFechaDesc("m1"))
                .thenReturn(Optional.of(new MedicionCorporal("m1", LocalDate.of(2026, 11, 20), 78.4, null, null)));
        Objetivo objetivo = new Objetivo("m1", null, TipoObjetivo.PESO_CORPORAL, "Bajar", 82, 75, INICIO, LIMITE);

        assertThat(new PesoCorporalStrategy(mediciones).valorActual(objetivo)).isEqualTo(78.4);
    }

    @Test
    void pesoCorporalSinMedicionesDevuelveElValorInicial() {
        MedicionRepository mediciones = mock(MedicionRepository.class);
        when(mediciones.findFirstByMiembroIdOrderByFechaDesc("m1")).thenReturn(Optional.empty());
        Objetivo objetivo = new Objetivo("m1", null, TipoObjetivo.PESO_CORPORAL, "Bajar", 82, 75, INICIO, LIMITE);

        assertThat(new PesoCorporalStrategy(mediciones).valorActual(objetivo)).isEqualTo(82);
    }

    @Test
    void frecuenciaSemanalCuentaLasSesionesDeLaSemanaDeLunesADomingo() {
        // Miércoles 25/11/2026: la semana va del lunes 23 al domingo 29.
        Clock reloj = Clock.fixed(LocalDate.of(2026, 11, 25).atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        SesionRepository sesiones = mock(SesionRepository.class);
        when(sesiones.findByMiembroIdAndFechaBetween("m1", LocalDate.of(2026, 11, 23), LocalDate.of(2026, 11, 29)))
                .thenReturn(List.of(sesion(LocalDate.of(2026, 11, 23)), sesion(LocalDate.of(2026, 11, 24))));
        Objetivo objetivo = new Objetivo("m1", null, TipoObjetivo.FRECUENCIA_SEMANAL, "4 por semana", 0, 4, INICIO, LIMITE);

        assertThat(new FrecuenciaSemanalStrategy(sesiones, reloj).valorActual(objetivo)).isEqualTo(2);
    }

    @Test
    void fuerzaUsaElMayorPesoDelEjercicioDelObjetivoIgnorandoOtros() {
        SesionRepository sesiones = mock(SesionRepository.class);
        when(sesiones.findByMiembroIdAndFechaGreaterThanEqual("m1", INICIO)).thenReturn(List.of(
                sesion(LocalDate.of(2026, 11, 10), new RegistroSerie(1, "press", 5, 70), new RegistroSerie(2, "sentadilla", 5, 120)),
                sesion(LocalDate.of(2026, 11, 17), new RegistroSerie(1, "press", 5, 75))));
        Objetivo objetivo = new Objetivo("m1", "press", TipoObjetivo.FUERZA_EJERCICIO, "Press 80", 60, 80, INICIO, LIMITE);

        assertThat(new FuerzaEjercicioStrategy(sesiones).valorActual(objetivo)).isEqualTo(75);
    }

    @Test
    void fuerzaSinSeriesDelEjercicioDevuelveElValorInicial() {
        SesionRepository sesiones = mock(SesionRepository.class);
        when(sesiones.findByMiembroIdAndFechaGreaterThanEqual("m1", INICIO)).thenReturn(List.of());
        Objetivo objetivo = new Objetivo("m1", "press", TipoObjetivo.FUERZA_EJERCICIO, "Press 80", 60, 80, INICIO, LIMITE);

        assertThat(new FuerzaEjercicioStrategy(sesiones).valorActual(objetivo)).isEqualTo(60);
    }

    private static SesionEntrenamiento sesion(LocalDate fecha, RegistroSerie... series) {
        return new SesionEntrenamiento("m1", null, fecha, 60, null, List.of(series));
    }
}
