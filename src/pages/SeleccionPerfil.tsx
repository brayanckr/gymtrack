import { Link, useNavigate } from 'react-router-dom';
import { api, modoDemo } from '../api';
import { Cargando, ErrorCaja, Vacio } from '../components/Estado';
import { useSesion, type Perfil } from '../state/SesionContext';
import { useAsync } from '../state/useAsync';

/**
 * Entrada de la demo. Como la API no autentica, "iniciar sesión" es elegir un perfil existente
 * (decisión declarada en el caso de estudio) o crear una cuenta nueva (HU-01, HU-02).
 */
export function SeleccionPerfil() {
  const { iniciar } = useSesion();
  const navegar = useNavigate();
  const miembros = useAsync(() => api.listarMiembros(), []);
  const entrenadores = useAsync(() => api.listarEntrenadores(), []);

  const entrar = (perfil: Perfil) => {
    iniciar(perfil);
    navegar(perfil.tipo === 'MIEMBRO' ? '/panel' : '/rutinas');
  };

  return (
    <div className="centrada">
      <div className="brand">Gym<b>Track</b></div>
      <p className="sub">Seguimiento de tu entrenamiento: objetivos, rutinas, sesiones y progreso.</p>
      {modoDemo && <div className="banner" style={{ marginTop: 14 }}>Modo demostración: datos en memoria, sin backend.</div>}

      <h2 style={{ marginTop: 24 }}>Elige un perfil para continuar</h2>
      <p className="muted">La demo no pide contraseña: la autenticación está fuera del alcance de esta entrega.</p>

      <h3>Miembros</h3>
      {miembros.cargando && <Cargando />}
      {miembros.error !== undefined && <ErrorCaja error={miembros.error} />}
      {miembros.datos && miembros.datos.length === 0 && <Vacio mensaje="Todavía no hay miembros registrados." />}
      <div className="perfiles">
        {miembros.datos?.map((m) => (
          <button key={m.id} className="item" onClick={() => entrar({ id: m.id, tipo: 'MIEMBRO', nombre: m.nombre })}>
            <div className="t">{m.nombre}</div>
            <div className="m">Miembro · {m.correo}</div>
          </button>
        ))}
      </div>

      <h3>Entrenadores</h3>
      {entrenadores.cargando && <Cargando />}
      {entrenadores.error !== undefined && <ErrorCaja error={entrenadores.error} />}
      {entrenadores.datos && entrenadores.datos.length === 0 && <Vacio mensaje="Todavía no hay entrenadores registrados." />}
      <div className="perfiles">
        {entrenadores.datos?.map((e) => (
          <button key={e.id} className="item" onClick={() => entrar({ id: e.id, tipo: 'ENTRENADOR', nombre: e.nombre })}>
            <div className="t">{e.nombre}</div>
            <div className="m">Entrenador · {e.especialidad}</div>
          </button>
        ))}
      </div>

      <p>¿Eres nuevo? <Link to="/registro">Crear mi cuenta</Link></p>
    </div>
  );
}
