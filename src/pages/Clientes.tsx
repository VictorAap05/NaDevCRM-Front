import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';
import { obtenerClientes, crearCliente, type Cliente } from '../services/clienteService';
import { obtenerOportunidades, type OportunidadListItem } from '../services/oportunidadService';
import { validarCedulaEcuatoriana, validarRUC } from '../utils/validaciones';

const Clientes = () => {
    const navigate = useNavigate();
    
    const [user] = useState<Usuario | null>(() => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    });

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [oportunidades, setOportunidades] = useState<OportunidadListItem[]>([]);
    const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        cliente: '',
        tipo: 'Privado',
        tipo_identificacion: 'Cédula',
        identificacion: ''
    });

    useEffect(() => {
        const fetchDatosIniciales = async () => {
            setIsLoadingData(true);
            try {
                const [clientesData, opsData] = await Promise.all([
                    obtenerClientes(),
                    obtenerOportunidades().catch(() => [] as OportunidadListItem[])
                ]);
                setClientes(clientesData);
                setOportunidades(opsData);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Error al cargar la información');
                } else if (err instanceof Error) {
                    setError(err.message);
                } else {
                    setError('Error desconocido al cargar la lista');
                }
            } finally {
                setIsLoadingData(false);
            }
        };

        if (user) {
            fetchDatosIniciales();
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoadingData(false);
        }
    }, [user?.id]);

    const handleChange = (k: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
    };

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { cliente, identificacion, tipo_identificacion } = form;

        if (!cliente.trim()) {
            setError('El nombre del cliente es obligatorio.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (tipo_identificacion === 'Cédula') {
            if (!validarCedulaEcuatoriana(identificacion)) {
                setError('La cédula no es válida (debe tener 10 dígitos y cumplir el algoritmo regional).');
                setTimeout(() => scrollToTop(), 100);
                return;
            }
        } else if (tipo_identificacion === 'RUC') {
            if (!validarRUC(identificacion)) {
                setError('El RUC no es válido (debe tener 13 dígitos y terminar en un establecimiento válido como 001).');
                setTimeout(() => scrollToTop(), 100);
                return;
            }
        } else if (tipo_identificacion === 'Pasaporte') {
            if (identificacion.length < 5) {
                setError('El número de pasaporte es demasiado corto.');
                setTimeout(() => scrollToTop(), 100);
                return;
            }
        }

        setLoading(true);

        try {
            const clienteGuardado = await crearCliente(form);

            setClientes([clienteGuardado, ...clientes]);
            setSuccess(true);
            setShowForm(false);
            setForm({
                cliente: '',
                tipo: 'Privado',
                tipo_identificacion: 'Cédula',
                identificacion: ''
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || err.response?.data?.message || 'Error al guardar el registro');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error al procesar la solicitud');
            }
            setTimeout(() => scrollToTop(), 100);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="dash-root">
            <Navbar user={user} />

            <div className="page-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p className="eyebrow">Directorio de Entidades</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>Clientes</h1>
                    </div>

                    <button 
                        className={showForm ? "btn-secondary" : "btn-primary"}
                        onClick={() => {
                            setShowForm(!showForm);
                            setError('');
                        }}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Cliente'}
                    </button>
                </div>

                {error && (
                    <div className="error-box" style={{ marginBottom: 20, background: 'rgba(255, 0, 0, 0.1)', border: '1px solid #ff4444', padding: '12px 16px', color: '#ff4444', borderRadius: 8 }}>
                        <strong>Error:</strong> {error}
                    </div>
                )}
                
                {success && (
                    <div className="success-banner" style={{ marginBottom: 20, background: 'rgba(0, 255, 100, 0.1)', border: '1px solid #00c851', padding: '12px 16px', color: '#00c851', borderRadius: 8, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <IconCheck /> Cliente registrado correctamente.
                    </div>
                )}

                {showForm && (
                    <div className="form-card" style={{ marginBottom: 32, border: '1px solid var(--accent)' }}>
                        <h2 style={{ marginBottom: 20, fontSize: 18 }}>Nuevo Registro</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre del Cliente / Razón Social</label>
                                    <input className="field-input" type="text" value={form.cliente} onChange={handleChange('cliente')} placeholder="Ej: Corporación X" required />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Tipo de Entidad</label>
                                    <select className="field-select" value={form.tipo} onChange={handleChange('tipo')}>
                                        <option value="Público">Público</option>
                                        <option value="Privado">Privado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Tipo Identificación</label>
                                    <select className="field-select" value={form.tipo_identificacion} onChange={handleChange('tipo_identificacion')}>
                                        <option value="Cédula">Cédula</option>
                                        <option value="RUC">RUC</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>

                                <div className="form-group full">
                                    <label className="field-label">Número de Identificación</label>
                                    <input className="field-input" type="text" value={form.identificacion} onChange={handleChange('identificacion')} maxLength={form.tipo_identificacion === 'Cédula' ? 10 : form.tipo_identificacion === 'RUC' ? 13 : 20} placeholder={form.tipo_identificacion === 'Cédula' ? "10 dígitos" : form.tipo_identificacion === 'RUC' ? "13 dígitos" : "Mínimo 5 caracteres"} required />
                                </div>
                            </div>

                            <div className="form-footer" style={{ marginTop: 24 }}>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 10 }}>
                                    {loading ? <span className="spinner" /> : <IconSend />}
                                    {loading ? 'Procesando...' : 'Confirmar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="form-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {isLoadingData ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className="spinner" style={{ width: 30, height: 30, borderWidth: 3, marginBottom: 15 }} />
                                <p style={{ opacity: 0.6 }}>Cargando clientes...</p>
                            </div>
                        ) : clientes.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: 20 }}>No se encontraron datos en la base.</p>
                        ) : (
                            clientes.map((c) => {
                                const clientOps = oportunidades.filter(op => op.cliente_id === c.id);
                                const isExpanded = expandedClienteId === c.id;

                                return (
                                    <div 
                                        key={c.id} 
                                        style={{
                                            padding: '16px 20px', 
                                            borderRadius: 12, 
                                            background: 'rgba(255,255,255,0.03)',
                                            border: isExpanded ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.07)',
                                            display: 'flex',
                                            flexDirection: 'column',
                                            gap: 12
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                            <div>
                                                <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.cliente}</h3>
                                                <p style={{ fontSize: 13, opacity: 0.6 }}>
                                                    {c.tipo_identificacion}: {c.identificacion}
                                                </p>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                                <span className={`badge ${c.tipo === 'Público' ? 'badge-blue' : 'badge-green'}`} style={{ padding: '4px 10px', borderRadius: 20, fontSize: 12, background: c.tipo === 'Público' ? '#1e3a8a' : '#064e3b', color: 'white' }}>
                                                    {c.tipo}
                                                </span>

                                                <button 
                                                    onClick={() => setExpandedClienteId(isExpanded ? null : c.id)}
                                                    style={{
                                                        padding: '6px 12px',
                                                        borderRadius: 8,
                                                        fontSize: 12,
                                                        fontWeight: 500,
                                                        background: isExpanded ? 'rgba(255,255,255,0.1)' : 'rgba(51,181,229,0.15)',
                                                        color: isExpanded ? 'white' : '#33b5e5',
                                                        border: isExpanded ? '1px solid rgba(255,255,255,0.2)' : '1px solid rgba(51,181,229,0.3)',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                    {isExpanded ? 'Ocultar Ops ▲' : `Ops (${clientOps.length}) ▼`}
                                                </button>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div style={{ padding: '12px 0 4px 0', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: 8 }}>
                                                <p style={{ fontSize: 13, opacity: 0.5, fontWeight: 500 }}>Oportunidades Comerciales:</p>
                                                
                                                {clientOps.length === 0 ? (
                                                    <p style={{ fontSize: 13, opacity: 0.4, fontStyle: 'italic', paddingLeft: 4 }}>
                                                        No existen oportunidades vinculadas a este cliente actualmente.
                                                    </p>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                            {clientOps.map(op => (
                                                                <div key={op.id} style={{ display: 'flex', justifyContent: 'space-between', background: 'rgba(0,0,0,0.15)', padding: '10px 14px', borderRadius: 8, fontSize: 13, border: '1px solid rgba(255,255,255,0.02)' }}>
                                                                    <span><strong>{op.nombre_oportunidad}</strong></span>
                                                                    <div style={{ display: 'flex', gap: 14, opacity: 0.8 }}>
                                                                        <span>${op.monto_estimado}</span>
                                                                        <span style={{ color: 'var(--accent)' }}>{op.fase_venta}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        
                                                        <button
                                                            onClick={() => navigate('/oportunidades')}
                                                            style={{ alignSelf: 'flex-start', marginTop: 6, background: 'transparent', color: '#33b5e5', border: 'none', cursor: 'pointer', fontSize: 13, padding: '4px 0', textDecoration: 'underline' }}
                                                        >
                                                            Ver detalles en el módulo de oportunidades ➔
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clientes;