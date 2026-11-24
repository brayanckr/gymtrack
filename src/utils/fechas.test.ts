import { describe, expect, it } from 'vitest';
import { formatear, formatearCorto, lunesDe, sumarDias } from './fechas';

describe('fechas ISO', () => {
  it('el lunes de un miércoles es dos días antes', () => {
    expect(lunesDe('2026-11-25')).toBe('2026-11-23'); // miércoles → lunes
  });

  it('el lunes de un domingo es seis días antes (la semana va de lunes a domingo)', () => {
    expect(lunesDe('2026-11-29')).toBe('2026-11-23');
  });

  it('un lunes es su propio lunes', () => {
    expect(lunesDe('2026-11-23')).toBe('2026-11-23');
  });

  it('sumar días cruza el fin de mes y de año', () => {
    expect(sumarDias('2026-11-30', 1)).toBe('2026-12-01');
    expect(sumarDias('2026-12-31', 1)).toBe('2027-01-01');
    expect(sumarDias('2026-11-23', -23)).toBe('2026-10-31');
  });

  it('formatea para mostrar', () => {
    expect(formatear('2026-11-23')).toBe('23/11/2026');
    expect(formatearCorto('2026-11-23')).toBe('23/11');
    expect(formatear(null)).toBe('—');
  });
});
