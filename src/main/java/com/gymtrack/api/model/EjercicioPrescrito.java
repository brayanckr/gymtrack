package com.gymtrack.api.model;

/**
 * Un ejercicio dentro de una rutina, con sus series, repeticiones y descanso.
 *
 * <p>Es la <b>parte</b> de una <b>composición</b> con {@link Rutina} (RN-10): nace y muere con ella y
 * no tiene identidad propia. Por eso en MongoDB se guarda <b>embebido</b> en el documento de la rutina y
 * no en una colección aparte. Sí <i>referencia</i> (por {@code ejercicioId}) al {@link Ejercicio} del
 * catálogo, que existe independientemente.
 */
public class EjercicioPrescrito {

    private int orden;
    private DiaSemana dia;
    private String ejercicioId;
    private int series;
    private int repeticiones;
    private int descansoSegundos;

    protected EjercicioPrescrito() {
    }

    public EjercicioPrescrito(int orden, DiaSemana dia, String ejercicioId, int series, int repeticiones,
            int descansoSegundos) {
        this.orden = orden;
        this.dia = dia;
        this.ejercicioId = ejercicioId;
        this.series = series;
        this.repeticiones = repeticiones;
        this.descansoSegundos = descansoSegundos;
    }

    public int getOrden() {
        return orden;
    }

    public DiaSemana getDia() {
        return dia;
    }

    public String getEjercicioId() {
        return ejercicioId;
    }

    public int getSeries() {
        return series;
    }

    public int getRepeticiones() {
        return repeticiones;
    }

    public int getDescansoSegundos() {
        return descansoSegundos;
    }
}
