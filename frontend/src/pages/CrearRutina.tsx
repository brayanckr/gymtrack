import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { ErrorCaja } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import type { DiaSemana, NivelRutina } from '../types';
import { NIVELES } from './Rutinas';

const DIAS: { valor: DiaSemana; texto: string }[] = [
  { valor: 'LUNES', texto: 'Lunes' }, { valor: 'MARTES', texto: 'Martes' }, { valor: 'MIERCOLES', texto: 'Miércoles' },
  { valor: 'JUEVES', texto: 'Jueves' }, { valor: 'VIERNES', texto: 'Viernes' }, { valor: 'SABADO', texto: 'Sábado' },
  { valor: 'DOMINGO', texto: 'Domingo' },
];

interface Fila {
  dia: DiaSemana;
  ejercicioId: string;
  series: string;
  repeticiones: string;
  descanso: string;
}

const filaNueva = (): Fila => ({ dia: 'LUNES', ejercicioId: '', series: '3', repeticiones: '10', descanso: '90' });

/** HU-09: crear una rutina con ejercicios del catálogo (composición Rutina ◆— EjercicioPrescrito). Mockup 07. */
export function CrearRutina() {
  const { perfil } = useSesion();
  const navegar = useNavigate();
  const ejercicios = useAsync(() => api.listarEjercicios(), []);
  const [nombre, setNombre] = useState('');
  const [nivel, setNivel] = useState<NivelRutina>('INTERMEDIO');
  const [descripcion, setDescripcion] = useState('');
  const [filas, setFilas] = useState<Fila[]>([filaNueva()]);
  const [error, setError] = useState<unknown>();
  const [enviando, setEnviando] = useState(false);
  const errores = analizarError(error);

  const cambiar = (i: number, parcial: Partial<Fila>) => setFilas((fs) => fs.map((f, j) => (j === i ? { ...f, ...parcial } : f)));

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      await api.crearRutina({
        entrenadorId: perfil!.id,
        nombre,
        descripcion: descripcion || undefined,
        nivel,
        ejercicios: filas.map((f) => ({
          ejercicioId: f.ejercicioId, dia: f.dia, series: Number(f.series), repeticiones: Number(f.repeticiones), descansoSegundos: Number(f.descanso),
        })),
      });
      navegar('/rutinas');
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  }

  return (
    <>
      <div className="top"><div><h1>Crear rutina</h1><p className="sub">Diseña un plan con ejercicios del catálogo.</p></div></div>
      <form className="card" onSubmit={guardar} noValidate>
        {errores.general !== undefined && <ErrorCaja error={errores.general} />}
        <div className="row">
          <Campo etiqueta="Nombre" error={errores.campo('nombre')}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Campo>
          <Campo etiqueta="Nivel">
            <select value={nivel} onChange={(e) => setNivel(e.target.value as NivelRutina)}>
              {NIVELES.map((n) => <option key={n.valor} value={n.valor}>{n.texto}</option>)}
            </select>
          </Campo>
        </div>
        <Campo etiqueta="Descripción (opcional)">
          <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
        </Campo>

        <h2 style={{ marginTop: 6 }}>Ejercicios de la rutina</h2>
        <table>
          <thead><tr><th>#</th><th>Día</th><th>Ejercicio</th><th>Series</th><th>Reps</th><th>Descanso (s)</th><th /></tr></thead>
          <tbody>
            {filas.map((f, i) => (
              <tr key={i}>
                <td>{i + 1}</td>
                <td>
                  <select aria-label={`Día del ejercicio ${i + 1}`} value={f.dia} onChange={(e) => cambiar(i, { dia: e.target.value as DiaSemana })}>
                    {DIAS.map((d) => <option key={d.valor} value={d.valor}>{d.texto}</option>)}
                  </select>
                </td>
                <td>
                  <select aria-label={`Ejercicio ${i + 1}`} value={f.ejercicioId} onChange={(e) => cambiar(i, { ejercicioId: e.target.value })}>
                    <option value="">Selecciona…</option>
                    {ejercicios.datos?.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
                  </select>
                </td>
                <td><input aria-label={`Series del ejercicio ${i + 1}`} type="number" value={f.series} onChange={(e) => cambiar(i, { series: e.target.value })} /></td>
                <td><input aria-label={`Repeticiones del ejercicio ${i + 1}`} type="number" value={f.repeticiones} onChange={(e) => cambiar(i, { repeticiones: e.target.value })} /></td>
                <td><input aria-label={`Descanso del ejercicio ${i + 1}`} type="number" value={f.descanso} onChange={(e) => cambiar(i, { descanso: e.target.value })} /></td>
                <td><button type="button" className="btn sec sm" onClick={() => setFilas((fs) => fs.filter((_, j) => j !== i))} disabled={filas.length === 1}>Quitar</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <p><button type="button" className="btn sec" onClick={() => setFilas((fs) => [...fs, filaNueva()])}>+ Agregar ejercicio</button></p>
        <div className="acciones">
          <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar rutina'}</button>
          <button type="button" className="btn sec" onClick={() => navegar('/rutinas')}>Cancelar</button>
          <span className="muted">Una rutina necesita al menos un ejercicio.</span>
        </div>
      </form>
    </>
  );
}
