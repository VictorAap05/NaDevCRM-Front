import { useState, useEffect } from 'react';
import axios from 'axios';
import type { Usuario } from '../types/auth';
import { obtenerEstadisticasResponsable, type ResponsableDashboardStats } from '../services/dashboardService';
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

// Paleta de colores basada en la imagen que enviaste
const COLORS = {
  purpleGrad: 'linear-gradient(135deg, #b05cfd 0%, #fa59ce 100%)',
  cyanGrad: 'linear-gradient(135deg, #00f2fe 0%, #4facfe 100%)',
  darkCard: '#1f2235',
  appBg: '#16192b',
  textMain: '#ffffff',
  textMuted: '#8b92b2',
  chartOrange: '#f59e0b',
  chartGreen: '#10b981'
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
          setError(err.response?.data?.error || 'Error al cargar tus métricas');
        } else {
          setError('Error desconocido al inicializar tu panel');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  // Preparar datos para las gráficas
  const chartData = stats ? [
    { name: 'Prospección', valor: stats.prospeccion, color: '#00f2fe' },
    { name: 'Propuesta', valor: stats.propuesta, color: '#b05cfd' },
    { name: 'Negociación', valor: stats.negociacion, color: '#f59e0b' },
    { name: 'Ganadas', valor: stats.ganadas, color: '#10b981' }
  ] : [];

  return (
    // Forzamos el fondo oscuro general de la app para este dashboard
    <div className="page-content" style={{ backgroundColor: COLORS.appBg, minHeight: '100vh', padding: '30px', color: COLORS.textMain }}>
      
      {/* Cabecera */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: 0, letterSpacing: '1px' }}>
          CRM Dashboard
        </h1>
        <p style={{ color: COLORS.textMuted, marginTop: '8px' }}>
          Hola, {user.nombre || 'Usuario'}. Resumen de tu embudo de ventas.
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
          <p>Cargando gráficas...</p>
        </div>
      ) : (
        stats && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {/* =========================================
                FILA 1: TARJETAS DE INDICADORES (KPIs) 
            ========================================= */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px' }}>
              
              {/* Tarjeta 1: Gradiente Morado/Rosa */}
              <div style={{ background: COLORS.purpleGrad, borderRadius: '16px', padding: '24px', boxShadow: '0 10px 20px rgba(176, 92, 253, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>PROSPECCIÓN</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '12px' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.prospeccion}</h2>
                  <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.8 }}>leads</span>
                </div>
              </div>

              {/* Tarjeta 2: Gradiente Turquesa/Azul */}
              <div style={{ background: COLORS.cyanGrad, borderRadius: '16px', padding: '24px', boxShadow: '0 10px 20px rgba(0, 242, 254, 0.2)' }}>
                <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, opacity: 0.9 }}>PROPUESTAS</p>
                <div style={{ display: 'flex', alignItems: 'baseline', marginTop: '12px' }}>
                  <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: 0 }}>{stats.propuesta}</h2>
                  <span style={{ marginLeft: '8px', fontSize: '14px', opacity: 0.8 }}>enviadas</span>
                </div>
              </div>

              {/* Tarjeta 3: Oscura Neon Naranja */}
              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.textMuted }}>NEGOCIACIÓN</p>
                  <span style={{ background: 'rgba(245, 158, 11, 0.2)', color: COLORS.chartOrange, padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>En curso</span>
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '12px 0 0 0', color: COLORS.textMain }}>{stats.negociacion}</h2>
              </div>

              {/* Tarjeta 4: Oscura Neon Verde */}
              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <p style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: COLORS.textMuted }}>GANADAS</p>
                  <span style={{ background: 'rgba(16, 185, 129, 0.2)', color: COLORS.chartGreen, padding: '4px 10px', borderRadius: '20px', fontSize: '12px' }}>Cerradas</span>
                </div>
                <h2 style={{ fontSize: '42px', fontWeight: 'bold', margin: '12px 0 0 0', color: COLORS.chartGreen }}>{stats.ganadas}</h2>
              </div>
            </div>

            {/* =========================================
                FILA 2: GRÁFICAS 
            ========================================= */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px' }}>
              
              {/* Gráfica 1: Barras (Embudo de Ventas) */}
              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '24px', fontWeight: 600 }}>Rendimiento del Embudo</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#2c304a" vertical={false} />
                      <XAxis dataKey="name" stroke={COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke={COLORS.textMuted} fontSize={12} tickLine={false} axisLine={false} />
                      <ChartTooltip 
                        cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                        contentStyle={{ background: '#25293c', border: 'none', borderRadius: '8px', color: '#fff' }} 
                      />
                      <Bar
                        dataKey="valor"
                        radius={[6, 6, 0, 0]}
                        shape={(props: BarShapeProps) => (
                          <Rectangle {...props} fill={chartData[props.index ?? 0]?.color ?? COLORS.chartOrange} />
                        )}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Gráfica 2: Donut (Distribución) */}
              <div style={{ background: COLORS.darkCard, borderRadius: '16px', padding: '24px', border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '16px', color: COLORS.textMain, marginBottom: '24px', fontWeight: 600 }}>Distribución de Oportunidades</h3>
                <div style={{ width: '100%', height: '300px' }}>
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="45%"
                        innerRadius={80} // Esto hace que sea un "Donut" en vez de un pastel sólido
                        outerRadius={110}
                        paddingAngle={5}
                        dataKey="valor"
                        stroke="none"
                        shape={(props: PieShapeProps) => (
                          <Sector {...props} fill={chartData[props.index ?? 0]?.color ?? COLORS.chartOrange} />
                        )}
                      />
                      <ChartTooltip 
                        contentStyle={{ background: '#25293c', border: 'none', borderRadius: '8px', color: '#fff' }} 
                      />
                      <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '13px', color: COLORS.textMuted }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>
        )
      )}
    </div>
  );
};

export default DashboardResponsable;