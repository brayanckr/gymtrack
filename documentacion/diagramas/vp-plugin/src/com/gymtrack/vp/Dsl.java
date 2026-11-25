package com.gymtrack.vp;

import java.awt.Color;
import java.awt.Point;

import com.vp.plugin.ApplicationManager;
import com.vp.plugin.DiagramManager;
import com.vp.plugin.diagram.IDiagramElement;
import com.vp.plugin.diagram.IDiagramUIModel;
import com.vp.plugin.diagram.IShapeTypeConstants;
import com.vp.plugin.diagram.IShapeUIModel;
import com.vp.plugin.diagram.connector.IAssociationUIModel;
import com.vp.plugin.diagram.format.IFillColor;
import com.vp.plugin.model.IArtifact;
import com.vp.plugin.model.IAssociation;
import com.vp.plugin.model.IComponent;
import com.vp.plugin.model.INode;
import com.vp.plugin.model.IAssociationEnd;
import com.vp.plugin.model.IAttribute;
import com.vp.plugin.model.IClass;
import com.vp.plugin.model.IDependency;
import com.vp.plugin.model.IGeneralization;
import com.vp.plugin.model.IModelElement;
import com.vp.plugin.model.IOperation;
import com.vp.plugin.model.IPackage;
import com.vp.plugin.model.IParameter;
import com.vp.plugin.model.IRealization;
import com.vp.plugin.model.factory.IModelElementFactory;

/**
 * Pequeño DSL sobre la Open API de Visual Paradigm.
 *
 * Existe para que las vistas (Contexto, Funcional, Lógica, Desarrollo, Despliegue) se lean como
 * una descripción del diseño y no como una secuencia de llamadas de bajo nivel. Cada método crea
 * <b>primero el elemento de modelo</b> (lo que queda en el repositorio de VP) y <b>después su
 * forma</b> en el diagrama, que es el patrón que documenta la propia Open API.
 */
final class Dsl {

    /** Una forma ya colocada en un diagrama: guarda el modelo, la forma y su geometría. */
    static final class Sh {
        final IModelElement model;
        final IShapeUIModel ui;
        final int x;
        final int y;
        final int w;
        final int h;

        Sh(IModelElement model, IShapeUIModel ui, int x, int y, int w, int h) {
            this.model = model;
            this.ui = ui;
            this.x = x;
            this.y = y;
            this.w = w;
            this.h = h;
        }

        int cx() {
            return x + w / 2;
        }

        int cy() {
            return y + h / 2;
        }
    }

    // Paleta suave: distingue capas/roles sin competir con el texto.
    static final Color AZUL = new Color(0xE3F2FD);
    static final Color VERDE = new Color(0xE8F5E9);
    static final Color AMARILLO = new Color(0xFFF8E1);
    static final Color NARANJA = new Color(0xFFF3E0);
    static final Color GRIS = new Color(0xF5F5F5);
    static final Color MORADO = new Color(0xF3E5F5);

    final DiagramManager dm = ApplicationManager.instance().getDiagramManager();
    final IModelElementFactory f = IModelElementFactory.instance();

    // ------------------------------------------------------------------ diagramas

    IDiagramUIModel diagram(String type, String name) {
        IDiagramUIModel d = dm.createDiagram(type);
        d.setName(name);
        return d;
    }

    // ------------------------------------------------------------------ formas genéricas

    /** Crea la forma de un elemento de modelo ya existente y la ubica. */
    Sh shape(IDiagramUIModel d, IModelElement m, int x, int y, int w, int h, Color bg) {
        IShapeUIModel ui = (IShapeUIModel) dm.createDiagramElement(d, m);
        ui.setBounds(x, y, w, h);
        // Sin esto VP no calcula la posición del título (nombre) de la forma.
        ui.setRequestResetCaption(true);
        if (bg != null) {
            // El relleno se define por IFillColor; setBackground() no lo sustituye en estas formas.
            IFillColor fc = ui.getFillColor();
            fc.setType(IFillColor.TYPE_SOLID);
            fc.setColor1(bg);
            fc.applySetting();
        }
        return new Sh(m, ui, x, y, w, h);
    }

    // ------------------------------------------------------------------ componentes, nodos, artefactos

