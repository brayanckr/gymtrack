// Generador de mockups de GymTrack.
// Uso:  node build.mjs   -> escribe mockups/html/*.html y assets/wireframe.css
// Los PNG se exportan con render.ps1 (Edge headless).
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
mkdirSync(join(root, 'html'), { recursive: true });
mkdirSync(join(root, 'assets'), { recursive: true });

// ---------- estilos compartidos (wireframe de media fidelidad) ----------
const css = `
:root{--ink:#1c1917;--muted:#78716c;--line:#e7e5e4;--bg:#f5f5f4;--card:#fff;--accent:#c2410c;--accent-soft:#ffedd5;--ok:#15803d;--ok-soft:#dcfce7;--warn:#a16207;--warn-soft:#fef9c3;--bad:#b91c1c;--bad-soft:#fee2e2}
*{box-sizing:border-box}
body{margin:0;font:14px/1.45 "Segoe UI",system-ui,sans-serif;color:var(--ink);background:var(--bg)}
.app{display:grid;grid-template-columns:220px 1fr;min-height:100vh}
.side{background:#1c1917;color:#e7e5e4;padding:20px 14px}
.brand{font-weight:700;font-size:18px;letter-spacing:.3px;margin:0 8px 22px;color:#fff}
.brand b{color:#fb923c}
.side a{display:block;padding:9px 12px;border-radius:8px;color:#d6d3d1;margin-bottom:2px}
.side a.on{background:#44403c;color:#fff;font-weight:600}
.side .who{margin:26px 8px 0;padding-top:14px;border-top:1px solid #44403c;font-size:12px;color:#a8a29e}
.side .who b{display:block;color:#fff;font-size:13px}
.main{padding:26px 34px}
.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
h1{font-size:22px;margin:0}
.sub{color:var(--muted);margin:2px 0 0}
.chip{display:inline-block;padding:2px 10px;border-radius:99px;font-size:12px;font-weight:600;background:var(--accent-soft);color:var(--accent)}
.chip.ok{background:var(--ok-soft);color:var(--ok)} .chip.warn{background:var(--warn-soft);color:var(--warn)} .chip.bad{background:var(--bad-soft);color:var(--bad)} .chip.gray{background:#e7e5e4;color:#57534e}
.grid{display:grid;gap:16px} .g2{grid-template-columns:1fr 1fr} .g3{grid-template-columns:repeat(3,1fr)} .g4{grid-template-columns:repeat(4,1fr)} .g-7-5{grid-template-columns:7fr 5fr} .g-5-7{grid-template-columns:5fr 7fr}
.card{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:18px}
.card h2{font-size:15px;margin:0 0 12px}
.stat .n{font-size:28px;font-weight:700;line-height:1.1} .stat .l{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.5px} .stat .d{font-size:12px;color:var(--ok)}
label{display:block;font-size:12px;font-weight:600;color:#44403c;margin:0 0 4px}
.field{margin-bottom:12px}
.inp{border:1px solid #d6d3d1;border-radius:8px;padding:8px 10px;background:#fff;color:var(--ink);min-height:36px}
.inp.dis{background:#f5f5f4;color:var(--muted)} .inp.err{border-color:var(--bad)} .inp.ph{color:#a8a29e}
.err-t{color:var(--bad);font-size:12px;margin-top:3px}
.row{display:grid;gap:12px;grid-template-columns:1fr 1fr}
.btn{display:inline-block;padding:9px 16px;border-radius:8px;background:var(--accent);color:#fff;font-weight:600;border:0}
.btn.sec{background:#fff;color:var(--ink);border:1px solid #d6d3d1} .btn.sm{padding:4px 10px;font-size:12px}
.tabs{display:flex;gap:6px;margin-bottom:16px}.tabs span{padding:7px 14px;border-radius:8px;border:1px solid #d6d3d1;background:#fff}.tabs span.on{background:var(--ink);color:#fff;border-color:var(--ink)}
.bar{height:8px;background:#e7e5e4;border-radius:99px;overflow:hidden}.bar i{display:block;height:100%;background:var(--accent)}.bar.ok i{background:var(--ok)}
table{width:100%;border-collapse:collapse} th{font-size:11px;text-transform:uppercase;letter-spacing:.5px;color:var(--muted);text-align:left;padding:6px 8px;border-bottom:1px solid var(--line)} td{padding:9px 8px;border-bottom:1px solid #f5f5f4}
.item{border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:10px;background:#fff}.item.sel{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent-soft)}
.item .t{font-weight:600}.item .m{color:var(--muted);font-size:12px}
.empty{border:2px dashed #d6d3d1;border-radius:12px;padding:22px;text-align:center;color:var(--muted)}
.note{margin-top:22px;font-size:11px;color:var(--muted);border-top:1px dashed #d6d3d1;padding-top:8px}
.flex{display:flex;gap:10px;align-items:center}.sp{justify-content:space-between}
.chips{display:flex;gap:8px;flex-wrap:wrap;margin-bottom:14px}
`;
writeFileSync(join(root, 'assets', 'wireframe.css'), css.trim() + '\n');

