import type {
  Asignacion, CampoError, Ejercicio, EjercicioPrescrito, Entrenador, Medicion, Miembro, Objetivo, Panel,
  Progreso, Rutina, RutinaActiva, Sesion, SesionResumen,
} from '../types';
import type { GymApi } from './contrato';
import { ApiError } from './error';
import { porcentaje } from './progreso';
import { hoy, lunesDe, sumarDias } from '../utils/fechas';

/**
 * Implementación en memoria de {@link GymApi} para la demostración sin backend (`npm run demo`).
 *
 * Reproduce la semántica del backend: mismas reglas de negocio (RN-xx), mismos códigos de error y la misma
 * fórmula de progreso. No es un sustituto de la API: los datos viven solo mientras la pestaña está abierta.
 */

type ObjetivoGuardado = Omit<Objetivo, 'progreso'>;

interface RutinaGuardada {
  id: string;
  nombre: string;
  descripcion: string | null;
  nivel: Rutina['nivel'];
  entrenadorId: string;
  ejercicios: Omit<EjercicioPrescrito, 'ejercicioNombre'>[];
}

interface SesionGuardada {
  id: string;
  miembroId: string;
  fecha: string;
  duracionMinutos: number;
  rutinaId: string | null;
  notas: string | null;
  series: { numeroSerie: number; ejercicioId: string; repeticiones: number; pesoKg: number }[];
}

function lanzar(status: number, mensaje: string, errores: CampoError[] = []): never {
  throw new ApiError(status, mensaje, errores);
}

/** Falla con 400 y la lista de campos si alguno de los obligatorios viene vacío (equivale a @NotBlank/@NotNull). */
function exigir(campos: Record<string, unknown>): void {
  const errores: CampoError[] = Object.entries(campos)
    .filter(([, v]) => v === undefined || v === null || (typeof v === 'string' && v.trim() === '') ||
      (typeof v === 'number' && Number.isNaN(v)))
    .map(([campo]) => ({ campo, mensaje: 'es obligatorio' }));
  if (errores.length > 0) lanzar(400, 'Datos inválidos', errores);
}

