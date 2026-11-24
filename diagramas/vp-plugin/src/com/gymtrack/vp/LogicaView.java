package com.gymtrack.vp;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramUIModel;

/**
 * Vista lógica: qué objetos existen y cómo se relacionan.
 *
 * <ul>
 *   <li>{@link #dominio(Dsl)}: modelo de dominio (Bloque 3). Solo conceptos, atributos, relaciones con
 *       nombre y multiplicidades justificadas en docs/03-modelo-de-dominio.md. Sin métodos.</li>
 *   <li>{@link #capas(Dsl)}: diseño por capas Controller → Service → Repository (lectura Bloque 7),
 *       con un corte vertical representativo (Objetivos y Progreso) que usa la interfaz
 *       {@code EstrategiaProgreso}. Las demás áreas siguen el mismo patrón.</li>
 * </ul>
 */
final class LogicaView {

    private LogicaView() {
    }

    static void build(Dsl s) {
        dominio(s);
        capas(s);
    }

    // ------------------------------------------------------------------ modelo de dominio

    static void dominio(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_CLASS_DIAGRAM,
                "3a. Vista lógica - Modelo de dominio");
        final int W = 170;

        // Cada fila es una "capa" del grafo para minimizar cruces (ver docs/03-modelo-de-dominio.md).
        Sh usuario = dom(s, d, "Usuario", true, 690, 20, W, "identificacion", "correo", "nombre");
        Sh miembro = dom(s, d, "Miembro", false, 330, 190, W, "fechaNacimiento", "alturaCm");
        Sh entrenador = dom(s, d, "Entrenador", false, 1050, 190, W, "especialidad");

        Sh medicion = dom(s, d, "MedicionCorporal", false, 100, 380, W,
                "fecha", "pesoKg", "porcentajeGrasa", "cinturaCm");
        Sh objetivo = dom(s, d, "Objetivo", false, 330, 380, W,
                "tipo", "descripcion", "valorInicial", "valorMeta", "fechaInicio", "fechaLimite", "estado");
        Sh sesion = dom(s, d, "SesionEntrenamiento", false, 560, 380, W, "fecha", "duracionMinutos", "notas");
        Sh asignacion = dom(s, d, "AsignacionRutina", false, 790, 380, W, "fechaInicio", "fechaFin", "estado");

        Sh ejercicio = dom(s, d, "Ejercicio", false, 330, 650, W, "nombre", "grupoMuscular", "descripcion");
        Sh registro = dom(s, d, "RegistroSerie", false, 700, 650, W, "numeroSerie", "repeticiones", "pesoKg");
        Sh rutina = dom(s, d, "Rutina", false, 1050, 650, W, "nombre", "descripcion", "nivel");

        Sh prescrito = dom(s, d, "EjercicioPrescrito", false, 820, 900, W,
                "orden", "dia", "series", "repeticiones", "descansoSegundos");

        // Herencia: "Miembro es un Usuario" (RN-02). Sin multiplicidades.
        s.generalization(d, usuario, miembro);
        s.generalization(d, usuario, entrenador);

        // Asociaciones con nombre y multiplicidad justificada por una regla (RN-xx)
        s.assoc(d, miembro, objetivo, "define", "1", "0..*", true, false);            // RN-03
        s.assoc(d, objetivo, ejercicio, "se mide en", "0..*", "0..1", true, false);   // RN-05
        s.assoc(d, entrenador, rutina, "diseña", "1", "0..*", true, false);           // RN-09
        s.assoc(d, rutina, prescrito, "contiene", "1", "1..*", false, true);          // RN-09/10 composición
        s.assoc(d, prescrito, ejercicio, "corresponde a", "0..*", "1", true, false);  // RN-09
        s.assoc(d, miembro, asignacion, "recibe", "1", "0..*", true, false);          // RN-11
        s.assoc(d, entrenador, asignacion, "asigna", "1", "0..*", true, false);       // RN-12
        s.assoc(d, asignacion, rutina, "corresponde a", "0..*", "1", true, false);    // RN-12
        s.assoc(d, miembro, sesion, "realiza", "1", "0..*", true, false);             // RN-13
        s.assoc(d, sesion, rutina, "sigue a", "0..*", "0..1", true, false);           // RN-14
        s.assoc(d, sesion, registro, "se compone de", "1", "1..*", false, true);      // RN-13 composición
        s.assoc(d, registro, ejercicio, "corresponde a", "0..*", "1", true, false);   // RN-13
        s.assoc(d, miembro, medicion, "registra", "1", "0..*", true, false);          // RN-15/16

