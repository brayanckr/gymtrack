// Genera las vistas 1 (contexto), 2 (funcional) y 4 (desarrollo) de GymTrack siguiendo el "Modelo de presentación de diseño":
//   1. Diagrama de contexto: sistema (círculo) + entidades externas (rectángulos) + flujos de datos etiquetados.
//   2. Diagrama de componentes funcional: componentes, puertos, interfaces provistas (lollipop) y requeridas (socket), actores.
//   4. Vista de desarrollo: clases reales con atributos/operaciones y dependencias discontinuas (backend y frontend).
// Uso: node generar-vistas.js
const fs = require('fs');
const path = require('path');

const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ST = { azul: 'fillColor=#DAE8FC;strokeColor=#6C8EBF;', verde: 'fillColor=#D5E8D4;strokeColor=#82B366;',
  naranja: 'fillColor=#FFE6CC;strokeColor=#D79B00;', gris: 'fillColor=#F5F5F5;strokeColor=#666666;',
  amarillo: 'fillColor=#FFF2CC;strokeColor=#D6B656;', morado: 'fillColor=#E1D5E7;strokeColor=#9673A6;' };

class Doc {
  constructor() { this.n = 1; this.cells = []; }
  id() { return 'c' + (this.n++); }
  v(label, style, x, y, w, h, parent = '1') {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(label)}" style="${style}" vertex="1" parent="${parent}"><mxGeometry x="${x}" y="${y}" width="${w}" height="${h}" as="geometry"/></mxCell>`);
    return i;
  }
  e(label, style, src, tgt, parent = '1') {
    const i = this.id();
    this.cells.push(`<mxCell id="${i}" value="${esc(label || '')}" style="${style}" edge="1" parent="${parent}" source="${src}" target="${tgt}"><mxGeometry relative="1" as="geometry"/></mxCell>`);
    return i;
  }
  xml(name, w, h) {
    return `<mxfile host="app.diagrams.net"><diagram id="d" name="${esc(name)}"><mxGraphModel dx="1200" dy="800" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="${w}" pageHeight="${h}" math="0" shadow="0"><root><mxCell id="0"/><mxCell id="1" parent="0"/>${this.cells.join('')}</root></mxGraphModel></diagram></mxfile>`;
  }
}
const save = (file, d, name, w, h) => { fs.writeFileSync(path.join(__dirname, file), d.xml(name, w, h), 'utf8'); console.log('ok', file, d.cells.length, 'celdas'); };
const TITLE = 'text;html=1;fontSize=16;fontStyle=1;align=left;';
const NOTE = 'shape=note;whiteSpace=wrap;html=1;align=left;spacing=8;fontSize=11;' + ST.amarillo;

