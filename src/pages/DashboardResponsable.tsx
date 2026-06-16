import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Usuario } from '../types/auth';
import { obtenerEstadisticasResponsable, type ResponsableDashboardStats } from '../services/dashboardService';

const backgroundIconStyle: React.CSSProperties = {
  position: 'absolute', right: 20, bottom: 20, opacity: 0.1, fontSize: 40, pointerEvents: 'none'
};

const DashboardResponsable = ({ user }: { user: Usuario }) => {
  const [stats, setStats] = useState<ResponsableDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await obtenerEstadisticasResponsable();
        setStats(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.error || err.response?.data?.message || 'Error al cargar tus métricas');
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Error desconocido al inicializar tu panel');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minHeight: '80vh', justifyContent: 'center' }}>
      <h1 className="page-title" style={{ marginBottom: 8, textAlign: 'center' }}>
        Bienvenida al <em>CRM</em>
      </h1>
      <p style={{ opacity: 0.7, fontSize: 14, marginBottom: 40, textAlign: 'center' }}>
        Hola, {user.nombre || 'Usuario'}. Este es tu resumen personal del progreso de tus oportunidades.
      </p>

      {error && (
        <div className="error-box" style={{ marginBottom: 20, background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', padding: '12px 16px', color: '#ff4444', borderRadius: 8, width: '100%', maxWidth: '900px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0', opacity: 0.6 }}>
          <span className="spinner" style={{ display: 'inline-block', marginBottom: 12 }} />
          <p>Cargando tus estadísticas personales...</p>
        </div>
      ) : (
        stats && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 30, width: '100%', maxWidth: '900px', marginBottom: 32 }}>
            
            {/* Tarjeta 1: Mis Prospecciones */}
            <div className="form-card" style={{ padding: '30px 24px', position: 'relative', overflow: 'hidden', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>Mis Prospecciones</p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: 'var(--text-main)' }}>{stats.prospeccion}</h2>
              <div style={backgroundIconStyle}>🔍</div>
            </div>

            {/* Tarjeta 2: Mis Propuestas */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #3b82f6', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>Mis Propuestas</p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#3b82f6' }}>{stats.propuesta}</h2>
              <div style={backgroundIconStyle}>📄</div>
            </div>

            {/* Tarjeta 3: Mis Negociaciones */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #f59e0b', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>Mis Negociaciones</p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#f59e0b' }}>{stats.negociacion}</h2>
              <div style={backgroundIconStyle}>🤝</div>
            </div>

            {/* Tarjeta 4: Mis Ganadas */}
            <div className="form-card" style={{ padding: '30px 24px', borderLeft: '4px solid #10b981', position: 'relative', minHeight: '160px' }}>
              <p style={{ fontSize: 14, opacity: 0.6, textTransform: 'uppercase', fontWeight: 'bold' }}>Mis Ventas Ganadas</p>
              <h2 style={{ fontSize: 48, margin: '12px 0 0 0', fontWeight: 'bold', color: '#10b981' }}>{stats.ganadas}</h2>
              <div style={backgroundIconStyle}>🏆</div>
            </div>

          </div>
        )
      )}
    </div>
  );
};

export default DashboardResponsable;