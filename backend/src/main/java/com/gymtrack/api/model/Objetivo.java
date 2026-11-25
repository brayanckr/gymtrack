package com.gymtrack.api.model;

import java.time.LocalDate;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Meta medible de un miembro (HU-04). Relaciones del modelo de dominio:
 * <ul>
 *   <li>Miembro 1 —define→ 0..* Objetivo: se guarda como referencia {@code miembroId}.</li>
 *   <li>Objetivo 0..* —se mide en→ 0..1 Ejercicio: {@code ejercicioId}, solo en objetivos de fuerza (RN-05).</li>
 * </ul>
 *
 * <p>El <b>progreso no se guarda</b>: se calcula cada vez que se consulta (RN-07), de modo que nunca queda
 * desactualizado respecto de las sesiones y mediciones registradas.
 */
@Document(collection = "objetivos")
public class Objetivo {

    @Id
    private String id;

    @Indexed
    private String miembroId;

    /** Solo para {@link TipoObjetivo#FUERZA_EJERCICIO}; {@code null} en los demás tipos. */
    private String ejercicioId;

    private TipoObjetivo tipo;
    private String descripcion;
    private double valorInicial;
    private double valorMeta;
    private LocalDate fechaInicio;
    private LocalDate fechaLimite;
    private EstadoObjetivo estado;

    protected Objetivo() {
    }

    /** Crea un objetivo activo que empieza en {@code fechaInicio} (RN-06: nace {@code ACTIVO}). */
    public Objetivo(String miembroId, String ejercicioId, TipoObjetivo tipo, String descripcion,
            double valorInicial, double valorMeta, LocalDate fechaInicio, LocalDate fechaLimite) {
        this.miembroId = miembroId;
        this.ejercicioId = ejercicioId;
        this.tipo = tipo;
        this.descripcion = descripcion;
        this.valorInicial = valorInicial;
        this.valorMeta = valorMeta;
        this.fechaInicio = fechaInicio;
        this.fechaLimite = fechaLimite;
        this.estado = EstadoObjetivo.ACTIVO;
    }

    public boolean estaActivo() {
        return estado == EstadoObjetivo.ACTIVO;
    }

    public String getId() {
        return id;
    }

    public String getMiembroId() {
        return miembroId;
    }

    public String getEjercicioId() {
        return ejercicioId;
    }

    public TipoObjetivo getTipo() {
        return tipo;
    }

    public String getDescripcion() {
        return descripcion;
    }

    public double getValorInicial() {
        return valorInicial;
    }

    public double getValorMeta() {
        return valorMeta;
    }

    public LocalDate getFechaInicio() {
        return fechaInicio;
    }

    public LocalDate getFechaLimite() {
        return fechaLimite;
    }

    public EstadoObjetivo getEstado() {
        return estado;
    }

    public void setEstado(EstadoObjetivo estado) {
        this.estado = estado;
    }
}
