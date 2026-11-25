import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { modoDemo } from '../api';
import { useSesion } from '../state/SesionContext';

interface Enlace {
  a: string;
  texto: string;
}

// Menú por rol: un miembro sigue su entrenamiento; un entrenador gestiona catálogo y rutinas.
const MENU_MIEMBRO: Enlace[] = [
  { a: '/panel', texto: 'Panel de progreso' },
  { a: '/objetivos', texto: 'Objetivos' },
  { a: '/rutinas', texto: 'Rutinas' },
  { a: '/catalogo', texto: 'Catálogo de ejercicios' },
  { a: '/sesion/nueva', texto: 'Registrar sesión' },
  { a: '/historial', texto: 'Historial' },
  { a: '/mediciones', texto: 'Mediciones' },
  { a: '/perfil', texto: 'Mi perfil' },
];

const MENU_ENTRENADOR: Enlace[] = [
  { a: '/rutinas', texto: 'Rutinas' },
  { a: '/rutinas/nueva', texto: 'Crear rutina' },
  { a: '/rutinas/asignar', texto: 'Asignar rutina' },
  { a: '/catalogo', texto: 'Catálogo de ejercicios' },
];

/** Marco común de las pantallas autenticadas: menú lateral según el rol y datos del perfil. */
export function Layout() {
  const { perfil, cerrar } = useSesion();
  const navegar = useNavigate();
  if (!perfil) return null;
  const menu = perfil.tipo === 'MIEMBRO' ? MENU_MIEMBRO : MENU_ENTRENADOR;

  return (
    <div className="app">
      <aside className="side">
        <div className="brand">Gym<b>Track</b></div>
        <nav aria-label="Principal">
          {menu.map((e) => (
            <NavLink key={e.a} to={e.a} end className={({ isActive }) => (isActive ? 'on' : '')}>{e.texto}</NavLink>
          ))}
        </nav>
        <div className="who">
          <b>{perfil.nombre}</b>
          {perfil.tipo === 'MIEMBRO' ? 'Miembro' : 'Entrenador'}
          <button className="link" onClick={() => { cerrar(); navegar('/'); }}>Cambiar perfil</button>
        </div>
      </aside>
      <main className="main">
        {modoDemo && <div className="banner">Modo demostración: los datos viven en memoria y se pierden al recargar.</div>}
        <Outlet />
      </main>
    </div>
  );
}