// ---------- cascarón común ----------
const NAV = [
  ['panel', 'Panel de progreso'], ['objetivos', 'Objetivos'], ['rutinas', 'Rutinas'],
  ['catalogo', 'Catálogo de ejercicios'], ['sesion', 'Registrar sesión'], ['historial', 'Historial'],
  ['mediciones', 'Mediciones'], ['perfil', 'Mi perfil'],
];
const shell = ({ id, title, sub, active, who, role, hus, body }) => `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><title>${id} · ${title}</title>
<link rel="stylesheet" href="../assets/wireframe.css"></head><body>
<div class="app">
  <aside class="side">
    <div class="brand">Gym<b>Track</b></div>
    ${NAV.map(([k, n]) => `<a class="${k === active ? 'on' : ''}">${n}</a>`).join('\n    ')}
    <div class="who"><b>${who}</b>${role}</div>
  </aside>
  <main class="main">
    <div class="top"><div><h1>${title}</h1><p class="sub">${sub}</p></div><span class="chip gray">Mockup · ${hus}</span></div>
    ${body}
    <div class="note">Mockup de media fidelidad — ${id}. Historias: ${hus}. Los datos son ilustrativos.</div>
  </main>
</div></body></html>`;

const field = (l, v, cls = '', err = '') => `<div class="field"><label>${l}</label><div class="inp ${cls}">${v}</div>${err ? `<div class="err-t">${err}</div>` : ''}</div>`;
const prog = (pct, cls = '') => `<div class="bar ${cls}"><i style="width:${pct}%"></i></div>`;
const M = { who: 'Camila Rojas', role: 'Miembro' };
const T = { who: 'Andrés Pardo', role: 'Entrenador' };

// ---------- pantallas ----------
const screens = [];

screens.push({ id: '01-registro', title: 'Crear mi cuenta', sub: 'Regístrate como miembro o como entrenador.', active: 'perfil', ...M, hus: 'HU-01 · HU-02',
  body: `<div class="card" style="max-width:640px">
  <div class="tabs"><span class="on">Soy miembro</span><span>Soy entrenador</span></div>
  <div class="row">${field('Identificación', '1001234567')}${field('Nombre completo', 'Camila Rojas')}</div>
  ${field('Correo', 'camila@correo.com', 'err', 'Este correo ya está registrado. Usa otro o inicia sesión.')}
  <div class="row">${field('Fecha de nacimiento', '14/03/1999')}${field('Altura (cm)', '168')}</div>
  <div class="flex"><span class="btn">Registrarme</span><span class="btn sec">Cancelar</span></div>
  <p class="sub" style="margin-top:14px">Si eliges <b>entrenador</b>, los campos de nacimiento y altura se reemplazan por <b>Especialidad</b>.</p>
</div>` });

screens.push({ id: '02-perfil', title: 'Mi perfil', sub: 'Consulta y actualiza tus datos.', active: 'perfil', ...M, hus: 'HU-03',
  body: `<div class="card" style="max-width:640px">
  ${field('Identificación (no editable)', '1001234567', 'dis')}
  <div class="row">${field('Nombre completo', 'Camila Rojas')}${field('Correo', 'camila@correo.com')}</div>
  <div class="row">${field('Fecha de nacimiento', '14/03/1999', 'dis')}${field('Altura (cm)', '168')}</div>
  <div class="flex"><span class="btn">Guardar cambios</span><span class="chip ok">Perfil actualizado</span></div>
</div>` });

