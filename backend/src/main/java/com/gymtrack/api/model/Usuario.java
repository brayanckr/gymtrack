package com.gymtrack.api.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Persona que usa GymTrack. Es la <b>generalización</b> de {@link Miembro} y {@link Entrenador}
 * ("Miembro es un Usuario": ambos se identifican igual y pueden usarse donde se espera un Usuario).
 *
 * <p>Es abstracta: en el negocio nunca existe un "usuario a secas" (RN-02). Los dos tipos comparten la
 * colección {@code usuarios}; Spring Data guarda el tipo concreto en el campo {@code _class}, que hace de
 * discriminador (el patrón de la jerarquía en una sola colección que muestra el material).
 *
 * <p>Los índices únicos refuerzan RN-01 a nivel de base de datos aunque dos peticiones lleguen a la vez;
 * el servicio ya comprueba antes para dar un mensaje claro.
 */
@Document(collection = "usuarios")
public abstract class Usuario {

    @Id
    private String id;

    /** Documento de identidad: identifica la cuenta y no se puede editar (HU-03). */
    @Indexed(unique = true)
    private String identificacion;

    @Indexed(unique = true)
    private String correo;

    private String nombre;

    /** Constructor para Spring Data (reconstruye el objeto desde el documento). */
    protected Usuario() {
    }

    protected Usuario(String identificacion, String nombre, String correo) {
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.correo = correo;
    }

    public String getId() {
        return id;
    }

    public String getIdentificacion() {
        return identificacion;
    }

    public String getCorreo() {
        return correo;
    }

    public void setCorreo(String correo) {
        this.correo = correo;
    }

    public String getNombre() {
        return nombre;
    }

    public void setNombre(String nombre) {
        this.nombre = nombre;
    }
}
