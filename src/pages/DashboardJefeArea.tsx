import type { Usuario } from '../types/auth';

const DashboardJefeArea = ({ user }: { user: Usuario }) => {
  return (
    <div className="page-content">
      {/* Used the user object here to personalize the greeting */}
      <h1 className="page-title">Bienvenid@, {user.nombre} al <em>CRM</em></h1>
      
      <div className="form-card" style={{ padding: '40px', textAlign: 'center', borderLeft: '4px solid #3b82f6' }}>
        <h2 style={{ color: '#3b82f6', fontSize: '24px' }}>Supervisión de Área</h2>
        <p style={{ fontSize: '18px', opacity: 0.8, marginTop: '10px' }}>
          Este es el dashboard de jefe de área. Aquí podrás supervisar las métricas y el progreso de los equipos asignados a tus áreas.
        </p>
      </div>
    </div>
  );
};

export default DashboardJefeArea;