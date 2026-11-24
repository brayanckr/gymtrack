package com.gymtrack.api.service.progreso;

import java.time.Clock;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;

import org.springframework.stereotype.Component;

import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.SesionRepository;

/**
 * Objetivo de frecuencia semanal: el valor actual es el <b>número de sesiones de la semana en curso</b>
 * (de lunes a domingo, incluidos). Con la meta en "sesiones por semana", llegar a la meta es 100 %.
 */
@Component
public class FrecuenciaSemanalStrategy implements EstrategiaProgreso {

    private final SesionRepository sesiones;
    private final Clock reloj;

    public FrecuenciaSemanalStrategy(SesionRepository sesiones, Clock reloj) {
        this.sesiones = sesiones;
        this.reloj = reloj;
    }

    @Override
    public TipoObjetivo soporta() {
        return TipoObjetivo.FRECUENCIA_SEMANAL;
    }

    @Override
    public double valorActual(Objetivo objetivo) {
        LocalDate hoy = LocalDate.now(reloj);
        LocalDate lunes = hoy.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        LocalDate domingo = lunes.plusDays(6);
        return sesiones.findByMiembroIdAndFechaBetween(objetivo.getMiembroId(), lunes, domingo).size();
    }
}
