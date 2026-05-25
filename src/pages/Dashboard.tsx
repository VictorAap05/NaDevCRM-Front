import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';

// Importación de las vistas por rol
import DashboardAdmin from '../pages/DashboardAdmin';
import DashboardJefeArea from '../pages/DashboardJefeArea';
import DashboardResponsable from '../pages/DashboardResponsable';

const Dashboard = () => {
  const userString = localStorage.getItem('user');
  const user: Usuario | null = userString ? JSON.parse(userString) : null;

  if (!user) return null;

  // Lógica de renderizado condicional basada en el rol de la tabla 'usuarios'
  const renderContentByRol = () => {
    // Usamos toUpperCase() para evitar errores por mayúsculas/minúsculas en la DB
    const rolActual = user.rol?.toUpperCase();

    switch (rolActual) {
      case 'ADMINISTRADOR':
        return <DashboardAdmin user={user} />;
      
      case 'JEFE DE ÁREA':
        return <DashboardJefeArea user={user} />;
      
      case 'RESPONSABLE':
        return <DashboardResponsable user={user} />;
        
      default:
        return (
          <div className="page-content">
            <h1 className="page-title">Bienvenida al <em>CRM</em></h1>
            <div className="error-box" style={{ padding: '20px', textAlign: 'center' }}>
              <p>Rol no identificado ({user.rol}). Contacte al administrador del sistema.</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="dash-root">
      <Navbar user={user} />
      {renderContentByRol()}
    </div>
  );
};

export default Dashboard;