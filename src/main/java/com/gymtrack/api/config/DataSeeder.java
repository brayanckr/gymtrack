package com.gymtrack.api.config;

import java.time.Clock;
import java.time.LocalDate;
import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import com.gymtrack.api.dto.EjercicioDtos.EjercicioRequest;
import com.gymtrack.api.dto.MedicionDtos.MedicionRequest;
import com.gymtrack.api.dto.ObjetivoDtos.ObjetivoRequest;
import com.gymtrack.api.dto.RutinaDtos.AsignacionRequest;
import com.gymtrack.api.dto.RutinaDtos.EjercicioPrescritoRequest;
import com.gymtrack.api.dto.RutinaDtos.RutinaRequest;
import com.gymtrack.api.dto.SesionDtos.SerieRequest;
import com.gymtrack.api.dto.SesionDtos.SesionRequest;
import com.gymtrack.api.dto.UsuarioDtos.EntrenadorRequest;
import com.gymtrack.api.dto.UsuarioDtos.MiembroRequest;
import com.gymtrack.api.model.DiaSemana;
import com.gymtrack.api.model.Ejercicio;
import com.gymtrack.api.model.Entrenador;
import com.gymtrack.api.model.GrupoMuscular;
import com.gymtrack.api.model.Miembro;
import com.gymtrack.api.model.NivelRutina;
import com.gymtrack.api.model.Rutina;
import com.gymtrack.api.model.TipoObjetivo;
import com.gymtrack.api.service.EjercicioService;
import com.gymtrack.api.service.MedicionService;
import com.gymtrack.api.service.ObjetivoService;
import com.gymtrack.api.service.RutinaService;
import com.gymtrack.api.service.SesionService;
import com.gymtrack.api.service.UsuarioService;

/**
 * Carga datos de ejemplo para la demostración, <b>solo si la base está vacía</b> y la propiedad
 * {@code gymtrack.seed.enabled} es verdadera. Pasa por los servicios (no por los repositorios) para que
 * los datos de ejemplo cumplan las mismas reglas de negocio que los reales. Las fechas son relativas a
 * "hoy" para que el panel siempre muestre actividad reciente.
 */