    Sh comp(IDiagramUIModel d, String name, String stereotype, int x, int y, int w, int h, Color bg) {
        IComponent c = f.createComponent();
        c.setName(name);
        if (stereotype != null) {
            c.addStereotype(stereotype);
        }
        return shape(d, c, x, y, w, h, bg);
    }

    /** Anida un componente dentro de otro (modelo y diagrama). */
    void inComp(Sh parent, Sh child) {
        ((IComponent) parent.model).addComponent((IComponent) child.model);
        nest(parent, child);
    }

    /** Nodo UML (device, executionEnvironment o node según el estereotipo). */
    Sh node(IDiagramUIModel d, String name, String stereotype, int x, int y, int w, int h, Color bg) {
        INode n = f.createNode();
        n.setName(name);
        if (stereotype != null) {
            n.addStereotype(stereotype);
        }
        return shape(d, n, x, y, w, h, bg);
    }

    Sh artifact(IDiagramUIModel d, String name, int x, int y, int w, int h, Color bg) {
        IArtifact a = f.createArtifact();
        a.setName(name);
        return shape(d, a, x, y, w, h, bg);
    }

    /** Anida un nodo o artefacto dentro de un nodo (relación de despliegue / contención). */
    void inNode(Sh parent, Sh child) {
        INode p = (INode) parent.model;
        if (child.model instanceof IArtifact) {
            p.addArtifact((IArtifact) child.model);
        } else if (child.model instanceof INode) {
            p.addNode((INode) child.model);
        }
        nest(parent, child);
    }

    /** Enumeración UML: una clase «enumeration» cuyos literales son los valores permitidos. */
    Sh enumeration(IDiagramUIModel d, String name, int x, int y, int w, Color bg, String... literals) {
        IClass c = f.createClass();
        if (owner != null) {
            ((IPackage) owner.model).addChild(c);
        }
        c.setName(name);
        c.addStereotype("enumeration");
        for (String lit : literals) {
            c.createEnumerationLiteral().setName(lit);
        }
        int h = 28 + 14 + literals.length * 17 + 14;
        Sh sh = shape(d, c, x, y, w, h, bg);
        if (owner != null) {
            nest(owner, sh);
        }
        return sh;
    }

    /**
     * Ruta de comunicación entre nodos: asociación con la etiqueta del protocolo y el puerto.
     * Sin multiplicidades ni flechas: una ruta de comunicación es bidireccional.
     */
    void path(IDiagramUIModel d, Sh a, Sh b, String label) {
        IAssociation as = f.createAssociation();
        as.setFrom(a.model);
        as.setTo(b.model);
        as.setName(label);
        // Puntos explícitos de borde a borde, a media altura: entre nodos anidados VP no traza bien la línea
        // por sí solo, y en nodos 3D la deja pegada al borde superior.
        Point[] pts = null;
        if (a.x + a.w <= b.x) {
            pts = new Point[] {new Point(a.x + a.w, a.cy()), new Point(b.x, b.cy())};
        } else if (b.x + b.w <= a.x) {
            pts = new Point[] {new Point(a.x, a.cy()), new Point(b.x + b.w, b.cy())};
        }
        IDiagramElement c = dm.createConnector(d, as, a.ui, b.ui, pts);
        if (c instanceof IAssociationUIModel) {
            ((IAssociationUIModel) c).setRequestResetCaption(true);
        }
    }

    /** Anida una forma dentro de otra (el modelo se anida aparte, según el tipo). */
    void nest(Sh parent, Sh child) {
        parent.ui.addChild(child.ui);
    }

    /** Nota UML. Si la versión de VP no admite escribir su texto por API, se omite sin romper el resto. */
    void note(IDiagramUIModel d, String text, int x, int y, int w, int h) {
        try {
            IDiagramElement e = dm.createDiagramElement(d, IShapeTypeConstants.SHAPE_TYPE_NOTE);
            ((IShapeUIModel) e).setBounds(x, y, w, h);
            IModelElement m = e.getMetaModelElement();
            if (m != null) {
                m.setDescription(text);
            }
        } catch (Throwable t) {
            System.out.println("[nota omitida] " + t);
        }
    }

    // ------------------------------------------------------------------ clases

