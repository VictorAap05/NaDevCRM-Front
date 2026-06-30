import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Usuario } from '../types/auth';
import IconCRM from '../components/icons/IconCRM';

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

        {/* USUARIOS: Oculto para Jefe de Area y Responsable */}
        {!['Jefe de Area', 'Responsable'].includes(user.rol) && (
          <button className="nav-item" onClick={() => navigate('/usuarios')}>
            Usuarios
          </button>
        )}

        {/* CLIENTES: Oculto solo para Jefe de Area */}
        {user.rol !== 'Jefe de Area' && (
          <button className="nav-item" onClick={() => navigate('/clientes')}>
            Clientes
          </button>
        )}

        {/* OPORTUNIDADES: Visible para todos */}
        <button className="nav-item" onClick={() => navigate('/oportunidades')}>
          Oportunidades
        </button>

        {/* AREAS: Oculto solo para Responsable */}
        {user.rol !== 'Responsable' && (
          <button className="nav-item" onClick={() => navigate('/areas')}>
            Areas
          </button>
        )}

        {/* AUDITORÍA: Visible para todos */}
        <button className="nav-item" onClick={() => navigate('/audit')}>
          Auditoría
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