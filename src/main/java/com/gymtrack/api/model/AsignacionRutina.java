package com.gymtrack.api.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Hecho de que una rutina se asigna a un miembro durante un periodo (HU-11).
 *
 * <p>Es un concepto propio (no un atributo) porque tiene fechas y estado: juega el mismo papel que
 * {@code Prestamo} entre {@code Estudiante} y {@code Ejemplar} en el caso de la materia. Conecta a tres
 * conceptos independientes por referencia: miembro, entrenador que asigna y rutina.
 */
@Document(collection = "asignaciones")
public class AsignacionRutina {

    @Id
    private String id;

    @Indexed
    private String miembroId;

    private String entrenadorId;
    private String rutinaId;
    private LocalDate fechaInicio;

    /** {@code null} mientras la asignación está activa. */
    private LocalDate fechaFin;

    private EstadoAsignacion estado;

    protected AsignacionRutina() {
    }

    public AsignacionRutina(String miembroId, String entrenadorId, String rutinaId, LocalDate fechaInicio) {
        this.miembroId = miembroId;
        this.entrenadorId = entrenadorId;
        this.rutinaId = rutinaId;
        this.fechaInicio = fechaInicio;
        this.estado = EstadoAsignacion.ACTIVA;
    }

    /** Cierra la asignación en {@code hoy} (RN-11: al asignar otra rutina, la anterior se finaliza). */
    public void finalizar(LocalDate hoy) {
        this.estado = EstadoAsignacion.FINALIZADA;
        this.fechaFin = hoy;
    }

    public String getId() {
        return id;
    }

    public String getMiembroId() {
        return miembroId;
    }

    public String getEntrenadorId() {
        return entrenadorId;
    }

    public String getRutinaId() {
        return rutinaId;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaFin() {
        return fechaFin;
    }

    public EstadoAsignacion getEstado() {
        return estado;
    }
}
