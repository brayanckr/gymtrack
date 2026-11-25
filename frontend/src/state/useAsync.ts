import { useCallback, useEffect, useState } from 'react';

interface Estado<T> {
  cargando: boolean;
  datos?: T;
  error?: unknown;
}

/**
 * Carga datos asíncronos y expone los tres estados que toda pantalla debe cubrir: cargando, error y datos
 * (los "vacíos" los decide cada pantalla según los datos). Se vuelve a cargar cuando cambian las
 * dependencias o al llamar a `recargar()`. Ignora respuestas de peticiones ya obsoletas.
 */
export function useAsync<T>(cargar: () => Promise<T>, dependencias: unknown[]) {
  const [estado, setEstado] = useState<Estado<T>>({ cargando: true });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ cargando: true, datos: previo.datos }));
    cargar()
      .then((datos) => vigente && setEstado({ cargando: false, datos }))
      .catch((error: unknown) => vigente && setEstado({ cargando: false, error }));
    return () => {
      vigente = false;
    };
    // `cargar` se redefine en cada render; las dependencias explícitas son las que importan.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...dependencias, version]);

  const recargar = useCallback(() => setVersion((v) => v + 1), []);
  return { ...estado, recargar };
}
