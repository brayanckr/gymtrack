import { ApiError } from './error';

/**
 * Reparte un error de la API entre los campos de un formulario.
 *
 * - Un 400 de validación trae la lista `errores` con el campo exacto.
 * - Un 409 o un 400 de regla de negocio solo trae un mensaje; `pistas` indica qué palabra del mensaje
 *   corresponde a qué campo (ej. `{ correo: 'correo' }`) para marcarlo junto a su control.
 *
 * `general` queda definido solo si ningún campo reclamó el error: es el que se muestra arriba del formulario.
 */
export function analizarError(error: unknown, pistas: Record<string, string> = {}) {
  const api = error instanceof ApiError ? error : undefined;
  const campos: Record<string, string> = {};

  api?.errores.forEach((e) => {
    campos[e.campo] = e.mensaje;
  });
  if (api) {
    for (const [campo, pista] of Object.entries(pistas)) {
      if (!campos[campo] && api.message.toLowerCase().includes(pista)) campos[campo] = api.message;
    }
  }

  return {
    /** Mensaje del campo indicado, si lo hay. */
    campo: (nombre: string): string | undefined => campos[nombre],
    /** El error si no se atribuyó a ningún campo; `undefined` si no hay error o ya está junto a su campo. */
    general: error && Object.keys(campos).length === 0 ? error : undefined,
  };
}
