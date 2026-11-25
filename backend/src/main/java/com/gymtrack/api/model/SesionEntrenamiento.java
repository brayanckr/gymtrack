package com.gymtrack.api.model;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Un entrenamiento realizado en una fecha (HU-13).
 *
 * <p>Relaciones: Miembro 1 —realiza→ 0..* Sesión ({@code miembroId}); Sesión 0..* —sigue a→ 0..1 Rutina
 * ({@code rutinaId}, {@code null} en una sesión libre, RN-14); Sesión 1 ◆— 1..* {@link RegistroSerie}
 * (composición: series <b>embebidas</b>).
 */
@Document(collection = "sesiones")
public class SesionEntrenamiento {

    @Id
    private String id;

    @Indexed
    private String miembroId;

    /** {@code null} si la sesión fue libre. */
    private String rutinaId;

    private LocalDate fecha;
    private int duracionMinutos;
    private String notas;
    private List<RegistroSerie> series = new ArrayList<>();

    protected SesionEntrenamiento() {
    }

    public SesionEntrenamiento(String miembroId, String rutinaId, LocalDate fecha, int duracionMinutos,
            String notas, List<RegistroSerie> series) {
        this.miembroId = miembroId;
        this.rutinaId = rutinaId;
        this.fecha = fecha;
        this.duracionMinutos = duracionMinutos;
        this.notas = notas;
        this.series = new ArrayList<>(series);
    }

    public String getId() {
        return id;
    }

    public String getMiembroId() {
        return miembroId;
    }

    public String getRutinaId() {
        return rutinaId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public int getDuracionMinutos() {
        return duracionMinutos;
    }

    public String getNotas() {
        return notas;
    }

    public List<RegistroSerie> getSeries() {
        return List.copyOf(series);
    }
}
