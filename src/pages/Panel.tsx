import { Link } from 'react-router-dom';
import { api } from '../api';
import { BarraProgreso } from '../components/BarraProgreso';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { formatear, formatearCorto, numero } from '../utils/fechas';

const TIPOS: Record<string, string> = {
  PESO_CORPORAL: 'Peso corporal',
  FRECUENCIA_SEMANAL: 'Frecuencia semanal',
  FUERZA_EJERCICIO: 'Fuerza',
};

/** HU-17: panel de progreso — lo importante de un vistazo, con estados vacíos accionables. Mockup 03. */
export function Panel() {
  const { perfil } = useSesion();
  const panel = useAsync(() => api.panel(perfil!.id), [perfil?.id]);
  const sesiones = useAsync(() => api.listarSesiones(perfil!.id), [perfil?.id]);
  const p = panel.datos;

  return (
    <>
      <div className="top"><div><h1>Panel de progreso</h1><p className="sub">Así vas, {perfil?.nombre.split(' ')[0]}.</p></div></div>
      {panel.cargando && !p && <Cargando />}
      {panel.error !== undefined && <ErrorCaja error={panel.error} />}
      {p && (
        <>
          <div className="grid g4" style={{ marginBottom: 16 }}>
            <div className="card stat">
              <div className="l">Último peso</div>
              {p.ultimoPesoKg !== null ? (
                <>
                  <div className="n">{numero(p.ultimoPesoKg)} kg</div>
                  {p.variacionPesoKg !== null && (
                    <div className="d" style={{ color: p.variacionPesoKg <= 0 ? 'var(--ok)' : 'var(--muted)' }}>
                      {p.variacionPesoKg <= 0 ? '▼' : '▲'} {numero(Math.abs(p.variacionPesoKg))} kg vs. anterior
                    </div>
                  )}
                </>
              ) : (
                <div className="muted">Sin mediciones · <Link to="/mediciones">registrar la primera</Link></div>
              )}
            </div>
            <div className="card stat">
              <div className="l">Sesiones del mes</div>
              <div className="n">{p.sesionesDelMes}</div>
              <div className="d" style={{ color: 'var(--muted)' }}>
                {p.ultimaSesion ? `Última: ${formatear(p.ultimaSesion.fecha)}` : <Link to="/sesion/nueva">Registrar la primera</Link>}
              </div>
            </div>
            <div className="card stat">
              <div className="l">Objetivos activos</div>
              <div className="n">{p.objetivosActivos.length}</div>
              <div className="d" style={{ color: 'var(--muted)' }}><Link to="/objetivos">Ver objetivos</Link></div>
            </div>
            <div className="card stat">
              <div className="l">Rutina activa</div>
              {p.rutinaActiva ? (
                <>
                  <div className="n" style={{ fontSize: 18, paddingTop: 6 }}>{p.rutinaActiva.nombre}</div>
                  <div className="d" style={{ color: 'var(--muted)' }}>desde {formatearCorto(p.rutinaActiva.desde)}</div>
                </>
              ) : (
                <div className="muted">Aún no te han asignado una</div>
              )}
            </div>
          </div>

          <div className="grid g-7-5">
            <div className="card">
              <h2>Objetivos activos</h2>
              {p.objetivosActivos.length === 0 && (
                <Vacio mensaje="Aún no tienes objetivos activos." accion={<Link className="btn sm" to="/objetivos">Definir mi primer objetivo</Link>} />
              )}
              {p.objetivosActivos.map((o) => (
                <div className="item" key={o.id}>
                  <div className="flex sp"><span className="t">{o.descripcion}</span><span className="chip">{TIPOS[o.tipo]}</span></div>
                  <div className="m">Meta {numero(o.valorMeta)} · hasta {formatearCorto(o.fechaLimite)}</div>
                  <BarraProgreso porcentaje={o.progreso.porcentaje} />
                  <div className="m" style={{ marginTop: 4 }}>{numero(o.progreso.porcentaje)} %</div>
                </div>
              ))}
            </div>
            <div className="card">
              <h2>Últimas sesiones</h2>
              {sesiones.datos && sesiones.datos.length === 0 && (
                <Vacio mensaje="Todavía no has registrado sesiones." accion={<Link className="btn sm" to="/sesion/nueva">Registrar sesión</Link>} />
              )}
              {sesiones.datos && sesiones.datos.length > 0 && (
                <>
                  <table>
                    <thead><tr><th>Fecha</th><th>Duración</th><th>Series</th></tr></thead>
                    <tbody>
                      {sesiones.datos.slice(0, 3).map((s) => (
                        <tr key={s.id}><td>{formatearCorto(s.fecha)}</td><td>{s.duracionMinutos} min</td><td>{s.totalSeries}</td></tr>
                      ))}
                    </tbody>
                  </table>
                  <p style={{ margin: '12px 0 0' }}><Link className="btn sm" to="/sesion/nueva">Registrar sesión</Link></p>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