screens.push({ id: '03-panel-progreso', title: 'Panel de progreso', sub: 'Así vas, Camila.', active: 'panel', ...M, hus: 'HU-17',
  body: `<div class="grid g4" style="margin-bottom:16px">
  <div class="card stat"><div class="l">Último peso</div><div class="n">78,4 kg</div><div class="d">▼ 1,2 kg vs. anterior</div></div>
  <div class="card stat"><div class="l">Sesiones del mes</div><div class="n">11</div><div class="d">Última: ayer</div></div>
  <div class="card stat"><div class="l">Objetivos activos</div><div class="n">2</div><div class="d" style="color:var(--muted)">1 vence en 12 días</div></div>
  <div class="card stat"><div class="l">Rutina activa</div><div class="n" style="font-size:18px;padding-top:6px">Fuerza 3 días</div><div class="d" style="color:var(--muted)">desde 02/11</div></div>
</div>
<div class="grid g-7-5">
  <div class="card"><h2>Objetivos activos</h2>
    <div class="item"><div class="flex sp"><span class="t">Bajar a 75 kg</span><span class="chip">Peso corporal</span></div><div class="m">Meta 75 kg · hasta 31/01</div>${prog(62)}<div class="m" style="margin-top:4px">62 %</div></div>
    <div class="item"><div class="flex sp"><span class="t">Press de banca 80 kg</span><span class="chip">Fuerza</span></div><div class="m">Meta 80 kg · hasta 15/02</div>${prog(85)}<div class="m" style="margin-top:4px">85 %</div></div>
  </div>
  <div class="card"><h2>Últimas sesiones</h2>
    <table><tr><th>Fecha</th><th>Duración</th><th>Series</th></tr>
    <tr><td>22/11</td><td>65 min</td><td>14</td></tr><tr><td>20/11</td><td>55 min</td><td>12</td></tr><tr><td>18/11</td><td>70 min</td><td>16</td></tr></table>
    <p style="margin:12px 0 0"><span class="btn sm">Registrar sesión</span></p>
  </div>
</div>` });

screens.push({ id: '04-objetivos', title: 'Mis objetivos', sub: 'Define metas y mira cuánto has avanzado.', active: 'objetivos', ...M, hus: 'HU-04 · HU-05 · HU-06',
  body: `<div class="grid g-7-5">
  <div>
    <div class="item sel"><div class="flex sp"><span class="t">Bajar a 75 kg</span><span class="chip ok">Activo</span></div><div class="m">Peso corporal · de 82 kg a 75 kg · hasta 31/01</div>${prog(62)}
      <div class="flex sp" style="margin-top:6px"><span class="m">62 %</span><span><span class="btn sec sm">Marcar cumplido</span> <span class="btn sec sm">Cancelar</span></span></div></div>
    <div class="item"><div class="flex sp"><span class="t">Press de banca 80 kg</span><span class="chip ok">Activo</span></div><div class="m">Fuerza · Press de banca · de 60 kg a 80 kg · hasta 15/02</div>${prog(85)}<div class="m" style="margin-top:6px">85 %</div></div>
    <div class="item"><div class="flex sp"><span class="t">Entrenar 4 veces por semana</span><span class="chip gray">Cumplido</span></div><div class="m">Frecuencia semanal · meta 4</div>${prog(100, 'ok')}<div class="m" style="margin-top:6px">100 %</div></div>
  </div>
  <div class="card"><h2>Nuevo objetivo</h2>
    <div class="tabs"><span>Peso corporal</span><span>Frecuencia semanal</span><span class="on">Fuerza</span></div>
    ${field('Ejercicio', 'Sentadilla ▾')}
    <div class="row">${field('Peso inicial (kg)', '70')}${field('Meta (kg)', '100')}</div>
    ${field('Fecha límite', '30/04')}
    <span class="btn">Crear objetivo</span>
    <p class="err-t" style="margin-top:8px">Ejemplo de error: la meta no puede ser igual al valor inicial.</p>
  </div>
</div>` });

