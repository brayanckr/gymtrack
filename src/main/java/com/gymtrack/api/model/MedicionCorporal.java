package com.gymtrack.api.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Medida del cuerpo de un miembro en una fecha (HU-15). Miembro 1 —registra→ 0..* Medición.
 *
 * <p>El índice compuesto único {@code (miembroId, fecha)} refuerza RN-16 (no dos mediciones del mismo
 * miembro el mismo día) también a nivel de base de datos.
 */
@Document(collection = "mediciones")
@CompoundIndex(name = "miembro_fecha_unico", def = "{'miembroId': 1, 'fecha': 1}", unique = true)
public class MedicionCorporal {

    @Id
    private String id;

    private String miembroId;
    private LocalDate fecha;
    private double pesoKg;

    /** Opcional (RN-15): {@code null} si no se midió. */
    private Double porcentajeGrasa;

    /** Opcional (RN-15): {@code null} si no se midió. */
    private Double cinturaCm;

    protected MedicionCorporal() {
    }

    public MedicionCorporal(String miembroId, LocalDate fecha, double pesoKg, Double porcentajeGrasa,
            Double cinturaCm) {
        this.miembroId = miembroId;
        this.fecha = fecha;
        this.pesoKg = pesoKg;
        this.porcentajeGrasa = porcentajeGrasa;
        this.cinturaCm = cinturaCm;
    }

    public String getId() {
        return id;
    }

    public String getMiembroId() {
        return miembroId;
    }

    public LocalDate getFecha() {
        return fecha;
    }

    public double getPesoKg() {
        return pesoKg;
    }

    public Double getPorcentajeGrasa() {
        return porcentajeGrasa;
    }

    public Double getCinturaCm() {
        return cinturaCm;
    }
}
