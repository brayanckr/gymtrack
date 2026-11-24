package com.gymtrack.api.service.progreso;

import org.springframework.stereotype.Component;

import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.RegistroSerie;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.SesionRepository;

/**
 * Objetivo de fuerza en un ejercicio: el valor actual es el <b>mayor peso levantado</b> en ese ejercicio
 * desde la fecha de inicio del objetivo (HU-05, criterio 4).
 */
@Component
public class FuerzaEjercicioStrategy implements EstrategiaProgreso {

    private final SesionRepository sesiones;

    public FuerzaEjercicioStrategy(SesionRepository sesiones) {
        this.sesiones = sesiones;
    }

    @Override
    public TipoObjetivo soporta() {
        return TipoObjetivo.FUERZA_EJERCICIO;
    }

    @Override
    public double valorActual(Objetivo objetivo) {
        return sesiones.findByMiembroIdAndFechaGreaterThanEqual(objetivo.getMiembroId(), objetivo.getFechaInicio())
                .stream()
                .flatMap(sesion -> sesion.getSeries().stream())
                .filter(serie -> serie.getEjercicioId().equals(objetivo.getEjercicioId()))
                .mapToDouble(RegistroSerie::getPesoKg)
                .max()
                .orElse(objetivo.getValorInicial());
    }
}
