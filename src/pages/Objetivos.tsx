import { useState, type FormEvent } from 'react';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { BarraProgreso } from '../components/BarraProgreso';
import { Campo } from '../components/Campo';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import type { EstadoObjetivo, TipoObjetivo } from '../types';
import { formatear, numero } from '../utils/fechas';
import { aNumero } from '../utils/numeros';

const TIPOS: { valor: TipoObjetivo; texto: string }[] = [
  { valor: 'PESO_CORPORAL', texto: 'Peso corporal' },
  { valor: 'FRECUENCIA_SEMANAL', texto: 'Frecuencia semanal' },
  { valor: 'FUERZA_EJERCICIO', texto: 'Fuerza' },
];

const ESTADO_CHIP: Record<EstadoObjetivo, { clase: string; texto: string }> = {
  ACTIVO: { clase: 'chip ok', texto: 'Activo' },
  CUMPLIDO: { clase: 'chip gray', texto: 'Cumplido' },
  CANCELADO: { clase: 'chip bad', texto: 'Cancelado' },
};

/** HU-04 (definir), HU-05 (consultar con progreso) y HU-06 (cerrar un objetivo). Mockup 04. */
export function Objetivos() {
  const { perfil } = useSesion();
  const miembroId = perfil!.id;
  const objetivos = useAsync(() => api.listarObjetivos(miembroId), [miembroId]);
  const ejercicios = useAsync(() => api.listarEjercicios(), []);

  const [tipo, setTipo] = useState<TipoObjetivo>('PESO_CORPORAL');
  const [descripcion, setDescripcion] = useState('');
  const [ejercicioId, setEjercicioId] = useState('');
  const [inicial, setInicial] = useState('');
  const [meta, setMeta] = useState('');
  const [limite, setLimite] = useState('');
  const [error, setError] = useState<unknown>();
  const [errorCierre, setErrorCierre] = useState<unknown>();
  const [enviando, setEnviando] = useState(false);

  const errores = analizarError(error, { ejercicioId: 'ejercicio', valorMeta: 'meta', fechaLimite: 'fecha límite', valorInicial: 'inicial' });
  const esFrecuencia = tipo === 'FRECUENCIA_SEMANAL';
  const unidad = esFrecuencia ? 'sesiones/semana' : 'kg';

  async function crear(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      await api.crearObjetivo(miembroId, {
        tipo,
        descripcion,
        valorInicial: esFrecuencia ? 0 : aNumero(inicial),
        valorMeta: aNumero(meta),
        fechaLimite: limite,
        ejercicioId: tipo === 'FUERZA_EJERCICIO' ? ejercicioId || undefined : undefined,
      });
      setDescripcion(''); setInicial(''); setMeta(''); setLimite(''); setEjercicioId('');
      objetivos.recargar();
    } catch (err) {
      setError(err);
    } finally {
      setEnviando(false);
    }
  }

  async function cerrar(id: string, estado: 'CUMPLIDO' | 'CANCELADO') {
    setErrorCierre(undefined);
    try {
      await api.cambiarEstadoObjetivo(id, estado);
      objetivos.recargar();
    } catch (err) {
      setErrorCierre(err);
    }
  }

  return (
    <>
      <div className="top"><div><h1>Mis objetivos</h1><p className="sub">Define metas y mira cuánto has avanzado.</p></div></div>
      <div className="grid g-7-5">
        <div>
          {objetivos.cargando && !objetivos.datos && <Cargando />}
          {objetivos.error !== undefined && <ErrorCaja error={objetivos.error} />}
          {errorCierre !== undefined && <ErrorCaja error={errorCierre} />}
          {objetivos.datos && objetivos.datos.length === 0 && (
            <Vacio mensaje="Aún no tienes objetivos. Crea el primero con el formulario." />
          )}
          {objetivos.datos?.map((o) => (
            <div className="item" key={o.id}>
              <div className="flex sp">
                <span className="t">{o.descripcion}</span>
                <span className={ESTADO_CHIP[o.estado].clase}>{ESTADO_CHIP[o.estado].texto}</span>
              </div>
              <div className="m">
                {TIPOS.find((t) => t.valor === o.tipo)?.texto} · de {numero(o.valorInicial)} a {numero(o.valorMeta)} · hasta {formatear(o.fechaLimite)}
              </div>
              <BarraProgreso porcentaje={o.progreso.porcentaje} completo={o.progreso.porcentaje >= 100} />
              <div className="flex sp" style={{ marginTop: 6 }}>
                <span className="m">{numero(o.progreso.porcentaje)} %</span>
                {o.estado === 'ACTIVO' && (
                  <span className="acciones">
                    <button className="btn sec sm" onClick={() => cerrar(o.id, 'CUMPLIDO')}>Marcar cumplido</button>
                    <button className="btn sec sm" onClick={() => cerrar(o.id, 'CANCELADO')}>Cancelar</button>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <form className="card" onSubmit={crear} noValidate>
          <h2>Nuevo objetivo</h2>
          <div className="tabs" role="group" aria-label="Tipo de objetivo">
            {TIPOS.map((t) => (
              <button key={t.valor} type="button" aria-pressed={tipo === t.valor} onClick={() => setTipo(t.valor)}>{t.texto}</button>
            ))}
          </div>
          {errores.general !== undefined && <ErrorCaja error={errores.general} />}
          <Campo etiqueta="Descripción" error={errores.campo('descripcion')}>
            <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Ej. Bajar a 75 kg" />
          </Campo>
          {tipo === 'FUERZA_EJERCICIO' && (
            <Campo etiqueta="Ejercicio" error={errores.campo('ejercicioId')}>
              <select value={ejercicioId} onChange={(e) => setEjercicioId(e.target.value)}>
                <option value="">Selecciona un ejercicio…</option>
                {ejercicios.datos?.map((x) => <option key={x.id} value={x.id}>{x.nombre}</option>)}
              </select>
            </Campo>
          )}
          <div className="row">
            {!esFrecuencia && (
              <Campo etiqueta={`Valor inicial (${unidad})`} error={errores.campo('valorInicial')}>
                <input type="number" step="any" value={inicial} onChange={(e) => setInicial(e.target.value)} />
              </Campo>
            )}
            <Campo etiqueta={`Meta (${unidad})`} error={errores.campo('valorMeta')}>
              <input type="number" step="any" value={meta} onChange={(e) => setMeta(e.target.value)} />
            </Campo>
          </div>
          <Campo etiqueta="Fecha límite" error={errores.campo('fechaLimite')}>
            <input type="date" value={limite} onChange={(e) => setLimite(e.target.value)} />
          </Campo>
          <button className="btn" disabled={enviando}>{enviando ? 'Creando…' : 'Crear objetivo'}</button>
        </form>
      </div>
    </>
  );
}