screens.push({ id: '05-catalogo-ejercicios', title: 'Catálogo de ejercicios', sub: 'Todos los ejercicios disponibles.', active: 'catalogo', ...T, hus: 'HU-07 · HU-08',
  body: `<div class="grid g-7-5"><div class="card">
  <div class="chips"><span class="chip">Todos</span><span class="chip gray">Pecho</span><span class="chip gray">Espalda</span><span class="chip gray">Piernas</span><span class="chip gray">Hombros</span><span class="chip gray">Brazos</span><span class="chip gray">Core</span></div>
  <table><tr><th>Ejercicio</th><th>Grupo muscular</th><th>Descripción</th></tr>
  <tr><td><b>Press de banca</b></td><td>Pecho</td><td>Empuje horizontal con barra</td></tr>
  <tr><td><b>Sentadilla</b></td><td>Piernas</td><td>Flexión de cadera y rodilla con barra</td></tr>
  <tr><td><b>Peso muerto</b></td><td>Espalda</td><td>Levantamiento desde el suelo</td></tr>
  <tr><td><b>Press militar</b></td><td>Hombros</td><td>Empuje vertical</td></tr>
  <tr><td><b>Plancha</b></td><td>Core</td><td>Isométrico de peso corporal</td></tr></table>
  </div>
  <div class="card"><h2>Nuevo ejercicio <span class="chip gray">solo entrenadores</span></h2>
    ${field('Nombre', 'Remo con barra')}${field('Grupo muscular', 'Espalda ▾')}${field('Descripción', 'Tirón horizontal con barra', 'ph')}
    ${field('Nombre', 'press de banca', 'err', 'Ya existe un ejercicio con ese nombre.')}
    <span class="btn">Guardar ejercicio</span></div></div>` });

screens.push({ id: '06-rutinas', title: 'Rutinas', sub: 'Consulta las rutinas y tu rutina activa.', active: 'rutinas', ...M, hus: 'HU-10 · HU-12',
  body: `<div class="grid g-5-7"><div>
    <div class="item sel"><div class="flex sp"><span class="t">Fuerza 3 días</span><span class="chip ok">Mi rutina activa</span></div><div class="m">Intermedio · por Andrés Pardo · desde 02/11</div></div>
    <div class="item"><div class="t">Hipertrofia 4 días</div><div class="m">Avanzado · por Andrés Pardo</div></div>
    <div class="item"><div class="t">Full body principiante</div><div class="m">Principiante · por Laura Mejía</div></div>
    <div class="empty" style="margin-top:10px">Cuando no tengas rutina activa verás aquí:<br><b>“Aún no te han asignado una rutina”</b></div>
  </div>
  <div class="card"><h2>Fuerza 3 días <span class="chip">Intermedio</span></h2>
    <p class="m" style="color:var(--muted);margin-top:-6px">Tres días de trabajo de fuerza con ejercicios compuestos.</p>
    <table><tr><th>Día</th><th>Ejercicio</th><th>Series × Reps</th><th>Descanso</th></tr>
    <tr><td>Lunes</td><td>Sentadilla</td><td>5 × 5</td><td>120 s</td></tr>
    <tr><td>Lunes</td><td>Press de banca</td><td>5 × 5</td><td>120 s</td></tr>
    <tr><td>Miércoles</td><td>Peso muerto</td><td>3 × 5</td><td>150 s</td></tr>
    <tr><td>Viernes</td><td>Press militar</td><td>4 × 6</td><td>90 s</td></tr>
    <tr><td>Viernes</td><td>Sentadilla</td><td>3 × 8</td><td>90 s</td></tr></table>
  </div></div>` });

screens.push({ id: '07-crear-rutina', title: 'Crear rutina', sub: 'Diseña un plan con ejercicios del catálogo.', active: 'rutinas', ...T, hus: 'HU-09',
  body: `<div class="card"><div class="row">${field('Nombre', 'Fuerza 3 días')}${field('Nivel', 'Intermedio ▾')}</div>
  ${field('Descripción', 'Tres días de trabajo de fuerza con ejercicios compuestos.')}
  <h2 style="margin-top:6px">Ejercicios de la rutina</h2>
  <table><tr><th>#</th><th>Día</th><th>Ejercicio</th><th>Series</th><th>Reps</th><th>Descanso (s)</th><th></th></tr>
  <tr><td>1</td><td><div class="inp">Lunes ▾</div></td><td><div class="inp">Sentadilla ▾</div></td><td><div class="inp">5</div></td><td><div class="inp">5</div></td><td><div class="inp">120</div></td><td><span class="btn sec sm">Quitar</span></td></tr>
  <tr><td>2</td><td><div class="inp">Lunes ▾</div></td><td><div class="inp">Press de banca ▾</div></td><td><div class="inp">5</div></td><td><div class="inp">5</div></td><td><div class="inp">120</div></td><td><span class="btn sec sm">Quitar</span></td></tr>
  <tr><td>3</td><td><div class="inp">Viernes ▾</div></td><td><div class="inp">Press militar ▾</div></td><td><div class="inp err">0</div></td><td><div class="inp">6</div></td><td><div class="inp">90</div></td><td><span class="btn sec sm">Quitar</span></td></tr></table>
  <div class="err-t">Fila 3: las series deben ser al menos 1.</div>
  <p><span class="btn sec">+ Agregar ejercicio</span></p>
  <div class="flex"><span class="btn">Guardar rutina</span><span class="btn sec">Cancelar</span><span class="m" style="color:var(--muted)">Una rutina necesita al menos un ejercicio.</span></div></div>` });

