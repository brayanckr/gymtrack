package com.gymtrack.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Movimiento del catálogo (ej. "Press de banca"). Es la "obra" del dominio, igual que {@code Libro} en el
 * ejemplo de la materia: rutinas, series y objetivos <i>lo referencian</i> sin copiarlo.
 * El nombre es único sin distinguir mayúsculas (RN-08).
 */
@Document(collection = "ejercicios")
public class Ejercicio {

    @Id
    private String id;

    private String nombre;
    private GrupoMuscular grupoMuscular;
    private String descripcion;

    protected Ejercicio() {
    }

    public Ejercicio(String nombre, GrupoMuscular grupoMuscular, String descripcion) {
        this.nombre = nombre;
        this.grupoMuscular = grupoMuscular;
        this.descripcion = descripcion;
    }

    public String getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public GrupoMuscular getGrupoMuscular() {
        return grupoMuscular;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
