// Tipos del contrato de la API (docs/05-contrato-api.md). Reflejan los DTO del backend; no contienen lógica.

export type TipoObjetivo = 'PESO_CORPORAL' | 'FRECUENCIA_SEMANAL' | 'FUERZA_EJERCICIO';
export type EstadoObjetivo = 'ACTIVO' | 'CUMPLIDO' | 'CANCELADO';
export type GrupoMuscular = 'PECHO' | 'ESPALDA' | 'PIERNAS' | 'HOMBROS' | 'BRAZOS' | 'CORE';
export type NivelRutina = 'PRINCIPIANTE' | 'INTERMEDIO' | 'AVANZADO';
export type DiaSemana = 'LUNES' | 'MARTES' | 'MIERCOLES' | 'JUEVES' | 'VIERNES' | 'SABADO' | 'DOMINGO';
export type EstadoAsignacion = 'ACTIVA' | 'FINALIZADA';

/** Fecha ISO sin hora: "2026-11-23". */
export type Fecha = string;

// ---------------------------------------------------------------- usuarios

export interface Miembro {
  id: string;
  tipo: 'MIEMBRO';
  identificacion: string;
  nombre: string;
  correo: string;
  fechaNacimiento: Fecha;
  alturaCm: number;
}

export interface Entrenador {
  id: string;
  tipo: 'ENTRENADOR';
  identificacion: string;
  nombre: string;
  correo: string;
  especialidad: string;
}

export type Usuario = Miembro | Entrenador;

export interface MiembroRequest {
  identificacion: string;
  nombre: string;
  correo: string;
  fechaNacimiento: Fecha;
  alturaCm: number;
}

export interface EntrenadorRequest {
  identificacion: string;
  nombre: string;
  correo: string;
  especialidad: string;
}

export interface MiembroUpdateRequest {
  nombre: string;
  correo: string;
  alturaCm: number;
}

// ---------------------------------------------------------------- ejercicios

export interface Ejercicio {
  id: string;
  nombre: string;
  grupoMuscular: GrupoMuscular;
  descripcion?: string | null;
}

export interface EjercicioRequest {
  entrenadorId: string;
  nombre: string;
  grupoMuscular: GrupoMuscular;
  descripcion?: string;
}

// ---------------------------------------------------------------- objetivos

export interface Progreso {
  valorActual: number;
  porcentaje: number;
}

export interface Objetivo {
  id: string;
  miembroId: string;
  ejercicioId?: string | null;
  tipo: TipoObjetivo;
  descripcion: string;
  valorInicial: number;
  valorMeta: number;
  fechaInicio: Fecha;
  fechaLimite: Fecha;
  estado: EstadoObjetivo;
  progreso: Progreso;
}

export interface ObjetivoRequest {
  tipo: TipoObjetivo;
  descripcion: string;
  valorInicial: number;
  valorMeta: number;
  fechaLimite: Fecha;
  ejercicioId?: string;
}

// ---------------------------------------------------------------- rutinas

export interface EjercicioPrescrito {
  orden: number;
  dia: DiaSemana;
  ejercicioId: string;
  ejercicioNombre: string;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
}

export interface RutinaResumen {
  id: string;
  nombre: string;
  nivel: NivelRutina;
  entrenadorId: string;
  entrenadorNombre: string;
  totalEjercicios: number;
}

export interface Rutina {
  id: string;
  nombre: string;
  descripcion?: string | null;
  nivel: NivelRutina;
  entrenadorId: string;
  entrenadorNombre: string;
  ejercicios: EjercicioPrescrito[];
}

export interface EjercicioPrescritoRequest {
  ejercicioId: string;
  dia: DiaSemana;
  series: number;
  repeticiones: number;
  descansoSegundos: number;
}

export interface RutinaRequest {
  entrenadorId: string;
  nombre: string;
  descripcion?: string;
  nivel: NivelRutina;
  ejercicios: EjercicioPrescritoRequest[];
}

export interface Asignacion {
  id: string;
  miembroId: string;
  entrenadorId: string;
  rutinaId: string;
  rutinaNombre: string;
  fechaInicio: Fecha;
  fechaFin?: Fecha | null;
  estado: EstadoAsignacion;
}

export interface AsignacionRequest {
  rutinaId: string;
  entrenadorId: string;
}

export interface RutinaActiva {
  asignacion: Asignacion;
  rutina: Rutina;
}

// ---------------------------------------------------------------- sesiones

export interface SerieRequest {
  ejercicioId: string;
  repeticiones: number;
  pesoKg: number;
}

export interface SesionRequest {
  fecha: Fecha;
  duracionMinutos: number;
  rutinaId?: string;
  notas?: string;
  series: SerieRequest[];
}

export interface Serie {
  numeroSerie: number;
  ejercicioId: string;
  ejercicioNombre: string;
  repeticiones: number;
  pesoKg: number;
}

export interface SesionResumen {
  id: string;
  fecha: Fecha;
  duracionMinutos: number;
  rutinaId?: string | null;
  rutinaNombre?: string | null;
  totalSeries: number;
}

export interface Sesion {
  id: string;
  miembroId: string;
  fecha: Fecha;
  duracionMinutos: number;
  rutinaId?: string | null;
  rutinaNombre?: string | null;
  notas?: string | null;
  series: Serie[];
}

// ---------------------------------------------------------------- mediciones y panel

export interface MedicionRequest {
  fecha: Fecha;
  pesoKg: number;
  porcentajeGrasa?: number;
  cinturaCm?: number;
}

export interface Medicion {
  id: string;
  miembroId: string;
  fecha: Fecha;
  pesoKg: number;
  porcentajeGrasa?: number | null;
  cinturaCm?: number | null;
}

export interface Panel {
  ultimoPesoKg: number | null;
  variacionPesoKg: number | null;
  sesionesDelMes: number;
  ultimaSesion: SesionResumen | null;
  objetivosActivos: Objetivo[];
  rutinaActiva: { rutinaId: string; nombre: string; desde: Fecha } | null;
}

// ---------------------------------------------------------------- errores

export interface CampoError {
  campo: string;
  mensaje: string;
}
