package com.gymtrack.api.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.mock;

import java.time.LocalDate;
import java.util.List;

import org.junit.jupiter.api.Test;

import com.gymtrack.api.dto.ObjetivoDtos.ProgresoResponse;
import com.gymtrack.api.dto.PanelDtos.PanelResponse;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.service.progreso.EstrategiaProgreso;

/** RN-07: el progreso se calcula con una sola fórmula, acotada a 0–100 %, y elige la estrategia por tipo. */
class ProgresoServiceTest {

    @Test
    void bajarDePesoEsProporcionalAlRecorrido() {
        // de 82 a 75 kg, hoy 78,4 kg: (78,4 − 82) / (75 − 82) = 51,4 %
        assertThat(ProgresoService.porcentaje(82, 75, 78.4)).isEqualTo(51.4);
    }

    @Test
    void subirUnObjetivoDeFuerzaUsaLaMismaFormula() {
        // de 60 a 80 kg, mejor marca 70 kg: 50 %
        assertThat(ProgresoService.porcentaje(60, 80, 70)).isEqualTo(50.0);
    }

    @Test
    void superarLaMetaNoPasaDe100() {
        assertThat(ProgresoService.porcentaje(60, 80, 95)).isEqualTo(100.0);
    }

    @Test
    void sinAvanceOConRetrocesoEsCero() {
        assertThat(ProgresoService.porcentaje(82, 75, 82)).isZero();
        assertThat(ProgresoService.porcentaje(82, 75, 85)).isZero(); // subió de peso: no hay progreso negativo
    }

    @Test
    void metaIgualAlInicialNoDivideEntreCero() {
        assertThat(ProgresoService.porcentaje(70, 70, 70)).isZero();
    }

    @Test
    void progresoDeUsaLaEstrategiaDelTipoDelObjetivo() {
        EstrategiaProgreso peso = estrategiaFija(TipoObjetivo.PESO_CORPORAL, 78.4);
        EstrategiaProgreso fuerza = estrategiaFija(TipoObjetivo.FUERZA_EJERCICIO, 999);
        ProgresoService servicio = servicio(List.of(peso, fuerza));

        Objetivo objetivo = new Objetivo("m1", null, TipoObjetivo.PESO_CORPORAL, "Bajar a 75 kg", 82, 75,
                LocalDate.of(2026, 11, 1), LocalDate.of(2027, 1, 31));
        ProgresoResponse progreso = servicio.progresoDe(objetivo);

        assertThat(progreso.valorActual()).isEqualTo(78.4);
        assertThat(progreso.porcentaje()).isEqualTo(51.4);
    }

    @Test
    void panelDeMiembroNuevoLlegaConLosBloquesVacios() {
        PanelResponse panel = servicio(List.of()).panel("m1");

        assertThat(panel.ultimoPesoKg()).isNull();
        assertThat(panel.variacionPesoKg()).isNull();
        assertThat(panel.sesionesDelMes()).isZero();
        assertThat(panel.ultimaSesion()).isNull();
        assertThat(panel.objetivosActivos()).isEmpty();
        assertThat(panel.rutinaActiva()).isNull();
    }

    private static ProgresoService servicio(List<EstrategiaProgreso> estrategias) {
        return new ProgresoService(mock(ObjetivoService.class), mock(SesionService.class),
                mock(MedicionService.class), mock(RutinaService.class), mock(UsuarioService.class), estrategias);
    }

    /** Estrategia de prueba que siempre devuelve el mismo valor actual. */
    private static EstrategiaProgreso estrategiaFija(TipoObjetivo tipo, double valor) {
        return new EstrategiaProgreso() {
            @Override
            public TipoObjetivo soporta() {
                return tipo;
            }

            @Override
            public double valorActual(Objetivo objetivo) {
                return valor;
            }
        };
    }
}
