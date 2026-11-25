package com.gymtrack.api.config;

import java.time.Clock;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Expone el reloj como un bean. Los servicios piden "hoy" a este {@link Clock} en lugar de llamar a
 * {@code LocalDate.now()}, así las reglas que dependen de la fecha (fecha límite futura, sesión no futura,
 * semana en curso) se pueden probar con un reloj fijo.
 */
@Configuration
public class ClockConfig {

    @Bean
    public Clock reloj() {
        return Clock.systemDefaultZone();
    }
}