// ======================================================================
// 1. CONTEXTO (modelo del profesor: círculo central, entidades externas, flujos de datos)
// ======================================================================
(function contexto() {
  const d = new Doc();
  d.v('Vista de contexto de GymTrack: diagrama de contexto (flujos de datos)', TITLE, 30, 0, 900, 26);
  const miembro = d.v('<b>Miembro</b><br>(entidad externa)', 'rounded=0;whiteSpace=wrap;html=1;fontSize=14;' + ST.verde, 30, 220, 210, 150);
  const entrenador = d.v('<b>Entrenador</b><br>(entidad externa)', 'rounded=0;whiteSpace=wrap;html=1;fontSize=14;' + ST.verde, 1240, 220, 210, 150);
  const sistema = d.v('<b>GymTrack</b><br>(sistema de seguimiento<br>de entrenamiento)', 'ellipse;whiteSpace=wrap;html=1;fontSize=15;' + ST.azul, 570, 130, 340, 340);
  const FL = 'endArrow=classic;html=1;edgeStyle=none;fontSize=11;labelBackgroundColor=#FFFFFF;exitPerimeter=0;entryPerimeter=0;';
  // puntos sobre el círculo (fracciones del cuadro): izquierda arriba/abajo y derecha arriba/abajo
  const L1 = 'entryX=0.047;entryY=0.289;', L2 = 'exitX=0.047;exitY=0.711;', R1 = 'entryX=0.953;entryY=0.289;', R2 = 'exitX=0.953;exitY=0.711;';
  d.e('Datos de cuenta y perfil (HU-01, 03)<br>Objetivos (HU-04)<br>Sesiones de entrenamiento (HU-13)<br>Mediciones corporales (HU-15)',
    FL + 'exitX=1;exitY=0.3;' + L1, miembro, sistema);
  d.e('Panel de progreso (HU-17)<br>Progreso de objetivos (HU-05, 06)<br>Historial de sesiones (HU-14)<br>Evolución corporal (HU-16)<br>Catálogo y rutina activa (HU-07, 10, 12)',
    FL + L2 + 'entryX=1;entryY=0.75;', sistema, miembro);
  d.e('Datos de cuenta (HU-02)<br>Ejercicios nuevos (HU-08)<br>Rutinas diseñadas (HU-09)<br>Asignaciones de rutina (HU-11)',
    FL + 'exitX=0;exitY=0.3;' + R1, entrenador, sistema);
  d.e('Catálogo de ejercicios (HU-07)<br>Rutinas existentes (HU-10)<br>Miembros registrados (HU-11)<br>Confirmaciones y errores de validación',
    FL + R2 + 'entryX=0;entryY=0.75;', sistema, entrenador);
  d.v('Vista de contexto (Bloque 2). GymTrack es una caja negra: solo se muestran las dos entidades externas de las historias de usuario (Miembro y Entrenador) y los datos que intercambian con el sistema. '
    + 'MongoDB, Spring y React no aparecen: son solución tecnológica y se ven en las vistas funcional, de desarrollo y de despliegue. Sin autenticación (fuera de alcance).', NOTE, 30, 540, 1000, 70);
  save('1-contexto.drawio', d, '1. Vista de contexto', 1500, 660);
})();

