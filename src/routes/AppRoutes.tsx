import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Dashboard from '../pages/Dashboard';
import CrearUsuario from '../pages/Usuarios.tsx';
import CrearCliente from '../pages/Clientes.tsx';
import Login from '../pages/Login.tsx';

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/usuarios" element={<CrearUsuario />} />
        <Route path="/clientes" element={<CrearCliente />} />
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;