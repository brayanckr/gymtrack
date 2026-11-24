import type { ReactNode } from 'react';
import { textoDeError } from '../api';

/** Estado de carga. */
export function Cargando({ texto = 'Cargando…' }: { texto?: string }) {
  return <p className="muted" role="status">{texto}</p>;
}

/** Estado vacío: explica por qué no hay nada y, si procede, ofrece la acción para crear el primero. */
export function Vacio({ mensaje, accion }: { mensaje: string; accion?: ReactNode }) {
  return (
    <div className="empty">
      <p>{mensaje}</p>
      {accion}
    </div>
  );
}

/** Error de carga o de envío, con el mensaje que devolvió la API. */
export function ErrorCaja({ error }: { error: unknown }) {
  return <div className="alert" role="alert">{textoDeError(error)}</div>;
}