screens.push({ id: '08-asignar-rutina', title: 'Asignar rutina', sub: 'Elige un miembro y la rutina que va a seguir.', active: 'rutinas', ...T, hus: 'HU-11',
  body: `<div class="grid g2"><div class="card"><h2>Asignación</h2>
    ${field('Miembro', 'Camila Rojas · 1001234567 ▾')}${field('Rutina', 'Hipertrofia 4 días ▾')}
    <div class="item" style="background:var(--warn-soft);border-color:#fde047"><b>Camila ya tiene una rutina activa:</b> Fuerza 3 días (desde 02/11).<br>Al asignar esta, la anterior quedará <b>finalizada hoy</b>.</div>
    <span class="btn">Asignar rutina</span></div>
  <div class="card"><h2>Vista previa: Hipertrofia 4 días</h2>
    <table><tr><th>Día</th><th>Ejercicio</th><th>Series × Reps</th></tr>
    <tr><td>Lunes</td><td>Press de banca</td><td>4 × 10</td></tr><tr><td>Martes</td><td>Remo con barra</td><td>4 × 10</td></tr>
    <tr><td>Jueves</td><td>Sentadilla</td><td>4 × 10</td></tr><tr><td>Viernes</td><td>Press militar</td><td>4 × 12</td></tr></table>
    <p class="chip ok" style="margin-top:12px">Última asignación: Luis Gómez · hoy</p></div></div>` });

screens.push({ id: '09-registrar-sesion', title: 'Registrar sesión', sub: 'Anota lo que hiciste hoy.', active: 'sesion', ...M, hus: 'HU-13',
  body: `<div class="card"><div class="row" style="grid-template-columns:1fr 1fr 2fr">${field('Fecha', '22/11/2026')}${field('Duración (min)', '65')}${field('Rutina (opcional)', 'Fuerza 3 días ▾  ·  o “Sesión libre”')}</div>
  <h2>Series realizadas</h2>
  <table><tr><th>#</th><th>Ejercicio</th><th>Repeticiones</th><th>Peso (kg)</th><th></th></tr>
  <tr><td>1</td><td><div class="inp">Sentadilla ▾</div></td><td><div class="inp">5</div></td><td><div class="inp">100</div></td><td><span class="btn sec sm">Quitar</span></td></tr>
  <tr><td>2</td><td><div class="inp">Sentadilla ▾</div></td><td><div class="inp">5</div></td><td><div class="inp">100</div></td><td><span class="btn sec sm">Quitar</span></td></tr>
  <tr><td>3</td><td><div class="inp">Press de banca ▾</div></td><td><div class="inp">5</div></td><td><div class="inp">75</div></td><td><span class="btn sec sm">Quitar</span></td></tr>
  <tr><td>4</td><td><div class="inp">Plancha ▾</div></td><td><div class="inp">1</div></td><td><div class="inp">0</div></td><td><span class="btn sec sm">Quitar</span></td></tr></table>
  <p class="m" style="color:var(--muted)">Peso 0 = ejercicio de peso corporal.</p>
  <p><span class="btn sec">+ Agregar serie</span></p>
  <div class="flex"><span class="btn">Guardar sesión</span><span class="m" style="color:var(--muted)">Se necesita al menos una serie.</span></div></div>` });

