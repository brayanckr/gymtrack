package com.gymtrack.api;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Punto de entrada de la API de GymTrack.
 *
 * <p>Es el único artefacto desplegable del backend ({@code gymtrack-api.jar}): las tres capas lógicas
 * (Controller, Service, Repository) corren juntas dentro de esta misma JVM, tal como muestra la vista de
 * despliegue.
 */
@SpringBootApplication
public class GymTrackApplication {

    public static void main(String[] args) {
        SpringApplication.run(GymTrackApplication.class, args);
    }
}
