import type { GymApi } from './contrato';
import { crearHttp } from './http';
import { crearMock } from './mock';

/**
 * La API que usa toda la interfaz. Con `VITE_USE_MOCK=true` (`npm run demo`) son datos en memoria que
 * siguen las mismas reglas que el backend; en cualquier otro caso se llama a gymtrack-backend por HTTP.
 */
export const api: GymApi = import.meta.env.VITE_USE_MOCK === 'true' ? crearMock() : crearHttp();

export const modoDemo: boolean = import.meta.env.VITE_USE_MOCK === 'true';

export { ApiError, textoDeError } from './error';
