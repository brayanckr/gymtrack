package com.gymtrack.api.model;

import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Plan de entrenamiento diseñado por un entrenador (HU-09).
 *
 * <p>Relaciones: Entrenador 1 —diseña→ 0..* Rutina ({@code entrenadorId}, referencia) y
 * Rutina 1 ◆— 1..* {@link EjercicioPrescrito} (composición: lista <b>embebida</b>, RN-09 exige al menos uno).
 */
@Document(collection = "rutinas")
public class Rutina {

    @Id
    private String id;

    private String nombre;
    private String descripcion;
    private NivelRutina nivel;
    private String entrenadorId;
    private List<EjercicioPrescrito> ejercicios = new ArrayList<>();

    protected Rutina() {
    }

    public Rutina(String nombre, String descripcion, NivelRutina nivel, String entrenadorId,
            List<EjercicioPrescrito> ejercicios) {
        this.nombre = nombre;
        this.descripcion = descripcion;
        this.nivel = nivel;
        this.entrenadorId = entrenadorId;
        this.ejercicios = new ArrayList<>(ejercicios);
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public NivelRutina getNivel() {
        return nivel;
    }

    public String getEntrenadorId() {
        return entrenadorId;
    }

    /** Vista de solo lectura: la rutina es la dueña de sus ejercicios prescritos. */
    public List<EjercicioPrescrito> getEjercicios() {
        return List.copyOf(ejercicios);
    }
}
