import type { ReactNode } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useSesion } from '../state/SesionContext';

/**
 * Exige un perfil elegido y, opcionalmente, un rol. Sin perfil lleva a la selección; con el rol equivocado
 * explica qué pasó en lugar de mostrar una pantalla rota (la API devolvería 403 al enviar el formulario).
 */
export function RutaProtegida({ rol, children }: { rol?: 'MIEMBRO' | 'ENTRENADOR'; children: ReactNode }) {
  const { perfil } = useSesion();
  if (!perfil) return <Navigate to="/" replace />;
  if (rol && perfil.tipo !== rol) {
    return (
      <div className="empty">
        <p>Esta pantalla es solo para {rol === 'MIEMBRO' ? 'miembros' : 'entrenadores'}.</p>
        <Link className="btn" to="/">Cambiar de perfil</Link>
      </div>
    );
  }
  return <>{children}</>;
}
