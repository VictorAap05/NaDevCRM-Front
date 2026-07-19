import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Usuario } from '../types/auth';
import { obtenerEstadisticasAdmin, type AdminDashboardStats } from '../services/dashboardService';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Rectangle, Sector, Legend
} from 'recharts';

interface BarShapeProps {
  index?: number;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

interface PieShapeProps {
  index?: number;
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
}

const COLORS = {
  purpleGrad: 'linear-gradient(135deg, #b05cfd 0%, #fa59ce 100%)',
  cyanGrad: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
  darkCard: '#1f2235',
  appBg: '#16192b',
  textMain: '#ffffff',
  textMuted: '#8b92b2',
  chartPurple: '#8b5cf6',
  chartPink: '#ec4899',
  actionInsert: '#10b981', // Verde
  actionUpdate: '#f59e0b', // Naranja
  actionDelete: '#ef4444'  // Rojo
};

const DashboardAdmin = ({ user }: { user: Usuario }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await obtenerEstadisticasAdmin();
        setStats(data);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || 'Error al cargar métricas del administrador');
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

  const chartData = stats ? [
    { name: 'Usuarios', valor: stats.usuariosActivos, color: '#00f2fe' },
    { name: 'Clientes', valor: stats.clientesActivos, color: '#b05cfd' },
    { name: 'Oportunidades', valor: stats.totalOportunidades, color: '#8b5cf6' },
    { name: 'Áreas', valor: stats.numeroAreas, color: '#ec4899' }
  ] : [];

  return (
    <div className="page-content" style={{ backgroundColor: COLORS.appBg, minHeight: '100vh', padding: '30px', color: COLORS.textMain }}>
      
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
          CRM Dashboard
        </h1>
        <p style={{ color: COLORS.textMuted, marginTop: '8px' }}>
          Hola, {user.nombre || 'Administrador'}. Resumen de control global del sistema.
        </p>
      </div>

      {error && (
        <div style={{ background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', padding: '16px', color: '#ff4444', borderRadius: '12px', marginBottom: '20px' }}>
          <strong>Error:</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: COLORS.textMuted }}>
          <span className="spinner" style={{ display: 'inline-block', marginBottom: 12 }} />
          <p>Cargando estadísticas globales...</p>
        </div>
      ) : (
        stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* --- KPIs --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              
              <div style={{ background: COLORS.cyanGrad, borderRadius: '16px', padding: '24px', boxShadow: '0 10px 20px rgba(0, 242, 254, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>USUARIOS ACTIVOS</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '12px' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.usuariosActivos}</h2>
                  <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.8 }}>en sistema</span>
                </div>
              </div>

              <div style={{ background: COLORS.purpleGrad, borderRadius: '16px', padding: '24px', boxShadow: '0 10px 20px rgba(176, 92, 253, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>CLIENTES ACTIVOS</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '12px' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.clientesActivos}</h2>
                  <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.8 }}>registrados</span>
                </div>
              </div>

              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.textMuted }}>OPORTUNIDADES</p>
                  <span style={{ background: 'rgba(139, 92, 246, 0.2)', color: COLORS.chartPurple, padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Globales</span>
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '12px 0 0 0', color: COLORS.textMain }}>{stats.totalOportunidades}</h2>
              </div>

              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.textMuted }}>ÁREAS DE TRABAJO</p>
                  <span style={{ background: 'rgba(236, 72, 153, 0.2)', color: COLORS.chartPink, padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Activas</span>
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '12px 0 0 0', color: COLORS.chartPink }}>{stats.numeroAreas}</h2>
              </div>
            </div>

            {/* --- GRÁFICAS --- */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '24px', fontWeight: 600 }}>Estadísticas del Sistema</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2c304a" vertical={false} />
                      <XAxis dataKey="name" stroke={COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip cursor={{ fill: 'rgba(255,255,255,0.05)' }} contentStyle={{ background: '#25293c', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Bar
                        dataKey="valor"
                        radius={[6, 6, 0, 0]}
                        shape={(props: BarShapeProps) => (
                          <Rectangle {...props} fill={chartData[props.index ?? 0]?.color ?? COLORS.chartPurple} />
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '24px', fontWeight: 600 }}>Composición del Sistema</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={80}
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="valor"
                        stroke="none"
                        shape={(props: PieShapeProps) => (
                          <Sector {...props} fill={chartData[props.index ?? 0]?.color ?? COLORS.chartPurple} />
                        )}
                      />
                      <ChartTooltip contentStyle={{ background: '#25293c', border: 'none', borderRadius: '8px', color: '#fff' }} />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: COLORS.textMuted }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* --- TABLA DE AUDITORÍA --- */}
            <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
              <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '20px', fontWeight: 600 }}>Últimos Movimientos del Sistema</h3>
              
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.1)', color: COLORS.textMuted, fontSize: '12px', textTransform: 'uppercase' }}>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Fecha y Hora</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Usuario</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Acción</th>
                      <th style={{ padding: '12px 16px', fontWeight: 600 }}>Tabla Afectada</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.ultimosCambios && stats.ultimosCambios.length > 0 ? (
                      stats.ultimosCambios.map((log) => {
                        // Determinar colores del badge según la acción
                        let actionColor = COLORS.textMuted;
                        let actionBg = 'rgba(139, 146, 178, 0.2)';
                        
                        if (log.action === 'INSERT') { actionColor = COLORS.actionInsert; actionBg = 'rgba(16, 185, 129, 0.2)'; }
                        if (log.action === 'UPDATE') { actionColor = COLORS.actionUpdate; actionBg = 'rgba(245, 158, 11, 0.2)'; }
                        if (log.action === 'DELETE') { actionColor = COLORS.actionDelete; actionBg = 'rgba(239, 68, 68, 0.2)'; }

                        return (
                          <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', fontSize: '14px' }}>
                            <td style={{ padding: '16px', color: COLORS.textMuted }}>
                              {new Date(log.created_at).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </td>
                            <td style={{ padding: '16px', color: COLORS.textMain, fontWeight: 500 }}>
                              {log.usuario_nombre || 'Sistema / Desconocido'}
                            </td>
                            <td style={{ padding: '16px' }}>
                              <span style={{ backgroundColor: actionBg, color: actionColor, padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
                                {log.action}
                              </span>
                            </td>
                            <td style={{ padding: '16px', color: COLORS.textMain }}>
                              {log.table_name}
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: COLORS.textMuted }}>
                          No hay registros de auditoría recientes.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )
      )}
    </div>
  );
};

export default DashboardAdmin;