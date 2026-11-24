import { useState, type FormEvent } from 'react';
import { api, ApiError } from '../api';
import { Campo } from '../components/Campo';
import { Cargando, ErrorCaja } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { formatearCorto } from '../utils/fechas';
import { TablaRutina } from './Rutinas';

/** HU-11: asignar una rutina a un miembro. Avisa que la rutina activa anterior se finalizará (RN-11). Mockup 08. */
export function AsignarRutina() {
  const { perfil } = useSesion();
  const miembros = useAsync(() => api.listarMiembros(), []);
  const rutinas = useAsync(() => api.listarRutinas(), []);
  const [miembroId, setMiembroId] = useState('');
  const [rutinaId, setRutinaId] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<unknown>();
  const [exito, setExito] = useState<string>();

  // ¿El miembro ya tiene una rutina activa? (404 = no tiene: es lo normal, no un error)
  const activa = useAsync(async () => {
    if (!miembroId) return null;
    try {
      return await api.rutinaActiva(miembroId);
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) return null;
      throw e;
    }
  }, [miembroId, exito]);
  const vista = useAsync(() => (rutinaId ? api.detalleRutina(rutinaId) : Promise.resolve(null)), [rutinaId]);

  async function asignar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    setExito(undefined);
    try {
      const a = await api.asignarRutina(miembroId, { rutinaId, entrenadorId: perfil!.id });
      setExito(`Rutina "${a.rutinaNombre}" asignada desde hoy.`);
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  const nombreMiembro = miembros.datos?.find((m) => m.id === miembroId)?.nombre.split(' ')[0];

  return (
    <>
      <div className="top"><div><h1>Asignar rutina</h1><p className="sub">Elige un miembro y la rutina que va a seguir.</p></div></div>
      {(miembros.cargando || rutinas.cargando) && !miembros.datos && <Cargando />}
      {miembros.error !== undefined && <ErrorCaja error={miembros.error} />}
      <div className="grid g2">
        <form className="card" onSubmit={asignar} noValidate>
          <h2>Asignación</h2>
          {error !== undefined && <ErrorCaja error={error} />}
          {exito && <div className="ok-msg" role="status">{exito}</div>}
          <Campo etiqueta="Miembro">
            <select value={miembroId} onChange={(e) => { setMiembroId(e.target.value); setExito(undefined); }}>
              <option value="">Selecciona un miembro…</option>
              {miembros.datos?.map((m) => <option key={m.id} value={m.id}>{m.nombre} · {m.identificacion}</option>)}
            </select>
          </Campo>
          <Campo etiqueta="Rutina">
            <select value={rutinaId} onChange={(e) => { setRutinaId(e.target.value); setExito(undefined); }}>
              <option value="">Selecciona una rutina…</option>
              {rutinas.datos?.map((r) => <option key={r.id} value={r.id}>{r.nombre}</option>)}
            </select>
          </Campo>
          {activa.datos && !exito && (
            <div className="warn-box">
              <b>{nombreMiembro} ya tiene una rutina activa:</b> {activa.datos.rutina.nombre} (desde {formatearCorto(activa.datos.asignacion.fechaInicio)}).<br />
              Al asignar esta, la anterior quedará <b>finalizada hoy</b>.
            </div>
          )}
          <button className="btn" disabled={enviando || !miembroId || !rutinaId}>{enviando ? 'Asignando…' : 'Asignar rutina'}</button>
        </form>
        <div className="card">
          <h2>Vista previa{vista.datos ? `: ${vista.datos.nombre}` : ''}</h2>
          {!rutinaId && <p className="muted">Elige una rutina para ver sus ejercicios.</p>}
          {vista.datos && <TablaRutina rutina={vista.datos} />}
        </div>
      </div>
    </>
  );
}
