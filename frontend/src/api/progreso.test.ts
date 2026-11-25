import { describe, expect, it } from 'vitest';
import { porcentaje } from './progreso';

// Los mismos casos que ProgresoServiceTest del backend: el modo demo debe calcular igual que la API.
describe('porcentaje (RN-07)', () => {
  it('bajar de peso es proporcional al recorrido', () => {
    expect(porcentaje(82, 75, 78.4)).toBe(51.4);
  });

  it('subir un objetivo de fuerza usa la misma fórmula', () => {
    expect(porcentaje(60, 80, 70)).toBe(50);
  });

  it('superar la meta no pasa de 100', () => {
    expect(porcentaje(60, 80, 95)).toBe(100);
  });

  it('sin avance o con retroceso es 0', () => {
    expect(porcentaje(82, 75, 82)).toBe(0);
    expect(porcentaje(82, 75, 85)).toBe(0);
  });

  it('meta igual al inicial no divide entre cero', () => {
    expect(porcentaje(70, 70, 70)).toBe(0);
  });
});
