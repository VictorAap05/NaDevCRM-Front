import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';
import { obtenerUsuarios, crearUsuario, type UserListItem } from '../services/usuarioService.ts';

import {
    validarCedulaEcuatoriana,
    validarPassword,
    validarTelefonoEcuador,
    validarEmail,
    validarNombreYApellido
} from '../utils/validaciones';

const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
        <circle cx="12" cy="12" r="3"></circle>
    </svg>
);

const IconEyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
        <line x1="1" y1="1" x2="23" y2="23"></line>
    </svg>
);

const Usuarios = () => {
    const [user] = useState<Usuario | null>(() => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    });

    const [usuarios, setUsuarios] = useState<UserListItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [form, setForm] = useState({
        nombre: '',
        email: '',
        password: '',
        passwordConfirm: '',
        rol: 'Responsable',
        cedula: '',
        telefono: '',
        areas: ''
    });

    useEffect(() => {
        const cargarListaUsuarios = async () => {
            setIsLoadingData(true);
            try {
                const data = await obtenerUsuarios();
                setUsuarios(data);
            } catch (err) {
                if (axios.isAxiosError(err)) {
                    setError(err.response?.data?.message || 'Error al obtener usuarios');
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
            cargarListaUsuarios();
        } else {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoadingData(false);
        }
    }, [user]);

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

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validarNombreYApellido(form.nombre)) {
            setError('Por favor, ingresa un nombre y apellido válidos (ej: Juan Pérez).');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (!validarCedulaEcuatoriana(form.cedula)) {
            setError('La cédula ingresada no es válida para el territorio ecuatoriano.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (!validarTelefonoEcuador(form.telefono)) {
            setError('El teléfono debe tener 10 dígitos y empezar con 09.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (!validarEmail(form.email)) {
            setError('El formato del correo electrónico es incorrecto.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (!validarPassword(form.password)) {
            setError('La contraseña debe tener al menos 8 caracteres, una letra y un número.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (form.password !== form.passwordConfirm) {
            setError('Las contraseñas no coinciden.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        if (form.rol === 'Jefe de Area' && !form.areas) {
            setError('Debe asignar un área al Jefe de Área.');
            setTimeout(() => scrollToTop(), 100);
            return;
        }

        setLoading(true);

        try {
            const payload = {
                nombre: form.nombre,
                email: form.email,
                password: form.password,
                rol: form.rol,
                cedula: form.cedula,
                telefono: form.telefono,
                areas: form.areas
            };

            const nuevoUsuario = await crearUsuario(payload);

            setUsuarios([nuevoUsuario, ...usuarios]);
            setSuccess(true);
            setShowForm(false);

            setForm({
                nombre: '',
                email: '',
                password: '',
                passwordConfirm: '',
                rol: 'Responsable',
                cedula: '',
                telefono: '',
                areas: ''
            });

            setShowPassword(false);
            setShowPasswordConfirm(false);

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(
                    err.response?.data?.error ||
                    err.response?.data?.message ||
                    'Error al crear usuario'
                );
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
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="field-input"
                                            type={showPassword ? "text" : "password"}
                                            value={form.password}
                                            onChange={handleChange('password')}
                                            placeholder="Min. 8 caracteres"
                                            required
                                            style={{ paddingRight: '40px', width: '100%' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096', padding: 0, display: 'flex'
                                            }}
                                            tabIndex={-1}
                                        >
                                            {showPassword ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Confirmar Contraseña</label>
                                    <div style={{ position: 'relative' }}>
                                        <input
                                            className="field-input"
                                            type={showPasswordConfirm ? "text" : "password"}
                                            value={form.passwordConfirm}
                                            onChange={handleChange('passwordConfirm')}
                                            placeholder="Repite la contraseña"
                                            required
                                            style={{ paddingRight: '40px', width: '100%' }}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPasswordConfirm(!showPasswordConfirm)}
                                            style={{
                                                position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                                                background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096', padding: 0, display: 'flex'
                                            }}
                                            tabIndex={-1}
                                        >
                                            {showPasswordConfirm ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
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
                        {isLoadingData ? (
                            <div style={{ textAlign: 'center', padding: '40px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <span className="spinner" style={{ width: 30, height: 30, borderWidth: 3, marginBottom: 15 }} />
                                <p style={{ opacity: 0.6 }}>Cargando usuarios...</p>
                            </div>
                        ) : usuarios.length === 0 ? (
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