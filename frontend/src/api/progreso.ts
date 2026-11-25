/**
 * Fórmula de progreso de un objetivo (RN-07), la misma que aplica el backend en
 * `ProgresoService.porcentaje`: (actual − inicial) / (meta − inicial) × 100, acotada a [0, 100] y con un
 * decimal. La usa el modo demo para calcular el avance igual que la API real.
 */
export function porcentaje(inicial: number, meta: number, actual: number): number {
  const recorrido = meta - inicial;
  if (recorrido === 0) return 0;
  const bruto = ((actual - inicial) / recorrido) * 100;
  const acotado = Math.max(0, Math.min(100, bruto));
  return Math.round(acotado * 10) / 10;
}
