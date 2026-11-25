// Genera las vistas 1 (contexto), 2 (funcional), 3 (lógica) y 4 (desarrollo) de GymTrack como .drawio editables,
// siguiendo el "Modelo de presentación de diseño" del profesor.
//   1. Diagrama de contexto: sistema (círculo) + entidades externas + flujos de datos etiquetados.
//   2. Diagrama de componentes funcional: componentes, puertos, interfaces provistas (lollipop) y requeridas (socket), actores.
//   3. Diagrama de clases del dominio: atributos tipados, operaciones, multiplicidades.
//   4. Vista de desarrollo: clases reales con dependencias discontinuas (backend y frontend).
// Las posiciones y el trazado de las flechas los calcula el motor de layout ELK (capas, flechas ortogonales y espacio
// reservado para las etiquetas), para que las flechas no se crucen ni pisen textos.
// Uso: npm install && node generar-vistas.js
const fs = require('fs');
const path = require('path');
const ELK = require('elkjs');
const elk = new ELK();

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ST = { azul: 'fillColor=#DAE8FC;strokeColor=#6C8EBF;', verde: 'fillColor=#D5E8D4;strokeColor=#82B366;',
  naranja: 'fillColor=#FFE6CC;strokeColor=#D79B00;', gris: 'fillColor=#F5F5F5;strokeColor=#666666;',
  amarillo: 'fillColor=#FFF2CC;strokeColor=#D6B656;', morado: 'fillColor=#E1D5E7;strokeColor=#9673A6;' };
const TITLE = 'text;html=1;fontSize=16;fontStyle=1;align=left;';
const NOTE = 'shape=note;whiteSpace=wrap;html=1;align=left;spacing=8;fontSize=11;' + ST.amarillo;
const LABEL = 'text;html=1;fontSize=11;align=center;verticalAlign=middle;whiteSpace=wrap;fillColor=#FFFFFF;strokeColor=none;spacing=1;';

class Doc {
  constructor() { this.n = 1; this.cells = []; }
  id() { return 'c' + (this.n++); }
  v(label, style, x, y, w, h, parent = '1') {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
    return i;
  }
  // arista con puntos intermedios absolutos (parent=1)
  e(label, style, src, tgt, pts) {
    const i = this.id();
    // sin puntos repetidos ni intermedios colineales (segmentos de longitud cero hacen fallar al editor)
    if (pts) pts = pts.filter((p, k) => k === 0 || Math.round(p.x) !== Math.round(pts[k - 1].x) || Math.round(p.y) !== Math.round(pts[k - 1].y));
    const arr = pts && pts.length ? `<Array as="points">${pts.map(p => `<mxPoint x="${Math.round(p.x)}" y="${Math.round(p.y)}"/>`).join('')}</Array>` : '';
    this.cells.push(`<mxCell id="${i}" value="${esc(label || '')}" style="${style}" edge="1" parent="1" source="${src}" target="${tgt}"><mxGeometry relative="1" as="geometry">${arr}</mxGeometry></mxCell>`);
    return i;
  }
  xml(name, w, h) {
    return `<mxfile host="app.diagrams.net"><diagram id="d" name="${esc(name)}"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${Math.round(w)}" pageHeight="${Math.round(h)}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${this.cells.join('')}</root></mxGraphModel></diagram></mxfile>`;
  }
}
const save = (file, d, name, w, h) => { fs.writeFileSync(path.join(__dirname, file), d.xml(name, w, h), 'utf8'); console.log('ok', file, d.cells.length, 'celdas'); };

// ---------- utilidades de layout ----------
const LAYERED = {
  'elk.algorithm': 'layered', 'elk.direction': 'DOWN', 'elk.edgeRouting': 'ORTHOGONAL',
  'elk.hierarchyHandling': 'INCLUDE_CHILDREN', 'elk.layered.crossingMinimization.strategy': 'LAYER_SWEEP',
  'elk.layered.thoroughness': '30', 'elk.spacing.edgeEdge': '18', 'elk.spacing.edgeNode': '30',
  'elk.layered.spacing.edgeNodeBetweenLayers': '30', 'elk.layered.spacing.edgeEdgeBetweenLayers': '18',
  'elk.layered.mergeEdges': 'false', 'elk.padding': '[top=20,left=20,bottom=20,right=20]'
};
const lblSize = t => ({ width: Math.max(...String(t).split('<br>').map(s => s.replace(/<[^>]+>/g, '').length)) * 6 + 10, height: 16 * String(t).split('<br>').length });
function absMap(node, ox, oy, map) {
  for (const c of node.children || []) {
    map[c.id] = { x: ox + c.x, y: oy + c.y, w: c.width, h: c.height, rx: c.x, ry: c.y, parent: node.id, ports: c.ports };
    absMap(c, ox + c.x, oy + c.y, map);
  }
}
// cuenta cruces entre aristas (segmentos ortogonales) en coordenadas absolutas
function countCross(res) {
  const map = {}; absMap(res, 0, 0, map);
  const polys = res.edges.map(e => {
    const co = e.container && e.container !== 'root' ? map[e.container] : { x: 0, y: 0 };
    const s = e.sections[0];
    return [s.startPoint, ...(s.bendPoints || []), s.endPoint].map(p => ({ x: p.x + co.x, y: p.y + co.y }));
  });
  const segs = polys.map(pl => pl.slice(1).map((p, i) => [pl[i], p]));
  let n = 0;
  for (let i = 0; i < segs.length; i++) for (let j = i + 1; j < segs.length; j++) for (const [a, b] of segs[i]) for (const [c, d] of segs[j]) {
    const aH = Math.abs(a.y - b.y) < 0.5, cH = Math.abs(c.y - d.y) < 0.5;
    if (aH === cH) continue; // paralelas
    const [h1, h2, v1, v2] = aH ? [a, b, c, d] : [c, d, a, b];
    const x1 = Math.min(h1.x, h2.x), x2 = Math.max(h1.x, h2.x), y1 = Math.min(v1.y, v2.y), y2 = Math.max(v1.y, v2.y);
    if (v1.x > x1 + 1 && v1.x < x2 - 1 && h1.y > y1 + 1 && h1.y < y2 - 1) n++;
  }
  return n;
}
// prueba varias semillas del layout y se queda con el de menos cruces
async function bestLayout(graph, tries = 300) {
  let best = null, bs = Infinity;
  for (let s = 1; s <= tries; s++) {
    const g = JSON.parse(JSON.stringify(graph));
    g.layoutOptions['elk.randomSeed'] = String(s);
    g.layoutOptions['elk.layered.nodePlacement.strategy'] = ['BRANDES_KOEPF', 'NETWORK_SIMPLEX', 'LINEAR_SEGMENTS'][s % 3];
    g.layoutOptions['elk.layered.crossingMinimization.greedySwitch.type'] = ['TWO_SIDED', 'ONE_SIDED'][Math.floor(s / 3) % 2];
    g.layoutOptions['elk.layered.thoroughness'] = String(10 + (s % 5) * 20);
    const r = await elk.layout(g); const c = countCross(r);
    if (c < bs) { bs = c; best = r; if (c === 0) break; }
  }
  console.log('  cruces entre flechas:', bs);
  return best;
}
const edgePts = e => { const s = e.sections[0]; return [s.startPoint, ...(s.bendPoints || []), s.endPoint]; };
const bounds = map => { let w = 0, h = 0; for (const k in map) { w = Math.max(w, map[k].x + map[k].w); h = Math.max(h, map[k].y + map[k].h); } return { w, h }; };

