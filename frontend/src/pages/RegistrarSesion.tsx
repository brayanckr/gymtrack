import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { ErrorCaja } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { hoy } from '../utils/fechas';
import { aNumero } from '../utils/numeros';

interface FilaSerie {
  ejercicioId: string;
  repeticiones: string;
  peso: string;
}

const serieNueva = (): FilaSerie => ({ ejercicioId: '', repeticiones: '5', peso: '0' });

/** HU-13: registrar una sesión (fecha, duración, rutina opcional y series realizadas). Mockup 09. */
export function RegistrarSesion() {
  const { perfil } = useSesion();
  const navegar = useNavigate();
  const ejercicios = useAsync(() => api.listarEjercicios(), []);
  const rutinas = useAsync(() => api.listarRutinas(), []);

  const [fecha, setFecha] = useState(hoy());
  const [duracion, setDuracion] = useState('60');
  const [rutinaId, setRutinaId] = useState('');
  const [notas, setNotas] = useState('');
  const [series, setSeries] = useState<FilaSerie[]>([serieNueva()]);
  const [error, setError] = useState<unknown>();
  const [enviando, setEnviando] = useState(false);
  const errores = analizarError(error, { fecha: 'fecha', duracionMinutos: 'duración' });

  const cambiar = (i: number, parcial: Partial<FilaSerie>) => setSeries((s) => s.map((x, j) => (j === i ? { ...x, ...parcial } : x)));

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      await api.registrarSesion(perfil!.id, {
        fecha,
        duracionMinutos: aNumero(duracion),
        rutinaId: rutinaId || undefined, // vacío = sesión libre (RN-14)
        notas: notas || undefined,
        series: series.map((s) => ({ ejercicioId: s.ejercicioId, repeticiones: Number(s.repeticiones), pesoKg: Number(s.peso) })),
      });
      navegar('/historial');
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="top"><div><h1>Registrar sesión</h1><p className="sub">Anota lo que hiciste hoy.</p></div></div>
      <form className="card" onSubmit={guardar} noValidate>
        {errores.general !== undefined && <ErrorCaja error={errores.general} />}
        <div className="row" style={{ gridTemplateColumns: '1fr 1fr 2fr' }}>
          <Campo etiqueta="Fecha" error={errores.campo('fecha')}>
            <input type="date" value={fecha} max={hoy()} onChange={(e) => setFecha(e.target.value)} />
          </Campo>
          <Campo etiqueta="Duración (min)" error={errores.campo('duracionMinutos')}>
            <input type="number" value={duracion} onChange={(e) => setDuracion(e.target.value)} />
          </Campo>
          <Campo etiqueta="Rutina (opcional)">
            <select value={rutinaId} onChange={(e) => setRutinaId(e.target.value)}>
              <option value="">Sesión libre</option>
              {rutinas.datos?.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Notas (opcional)">
          <input value={notas} onChange={(e) => setNotas(e.target.value)} />
        </Campo>

        <h2>Series realizadas</h2>
        <table>
          <thead><tr><th>#</th><th>Ejercicio</th><th>Repeticiones</th><th>Peso (kg)</th><th /></tr></thead>
          <tbody>
            {series.map((s, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <select aria-label={`Ejercicio de la serie ${i + 1}`} value={s.ejercicioId} onChange={(e) => cambiar(i, { ejercicioId: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {ejercicios.datos?.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                  </select>
                </td>
                <td><input aria-label={`Repeticiones de la serie ${i + 1}`} type="number" value={s.repeticiones} onChange={(e) => cambiar(i, { repeticiones: e.target.value })} /></td>
                <td><input aria-label={`Peso de la serie ${i + 1}`} type="number" step="any" value={s.peso} onChange={(e) => cambiar(i, { peso: e.target.value })} /></td>
                <td><button type="button" className="btn sec sm" onClick={() => setSeries((x) => x.filter((_, j) => j !== i))} disabled={series.length === 1}>Quitar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="muted">Peso 0 = ejercicio de peso corporal.</p>
        <p><button type="button" className="btn sec" onClick={() => setSeries((x) => [...x, { ...x[x.length - 1], ejercicioId: x[x.length - 1]?.ejercicioId ?? '' }])}>+ Agregar serie</button></p>
        <div className="acciones">
          <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar sesión'}</button>
          <span className="muted">Se necesita al menos una serie.</span>
        </div>
      </form>
    </>
  );
}
