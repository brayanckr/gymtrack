/** Barra de avance de un objetivo (0–100 %). El texto alternativo permite leer el valor sin ver el color. */
export function BarraProgreso({ porcentaje, completo = false }: { porcentaje: number; completo?: boolean }) {
  return (
    <div
      className={`bar${completo ? ' ok' : ''}`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={porcentaje}
      aria-label={`Avance ${porcentaje} %`}
    >
      <i style={{ width: `${porcentaje}%` }} />
    </div>
  );
}
