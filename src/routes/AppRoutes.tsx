import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import CrearUsuario from '../pages/Usuarios.tsx';
import CrearCliente from '../pages/Clientes.tsx';
import Login from '../pages/Login.tsx';
import Audit from '../pages/Audit.tsx';
import Oportunidad from '../pages/Oportunidades.tsx';
import Areas from '../pages/Areas.tsx';
import type { ReactNode } from 'react';

// Componente para bloquear rutas a roles específicos
const RutaProtegida = ({ children, rolesBloqueados }: { children: ReactNode, rolesBloqueados: string[] }) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return <Navigate to="/login" replace />;
  if (rolesBloqueados.includes(user.rol)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Usuarios: Bloqueado para Jefe de Area y Responsable */}
        <Route path="/usuarios" element={
          <RutaProtegida rolesBloqueados={['Jefe de Area', 'Responsable']}>
            <CrearUsuario />
          </RutaProtegida>
        } />
        
        {/* Clientes: Bloqueado solo para Jefe de Area */}
        <Route path="/clientes" element={
          <RutaProtegida rolesBloqueados={['Jefe de Area']}>
            <CrearCliente />
          </RutaProtegida>
        } />

        {/* Áreas: Bloqueado solo para Responsable */}
        <Route path="/areas" element={
          <RutaProtegida rolesBloqueados={['Responsable']}>
            <Areas />
          </RutaProtegida>
        } />

        {/* Rutas sin restricciones */}
        <Route path="/audit" element={<Audit />} />
        <Route path="/oportunidades" element={<Oportunidad />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;