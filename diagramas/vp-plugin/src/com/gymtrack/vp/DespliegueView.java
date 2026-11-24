package com.gymtrack.vp;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.diagram.IDiagramTypeConstants;
import com.vp.plugin.diagram.IDiagramUIModel;

/**
 * Vista de despliegue: dónde se ejecutan los artefactos y cómo se conectan los nodos
 * (material "Diagramas de despliegue UML").
 *
 * <ul>
 *   <li>{@link #demostracion(Dsl)}: el escenario <b>real</b> de la demo (primer despliegue del material:
 *       todo en el computador).</li>
 *   <li>{@link #objetivo(Dsl)}: un escenario <b>hipotético claramente identificado</b> (API en un servidor
 *       y datos en MongoDB Atlas; tercer despliegue del material).</li>
 * </ul>
 * Reglas verificadas: Controller/Service/Repository NO son nodos (corren juntos en la JVM); un artefacto
 * (gymtrack-api.jar) no es una clase de dominio; MongoDB Atlas no se dibuja dentro de la JVM; cada ruta
 * lleva protocolo; no se añade infraestructura que el escenario no pide.
 */
final class DespliegueView {

    private DespliegueView() {
    }

    static void build(Dsl s) {
        demostracion(s);
        objetivo(s);
    }

    // ------------------------------------------------------------------ escenario real (demo local)

    static void demostracion(Dsl s) {
        IDiagramUIModel d = s.diagram(IDiagramTypeConstants.DIAGRAM_TYPE_DEPLOYMENT_DIAGRAM,
                "5a. Vista de despliegue - Escenario de demostración (local)");

        Sh pc = s.node(d, "Computador del estudiante", "device", 30, 30, 1540, 440, Dsl.GRIS);

        // Separación de 170 px entre entornos: ahí se dibuja la ruta con su protocolo y puerto.
        Sh node = ee(s, d, pc, "Node.js (vite preview)", 60, 120);
        Sh nav = ee(s, d, pc, "Navegador web", 460, 120);
        Sh jvm = ee(s, d, pc, "JVM (Java 17+)", 860, 120);
        Sh mongo = ee(s, d, pc, "MongoDB Server (local)", 1260, 120);

        art(s, d, node, "gymtrack-web/dist (build de la SPA)", Dsl.AMARILLO);
        art(s, d, nav, "gymtrack-web (SPA React en ejecución)", Dsl.AMARILLO);
        art(s, d, jvm, "gymtrack-api.jar (Spring Boot)", Dsl.VERDE);
        art(s, d, mongo, "base de datos gymtrack", Dsl.NARANJA);

        s.path(d, node, nav, "HTTP · puerto 4173\n(descarga de la SPA)");
        s.path(d, nav, jvm, "HTTP/JSON · puerto 8080\n(API REST)");
        s.path(d, jvm, mongo, "Protocolo MongoDB\npuerto 27017");

        s.note(d, "Escenario de demostración (real, el que se ejecuta con docker compose / npm / mvn): todo en el equipo del "
                + "estudiante. Controller, Service y Repository corren juntos dentro de gymtrack-api.jar.",
                30, 510, 900, 60);
    }

    // ------------------------------------------------------------------ escenario hipotético

    static void objetivo(Dsl s) {
        IDiagramUIModel d = s.diagram(IDiagramTypeConstants.DIAGRAM_TYPE_DEPLOYMENT_DIAGRAM,
                "5b. Vista de despliegue - Escenario objetivo (hipotético)");

        Sh usuario = s.node(d, "Equipo del usuario", "device", 30, 60, 440, 340, Dsl.GRIS);
        Sh servidor = s.node(d, "Servidor de aplicación", "node", 640, 60, 440, 340, Dsl.GRIS);
        Sh atlas = s.node(d, "MongoDB Atlas (servicio administrado)", "node", 1250, 60, 440, 340, Dsl.GRIS);

        Sh nav = ee2(s, d, usuario, "Navegador web");
        Sh jvm = ee2(s, d, servidor, "JVM (Java 17+)");
        Sh mongo = ee2(s, d, atlas, "MongoDB");

        art(s, d, nav, "gymtrack-web (SPA React)", Dsl.AMARILLO);
        art(s, d, jvm, "gymtrack-api.jar (incluye gymtrack-web como recursos estáticos)", Dsl.VERDE);
        art(s, d, mongo, "base de datos gymtrack", Dsl.NARANJA);

        s.path(d, usuario, servidor, "HTTPS");
        s.path(d, servidor, atlas, "MongoDB sobre TLS");

        s.note(d, "ESCENARIO HIPOTÉTICO (no implementado en esta entrega): la API en un servidor institucional y los datos en "
                + "MongoDB Atlas. Cambia dónde se ejecuta la API, no sus clases ni sus tres capas. Atlas aloja la base de "
                + "datos; no despliega la API.",
                30, 450, 1000, 60);
    }

    // ------------------------------------------------------------------ helpers

    /** Entorno de ejecución anidado en el computador del escenario local. */
    private static Sh ee(Dsl s, IDiagramUIModel d, Sh parent, String name, int x, int y) {
        Sh e = s.node(d, name, "executionEnvironment", x, y, 230, 300, Dsl.AZUL);
        s.inNode(parent, e);
        return e;
    }

    /** Entorno de ejecución anidado en un nodo del escenario objetivo. */
    private static Sh ee2(Dsl s, IDiagramUIModel d, Sh parent, String name) {
        Sh e = s.node(d, name, "executionEnvironment", parent.x + 30, parent.y + 90, parent.w - 60, parent.h - 130,
                Dsl.AZUL);
        s.inNode(parent, e);
        return e;
    }

    /** Artefacto desplegado dentro de un entorno de ejecución. */
    private static void art(Dsl s, IDiagramUIModel d, Sh parent, String name, java.awt.Color color) {
        Sh a = s.artifact(d, name, parent.x + 20, parent.y + 110, parent.w - 40, 90, color);
        s.inNode(parent, a);
    }
}
