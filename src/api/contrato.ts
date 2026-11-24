import type {
  Asignacion, AsignacionRequest, Ejercicio, EjercicioRequest, Entrenador, EntrenadorRequest, EstadoObjetivo,
  GrupoMuscular, Medicion, MedicionRequest, Miembro, MiembroRequest, MiembroUpdateRequest, Objetivo,
  ObjetivoRequest, Panel, Rutina, RutinaActiva, RutinaRequest, RutinaResumen, Sesion, SesionRequest,
  SesionResumen,
} from '../types';

/**
 * Lo que la interfaz necesita de la API. Tiene dos implementaciones intercambiables: `http.ts` (llama a
 * gymtrack-backend) y `mock.ts` (datos en memoria para la demo). Las páginas solo conocen esta interfaz.
 */
export interface GymApi {
  // Usuarios (HU-01, 02, 03)
  listarMiembros(): Promise<Miembro[]>;
  listarEntrenadores(): Promise<Entrenador[]>;
  crearMiembro(req: MiembroRequest): Promise<Miembro>;
  crearEntrenador(req: EntrenadorRequest): Promise<Entrenador>;
  obtenerMiembro(id: string): Promise<Miembro>;
  actualizarMiembro(id: string, req: MiembroUpdateRequest): Promise<Miembro>;

  // Catálogo (HU-07, 08)
  listarEjercicios(grupo?: GrupoMuscular): Promise<Ejercicio[]>;
  crearEjercicio(req: EjercicioRequest): Promise<Ejercicio>;

  // Objetivos (HU-04, 05, 06)
  listarObjetivos(miembroId: string): Promise<Objetivo[]>;
  crearObjetivo(miembroId: string, req: ObjetivoRequest): Promise<Objetivo>;
  cambiarEstadoObjetivo(id: string, estado: Exclude<EstadoObjetivo, 'ACTIVO'>): Promise<Objetivo>;

  // Rutinas (HU-09 a 12)
  listarRutinas(): Promise<RutinaResumen[]>;
  detalleRutina(id: string): Promise<Rutina>;
  crearRutina(req: RutinaRequest): Promise<Rutina>;
  asignarRutina(miembroId: string, req: AsignacionRequest): Promise<Asignacion>;
  rutinaActiva(miembroId: string): Promise<RutinaActiva>;

  // Sesiones (HU-13, 14)
  listarSesiones(miembroId: string): Promise<SesionResumen[]>;
  detalleSesion(id: string): Promise<Sesion>;
  registrarSesion(miembroId: string, req: SesionRequest): Promise<Sesion>;

  // Mediciones y panel (HU-15, 16, 17)
  listarMediciones(miembroId: string): Promise<Medicion[]>;
  registrarMedicion(miembroId: string, req: MedicionRequest): Promise<Medicion>;
  panel(miembroId: string): Promise<Panel>;
}
