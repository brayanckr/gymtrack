package com.gymtrack.vp;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramUIModel;

/**
 * Vista de desarrollo: cómo se organiza el código y de qué depende cada módulo (diagrama de paquetes).
 *
 * Regla de verificación: las dependencias van en un solo sentido
 * (controller → service → repository → model) y no hay ciclos; {@code model} no depende de nada del
 * proyecto. Se muestran los dos repositorios de código (backend y frontend) y su única unión en tiempo de
 * ejecución: el cliente HTTP del frontend contra los controladores.
 */
final class DesarrolloView {

    private DesarrolloView() {
    }

    static void build(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_PACKAGE_DIAGRAM, "4. Vista de desarrollo");

        // ---------------- Repositorio backend (Maven, com.gymtrack.api)
        Sh backend = s.pkg(d, "gymtrack-backend  (com.gymtrack.api)", "maven module", 30, 30, 1050, 640, Dsl.AZUL);
        Sh controller = sub(s, d, backend, "controller", 560, 110);
        Sh service = sub(s, d, backend, "service", 560, 270);
        Sh repository = sub(s, d, backend, "repository", 560, 430);
        Sh dto = sub(s, d, backend, "dto", 150, 110);
        Sh model = sub(s, d, backend, "model", 150, 430);
        Sh exception = sub(s, d, backend, "exception", 830, 270);
        Sh config = sub(s, d, backend, "config", 830, 430);

        s.dep(d, controller, service, null, null);
        s.dep(d, controller, dto, null, null);
        s.dep(d, controller, model, null, null);
        s.dep(d, service, repository, null, null);
        s.dep(d, service, model, null, null);
        s.dep(d, service, dto, null, null);
        s.dep(d, service, exception, null, null);
        s.dep(d, repository, model, null, null);
        s.dep(d, dto, model, null, null);
        // DataSeeder (config) carga datos de ejemplo a través de los servicios; nadie depende de config.
        s.dep(d, config, service, "datos de ejemplo", null);

        Sh libBack = s.pkg(d, "Spring Boot: starter-web · starter-data-mongodb · starter-validation", "library",
                300, 740, 560, 70, Dsl.GRIS);
        s.dep(d, backend, libBack, "usa", null);

        // ---------------- Repositorio frontend (npm, src/)
        Sh frontend = s.pkg(d, "gymtrack-frontend  (src/)", "npm module", 1170, 30, 560, 640, Dsl.AMARILLO);
        Sh api = sub(s, d, frontend, "api", 1210, 110);
        Sh types = sub(s, d, frontend, "types", 1490, 110);
        Sh state = sub(s, d, frontend, "state", 1490, 270);
        Sh pages = sub(s, d, frontend, "pages", 1210, 450);
        Sh components = sub(s, d, frontend, "components", 1490, 450);

        s.dep(d, pages, api, null, null);
        s.dep(d, pages, components, null, null);
        s.dep(d, pages, state, null, null);
        s.dep(d, pages, types, null, null);
        s.dep(d, state, types, null, null);
        s.dep(d, api, types, null, null);

        Sh libFront = s.pkg(d, "React · Vite · TypeScript", "library", 1290, 740, 360, 70, Dsl.GRIS);
        s.dep(d, frontend, libFront, "usa", null);

        // Única unión entre repositorios, en ejecución (no en compilación).
        s.dep(d, api, controller, "HTTP / JSON (REST)", "runtime");

        s.note(d, "Vista de desarrollo. Dependencias de compilación en un solo sentido; model no depende de ninguna "
                + "capa. Los dos repositorios solo se conocen en ejecución, por HTTP. Artefactos: gymtrack-api.jar (Maven) "
                + "y gymtrack-web/dist (npm run build).",
                30, 860, 900, 60);
    }

    private static Sh sub(Dsl s, IDiagramUIModel d, Sh parent, String name, int x, int y) {
        Sh p = s.pkg(d, name, null, x, y, 210, 70, Dsl.GRIS);
        s.inPkg(parent, p);
        return p;
    }
}
