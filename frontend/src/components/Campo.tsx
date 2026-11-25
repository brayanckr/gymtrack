import type { ReactNode } from 'react';

/**
 * Campo de formulario accesible: la etiqueta envuelve al control (se asocia sin ids) y el error de
 * validación, si lo hay, se anuncia junto al campo.
 */
export function Campo({ etiqueta, error, children }: { etiqueta: string; error?: string; children: ReactNode }) {
  return (
    <label className="field">
      <span className="field-label">{etiqueta}</span>
      {children}
      {error && <span className="err-t" role="alert">{error}</span>}
    </label>
  );
}
