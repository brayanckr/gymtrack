// Utilidades de fechas ISO ("2026-11-23"). Se trabaja siempre con cadenas ISO sin hora para evitar los
// desfases de zona horaria que aparecen al convertir a Date y volver.

const DIAS_MS = 24 * 60 * 60 * 1000;

function aDate(iso: string): Date {
  const [a, m, d] = iso.split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, d));
}

function aIso(fecha: Date): string {
  return fecha.toISOString().slice(0, 10);
}

/** Fecha de hoy en la zona horaria local, en formato ISO. */
export function hoy(): string {
  const f = new Date();
  const mes = String(f.getMonth() + 1).padStart(2, '0');
  const dia = String(f.getDate()).padStart(2, '0');
  return `${f.getFullYear()}-${mes}-${dia}`;
}

export function sumarDias(iso: string, dias: number): string {
  return aIso(new Date(aDate(iso).getTime() + dias * DIAS_MS));
}

/** Lunes de la semana de la fecha (la semana va de lunes a domingo, como en el backend). */
export function lunesDe(iso: string): string {
  const diaSemana = aDate(iso).getUTCDay(); // 0 = domingo
  const desdeLunes = (diaSemana + 6) % 7;
  return sumarDias(iso, -desdeLunes);
}

/** "2026-11-23" → "23/11/2026". */
export function formatear(iso: string | null | undefined): string {
  if (!iso) return '—';
  const [a, m, d] = iso.split('-');
  return `${d}/${m}/${a}`;
}

/** "2026-11-23" → "23/11". */
export function formatearCorto(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}

/** Número con coma decimal (es-CO): 78.4 → "78,4". */
export function numero(n: number | null | undefined, decimales = 1): string {
  if (n === null || n === undefined) return '—';
  return n.toLocaleString('es-CO', { maximumFractionDigits: decimales });
}