        s.note(d, "Modelo de dominio (Bloque 3): conceptos, atributos, relaciones con nombre y multiplicidades "
                + "justificadas por reglas de negocio (docs/03-modelo-de-dominio.md). Sin métodos ni tecnología. "
                + "Rombo relleno = composición; triángulo hueco = herencia.",
                30, 1060, 560, 70);
    }

    private static Sh dom(Dsl s, IDiagramUIModel d, String name, boolean isAbstract, int cx, int y, int w,
            String... attrs) {
        return s.cls(d, name, cx - w / 2, y, w, null, isAbstract, attrs, null, Dsl.AZUL);
    }

    // ------------------------------------------------------------------ diseño por capas

    static void capas(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_CLASS_DIAGRAM,
                "3b. Vista lógica - Diseño por capas (corte Objetivos y Progreso)");

        // Las capas son paquetes; el modelo de dominio va aparte: NO es una cuarta capa.
        Sh pPres = s.pkg(d, "Presentación (Controller)", "layer", 30, 30, 1300, 220, Dsl.VERDE);
        Sh pNeg = s.pkg(d, "Negocio (Service)", "layer", 30, 280, 1300, 440, Dsl.AMARILLO);
        Sh pDat = s.pkg(d, "Datos (Repository)", "layer", 30, 750, 1300, 220, Dsl.NARANJA);
        Sh pDom = s.pkg(d, "Modelo de dominio (entidades; no es una capa)", "domain", 30, 1000, 1300, 480, Dsl.AZUL);

        // ---- Presentación
        s.owner = pPres;
        Sh objCtl = s.cls(d, "ObjetivoController", 70, 90, 400, "RestController", false, new String[0], new String[] {
            "+crear(req:ObjetivoRequest):ObjetivoResponse",
            "+listar(miembroId:String):List<ObjetivoResponse>",
            "+cambiarEstado(id:String,req:EstadoRequest):ObjetivoResponse"}, null);
        Sh proCtl = s.cls(d, "ProgresoController", 520, 90, 340, "RestController", false, new String[0], new String[] {
            "+panel(miembroId:String):PanelResponse",
            "+progresoDeObjetivo(id:String):ProgresoResponse"}, null);

        // ---- Negocio
        s.owner = pNeg;
        Sh objSvc = s.cls(d, "ObjetivoService", 70, 320, 340, "Service", false, new String[0], new String[] {
            "+crear(req:ObjetivoRequest):Objetivo",
            "+listar(miembroId:String):List<Objetivo>",
            "+buscar(id:String):Objetivo",
            "+cambiarEstado(id:String,e:EstadoObjetivo):Objetivo"}, null);
        Sh proSvc = s.cls(d, "ProgresoService", 470, 320, 340, "Service", false, new String[0], new String[] {
            "+porcentaje(o:Objetivo):double",
            "+panel(miembroId:String):Panel"}, null);
        Sh estrategia = s.cls(d, "EstrategiaProgreso", 960, 320, 340, "interface", false, new String[0], new String[] {
            "+soporta():TipoObjetivo",
            "+valorActual(o:Objetivo):double"}, null);

        Sh peso = s.cls(d, "PesoCorporalStrategy", 450, 540, 270, null, false, new String[0], new String[] {
            "+soporta():TipoObjetivo", "+valorActual(o:Objetivo):double"}, null);
        Sh frec = s.cls(d, "FrecuenciaSemanalStrategy", 760, 540, 270, null, false, new String[0], new String[] {
            "+soporta():TipoObjetivo", "+valorActual(o:Objetivo):double"}, null);
        Sh fuerza = s.cls(d, "FuerzaEjercicioStrategy", 1050, 540, 260, null, false, new String[0], new String[] {
            "+soporta():TipoObjetivo", "+valorActual(o:Objetivo):double"}, null);

        // ---- Datos
        s.owner = pDat;
        Sh objRepo = s.cls(d, "ObjetivoRepository", 70, 790, 340, "interface", false, new String[0], new String[] {
            "+save(o:Objetivo):Objetivo",
            "+findById(id:String):Optional<Objetivo>",
            "+findByMiembroId(m:String):List<Objetivo>"}, null);
        Sh medRepo = s.cls(d, "MedicionRepository", 470, 790, 400, "interface", false, new String[0], new String[] {
            "+save(m:MedicionCorporal):MedicionCorporal",
            "+findUltima(miembroId:String):Optional<MedicionCorporal>"}, null);
        Sh sesRepo = s.cls(d, "SesionRepository", 900, 790, 420, "interface", false, new String[0], new String[] {
            "+save(s:SesionEntrenamiento):SesionEntrenamiento",
            "+findDesde(m:String,f:LocalDate):List<SesionEntrenamiento>"}, null);

        // ---- Dominio (con tipos: ya es diseño). Mismos nombres que en el modelo de dominio, otro paquete.
        s.owner = pDom;
        Sh objetivo = s.cls(d, "Objetivo", 70, 1040, 340, null, false, new String[] {
            "-id:String", "-miembroId:String", "-ejercicioId:String", "-tipo:TipoObjetivo",
            "-descripcion:String", "-valorInicial:double", "-valorMeta:double",
            "-fechaInicio:LocalDate", "-fechaLimite:LocalDate", "-estado:EstadoObjetivo"}, null, null);
        Sh medicion = s.cls(d, "MedicionCorporal", 470, 1040, 300, null, false, new String[] {
            "-id:String", "-miembroId:String", "-fecha:LocalDate", "-pesoKg:double",
            "-porcentajeGrasa:Double", "-cinturaCm:Double"}, null, null);
        Sh sesion = s.cls(d, "SesionEntrenamiento", 900, 1040, 320, null, false, new String[] {
            "-id:String", "-miembroId:String", "-rutinaId:String", "-fecha:LocalDate",
            "-duracionMinutos:int", "-notas:String", "-series:List<RegistroSerie>"}, null, null);
        Sh tipo = s.enumeration(d, "TipoObjetivo", 70, 1330, 200, null,
                "PESO_CORPORAL", "FRECUENCIA_SEMANAL", "FUERZA_EJERCICIO");
        Sh estado = s.enumeration(d, "EstadoObjetivo", 300, 1330, 160, null,
                "ACTIVO", "CUMPLIDO", "CANCELADO");

        s.owner = null; // cada clase ya quedó dentro de su paquete al crearla

        // Colaboración entre capas = asociaciones (referencias por inyección de dependencias).
        s.assoc(d, objCtl, objSvc, null, null, null, true, false);
        s.assoc(d, proCtl, proSvc, null, null, null, true, false);
        // El controlador de objetivos pide el progreso a ProgresoService para enriquecer sus respuestas
        // (ObjetivoService no puede depender de ProgresoService: sería un ciclo).
        s.assoc(d, objCtl, proSvc, null, null, null, true, false);
        s.assoc(d, objSvc, objRepo, null, null, null, true, false);
        s.assoc(d, proSvc, objSvc, null, null, null, true, false);
        s.assoc(d, proSvc, estrategia, "elige por tipo", "1", "1..*", true, false);   // RN-03: tres tipos
        s.assoc(d, peso, medRepo, null, null, null, true, false);
        s.assoc(d, frec, sesRepo, null, null, null, true, false);
        s.assoc(d, fuerza, sesRepo, null, null, null, true, false);

        // Cada estrategia cumple el contrato de la interfaz (Bloque 5: interfaz = contrato).
        s.realization(d, estrategia, peso);
        s.realization(d, estrategia, frec);
        s.realization(d, estrategia, fuerza);

        // Uso temporal de tipos del dominio = dependencia (no asociación).
        s.dep(d, objRepo, objetivo, "usa", null);
        s.dep(d, medRepo, medicion, "usa", null);
        s.dep(d, sesRepo, sesion, "usa", null);
        s.dep(d, objetivo, tipo, null, null);
        s.dep(d, objetivo, estado, null, null);

        s.note(d, "Corte vertical representativo. Los controladores usan DTOs (ObjetivoRequest, ...Response) y "
                + "los repositorios extienden MongoRepository. Cada estrategia entrega el valor actual y "
                + "ProgresoService aplica la misma fórmula (RN-07).",
                30, 1510, 780, 60);
    }
}
