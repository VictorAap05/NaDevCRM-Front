import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import { obtenerAudit, type AuditLog } from '../services/auditService';
import type { Usuario } from '../types/auth'; 

const Audit = () => {
    const navigate = useNavigate();
    
    const userString = localStorage.getItem('user');
    const user: Usuario | null = userString ? JSON.parse(userString) : null;

    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!user || user.rol === 'Vendedor') {
            navigate('/dashboard'); 
            return;
        }

        const cargarDatos = async () => {
            try {
                const data = await obtenerAudit();
                setLogs(data);
            } catch (err: unknown) {
                console.error("Error al cargar auditoría:", err);
                setError('No se pudo cargar el historial de auditoría.');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [navigate, user]);

    const formatearFecha = (fechaIso: string) => {
        const fecha = new Date(fechaIso);
        return fecha.toLocaleString('es-EC', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getColorAccion = (accion: string) => {
        switch (accion) {
            case 'INSERT': return 'color-green';
            case 'UPDATE': return 'color-blue';
            case 'DELETE': return 'color-red';
            default: return '';
        }
    };

    if (!user) return null; 

    const obtenerDiferencias = (oldData: any, newData: any) => {
    if (!oldData && !newData) return <span>Sin datos</span>;
    
    // INSERT
    if (!oldData && newData) {
        return (
            <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
                {Object.entries(newData).map(([key, val]) => (
                    <li key={key}><strong>{key}:</strong> {String(val)}</li>
                ))}
            </ul>
        );
    }

    // DELETE
    if (oldData && !newData) {
        return (
            <ul style={{ margin: 0, padding: 0, listStyleType: 'none', opacity: 0.7 }}>
                {Object.entries(oldData).map(([key, val]) => (
                    <li key={key}><strong>{key}:</strong> {String(val)}</li>
                ))}
            </ul>
        );
    }

    // UPDATE: Solo iteramos sobre datos que ya vienen limpios de la base
    const diferencias: Array<{ campo: string; antes: any; ahora: any }> = [];

    Object.keys(newData).forEach((key) => {
        if (String(oldData[key]) !== String(newData[key])) {
            diferencias.push({ campo: key, antes: oldData[key], ahora: newData[key] });
        }
    });

    if (diferencias.length === 0) return <span style={{ opacity: 0.5 }}>Sin cambios visibles</span>;

    return (
        <ul style={{ margin: 0, padding: 0, listStyleType: 'none' }}>
            {diferencias.map((diff) => (
                <li key={diff.campo}>
                    <strong style={{ textTransform: 'capitalize' }}>{diff.campo}:</strong>{' '}
                    <span style={{ color: '#ff4444', textDecoration: 'line-through', marginRight: 6 }}>{String(diff.antes)}</span>
                    <span style={{ color: '#00c851' }}>➔ {String(diff.ahora)}</span>
                </li>
            ))}
        </ul>
    );
};

    return (
        <div className="dash-root"> 
            <Navbar user={user} />

            <div className="page-content">
                <div style={{ marginBottom: 28 }}>
                    <p className="eyebrow">Control y Seguridad</p>
                    <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>
                        Registro de Auditoría
                    </h1>
                    <p style={{ opacity: 0.7, marginTop: 10 }}>Historial de acciones realizadas por los usuarios en el sistema.</p>
                </div>

                {loading && <div>Cargando historial del sistema...</div>}
                
                {error && (
                    <div className="error-box" style={{ 
                        marginBottom: 20, 
                        background: 'rgba(255, 0, 0, 0.1)', 
                        border: '1px solid #ff4444', 
                        padding: '12px 16px',
                        color: '#ff4444',
                        borderRadius: 8
                    }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {!loading && !error && (
                    <div className="form-card" style={{ padding: 0, overflow: 'hidden' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Fecha</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Usuario</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Tabla</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Acción</th>
                                    <th style={{ padding: '16px 20px', fontWeight: 600 }}>Detalle</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ padding: '20px', textAlign: 'center', opacity: 0.5 }}>
                                            No hay registros de auditoría aún.
                                        </td>
                                    </tr>
                                ) : (
                                    logs.map((log) => (
                                        <tr key={log.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                            <td style={{ padding: '16px 20px' }}>{formatearFecha(log.created_at)}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <strong style={{ display: 'block' }}>{log.usuario_nombre || 'Sistema'}</strong>
                                                <small style={{ opacity: 0.6 }}>{log.usuario_email || 'N/A'}</small>
                                            </td>
                                            <td style={{ padding: '16px 20px', textTransform: 'capitalize' }}>{log.table_name}</td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <span style={{ 
                                                    padding: '4px 10px', 
                                                    borderRadius: 20, 
                                                    fontSize: 12,
                                                    fontWeight: 'bold',
                                                    background: log.action === 'INSERT' ? 'rgba(0,200,81,0.2)' : log.action === 'UPDATE' ? 'rgba(51,181,229,0.2)' : 'rgba(255,68,68,0.2)',
                                                    color: log.action === 'INSERT' ? '#00c851' : log.action === 'UPDATE' ? '#33b5e5' : '#ff4444'
                                                }}>
                                                    {log.action}
                                                </span>
                                            </td>
                                            <td style={{ padding: '16px 20px' }}>
                                                <div style={{ 
                                                    maxHeight: '120px', 
                                                    overflowY: 'auto', 
                                                    fontSize: '0.88em', 
                                                    background: 'rgba(0,0,0,0.25)', 
                                                    padding: '10px 14px', 
                                                    borderRadius: '8px',
                                                    border: '1px solid rgba(255,255,255,0.03)'
                                                }}>
                                                    {/* Invocamos de forma limpia la función de diferencias */}
                                                    {obtenerDiferencias(log.old_data, log.new_data)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Audit;