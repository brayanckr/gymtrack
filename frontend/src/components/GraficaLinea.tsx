import { numero } from '../utils/fechas';

export interface Punto {
  etiqueta: string;
  valor: number;
}

const ANCHO = 460;
const ALTO = 190;
const MARGEN = { izq: 34, der: 20, arriba: 24, abajo: 32 };

/**
 * Gráfica de línea simple en SVG (evolución del peso, HU-16). Con un solo punto dibuja el punto sin línea:
 * la pantalla explica que se necesitan más mediciones para ver la tendencia.
 */
export function GraficaLinea({ puntos, unidad }: { puntos: Punto[]; unidad: string }) {
  if (puntos.length === 0) return null;

  const valores = puntos.map((p) => p.valor);
  const minimo = Math.min(...valores);
  const maximo = Math.max(...valores);
  const rango = maximo - minimo || 1; // evita dividir entre cero si todos los valores son iguales
  const util = { w: ANCHO - MARGEN.izq - MARGEN.der, h: ALTO - MARGEN.arriba - MARGEN.abajo };

  const x = (i: number) => MARGEN.izq + (puntos.length === 1 ? util.w / 2 : (i / (puntos.length - 1)) * util.w);
  const y = (v: number) => MARGEN.arriba + util.h - ((v - minimo) / rango) * util.h;
  const linea = puntos.map((p, i) => `${x(i)},${y(p.valor)}`).join(' ');

  return (
    <svg viewBox={`0 0 ${ANCHO} ${ALTO}`} width="100%" role="img" aria-label={`Evolución en ${unidad}`}>
      {[0, 0.5, 1].map((t) => (
        <line key={t} x1={MARGEN.izq} x2={ANCHO - MARGEN.der} y1={MARGEN.arriba + util.h * t} y2={MARGEN.arriba + util.h * t} stroke="#e7e5e4" />
      ))}
      {puntos.length > 1 && <polyline fill="none" stroke="#c2410c" strokeWidth={3} points={linea} />}
      {puntos.map((p, i) => (
        <g key={p.etiqueta}>
          <circle cx={x(i)} cy={y(p.valor)} r={5} fill="#c2410c" />
          <text x={x(i)} y={y(p.valor) - 10} fontSize={11} textAnchor="middle" fill="#44403c">{numero(p.valor)}</text>
          <text x={x(i)} y={ALTO - 10} fontSize={10} textAnchor="middle" fill="#78716c">{p.etiqueta}</text>
        </g>
      ))}
    </svg>
  );
}
