import type { CampoError, EstadoObjetivo, GrupoMuscular } from '../types';
import type { GymApi } from './contrato';
import { ApiError } from './error';

/** URL del backend. Se puede cambiar con VITE_API_URL (ej. al desplegar la API en un servidor). */
const BASE = (import.meta.env.VITE_API_URL as string | undefined) ?? 'http://localhost:8080';

interface CuerpoDeError {
  message?: string;
  errores?: CampoError[];
}

/**
 * Hace una petición a `/api{ruta}` y devuelve el JSON. Si el backend responde con un error (4xx/5xx),
 * lo convierte en un {@link ApiError} con el mensaje y los campos inválidos del cuerpo uniforme.
 * Si ni siquiera hay respuesta (API caída, CORS), el error de red se propaga tal cual y la pantalla
 * muestra el mensaje genérico de `textoDeError`.
 */
async function pedir<T>(metodo: string, ruta: string, cuerpo?: unknown): Promise<T> {
  const respuesta = await fetch(`${BASE}/api${ruta}`, {
    method: metodo,
    headers: cuerpo !== undefined ? { 'Content-Type': 'application/json' } : undefined,
    body: cuerpo !== undefined ? JSON.stringify(cuerpo) : undefined,
  });
  if (!respuesta.ok) {
    let datos: CuerpoDeError = {};
    try {
      datos = (await respuesta.json()) as CuerpoDeError;
    } catch {
      // el cuerpo no era JSON: se usa el mensaje por defecto
    }
    throw new ApiError(respuesta.status, datos.message ?? `Error ${respuesta.status}`, datos.errores ?? []);
  }
  return (respuesta.status === 204 ? undefined : await respuesta.json()) as T;
}

/** Implementación real de {@link GymApi}: una función por operación del contrato (docs/05-contrato-api.md). */
export function crearHttp(): GymApi {
  return {
    listarMiembros: () => pedir('GET', '/miembros'),
    listarEntrenadores: () => pedir('GET', '/entrenadores'),
    crearMiembro: (req) => pedir('POST', '/miembros', req),
    crearEntrenador: (req) => pedir('POST', '/entrenadores', req),
    obtenerMiembro: (id) => pedir('GET', `/miembros/${id}`),
    actualizarMiembro: (id, req) => pedir('PUT', `/miembros/${id}`, req),

    listarEjercicios: (grupo?: GrupoMuscular) =>
      pedir('GET', grupo ? `/ejercicios?grupoMuscular=${grupo}` : '/ejercicios'),
    crearEjercicio: (req) => pedir('POST', '/ejercicios', req),

    listarObjetivos: (miembroId) => pedir('GET', `/miembros/${miembroId}/objetivos`),
    crearObjetivo: (miembroId, req) => pedir('POST', `/miembros/${miembroId}/objetivos`, req),
    cambiarEstadoObjetivo: (id, estado: Exclude<EstadoObjetivo, 'ACTIVO'>) =>
      pedir('PATCH', `/objetivos/${id}/estado`, { estado }),

    listarRutinas: () => pedir('GET', '/rutinas'),
    detalleRutina: (id) => pedir('GET', `/rutinas/${id}`),
    crearRutina: (req) => pedir('POST', '/rutinas', req),
    asignarRutina: (miembroId, req) => pedir('POST', `/miembros/${miembroId}/asignaciones`, req),
    rutinaActiva: (miembroId) => pedir('GET', `/miembros/${miembroId}/rutina-activa`),

    listarSesiones: (miembroId) => pedir('GET', `/miembros/${miembroId}/sesiones`),
    detalleSesion: (id) => pedir('GET', `/sesiones/${id}`),
    registrarSesion: (miembroId, req) => pedir('POST', `/miembros/${miembroId}/sesiones`, req),

    listarMediciones: (miembroId) => pedir('GET', `/miembros/${miembroId}/mediciones`),
    registrarMedicion: (miembroId, req) => pedir('POST', `/miembros/${miembroId}/mediciones`, req),
    panel: (miembroId) => pedir('GET', `/miembros/${miembroId}/panel`),
  };
}
