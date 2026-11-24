import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import { RutaProtegida } from './components/RutaProtegida';
import { AsignarRutina } from './pages/AsignarRutina';
import { Catalogo } from './pages/Catalogo';
import { CrearRutina } from './pages/CrearRutina';
import { Historial } from './pages/Historial';
import { Mediciones } from './pages/Mediciones';
import { Objetivos } from './pages/Objetivos';
import { Panel } from './pages/Panel';
import { Perfil } from './pages/Perfil';
import { RegistrarSesion } from './pages/RegistrarSesion';
import { Registro } from './pages/Registro';
import { Rutinas } from './pages/Rutinas';
import { SeleccionPerfil } from './pages/SeleccionPerfil';

/**
 * Mapa de pantallas. Las de seguimiento son de miembro; crear y asignar rutinas son de entrenador; el
 * catálogo y la lista de rutinas las usan ambos (HU-07, HU-10). Cada pantalla corresponde a un mockup.
 */
export function App() {
  return (
    <Routes>
      <Route path="/" element={<SeleccionPerfil />} />
      <Route path="/registro" element={<Registro />} />

      <Route element={<Layout />}>
        <Route path="/panel" element={<RutaProtegida rol="MIEMBRO"><Panel /></RutaProtegida>} />
        <Route path="/objetivos" element={<RutaProtegida rol="MIEMBRO"><Objetivos /></RutaProtegida>} />
        <Route path="/sesion/nueva" element={<RutaProtegida rol="MIEMBRO"><RegistrarSesion /></RutaProtegida>} />
        <Route path="/historial" element={<RutaProtegida rol="MIEMBRO"><Historial /></RutaProtegida>} />
        <Route path="/mediciones" element={<RutaProtegida rol="MIEMBRO"><Mediciones /></RutaProtegida>} />
        <Route path="/perfil" element={<RutaProtegida rol="MIEMBRO"><Perfil /></RutaProtegida>} />

        <Route path="/rutinas" element={<RutaProtegida><Rutinas /></RutaProtegida>} />
        <Route path="/catalogo" element={<RutaProtegida><Catalogo /></RutaProtegida>} />
        <Route path="/rutinas/nueva" element={<RutaProtegida rol="ENTRENADOR"><CrearRutina /></RutaProtegida>} />
        <Route path="/rutinas/asignar" element={<RutaProtegida rol="ENTRENADOR"><AsignarRutina /></RutaProtegida>} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
