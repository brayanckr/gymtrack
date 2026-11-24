import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import type { GrupoMuscular } from '../types';

export const GRUPOS: { valor: GrupoMuscular; texto: string }[] = [
  { valor: 'PECHO', texto: 'Pecho' },
  { valor: 'ESPALDA', texto: 'Espalda' },
  { valor: 'PIERNAS', texto: 'Piernas' },
  { valor: 'HOMBROS', texto: 'Hombros' },
  { valor: 'BRAZOS', texto: 'Brazos' },
  { valor: 'CORE', texto: 'Core' },
];

const textoGrupo = (g: GrupoMuscular) => GRUPOS.find((x) => x.valor === g)?.texto ?? g;

/** HU-07 (consultar y filtrar el catálogo) y HU-08 (registrar un ejercicio, solo entrenadores). Mockup 05. */
export function Catalogo() {
  const { perfil } = useSesion();
  const [grupo, setGrupo] = useState<GrupoMuscular | undefined>();
  const ejercicios = useAsync(() => api.listarEjercicios(grupo), [grupo]);

  const [nombre, setNombre] = useState('');
  const [grupoNuevo, setGrupoNuevo] = useState<GrupoMuscular>('PECHO');
  const [descripcion, setDescripcion] = useState('');
  const [error, setError] = useState<unknown>();
  const [enviando, setEnviando] = useState(false);
  const errores = analizarError(error, { nombre: 'nombre' });

  async function crear(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      await api.crearEjercicio({ entrenadorId: perfil!.id, nombre, grupoMuscular: grupoNuevo, descripcion: descripcion || undefined });
      setNombre('');
      setDescripcion('');
      ejercicios.recargar();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  const esEntrenador = perfil?.tipo === 'ENTRENADOR';

  return (
    <>
      <div className="top"><div><h1>Catálogo de ejercicios</h1><p className="sub">Todos los ejercicios disponibles.</p></div></div>
      <div className={esEntrenador ? 'grid g-7-5' : undefined}>
        <div className="card">
          <div className="chips" role="group" aria-label="Filtrar por grupo muscular">
            <button className={`chip${grupo ? ' gray' : ''}`} aria-pressed={!grupo} onClick={() => setGrupo(undefined)}>Todos</button>
            {GRUPOS.map((g) => (
              <button key={g.valor} className={`chip${grupo === g.valor ? '' : ' gray'}`} aria-pressed={grupo === g.valor} onClick={() => setGrupo(g.valor)}>{g.texto}</button>
            ))}
          </div>
          {ejercicios.cargando && !ejercicios.datos && <Cargando />}
          {ejercicios.error !== undefined && <ErrorCaja error={ejercicios.error} />}
          {ejercicios.datos && ejercicios.datos.length === 0 && (
            <Vacio mensaje={grupo ? `No hay ejercicios de ${textoGrupo(grupo).toLowerCase()} todavía.` : 'El catálogo está vacío.'} />
          )}
          {ejercicios.datos && ejercicios.datos.length > 0 && (
            <table>
              <thead><tr><th>Ejercicio</th><th>Grupo muscular</th><th>Descripción</th></tr></thead>
              <tbody>
                {ejercicios.datos.map((x) => (
                  <tr key={x.id}><td><b>{x.nombre}</b></td><td>{textoGrupo(x.grupoMuscular)}</td><td>{x.descripcion ?? '—'}</td></tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {esEntrenador && (
          <form className="card" onSubmit={crear} noValidate>
            <h2>Nuevo ejercicio</h2>
            {errores.general !== undefined && <ErrorCaja error={errores.general} />}
            <Campo etiqueta="Nombre" error={errores.campo('nombre')}>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
            <Campo etiqueta="Grupo muscular" error={errores.campo('grupoMuscular')}>
              <select value={grupoNuevo} onChange={(e) => setGrupoNuevo(e.target.value as GrupoMuscular)}>
                {GRUPOS.map((g) => <option key={g.valor} value={g.valor}>{g.texto}</option>)}
              </select>
            </Campo>
            <Campo etiqueta="Descripción (opcional)">
              <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} />
            </Campo>
            <button className="btn" disabled={enviando}>{enviando ? 'Guardando…' : 'Guardar ejercicio'}</button>
          </form>
        )}
      </div>
    </>
  );
}