@Component
@ConditionalOnProperty(name = "gymtrack.seed.enabled", havingValue = "true")
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UsuarioService usuarios;
    private final EjercicioService ejercicios;
    private final RutinaService rutinas;
    private final ObjetivoService objetivos;
    private final SesionService sesiones;
    private final MedicionService mediciones;
    private final Clock reloj;

    public DataSeeder(UsuarioService usuarios, EjercicioService ejercicios, RutinaService rutinas,
            ObjetivoService objetivos, SesionService sesiones, MedicionService mediciones, Clock reloj) {
        this.usuarios = usuarios;
        this.ejercicios = ejercicios;
        this.rutinas = rutinas;
        this.objetivos = objetivos;
        this.sesiones = sesiones;
        this.mediciones = mediciones;
        this.reloj = reloj;
    }

    @Override
    public void run(String... args) {
        if (!usuarios.listarMiembros().isEmpty() || !usuarios.listarEntrenadores().isEmpty()) {
            log.info("Datos de ejemplo omitidos: la base ya tiene usuarios");
            return;
        }
        LocalDate hoy = LocalDate.now(reloj);

        Entrenador andres = usuarios.crearEntrenador(new EntrenadorRequest("900001", "Andrés Pardo",
                "andres@gymtrack.demo", "Fuerza e hipertrofia"));
        usuarios.crearEntrenador(new EntrenadorRequest("900002", "Laura Mejía", "laura@gymtrack.demo",
                "Acondicionamiento general"));
        Miembro camila = usuarios.crearMiembro(new MiembroRequest("1001234567", "Camila Rojas",
                "camila@gymtrack.demo", LocalDate.of(1999, 3, 14), 168));
        usuarios.crearMiembro(new MiembroRequest("1007654321", "Luis Gómez", "luis@gymtrack.demo",
                LocalDate.of(1995, 8, 2), 180));

        Ejercicio sentadilla = ejercicio(andres, "Sentadilla", GrupoMuscular.PIERNAS, "Flexión de cadera y rodilla con barra");
        Ejercicio press = ejercicio(andres, "Press de banca", GrupoMuscular.PECHO, "Empuje horizontal con barra");
        Ejercicio pesoMuerto = ejercicio(andres, "Peso muerto", GrupoMuscular.ESPALDA, "Levantamiento desde el suelo");
        Ejercicio militar = ejercicio(andres, "Press militar", GrupoMuscular.HOMBROS, "Empuje vertical");
        Ejercicio remo = ejercicio(andres, "Remo con barra", GrupoMuscular.ESPALDA, "Tirón horizontal con barra");
        Ejercicio curl = ejercicio(andres, "Curl con barra", GrupoMuscular.BRAZOS, "Flexión de codos con barra");
        Ejercicio plancha = ejercicio(andres, "Plancha", GrupoMuscular.CORE, "Isométrico de peso corporal");

        Rutina fuerza = rutinas.crear(new RutinaRequest(andres.getId(), "Fuerza 3 días",
                "Tres días de trabajo de fuerza con ejercicios compuestos.", NivelRutina.INTERMEDIO, List.of(
                        prescrito(sentadilla, DiaSemana.LUNES, 5, 5, 120),
                        prescrito(press, DiaSemana.LUNES, 5, 5, 120),
                        prescrito(pesoMuerto, DiaSemana.MIERCOLES, 3, 5, 150),
                        prescrito(militar, DiaSemana.VIERNES, 4, 6, 90),
                        prescrito(sentadilla, DiaSemana.VIERNES, 3, 8, 90))));
        rutinas.crear(new RutinaRequest(andres.getId(), "Hipertrofia 4 días",
                "Cuatro días con volumen alto para ganar masa muscular.", NivelRutina.AVANZADO, List.of(
                        prescrito(press, DiaSemana.LUNES, 4, 10, 75),
                        prescrito(remo, DiaSemana.MARTES, 4, 10, 75),
                        prescrito(sentadilla, DiaSemana.JUEVES, 4, 10, 90),
                        prescrito(curl, DiaSemana.VIERNES, 3, 12, 60))));
        rutinas.crear(new RutinaRequest(andres.getId(), "Full body principiante",
                "Cuerpo completo, dos días por semana.", NivelRutina.PRINCIPIANTE, List.of(
                        prescrito(sentadilla, DiaSemana.MARTES, 3, 10, 90),
                        prescrito(press, DiaSemana.MARTES, 3, 10, 90),
                        prescrito(plancha, DiaSemana.SABADO, 3, 1, 60))));
        rutinas.asignar(camila.getId(), new AsignacionRequest(fuerza.getId(), andres.getId()));

        // Evolución de peso de Camila (de 82 kg hacia su objetivo de 75 kg).
        medir(camila, hoy.minusDays(21), 82.0, 84.0);
        medir(camila, hoy.minusDays(14), 81.2, null);
        medir(camila, hoy.minusDays(7), 80.4, null);
        medir(camila, hoy.minusDays(3), 79.6, 83.0);
        medir(camila, hoy, 78.4, 82.0);

        // Objetivos: nacen hoy, así que las sesiones de hoy en adelante cuentan para el de fuerza.
        objetivos.crear(camila.getId(), new ObjetivoRequest(TipoObjetivo.PESO_CORPORAL, "Bajar a 75 kg", 82.0, 75.0,
                hoy.plusDays(70), null));
        objetivos.crear(camila.getId(), new ObjetivoRequest(TipoObjetivo.FUERZA_EJERCICIO, "Press de banca 80 kg",
                60.0, 80.0, hoy.plusDays(82), press.getId()));
        objetivos.crear(camila.getId(), new ObjetivoRequest(TipoObjetivo.FRECUENCIA_SEMANAL,
                "Entrenar 4 veces por semana", 0.0, 4.0, hoy.plusDays(60), null));

        // Sesiones recientes (la de hoy sube el peso en press de banca).
        sesion(camila, fuerza, hoy.minusDays(5), 70, "Primer día de la semana, buen ritmo.", List.of(
                serie(sentadilla, 5, 95), serie(sentadilla, 5, 95), serie(press, 5, 70), serie(press, 5, 70)));
        sesion(camila, null, hoy.minusDays(3), 55, null, List.of(serie(plancha, 1, 0), serie(curl, 10, 25)));
        sesion(camila, fuerza, hoy.minusDays(1), 65, "Subí peso en sentadilla.", List.of(
                serie(sentadilla, 5, 100), serie(sentadilla, 5, 100), serie(pesoMuerto, 5, 110)));
        sesion(camila, fuerza, hoy, 60, null, List.of(serie(press, 5, 75), serie(press, 5, 75), serie(militar, 6, 40)));

        log.info("Datos de ejemplo cargados: 2 entrenadores, 2 miembros, 7 ejercicios, 3 rutinas, objetivos, sesiones y mediciones");
    }

    private Ejercicio ejercicio(Entrenador autor, String nombre, GrupoMuscular grupo, String descripcion) {
        return ejercicios.crear(new EjercicioRequest(autor.getId(), nombre, grupo, descripcion));
    }

    private static EjercicioPrescritoRequest prescrito(Ejercicio e, DiaSemana dia, int series, int reps, int descanso) {
        return new EjercicioPrescritoRequest(e.getId(), dia, series, reps, descanso);
    }

    private static SerieRequest serie(Ejercicio e, int reps, double peso) {
        return new SerieRequest(e.getId(), reps, peso);
    }

    private void medir(Miembro m, LocalDate fecha, double peso, Double cintura) {
        mediciones.registrar(m.getId(), new MedicionRequest(fecha, peso, null, cintura));
    }

    private void sesion(Miembro m, Rutina rutina, LocalDate fecha, int minutos, String notas, List<SerieRequest> series) {
        sesiones.registrar(m.getId(), new SesionRequest(fecha, minutos, rutina == null ? null : rutina.getId(), notas, series));
    }
}
