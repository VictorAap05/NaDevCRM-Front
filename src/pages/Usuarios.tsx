import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';

// ─── UTILIDADES DE VALIDACIÓN ───
const validarCedulaEcuatoriana = (cedula: string) => {
    if (cedula.length !== 10 || !/^\d+$/.test(cedula)) return false;
    const provincia = parseInt(cedula.substring(0, 2));
    if (provincia < 1 || provincia > 24) return false;
    const digitoRegion = parseInt(cedula[2]);
    if (digitoRegion >= 6) return false;

    let suma = 0;
    for (let i = 0; i < 9; i++) {
        let mult = parseInt(cedula[i]) * (i % 2 === 0 ? 2 : 1);
        suma += mult > 9 ? mult - 9 : mult;
    }
    const digitoVerificador = (suma % 10 === 0) ? 0 : 10 - (suma % 10);
    return digitoVerificador === parseInt(cedula[9]);
};

const validarPassword = (pass: string) => {
    // Mínimo 8 caracteres, al menos una letra y un número
    return pass.length >= 8 && /\d/.test(pass) && /[a-zA-Z]/.test(pass);
};

interface UserListItem {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    cedula: string;
    telefono: string;
    areas: string;
    estado_activo: boolean;
}

const Usuarios: React.FC = () => {
    const API_URL = 'http://localhost:3000/api/usuarios';
    const userString = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    const user: Usuario | null = userString ? JSON.parse(userString) : null;

    const [usuarios, setUsuarios] = useState<UserListItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        rol: 'Responsable',
        cedula: '',
        telefono: '',
        areas: ''
    });

    const fetchUsuarios = async () => {
        try {
            const response = await fetch(API_URL, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!response.ok) throw new Error('Error al obtener usuarios');
            const data = await response.json();
            setUsuarios(data);
        } catch (err: any) {
            setError(err.message);
        }
    };

    useEffect(() => {
        if (user) fetchUsuarios();
    }, []);

    const handleChange = (k: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const value = e.target.value;
        if (k === 'rol' && value !== 'Jefe de Area') {
            setForm(f => ({ ...f, [k]: value, areas: '' }));
        } else {
            setForm(f => ({ ...f, [k]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // 1. Validar Cédula
        if (!validarCedulaEcuatoriana(form.cedula)) {
            setError('La cédula ingresada no es válida para el territorio ecuatoriano.');
            return;
        }

        // 2. Validar Teléfono (Ecuador móvil: 09XXXXXXXX)
        if (!/^09\d{8}$/.test(form.telefono)) {
            setError('El teléfono debe tener 10 dígitos y empezar con 09.');
            return;
        }

        // 3. Validar Email
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
            setError('El formato del correo electrónico es incorrecto.');
            return;
        }

        // 4. Validar Password
        if (!validarPassword(form.password)) {
            setError('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
            return;
        }

        // 5. Validar Área si es Jefe
        if (form.rol === 'Jefe de Area' && !form.areas) {
            setError('Debe asignar un área al Jefe de Área.');
            return;
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
                throw new Error(errorData.error || 'Error al crear usuario');
            }

            const nuevoUsuario = await response.json();
            setUsuarios([nuevoUsuario, ...usuarios]);
            setSuccess(true);
            setShowForm(false);
            setForm({ nombre: '', email: '', password: '', rol: 'Responsable', cedula: '', telefono: '', areas: '' });
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
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
                    <div>
                        <p className="eyebrow">Configuración del Sistema</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>Usuarios</h1>
                    </div>
                    <button className={showForm ? "btn-secondary" : "btn-primary"} onClick={() => {
                        setShowForm(!showForm);
                        setError('');
                    }}>
                        {showForm ? 'Cerrar' : '+ Añadir Integrante'}
                    </button>
                </div>

                {success && (
                    <div className="success-banner" style={{ marginBottom: 20, background: '#e6fffa', border: '1px solid #38b2ac', padding: '12px', borderRadius: '8px', color: '#2c7a7b' }}>
                        <IconCheck /> Registro exitoso.
                    </div>
                )}
                
                {error && (
                    <div className="error-box" style={{ marginBottom: 20, background: '#fff5f5', border: '1px solid #feb2b2', padding: '12px', borderRadius: '8px', color: '#c53030' }}>
                        <strong>Aviso:</strong> {error}
                    </div>
                )}

                {showForm && (
                    <div className="form-card" style={{ marginBottom: 32, border: '1px solid var(--accent)' }}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre Completo</label>
                                    <input className="field-input" type="text" value={form.nombre} onChange={handleChange('nombre')} placeholder="Ej: Emily ..." required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Cédula</label>
                                    <input className="field-input" type="text" value={form.cedula} onChange={handleChange('cedula')} maxLength={10} placeholder="172xxxxxxx" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Teléfono</label>
                                    <input className="field-input" type="text" value={form.telefono} onChange={handleChange('telefono')} maxLength={10} placeholder="0987654321" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Email</label>
                                    <input className="field-input" type="email" value={form.email} onChange={handleChange('email')} placeholder="usuario@epn.edu.ec" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Contraseña</label>
                                    <input className="field-input" type="password" value={form.password} onChange={handleChange('password')} placeholder="Min. 8 caracteres" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Rol</label>
                                    <select className="field-select" value={form.rol} onChange={handleChange('rol')}>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Jefe de Area">Jefe de Área</option>
                                        <option value="Responsable">Responsable</option>
                                    </select>
                                </div>

                                {form.rol === 'Jefe de Area' && (
                                    <div className="form-group">
                                        <label className="field-label">Área Asignada</label>
                                        <select className="field-select" value={form.areas} onChange={handleChange('areas')} required>
                                            <option value="">Seleccione...</option>
                                            <option value="Tecnología">Tecnología</option>
                                            <option value="IOT">IOT</option>
                                            <option value="Produccion">Producción</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="form-footer" style={{ marginTop: 20 }}>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', display: 'flex', justifyContent: 'center', gap: 10 }}>
                                    {loading ? 'Procesando...' : <><IconSend /> Guardar Usuario</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="form-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {usuarios.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5 }}>No hay usuarios registrados.</p>
                        ) : (
                            usuarios.map((u) => (
                                <div key={u.id} style={{ 
                                    padding: '16px 20px', 
                                    borderRadius: 12, 
                                    background: 'rgba(255,255,255,0.03)', 
                                    border: '1px solid rgba(255,255,255,0.07)', 
                                    display: 'flex', 
                                    justifyContent: 'space-between', 
                                    alignItems: 'center' 
                                }}>
                                    <div>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>{u.nombre}</h3>
                                        <p style={{ fontSize: 13, opacity: 0.6 }}>{u.email} • {u.telefono}</p>
                                        {u.rol === 'Jefe de Area' && u.areas && (
                                            <p style={{ fontSize: 11, color: '#4fd1c5', marginTop: 4 }}>
                                                Área: <strong>{u.areas}</strong>
                                            </p>
                                        )}
                                    </div>
                                    <span className="role-badge" style={{ 
                                        background: u.rol === 'Administrador' ? 'rgba(255, 78, 78, 0.1)' : 'rgba(79, 209, 197, 0.1)',
                                        color: u.rol === 'Administrador' ? '#ff4e4e' : '#4fd1c5',
                                        padding: '4px 12px',
                                        borderRadius: 8,
                                        fontSize: 12,
                                        border: `1px solid ${u.rol === 'Administrador' ? '#ff4e4e' : '#4fd1c5'}`
                                    }}>
                                        {u.rol}
                                    </span>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Usuarios;