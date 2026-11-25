import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { formatear, numero } from '../utils/fechas';

/** HU-14: historial de sesiones, de la más reciente a la más antigua, con el detalle de cada serie. Mockup 10. */
export function Historial() {
  const { perfil } = useSesion();
  const sesiones = useAsync(() => api.listarSesiones(perfil!.id), [perfil?.id]);
  const [seleccionada, setSeleccionada] = useState<string>();

  useEffect(() => {
    if (!seleccionada && sesiones.datos?.length) setSeleccionada(sesiones.datos[0].id);
  }, [sesiones.datos, seleccionada]);

  const detalle = useAsync(() => (seleccionada ? api.detalleSesion(seleccionada) : Promise.resolve(null)), [seleccionada]);

  return (
    <>
      <div className="top"><div><h1>Historial de sesiones</h1><p className="sub">De la más reciente a la más antigua.</p></div></div>
      {sesiones.cargando && !sesiones.datos && <Cargando />}
      {sesiones.error !== undefined && <ErrorCaja error={sesiones.error} />}
      {sesiones.datos && sesiones.datos.length === 0 && (
        <Vacio mensaje="Todavía no has registrado sesiones." accion={<Link className="btn sm" to="/sesion/nueva">Registra tu primera sesión</Link>} />
      )}
      {sesiones.datos && sesiones.datos.length > 0 && (
        <div className="grid g-5-7">
          <div>
            {sesiones.datos.map((s) => (
              <button key={s.id} className={`item${seleccionada === s.id ? ' sel' : ''}`} onClick={() => setSeleccionada(s.id)}>
                <div className="flex sp">
                  <span className="t">{formatear(s.fecha)}</span>
                  <span className={s.rutinaNombre ? 'chip' : 'chip gray'}>{s.rutinaNombre ?? 'Sesión libre'}</span>
                </div>
                <div className="m">{s.duracionMinutos} min · {s.totalSeries} series</div>
              </button>
            ))}
          </div>
          <div className="card">
            {detalle.cargando && !detalle.datos && <Cargando />}
            {detalle.error !== undefined && <ErrorCaja error={detalle.error} />}
            {detalle.datos && (
              <>
                <h2>Sesión del {formatear(detalle.datos.fecha)}</h2>
                <p className="sub" style={{ margin: '-8px 0 10px' }}>
                  {detalle.datos.duracionMinutos} min · {detalle.datos.rutinaNombre ?? 'Sesión libre'}
                  {detalle.datos.notas ? ` · “${detalle.datos.notas}”` : ''}
                </p>
                <table>
                  <thead><tr><th>Ejercicio</th><th>Serie</th><th>Reps</th><th>Peso</th></tr></thead>
                  <tbody>
                    {detalle.datos.series.map((x) => (
                      <tr key={x.numeroSerie}>
                        <td>{x.ejercicioNombre}</td><td>{x.numeroSerie}</td><td>{x.repeticiones}</td>
                        <td>{x.pesoKg === 0 ? '—' : `${numero(x.pesoKg)} kg`}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
