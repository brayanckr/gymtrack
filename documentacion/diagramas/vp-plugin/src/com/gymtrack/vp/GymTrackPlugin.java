package com.gymtrack.vp;

import java.io.File;

import com.vp.plugin.ApplicationManager;
import com.vp.plugin.ProjectManager;
import com.vp.plugin.VPPlugin;
import com.vp.plugin.VPPluginCommandLineSupport;
import com.vp.plugin.VPPluginInfo;

/**
 * Plugin de Visual Paradigm que construye las vistas arquitectónicas de GymTrack mediante la Open API.
 *
 * Se ejecuta sin abrir la interfaz con el script oficial <code>Plugin.bat</code> (ver run.ps1):
 * <pre>Plugin.bat -project gymtrack.vpp -pluginid com.gymtrack.vp.diagrams</pre>
 * La ruta de salida del proyecto se toma del primer argumento o de la variable de entorno
 * <code>GYMTRACK_VPP</code>.
 */
public class GymTrackPlugin implements VPPlugin, VPPluginCommandLineSupport {

    @Override
    public void loaded(VPPluginInfo info) {
        // Nada que inicializar: las vistas se construyen bajo demanda en invoke().
    }

    @Override
    public void unloaded() {
        // Nada que liberar.
    }

    private static void resumen(String etapa, com.vp.plugin.model.IProject p) {
        System.out.println("[GymTrack] " + etapa + ": diagramas=" + p.toDiagramArray().length
                + ", elementos de modelo=" + p.allLevelModelElementCount()
                + ", clases=" + p.allLevelModelElementCount("Class")
                + ", paquetes=" + p.allLevelModelElementCount("Package")
                + ", actores=" + p.allLevelModelElementCount("Actor"));
    }

    @Override
    public void invoke(String[] args) {
        try {
            // Diagnóstico: el proyecto base debe llegar vacío para que el .vpp contenga solo GymTrack.
            // Plugin.bat exige un .vpp existente (-project). Se usa solo como "vehículo" de arranque y se
            // trabaja sobre un proyecto NUEVO, para que el resultado contenga únicamente GymTrack.
            // (newProject() no funciona en modo sin interfaz: lanza HeadlessException.) Se parte de un .vpp
            // de ejemplo de la propia instalación de VP, que no trae diagramas, clases, paquetes ni actores
            // (sus ~693 elementos son los predefinidos de VP, no borrables). Se verifica con conteos.
            com.vp.plugin.model.IProject base = ApplicationManager.instance().getProjectManager().getProject();
            resumen("proyecto de arranque", base);
            for (com.vp.plugin.diagram.IDiagramUIModel viejo : base.toDiagramArray()) {
                viejo.delete();
            }

            Dsl s = new Dsl();
            ContextoView.build(s);
            System.out.println("[GymTrack] 1. vista de contexto creada");
            FuncionalView.build(s);
            System.out.println("[GymTrack] 2. vista funcional creada");
            LogicaView.build(s);
            System.out.println("[GymTrack] 3. vista logica creada (diagrama de clases)");
            DesarrolloView.build(s);
            System.out.println("[GymTrack] 4. vista de desarrollo creada");
            DespliegueView.build(s);
            System.out.println("[GymTrack] 5. vista de despliegue creada (demo + objetivo)");

            ProjectManager pm = ApplicationManager.instance().getProjectManager();
            try {
                pm.getProject().setName("GymTrack");
            } catch (UnsupportedOperationException e) {
                System.out.println("[GymTrack] no se pudo renombrar el proyecto: " + e);
            }

            resumen("resultado", ApplicationManager.instance().getProjectManager().getProject());
            String out = (args != null && args.length > 0) ? args[0] : System.getenv("GYMTRACK_VPP");
            if (out == null || out.isEmpty()) {
                System.out.println("[GymTrack] sin ruta de salida: defina GYMTRACK_VPP o pase la ruta como argumento");
                return;
            }
            boolean ok = pm.saveProjectAs(new File(out));
            System.out.println("[GymTrack] proyecto guardado en " + out + " -> " + ok);
        } catch (Throwable t) {
            System.out.println("[GymTrack] ERROR: " + t);
            t.printStackTrace(System.out);
        }
    }
}
