package com.gymtrack.api.service.progreso;

import org.springframework.stereotype.Component;

import com.gymtrack.api.model.MedicionCorporal;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.repository.MedicionRepository;

/** Objetivo de peso corporal: el valor actual es el <b>último peso medido</b> del miembro. */
@Component
public class PesoCorporalStrategy implements EstrategiaProgreso {

    private final MedicionRepository mediciones;

    public PesoCorporalStrategy(MedicionRepository mediciones) {
        this.mediciones = mediciones;
    }

    @Override
    public TipoObjetivo soporta() {
        return TipoObjetivo.PESO_CORPORAL;
    }

    @Override
    public double valorActual(Objetivo objetivo) {
        return mediciones.findFirstByMiembroIdOrderByFechaDesc(objetivo.getMiembroId())
                .map(MedicionCorporal::getPesoKg)
                .orElse(objetivo.getValorInicial());
    }
}
