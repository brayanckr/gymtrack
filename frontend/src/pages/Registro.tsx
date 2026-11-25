import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { analizarError } from '../api/campos';
import { Campo } from '../components/Campo';
import { ErrorCaja } from '../components/Estado';
import { useSesion } from '../state/SesionContext';
import { aNumero } from '../utils/numeros';

type Tipo = 'MIEMBRO' | 'ENTRENADOR';

/** HU-01 (registrarme como miembro) y HU-02 (registrarme como entrenador). Mockup 01. */
export function Registro() {
  const { iniciar } = useSesion();
  const navegar = useNavigate();
  const [tipo, setTipo] = useState<Tipo>('MIEMBRO');
  const [identificacion, setIdentificacion] = useState('');
  const [nombre, setNombre] = useState('');
  const [correo, setCorreo] = useState('');
  const [nacimiento, setNacimiento] = useState('');
  const [altura, setAltura] = useState('');
  const [especialidad, setEspecialidad] = useState('');
  const [enviando, setEnviando] = useState(false);
  const [error, setError] = useState<unknown>();

  const errores = analizarError(error, { correo: 'correo', identificacion: 'identificación', fechaNacimiento: 'nacimiento' });

  async function enviar(e: FormEvent) {
    e.preventDefault();
    setEnviando(true);
    setError(undefined);
    try {
      if (tipo === 'MIEMBRO') {
        const m = await api.crearMiembro({ identificacion, nombre, correo, fechaNacimiento: nacimiento, alturaCm: aNumero(altura) });
        iniciar({ id: m.id, tipo: 'MIEMBRO', nombre: m.nombre });
        navegar('/panel');
      } else {
        const t = await api.crearEntrenador({ identificacion, nombre, correo, especialidad });
        iniciar({ id: t.id, tipo: 'ENTRENADOR', nombre: t.nombre });
        navegar('/rutinas');
      }
    } catch (err) {
      setError(err);
      setEnviando(false);
    }
  }

  return (
    <div className="centrada">
      <h1>Crear mi cuenta</h1>
      <p className="sub">Regístrate como miembro o como entrenador.</p>
      <form className="card" style={{ marginTop: 18 }} onSubmit={enviar} noValidate>
        <div className="tabs" role="group" aria-label="Tipo de cuenta">
          <button type="button" aria-pressed={tipo === 'MIEMBRO'} onClick={() => setTipo('MIEMBRO')}>Soy miembro</button>
          <button type="button" aria-pressed={tipo === 'ENTRENADOR'} onClick={() => setTipo('ENTRENADOR')}>Soy entrenador</button>
        </div>
        {errores.general !== undefined && <ErrorCaja error={errores.general} />}
        <div className="row">
          <Campo etiqueta="Identificación" error={errores.campo('identificacion')}>
            <input value={identificacion} onChange={(e) => setIdentificacion(e.target.value)} />
          </Campo>
          <Campo etiqueta="Nombre completo" error={errores.campo('nombre')}>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} />
          </Campo>
        </div>
        <Campo etiqueta="Correo" error={errores.campo('correo')}>
          <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} />
        </Campo>
        {tipo === 'MIEMBRO' ? (
          <div className="row">
            <Campo etiqueta="Fecha de nacimiento" error={errores.campo('fechaNacimiento')}>
              <input type="date" value={nacimiento} onChange={(e) => setNacimiento(e.target.value)} />
            </Campo>
            <Campo etiqueta="Altura (cm)" error={errores.campo('alturaCm')}>
              <input type="number" inputMode="numeric" value={altura} onChange={(e) => setAltura(e.target.value)} />
            </Campo>
          </div>
        ) : (
          <Campo etiqueta="Especialidad" error={errores.campo('especialidad')}>
            <input value={especialidad} onChange={(e) => setEspecialidad(e.target.value)} />
          </Campo>
        )}
        <div className="acciones">
          <button className="btn" disabled={enviando}>{enviando ? 'Registrando…' : 'Registrarme'}</button>
          <Link className="btn sec" to="/">Cancelar</Link>
        </div>
      </form>
    </div>
  );
}
