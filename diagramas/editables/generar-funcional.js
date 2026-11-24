// Genera 2-funcional.drawio: vista funcional de GymTrack como DIAGRAMA DE COMPONENTES (UML).
// Uso: node generar-funcional.js 2-funcional.drawio
// El .drawio se importa en Visual Paradigm Online (Drive > Import) y queda con formas editables.
const fs = require('fs');
const out = process.argv[2] || '2-funcional.drawio';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
let n = 1;
const cells = [];
const id = () => 'c' + (n++);

const C = {
  azul: 'fillColor=#DAE8FC;strokeColor=#6C8EBF;',
  verde: 'fillColor=#D5E8D4;strokeColor=#82B366;',
  naranja: 'fillColor=#FFE6CC;strokeColor=#D79B00;',
  gris: 'fillColor=#F5F5F5;strokeColor=#666666;',
};

function vertex(label, style, x, y, w, h, parent = '1') {
  const i = id();
  cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
  return i;
}
function edge(label, style, src, tgt, parent = '1') {
  const i = id();
  cells.push(`<mxCell id="${i}" value="${esc(label || '')}" style="${style}" edge="1" parent="${parent}" source="${src}" target="${tgt}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
  return i;
}

const COMP = 'shape=component;align=left;spacingLeft=36;whiteSpace=wrap;html=1;fontSize=12;verticalAlign=middle;';
const DEP = 'endArrow=open;endFill=0;dashed=1;html=1;rounded=0;fontSize=11;';
const LOLLI = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;labelPosition=left;verticalLabelPosition=middle;align=right;verticalAlign=middle;fontSize=11;spacingRight=4;';

// Titulo
vertex('Vista funcional de GymTrack: diagrama de componentes', 'text;html=1;fontSize=16;fontStyle=1;align=left;', 30, 0, 700, 26);

// Cliente
const spa = vertex('«component»<br><b>Aplicación Web (SPA)</b><br>React, ejecutada en el navegador', COMP + C.verde, 380, 40, 400, 80);

// Frontera del sistema: la API
const AX = 30, AY = 190;
const api = vertex('<b>GymTrack API</b> (una sola JVM: los componentes no son servidores)', 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=10;spacingTop=6;fontSize=13;' + C.gris, AX, AY, 1180, 610);

// Componentes dentro de la API (coordenadas absolutas -> relativas al contenedor)
function comp(label, hu, x, y, w, h, iface) {
  const cid = vertex(`«component»<br><b>${label}</b><br>${hu}`, COMP + C.azul, x - AX, y - AY, w, h, api);
  const lid = vertex(iface, LOLLI, x - AX + w / 2 - 9, y - AY - 9, 18, 18, api);
  edge('', 'endArrow=none;html=1;', cid, lid, api);
  return { cid, lid };
}
const progreso = comp('Seguimiento de Progreso', 'HU-05, 17', 470, 250, 270, 86, 'IProgreso');
const objetivos = comp('Gestión de Objetivos', 'HU-04, 05, 06', 60, 440, 250, 86, 'IObjetivos');
const entrenos = comp('Registro de Entrenamientos', 'HU-13, 14', 340, 440, 270, 86, 'IEntrenamientos');
const rutinas = comp('Gestión de Rutinas', 'HU-09, 10, 11, 12', 640, 440, 270, 86, 'IRutinas');
const mediciones = comp('Seguimiento Corporal', 'HU-15, 16', 940, 440, 250, 86, 'IMediciones');
const usuarios = comp('Gestión de Usuarios', 'HU-01, 02, 03', 190, 640, 270, 86, 'IUsuarios');
const catalogo = comp('Catálogo de Ejercicios', 'HU-07, 08', 760, 640, 270, 86, 'ICatalogo');

// Puerto de entrada REST de la frontera (centro x=605, borde superior y=190)
const puertoRest = vertex('IApiRest', LOLLI, 605 - AX - 9, -9, 18, 18, api);
const mongo = vertex('«component» «external system»<br><b>MongoDB</b><br>base de datos gymtrack', COMP + C.naranja, 440, 880, 320, 80);
const ifMongo = vertex('IPersistencia', LOLLI, 591, 871, 18, 18);

// Dependencias SPA -> API y API -> MongoDB
edge('HTTP / JSON (REST)', DEP + 'labelBackgroundColor=#FFFFFF;', spa, puertoRest);
edge('persiste documentos (protocolo MongoDB)', DEP + 'labelBackgroundColor=#FFFFFF;', api, ifMongo);

// Dependencias internas (cliente -> proveedor): "A usa la interfaz de B"
const dep = (a, b) => edge('', DEP, a.cid, b.lid);
dep(progreso, objetivos); dep(progreso, entrenos); dep(progreso, rutinas); dep(progreso, mediciones);
dep(objetivos, usuarios); dep(objetivos, catalogo);
dep(entrenos, usuarios); dep(entrenos, catalogo); dep(entrenos, rutinas);
dep(rutinas, usuarios); dep(rutinas, catalogo);
dep(mediciones, usuarios);

// Nota
vertex('Vista funcional: cada componente agrupa las historias de usuario que resuelve y expone una interfaz (círculo). '
  + 'La flecha discontinua «A → B» significa que A usa la interfaz de B. El grafo es acíclico. '
  + 'Usuarios valida miembro/entrenador; Catálogo valida ejercicios; Rutinas aporta la rutina opcional de una sesión (RN-14); '
  + 'Progreso reúne los datos para calcular el avance (RN-07). No es un diagrama de casos de uso.',
  'shape=note;whiteSpace=wrap;html=1;align=left;spacing=8;fontSize=11;fillColor=#FFF2CC;strokeColor=#D6B656;', 30, 1000, 820, 90);

const xml = `<mxfile host="app.diagrams.net"><diagram id="funcional" name="2. Vista funcional"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="1300" pageHeight="1150" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${cells.join('')}</root></mxGraphModel></diagram></mxfile>`;
fs.writeFileSync(out, xml, 'utf8');
console.log('ok', out, cells.length, 'celdas');
