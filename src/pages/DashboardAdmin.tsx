import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Usuario } from '../types/auth';
// Subimos un nivel a 'src' para entrar a 'services'
import { obtenerEstadisticasDashboard, type DashboardStats } from '../services/dashboardService';

// Estilo CSS para los iconos de fondo de las tarjetas
const backgroundIconStyle: React.CSSProperties = {
  position: 'absolute',
  right: 20,
  bottom: 20,
  opacity: 0.1,
  fontSize: 40,
  pointerEvents: 'none'
};

const DashboardAdmin = ({ user }: { user: Usuario }) => {
  // Estados para el control de la vista y los datos del dashboard
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Efecto para cargar las estadísticas al montar el componente
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await obtenerEstadisticasDashboard();
        setStats(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar métricas del dashboard');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al inicializar el panel');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
      
      {/* Mensaje original de bienvenida */}
      <h1 className="page-title" style={{ marginBottom: 8, textAlign: 'center' }}>
        Bienvenida al <em>CRM</em>
      </h1>
      
      <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 40, textAlign: 'center' }}>
        Hola, {user.nombre || 'Administrador'}. Aquí tienes el resumen de la gestión global de oportunidades.
      </p>

      {/* Manejo de errores en la API */}
      {error && (
        <div className="error-box" style={{ 
          marginBottom: 20, 
          background: 'rgba(255, 0, 0, 0.1)', 
          border: '1px solid #ff4444', 
          padding: '12px 16px',
          color: '#ff4444',
          borderRadius: 8,
          width: '100%',
          maxWidth: '900px'
        }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Pantalla de carga o renderizado de las métricas */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
          <span className="spinner" style={{ display: 'inline-block', marginBottom: 12 }} />
          <p>Cargando estadísticas de administrador...</p>
        </div>
      ) : (
        stats && (
          /* Grid Contenedor de las Tarjetas de Métricas en Matriz 2x2 */
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)', // Fuerza la matriz 2x2
            gap: 30, 
            width: '100%',
            maxWidth: '900px', // Limita el ancho para mantenerlo compacto y centrado
            marginBottom: 32
          }}>
              
            {/* Tarjeta 1: Total de Oportunidades */}
            <div className="form-card" style={{ padding: '30px 24px', position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.05em' }}>
                Total Oportunidades
              </p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: 'var(--text-main)' }}>
                {stats.totalOportunidades}
              </h2>
              <div style={backgroundIconStyle}>💼</div>
            </div>

            {/* Tarjeta 2: Oportunidades Pendientes */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #f59e0b', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>
                Pendientes
              </p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#f59e0b' }}>
                {stats.oportunidadesPendientes}
              </h2>
              <div style={backgroundIconStyle}>⏳</div>
            </div>

            {/* Tarjeta 3: Oportunidades Aprobadas */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #10b981', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>
                Aprobadas
              </p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#10b981' }}>
                {stats.oportunidadesAprobadas}
              </h2>
              <div style={backgroundIconStyle}>✅</div>
            </div>

            {/* Tarjeta 4: Oportunidades Rechazadas */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #ef4444', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>
                Rechazadas
              </p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#ef4444' }}>
                {stats.oportunidadesRechazadas}
              </h2>
              <div style={backgroundIconStyle}>❌</div>
            </div>

          </div>
        )
      )}
    </div>
  );
};

export default DashboardAdmin;