// ======================================================================
// 2. FUNCIONAL (componentes con puertos, interfaces provistas y requeridas, actores)
// ======================================================================
(function funcional() {
  const d = new Doc();
  const COMP = 'shape=component;align=left;spacingLeft=36;whiteSpace=wrap;html=1;fontSize=12;verticalAlign=middle;';
  const LOLLI = 'ellipse;whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;labelPosition=left;verticalLabelPosition=middle;align=right;verticalAlign=middle;fontSize=11;spacingRight=4;';
  const SOCKET = 'endArrow=halfCircle;endFill=0;endSize=14;html=1;rounded=0;fontSize=11;labelBackgroundColor=#FFFFFF;';
  const PORT = 'whiteSpace=wrap;html=1;aspect=fixed;fillColor=#FFFFFF;strokeColor=#000000;fontSize=11;labelPosition=right;align=left;verticalLabelPosition=middle;verticalAlign=middle;spacingLeft=4;';
  const USE = 'endArrow=open;endFill=0;dashed=1;html=1;fontSize=11;labelBackgroundColor=#FFFFFF;';

  d.v('Vista funcional de GymTrack: diagrama de componentes (puertos e interfaces)', TITLE, 30, 0, 900, 26);
  // Actores que usan la interfaz web
  const aMiembro = d.v('Miembro', 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontSize=12;', 240, 20, 36, 70);
  const aEntrenador = d.v('Entrenador', 'shape=umlActor;verticalLabelPosition=bottom;verticalAlign=top;html=1;fontSize=12;', 940, 20, 36, 70);
  const spa = d.v('«component»<br><b>Aplicación Web (SPA)</b><br>React, en el navegador', COMP + ST.verde, 380, 150, 400, 80);
  const ifWeb = d.v('IInterfazWeb', LOLLI, 581, 141, 18, 18);
  d.e('', 'endArrow=none;html=1;', spa, ifWeb);
  d.e('«use»', USE, aMiembro, ifWeb);
  d.e('«use»', USE, aEntrenador, ifWeb);

  const AX = 30, AY = 330;
  const api = d.v('<b>GymTrack API</b> (una sola JVM: los componentes no son servidores)', 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=10;spacingTop=6;fontSize=13;' + ST.gris, AX, AY, 1180, 610);
  const comp = (label, hu, x, y, w, iface) => {
    const cid = d.v(`«component»<br><b>${label}</b><br>${hu}`, COMP + ST.azul, x - AX, y - AY, w, 86, api);
    const lid = d.v(iface, LOLLI, x - AX + w / 2 - 9, y - AY - 9, 18, 18, api);
    d.e('', 'endArrow=none;html=1;', cid, lid, api);
    return { cid, lid };
  };
  const Y1 = 400, Y2 = 590, Y3 = 790;
  const progreso = comp('Seguimiento de Progreso', 'HU-05, 17', 470, Y1, 270, 'IProgreso');
  const objetivos = comp('Gestión de Objetivos', 'HU-04, 05, 06', 60, Y2, 250, 'IObjetivos');
  const entrenos = comp('Registro de Entrenamientos', 'HU-13, 14', 340, Y2, 270, 'IEntrenamientos');
  const rutinas = comp('Gestión de Rutinas', 'HU-09, 10, 11, 12', 640, Y2, 270, 'IRutinas');
  const mediciones = comp('Seguimiento Corporal', 'HU-15, 16', 940, Y2, 250, 'IMediciones');
  const usuarios = comp('Gestión de Usuarios', 'HU-01, 02, 03', 190, Y3, 270, 'IUsuarios');
  const catalogo = comp('Catálogo de Ejercicios', 'HU-07, 08', 760, Y3, 270, 'ICatalogo');

  // Puerto de la frontera (service port)
  const puerto = d.v('puerto REST', PORT, 596 - AX, -8, 16, 16, api);
  const mongo = d.v('«component» «external system»<br><b>MongoDB</b><br>base de datos gymtrack', COMP + ST.naranja, 440, 1020, 320, 80);
  const ifMongo = d.v('IPersistencia', LOLLI, 591, 1011, 18, 18);
  d.e('', 'endArrow=none;html=1;', mongo, ifMongo);
  d.e('HTTP / JSON (REST)', SOCKET, spa, puerto);
  d.e('persiste documentos (MongoDB)', SOCKET, api, ifMongo);

  const dep = (a, b) => d.e('', SOCKET, a.cid, b.lid);
  dep(progreso, objetivos); dep(progreso, entrenos); dep(progreso, rutinas); dep(progreso, mediciones);
  dep(objetivos, usuarios); dep(objetivos, catalogo);
  dep(entrenos, usuarios); dep(entrenos, catalogo); dep(entrenos, rutinas);
  dep(rutinas, usuarios); dep(rutinas, catalogo);
  dep(mediciones, usuarios);

  d.v('Vista funcional (Bloque 5): diagrama de componentes. Cada componente agrupa las historias de usuario que resuelve y ofrece una interfaz provista (círculo). '
    + 'El semicírculo (socket) indica la interfaz requerida: «A → B» significa que A necesita la interfaz de B. El cuadro pequeño es el puerto de servicio de la API. '
    + 'Los actores usan la interfaz web. No es un diagrama de casos de uso.', NOTE, 30, 1140, 900, 80);
  save('2-funcional.drawio', d, '2. Vista funcional', 1300, 1260);
})();

// ======================================================================
// 4. DESARROLLO (clases reales con dependencias, como el ejemplo del profesor)
// ======================================================================
(function desarrollo() {
  const d = new Doc();
  const LH = 15;
  const CL = 'swimlane;fontStyle=1;align=center;verticalAlign=top;horizontal=1;startSize=%S%;html=1;whiteSpace=wrap;fontSize=11;collapsible=0;';
  const TXT = 'text;strokeColor=none;fillColor=none;align=left;verticalAlign=top;spacingLeft=4;spacingRight=2;overflow=hidden;rotatable=0;whiteSpace=wrap;html=1;fontSize=10;';
  const CONT = 'rounded=0;whiteSpace=wrap;html=1;verticalAlign=top;align=left;spacingLeft=8;spacingTop=4;fontStyle=1;fontSize=12;';
  const OR = 'edgeStyle=orthogonalEdgeStyle;rounded=0;html=1;fontSize=10;labelBackgroundColor=#FFFFFF;';
  const DEP = OR + 'endArrow=open;endFill=0;dashed=1;';
  const REAL = OR + 'endArrow=block;endFill=0;dashed=1;';
  const cont = (label, x, y, w, h, fill, parent = '1') => d.v(label, CONT + fill, x, y, w, h, parent);
  // clase: nombre, estereotipo (o ''), líneas de miembros, geometría relativa al padre
  const cls = (nombre, ester, lines, x, y, w, fill, parent) => {
    const start = ester ? 38 : 24, h = start + lines.length * LH + 8;
    const id = d.v((ester ? ester + '<br>' : '') + nombre, CL.replace('%S%', start) + fill, x, y, w, h, parent);
    if (lines.length) d.v(lines.join('<br>'), TXT, 0, start, w, lines.length * LH + 8, id);
    return id;
  };

  d.v('Vista de desarrollo de GymTrack: clases y dependencias (backend Spring Boot y frontend React)', TITLE, 30, 0, 1200, 26);

  // -------- BACKEND --------
  const BE = cont('gymtrack-backend (paquete com.gymtrack.api): Controller → Service → Repository', 30, 50, 2700, 1030, ST.azul.replace('#DAE8FC', '#EEF4FD'));
  const kCtrl = cont('controller (API REST, 7 controladores)', 20, 40, 1800, 240, ST.gris, BE);
  const kSvc = cont('service (reglas de negocio)', 20, 300, 1800, 240, ST.gris, BE);
  const kStr = cont('service.progreso (patrón Strategy: avance de un objetivo, RN-07)', 1850, 300, 830, 330, ST.gris, BE);
  const kRepo = cont('repository (Spring Data MongoDB)', 20, 650, 2660, 100, ST.gris, BE);
  const kModel = cont('model (dominio)', 20, 780, 780, 220, ST.gris, BE);
  const kDto = cont('dto (records de entrada y salida)', 820, 780, 720, 220, ST.gris, BE);
  const kExc = cont('exception', 1560, 780, 560, 220, ST.gris, BE);
  const kCfg = cont('config', 2140, 780, 540, 220, ST.gris, BE);

  const X = i => 10 + i * 252, W = 240;
  const ctrl = {
    usuario: cls('UsuarioController', '«@RestController»', ['+registrarMiembro()', '+registrarEntrenador()', '+listarMiembros()', '+listarEntrenadores()', '+obtenerMiembro()', '+obtenerEntrenador()', '+actualizarMiembro()'], X(0), 30, W, ST.azul, kCtrl),
    ejercicio: cls('EjercicioController', '«@RestController»', ['+listar(grupoMuscular)', '+obtener(id)', '+crear(req)'], X(1), 30, W, ST.azul, kCtrl),
    objetivo: cls('ObjetivoController', '«@RestController»', ['+definir(miembroId, req)', '+listar(miembroId, estado)', '+obtener(id)', '+cambiarEstado(id, req)'], X(2), 30, W, ST.azul, kCtrl),
    progreso: cls('ProgresoController', '«@RestController»', ['+panel(miembroId)', '+progresoDeObjetivo(id)'], X(3), 30, W, ST.azul, kCtrl),
    rutina: cls('RutinaController', '«@RestController»', ['+crear(req)', '+listar()', '+detalle(id)', '+asignar(miembroId, req)', '+historial(miembroId)', '+rutinaActiva(miembroId)'], X(4), 30, W, ST.azul, kCtrl),
    sesion: cls('SesionController', '«@RestController»', ['+registrar(miembroId, req)', '+historial(miembroId)', '+detalle(id)'], X(5), 30, W, ST.azul, kCtrl),
    medicion: cls('MedicionController', '«@RestController»', ['+registrar(miembroId, req)', '+listar(miembroId)'], X(6), 30, W, ST.azul, kCtrl),
  };
  const svc = {
    usuario: cls('UsuarioService', '«@Service»', ['+crearMiembro()', '+crearEntrenador()', '+actualizarMiembro()', '+listarMiembros()', '+listarEntrenadores()', '+requerirMiembro()', '+requerirEntrenador()', '+nombres()'], X(0), 30, W, ST.verde, kSvc),
    ejercicio: cls('EjercicioService', '«@Service»', ['+listar(grupo)', '+obtener(id)', '+crear(req)', '+nombres(ids)'], X(1), 30, W, ST.verde, kSvc),
    objetivo: cls('ObjetivoService', '«@Service»', ['+crear(miembroId, req)', '+listar(miembroId, estado)', '+obtener(id)', '+cambiarEstado(id, nuevo)'], X(2), 30, W, ST.verde, kSvc),
    progreso: cls('ProgresoService', '«@Service»', ['+progresoDe(objetivo)', '+porcentaje(ini, meta, actual)', '+objetivosConProgreso()', '+responder(objetivo)', '+panel(miembroId)'], X(3), 30, W, ST.verde, kSvc),
    rutina: cls('RutinaService', '«@Service»', ['+crear(req)', '+listar()', '+detalle(id)', '+asignar(miembroId, req)', '+historial(miembroId)', '+rutinaActiva(miembroId)', '+resumenActiva(miembroId)'], X(4), 30, W, ST.verde, kSvc),
    sesion: cls('SesionService', '«@Service»', ['+registrar(miembroId, req)', '+historial(miembroId)', '+detalle(id)', '+contarDelMes(miembroId)', '+ultima(miembroId)'], X(5), 30, W, ST.verde, kSvc),
    medicion: cls('MedicionService', '«@Service»', ['+registrar(miembroId, req)', '+listar(miembroId)', '+ultimasDos(miembroId)'], X(6), 30, W, ST.verde, kSvc),
  };
  const estrategia = cls('EstrategiaProgreso', '«interface»', ['+soporta(): TipoObjetivo', '+valorActual(objetivo): double'], 20, 30, 320, ST.morado, kStr);
  const pesoStr = cls('PesoCorporalStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 10, 170, 250, ST.morado, kStr);
  const frecStr = cls('FrecuenciaSemanalStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 275, 170, 270, ST.morado, kStr);
  const fuerStr = cls('FuerzaEjercicioStrategy', '«@Component»', ['+soporta()', '+valorActual(objetivo)'], 560, 170, 250, ST.morado, kStr);

  const repoNames = ['UsuarioRepository', 'MiembroRepository', 'EntrenadorRepository', 'EjercicioRepository', 'ObjetivoRepository', 'RutinaRepository', 'AsignacionRutinaRepository', 'SesionRepository', 'MedicionRepository'];
  const repo = {};
  repoNames.forEach((n, i) => { repo[n] = cls(n, '«interface»', [], 10 + i * 292, 28, 275, ST.naranja, kRepo); });

  d.v('Usuario (abstracta), Miembro, Entrenador<br>Objetivo, Ejercicio<br>Rutina, EjercicioPrescrito, AsignacionRutina<br>SesionEntrenamiento, RegistroSerie, MedicionCorporal<br>Enumeraciones: TipoObjetivo, EstadoObjetivo, GrupoMuscular, NivelRutina, DiaSemana, EstadoAsignacion', TXT + 'fontSize=11;', 10, 34, 760, 175, kModel);
  d.v('UsuarioDtos (MiembroRequest, MiembroUpdateRequest, EntrenadorRequest, MiembroResponse, EntrenadorResponse)<br>EjercicioDtos · ObjetivoDtos · RutinaDtos<br>SesionDtos · MedicionDtos · PanelDtos<br>ErrorResponse (cuerpo estándar de error)', TXT + 'fontSize=11;', 10, 34, 700, 175, kDto);
  d.v('GlobalExceptionHandler (@RestControllerAdvice)<br>RecursoNoEncontradoException → 404<br>ConflictoException → 409<br>ReglaDeNegocioException → 400<br>OperacionNoPermitidaException → 403', TXT + 'fontSize=11;', 10, 34, 540, 175, kExc);
  d.v('GymTrackApplication (main)<br>ClockConfig (Clock inyectable)<br>CorsConfig (orígenes 5173 y 4173)<br>DataSeeder (datos de ejemplo al arrancar)', TXT + 'fontSize=11;', 10, 34, 520, 175, kCfg);

  // Dependencias backend: controlador → servicio
  const c2s = [['usuario', ['usuario']], ['ejercicio', ['ejercicio']], ['objetivo', ['objetivo', 'progreso']], ['progreso', ['progreso', 'objetivo']], ['rutina', ['rutina']], ['sesion', ['sesion']], ['medicion', ['medicion']]];
  c2s.forEach(([c, ss]) => ss.forEach(s => d.e('', DEP, ctrl[c], svc[s])));
  // servicio → servicio
  [['ejercicio', 'usuario'], ['medicion', 'usuario'], ['objetivo', 'usuario'], ['objetivo', 'ejercicio'], ['rutina', 'usuario'], ['rutina', 'ejercicio'],
    ['sesion', 'usuario'], ['sesion', 'ejercicio'], ['sesion', 'rutina'], ['progreso', 'objetivo'], ['progreso', 'sesion'], ['progreso', 'medicion'], ['progreso', 'rutina'], ['progreso', 'usuario']]
    .forEach(([a, b]) => d.e('', DEP, svc[a], svc[b]));
  d.e('', DEP, svc.progreso, estrategia);
  // servicio → repositorio
  [['usuario', 'UsuarioRepository'], ['usuario', 'MiembroRepository'], ['usuario', 'EntrenadorRepository'], ['ejercicio', 'EjercicioRepository'], ['objetivo', 'ObjetivoRepository'],
    ['rutina', 'RutinaRepository'], ['rutina', 'AsignacionRutinaRepository'], ['sesion', 'SesionRepository'], ['medicion', 'MedicionRepository']]
    .forEach(([s, r]) => d.e('', DEP, svc[s], repo[r]));
  // estrategias: realizan la interfaz y usan repositorios
  [pesoStr, frecStr, fuerStr].forEach(s => d.e('', REAL, s, estrategia));
  d.e('', DEP, pesoStr, repo.MedicionRepository);
  d.e('', DEP, frecStr, repo.SesionRepository);
  d.e('', DEP, fuerStr, repo.SesionRepository);
  // capas → model / dto / exception
  d.e('usa', DEP, kRepo, kModel);
  d.e('usa', DEP, kSvc, kExc);
  d.e('', DEP, kCtrl, kDto);

  // -------- FRONTEND --------
  const FE = cont('gymtrack-frontend (src): React 18 + Vite + TypeScript', 30, 1140, 2700, 770, ST.verde.replace('#D5E8D4', '#EEF7EC'));
  const main = cls('main.tsx', '', ['createRoot().render(<App/>)', 'BrowserRouter + ProveedorSesion'], 20, 40, 270, ST.verde, FE);
  const kState = cont('state', 330, 40, 600, 190, ST.gris, FE);
  const ctx = cls('SesionContext.tsx', '', ['-perfil: Perfil {id, nombre, rol}', '+ProveedorSesion()', '+useSesion(): Contexto'], 10, 30, 290, ST.verde, kState);
  const useAsync = cls('useAsync.ts', '', ['+useAsync(cargar, deps)', '→ {datos, error, cargando}'], 315, 30, 275, ST.verde, kState);
  const app = cls('App.tsx', '', ['+App(): rutas de la SPA', 'rutas protegidas por rol'], 970, 40, 250, ST.verde, FE);
  const layout = cls('Layout.tsx', '', ['+Layout(): menú y salida'], 1260, 40, 260, ST.verde, FE);
  const rutaProt = cls('RutaProtegida.tsx', '', ['+RutaProtegida(rol, children)'], 1560, 40, 280, ST.verde, FE);

  const kPages = cont('pages (12 pantallas, una por historia de usuario)', 20, 270, 1560, 330, ST.gris, FE);
  const pages = ['SeleccionPerfil', 'Registro', 'Perfil', 'Panel', 'Objetivos', 'Catalogo', 'Rutinas', 'CrearRutina', 'AsignarRutina', 'RegistrarSesion', 'Historial', 'Mediciones'];
  pages.forEach((p, i) => d.v(p + '.tsx<br><span style="font-size:9px">+' + p + '(): pantalla</span>', 'rounded=0;whiteSpace=wrap;html=1;fontSize=11;' + ST.verde, 20 + (i % 4) * 380, 40 + Math.floor(i / 4) * 95, 360, 70, kPages));

  const kComp = cont('components', 20, 630, 1000, 120, ST.gris, FE);
  [['Campo.tsx', '+Campo(etiqueta, error)'], ['BarraProgreso.tsx', '+BarraProgreso(porcentaje)'], ['GraficaLinea.tsx', '+GraficaLinea(puntos, unidad)'], ['Estado.tsx', 'Cargando · Vacio · ErrorCaja']]
    .forEach(([n, o], i) => d.v(n + '<br><span style="font-size:9px">' + o + '</span>', 'rounded=0;whiteSpace=wrap;html=1;fontSize=11;' + ST.verde, 10 + i * 245, 38, 235, 66, kComp));
  const kUtils = cont('utils', 1040, 630, 540, 120, ST.gris, FE);
  d.v('fechas.ts<br><span style="font-size:9px">hoy · sumarDias · lunesDe · formatear</span>', 'rounded=0;whiteSpace=wrap;html=1;fontSize=11;' + ST.verde, 10, 38, 260, 66, kUtils);
  d.v('numeros.ts<br><span style="font-size:9px">aNumero(texto)</span>', 'rounded=0;whiteSpace=wrap;html=1;fontSize=11;' + ST.verde, 280, 38, 250, 66, kUtils);

  const kApi = cont('api (cliente del backend; contrato único GymApi)', 1620, 270, 1060, 330, ST.gris, FE);
  const gym = cls('GymApi', '«interface»', ['+listarMiembros() · crearMiembro()', '+listarEjercicios() · crearEjercicio()', '+crearObjetivo() · cambiarEstado()', '+crearRutina() · asignar() · rutinaActiva()', '+registrarSesion() · historial()', '+registrarMedicion() · panel()'], 20, 40, 330, ST.morado, kApi);
  const http = cls('crearHttp (http.ts)', '', ['fetch → API REST real', 'convierte errores en ApiError'], 390, 40, 300, ST.verde, kApi);
  const mock = cls('crearMock (mock.ts)', '', ['datos en memoria', 'modo demo VITE_USE_MOCK'], 720, 40, 300, ST.verde, kApi);
  const apiErr = cls('ApiError (error.ts)', '', ['+status, +errores[]', '+textoDeError(e)'], 390, 190, 300, ST.verde, kApi);
  const apiIdx = cls('index.ts · campos.ts · progreso.ts', '', ['api: GymApi (http o mock)', 'analizarError() · porcentaje()'], 720, 190, 300, ST.verde, kApi);
  const kTypes = cont('types', 1620, 630, 1060, 120, ST.gris, FE);
  d.v('types/index.ts: interfaces TypeScript de los DTO (Miembro, Ejercicio, Objetivo, Rutina, Sesion, Medicion, Panel…) y enumeraciones', TXT + 'fontSize=11;', 10, 34, 1040, 70, kTypes);

  d.e('', DEP, main, app); d.e('', DEP, main, ctx);
  d.e('', DEP, app, layout); d.e('', DEP, app, rutaProt); d.e('', DEP, app, kPages);
  d.e('', DEP, rutaProt, ctx); d.e('', DEP, layout, ctx);
  d.e('', DEP, kPages, kApi); d.e('', DEP, kPages, kComp); d.e('', DEP, kPages, kState); d.e('', DEP, kPages, kUtils); d.e('', DEP, kPages, kTypes);
  d.e('', REAL, http, gym); d.e('', REAL, mock, gym);
  d.e('', DEP, http, apiErr); d.e('', DEP, apiIdx, gym);
  d.e('', DEP, kApi, kTypes);
  // única unión entre repositorios: en ejecución
  d.e('HTTP/JSON (REST), solo en ejecución', DEP + 'strokeColor=#CC0000;fontColor=#CC0000;', http, kCtrl);

  d.v('Vista de desarrollo: organización del código. Backend en capas Controller → Service → Repository (el dominio model no es una capa); dependencias en un solo sentido y sin ciclos. '
    + 'Frontend: pages → api / components / state / utils / types. La flecha roja es la única unión entre repositorios: ocurre en ejecución (HTTP/JSON), no en compilación. '
    + 'Triángulo hueco discontinuo = realiza una interfaz.', NOTE, 30, 1940, 1300, 70);
  save('4-desarrollo.drawio', d, '4. Vista de desarrollo', 2800, 2050);
})();
