package com.gymtrack.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.service.progreso.EstrategiaProgreso;

/**
 * Arranca <b>todo</b> el contexto de Spring (controladores, servicios, repositorios, configuración) sin
 * necesitar MongoDB. Sirve para detectar en las pruebas, y no al arrancar la API:
 * <ul>
 *   <li>dependencias circulares o beans que no se pueden construir;</li>
 *   <li>nombres de consulta derivada inválidos en los repositorios (Spring Data los analiza al crearlos,
 *       por ejemplo {@code findByMiembroIdAndFechaBetween});</li>
 *   <li>que cada tipo de objetivo tenga su estrategia de progreso.</li>
 * </ul>
 * El índice automático y la carga de datos se desactivan porque ambos exigen conexión a la base.
 */
@SpringBootTest(properties = {
        "spring.data.mongodb.auto-index-creation=false",
        "gymtrack.seed.enabled=false"
})
class GymTrackApplicationTests {

    @Autowired
    private List<EstrategiaProgreso> estrategias;

    @Test
    void elContextoArrancaYHayUnaEstrategiaPorCadaTipoDeObjetivo() {
        assertThat(estrategias).hasSize(TipoObjetivo.values().length);
    }
}