screens.push({ id: '10-historial-sesiones', title: 'Historial de sesiones', sub: 'De la más reciente a la más antigua.', active: 'historial', ...M, hus: 'HU-14',
  body: `<div class="grid g-5-7"><div>
    <div class="item sel"><div class="flex sp"><span class="t">22/11/2026</span><span class="chip">Fuerza 3 días</span></div><div class="m">65 min · 14 series</div></div>
    <div class="item"><div class="flex sp"><span class="t">20/11/2026</span><span class="chip gray">Sesión libre</span></div><div class="m">55 min · 12 series</div></div>
    <div class="item"><div class="flex sp"><span class="t">18/11/2026</span><span class="chip">Fuerza 3 días</span></div><div class="m">70 min · 16 series</div></div>
    <div class="empty">Sin sesiones: <b>“Registra tu primera sesión”</b></div></div>
  <div class="card"><h2>Sesión del 22/11/2026</h2><p class="sub" style="margin:-8px 0 10px">65 min · Fuerza 3 días · “Buen día, subí peso en sentadilla.”</p>
    <table><tr><th>Ejercicio</th><th>Serie</th><th>Reps</th><th>Peso</th></tr>
    <tr><td>Sentadilla</td><td>1</td><td>5</td><td>100 kg</td></tr><tr><td>Sentadilla</td><td>2</td><td>5</td><td>100 kg</td></tr>
    <tr><td>Press de banca</td><td>1</td><td>5</td><td>75 kg</td></tr><tr><td>Plancha</td><td>1</td><td>1</td><td>—</td></tr></table></div></div>` });

const pts = [[40, 40, 82], [130, 62, 81.2], [220, 84, 80.4], [310, 120, 79.6], [400, 140, 78.4]];
screens.push({ id: '11-mediciones', title: 'Mediciones y evolución', sub: 'Registra tu peso y observa tu tendencia.', active: 'mediciones', ...M, hus: 'HU-15 · HU-16',
  body: `<div class="grid g-7-5">
  <div class="card"><h2>Evolución del peso (kg)</h2>
    <svg viewBox="0 0 460 190" width="100%"><g stroke="#e7e5e4"><line x1="30" y1="20" x2="450" y2="20"/><line x1="30" y1="80" x2="450" y2="80"/><line x1="30" y1="140" x2="450" y2="140"/></g>
    <polyline fill="none" stroke="#c2410c" stroke-width="3" points="${pts.map(p => p[0] + 30 + ',' + p[1]).join(' ')}"/>
    ${pts.map(p => `<circle cx="${p[0] + 30}" cy="${p[1]}" r="5" fill="#c2410c"/><text x="${p[0] + 30}" y="${p[1] - 10}" font-size="11" text-anchor="middle" fill="#44403c">${String(p[2]).replace('.', ',')}</text>`).join('')}
    <g font-size="10" fill="#78716c"><text x="70" y="170" text-anchor="middle">01/11</text><text x="160" y="170" text-anchor="middle">08/11</text><text x="250" y="170" text-anchor="middle">15/11</text><text x="340" y="170" text-anchor="middle">19/11</text><text x="430" y="170" text-anchor="middle">22/11</text></g></svg>
    <table><tr><th>Fecha</th><th>Peso</th><th>% grasa</th><th>Cintura</th></tr>
    <tr><td>22/11</td><td>78,4 kg</td><td>19 %</td><td>82 cm</td></tr><tr><td>19/11</td><td>79,6 kg</td><td>—</td><td>83 cm</td></tr><tr><td>15/11</td><td>80,4 kg</td><td>—</td><td>—</td></tr></table></div>
  <div class="card"><h2>Nueva medición</h2>
    ${field('Fecha', '22/11/2026', 'err', 'Ya registraste una medición en esta fecha.')}
    ${field('Peso (kg)', '78,4')}
    <div class="row">${field('% grasa (opcional)', '19')}${field('Cintura cm (opcional)', '82')}</div>
    <span class="btn">Guardar medición</span>
    <p class="m" style="color:var(--muted);margin-top:12px">Con una sola medición verás el punto y un aviso: “Se necesitan más mediciones para ver tendencia”.</p></div></div>` });

for (const s of screens) writeFileSync(join(root, 'html', `${s.id}.html`), shell(s));
console.log(`${screens.length} mockups generados en ${join(root, 'html')}`);
