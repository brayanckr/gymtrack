package com.gymtrack.api.model;

/** Usuario que mantiene el catálogo de ejercicios, diseña rutinas y las asigna a miembros. */
public class Entrenador extends Usuario {

    private String especialidad;

    protected Entrenador() {
    }

    public Entrenador(String identificacion, String nombre, String correo, String especialidad) {
        super(identificacion, nombre, correo);
        this.especialidad = especialidad;
    }

    public String getEspecialidad() {
        return especialidad;
    }
}
