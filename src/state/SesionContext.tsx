import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

/**
 * Perfil que está usando la demo. La API no autentica (decisión declarada en el caso de estudio), así que
 * "iniciar sesión" es elegir un miembro o entrenador existente; el perfil se recuerda en este navegador.
 */
export interface Perfil {
  id: string;
  tipo: 'MIEMBRO' | 'ENTRENADOR';
  nombre: string;
}

interface Contexto {
  perfil: Perfil | null;
  iniciar(perfil: Perfil): void;
  cerrar(): void;
}

const CLAVE = 'gymtrack.perfil';
const SesionContext = createContext<Contexto | null>(null);

function leer(): Perfil | null {
  try {
    const crudo = localStorage.getItem(CLAVE);
    return crudo ? (JSON.parse(crudo) as Perfil) : null;
  } catch {
    return null; // almacenamiento no disponible o contenido dañado: se empieza sin perfil
  }
}

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [perfil, setPerfil] = useState<Perfil | null>(leer);

  const valor = useMemo<Contexto>(
    () => ({
      perfil,
      iniciar(nuevo) {
        setPerfil(nuevo);
        try {
          localStorage.setItem(CLAVE, JSON.stringify(nuevo));
        } catch {
          // sin almacenamiento: el perfil sigue vigente mientras la pestaña esté abierta
        }
      },
      cerrar() {
        setPerfil(null);
        try {
          localStorage.removeItem(CLAVE);
        } catch {
          // nada que limpiar
        }
      },
    }),
    [perfil],
  );

  return <SesionContext.Provider value={valor}>{children}</SesionContext.Provider>;
}

export function useSesion(): Contexto {
  const contexto = useContext(SesionContext);
  if (!contexto) throw new Error('useSesion debe usarse dentro de <ProveedorSesion>');
  return contexto;
}
