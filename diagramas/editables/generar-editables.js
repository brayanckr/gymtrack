// Genera los diagramas editables (.drawio) de GymTrack que se importan en Visual Paradigm Online.
// Uso: node generar-editables.js   (escribe 3-logica-clases, 5a-... y 5b-... en esta carpeta)
// Las vistas 1 (contexto), 2 (funcional) y 4 (desarrollo) las genera generar-vistas.js.
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

// ============ 3. LÓGICA: diagrama de clases ============
(function logica() {
  const d = new Doc();
  d.v('Vista lógica de GymTrack: diagrama de clases', TITLE, 30, 0, 900, 26);
  const W = 310, LH = 18;
  const CL = 'swimlane;fontStyle=1;align=center;verticalAlign=top;childLayout=stackLayout;horizontal=1;startSize=26;horizontalStack=0;resizeParent=1;resizeParentMax=0;resizeLast=0;collapsible=0;marginBottom=0;html=1;' + ST.azul;
  const TXT = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=4;overflow=hidden;rotatable=0;whiteSpace=wrap;html=1;fontSize=12;';
  const DIV = 'line;strokeWidth=1;fillColor=none;align=left;verticalAlign=middle;spacingTop=-1;spacingLeft=3;spacingRight=3;rotatable=0;labelPosition=right;points=[];portConstraint=eastwest;strokeColor=inherit;';
  const clase = (nombre, abs, cx, y, attrs, ops) => {
    const ah = attrs.length * LH + 8, oh = ops.length * LH + 8;
    const id = d.v(abs ? '«abstract»<br>' + nombre : nombre, CL.replace('fontStyle=1', abs ? 'fontStyle=3' : 'fontStyle=1'), cx - W / 2, y, W, 26 + ah + 8 + oh);
    d.v(attrs.map(a => a.replace(/:/, ' : ')).join('<br>'), TXT, 0, 26, W, ah, id);
    d.v('', DIV, 0, 26 + ah, W, 8, id);
    d.v(ops.map(o => o.replace(/\):/, ') : ')).join('<br>'), TXT, 0, 26 + ah + 8, W, oh, id);
    return id;
  };
  const usuario = clase('Usuario', true, 1010, 40, ['-id:String', '-identificacion:String', '-correo:String', '-nombre:String'],
    ['+getId():String', '+getIdentificacion():String', '+getCorreo():String', '+setCorreo(correo:String):void', '+getNombre():String', '+setNombre(nombre:String):void']);
  const miembro = clase('Miembro', false, 500, 320, ['-fechaNacimiento:LocalDate', '-alturaCm:int'],
    ['+getFechaNacimiento():LocalDate', '+getAlturaCm():int', '+setAlturaCm(alturaCm:int):void']);
  const entrenador = clase('Entrenador', false, 1520, 320, ['-especialidad:String'], ['+getEspecialidad():String']);
  const medicion = clase('MedicionCorporal', false, 160, 580, ['-id:String', '-miembroId:String', '-fecha:LocalDate', '-pesoKg:double', '-porcentajeGrasa:Double', '-cinturaCm:Double'],
    ['+getId():String', '+getMiembroId():String', '+getFecha():LocalDate', '+getPesoKg():double', '+getPorcentajeGrasa():Double', '+getCinturaCm():Double']);
  const objetivo = clase('Objetivo', false, 500, 580, ['-id:String', '-miembroId:String', '-ejercicioId:String', '-tipo:TipoObjetivo', '-descripcion:String', '-valorInicial:double', '-valorMeta:double', '-fechaInicio:LocalDate', '-fechaLimite:LocalDate', '-estado:EstadoObjetivo'],
    ['+estaActivo():boolean', '+getId():String', '+getMiembroId():String', '+getEjercicioId():String', '+getTipo():TipoObjetivo', '+getDescripcion():String', '+getValorInicial():double', '+getValorMeta():double', '+getFechaInicio():LocalDate', '+getFechaLimite():LocalDate', '+getEstado():EstadoObjetivo', '+setEstado(estado:EstadoObjetivo):void']);
  const sesion = clase('SesionEntrenamiento', false, 840, 580, ['-id:String', '-miembroId:String', '-rutinaId:String', '-fecha:LocalDate', '-duracionMinutos:int', '-notas:String', '-series:List<RegistroSerie>'],
    ['+getId():String', '+getMiembroId():String', '+getRutinaId():String', '+getFecha():LocalDate', '+getDuracionMinutos():int', '+getNotas():String', '+getSeries():List<RegistroSerie>']);
  const asignacion = clase('AsignacionRutina', false, 1180, 580, ['-id:String', '-miembroId:String', '-entrenadorId:String', '-rutinaId:String', '-fechaInicio:LocalDate', '-fechaFin:LocalDate', '-estado:EstadoAsignacion'],
    ['+finalizar(hoy:LocalDate):void', '+getId():String', '+getMiembroId():String', '+getEntrenadorId():String', '+getRutinaId():String', '+getFechaInicio():LocalDate', '+getFechaFin():LocalDate', '+getEstado():EstadoAsignacion']);
  const ejercicio = clase('Ejercicio', false, 500, 1180, ['-id:String', '-nombre:String', '-grupoMuscular:GrupoMuscular', '-descripcion:String'],
    ['+getId():String', '+getNombre():String', '+getGrupoMuscular():GrupoMuscular', '+getDescripcion():String']);
  const registro = clase('RegistroSerie', false, 960, 1180, ['-numeroSerie:int', '-ejercicioId:String', '-repeticiones:int', '-pesoKg:double'],
    ['+getNumeroSerie():int', '+getEjercicioId():String', '+getRepeticiones():int', '+getPesoKg():double']);
  const rutina = clase('Rutina', false, 1520, 1180, ['-id:String', '-nombre:String', '-descripcion:String', '-nivel:NivelRutina', '-entrenadorId:String', '-ejercicios:List<EjercicioPrescrito>'],
    ['+getId():String', '+getNombre():String', '+getDescripcion():String', '+getNivel():NivelRutina', '+getEntrenadorId():String', '+getEjercicios():List<EjercicioPrescrito>']);
  const prescrito = clase('EjercicioPrescrito', false, 1200, 1560, ['-orden:int', '-dia:DiaSemana', '-ejercicioId:String', '-series:int', '-repeticiones:int', '-descansoSegundos:int'],
    ['+getOrden():int', '+getDia():DiaSemana', '+getEjercicioId():String', '+getSeries():int', '+getRepeticiones():int', '+getDescansoSegundos():int']);

  const OR = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;fontSize=11;labelBackgroundColor=#FFFFFF;';
  d.e('', OR + 'endArrow=block;endFill=0;', miembro, usuario);
  d.e('', OR + 'endArrow=block;endFill=0;', entrenador, usuario);
  // asociaciones: [origen, destino, nombre, mult. origen, mult. destino, composicion]
  [[miembro, objetivo, 'define', '1', '0..*'], [objetivo, ejercicio, 'se mide en', '0..*', '0..1'], [entrenador, rutina, 'diseña', '1', '0..*'],
    [rutina, prescrito, 'contiene', '1', '1..*', true], [prescrito, ejercicio, 'corresponde a', '0..*', '1'], [miembro, asignacion, 'recibe', '1', '0..*'],
    [entrenador, asignacion, 'asigna', '1', '0..*'], [asignacion, rutina, 'corresponde a', '0..*', '1'], [miembro, sesion, 'realiza', '1', '0..*'],
    [sesion, rutina, 'sigue a', '0..*', '0..1'], [sesion, registro, 'se compone de', '1', '1..*', true], [registro, ejercicio, 'corresponde a', '0..*', '1'],
    [miembro, medicion, 'registra', '1', '0..*']].forEach(([a, b, n, ma, mb, comp]) => {
    const e = d.e(n, OR + (comp ? 'startArrow=diamondThin;startFill=1;startSize=14;endArrow=open;endFill=0;' : 'endArrow=open;endFill=0;'), a, b);
    d.lab(ma, e, -0.85, -12); d.lab(mb, e, 0.85, -12);
  });

  // Enumeraciones agrupadas (tipos de los atributos)
  const grp = d.v('Enumeraciones (tipos de los atributos)', 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=8;fontStyle=1;' + ST.gris, 30, 1960, 1880, 250);
  const en = (n, x, vals) => {
    const h = 40 + vals.length * LH + 8;
    const id = d.v('«enumeration»<br><b>' + n + '</b>', 'swimlane;fontStyle=0;align=center;verticalAlign=top;horizontal=1;startSize=40;html=1;whiteSpace=wrap;fontSize=12;' + ST.verde, x, 40, 230, h, grp);
    d.v(vals.join('<br>'), TXT, 0, 40, 230, vals.length * LH + 8, id);
  };
  en('TipoObjetivo', 30, ['PESO_CORPORAL', 'FRECUENCIA_SEMANAL', 'FUERZA_EJERCICIO']);
  en('EstadoObjetivo', 300, ['ACTIVO', 'CUMPLIDO', 'CANCELADO']);
  en('GrupoMuscular', 570, ['PECHO', 'ESPALDA', 'PIERNAS', 'HOMBROS', 'BRAZOS', 'CORE']);
  en('NivelRutina', 840, ['PRINCIPIANTE', 'INTERMEDIO', 'AVANZADO']);
  en('DiaSemana', 1110, ['LUNES', 'MARTES', 'MIERCOLES', 'JUEVES', 'VIERNES', 'SABADO', 'DOMINGO']);
  en('EstadoAsignacion', 1380, ['ACTIVA', 'FINALIZADA']);
  d.v('Vista lógica: diagrama de clases del modelo con atributos tipados y operaciones (reflejo del paquete model del backend). Rombo relleno = composición (la parte nace y muere con el todo); triángulo hueco = herencia. Las referencias por id (miembroId, ejercicioId...) materializan las asociaciones en MongoDB; composición = documento embebido.', NOTE, 30, 2260, 1100, 70);
  save('3-logica-clases.drawio', d, '3. Vista lógica - Diagrama de clases', 2000, 2400);
})();
