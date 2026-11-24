package com.gymtrack.api.controller;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDate;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoResponse;
import com.gymtrack.api.dto.ObjetivoDtos.ProgresoResponse;
import com.gymtrack.api.exception.ConflictoException;
import com.gymtrack.api.exception.RecursoNoEncontradoException;
import com.gymtrack.api.exception.ReglaDeNegocioException;
import com.gymtrack.api.model.EstadoObjetivo;
import com.gymtrack.api.model.Objetivo;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.service.ObjetivoService;
import com.gymtrack.api.service.ProgresoService;

/**
 * Prueba la capa web aislada (sin MongoDB): que cada excepción de negocio llegue al cliente con el código
 * HTTP del contrato (201, 400, 404, 409) y el cuerpo de error uniforme.
 */
@WebMvcTest(ObjetivoController.class)
class ObjetivoControllerTest {

    private static final String BODY_VALIDO = """
            {"tipo":"PESO_CORPORAL","descripcion":"Bajar a 75 kg","valorInicial":82,"valorMeta":75,"fechaLimite":"2027-01-31"}
            """;

    @Autowired
    private MockMvc mvc;

    @MockitoBean
    private ObjetivoService objetivoService;

    @MockitoBean
    private ProgresoService progresoService;

    @Test
    void crearDevuelve201ConLocationYElProgresoEnCero() throws Exception {
        Objetivo creado = new Objetivo("m1", null, TipoObjetivo.PESO_CORPORAL, "Bajar a 75 kg", 82, 75,
                LocalDate.of(2026, 11, 23), LocalDate.of(2027, 1, 31));
        ObjetivoResponse respuesta = ObjetivoResponse.de(creado, new ProgresoResponse(82, 0));
        when(objetivoService.crear(eq("m1"), any())).thenReturn(creado);
        when(progresoService.responder(creado)).thenReturn(respuesta);

        mvc.perform(post("/api/miembros/m1/objetivos").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isCreated())
                .andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.tipo").value("PESO_CORPORAL"))
                .andExpect(jsonPath("$.estado").value("ACTIVO"))
                .andExpect(jsonPath("$.progreso.porcentaje").value(0.0));
    }

    @Test
    void faltarCamposObligatoriosDevuelve400ConLaListaDeCampos() throws Exception {
        mvc.perform(post("/api/miembros/m1/objetivos").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"descripcion\":\"sin tipo\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400))
                .andExpect(jsonPath("$.errores[?(@.campo=='tipo')]").exists());
    }

    @Test
    void unaReglaDeNegocioViolada_devuelve400ConSuMensaje() throws Exception {
        when(objetivoService.crear(eq("m1"), any()))
                .thenThrow(new ReglaDeNegocioException("La meta no puede ser igual al valor inicial"));

        mvc.perform(post("/api/miembros/m1/objetivos").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("La meta no puede ser igual al valor inicial"));
    }

    @Test
    void miembroInexistenteDevuelve404() throws Exception {
        when(objetivoService.crear(eq("nadie"), any()))
                .thenThrow(RecursoNoEncontradoException.de("un miembro", "nadie"));

        mvc.perform(post("/api/miembros/nadie/objetivos").contentType(MediaType.APPLICATION_JSON).content(BODY_VALIDO))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error").value("Not Found"));
    }

    @Test
    void cerrarUnObjetivoYaCerradoDevuelve409() throws Exception {
        when(objetivoService.cambiarEstado("o1", EstadoObjetivo.CUMPLIDO))
                .thenThrow(new ConflictoException("El objetivo ya está CANCELADO y no puede cambiar de estado"));

        mvc.perform(patch("/api/objetivos/o1/estado").contentType(MediaType.APPLICATION_JSON)
                        .content("{\"estado\":\"CUMPLIDO\"}"))
                .andExpect(status().isConflict());
    }

    @Test
    void unEstadoDesconocidoEnElFiltroDevuelve400() throws Exception {
        mvc.perform(get("/api/miembros/m1/objetivos").param("estado", "XYZ"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("Valor inválido para el parámetro 'estado'"));
    }

    @Test
    void unJsonMalFormadoDevuelve400() throws Exception {
        mvc.perform(post("/api/miembros/m1/objetivos").contentType(MediaType.APPLICATION_JSON).content("{no es json"))
                .andExpect(status().isBadRequest());
    }
}
