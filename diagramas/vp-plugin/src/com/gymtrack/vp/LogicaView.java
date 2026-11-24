package com.gymtrack.vp;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramUIModel;

/**
 * Vista lógica: un único diagrama de clases con todas las clases del modelo, cada una con su nombre,
 * sus atributos con tipo de dato y sus operaciones públicas. Los miembros reflejan el código real de
 * {@code gymtrack-backend} (paquete {@code model}). Las relaciones conservan los nombres y las
 * multiplicidades justificadas en docs/03-modelo-de-dominio.md.
 */
final class LogicaView {

    private static final int W = 310;

    private LogicaView() {
    }

    static void build(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_CLASS_DIAGRAM,
                "3. Vista lógica - Diagrama de clases");

        // ---- Fila 0: la generalización
        Sh usuario = clase(s, d, "Usuario", true, 1010, 20,
                new String[] {"-id:String", "-identificacion:String", "-correo:String", "-nombre:String"},
                new String[] {"+getId():String", "+getIdentificacion():String", "+getCorreo():String",
                    "+setCorreo(correo:String):void", "+getNombre():String", "+setNombre(nombre:String):void"});

        // ---- Fila 1: los dos tipos de usuario
        Sh miembro = clase(s, d, "Miembro", false, 500, 300,
                new String[] {"-fechaNacimiento:LocalDate", "-alturaCm:int"},
                new String[] {"+getFechaNacimiento():LocalDate", "+getAlturaCm():int",
                    "+setAlturaCm(alturaCm:int):void"});
        Sh entrenador = clase(s, d, "Entrenador", false, 1520, 300,
                new String[] {"-especialidad:String"},
                new String[] {"+getEspecialidad():String"});

        // ---- Fila 2
        Sh medicion = clase(s, d, "MedicionCorporal", false, 160, 560,
                new String[] {"-id:String", "-miembroId:String", "-fecha:LocalDate", "-pesoKg:double",
                    "-porcentajeGrasa:Double", "-cinturaCm:Double"},
                new String[] {"+getId():String", "+getMiembroId():String", "+getFecha():LocalDate",
                    "+getPesoKg():double", "+getPorcentajeGrasa():Double", "+getCinturaCm():Double"});
        Sh objetivo = clase(s, d, "Objetivo", false, 500, 560,
                new String[] {"-id:String", "-miembroId:String", "-ejercicioId:String", "-tipo:TipoObjetivo",
                    "-descripcion:String", "-valorInicial:double", "-valorMeta:double", "-fechaInicio:LocalDate",
                    "-fechaLimite:LocalDate", "-estado:EstadoObjetivo"},
                new String[] {"+estaActivo():boolean", "+getId():String", "+getMiembroId():String",
                    "+getEjercicioId():String", "+getTipo():TipoObjetivo", "+getDescripcion():String",
                    "+getValorInicial():double", "+getValorMeta():double", "+getFechaInicio():LocalDate",
                    "+getFechaLimite():LocalDate", "+getEstado():EstadoObjetivo",
                    "+setEstado(estado:EstadoObjetivo):void"});
        Sh sesion = clase(s, d, "SesionEntrenamiento", false, 840, 560,
                new String[] {"-id:String", "-miembroId:String", "-rutinaId:String", "-fecha:LocalDate",
                    "-duracionMinutos:int", "-notas:String", "-series:List<RegistroSerie>"},
                new String[] {"+getId():String", "+getMiembroId():String", "+getRutinaId():String",
                    "+getFecha():LocalDate", "+getDuracionMinutos():int", "+getNotas():String",
                    "+getSeries():List<RegistroSerie>"});
        Sh asignacion = clase(s, d, "AsignacionRutina", false, 1180, 560,
                new String[] {"-id:String", "-miembroId:String", "-entrenadorId:String", "-rutinaId:String",
                    "-fechaInicio:LocalDate", "-fechaFin:LocalDate", "-estado:EstadoAsignacion"},
                new String[] {"+finalizar(hoy:LocalDate):void", "+getId():String", "+getMiembroId():String",
                    "+getEntrenadorId():String", "+getRutinaId():String", "+getFechaInicio():LocalDate",
                    "+getFechaFin():LocalDate", "+getEstado():EstadoAsignacion"});

