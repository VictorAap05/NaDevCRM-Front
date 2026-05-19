import type { Usuario } from '../types/auth';

const DashboardResponsable = ({ user }: { user: Usuario }) => {
  return (
    <div className="page-content">
      <h1 className="page-title">Bienvenida al <em>CRM</em></h1>
      <div className="form-card" style={{ padding: '40px', textAlign: 'center', borderLeft: '4px solid #10b981' }}>
        <h2 style={{ color: '#10b981', fontSize: '24px' }}>Gestión Operativa</h2>
        <p style={{ fontSize: '18px', opacity: 0.8, marginTop: '10px' }}>
          Este es el **dashboard de responsable**. Enfócate en la ejecución de tareas y seguimiento directo de tus oportunidades asignadas.
        </p>
      </div>
    </div>
  );
};

export default DashboardResponsable;