// ======================================================================
// 1. CONTEXTO (modelo del profesor: círculo central, entidades externas, flujos de datos)
// ======================================================================
function contexto() {
  const d = new Doc();
  d.v('Vista de contexto de GymTrack: diagrama de contexto (flujos de datos)', TITLE, 30, 0, 900, 26);
  const miembro = d.v('<b>Miembro</b><br>(entidad externa)', 'rounded=0;whiteSpace=wrap;html=1;fontSize=14;' + ST.verde, 30, 220, 210, 150);
  const entrenador = d.v('<b>Entrenador</b><br>(entidad externa)', 'rounded=0;whiteSpace=wrap;html=1;fontSize=14;' + ST.verde, 1240, 220, 210, 150);
  const sistema = d.v('<b>GymTrack</b><br>(sistema de seguimiento<br>de entrenamiento)', 'ellipse;whiteSpace=wrap;html=1;fontSize=15;' + ST.azul, 570, 130, 340, 340);
  const FL = 'endArrow=classic;html=1;edgeStyle=none;exitPerimeter=0;entryPerimeter=0;';
  const L1 = 'entryX=0.047;entryY=0.289;', L2 = 'exitX=0.047;exitY=0.711;', R1 = 'entryX=0.953;entryY=0.289;', R2 = 'exitX=0.953;exitY=0.711;';
  // flechas limpias (sin texto encima) y etiquetas separadas, colocadas fuera de la línea
  d.e('', FL + 'exitX=1;exitY=0.3;' + L1, miembro, sistema);
  d.e('', FL + L2 + 'entryX=1;entryY=0.75;', sistema, miembro);
  d.e('', FL + 'exitX=0;exitY=0.3;' + R1, entrenador, sistema);
  d.e('', FL + R2 + 'entryX=0;entryY=0.75;', sistema, entrenador);
  const T = 'text;html=1;fontSize=11;align=center;verticalAlign=middle;whiteSpace=wrap;';
  d.v('Datos de cuenta y perfil (HU-01, 03)<br>Objetivos (HU-04)<br>Sesiones de entrenamiento (HU-13)<br>Mediciones corporales (HU-15)', T, 250, 132, 300, 72);
  d.v('Panel de progreso (HU-17)<br>Progreso de objetivos (HU-05, 06)<br>Historial de sesiones (HU-14)<br>Evolución corporal (HU-16)<br>Catálogo y rutina activa (HU-07, 10, 12)', T, 250, 396, 300, 90);
  d.v('Datos de cuenta (HU-02)<br>Ejercicios nuevos (HU-08)<br>Rutinas diseñadas (HU-09)<br>Asignaciones de rutina (HU-11)', T, 930, 132, 300, 72);
  d.v('Catálogo de ejercicios (HU-07)<br>Rutinas existentes (HU-10)<br>Miembros registrados (HU-11)<br>Confirmaciones y errores de validación', T, 930, 396, 300, 72);
  d.v('Vista de contexto (Bloque 2). GymTrack es una caja negra: solo se muestran las dos entidades externas de las historias de usuario (Miembro y Entrenador) y los datos que intercambian con el sistema. '
    + 'MongoDB, Spring y React no aparecen: son solución tecnológica y se ven en las vistas funcional, de desarrollo y de despliegue. Sin autenticación (fuera de alcance).', NOTE, 30, 540, 1000, 70);
  save('1-contexto.drawio', d, '1. Vista de contexto', 1500, 660);
}

