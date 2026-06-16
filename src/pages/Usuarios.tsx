import { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';
import { obtenerUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario, type UserListItem } from '../services/usuarioService';

import {
    validarCedulaEcuatoriana,
    validarPassword,
    validarTelefonoEcuador,
    validarEmail,
    validarNombreYApellido
} from '../utils/validaciones';

/* ─── Iconos ─────────────────────────────────────────────── */
const IconEye = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
);
const IconEyeOff = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>
);
const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}><circle cx="8" cy="8" r="7" stroke="#ff9a9a" strokeWidth="1.5" /><path d="M8 4.5V8.5" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round" /><circle cx="8" cy="11" r="0.75" fill="#ff9a9a" /></svg>
);
const WarnIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /><path d="M12 9v4M12 17h.01" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" /></svg>
);
const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" /></svg>
);
const DeactivateIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M18.36 6.64a9 9 0 1 1-12.73 0"></path><line x1="12" y1="2" x2="12" y2="12"></line></svg>
);
const ActivateIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
);

/* ─── Styles Modales ─────────────────────────────────────── */
const styles = {
    overlay: { position: 'fixed' as const, inset: 0, background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, padding: 24, animation: 'fadeIn 0.18s ease' },
    modal: { width: '100%', maxWidth: 560, background: '#111318', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: '36px 40px', animation: 'slideUp 0.22s ease', maxHeight: '90vh', overflowY: 'auto' as const },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    modalEyebrow: { fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#4fd1c5', marginBottom: 6 },
    modalTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0f4ff', lineHeight: 1.2, margin: 0 },
    closeBtn: { width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'background 0.2s' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 },
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 7 },
    fieldError: { fontSize: 12, color: '#ff9a9a', marginTop: 4 },
    modalFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' },
};

const fieldErrorStyle: React.CSSProperties = { borderColor: 'rgba(255,80,80,0.5)', background: 'rgba(255,80,80,0.05)' };

/* ─── Modal de Edición ───────────────────────────────────── */
interface EditModalProps { usuario: UserListItem; onClose: () => void; onSaved: (u: UserListItem) => void; }

