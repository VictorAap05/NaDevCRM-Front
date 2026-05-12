import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../types/auth';
import  IconCRM  from '../components/icons/IconCRM';

interface Props {
  user: Usuario;
}

const Navbar: React.FC<Props> = ({ user }) => {
  const navigate = useNavigate();

  const initials = user.nombre
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <div className="navbar-logo">
          <IconCRM />
        </div>

        <span className="navbar-name">
          Portal <span>CRM</span>
        </span>
      </div>

      <div className="navbar-nav">
        <button className="nav-item" onClick={() => navigate('/dashboard')}>
          Inicio
        </button>

        <button className="nav-item" onClick={() => navigate('/usuarios')}>
          Usuarios
        </button>

        <button className="nav-item" onClick={() => navigate('/clientes')}>
          Clientes
        </button>
      </div>

      <div className="navbar-right">
        <div className="user-pill">
          <div className="user-avatar">{initials}</div>

          <span className="user-name">{user.nombre}</span>
        </div>

        <button className="logout-btn" onClick={handleLogout}>
          Salir
        </button>
      </div>
    </nav>
  );
};

export default Navbar;