import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';

interface Cliente {
    id: string; 
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
    creado_por?: string;
    fecha_creacion?: string;
}

const Clientes: React.FC = () => {
    const API_URL = 'http://localhost:3000/api/clientes';
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user: Usuario | null = userString ? JSON.parse(userString) : null;

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        cliente: '',
        tipo: 'Privado',
        tipo_identificacion: 'Cédula',
        identificacion: ''
    });

    // ─── 1. CARGAR CLIENTES ───
    const fetchClientes = async () => {
        console.log("🔍 Intentando obtener clientes de:", API_URL);
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            console.log("📡 Estado de la respuesta (GET):", response.status);
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("❌ Error del servidor al listar:", errorText);
                throw new Error('Error al cargar clientes');
            }

            const data = await response.json();
            console.log("✅ Datos recibidos del servidor:", data);
            setClientes(data);
        } catch (err: any) {
            console.error("❌ Error en la petición GET:", err.message);
            setError(err.message);
        }
    };

    useEffect(() => {
        if (user) fetchClientes();
    }, []);

    const handleChange = (k: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        setForm((f) => ({ ...f, [k]: e.target.value }));
    };

    // ─── 2. GUARDAR CLIENTE ───
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        console.log("📤 Enviando datos al backend:", form);
        console.log("🔑 Usando Token:", token ? "Token presente" : "Token AUSENTE");

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            console.log("📡 Estado de la respuesta (POST):", response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error("❌ Error detallado del Back:", errorData);
                throw new Error(errorData.error || 'Error al guardar');
            }

            const clienteGuardado = await response.json();
            console.log("✅ Cliente guardado exitosamente:", clienteGuardado);

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
        } catch (err: any) {
            console.error("❌ Error en la petición POST:", err.message);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="dash-root">
            {/* Solo pasamos el usuario para evitar errores de tipos */}
            <Navbar user={user} />

            <div className="page-content">
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 28,
                    flexWrap: 'wrap',
                    gap: 16
                }}>
                    <div>
                        <p className="eyebrow">Directorio de Entidades</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>
                            Clientes
                        </h1>
                    </div>

                    <button 
                        className={showForm ? "btn-secondary" : "btn-primary"}
                        onClick={() => {
                            console.log("Toggle Form:", !showForm);
                            setShowForm(!showForm);
                        }}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Cliente'}
                    </button>
                </div>

                {error && (
                    <div className="error-box" style={{ marginBottom: 20, background: '#ff000022', border: '1px solid red', padding: 10 }}>
                        <strong>Error detectado:</strong> {error}
                    </div>
                )}
                
                {success && (
                    <div className="success-banner" style={{ marginBottom: 20 }}>
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
                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.cliente}
                                        onChange={handleChange('cliente')}
                                        placeholder="Ej: Corporación X"
                                        required
                                    />
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
                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.identificacion}
                                        onChange={handleChange('identificacion')}
                                        placeholder="0000000000"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-footer">
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : <IconSend />}
                                    {loading ? 'Procesando...' : 'Confirmar Registro'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="form-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {clientes.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: 20 }}>No se encontraron datos en la base.</p>
                        ) : (
                            clientes.map((c) => (
                                <div key={c.id} style={{
                                    padding: '16px 20px',
                                    borderRadius: 12,
                                    background: 'rgba(255,255,255,0.03)',
                                    border: '1px solid rgba(255,255,255,0.07)',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center'
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{c.cliente}</h3>
                                        <p style={{ fontSize: 13, opacity: 0.6 }}>
                                            {c.tipo_identificacion}: {c.identificacion}
                                        </p>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className={`badge ${c.tipo === 'Público' ? 'badge-blue' : 'badge-green'}`} 
                                              style={{ 
                                                  padding: '4px 10px', 
                                                  borderRadius: 20, 
                                                  fontSize: 12,
                                                  background: c.tipo === 'Público' ? '#1e3a8a' : '#064e3b'
                                              }}>
                                            {c.tipo}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Clientes;