const EditModal: React.FC<EditModalProps> = ({ usuario, onClose, onSaved }) => {
    const [form, setForm] = useState({ nombre: usuario.nombre, email: usuario.email, rol: usuario.rol, cedula: usuario.cedula, telefono: usuario.telefono, areas: usuario.areas || '' });
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [errorGlobal, setErrorGlobal] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = e.target.value;
        setForm(f => ({ ...f, [k]: val, ...(k === 'rol' && val !== 'Jefe de Area' ? { areas: '' } : {}) }));
        if (errores[k]) setErrores(prev => { const n = { ...prev }; delete n[k]; return n; });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorGlobal('');
        
        const errs: Record<string, string> = {};
        if (!validarNombreYApellido(form.nombre)) errs.nombre = 'Ingresa nombre y apellido.';
        if (!validarCedulaEcuatoriana(form.cedula)) errs.cedula = 'Cédula no válida.';
        if (!validarTelefonoEcuador(form.telefono)) errs.telefono = 'Teléfono no válido.';
        if (!validarEmail(form.email)) errs.email = 'Email incorrecto.';
        if (form.rol === 'Jefe de Area' && !form.areas) errs.areas = 'Área obligatoria.';
        
        if (Object.keys(errs).length > 0) { setErrores(errs); return; }

        setLoading(true);
        try {
            const res = await actualizarUsuario(usuario.id, form);
            onSaved(res.usuario);
        } catch (err) {
            if (axios.isAxiosError(err)) setErrorGlobal(err.response?.data?.error || 'Error al actualizar.');
            else setErrorGlobal('Error inesperado.');
        } finally { setLoading(false); }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div>
                        <p style={styles.modalEyebrow}>Gestión de Cuentas</p>
                        <h2 style={styles.modalTitle}>Editar <em style={{ fontStyle: 'italic', color: '#4fd1c5' }}>usuario</em></h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg></button>
                </div>
                {errorGlobal && <div className="error-box" style={{ marginBottom: 20 }}><ErrorIcon /> {errorGlobal}</div>}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label">Nombre Completo <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input className="field-input" style={errores.nombre ? fieldErrorStyle : undefined} type="text" value={form.nombre} onChange={set('nombre')} />
                            {errores.nombre && <span style={styles.fieldError}>{errores.nombre}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label className="field-label">Cédula <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input className="field-input" style={errores.cedula ? fieldErrorStyle : undefined} type="text" value={form.cedula} onChange={set('cedula')} maxLength={10} />
                            {errores.cedula && <span style={styles.fieldError}>{errores.cedula}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label className="field-label">Teléfono <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input className="field-input" style={errores.telefono ? fieldErrorStyle : undefined} type="text" value={form.telefono} onChange={set('telefono')} maxLength={10} />
                            {errores.telefono && <span style={styles.fieldError}>{errores.telefono}</span>}
                        </div>
                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label">Email <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input className="field-input" style={errores.email ? fieldErrorStyle : undefined} type="email" value={form.email} onChange={set('email')} />
                            {errores.email && <span style={styles.fieldError}>{errores.email}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label className="field-label">Rol <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <select className="field-select" value={form.rol} onChange={set('rol')}>
                                <option value="Administrador">Administrador</option>
                                <option value="Jefe de Area">Jefe de Área</option>
                                <option value="Responsable">Responsable</option>
                            </select>
                        </div>
                        {form.rol === 'Jefe de Area' && (
                            <div style={styles.formGroup}>
                                <label className="field-label">Área Asignada <span style={{ color: '#ff9a9a' }}>*</span></label>
                                <select className="field-select" style={errores.areas ? fieldErrorStyle : undefined} value={form.areas} onChange={set('areas')}>
                                    <option value="">Seleccione...</option>
                                    <option value="Tecnología">Tecnología</option>
                                    <option value="IOT">IOT</option>
                                    <option value="Produccion">Producción</option>
                                </select>
                                {errores.areas && <span style={styles.fieldError}>{errores.areas}</span>}
                            </div>
                        )}
                    </div>
                    <div style={styles.modalFooter}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>{loading ? <><span className="spinner" /> Guardando...</> : <><IconSend /> Guardar cambios</>}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

/* ─── Modal de Cambio de Estado (Activar/Desactivar) ─────── */
interface ToggleModalProps { usuario: UserListItem; onClose: () => void; onToggled: (id: string, nuevoEstado: boolean) => void; }

const ToggleStatusModal: React.FC<ToggleModalProps> = ({ usuario, onClose, onToggled }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const isActivo = usuario.estado_activo;
    
    // Configuración visual dinámica basada en la acción a realizar
    const colorHex = isActivo ? '255,80,80' : '0,200,81';
    const colorSolid = isActivo ? '#dc2626' : '#059669';

    const handleConfirmar = async () => {
        setLoading(true);
        try {
            await eliminarUsuario(usuario.id); 
            // Invertimos el estado localmente ya que el backend hizo el toggle
            onToggled(usuario.id, !isActivo); 
            onClose();
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.error || 'Error al modificar estado.');
            else setError('Error inesperado.');
        } finally { setLoading(false); }
    };

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={{ ...styles.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: `rgba(${colorHex},0.12)`, border: `1px solid rgba(${colorHex},0.25)`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', color: colorSolid }}>
                        {isActivo ? <WarnIcon /> : <ActivateIcon />}
                    </div>
                    <h2 style={{ ...styles.modalTitle, fontSize: 20, marginBottom: 10 }}>
                        {isActivo ? '¿Desactivar usuario?' : '¿Reactivar usuario?'}
                    </h2>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 6 }}>
                        Estás a punto de {isActivo ? 'deshabilitar' : 'habilitar'} el acceso para
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#e8efff', marginBottom: 8 }}>"{usuario.nombre}"</p>
                    <p style={{ fontSize: 13, color: `rgba(${colorHex},0.7)`, lineHeight: 1.5 }}>
                        {isActivo ? 'El usuario será expulsado y ya no podrá iniciar sesión.' : 'El usuario recuperará todos sus accesos al sistema.'}
                    </p>
                </div>
                {error && <div style={{ marginTop: 14, color: '#ff9a9a', fontSize: 13, textAlign: 'center' }}>{error}</div>}
                
                <div style={{ ...styles.modalFooter, justifyContent: 'center', gap: 12, marginTop: 28, borderTop: 'none' }}>
                    <button className="btn-secondary" style={{ minWidth: 120 }} onClick={onClose}>Cancelar</button>
                    <button onClick={handleConfirmar} disabled={loading} style={{
                        minWidth: 140, padding: '12px 24px', background: colorSolid, color: '#fff', border: 'none', borderRadius: 10,
                        fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                        boxShadow: `0 4px 16px rgba(${colorHex},0.35)`, opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s',
                    }}>
                        {loading ? <><span className="spinner" /> Procesando...</> : <>{isActivo ? <DeactivateIcon /> : <ActivateIcon />} Sí, {isActivo ? 'desactivar' : 'activar'}</>}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Componente Principal ───────────────────────────────── */
const Usuarios = () => {
    const [user] = useState<Usuario | null>(() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    });

    const [usuarios, setUsuarios] = useState<UserListItem[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [usuarioEditando, setUsuarioEditando] = useState<UserListItem | null>(null);
    const [usuarioToggling, setUsuarioToggling] = useState<UserListItem | null>(null);

    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [successMessage, setSuccessMessage] = useState('');
    const [error, setError] = useState('');

    const [showPassword, setShowPassword] = useState(false);
    const [showPasswordConfirm, setShowPasswordConfirm] = useState(false);

    const [form, setForm] = useState({ nombre: '', email: '', password: '', passwordConfirm: '', rol: 'Responsable', cedula: '', telefono: '', areas: '' });

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!user) { setIsLoadingData(false); return; }
        const fetch = async () => {
            setIsLoadingData(true);
            try {
                const data = await obtenerUsuarios();
                setUsuarios(data);
            } catch (err) {
                setError(axios.isAxiosError(err) ? err.response?.data?.message || 'Error al cargar' : 'Error desconocido');
            } finally { setIsLoadingData(false); }
        };
        fetch();
    }, [user]);

    const handleChange = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const val = e.target.value;
        setForm(f => ({ ...f, [k]: val, ...(k === 'rol' && val !== 'Jefe de Area' ? { areas: '' } : {}) }));
    };

    const showSuccess = (msg: string) => {
        setSuccessMessage(msg);
        setTimeout(() => setSuccessMessage(''), 3500);
    };

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!validarNombreYApellido(form.nombre)) return setError('Ingresa un nombre y apellido válidos.');
        if (!validarCedulaEcuatoriana(form.cedula)) return setError('Cédula no válida.');
        if (!validarTelefonoEcuador(form.telefono)) return setError('Teléfono no válido.');
        if (!validarEmail(form.email)) return setError('Email incorrecto.');
        if (!validarPassword(form.password)) return setError('Mínimo 8 caracteres, una letra y un número.');
        if (form.password !== form.passwordConfirm) return setError('Las contraseñas no coinciden.');
        if (form.rol === 'Jefe de Area' && !form.areas) return setError('Área obligatoria.');

        setLoading(true);
        try {
            const nuevo = await crearUsuario({ ...form });
            setUsuarios(prev => [nuevo, ...prev]);
            showSuccess('Usuario registrado correctamente.');
            setShowForm(false);
            setForm({ nombre: '', email: '', password: '', passwordConfirm: '', rol: 'Responsable', cedula: '', telefono: '', areas: '' });
            setShowPassword(false); setShowPasswordConfirm(false);
        } catch (err) {
            if (axios.isAxiosError(err)) setError(err.response?.data?.error || 'Error al guardar.');
            else setError('Error al procesar solicitud.');
        } finally { setLoading(false); }
    };

    const handleUsuarioGuardado = (actualizado: UserListItem) => {
        setUsuarios(prev => prev.map(u => u.id === actualizado.id ? actualizado : u));
        setUsuarioEditando(null);
        showSuccess('Los datos del usuario fueron actualizados.');
    };

    const handleUsuarioToggled = (id: string, nuevoEstado: boolean) => {
        setUsuarios(prev => prev.map(u => u.id === id ? { ...u, estado_activo: nuevoEstado } : u));
        showSuccess(nuevoEstado ? 'El usuario ha sido reactivado.' : 'El usuario fue deshabilitado exitosamente.');
    };

    if (!user) return null;

    return (
        <div className="dash-root">
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
                .row-action-btn {
                    width: 32px; height: 32px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.45); cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: background 0.18s, color 0.18s, border-color 0.18s; flex-shrink: 0;
                }
                .row-action-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.85); }
                .row-action-btn.edit:hover { background: rgba(78,158,255,0.12); color: #89c2ff; border-color: rgba(78,158,255,0.3); }
                .row-action-btn.delete:hover { background: rgba(255,80,80,0.1); color: #ff9a9a; border-color: rgba(255,80,80,0.3); }
                .row-action-btn.activate:hover { background: rgba(0,200,81,0.1); color: #00c851; border-color: rgba(0,200,81,0.3); }
            `}</style>

            <Navbar user={user} />

            <div className="page-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p className="eyebrow">Configuración del Sistema</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 4 }}>Usuarios</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>{usuarios.length} registro{usuarios.length !== 1 ? 's' : ''}</p>
                    </div>
                    <button className={showForm ? "btn-secondary" : "btn-primary"} onClick={() => { setShowForm(s => !s); setError(''); }}>
                        {showForm ? 'Cancelar' : '+ Añadir Integrante'}
                    </button>
                </div>

                {successMessage && <div className="success-banner" style={{ marginBottom: 20 }}><IconCheck /> {successMessage}</div>}
                {error && <div className="error-box" style={{ marginBottom: 20 }}><ErrorIcon /> {error}</div>}

                {/* Formulario Inline SOLO para Crear */}
                {showForm && (
                    <div className="form-card" style={{ marginBottom: 32, border: '1px solid rgba(78,158,255,0.2)' }}>
                        <h2 style={{ fontSize: 17, marginBottom: 24, color: '#e8efff', fontWeight: 500 }}>Nuevo Registro</h2>
                        <form onSubmit={handleCreateSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre Completo <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input className="field-input" type="text" value={form.nombre} onChange={handleChange('nombre')} placeholder="Ej: Emily ..." required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Cédula <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input className="field-input" type="text" value={form.cedula} onChange={handleChange('cedula')} maxLength={10} placeholder="172xxxxxxx" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Teléfono <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input className="field-input" type="text" value={form.telefono} onChange={handleChange('telefono')} maxLength={10} placeholder="0987654321" required />
                                </div>
                                <div className="form-group full">
                                    <label className="field-label">Email <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input className="field-input" type="email" value={form.email} onChange={handleChange('email')} placeholder="usuario@epn.edu.ec" required />
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Contraseña <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input className="field-input" type={showPassword ? "text" : "password"} value={form.password} onChange={handleChange('password')} placeholder="Min. 8 caracteres" required style={{ paddingRight: '40px', width: '100%' }} />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096', padding: 0, display: 'flex' }} tabIndex={-1}>
                                            {showPassword ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Confirmar Contraseña <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <div style={{ position: 'relative' }}>
                                        <input className="field-input" type={showPasswordConfirm ? "text" : "password"} value={form.passwordConfirm} onChange={handleChange('passwordConfirm')} placeholder="Repite la contraseña" required style={{ paddingRight: '40px', width: '100%' }} />
                                        <button type="button" onClick={() => setShowPasswordConfirm(!showPasswordConfirm)} style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', cursor: 'pointer', color: '#718096', padding: 0, display: 'flex' }} tabIndex={-1}>
                                            {showPasswordConfirm ? <IconEyeOff /> : <IconEye />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="field-label">Rol <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <select className="field-select" value={form.rol} onChange={handleChange('rol')}>
                                        <option value="Administrador">Administrador</option>
                                        <option value="Jefe de Area">Jefe de Área</option>
                                        <option value="Responsable">Responsable</option>
                                    </select>
                                </div>
                                {form.rol === 'Jefe de Area' && (
                                    <div className="form-group">
                                        <label className="field-label">Área Asignada <span style={{ color: '#ff9a9a' }}>*</span></label>
                                        <select className="field-select" value={form.areas} onChange={handleChange('areas')} required>
                                            <option value="">Seleccione...</option>
                                            <option value="Tecnología">Tecnología</option>
                                            <option value="IOT">IOT</option>
                                            <option value="Produccion">Producción</option>
                                        </select>
                                    </div>
                                )}
                            </div>
                            <div className="form-footer" style={{ marginTop: 24 }}>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {loading ? <><span className="spinner" /> Procesando...</> : <><IconSend /> Confirmar Registro</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="form-card">
                    {isLoadingData ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}><span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} /><p style={{ opacity: 0.5, fontSize: 14 }}>Cargando usuarios...</p></div>
                    ) : usuarios.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}><p style={{ opacity: 0.4, fontSize: 14 }}>No hay usuarios registrados.</p></div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {usuarios.map((u) => (
                                <div key={u.id} style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(255,255,255,0.025)', border: '1px solid rgba(255,255,255,0.06)', transition: 'background 0.2s, border-color 0.2s', opacity: u.estado_activo ? 1 : 0.6 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                        <div style={{ minWidth: 0 }}>
                                            <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#e8efff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                {u.nombre} 
                                                {!u.estado_activo && <span style={{ color: '#ff9a9a', fontSize: 12, marginLeft: 8 }}>(Inactivo)</span>}
                                            </h3>
                                            <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)' }}>{u.email} • <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{u.telefono}</span></p>
                                            {u.rol === 'Jefe de Area' && u.areas && (
                                                <p style={{ fontSize: 11.5, color: '#4fd1c5', marginTop: 6, fontWeight: 500 }}>Área: {u.areas}</p>
                                            )}
                                        </div>

                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                            <span style={{ background: u.rol === 'Administrador' ? 'rgba(255, 78, 78, 0.1)' : 'rgba(79, 209, 197, 0.1)', color: u.rol === 'Administrador' ? '#ff9a9a' : '#4fd1c5', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500, border: `1px solid ${u.rol === 'Administrador' ? 'rgba(255, 78, 78, 0.2)' : 'rgba(79, 209, 197, 0.2)'}` }}>
                                                {u.rol}
                                            </span>

                                            {user?.rol === 'Administrador' && (
                                                <>
                                                    <button className="row-action-btn edit" title="Editar usuario" onClick={() => setUsuarioEditando(u)} disabled={!u.estado_activo} style={{ opacity: !u.estado_activo ? 0.3 : 1, cursor: !u.estado_activo ? 'not-allowed' : 'pointer' }}>
                                                        <EditIcon />
                                                    </button>
                                                    {user.id !== u.id && (
                                                        <button className={`row-action-btn ${u.estado_activo ? 'delete' : 'activate'}`} title={u.estado_activo ? "Desactivar" : "Reactivar"} onClick={() => setUsuarioToggling(u)}>
                                                            {u.estado_activo ? <DeactivateIcon /> : <ActivateIcon />}
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modales Flotantes */}
            {usuarioEditando && <EditModal usuario={usuarioEditando} onClose={() => setUsuarioEditando(null)} onSaved={handleUsuarioGuardado} />}
            {usuarioToggling && <ToggleStatusModal usuario={usuarioToggling} onClose={() => setUsuarioToggling(null)} onToggled={handleUsuarioToggled} />}
        </div>
    );
};

export default Usuarios;