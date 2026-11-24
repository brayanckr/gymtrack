package com.gymtrack.vp;

import java.util.ArrayList;
import java.util.List;

import com.gymtrack.vp.Dsl.Sh;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramUIModel;
import com.vp.plugin.model.IActor;
import com.vp.plugin.model.IAssociation;
import com.vp.plugin.model.ISystem;
import com.vp.plugin.model.IUseCase;

/**
 * Vista de contexto: GymTrack como caja negra frente a sus actores.
 *
 * Reglas aplicadas (docs/00-reglas-de-la-materia.md, sección 6):
 * <ul>
 *   <li>Los actores son exactamente los de las historias de usuario (Miembro y Entrenador).</li>
 *   <li>Solo capacidades observables desde fuera, una por área funcional: no hay estructura interna.</li>
 *   <li>No se dibujan MongoDB ni Spring: son <i>solución tecnológica</i>, no contexto del negocio
 *       (Bloque 2). Aparecen en las vistas funcional y de despliegue.</li>
 * </ul>
 */
final class ContextoView {

    private ContextoView() {
    }

    static void build(Dsl s) {
        IDiagramUIModel d = s.diagram(DiagramManager.DIAGRAM_TYPE_USE_CASE_DIAGRAM, "1. Vista de contexto");

        ISystem sysModel = s.f.createSystem();
        sysModel.setName("GymTrack");
        Sh sys = s.shape(d, sysModel, 250, 30, 420, 700, null);

        Sh miembro = actor(s, d, "Miembro", 70, 250);
        Sh entrenador = actor(s, d, "Entrenador", 760, 520);

        // {nombre, usaMiembro, usaEntrenador}
        Object[][] capacidades = {
            {"Gestionar objetivos (HU-04, 05, 06)", true, false},
            {"Registrar y consultar entrenamientos (HU-13, 14)", true, false},
            {"Registrar mediciones y ver evolución (HU-15, 16)", true, false},
            {"Ver panel de progreso (HU-17)", true, false},
            {"Gestionar cuenta y perfil (HU-01, 02, 03)", true, true},
            {"Consultar catálogo de ejercicios (HU-07)", true, true},
            {"Consultar rutinas (HU-10, 12)", true, true},
            {"Mantener catálogo de ejercicios (HU-08)", false, true},
            {"Diseñar y asignar rutinas (HU-09, 11)", false, true},
        };

        // Primera pasada: todas las formas (y su anidamiento). Segunda pasada: los conectores,
        // para que VP los calcule con la geometría ya definitiva.
        List<Sh> casos = new ArrayList<>();
        int y = 90;
        for (Object[] c : capacidades) {
            IUseCase uc = s.f.createUseCase();
            uc.setName((String) c[0]);
            Sh sh = s.shape(d, uc, 275, y, 370, 54, null);
            s.nest(sys, sh);
            casos.add(sh);
            y += 70;
        }
        for (int i = 0; i < capacidades.length; i++) {
            if ((Boolean) capacidades[i][1]) {
                link(s, d, miembro, casos.get(i));
            }
            if ((Boolean) capacidades[i][2]) {
                link(s, d, entrenador, casos.get(i));
            }
        }

        s.note(d, "Vista de contexto. GymTrack se muestra como caja negra: solo lo que cada actor puede hacer "
                + "con el sistema. Sin autenticación (fuera de alcance, ver docs/01-caso-de-estudio.md).",
                60, 770, 600, 50);
    }

    private static Sh actor(Dsl s, IDiagramUIModel d, String name, int x, int y) {
        IActor a = s.f.createActor();
        a.setName(name);
        return s.shape(d, a, x, y, 70, 110, null);
    }

    private static void link(Dsl s, IDiagramUIModel d, Sh actor, Sh useCase) {
        IAssociation a = s.f.createAssociation();
        a.setFrom(actor.model);
        a.setTo(useCase.model);
        s.dm.createConnector(d, a, actor.ui, useCase.ui, null);
    }
}
