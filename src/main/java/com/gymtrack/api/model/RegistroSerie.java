package com.gymtrack.api.model;

/**
 * Una serie realmente ejecutada en una sesión: ejercicio, repeticiones y peso.
 *
 * <p>Parte de la composición {@code SesionEntrenamiento 1 ◆— 1..* RegistroSerie} (RN-13): vive
 * <b>embebida</b> en la sesión. {@code pesoKg = 0} significa ejercicio de peso corporal.
 */
public class RegistroSerie {

    private int numeroSerie;
    private String ejercicioId;
    private int repeticiones;
    private double pesoKg;

    protected RegistroSerie() {
    }

    public RegistroSerie(int numeroSerie, String ejercicioId, int repeticiones, double pesoKg) {
        this.numeroSerie = numeroSerie;
        this.ejercicioId = ejercicioId;
        this.repeticiones = repeticiones;
        this.pesoKg = pesoKg;
    }

    public int getNumeroSerie() {
        return numeroSerie;
    }

    public String getEjercicioId() {
        return ejercicioId;
    }

    public int getRepeticiones() {
        return repeticiones;
    }

    public double getPesoKg() {
        return pesoKg;
    }
}