// ======================================================================
// 2. FUNCIONAL (componentes con puertos; interfaces provistas y requeridas; actores)
// ======================================================================
async function funcional() {
  const COMP = 'shape=component;align=left;spacingLeft=36;whiteSpace=wrap;html=1;fontSize=12;verticalAlign=middle;';
  const LOLLI = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;labelPosition=left;verticalLabelPosition=middle;align=right;verticalAlign=middle;fontSize=11;spacingRight=6;';
  const SOCKET = 'endArrow=halfCircle;endFill=0;endSize=14;html=1;rounded=0;';
  const USE = 'endArrow=open;endFill=0;dashed=1;html=1;';
  const portSpec = (id, label) => ({ id, width: 18, height: 18, layoutOptions: { 'elk.port.side': 'NORTH' }, labels: [{ text: label, ...lblSize(label), layoutOptions: { 'elk.portLabels.placement': 'OUTSIDE' } }] });
  const compSpec = (id, label, hu, iface) => ({ id, width: 280, height: 90, label, hu, iface, layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE' }, ports: [portSpec(id + '.p', iface)] });
  const comps = [compSpec('prog', 'Seguimiento de Progreso', 'HU-05, 17', 'IProgreso'), compSpec('obj', 'Gestión de Objetivos', 'HU-04, 05, 06', 'IObjetivos'),
    compSpec('ent', 'Registro de Entrenamientos', 'HU-13, 14', 'IEntrenamientos'), compSpec('rut', 'Gestión de Rutinas', 'HU-09, 10, 11, 12', 'IRutinas'),
    compSpec('med', 'Seguimiento Corporal', 'HU-15, 16', 'IMediciones'), compSpec('usu', 'Gestión de Usuarios', 'HU-01, 02, 03', 'IUsuarios'),
    compSpec('cat', 'Catálogo de Ejercicios', 'HU-07, 08', 'ICatalogo')];
  const graph = {
    id: 'root', layoutOptions: { ...LAYERED, 'elk.spacing.nodeNode': '60', 'elk.layered.spacing.nodeNodeBetweenLayers': '90', 'elk.padding': '[top=50,left=30,bottom=30,right=30]' },
    children: [
      { id: 'aM', width: 60, height: 90 }, { id: 'aE', width: 60, height: 90 },
      { id: 'spa', width: 380, height: 80, layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE' }, ports: [portSpec('spa.p', 'IInterfazWeb')] },
      { id: 'api', layoutOptions: { 'elk.padding': '[top=50,left=30,bottom=30,right=30]', 'elk.portConstraints': 'FIXED_SIDE' }, ports: [portSpec('api.p', 'puerto REST')], children: comps },
      { id: 'mongo', width: 340, height: 80, layoutOptions: { 'elk.portConstraints': 'FIXED_SIDE' }, ports: [portSpec('mongo.p', 'IPersistencia')] },
    ],
    edges: []
  };
  const E = (id, s, t, label) => graph.edges.push({ id, sources: [s], targets: [t], labels: label ? [{ text: label, ...lblSize(label), layoutOptions: { 'elk.edgeLabels.placement': 'CENTER' } }] : [] });
  E('e_aM', 'aM', 'spa.p', '«use»'); E('e_aE', 'aE', 'spa.p', '«use»'); E('e_spa', 'spa', 'api.p', 'HTTP / JSON (REST)'); E('e_mongo', 'api', 'mongo.p', 'persiste documentos (MongoDB)');
  [['prog', 'obj'], ['prog', 'ent'], ['prog', 'rut'], ['prog', 'med'], ['obj', 'usu'], ['obj', 'cat'], ['ent', 'usu'], ['ent', 'cat'], ['ent', 'rut'], ['rut', 'usu'], ['rut', 'cat'], ['med', 'usu']]
    .forEach(([a, b]) => E(`d_${a}_${b}`, a, b + '.p'));
  const res = await bestLayout(graph);
  const map = {}; absMap(res, 0, 0, map);
  const B = bounds(map);
  const d = new Doc(); const ox = 30, oy = 40;
  d.v('Vista funcional de GymTrack: diagrama de componentes (puertos e interfaces)', TITLE, 30, 0, 900, 26);
  const id = {};
  const node = (k, label, style, parentKey) => {
    const m = map[k]; const par = parentKey ? id[parentKey] : '1';
    const x = parentKey ? m.rx : m.x + ox, y = parentKey ? m.ry : m.y + oy;
    id[k] = d.v(label, style, x, y, m.w, m.h, par);
    return id[k];
  };
  const actor = (k, name) => node(k, name, 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontSize=12;');
  actor('aM', 'Miembro'); actor('aE', 'Entrenador');
  node('spa', '«component»<br><b>Aplicación Web (SPA)</b><br>React, en el navegador', COMP + ST.verde);
  node('api', '<b>GymTrack API</b> (una sola JVM: los componentes no son servidores)', 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=10;spacingTop=6;fontSize=13;' + ST.gris);
  node('mongo', '«component» «external system»<br><b>MongoDB</b><br>base de datos gymtrack', COMP + ST.naranja);
  comps.forEach(c => node(c.id, `«component»<br><b>${c.label}</b><br>${c.hu}`, COMP + ST.azul, 'api'));
  // círculos de los puertos
  const port = (nodeKey, p, label) => {
    const m = map[nodeKey]; const pp = (m.ports || []).find(q => q.id === p);
    const inContainer = m.parent === 'api';
    const x = (inContainer ? m.rx : m.x + ox) + pp.x, y = (inContainer ? m.ry : m.y + oy) + pp.y;
    id[p] = d.v(label, p === 'api.p' ? LOLLI.replace('ellipse', 'whiteSpace=wrap;html=1;aspect=fixed;rounded=0') : LOLLI, x, y, 18, 18, inContainer ? id.api : '1');
  };
  port('spa', 'spa.p', 'IInterfazWeb'); port('mongo', 'mongo.p', 'IPersistencia'); port('api', 'api.p', 'puerto REST');
  comps.forEach(c => port(c.id, c.id + '.p', c.iface));
  // aristas con el trazado calculado
  for (const e of res.edges) {
    const co = e.container && e.container !== 'root' ? map[e.container] : { x: 0, y: 0 }; // coordenadas relativas al contenedor de la arista
    const pts = edgePts(e).map(p => ({ x: p.x + co.x + ox, y: p.y + co.y + oy }));
    const [, s, t] = e.id.startsWith('d_') ? e.id.match(/d_(\w+)_(\w+)/) : [null, e.sources[0], e.targets[0]];
    const src = e.id.startsWith('d_') ? id[s] : id[e.sources[0]], tgt = id[e.targets[0]];
    const lbl = e.labels && e.labels[0];
    const style = e.id.startsWith('e_a') ? USE : SOCKET;
    d.e('', style, src, tgt, pts);
    if (lbl) d.v(lbl.text, LABEL, lbl.x + co.x + ox, lbl.y + co.y + oy, lbl.width, lbl.height);
  }
  d.v('Vista funcional (Bloque 5): diagrama de componentes. Cada componente agrupa las historias de usuario que resuelve y ofrece una interfaz provista (círculo). '
    + 'El semicírculo (socket) indica la interfaz requerida: «A → B» significa que A necesita la interfaz de B. El cuadro pequeño es el puerto de servicio de la API. '
    + 'Los actores usan la interfaz web. No es un diagrama de casos de uso.', NOTE, 30, B.h + oy + 30, 900, 80);
  save('2-funcional.drawio', d, '2. Vista funcional', B.w + 100, B.h + 200);
}

// ======================================================================
// helpers de clases (UML)
// ======================================================================
const LH = 15;
const CLS = 'swimlane;fontStyle=1;align=center;verticalAlign=top;horizontal=1;startSize=%S%;html=1;whiteSpace=wrap;fontSize=11;collapsible=0;';
const TXT = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=2;overflow=hidden;rotatable=0;whiteSpace=wrap;html=1;fontSize=10;';
function classBox(d, nombre, ester, attrs, ops, x, y, w, fill, abs) {
  const start = ester || abs ? 40 : 26;
  const ah = attrs.length ? attrs.length * LH + 8 : 0, oh = ops.length ? ops.length * LH + 8 : 0;
  const sep = attrs.length && ops.length ? 8 : 0;
  const h = start + ah + sep + oh;
  const head = (abs ? '«abstract»<br><i>' + nombre + '</i>' : (ester ? ester + '<br>' : '') + nombre);
  const id = d.v(head, CLS.replace('%S%', start) + fill, x, y, w, h);
  let yy = start;
  if (attrs.length) { d.v(attrs.join('<br>'), TXT, 0, yy, w, ah, id); yy += ah; }
  if (sep) { d.v('', 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;', 0, yy, w, 8, id); yy += 8; }
  if (ops.length) d.v(ops.join('<br>'), TXT, 0, yy, w, oh, id);
  return id;
}
const classH = (attrs, ops, ester) => (ester ? 40 : 26) + (attrs.length ? attrs.length * LH + 8 : 0) + (attrs.length && ops.length ? 8 : 0) + (ops.length ? ops.length * LH + 8 : 0);

// ======================================================================
// 3. LÓGICA: diagrama de clases del dominio
// ======================================================================
async function logica() {
  const W = 310;
  const C = {
    usuario: { n: 'Usuario', abs: true, a: ['-id : String', '-identificacion : String', '-correo : String', '-nombre : String'], o: ['+getId() : String', '+getIdentificacion() : String', '+getCorreo() : String', '+setCorreo(correo : String) : void', '+getNombre() : String', '+setNombre(nombre : String) : void'] },
    miembro: { n: 'Miembro', a: ['-fechaNacimiento : LocalDate', '-alturaCm : int'], o: ['+getFechaNacimiento() : LocalDate', '+getAlturaCm() : int', '+setAlturaCm(alturaCm : int) : void'] },
    entrenador: { n: 'Entrenador', a: ['-especialidad : String'], o: ['+getEspecialidad() : String'] },
    medicion: { n: 'MedicionCorporal', a: ['-id : String', '-miembroId : String', '-fecha : LocalDate', '-pesoKg : double', '-porcentajeGrasa : Double', '-cinturaCm : Double'], o: ['+getId() : String', '+getMiembroId() : String', '+getFecha() : LocalDate', '+getPesoKg() : double', '+getPorcentajeGrasa() : Double', '+getCinturaCm() : Double'] },
    objetivo: { n: 'Objetivo', a: ['-id : String', '-miembroId : String', '-ejercicioId : String', '-tipo : TipoObjetivo', '-descripcion : String', '-valorInicial : double', '-valorMeta : double', '-fechaInicio : LocalDate', '-fechaLimite : LocalDate', '-estado : EstadoObjetivo'], o: ['+estaActivo() : boolean', '+getId() : String', '+getMiembroId() : String', '+getEjercicioId() : String', '+getTipo() : TipoObjetivo', '+getDescripcion() : String', '+getValorInicial() : double', '+getValorMeta() : double', '+getFechaInicio() : LocalDate', '+getFechaLimite() : LocalDate', '+getEstado() : EstadoObjetivo', '+setEstado(estado : EstadoObjetivo) : void'] },
    sesion: { n: 'SesionEntrenamiento', a: ['-id : String', '-miembroId : String', '-rutinaId : String', '-fecha : LocalDate', '-duracionMinutos : int', '-notas : String', '-series : List<RegistroSerie>'], o: ['+getId() : String', '+getMiembroId() : String', '+getRutinaId() : String', '+getFecha() : LocalDate', '+getDuracionMinutos() : int', '+getNotas() : String', '+getSeries() : List<RegistroSerie>'] },
    asignacion: { n: 'AsignacionRutina', a: ['-id : String', '-miembroId : String', '-entrenadorId : String', '-rutinaId : String', '-fechaInicio : LocalDate', '-fechaFin : LocalDate', '-estado : EstadoAsignacion'], o: ['+finalizar(hoy : LocalDate) : void', '+getId() : String', '+getMiembroId() : String', '+getEntrenadorId() : String', '+getRutinaId() : String', '+getFechaInicio() : LocalDate', '+getFechaFin() : LocalDate', '+getEstado() : EstadoAsignacion'] },
    ejercicio: { n: 'Ejercicio', a: ['-id : String', '-nombre : String', '-grupoMuscular : GrupoMuscular', '-descripcion : String'], o: ['+getId() : String', '+getNombre() : String', '+getGrupoMuscular() : GrupoMuscular', '+getDescripcion() : String'] },
    registro: { n: 'RegistroSerie', a: ['-numeroSerie : int', '-ejercicioId : String', '-repeticiones : int', '-pesoKg : double'], o: ['+getNumeroSerie() : int', '+getEjercicioId() : String', '+getRepeticiones() : int', '+getPesoKg() : double'] },
    rutina: { n: 'Rutina', a: ['-id : String', '-nombre : String', '-descripcion : String', '-nivel : NivelRutina', '-entrenadorId : String', '-ejercicios : List<EjercicioPrescrito>'], o: ['+getId() : String', '+getNombre() : String', '+getDescripcion() : String', '+getNivel() : NivelRutina', '+getEntrenadorId() : String', '+getEjercicios() : List<EjercicioPrescrito>'] },
    prescrito: { n: 'EjercicioPrescrito', a: ['-orden : int', '-dia : DiaSemana', '-ejercicioId : String', '-series : int', '-repeticiones : int', '-descansoSegundos : int'], o: ['+getOrden() : int', '+getDia() : DiaSemana', '+getEjercicioId() : String', '+getSeries() : int', '+getRepeticiones() : int', '+getDescansoSegundos() : int'] },
  };
  const rels = [['miembro', 'objetivo', 'define', '1', '0..*'], ['objetivo', 'ejercicio', 'se mide en', '0..*', '0..1'], ['entrenador', 'rutina', 'diseña', '1', '0..*'],
    ['rutina', 'prescrito', 'contiene', '1', '1..*', true], ['prescrito', 'ejercicio', 'corresponde a', '0..*', '1'], ['miembro', 'asignacion', 'recibe', '1', '0..*'],
    ['entrenador', 'asignacion', 'asigna', '1', '0..*'], ['asignacion', 'rutina', 'corresponde a', '0..*', '1'], ['miembro', 'sesion', 'realiza', '1', '0..*'],
    ['sesion', 'rutina', 'sigue a', '0..*', '0..1'], ['sesion', 'registro', 'se compone de', '1', '1..*', true], ['registro', 'ejercicio', 'corresponde a', '0..*', '1'],
    ['miembro', 'medicion', 'registra', '1', '0..*']];
  const lab = (text, place) => ({ text, ...lblSize(text), layoutOptions: { 'elk.edgeLabels.placement': place } });
  const graph = { id: 'root', layoutOptions: { ...LAYERED, 'elk.spacing.nodeNode': '70', 'elk.layered.spacing.nodeNodeBetweenLayers': '110', 'elk.layered.edgeLabels.sideSelection': 'ALWAYS_UP', 'elk.padding': '[top=40,left=30,bottom=20,right=30]' },
    children: Object.keys(C).map(k => ({ id: k, width: W, height: classH(C[k].a, C[k].o, C[k].abs) })), edges: [] };
  graph.edges.push({ id: 'g_miembro', sources: ['usuario'], targets: ['miembro'] }, { id: 'g_entrenador', sources: ['usuario'], targets: ['entrenador'] });
  rels.forEach((r, i) => graph.edges.push({ id: 'a' + i, sources: [r[0]], targets: [r[1]], labels: [lab(r[2], 'CENTER'), lab(r[3], 'TAIL'), lab(r[4], 'HEAD')] }));
  const res = await bestLayout(graph);
  const map = {}; absMap(res, 0, 0, map); const B = bounds(map);
  const d = new Doc(); const ox = 30, oy = 40;
  d.v('Vista lógica de GymTrack: diagrama de clases', TITLE, 30, 0, 900, 26);
  const id = {};
  for (const k of Object.keys(C)) id[k] = classBox(d, C[k].n, '', C[k].a, C[k].o, map[k].x + ox, map[k].y + oy, W, ST.azul, C[k].abs);
  const arrow = 'html=1;rounded=0;';
  for (const e of res.edges) {
    const pts = edgePts(e).map(p => ({ x: p.x + ox, y: p.y + oy }));
    if (e.id.startsWith('g_')) { // herencia: la flecha apunta a la superclase (se invierte el trazado)
      d.e('', arrow + 'endArrow=block;endFill=0;', id[e.targets[0]], id[e.sources[0]], pts.reverse());
      continue;
    }
    const r = rels[+e.id.slice(1)];
    d.e('', arrow + (r[5] ? 'startArrow=diamondThin;startFill=1;startSize=14;endArrow=open;endFill=0;' : 'endArrow=open;endFill=0;'), id[r[0]], id[r[1]], pts);
    (e.labels || []).forEach(l => d.v(l.text, LABEL, l.x + ox, l.y + oy, l.width, l.height));
  }
  // enumeraciones agrupadas debajo
  const gy = B.h + oy + 50;
  const grp = d.v('Enumeraciones (tipos de los atributos)', 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=8;fontStyle=1;' + ST.gris, 30, gy, Math.max(B.w, 1500), 250);
  const en = (n, x, vals) => {
    const h = 40 + vals.length * LH + 8;
    const eid = d.v('«enumeration»<br><b>' + n + '</b>', 'swimlane;fontStyle=0;align=center;verticalAlign=top;horizontal=1;startSize=40;html=1;whiteSpace=wrap;fontSize=12;' + ST.verde, x, 40, 230, h, grp);
    d.v(vals.join('<br>'), TXT.replace('fontSize=10', 'fontSize=11'), 0, 40, 230, vals.length * LH + 8, eid);
  };
  en('TipoObjetivo', 30, ['PESO_CORPORAL', 'FRECUENCIA_SEMANAL', 'FUERZA_EJERCICIO']);
  en('EstadoObjetivo', 300, ['ACTIVO', 'CUMPLIDO', 'CANCELADO']);
  en('GrupoMuscular', 570, ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'CORE']);
  en('NivelRutina', 840, ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']);
  en('DiaSemana', 1110, ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']);
  en('EstadoAsignacion', 1380, ['ACTIVA', 'FINALIZADA']);
  d.v('Vista lógica: diagrama de clases del modelo con atributos tipados y operaciones (reflejo del paquete model del backend). Rombo relleno = composición (la parte nace y muere con el todo); triángulo hueco = herencia. Las referencias por id (miembroId, ejercicioId...) materializan las asociaciones en MongoDB; composición = documento embebido.', NOTE, 30, gy + 280, 1100, 70);
  save('3-logica-clases.drawio', d, '3. Vista lógica - Diagrama de clases', Math.max(B.w, 1560) + 100, gy + 400);
}

// ======================================================================
// 4. DESARROLLO: clases reales y dependencias (backend + frontend)
// ======================================================================
async function desarrollo() {
  const N = {}; // key -> {n, e (estereotipo), o (líneas), w, fill, list}
  const cls = (k, n, e, o, w, fill) => { N[k] = { n, e, o, w, fill, h: classH([], o, e) }; };
  const box = (k, titulo, lineas, w, fill) => { N[k] = { n: titulo, box: true, lineas, w, fill, h: 34 + lineas.length * LH + 10 }; };
  // backend
  const ctrlOps = { usuario: ['+registrarMiembro()', '+registrarEntrenador()', '+listarMiembros()', '+listarEntrenadores()', '+obtenerMiembro()', '+obtenerEntrenador()', '+actualizarMiembro()'],
    ejercicio: ['+listar(grupoMuscular)', '+obtener(id)', '+crear(req)'], objetivo: ['+definir(miembroId, req)', '+listar(miembroId, estado)', '+obtener(id)', '+cambiarEstado(id, req)'],
    progreso: ['+panel(miembroId)', '+progresoDeObjetivo(id)'], rutina: ['+crear(req)', '+listar()', '+detalle(id)', '+asignar(miembroId, req)', '+historial(miembroId)', '+rutinaActiva(miembroId)'],
    sesion: ['+registrar(miembroId, req)', '+historial(miembroId)', '+detalle(id)'], medicion: ['+registrar(miembroId, req)', '+listar(miembroId)'] };
  const cap = s => s[0].toUpperCase() + s.slice(1);
  Object.keys(ctrlOps).forEach(k => cls('c_' + k, cap(k) + 'Controller', '«@RestController»', ctrlOps[k], 230, ST.azul));
  const svcOps = { usuario: ['+crearMiembro()', '+crearEntrenador()', '+actualizarMiembro()', '+listarMiembros()', '+listarEntrenadores()', '+requerirMiembro()', '+requerirEntrenador()', '+nombres()'],
    ejercicio: ['+listar(grupo)', '+obtener(id)', '+crear(req)', '+nombres(ids)'], objetivo: ['+crear(miembroId, req)', '+listar(miembroId, estado)', '+obtener(id)', '+cambiarEstado(id, nuevo)'],
    progreso: ['+progresoDe(objetivo)', '+porcentaje(ini, meta, actual)', '+objetivosConProgreso()', '+responder(objetivo)', '+panel(miembroId)'],
    rutina: ['+crear(req)', '+listar()', '+detalle(id)', '+asignar(miembroId, req)', '+historial(miembroId)', '+rutinaActiva(miembroId)', '+resumenActiva(miembroId)'],
    sesion: ['+registrar(miembroId, req)', '+historial(miembroId)', '+detalle(id)', '+contarDelMes(miembroId)', '+ultima(miembroId)'], medicion: ['+registrar(miembroId, req)', '+listar(miembroId)', '+ultimasDos(miembroId)'] };
  // dependencias servicio -> servicio: se listan dentro de la clase ("usa: ...") para no saturar el diagrama de flechas
  const svcUses = { ejercicio: ['Usuario'], medicion: ['Usuario'], objetivo: ['Usuario', 'Ejercicio'], rutina: ['Usuario', 'Ejercicio'], sesion: ['Usuario', 'Ejercicio', 'Rutina'],
    progreso: ['Objetivo', 'Sesion', 'Medicion', 'Rutina', 'Usuario'] };
  Object.keys(svcOps).forEach(k => cls('s_' + k, cap(k) + 'Service', '«@Service»',
    svcUses[k] ? [...svcOps[k], '<i>usa: ' + svcUses[k].map(u => u + 'Service').join(', ') + '</i>'] : svcOps[k], 230, ST.verde));
  cls('estr', 'EstrategiaProgreso', '«interface»', ['+soporta(): TipoObjetivo', '+valorActual(objetivo): double'], 260, ST.morado);
  cls('peso', 'PesoCorporalStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 230, ST.morado);
  cls('frec', 'FrecuenciaSemanalStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 230, ST.morado);
  cls('fuer', 'FuerzaEjercicioStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 230, ST.morado);
  const repos = ['Usuario', 'Miembro', 'Entrenador', 'Ejercicio', 'Objetivo', 'Rutina', 'AsignacionRutina', 'Sesion', 'Medicion'];
  repos.forEach(r => cls('r_' + r, r + 'Repository', '«interface»', [], 200, ST.naranja));
  box('rest', '«boundary»<br>API REST (HTTP/JSON, puerto 8080)', [], 330, ST.gris);
  N.rest.h = 56;
  // frontend
  cls('main', 'main.tsx', '', ['createRoot().render(<App/>)', 'BrowserRouter + ProveedorSesion'], 250, ST.verde);
  cls('app', 'App.tsx', '', ['+App(): rutas de la SPA', 'rutas protegidas por rol'], 230, ST.verde);
  cls('layout', 'Layout.tsx', '', ['+Layout(): menú y salida'], 230, ST.verde);
  cls('ruta', 'RutaProtegida.tsx', '', ['+RutaProtegida(rol, children)'], 230, ST.verde);
  cls('ctx', 'state/SesionContext.tsx', '', ['-perfil: Perfil {id, nombre, rol}', '+ProveedorSesion()', '+useSesion(): Contexto'], 270, ST.verde);
  cls('async', 'state/useAsync.ts', '', ['+useAsync(cargar, deps)', '→ {datos, error, cargando}'], 250, ST.verde);
  box('pages', 'pages (12 pantallas, una por historia de usuario)', ['SeleccionPerfil · Registro · Perfil · Panel', 'Objetivos · Catalogo · Rutinas · CrearRutina', 'AsignarRutina · RegistrarSesion · Historial · Mediciones'], 330, ST.verde);
  box('comps', 'components', ['Campo · BarraProgreso', 'GraficaLinea · Estado (Cargando, Vacio, ErrorCaja)'], 300, ST.verde);
  box('utils', 'utils', ['fechas.ts: hoy · sumarDias · lunesDe · formatear', 'numeros.ts: aNumero(texto)'], 300, ST.verde);
  box('types', 'types/index.ts', ['interfaces TypeScript de los DTO', '(Miembro, Ejercicio, Objetivo, Rutina,', 'Sesion, Medicion, Panel…)'], 270, ST.verde);
  cls('idx', 'api/index.ts · campos.ts · progreso.ts', '', ['api: GymApi (http o mock)', 'analizarError() · porcentaje()'], 300, ST.verde);
  cls('gym', 'GymApi (api/contrato.ts)', '«interface»', ['+listarMiembros() · crearMiembro()', '+listarEjercicios() · crearEjercicio()', '+crearObjetivo() · cambiarEstado()', '+crearRutina() · asignar() · rutinaActiva()', '+registrarSesion() · historial()', '+registrarMedicion() · panel()'], 300, ST.morado);
  cls('http', 'crearHttp (api/http.ts)', '', ['fetch → API REST real', 'convierte errores en ApiError'], 260, ST.verde);
  cls('mock', 'crearMock (api/mock.ts)', '', ['datos en memoria', 'modo demo VITE_USE_MOCK'], 260, ST.verde);
  cls('apierr', 'ApiError (api/error.ts)', '', ['+status, +errores[]', '+textoDeError(e)'], 260, ST.verde);

  const edges = []; // [src, tgt, tipo, etiqueta]
  const D = (a, b, l) => edges.push([a, b, 'dep', l]), R = (a, b) => edges.push([a, b, 'real']), RED = (a, b, l) => edges.push([a, b, 'red', l]);
  Object.keys(ctrlOps).forEach(k => D('rest', 'c_' + k));
  [['usuario', ['usuario']], ['ejercicio', ['ejercicio']], ['objetivo', ['objetivo', 'progreso']], ['progreso', ['progreso', 'objetivo']], ['rutina', ['rutina']], ['sesion', ['sesion']], ['medicion', ['medicion']]]
    .forEach(([c, ss]) => ss.forEach(s => D('c_' + c, 's_' + s)));
  // (las dependencias servicio -> servicio van como texto "usa: ..." dentro de cada clase)
  D('s_progreso', 'estr');
  [['usuario', 'Usuario'], ['usuario', 'Miembro'], ['usuario', 'Entrenador'], ['ejercicio', 'Ejercicio'], ['objetivo', 'Objetivo'], ['rutina', 'Rutina'], ['rutina', 'AsignacionRutina'], ['sesion', 'Sesion'], ['medicion', 'Medicion']]
    .forEach(([s, r]) => D('s_' + s, 'r_' + r));
  ['peso', 'frec', 'fuer'].forEach(s => R(s, 'estr'));
  D('peso', 'r_Medicion'); D('frec', 'r_Sesion'); D('fuer', 'r_Sesion');
  D('main', 'app'); D('main', 'ctx'); D('app', 'layout'); D('app', 'ruta'); D('app', 'pages'); D('ruta', 'ctx'); D('layout', 'ctx');
  D('pages', 'idx'); D('pages', 'comps'); D('pages', 'ctx'); D('pages', 'async'); D('pages', 'utils'); D('pages', 'types');
  D('idx', 'gym'); D('idx', 'http'); D('idx', 'mock'); R('http', 'gym'); R('mock', 'gym'); D('http', 'apierr');
  RED('http', 'rest', 'HTTP/JSON (REST), solo en ejecución');

  // particiones: fuerzan el orden de capas frontend -> API REST -> controller -> service -> strategy -> repository
  const part = k => k === 'rest' ? 1 : k.startsWith('c_') ? 2 : k.startsWith('s_') ? 3 : ['estr', 'peso', 'frec', 'fuer'].includes(k) ? 4 : k.startsWith('r_') ? 5 : 0;
  const graph = { id: 'root', layoutOptions: { ...LAYERED, 'elk.partitioning.activate': 'true', 'elk.spacing.nodeNode': '45', 'elk.layered.spacing.nodeNodeBetweenLayers': '80', 'elk.layered.edgeLabels.sideSelection': 'ALWAYS_UP' },
    children: Object.keys(N).map(k => ({ id: k, width: N[k].w, height: N[k].h, layoutOptions: { 'elk.partitioning.partition': String(part(k)) } })), edges: [] };
  edges.forEach((e, i) => graph.edges.push({ id: 'x' + i, sources: [e[0]], targets: [e[1]], labels: e[3] ? [{ text: e[3], ...lblSize(e[3]), layoutOptions: { 'elk.edgeLabels.placement': 'CENTER' } }] : [] }));
  const res = await bestLayout(graph);
  const map = {}; absMap(res, 0, 0, map); const B = bounds(map);
  const d = new Doc(); const ox = 30, oy = 40;
  d.v('Vista de desarrollo de GymTrack: clases y dependencias (backend Spring Boot y frontend React)', TITLE, 30, 0, 1200, 26);
  const id = {};
  for (const k of Object.keys(N)) {
    const n = N[k], m = map[k];
    if (n.box) {
      const bid = d.v(n.n, 'swimlane;fontStyle=1;align=center;verticalAlign=top;horizontal=1;startSize=' + (k === 'rest' ? 56 : 34) + ';html=1;whiteSpace=wrap;fontSize=11;collapsible=0;' + n.fill, m.x + ox, m.y + oy, n.w, n.h);
      if (n.lineas.length) d.v(n.lineas.join('<br>'), TXT.replace('fontSize=10', 'fontSize=11'), 0, 34, n.w, n.lineas.length * LH + 10, bid);
      id[k] = bid;
    } else {
      const start = n.e ? 40 : 26;
      const cid = d.v((n.e ? n.e + '<br>' : '') + n.n, CLS.replace('%S%', start) + n.fill, m.x + ox, m.y + oy, n.w, n.h);
      if (n.o.length) d.v(n.o.join('<br>'), TXT, 0, start, n.w, n.o.length * LH + 8, cid);
      id[k] = cid;
    }
  }
  const sty = { dep: 'edgeStyle=none;rounded=0;html=1;endArrow=open;endFill=0;dashed=1;', real: 'edgeStyle=none;rounded=0;html=1;endArrow=block;endFill=0;dashed=1;',
    red: 'edgeStyle=none;rounded=0;html=1;endArrow=open;endFill=0;dashed=1;strokeColor=#CC0000;' };
  res.edges.forEach((e, i) => {
    const ed = edges[+e.id.slice(1)];
    const pts = edgePts(e).map(p => ({ x: p.x + ox, y: p.y + oy }));
    d.e('', sty[ed[2]], id[ed[0]], id[ed[1]], pts);
    (e.labels || []).forEach(l => d.v(l.text, LABEL.replace('fillColor=#FFFFFF', 'fillColor=#FFFFFF;fontColor=#CC0000'), l.x + ox, l.y + oy, l.width, l.height));
  });
  // grupos sin dependencias dibujadas (todas las capas los usan), debajo del diagrama
  const gy = B.h + oy + 50;
  const group = (t, lines, x, w, fill) => { const h = 34 + lines.length * LH + 10; const gid = d.v(t, 'swimlane;fontStyle=1;align=center;verticalAlign=top;horizontal=1;startSize=34;html=1;whiteSpace=wrap;fontSize=11;collapsible=0;' + fill, x, gy, w, h); d.v(lines.join('<br>'), TXT.replace('fontSize=10', 'fontSize=11'), 0, 34, w, lines.length * LH + 10, gid); };
  group('model (dominio)', ['Usuario (abstracta), Miembro, Entrenador', 'Objetivo, Ejercicio, Rutina, EjercicioPrescrito', 'AsignacionRutina, SesionEntrenamiento, RegistroSerie', 'MedicionCorporal', 'Enumeraciones: TipoObjetivo, EstadoObjetivo,', 'GrupoMuscular, NivelRutina, DiaSemana, EstadoAsignacion'], 30, 420, ST.azul);
  group('dto (records de entrada y salida)', ['UsuarioDtos (MiembroRequest, MiembroUpdateRequest,', 'EntrenadorRequest, MiembroResponse, EntrenadorResponse)', 'EjercicioDtos · ObjetivoDtos · RutinaDtos', 'SesionDtos · MedicionDtos · PanelDtos', 'ErrorResponse (cuerpo estándar de error)'], 490, 420, ST.azul);
  group('exception', ['GlobalExceptionHandler (@RestControllerAdvice)', 'RecursoNoEncontradoException → 404', 'ConflictoException → 409', 'ReglaDeNegocioException → 400', 'OperacionNoPermitidaException → 403'], 950, 380, ST.azul);
  group('config', ['GymTrackApplication (main)', 'ClockConfig (Clock inyectable)', 'CorsConfig (orígenes 5173 y 4173)', 'DataSeeder (datos de ejemplo al arrancar)'], 1370, 380, ST.azul);
  d.v('Vista de desarrollo: organización del código. Azul = backend (Controller → Service → Repository; el dominio model no es una capa), morado = patrón Strategy, naranja = repositorios Spring Data, verde = frontend. '
    + 'Las flechas van en un solo sentido y sin ciclos. La flecha roja es la única unión entre repositorios: ocurre en ejecución (HTTP/JSON), no en compilación. '
    + 'Triángulo hueco discontinuo = realiza una interfaz. Los grupos de abajo (model, dto, exception, config) los usan todas las capas y no se dibujan con flechas para no saturar el diagrama.', NOTE, 30, gy + 220, 1500, 80);
  save('4-desarrollo.drawio', d, '4. Vista de desarrollo', Math.max(B.w, 1800) + 100, gy + 360);
}

(async () => { contexto(); await funcional(); await logica(); await desarrollo(); })().catch(e => { console.error(e); process.exit(1); });
