package com.gymtrack.api.model;

import java.time.LocalDate;

/** Usuario que entrena: define objetivos, sigue una rutina y registra sesiones y mediciones. */
public class Miembro extends Usuario {

    private LocalDate fechaNacimiento;

    /** Altura en centímetros (RN-17: entre 100 y 250). */
    private int alturaCm;

    protected Miembro() {
    }

    public Miembro(String identificacion, String nombre, String correo, LocalDate fechaNacimiento, int alturaCm) {
        super(identificacion, nombre, correo);
        this.fechaNacimiento = fechaNacimiento;
        this.alturaCm = alturaCm;
    }

    public LocalDate getFechaNacimiento() {
        return fechaNacimiento;
    }

    public int getAlturaCm() {
        return alturaCm;
    }

    public void setAlturaCm(int alturaCm) {
        this.alturaCm = alturaCm;
    }
}
