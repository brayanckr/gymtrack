package com.gymtrack.api.service;

import java.util.EnumMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoResponse;
import com.gymtrack.api.dto.ObjetivoDtos.ProgresoResponse;
import com.gymtrack.api.dto.PanelDtos.PanelResponse;
import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.MedicionCorporal;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.service.progreso.EstrategiaProgreso;

/**
 * Componente funcional «Seguimiento de Progreso» (HU-05, 17).
 *
 * <p>Calcula el avance de los objetivos (RN-07) y arma el panel del miembro. Depende de los demás
 * componentes (vista funcional): objetivos, entrenamientos, rutinas y mediciones. Para cada objetivo elige
 * la {@link EstrategiaProgreso} de su tipo, que entrega el valor actual; la <b>fórmula del porcentaje es una
 * sola</b> y vive aquí:
 * <pre>porcentaje = (actual − inicial) / (meta − inicial) × 100, acotado a [0, 100]</pre>
 * Sirve para bajar de peso (meta &lt; inicial) y para subir (meta &gt; inicial) sin casos especiales.
 */
@Service
public class ProgresoService {

    private final ObjetivoService objetivoService;
    private final SesionService sesionService;
    private final MedicionService medicionService;
    private final RutinaService rutinaService;
    private final UsuarioService usuarioService;
    private final Map<TipoObjetivo, EstrategiaProgreso> estrategias = new EnumMap<>(TipoObjetivo.class);

    /** Spring inyecta todas las estrategias disponibles; se indexan por el tipo que cada una soporta. */
    public ProgresoService(ObjetivoService objetivoService, SesionService sesionService,
            MedicionService medicionService, RutinaService rutinaService, UsuarioService usuarioService,
            List<EstrategiaProgreso> listaEstrategias) {
        this.objetivoService = objetivoService;
        this.sesionService = sesionService;
        this.medicionService = medicionService;
        this.rutinaService = rutinaService;
        this.usuarioService = usuarioService;
        listaEstrategias.forEach(e -> this.estrategias.put(e.soporta(), e));
    }

    /** Progreso actual de un objetivo (siempre calculado, nunca guardado). */
    public ProgresoResponse progresoDe(Objetivo objetivo) {
        EstrategiaProgreso estrategia = estrategias.get(objetivo.getTipo());
        double actual = estrategia.valorActual(objetivo);
        return new ProgresoResponse(actual, porcentaje(objetivo.getValorInicial(), objetivo.getValorMeta(), actual));
    }

    /**
     * Fórmula de RN-07, expuesta como función pura para poder probarla sin base de datos. Si meta e inicial
     * coinciden devuelve 0 (no hay recorrido que medir). El resultado se redondea a un decimal.
     */
    public static double porcentaje(double inicial, double meta, double actual) {
        double recorrido = meta - inicial;
        if (recorrido == 0) {
            return 0;
        }
        double bruto = (actual - inicial) / recorrido * 100;
        double acotado = Math.max(0, Math.min(100, bruto));
        return Math.round(acotado * 10) / 10.0;
    }

    /** Objetivos del miembro (opcionalmente por estado) ya con su progreso, para HU-05. */
    public List<ObjetivoResponse> objetivosConProgreso(String miembroId, EstadoObjetivo estado) {
        return objetivoService.listar(miembroId, estado).stream()
                .map(o -> ObjetivoResponse.de(o, progresoDe(o)))
                .toList();
    }

    /** Un objetivo con su progreso. */
    public ObjetivoResponse responder(Objetivo objetivo) {
        return ObjetivoResponse.de(objetivo, progresoDe(objetivo));
    }

    /** HU-17: todo lo que el miembro necesita ver de un vistazo. Los bloques sin datos van vacíos o nulos. */
    public PanelResponse panel(String miembroId) {
        usuarioService.requerirMiembro(miembroId);

        List<MedicionCorporal> ultimas = medicionService.ultimasDos(miembroId);
        Double ultimoPeso = ultimas.isEmpty() ? null : ultimas.get(0).getPesoKg();
        Double variacion = ultimas.size() < 2 ? null
                : Math.round((ultimas.get(0).getPesoKg() - ultimas.get(1).getPesoKg()) * 10) / 10.0;

        return new PanelResponse(
                ultimoPeso,
                variacion,
                sesionService.contarDelMes(miembroId),
                sesionService.ultima(miembroId),
                objetivosConProgreso(miembroId, EstadoObjetivo.ACTIVO),
                rutinaService.resumenActiva(miembroId));
    }
}
