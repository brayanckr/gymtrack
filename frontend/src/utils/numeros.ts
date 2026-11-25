/**
 * Convierte el texto de un campo numérico. Un campo vacío es "faltante", no cero: devuelve `NaN`, que
 * `JSON.stringify` serializa como `null`, y así el backend responde "es obligatorio" en lugar de aceptar un 0
 * que el usuario nunca escribió.
 */
export function aNumero(texto: string): number {
  return texto.trim() === '' ? Number.NaN : Number(texto);
}
