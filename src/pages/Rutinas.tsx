import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api, ApiError } from '../api';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import type { NivelRutina, Rutina } from '../types';
import { formatearCorto } from '../utils/fechas';

export const NIVELES: { valor: NivelRutina; texto: string }[] = [
  { valor: 'PRINCIPIANTE', texto: 'Principiante' },
  { valor: 'INTERMEDIO', texto: 'Intermedio' },
  { valor: 'AVANZADO', texto: 'Avanzado' },
];
export const nivelTexto = (n: NivelRutina) => NIVELES.find((x) => x.valor === n)?.texto ?? n;

const dia = (d: string) => d.charAt(0) + d.slice(1).toLowerCase().replace('miercoles', 'miércoles').replace('sabado', 'sábado');

/** Tabla de ejercicios de una rutina, ordenados, con series × repeticiones y descanso. */
export function TablaRutina({ rutina }: { rutina: Rutina }) {
  return (
    <>
      {rutina.descripcion && <p className="sub" style={{ marginBottom: 10 }}>{rutina.descripcion}</p>}
      <table>
        <thead><tr><th>Día</th><th>Ejercicio</th><th>Series × Reps</th><th>Descanso</th></tr></thead>
        <tbody>
          {rutina.ejercicios.map((e) => (
            <tr key={e.orden}><td>{dia(e.dia)}</td><td>{e.ejercicioNombre}</td><td>{e.series} × {e.repeticiones}</td><td>{e.descansoSegundos} s</td></tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

/** HU-10 (lista y detalle de rutinas) y HU-12 (mi rutina activa). Mockup 06. */
export function Rutinas() {
  const { perfil } = useSesion();
  const esMiembro = perfil?.tipo === 'MIEMBRO';
  const rutinas = useAsync(() => api.listarRutinas(), []);
  // Sin rutina activa la API responde 404; para la pantalla eso es un estado normal, no un error.
  const activa = useAsync(async () => {
    if (!esMiembro) return null;
    try {
      return await api.rutinaActiva(perfil!.id);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, [perfil?.id]);

  const [seleccionada, setSeleccionada] = useState<string>();
  useEffect(() => {
    if (!seleccionada && activa.datos) setSeleccionada(activa.datos.rutina.id);
  }, [activa.datos, seleccionada]);
  useEffect(() => {
    if (!seleccionada && activa.datos === null && rutinas.datos?.length) setSeleccionada(rutinas.datos[0].id);
  }, [activa.datos, rutinas.datos, seleccionada]);

  const detalle = useAsync(() => (seleccionada ? api.detalleRutina(seleccionada) : Promise.resolve(null)), [seleccionada]);
  const idActiva = activa.datos?.rutina.id;

  return (
    <>
      <div className="top"><div><h1>Rutinas</h1><p className="sub">{esMiembro ? 'Consulta las rutinas y tu rutina activa.' : 'Las rutinas disponibles para tus miembros.'}</p></div>
        {!esMiembro && <Link className="btn" to="/rutinas/nueva">Crear rutina</Link>}</div>
      {rutinas.cargando && !rutinas.datos && <Cargando />}
      {rutinas.error !== undefined && <ErrorCaja error={rutinas.error} />}
      {activa.error !== undefined && <ErrorCaja error={activa.error} />}
      {esMiembro && activa.datos === null && (
        <div className="warn-box">Aún no te han asignado una rutina. Cuando tu entrenador te asigne una, aparecerá aquí.</div>
      )}
      {rutinas.datos && rutinas.datos.length === 0 && (
        <Vacio mensaje="Todavía no hay rutinas." accion={!esMiembro ? <Link className="btn sm" to="/rutinas/nueva">Crear la primera</Link> : undefined} />
      )}
      {rutinas.datos && rutinas.datos.length > 0 && (
        <div className="grid g-5-7">
          <div>
            {rutinas.datos.map((r) => (
              <button key={r.id} className={`item${seleccionada === r.id ? ' sel' : ''}`} onClick={() => setSeleccionada(r.id)}>
                <div className="flex sp">
                  <span className="t">{r.nombre}</span>
                  {r.id === idActiva && <span className="chip ok">Mi rutina activa</span>}
                </div>
                <div className="m">
                  {nivelTexto(r.nivel)} · por {r.entrenadorNombre}
                  {r.id === idActiva && activa.datos && ` · desde ${formatearCorto(activa.datos.asignacion.fechaInicio)}`}
                </div>
              </button>
            ))}
          </div>
          <div className="card">
            {detalle.cargando && !detalle.datos && <Cargando />}
            {detalle.error !== undefined && <ErrorCaja error={detalle.error} />}
            {detalle.datos && (
              <>
                <h2>{detalle.datos.nombre} <span className="chip">{nivelTexto(detalle.datos.nivel)}</span></h2>
                <TablaRutina rutina={detalle.datos} />
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