export function crearMock(): GymApi {
  let secuencia = 0;
  const nuevoId = (prefijo: string): string => `${prefijo}-${++secuencia}`;
  const hoyIso = hoy();
  const latencia = <T,>(valor: T): Promise<T> =>
    new Promise((resolver) => setTimeout(() => resolver(structuredClone(valor)), 120));

  // ------------------------------------------------------------------ datos de ejemplo (como DataSeeder)
  const entrenadores: Entrenador[] = [
    { id: 'e-andres', tipo: 'ENTRENADOR', identificacion: '900001', nombre: 'Andrés Pardo', correo: 'andres@gymtrack.demo', especialidad: 'Fuerza e hipertrofia' },
    { id: 'e-laura', tipo: 'ENTRENADOR', identificacion: '900002', nombre: 'Laura Mejía', correo: 'laura@gymtrack.demo', especialidad: 'Acondicionamiento general' },
  ];
  const miembros: Miembro[] = [
    { id: 'm-camila', tipo: 'MIEMBRO', identificacion: '1001234567', nombre: 'Camila Rojas', correo: 'camila@gymtrack.demo', fechaNacimiento: '1999-03-14', alturaCm: 168 },
    { id: 'm-luis', tipo: 'MIEMBRO', identificacion: '1007654321', nombre: 'Luis Gómez', correo: 'luis@gymtrack.demo', fechaNacimiento: '1995-08-02', alturaCm: 180 },
  ];
  const ejercicios: Ejercicio[] = [
    { id: 'x-sentadilla', nombre: 'Sentadilla', grupoMuscular: 'PIERNAS', descripcion: 'Flexión de cadera y rodilla con barra' },
    { id: 'x-press', nombre: 'Press de banca', grupoMuscular: 'PECHO', descripcion: 'Empuje horizontal con barra' },
    { id: 'x-muerto', nombre: 'Peso muerto', grupoMuscular: 'ESPALDA', descripcion: 'Levantamiento desde el suelo' },
    { id: 'x-militar', nombre: 'Press militar', grupoMuscular: 'HOMBROS', descripcion: 'Empuje vertical' },
    { id: 'x-remo', nombre: 'Remo con barra', grupoMuscular: 'ESPALDA', descripcion: 'Tirón horizontal con barra' },
    { id: 'x-curl', nombre: 'Curl con barra', grupoMuscular: 'BRAZOS', descripcion: 'Flexión de codos con barra' },
    { id: 'x-plancha', nombre: 'Plancha', grupoMuscular: 'CORE', descripcion: 'Isométrico de peso corporal' },
  ];
  const pres = (orden: number, dia: EjercicioPrescrito['dia'], ejercicioId: string, series: number, repeticiones: number, descansoSegundos: number) =>
    ({ orden, dia, ejercicioId, series, repeticiones, descansoSegundos });
  const rutinas: RutinaGuardada[] = [
    { id: 'r-fuerza', nombre: 'Fuerza 3 días', descripcion: 'Tres días de trabajo de fuerza con ejercicios compuestos.', nivel: 'INTERMEDIO', entrenadorId: 'e-andres',
      ejercicios: [pres(1, 'LUNES', 'x-sentadilla', 5, 5, 120), pres(2, 'LUNES', 'x-press', 5, 5, 120), pres(3, 'MIERCOLES', 'x-muerto', 3, 5, 150), pres(4, 'VIERNES', 'x-militar', 4, 6, 90), pres(5, 'VIERNES', 'x-sentadilla', 3, 8, 90)] },
    { id: 'r-hiper', nombre: 'Hipertrofia 4 días', descripcion: 'Cuatro días con volumen alto para ganar masa muscular.', nivel: 'AVANZADO', entrenadorId: 'e-andres',
      ejercicios: [pres(1, 'LUNES', 'x-press', 4, 10, 75), pres(2, 'MARTES', 'x-remo', 4, 10, 75), pres(3, 'JUEVES', 'x-sentadilla', 4, 10, 90), pres(4, 'VIERNES', 'x-curl', 3, 12, 60)] },
    { id: 'r-full', nombre: 'Full body principiante', descripcion: 'Cuerpo completo, dos días por semana.', nivel: 'PRINCIPIANTE', entrenadorId: 'e-andres',
      ejercicios: [pres(1, 'MARTES', 'x-sentadilla', 3, 10, 90), pres(2, 'MARTES', 'x-press', 3, 10, 90), pres(3, 'SABADO', 'x-plancha', 3, 1, 60)] },
  ];
  const asignaciones: Asignacion[] = [
    { id: 'a-1', miembroId: 'm-camila', entrenadorId: 'e-andres', rutinaId: 'r-fuerza', rutinaNombre: 'Fuerza 3 días', fechaInicio: sumarDias(hoyIso, -20), fechaFin: null, estado: 'ACTIVA' },
  ];
  const mediciones: Medicion[] = [
    { id: 'p-1', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -21), pesoKg: 82, cinturaCm: 84 },
    { id: 'p-2', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -14), pesoKg: 81.2 },
    { id: 'p-3', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -7), pesoKg: 80.4 },
    { id: 'p-4', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -3), pesoKg: 79.6, cinturaCm: 83 },
    { id: 'p-5', miembroId: 'm-camila', fecha: hoyIso, pesoKg: 78.4, cinturaCm: 82 },
  ];
  const serie = (n: number, ejercicioId: string, repeticiones: number, pesoKg: number) => ({ numeroSerie: n, ejercicioId, repeticiones, pesoKg });
  const sesiones: SesionGuardada[] = [
    { id: 's-1', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -5), duracionMinutos: 70, rutinaId: 'r-fuerza', notas: 'Buen ritmo.',
      series: [serie(1, 'x-sentadilla', 5, 95), serie(2, 'x-sentadilla', 5, 95), serie(3, 'x-press', 5, 70), serie(4, 'x-press', 5, 70)] },
    { id: 's-2', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -3), duracionMinutos: 55, rutinaId: null, notas: null,
      series: [serie(1, 'x-plancha', 1, 0), serie(2, 'x-curl', 10, 25)] },
    { id: 's-3', miembroId: 'm-camila', fecha: sumarDias(hoyIso, -1), duracionMinutos: 65, rutinaId: 'r-fuerza', notas: 'Subí peso en sentadilla.',
      series: [serie(1, 'x-sentadilla', 5, 100), serie(2, 'x-sentadilla', 5, 100), serie(3, 'x-muerto', 5, 110)] },
    { id: 's-4', miembroId: 'm-camila', fecha: hoyIso, duracionMinutos: 60, rutinaId: 'r-fuerza', notas: null,
      series: [serie(1, 'x-press', 5, 75), serie(2, 'x-press', 5, 75), serie(3, 'x-militar', 6, 40)] },
  ];
  const objetivos: ObjetivoGuardado[] = [
    { id: 'o-1', miembroId: 'm-camila', tipo: 'PESO_CORPORAL', descripcion: 'Bajar a 75 kg', valorInicial: 82, valorMeta: 75, fechaInicio: hoyIso, fechaLimite: sumarDias(hoyIso, 70), estado: 'ACTIVO', ejercicioId: null },
    { id: 'o-2', miembroId: 'm-camila', tipo: 'FUERZA_EJERCICIO', descripcion: 'Press de banca 80 kg', valorInicial: 60, valorMeta: 80, fechaInicio: hoyIso, fechaLimite: sumarDias(hoyIso, 82), estado: 'ACTIVO', ejercicioId: 'x-press' },
    { id: 'o-3', miembroId: 'm-camila', tipo: 'FRECUENCIA_SEMANAL', descripcion: 'Entrenar 4 veces por semana', valorInicial: 0, valorMeta: 4, fechaInicio: hoyIso, fechaLimite: sumarDias(hoyIso, 60), estado: 'ACTIVO', ejercicioId: null },
  ];

  // ------------------------------------------------------------------ ayudas (las "reglas" del backend)
  const miembroDe = (id: string): Miembro => miembros.find((m) => m.id === id) ?? lanzar(404, `No existe un miembro con id ${id}`);
  const ejercicioDe = (id: string): Ejercicio => ejercicios.find((e) => e.id === id) ?? lanzar(404, `No existe un ejercicio con id ${id}`);
  const rutinaDe = (id: string): RutinaGuardada => rutinas.find((r) => r.id === id) ?? lanzar(404, `No existe una rutina con id ${id}`);
  const entrenadorRequerido = (id: string, accion: string): Entrenador => {
    const e = entrenadores.find((x) => x.id === id);
    if (e) return e;
    if (miembros.some((m) => m.id === id)) lanzar(403, `Solo un entrenador puede ${accion}`);
    return lanzar(404, `No existe un entrenador con id ${id}`);
  };
  const correoLibre = (correo: string, salvoId?: string): void => {
    const c = correo.trim().toLowerCase();
    const usado = [...miembros, ...entrenadores].some((u) => u.correo === c && u.id !== salvoId);
    if (usado) lanzar(409, 'Ya existe un usuario con ese correo');
  };
  const identidadLibre = (identificacion: string): void => {
    if ([...miembros, ...entrenadores].some((u) => u.identificacion === identificacion.trim())) {
      lanzar(409, 'Ya existe un usuario con esa identificación');
    }
  };
  const edadEn = (nacimiento: string, fecha: string): number => {
    const [na, nm, nd] = nacimiento.split('-').map(Number);
    const [fa, fm, fd] = fecha.split('-').map(Number);
    return fa - na - (fm < nm || (fm === nm && fd < nd) ? 1 : 0);
  };

  const progresoDe = (o: ObjetivoGuardado): Progreso => {
    let actual = o.valorInicial;
    if (o.tipo === 'PESO_CORPORAL') {
      const ultima = mediciones.filter((m) => m.miembroId === o.miembroId).sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
      if (ultima) actual = ultima.pesoKg;
    } else if (o.tipo === 'FRECUENCIA_SEMANAL') {
      const lunes = lunesDe(hoyIso);
      const domingo = sumarDias(lunes, 6);
      actual = sesiones.filter((s) => s.miembroId === o.miembroId && s.fecha >= lunes && s.fecha <= domingo).length;
    } else {
      const pesos = sesiones.filter((s) => s.miembroId === o.miembroId && s.fecha >= o.fechaInicio)
        .flatMap((s) => s.series).filter((x) => x.ejercicioId === o.ejercicioId).map((x) => x.pesoKg);
      if (pesos.length > 0) actual = Math.max(...pesos);
    }
    return { valorActual: actual, porcentaje: porcentaje(o.valorInicial, o.valorMeta, actual) };
  };
  const aObjetivo = (o: ObjetivoGuardado): Objetivo => ({ ...o, progreso: progresoDe(o) });

  const aRutina = (r: RutinaGuardada): Rutina => ({
    id: r.id, nombre: r.nombre, descripcion: r.descripcion, nivel: r.nivel, entrenadorId: r.entrenadorId,
    entrenadorNombre: entrenadores.find((e) => e.id === r.entrenadorId)?.nombre ?? '',
    ejercicios: r.ejercicios.map((e) => ({ ...e, ejercicioNombre: ejercicioDe(e.ejercicioId).nombre })),
  });
  const nombreRutina = (id: string | null): string | null => (id ? rutinas.find((r) => r.id === id)?.nombre ?? null : null);
  const aResumenSesion = (s: SesionGuardada): SesionResumen => ({
    id: s.id, fecha: s.fecha, duracionMinutos: s.duracionMinutos, rutinaId: s.rutinaId,
    rutinaNombre: nombreRutina(s.rutinaId), totalSeries: s.series.length,
  });
  const aSesion = (s: SesionGuardada): Sesion => ({
    id: s.id, miembroId: s.miembroId, fecha: s.fecha, duracionMinutos: s.duracionMinutos, rutinaId: s.rutinaId,
    rutinaNombre: nombreRutina(s.rutinaId), notas: s.notas,
    series: s.series.map((x) => ({ ...x, ejercicioNombre: ejercicioDe(x.ejercicioId).nombre })),
  });
  const activaDe = (miembroId: string): Asignacion | undefined =>
    asignaciones.find((a) => a.miembroId === miembroId && a.estado === 'ACTIVA');

  // ------------------------------------------------------------------ la API
  return {
    async listarMiembros() { return latencia(miembros); },
    async listarEntrenadores() { return latencia(entrenadores); },

    async crearMiembro(req) {
      exigir({ identificacion: req.identificacion, nombre: req.nombre, correo: req.correo, fechaNacimiento: req.fechaNacimiento, alturaCm: req.alturaCm });
      if (req.alturaCm < 100 || req.alturaCm > 250) lanzar(400, 'Datos inválidos', [{ campo: 'alturaCm', mensaje: 'debe estar entre 100 y 250' }]);
      if (!/^\S+@\S+\.\S+$/.test(req.correo)) lanzar(400, 'Datos inválidos', [{ campo: 'correo', mensaje: 'no es un correo válido' }]);
      identidadLibre(req.identificacion);
      correoLibre(req.correo);
      if (req.fechaNacimiento >= hoyIso) lanzar(400, 'La fecha de nacimiento debe ser una fecha pasada');
      if (edadEn(req.fechaNacimiento, hoyIso) < 14) lanzar(400, 'Debes tener al menos 14 años para registrarte');
      const nuevo: Miembro = { id: nuevoId('m'), tipo: 'MIEMBRO', identificacion: req.identificacion.trim(), nombre: req.nombre.trim(), correo: req.correo.trim().toLowerCase(), fechaNacimiento: req.fechaNacimiento, alturaCm: req.alturaCm };
      miembros.push(nuevo);
      return latencia(nuevo);
    },
    async crearEntrenador(req) {
      exigir({ identificacion: req.identificacion, nombre: req.nombre, correo: req.correo, especialidad: req.especialidad });
      if (!/^\S+@\S+\.\S+$/.test(req.correo)) lanzar(400, 'Datos inválidos', [{ campo: 'correo', mensaje: 'no es un correo válido' }]);
      identidadLibre(req.identificacion);
      correoLibre(req.correo);
      const nuevo: Entrenador = { id: nuevoId('e'), tipo: 'ENTRENADOR', identificacion: req.identificacion.trim(), nombre: req.nombre.trim(), correo: req.correo.trim().toLowerCase(), especialidad: req.especialidad.trim() };
      entrenadores.push(nuevo);
      return latencia(nuevo);
    },
    async obtenerMiembro(id) { return latencia(miembroDe(id)); },
    async actualizarMiembro(id, req) {
      const m = miembroDe(id);
      exigir({ nombre: req.nombre, correo: req.correo, alturaCm: req.alturaCm });
      if (req.alturaCm < 100 || req.alturaCm > 250) lanzar(400, 'Datos inválidos', [{ campo: 'alturaCm', mensaje: 'debe estar entre 100 y 250' }]);
      correoLibre(req.correo, id);
      m.nombre = req.nombre.trim();
      m.correo = req.correo.trim().toLowerCase();
      m.alturaCm = req.alturaCm;
      return latencia(m);
    },

    async listarEjercicios(grupo) { return latencia(grupo ? ejercicios.filter((e) => e.grupoMuscular === grupo) : ejercicios); },
    async crearEjercicio(req) {
      exigir({ entrenadorId: req.entrenadorId, nombre: req.nombre, grupoMuscular: req.grupoMuscular });
      entrenadorRequerido(req.entrenadorId, 'registrar ejercicios en el catálogo');
      if (ejercicios.some((e) => e.nombre.toLowerCase() === req.nombre.trim().toLowerCase())) lanzar(409, 'Ya existe un ejercicio con ese nombre');
      const nuevo: Ejercicio = { id: nuevoId('x'), nombre: req.nombre.trim(), grupoMuscular: req.grupoMuscular, descripcion: req.descripcion?.trim() || null };
      ejercicios.push(nuevo);
      return latencia(nuevo);
    },

    async listarObjetivos(miembroId) {
      miembroDe(miembroId);
      return latencia(objetivos.filter((o) => o.miembroId === miembroId).map(aObjetivo));
    },
    async crearObjetivo(miembroId, req) {
      miembroDe(miembroId);
      exigir({ tipo: req.tipo, descripcion: req.descripcion, valorInicial: req.valorInicial, valorMeta: req.valorMeta, fechaLimite: req.fechaLimite });
      if (req.valorMeta <= 0 || req.valorInicial < 0 || (req.valorInicial === 0 && req.tipo !== 'FRECUENCIA_SEMANAL')) lanzar(400, 'El valor inicial y la meta deben ser positivos');
      if (req.valorInicial === req.valorMeta) lanzar(400, 'La meta no puede ser igual al valor inicial');
      if (req.fechaLimite <= hoyIso) lanzar(400, 'La fecha límite debe ser posterior a hoy');
      const ejercicioId = req.ejercicioId?.trim() || null;
      if (req.tipo === 'FUERZA_EJERCICIO') {
        if (!ejercicioId) lanzar(400, 'Un objetivo de fuerza requiere un ejercicio del catálogo');
        ejercicioDe(ejercicioId);
      } else if (ejercicioId) {
        lanzar(400, 'Solo los objetivos de fuerza admiten un ejercicio');
      }
      const nuevo: ObjetivoGuardado = { id: nuevoId('o'), miembroId, ejercicioId, tipo: req.tipo, descripcion: req.descripcion.trim(), valorInicial: req.valorInicial, valorMeta: req.valorMeta, fechaInicio: hoyIso, fechaLimite: req.fechaLimite, estado: 'ACTIVO' };
      objetivos.push(nuevo);
      return latencia(aObjetivo(nuevo));
    },
    async cambiarEstadoObjetivo(id, estado) {
      const o = objetivos.find((x) => x.id === id) ?? lanzar(404, `No existe un objetivo con id ${id}`);
      if (o.estado !== 'ACTIVO') lanzar(409, `El objetivo ya está ${o.estado} y no puede cambiar de estado`);
      o.estado = estado;
      return latencia(aObjetivo(o));
    },

    async listarRutinas() {
      return latencia(rutinas.map((r) => ({ id: r.id, nombre: r.nombre, nivel: r.nivel, entrenadorId: r.entrenadorId, entrenadorNombre: aRutina(r).entrenadorNombre, totalEjercicios: r.ejercicios.length })));
    },
    async detalleRutina(id) { return latencia(aRutina(rutinaDe(id))); },
    async crearRutina(req) {
      exigir({ entrenadorId: req.entrenadorId, nombre: req.nombre, nivel: req.nivel });
      entrenadorRequerido(req.entrenadorId, 'crear rutinas');
      if (!req.ejercicios || req.ejercicios.length === 0) lanzar(400, 'Una rutina necesita al menos un ejercicio');
      const ejerciciosPrescritos = req.ejercicios.map((e, i) => {
        ejercicioDe(e.ejercicioId);
        if (e.series < 1 || e.repeticiones < 1 || e.descansoSegundos < 0) lanzar(400, 'Series y repeticiones deben ser al menos 1 y el descanso no puede ser negativo');
        return { orden: i + 1, dia: e.dia, ejercicioId: e.ejercicioId, series: e.series, repeticiones: e.repeticiones, descansoSegundos: e.descansoSegundos };
      });
      const nueva: RutinaGuardada = { id: nuevoId('r'), nombre: req.nombre.trim(), descripcion: req.descripcion?.trim() || null, nivel: req.nivel, entrenadorId: req.entrenadorId, ejercicios: ejerciciosPrescritos };
      rutinas.push(nueva);
      return latencia(aRutina(nueva));
    },
    async asignarRutina(miembroId, req) {
      miembroDe(miembroId);
      entrenadorRequerido(req.entrenadorId, 'asignar rutinas');
      const rutina = rutinaDe(req.rutinaId);
      const previa = activaDe(miembroId);
      if (previa) { previa.estado = 'FINALIZADA'; previa.fechaFin = hoyIso; } // RN-11
      const nueva: Asignacion = { id: nuevoId('a'), miembroId, entrenadorId: req.entrenadorId, rutinaId: rutina.id, rutinaNombre: rutina.nombre, fechaInicio: hoyIso, fechaFin: null, estado: 'ACTIVA' };
      asignaciones.push(nueva);
      return latencia(nueva);
    },
    async rutinaActiva(miembroId): Promise<RutinaActiva> {
      miembroDe(miembroId);
      const a = activaDe(miembroId) ?? lanzar(404, 'Aún no te han asignado una rutina');
      return latencia({ asignacion: a, rutina: aRutina(rutinaDe(a.rutinaId)) });
    },

    async listarSesiones(miembroId) {
      miembroDe(miembroId);
      return latencia(sesiones.filter((s) => s.miembroId === miembroId).sort((a, b) => b.fecha.localeCompare(a.fecha)).map(aResumenSesion));
    },
    async detalleSesion(id) { return latencia(aSesion(sesiones.find((s) => s.id === id) ?? lanzar(404, `No existe una sesión con id ${id}`))); },
    async registrarSesion(miembroId, req) {
      miembroDe(miembroId);
      exigir({ fecha: req.fecha, duracionMinutos: req.duracionMinutos });
      if (req.fecha > hoyIso) lanzar(400, 'La fecha de la sesión no puede ser futura');
      if (req.duracionMinutos < 1) lanzar(400, 'La duración debe ser mayor que 0');
      if (!req.series || req.series.length === 0) lanzar(400, 'Una sesión necesita al menos una serie');
      const rutinaId = req.rutinaId?.trim() || null;
      if (rutinaId) rutinaDe(rutinaId);
      const series = req.series.map((s, i) => {
        ejercicioDe(s.ejercicioId);
        if (s.repeticiones < 1 || s.pesoKg < 0) lanzar(400, `La serie ${i + 1} no es válida: repeticiones ≥ 1 y peso ≥ 0`);
        return { numeroSerie: i + 1, ejercicioId: s.ejercicioId, repeticiones: s.repeticiones, pesoKg: s.pesoKg };
      });
      const nueva: SesionGuardada = { id: nuevoId('s'), miembroId, fecha: req.fecha, duracionMinutos: req.duracionMinutos, rutinaId, notas: req.notas?.trim() || null, series };
      sesiones.push(nueva);
      return latencia(aSesion(nueva));
    },

    async listarMediciones(miembroId) {
      miembroDe(miembroId);
      return latencia(mediciones.filter((m) => m.miembroId === miembroId).sort((a, b) => a.fecha.localeCompare(b.fecha)));
    },
    async registrarMedicion(miembroId, req) {
      miembroDe(miembroId);
      exigir({ fecha: req.fecha, pesoKg: req.pesoKg });
      if (req.fecha > hoyIso) lanzar(400, 'La fecha de la medición no puede ser futura');
      if (req.pesoKg < 20 || req.pesoKg > 400) lanzar(400, 'El peso debe estar entre 20 y 400 kg');
      if (req.porcentajeGrasa != null && (req.porcentajeGrasa < 1 || req.porcentajeGrasa > 70)) lanzar(400, 'El porcentaje de grasa debe estar entre 1 y 70');
      if (req.cinturaCm != null && req.cinturaCm <= 0) lanzar(400, 'La cintura debe ser mayor que 0');
      if (mediciones.some((m) => m.miembroId === miembroId && m.fecha === req.fecha)) lanzar(409, 'Ya registraste una medición en esa fecha'); // RN-16
      const nueva: Medicion = { id: nuevoId('p'), miembroId, fecha: req.fecha, pesoKg: req.pesoKg, porcentajeGrasa: req.porcentajeGrasa ?? null, cinturaCm: req.cinturaCm ?? null };
      mediciones.push(nueva);
      return latencia(nueva);
    },

    async panel(miembroId): Promise<Panel> {
      miembroDe(miembroId);
      const ms = mediciones.filter((m) => m.miembroId === miembroId).sort((a, b) => b.fecha.localeCompare(a.fecha));
      const mes = hoyIso.slice(0, 7);
      const suyas = sesiones.filter((s) => s.miembroId === miembroId).sort((a, b) => b.fecha.localeCompare(a.fecha));
      const activa = activaDe(miembroId);
      return latencia({
        ultimoPesoKg: ms[0]?.pesoKg ?? null,
        variacionPesoKg: ms.length >= 2 ? Math.round((ms[0].pesoKg - ms[1].pesoKg) * 10) / 10 : null,
        sesionesDelMes: suyas.filter((s) => s.fecha.startsWith(mes)).length,
        ultimaSesion: suyas[0] ? aResumenSesion(suyas[0]) : null,
        objetivosActivos: objetivos.filter((o) => o.miembroId === miembroId && o.estado === 'ACTIVO').map(aObjetivo),
        rutinaActiva: activa ? { rutinaId: activa.rutinaId, nombre: activa.rutinaNombre, desde: activa.fechaInicio } : null,
      });
    },
  };
}
