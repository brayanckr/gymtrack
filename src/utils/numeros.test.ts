import { describe, expect, it } from 'vitest';
import { aNumero } from './numeros';

describe('aNumero', () => {
  it('un campo vacío es faltante (NaN → null en JSON), no cero', () => {
    expect(aNumero('')).toBeNaN();
    expect(aNumero('   ')).toBeNaN();
    expect(JSON.stringify({ v: aNumero('') })).toBe('{"v":null}');
  });

  it('convierte enteros y decimales', () => {
    expect(aNumero('168')).toBe(168);
    expect(aNumero('78.4')).toBe(78.4);
    expect(aNumero('0')).toBe(0); // el cero escrito expresamente sí es un valor
  });
});
