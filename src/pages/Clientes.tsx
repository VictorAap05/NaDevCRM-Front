import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';

// ─── UTILIDADES DE VALIDACIÓN (Ecuador) ───
const validarCedula = (cedula: string) => {
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;

    const digitoRegion = parseInt(cedula[2]);
    if (digitoRegion >= 6) return false;

    const ultimoDigito = parseInt(cedula[9]);
    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let mult = parseInt(cedula[i]) * (i % 2 === 0 ? 2 : 1);
        suma += mult > 9 ? mult - 9 : mult;
    }
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return digitoVerificador === ultimoDigito;
};

const validarRUC = (ruc: string) => {
    if (ruc.length !== 13 || !/^\d+$/.test(ruc)) return false;
    const establecimiento = ruc.substring(10, 13);
    if (establecimiento === '000') return false;
    
    // RUC Persona Natural (mismos primeros 10 dígitos que la cédula)
    return validarCedula(ruc.substring(0, 10));
};

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
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al cargar clientes');
            const data = await response.json();
            setClientes(data);
        } catch (err: any) {
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

    // ─── 2. GUARDAR CLIENTE CON VALIDACIONES ───
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        const { cliente, identificacion, tipo_identificacion } = form;

        // Validaciones Locales
        if (!cliente.trim()) {
            setError('El nombre del cliente es obligatorio.');
            return;
        }

        if (tipo_identificacion === 'Cédula') {
            if (!validarCedula(identificacion)) {
                setError('La cédula no es válida (debe tener 10 dígitos y cumplir el algoritmo regional).');
                return;
            }
        } else if (tipo_identificacion === 'RUC') {
            if (!validarRUC(identificacion)) {
                setError('El RUC no es válido (debe tener 13 dígitos y terminar en un establecimiento válido como 001).');
                return;
            }
        } else if (tipo_identificacion === 'Pasaporte') {
            if (identificacion.length < 5) {
                setError('El número de pasaporte es demasiado corto.');
                return;
            }
        }

        setLoading(true);

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(form)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al guardar el registro');
            }

            const clienteGuardado = await response.json();

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
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    return (
        <div className="dash-root">
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
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Cliente'}
                    </button>
                </div>

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
                
                {success && (
                    <div className="success-banner" style={{ 
                        marginBottom: 20, 
                        background: 'rgba(0, 255, 100, 0.1)',
                        border: '1px solid #00c851',
                        padding: '12px 16px',
                        color: '#00c851',
                        borderRadius: 8,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}>
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
                                        maxLength={form.tipo_identificacion === 'Cédula' ? 10 : form.tipo_identificacion === 'RUC' ? 13 : 20}
                                        placeholder={form.tipo_identificacion === 'Cédula' ? "10 dígitos" : "13 dígitos"}
                                        required
                                    />
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
                                                  background: c.tipo === 'Público' ? '#1e3a8a' : '#064e3b',
                                                  color: 'white'
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