// Genera los diagramas editables (.drawio) de GymTrack que se importan en Visual Paradigm Online.
// Uso: node generar-editables.js   (escribe 5a-... y 5b-... en esta carpeta)
// Las vistas 1 a 4 (contexto, funcional, lógica y desarrollo) las genera generar-vistas.js.
const fs = require('fs');
const path = require('path');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ST = { azul: 'fillColor=#DAE8FC;strokeColor=#6C8EBF;', verde: 'fillColor=#D5E8D4;strokeColor=#82B366;',
  naranja: 'fillColor=#FFE6CC;strokeColor=#D79B00;', gris: 'fillColor=#F5F5F5;strokeColor=#666666;',
  amarillo: 'fillColor=#FFF2CC;strokeColor=#D6B656;' };

class Doc {
  constructor() { this.n = 1; this.cells = []; }
  id() { return 'c' + (this.n++); }
  v(label, style, x, y, w, h, parent = '1', extra = '') {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}" vertex="1" parent="${parent}"${extra}><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
    return i;
  }
  e(label, style, src, tgt, parent = '1') {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(label || '')}" style="${style}" edge="1" parent="${parent}" source="${src}" target="${tgt}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
    return i;
  }
  // etiqueta pegada a una arista (multiplicidades)
  lab(text, edgeId, pos, dy) {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(text)}" style="edgeLabel;resizable=0;html=1;align=center;verticalAlign=middle;fontSize=11;labelBackgroundColor=#FFFFFF;" connectable="0" vertex="1" parent="${edgeId}"><mxGeometry x="${pos}" relative="1" as="geometry"><mxPoint x="0" y="${dy}" as="offset"/></mxGeometry></mxCell>`);
  }
  xml(name, w = 1800, h = 1200) {
    return `<mxfile host="app.diagrams.net"><diagram id="d" name="${esc(name)}"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${w}" pageHeight="${h}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${this.cells.join('')}</root></mxGraphModel></diagram></mxfile>`;
  }
}
const save = (file, d, name, w, h) => { fs.writeFileSync(path.join(__dirname, file), d.xml(name, w, h), 'utf8'); console.log('ok', file, d.cells.length, 'celdas'); };
const TITLE = 'text;html=1;fontSize=16;fontStyle=1;align=left;';
const NOTE = 'shape=note;whiteSpace=wrap;html=1;align=left;spacing=8;fontSize=11;' + ST.amarillo;
const LINE = 'endArrow=none;html=1;rounded=0;fontSize=11;labelBackgroundColor=#FFFFFF;';
const DEP = 'endArrow=open;endFill=0;dashed=1;html=1;rounded=0;fontSize=11;labelBackgroundColor=#FFFFFF;';

// ============ 5a / 5b. DESPLIEGUE ============
const CUBE = 'shape=cube;whiteSpace=wrap;html=1;boundedLbl=1;backgroundOutline=1;darkOpacity=0.05;darkOpacity2=0.1;size=14;verticalAlign=top;fontSize=12;';
const ART = 'shape=note;whiteSpace=wrap;html=1;backgroundOutline=1;darkOpacity=0.05;fontSize=12;' + ST.amarillo;
(function despliegue5a() {
  const d = new Doc();
  d.v('Vista de despliegue 5a: demostración local (todo en el computador)', TITLE, 30, 0, 900, 26);
  const pc = d.v('«device»<br><b>Computador del estudiante</b>', CUBE + ST.gris, 30, 40, 1000, 640);
  const nav = d.v('«executionEnvironment»<br><b>Navegador</b>', CUBE + ST.verde, 330, 60, 340, 90, pc);
  const nodeEe = d.v('«executionEnvironment»<br><b>Node.js</b>', CUBE + ST.azul, 40, 240, 330, 170, pc);
  d.v('«artifact»<br><b>gymtrack-web</b><br>SPA, vite preview', ART, 40, 70, 250, 70, nodeEe);
  const jvm = d.v('«executionEnvironment»<br><b>JVM (Java 17+)</b>', CUBE + ST.azul, 430, 240, 520, 170, pc);
  d.v('«artifact»<br><b>gymtrack-api.jar</b><br>Controller + Service + Repository (una sola JVM)', ART, 40, 70, 440, 70, jvm);
  const mongo = d.v('«executionEnvironment»<br><b>MongoDB Server local</b>', CUBE + ST.naranja, 330, 470, 340, 140, pc);
  d.v('«artifact»<br><b>base de datos gymtrack</b>', ART, 40, 60, 260, 60, mongo);
  d.e('HTTP 4173', LINE, nav, nodeEe);
  d.e('HTTP/JSON 8080', LINE, nav, jvm);
  d.e('protocolo MongoDB 27017', LINE, jvm, mongo);
  d.v('5a: primer despliegue del material (todo en el computador). Controller, Service y Repository no son nodos: corren juntos dentro de gymtrack-api.jar.', NOTE, 30, 720, 760, 50);
  save('5a-despliegue-demostracion.drawio', d, '5a. Despliegue demostración', 1100, 820);
})();
(function despliegue5b() {
  const d = new Doc();
  d.v('Vista de despliegue 5b: escenario objetivo (hipotético)', TITLE, 30, 0, 900, 26);
  const user = d.v('«device»<br><b>Equipo del usuario</b>', CUBE + ST.gris, 30, 60, 380, 330);
  const nav = d.v('«executionEnvironment»<br><b>Navegador</b>', CUBE + ST.verde, 30, 70, 320, 220, user);
  d.v('«artifact»<br><b>gymtrack-web</b><br>SPA', ART, 30, 90, 260, 80, nav);
  const srv = d.v('«device»<br><b>Servidor de aplicación</b>', CUBE + ST.gris, 560, 60, 420, 330);
  const jvm = d.v('«executionEnvironment»<br><b>JVM (Java 17+)</b>', CUBE + ST.azul, 30, 70, 360, 220, srv);
  d.v('«artifact»<br><b>gymtrack-api.jar</b><br>incluye la SPA estática', ART, 30, 90, 300, 80, jvm);
  const atlas = d.v('«device»<br><b>MongoDB Atlas</b>', CUBE + ST.gris, 1130, 60, 380, 330);
  const mdb = d.v('«executionEnvironment»<br><b>MongoDB</b>', CUBE + ST.naranja, 30, 70, 320, 220, atlas);
  d.v('«artifact»<br><b>base de datos gymtrack</b>', ART, 30, 90, 260, 80, mdb);
  d.e('HTTPS', LINE, user, srv);
  d.e('MongoDB sobre TLS', LINE, srv, atlas);
  d.v('5b: tercer despliegue del material (API en un servidor y MongoDB Atlas con TLS). Cambia dónde corre la API, no sus clases ni capas. Atlas queda fuera de la JVM.', NOTE, 30, 430, 760, 50);
  save('5b-despliegue-objetivo.drawio', d, '5b. Despliegue objetivo', 1600, 560);
})();

