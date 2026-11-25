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

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import com.gymtrack.api.dto.MedicionDtos.MedicionRequest;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.MedicionCorporal;
import com.gymtrack.api.repository.MedicionRepository;

/** RN-15 (rangos y fecha) y RN-16 (una medición por miembro y día). Hoy es 23/11/2026. */
class MedicionServiceTest {

    private static final LocalDate HOY = LocalDate.of(2026, 11, 23);

    private MedicionRepository repo;
    private MedicionService servicio;

    @BeforeEach
    void preparar() {
        repo = mock(MedicionRepository.class);
        Clock reloj = Clock.fixed(HOY.atStartOfDay().toInstant(ZoneOffset.UTC), ZoneOffset.UTC);
        servicio = new MedicionService(repo, mock(UsuarioService.class), reloj);
        when(repo.save(any(MedicionCorporal.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void registraUnaMedicionValidaConCamposOpcionales() {
        MedicionCorporal m = servicio.registrar("m1", new MedicionRequest(HOY, 78.4, 19.0, 82.0));

        assertThat(m.getPesoKg()).isEqualTo(78.4);
        assertThat(m.getPorcentajeGrasa()).isEqualTo(19.0);
    }

    @Test
    void laGrasaYLaCinturaSonOpcionales() {
        MedicionCorporal m = servicio.registrar("m1", new MedicionRequest(HOY, 78.4, null, null));

        assertThat(m.getPorcentajeGrasa()).isNull();
        assertThat(m.getCinturaCm()).isNull();
    }

    @Test
    void dosMedicionesElMismoDiaSonUnConflicto() {
        when(repo.existsByMiembroIdAndFecha("m1", HOY)).thenReturn(true);

        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY, 78.4, null, null)))
                .isInstanceOf(ConflictoException.class);
        verify(repo, never()).save(any());
    }

    @Test
    void rechazaFechaFutura() {
        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY.plusDays(1), 78.4, null, null)))
                .isInstanceOf(ReglaDeNegocioException.class).hasMessageContaining("futura");
    }

    @Test
    void rechazaValoresFueraDeRango() {
        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY, 19.9, null, null)))
                .isInstanceOf(ReglaDeNegocioException.class);
        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY, 400.1, null, null)))
                .isInstanceOf(ReglaDeNegocioException.class);
        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY, 78.4, 71.0, null)))
                .isInstanceOf(ReglaDeNegocioException.class);
        assertThatThrownBy(() -> servicio.registrar("m1", new MedicionRequest(HOY, 78.4, null, 0.0)))
                .isInstanceOf(ReglaDeNegocioException.class);
    }
}
