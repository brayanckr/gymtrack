import { useEffect, useState, type FormEvent } from 'react';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { Cargando, ErrorCaja } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';
import { aNumero } from '../utils/numeros';

/** HU-03: consultar y actualizar mi perfil. La identificación y la fecha de nacimiento no se editan. Mockup 02. */
export function Perfil() {
  const { perfil, iniciar } = useSesion();
  const miembro = useAsync(() => api.obtenerMiembro(perfil!.id), [perfil?.id]);
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [altura, setAltura] = useState('');
  const [error, setError] = useState<unknown>();
  const [guardado, setGuardado] = useState(false);
  const [guardando, setGuardando] = useState(false);

  // Al llegar los datos se vuelcan al formulario.
  useEffect(() => {
    if (miembro.datos) {
      setNombre(miembro.datos.nombre);
      setCorreo(miembro.datos.correo);
      setAltura(String(miembro.datos.alturaCm));
    }
  }, [miembro.datos]);

  const errores = analizarError(error, { correo: 'correo' });

  async function guardar(e: FormEvent) {
    e.preventDefault();
    setGuardando(true);
    setGuardado(false);
    setError(undefined);
    try {
      const actualizado = await api.actualizarMiembro(perfil!.id, { nombre, correo, alturaCm: aNumero(altura) });
      iniciar({ id: actualizado.id, tipo: 'MIEMBRO', nombre: actualizado.nombre }); // el menú muestra el nombre nuevo
      setGuardado(true);
    } catch (err) {
      setError(err);
    } finally {
      setGuardando(false);
    }
  }

  return (
    <>
      <div className="top"><div><h1>Mi perfil</h1><p className="sub">Consulta y actualiza tus datos.</p></div></div>
      {miembro.cargando && !miembro.datos && <Cargando />}
      {miembro.error !== undefined && <ErrorCaja error={miembro.error} />}
      {miembro.datos && (
        <form className="card" style={{ maxWidth: 640 }} onSubmit={guardar} noValidate>
          {errores.general !== undefined && <ErrorCaja error={errores.general} />}
          {guardado && <div className="ok-msg" role="status">Perfil actualizado</div>}
          <Campo etiqueta="Identificación (no editable)"><input value={miembro.datos.identificacion} disabled /></Campo>
          <div className="row">
            <Campo etiqueta="Nombre completo" error={errores.campo('nombre')}>
              <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </Campo>
            <Campo etiqueta="Correo" error={errores.campo('correo')}>
              <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
            </Campo>
          </div>
          <div className="row">
            <Campo etiqueta="Fecha de nacimiento (no editable)"><input value={miembro.datos.fechaNacimiento} disabled /></Campo>
            <Campo etiqueta="Altura (cm)" error={errores.campo('alturaCm')}>
              <input type="number" value={altura} onChange={(e) => setAltura(e.target.value)} />
            </Campo>
          </div>
          <button className="btn" disabled={guardando}>{guardando ? 'Guardando…' : 'Guardar cambios'}</button>
        </form>
      )}
    </>
  );
}
