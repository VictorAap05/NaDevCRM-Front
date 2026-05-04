import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../types/auth';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  
  // Recuperamos al usuario del localStorage
  const userString = localStorage.getItem('user');
  const user: Usuario | null = userString ? JSON.parse(userString) : null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (!user) {
    return <div>Cargando...</div>;
  }

  return (
    <div style={{ padding: '20px' }}>
      <h1>Dashboard Principal</h1>
      <p>Bienvenido, <strong>{user.nombre}</strong></p>
      <p>Nivel de acceso: {user.rol}</p>
      
      <button onClick={handleLogout} style={{ marginTop: '20px', padding: '10px', background: '#dc3545', color: 'white', border: 'none' }}>
        Cerrar Sesión
      </button>
    </div>
  );
};

export default Dashboard;