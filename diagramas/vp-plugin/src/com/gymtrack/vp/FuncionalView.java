package com.gymtrack.vp;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramUIModel;

/**
 * Vista funcional: qué partes funcionales forman la solución (Bloque 5: de clases a componentes).
 *
 * Cada componente es una agrupación cohesiva con una responsabilidad de alto nivel y agrupa las historias
 * de usuario que resuelve. Las flechas son dependencias: "A usa los servicios de B". Los componentes de
 * la API se ejecutan <b>juntos</b> en una JVM (capas lógicas ≠ servidores); el recuadro "GymTrack API" lo
 * deja explícito.
 */
final class FuncionalView {

    private FuncionalView() {
    }

    static void build(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_COMPONENT_DIAGRAM, "2. Vista funcional");

        Sh spa = s.comp(d, "Aplicación Web (SPA)", "frontend", 380, 30, 400, 80, Dsl.VERDE);
        Sh api = s.comp(d, "GymTrack API (una sola JVM)", "backend", 30, 190, 1180, 600, Dsl.GRIS);
        Sh mongo = s.comp(d, "MongoDB", "external system", 440, 860, 300, 80, Dsl.NARANJA);

        final int w = 210;
        final int h = 86;

        // Fila 1: calcula el progreso consultando a los demás.
        // (Sin estereotipo propio: VP ya muestra «component» por defecto en cada componente.)
        Sh progreso = s.comp(d, "Seguimiento de Progreso (HU-05, 17)", null, 470, 250, 270, h, Dsl.AZUL);

        // Fila 2: casos de uso que registran datos del miembro.
        Sh objetivos = s.comp(d, "Gestión de Objetivos (HU-04, 05, 06)", null, 60, 440, w + 30, h, Dsl.AZUL);
        Sh entrenos = s.comp(d, "Registro de Entrenamientos (HU-13, 14)", null, 340, 440, w + 50, h, Dsl.AZUL);
        Sh rutinas = s.comp(d, "Gestión de Rutinas (HU-09, 10, 11, 12)", null, 640, 440, w + 50, h, Dsl.AZUL);
        Sh mediciones = s.comp(d, "Seguimiento Corporal (HU-15, 16)", null, 940, 440, w + 30, h, Dsl.AZUL);

        // Fila 3: datos maestros de los que dependen los demás.
        Sh usuarios = s.comp(d, "Gestión de Usuarios (HU-01, 02, 03)", null, 190, 640, w + 50, h, Dsl.AZUL);
        Sh catalogo = s.comp(d, "Catálogo de Ejercicios (HU-07, 08)", null, 760, 640, w + 50, h, Dsl.AZUL);

        for (Sh c : new Sh[] {progreso, objetivos, entrenos, rutinas, mediciones, usuarios, catalogo}) {
            s.inComp(api, c);
        }

        // Cliente → API → almacenamiento (los dos únicos límites del sistema).
        s.dep(d, spa, api, "HTTP / JSON (REST)", null);
        s.dep(d, api, mongo, "persiste documentos", null);

        // Dependencias internas (cliente → proveedor).
        s.dep(d, progreso, objetivos, null, null);
        s.dep(d, progreso, entrenos, null, null);
        s.dep(d, progreso, rutinas, null, null);
        s.dep(d, progreso, mediciones, null, null);

        s.dep(d, objetivos, usuarios, null, null);
        s.dep(d, objetivos, catalogo, null, null);
        s.dep(d, entrenos, usuarios, null, null);
        s.dep(d, entrenos, catalogo, null, null);
        s.dep(d, entrenos, rutinas, null, null);
        s.dep(d, rutinas, usuarios, null, null);
        s.dep(d, rutinas, catalogo, null, null);
        s.dep(d, mediciones, usuarios, null, null);

        s.note(d, "Vista funcional. Cada componente agrupa las historias de usuario que resuelve. "
                + "Dependencias: validar miembro/entrenador (Usuarios), validar ejercicios (Catálogo), "
                + "rutina opcional de una sesión (Rutinas) y los datos que el Progreso necesita para calcular el avance (RN-07).",
                30, 980, 760, 60);
    }
}