    /**
     * Crea una clase con sus atributos y operaciones.
     *
     * Formato de miembros: {@code "-nombre:Tipo"} (visibilidad opcional + - #) y
     * {@code "+operacion(p:Tipo,q:Tipo):Retorno"}. En el modelo de dominio los atributos van sin
     * tipo ni visibilidad (Bloque 3: todavía no es diseño).
     */
    Sh cls(IDiagramUIModel d, String name, int x, int y, int w, String stereotype, boolean isAbstract,
            String[] attrs, String[] ops, Color bg) {
        IClass c = f.createClass();
        // VP rechaza (deja "Class", "Class2"...) un nombre repetido dentro del mismo paquete. El mismo concepto
        // aparece en el modelo de dominio y en el diseño por capas, así que el elemento se mete primero en su
        // paquete (owner) y solo después se nombra.
        if (owner != null) {
            ((IPackage) owner.model).addChild(c);
        }
        c.setName(name);
        c.setAbstract(isAbstract);
        if (stereotype != null) {
            c.addStereotype(stereotype);
        }
        int maxLen = name.length();
        for (String a : attrs) {
            addAttr(c, a);
            maxLen = Math.max(maxLen, a.length() + 2);
        }
        if (ops != null) {
            for (String o : ops) {
                addOp(c, o);
                maxLen = Math.max(maxLen, o.length());
            }
        }
        int width = w > 0 ? w : Math.max(150, (int) (maxLen * 6.9) + 28);
        int header = 28 + (stereotype != null ? 14 : 0);
        int attrsH = attrs.length == 0 ? 20 : attrs.length * 17 + 8;
        int opsH = (ops == null || ops.length == 0) ? 20 : ops.length * 17 + 8;
        Sh sh = shape(d, c, x, y, width, header + attrsH + opsH, bg);
        if (owner != null) {
            nest(owner, sh);
        }
        return sh;
    }

    /** Paquete que contiene las clases que se crean a continuación (null = nivel raíz). */
    Sh owner;

    private static String visOf(char ch, boolean op) {
        switch (ch) {
            case '-':
                return op ? IOperation.VISIBILITY_PRIVATE : IAttribute.VISIBILITY_PRIVATE;
            case '+':
                return op ? IOperation.VISIBILITY_PUBLIC : IAttribute.VISIBILITY_PUBLIC;
            case '#':
                return op ? IOperation.VISIBILITY_PROTECTED : IAttribute.VISIBILITY_PROTECTED;
            default:
                return null;
        }
    }

    private void addAttr(IClass c, String spec) {
        String s = spec;
        String vis = visOf(s.charAt(0), false);
        if (vis != null) {
            s = s.substring(1);
        }
        int i = s.indexOf(':');
        IAttribute a = f.createAttribute();
        a.setName(i < 0 ? s.trim() : s.substring(0, i).trim());
        if (i >= 0) {
            a.setType(s.substring(i + 1).trim());
        }
        // Modelo de dominio: sin visibilidad (VP pondría "-" por defecto y eso ya es diseño).
        a.setVisibility(vis != null ? vis : IAttribute.VISIBILITY_UNSPECIFIED);
        c.addAttribute(a);
    }

    private void addOp(IClass c, String spec) {
        String s = spec;
        String vis = visOf(s.charAt(0), true);
        if (vis != null) {
            s = s.substring(1);
        }
        int p = s.indexOf('(');
        int q = s.lastIndexOf(')');
        IOperation o = f.createOperation();
        o.setName(s.substring(0, p).trim());
        if (vis != null) {
            o.setVisibility(vis);
        }
        String params = s.substring(p + 1, q).trim();
        if (!params.isEmpty()) {
            for (String prm : params.split(",")) {
                String[] nt = prm.split(":");
                IParameter pr = f.createParameter();
                pr.setName(nt[0].trim());
                if (nt.length > 1) {
                    pr.setType(nt[1].trim());
                }
                o.addParameter(pr);
            }
        }
        String rest = s.substring(q + 1).trim();
        if (rest.startsWith(":")) {
            o.setReturnType(rest.substring(1).trim());
        }
        c.addOperation(o);
    }

    // ------------------------------------------------------------------ paquetes

