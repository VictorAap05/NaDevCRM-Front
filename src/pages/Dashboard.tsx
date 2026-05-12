import React from 'react';
<<<<<<< HEAD
import Navbar from '../components/Navbar';

const Dashboard = () => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;

  if (!user) return null;

  return (
    <div className="dash-root">
      <Navbar user={user} />

      <div className="page-content">
        <h1 className="page-title">
          Bienvenida al <em>CRM</em>
        </h1>
      </div>
=======
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
>>>>>>> 1a4b0616a2f3bf69cc14df0c685b96bc0a836875
    </div>
  );
};

export default Dashboard;