        // ---- Fila 3
        Sh ejercicio = clase(s, d, "Ejercicio", false, 500, 1100,
                new String[] {"-id:String", "-nombre:String", "-grupoMuscular:GrupoMuscular", "-descripcion:String"},
                new String[] {"+getId():String", "+getNombre():String", "+getGrupoMuscular():GrupoMuscular",
                    "+getDescripcion():String"});
        Sh registro = clase(s, d, "RegistroSerie", false, 960, 1100,
                new String[] {"-numeroSerie:int", "-ejercicioId:String", "-repeticiones:int", "-pesoKg:double"},
                new String[] {"+getNumeroSerie():int", "+getEjercicioId():String", "+getRepeticiones():int",
                    "+getPesoKg():double"});
        Sh rutina = clase(s, d, "Rutina", false, 1520, 1100,
                new String[] {"-id:String", "-nombre:String", "-descripcion:String", "-nivel:NivelRutina",
                    "-entrenadorId:String", "-ejercicios:List<EjercicioPrescrito>"},
                new String[] {"+getId():String", "+getNombre():String", "+getDescripcion():String",
                    "+getNivel():NivelRutina", "+getEntrenadorId():String",
                    "+getEjercicios():List<EjercicioPrescrito>"});

        // ---- Fila 4
        Sh prescrito = clase(s, d, "EjercicioPrescrito", false, 1200, 1460,
                new String[] {"-orden:int", "-dia:DiaSemana", "-ejercicioId:String", "-series:int",
                    "-repeticiones:int", "-descansoSegundos:int"},
                new String[] {"+getOrden():int", "+getDia():DiaSemana", "+getEjercicioId():String",
                    "+getSeries():int", "+getRepeticiones():int", "+getDescansoSegundos():int"});

        // ---- Herencia: "Miembro es un Usuario" (sin multiplicidades)
        s.generalization(d, usuario, miembro);
        s.generalization(d, usuario, entrenador);

        // ---- Asociaciones con nombre y multiplicidad justificada (docs/03-modelo-de-dominio.md)
        s.assoc(d, miembro, objetivo, "define", "1", "0..*", true, false);
        s.assoc(d, objetivo, ejercicio, "se mide en", "0..*", "0..1", true, false);
        s.assoc(d, entrenador, rutina, "diseña", "1", "0..*", true, false);
        s.assoc(d, rutina, prescrito, "contiene", "1", "1..*", false, true);
        s.assoc(d, prescrito, ejercicio, "corresponde a", "0..*", "1", true, false);
        s.assoc(d, miembro, asignacion, "recibe", "1", "0..*", true, false);
        s.assoc(d, entrenador, asignacion, "asigna", "1", "0..*", true, false);
        s.assoc(d, asignacion, rutina, "corresponde a", "0..*", "1", true, false);
        s.assoc(d, miembro, sesion, "realiza", "1", "0..*", true, false);
        s.assoc(d, sesion, rutina, "sigue a", "0..*", "0..1", true, false);
        s.assoc(d, sesion, registro, "se compone de", "1", "1..*", false, true);
        s.assoc(d, registro, ejercicio, "corresponde a", "0..*", "1", true, false);
        s.assoc(d, miembro, medicion, "registra", "1", "0..*", true, false);

        // ---- Enumeraciones: tipos de los atributos (se agrupan sin conectores para no saturar el diagrama)
        Sh pkgEnums = s.pkg(d, "Enumeraciones (tipos de los atributos)", null, 30, 1800, 1850, 250, Dsl.GRIS);
        s.owner = pkgEnums;
        s.enumeration(d, "TipoObjetivo", 60, 1860, 260, null,
                "PESO_CORPORAL", "FRECUENCIA_SEMANAL", "FUERZA_EJERCICIO");
        s.enumeration(d, "EstadoObjetivo", 350, 1860, 200, null, "ACTIVO", "CUMPLIDO", "CANCELADO");
        s.enumeration(d, "GrupoMuscular", 580, 1860, 200, null,
                "PECHO", "ESPALDA", "PIERNAS", "HOMBROS", "BRAZOS", "CORE");
        s.enumeration(d, "NivelRutina", 810, 1860, 200, null, "PRINCIPIANTE", "INTERMEDIO", "AVANZADO");
        s.enumeration(d, "DiaSemana", 1040, 1860, 200, null,
                "LUNES", "MARTES", "MIERCOLES", "JUEVES", "VIERNES", "SABADO", "DOMINGO");
        s.enumeration(d, "EstadoAsignacion", 1270, 1860, 200, null, "ACTIVA", "FINALIZADA");
        s.owner = null;

        s.note(d, "Vista lógica: diagrama de clases del modelo con atributos tipados y operaciones (reflejo del paquete "
                + "model del backend). Rombo relleno = composición (la parte nace y muere con el todo); triángulo hueco = "
                + "herencia. Las referencias por id (miembroId, ejercicioId...) materializan las asociaciones en MongoDB; "
                + "composición = documento embebido.",
                30, 2110, 1000, 70);
    }

    /** Clase del modelo: atributos con tipo y operaciones; {@code cx} es el centro horizontal. */
    private static Sh clase(Dsl s, IDiagramUIModel d, String nombre, boolean abstracta, int cx, int y,
            String[] atributos, String[] operaciones) {
        return s.cls(d, nombre, cx - W / 2, y, W, null, abstracta, atributos, operaciones, Dsl.AZUL);
    }
}