    Sh pkg(IDiagramUIModel d, String name, String stereotype, int x, int y, int w, int h, Color bg) {
        IPackage p = f.createPackage();
        p.setName(name);
        if (stereotype != null) {
            p.addStereotype(stereotype);
        }
        return shape(d, p, x, y, w, h, bg);
    }

    /** Coloca {@code child} (clase o paquete) dentro del paquete {@code parent}, en modelo y en diagrama. */
    void inPkg(Sh parent, Sh child) {
        ((IPackage) parent.model).addChild(child.model);
        nest(parent, child);
    }

    // ------------------------------------------------------------------ relaciones

    /**
     * Asociación UML. {@code from} es el extremo de origen: ahí se pone la multiplicidad
     * {@code mFrom} y, si {@code composition}, el rombo relleno (la parte nace y muere con el todo).
     * Con {@code navigable} la flecha apunta a {@code to} (como en el ejemplo Estudiante → Prestamo).
     */
    void assoc(IDiagramUIModel d, Sh from, Sh to, String name, String mFrom, String mTo,
            boolean navigable, boolean composition) {
        IAssociation a = f.createAssociation();
        a.setFrom(from.model);
        a.setTo(to.model);
        if (name != null) {
            a.setName(name);
        }
        IAssociationEnd fe = (IAssociationEnd) a.getFromEnd();
        IAssociationEnd te = (IAssociationEnd) a.getToEnd();
        if (mFrom != null) {
            fe.setMultiplicity(mFrom);
        }
        if (mTo != null) {
            te.setMultiplicity(mTo);
        }
        if (composition) {
            fe.setAggregationKind(IAssociationEnd.AGGREGATION_KIND_COMPOSITED);
        }
        // Por defecto ambos extremos salen navegables y se dibujarían dos flechas: solo "to" lo es.
        fe.setNavigable(IAssociationEnd.NAVIGABLE_UNSPECIFIED);
        te.setNavigable(navigable ? IAssociationEnd.NAVIGABLE_NAVIGABLE : IAssociationEnd.NAVIGABLE_UNSPECIFIED);
        IDiagramElement c = dm.createConnector(d, a, from.ui, to.ui, null);
        if (c instanceof IAssociationUIModel) {
            IAssociationUIModel au = (IAssociationUIModel) c;
            au.setRequestResetCaption(true);
            // Dibuja la flecha de navegabilidad (Estudiante 1 --> 0..* Prestamo).
            au.setShowNavigationArrows(IAssociationUIModel.SHOW_NAVIGATION_ARROWS_SHOW_ALL_ARROWS_AND_CROSSES);
        }
    }

    /** Herencia: triángulo hueco hacia la superclase; sin multiplicidades. */
    void generalization(IDiagramUIModel d, Sh superclass, Sh subclass) {
        IGeneralization g = f.createGeneralization();
        g.setFrom(superclass.model);
        g.setTo(subclass.model);
        dm.createConnector(d, g, superclass.ui, subclass.ui, null);
    }

    /** Realización de interfaz: línea punteada con triángulo hueco hacia la interfaz. */
    void realization(IDiagramUIModel d, Sh iface, Sh impl) {
        IRealization r = f.createRealization();
        r.setFrom(iface.model);
        r.setTo(impl.model);
        dm.createConnector(d, r, iface.ui, impl.ui, null);
    }

    /**
     * Dependencia "client depende de supplier" (flecha punteada hacia el proveedor). En VP el
     * extremo <i>from</i> del modelo es el proveedor, como indica el ejemplo oficial de la Open API.
     */
    void dep(IDiagramUIModel d, Sh client, Sh supplier, String label, String stereotype) {
        IDependency dp = f.createDependency();
        // Comprobado en VP 18.1: la flecha se dibuja en el extremo "to", que debe ser el proveedor.
        dp.setFrom(client.model);
        dp.setTo(supplier.model);
        if (label != null) {
            dp.setName(label);
        }
        if (stereotype != null) {
            dp.addStereotype(stereotype);
        }
        IDiagramElement c = dm.createConnector(d, dp, client.ui, supplier.ui, null);
        c.setRequestResetCaption(true); // sin esto VP no dibuja la etiqueta de la dependencia
    }
}
