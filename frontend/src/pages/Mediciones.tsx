import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { GraficaLinea } from '../components/GraficaLinea';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { formatear, formatearCorto, hoy, numero } from '../utils/fechas';
import { aNumero } from '../utils/numeros';

/** HU-15 (registrar una medición) y HU-16 (ver la evolución en gráfica y tabla). Mockup 11. */
export function Mediciones() {
  const { perfil } = useSesion();
  const mediciones = useAsync(() => api.listarMediciones(perfil!.id), [perfil?.id]);
  const [fecha, setFecha] = useState(hoy());
  const [peso, setPeso] = useState('');
  const [grasa, setGrasa] = useState('');
  const [cintura, setCintura] = useState('');
  const [error, setError] = useState<unknown>();
  const [enviando, setEnviando] = useState(false);
  const errores = analizarError(error, { fecha: 'fecha', pesoKg: 'peso', porcentajeGrasa: 'grasa', cinturaCm: 'cintura' });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      await api.registrarMedicion(perfil!.id, {
        fecha,
        pesoKg: aNumero(peso),
        porcentajeGrasa: grasa ? Number(grasa) : undefined,
        cinturaCm: cintura ? Number(cintura) : undefined,
      });
      setPeso(''); setGrasa(''); setCintura('');
      mediciones.recargar();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  const lista = mediciones.datos ?? [];
  const recientesPrimero = [...lista].reverse();

  return (
    <>
      <div className="top"><div><h1>Mediciones y evolución</h1><p className="sub">Registra tu peso y observa tu tendencia.</p></div></div>
      <div className="grid g-7-5">
        <div className="card">
          <h2>Evolución del peso (kg)</h2>
          {mediciones.cargando && !mediciones.datos && <Cargando />}
          {mediciones.error !== undefined && <ErrorCaja error={mediciones.error} />}
          {mediciones.datos && lista.length === 0 && <Vacio mensaje="Todavía no tienes mediciones. Registra la primera con el formulario." />}
          {lista.length > 0 && (
            <>
              <GraficaLinea puntos={lista.map((m) => ({ etiqueta: formatearCorto(m.fecha), valor: m.pesoKg }))} unidad="kg" />
              {lista.length === 1 && <p className="muted">Se necesitan más mediciones para ver tendencia.</p>}
              <table>
                <thead><tr><th>Fecha</th><th>Peso</th><th>% grasa</th><th>Cintura</th></tr></thead>
                <tbody>
                  {recientesPrimero.map((m) => (
                    <tr key={m.id}>
                      <td>{formatear(m.fecha)}</td><td>{numero(m.pesoKg)} kg</td>
                      <td>{m.porcentajeGrasa != null ? `${numero(m.porcentajeGrasa)} %` : '—'}</td>
                      <td>{m.cinturaCm != null ? `${numero(m.cinturaCm)} cm` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </>
          )}
        </div>

        <form className="card" onSubmit={guardar} noValidate>
          <h2>Nueva medición</h2>
          {errores.general !== undefined && <ErrorCaja error={errores.general} />}
          <Campo etiqueta="Fecha" error={errores.campo('fecha')}>
            <input type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
          </Campo>
          <Campo etiqueta="Peso (kg)" error={errores.campo('pesoKg')}>
            <input type="number" step="any" value={peso} onChange={(e) => setPeso(e.target.value)} />
          </Campo>
          <div className="row">
            <Campo etiqueta="% grasa (opcional)" error={errores.campo('porcentajeGrasa')}>
              <input type="number" step="any" value={grasa} onChange={(e) => setGrasa(e.target.value)} />
            </Campo>
            <Campo etiqueta="Cintura cm (opcional)" error={errores.campo('cinturaCm')}>
              <input type="number" step="any" value={cintura} onChange={(e) => setCintura(e.target.value)} />
            </Campo>
          </div>
          <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar medición'}</button>
        </form>
      </div>
    </>
  );
}
