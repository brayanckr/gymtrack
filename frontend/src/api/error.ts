import type { CampoError } from '../types';

/**
 * Error de la API con el formato uniforme del backend ({status, message, errores[]}).
 * Las pantallas lo usan para mostrar el mensaje general y marcar los campos inválidos.
 */
export class ApiError extends Error {
  readonly status: number;
  readonly errores: CampoError[];

  constructor(status: number, message: string, errores: CampoError[] = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.errores = errores;
  }

  /** Mensaje del campo indicado, si el backend lo marcó como inválido. */
  mensajeDe(campo: string): string | undefined {
    return this.errores.find((e) => e.campo === campo)?.mensaje;
  }
}

/** Texto amigable para cualquier error capturado (API, red o inesperado). */
export function textoDeError(e: unknown): string {
  if (e instanceof ApiError) return e.message;
  return 'No se pudo conectar con el servidor. ¿Está en marcha la API?';
}
