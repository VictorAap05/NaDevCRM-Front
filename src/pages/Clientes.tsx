import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';
import {
    obtenerClientes,
    crearCliente,
    actualizarCliente,
    eliminarCliente,
    type Cliente,
} from '../services/clienteService';
import { obtenerOportunidades, type OportunidadListItem } from '../services/oportunidadService';
import { validarCedulaEcuatoriana, validarRUC } from '../utils/validaciones';

type FormData = {
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
};

const FORM_VACIO: FormData = {
    cliente: '',
    tipo: 'Privado',
    tipo_identificacion: 'Cédula',
    identificacion: '',
};

const validarIdentificacion = (tipo: string, valor: string): string | null => {
    if (!valor.trim()) return 'La identificación es obligatoria.';
    if (tipo === 'Cédula') {
        if (!validarCedulaEcuatoriana(valor))
            return 'La cédula no es válida. Debe tener 10 dígitos y cumplir el algoritmo regional ecuatoriano.';
    } else if (tipo === 'RUC') {
        if (!validarRUC(valor))
            return 'El RUC no es válido. Debe tener 13 dígitos y terminar en un establecimiento válido (distinto de 000).';
    } else if (tipo === 'Pasaporte') {
        if (valor.length < 5) return 'El número de pasaporte debe tener al menos 5 caracteres.';
    }
    return null;
};

const validarForm = (form: FormData): Record<string, string> => {
    const errores: Record<string, string> = {};
    if (!form.cliente.trim()) errores.cliente = 'El nombre del cliente es obligatorio.';
    const errId = validarIdentificacion(form.tipo_identificacion, form.identificacion);
    if (errId) errores.identificacion = errId;
    return errores;
};


const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" stroke="#ff9a9a" strokeWidth="1.5" />
        <path d="M8 4.5V8.5" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="#ff9a9a" />
    </svg>
);

const WarnIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style={{ flexShrink: 0 }}>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 9v4M12 17h.01" stroke="#f59e0b" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
);

const TrashIcon = () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
        <path d="M10 11v6M14 11v6" />
        <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

interface EditModalProps {
    cliente: Cliente;
    onClose: () => void;
    onSaved: (c: Cliente) => void;
}

const EditModal: React.FC<EditModalProps> = ({ cliente, onClose, onSaved }) => {
    const [form, setForm] = useState<FormData>({
        cliente: cliente.cliente,
        tipo: cliente.tipo,
        tipo_identificacion: cliente.tipo_identificacion,
        identificacion: cliente.identificacion,
    });
    const [errores, setErrores] = useState<Record<string, string>>({});
    const [errorGlobal, setErrorGlobal] = useState('');
    const [loading, setLoading] = useState(false);

    const set = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        if (errores[k]) setErrores(prev => { const n = { ...prev }; delete n[k]; return n; });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorGlobal('');

        const errs = validarForm(form);
        if (Object.keys(errs).length > 0) {
            setErrores(errs);
            return;
        }

        setLoading(true);
        try {
            const actualizado = await actualizarCliente(cliente.id, form);
            onSaved(actualizado);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorGlobal(err.response?.data?.error || err.response?.data?.message || 'Error al actualizar el cliente.');
            } else {
                setErrorGlobal('Error inesperado al procesar la solicitud.');
            }
        } finally {
            setLoading(false);
        }
    };

    const maxLen = form.tipo_identificacion === 'Cédula' ? 10 : form.tipo_identificacion === 'RUC' ? 13 : 20;
    const placeholder = form.tipo_identificacion === 'Cédula' ? '10 dígitos' : form.tipo_identificacion === 'RUC' ? '13 dígitos' : 'Mínimo 5 caracteres';

    return (
        <div style={styles.overlay} onClick={onClose}>
            <div style={styles.modal} onClick={e => e.stopPropagation()}>
                <div style={styles.modalHeader}>
                    <div>
                        <p style={styles.modalEyebrow}>Gestión de Clientes</p>
                        <h2 style={styles.modalTitle}>Editar <em style={{ fontStyle: 'italic', color: '#89c2ff' }}>cliente</em></h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose} aria-label="Cerrar">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {errorGlobal && (
                    <div className="error-box" style={{ marginBottom: 20 }}>
                        <ErrorIcon />
                        {errorGlobal}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label">
                                Nombre del Cliente / Razón Social <span style={{ color: '#ff9a9a' }}>*</span>
                            </label>
                            <input
                                className={`field-input${errores.cliente ? ' field-input--error' : ''}`}
                                style={errores.cliente ? fieldErrorStyle : undefined}
                                type="text"
                                value={form.cliente}
                                onChange={set('cliente')}
                                placeholder="Ej: Corporación X"
                            />
                            {errores.cliente && <span style={styles.fieldError}>{errores.cliente}</span>}
                        </div>

                        <div style={styles.formGroup}>
                            <label className="field-label">Tipo de Entidad <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <select className="field-select" value={form.tipo} onChange={set('tipo')}>
                                <option value="Público">Público</option>
                                <option value="Privado">Privado</option>
                            </select>
                        </div>

                        <div style={styles.formGroup}>
                            <label className="field-label">Tipo Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <select className="field-select" value={form.tipo_identificacion} onChange={set('tipo_identificacion')}>
                                <option value="Cédula">Cédula</option>
                                <option value="RUC">RUC</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                        </div>

                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label">
                                Número de Identificación <span style={{ color: '#ff9a9a' }}>*</span>
                            </label>
                            <input
                                className="field-input"
                                style={errores.identificacion ? fieldErrorStyle : undefined}
                                type="text"
                                value={form.identificacion}
                                onChange={set('identificacion')}
                                maxLength={maxLen}
                                placeholder={placeholder}
                            />
                            {errores.identificacion && <span style={styles.fieldError}>{errores.identificacion}</span>}
                        </div>
                    </div>

                    <div style={styles.modalFooter}>
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancelar</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? <><span className="spinner" /> Guardando...</> : <><IconSend /> Guardar cambios</>}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface DeleteModalProps {
    cliente: Cliente;
    onClose: () => void;
    onDeleted: (id: string) => void;
}

const DeleteModal: React.FC<DeleteModalProps> = ({ cliente, onClose, onDeleted }) => {
    const [loading, setLoading] = useState(false);
    const [bloqueado, setBloqueado] = useState(false);
    const [mensajeBloqueo, setMensajeBloqueo] = useState('');
    const [sugerencia, setSugerencia] = useState('');

    const handleConfirmar = async () => {
        setLoading(true);
        try {
            const resp = await eliminarCliente(cliente.id);
            onDeleted(cliente.id);
            onClose();
            if (resp.mensaje) {
                // Propagamos el mensaje al parent a través del callback
            }
        } catch (err) {
            if (axios.isAxiosError(err)) {
                const data = err.response?.data;
                if (err.response?.status === 409 && data?.tieneRegistrosAsociados) {
                    setBloqueado(true);
                    setMensajeBloqueo(data.error || 'No se puede eliminar este cliente.');
                    setSugerencia(data.sugerencia || '');
                } else {
                    setMensajeBloqueo(data?.error || 'Error al intentar eliminar el cliente.');
                    setBloqueado(true);
                }
            } else {
                setMensajeBloqueo('Error inesperado al procesar la solicitud.');
                setBloqueado(true);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={styles.overlay} onClick={bloqueado ? undefined : onClose}>
            <div style={{ ...styles.modal, maxWidth: 480 }} onClick={e => e.stopPropagation()}>
                {!bloqueado ? (
                    <>
                        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'rgba(255,80,80,0.12)',
                                border: '1px solid rgba(255,80,80,0.25)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <TrashIcon />
                            </div>
                            <h2 style={{ ...styles.modalTitle, fontSize: 20, marginBottom: 10 }}>
                                ¿Eliminar cliente?
                            </h2>
                            <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, marginBottom: 6 }}>
                                Estás a punto de eliminar permanentemente a
                            </p>
                            <p style={{ fontSize: 15, fontWeight: 500, color: '#e8efff', marginBottom: 8 }}>
                                "{cliente.cliente}"
                            </p>
                            <p style={{ fontSize: 13, color: 'rgba(255,100,100,0.7)', lineHeight: 1.5 }}>
                                Esta acción no se puede deshacer.
                            </p>
                        </div>

                        <div style={{ ...styles.modalFooter, justifyContent: 'center', gap: 12, marginTop: 28 }}>
                            <button className="btn-secondary" style={{ minWidth: 120 }} onClick={onClose}>
                                Cancelar
                            </button>
                            <button
                                onClick={handleConfirmar}
                                disabled={loading}
                                style={{
                                    minWidth: 140,
                                    padding: '12px 24px',
                                    background: 'linear-gradient(135deg, #b91c1c, #dc2626)',
                                    color: '#fff', border: 'none', borderRadius: 10,
                                    fontFamily: 'DM Sans, sans-serif',
                                    fontSize: 14, fontWeight: 500, cursor: 'pointer',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                                    boxShadow: '0 4px 16px rgba(185,28,28,0.35)',
                                    opacity: loading ? 0.6 : 1,
                                    transition: 'opacity 0.2s',
                                }}
                            >
                                {loading ? <><span className="spinner" /> Eliminando...</> : <><TrashIcon /> Sí, eliminar</>}
                            </button>
                        </div>
                    </>
                ) : (
                    /* CA04.6: Bloqueado — tiene registros asociados */
                    <>
                        <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
                            <div style={{
                                width: 56, height: 56, borderRadius: '50%',
                                background: 'rgba(245,158,11,0.12)',
                                border: '1px solid rgba(245,158,11,0.3)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: '0 auto 16px'
                            }}>
                                <WarnIcon />
                            </div>
                            <h2 style={{ ...styles.modalTitle, fontSize: 20, marginBottom: 12 }}>
                                No se puede eliminar
                            </h2>
                        </div>

                        <div style={{
                            background: 'rgba(245,158,11,0.08)',
                            border: '1px solid rgba(245,158,11,0.25)',
                            borderRadius: 12, padding: '14px 16px',
                            marginBottom: 16, textAlign: 'left'
                        }}>
                            <p style={{ fontSize: 13.5, color: '#fbbf24', marginBottom: sugerencia ? 10 : 0, lineHeight: 1.55 }}>
                                {mensajeBloqueo}
                            </p>
                            {sugerencia && (
                                <p style={{ fontSize: 13, color: 'rgba(251,191,36,0.75)', lineHeight: 1.55, margin: 0 }}>
                                    💡 {sugerencia}
                                </p>
                            )}
                        </div>

                        <div style={{ ...styles.modalFooter, justifyContent: 'center' }}>
                            <button className="btn-primary" onClick={onClose}>
                                Entendido
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

/* ─── Styles object ──────────────────────────────────────── */
const styles = {
    overlay: {
        position: 'fixed' as const,
        inset: 0,
        background: 'rgba(0,0,0,0.65)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 24,
        animation: 'fadeIn 0.18s ease',
    },
    modal: {
        width: '100%',
        maxWidth: 560,
        background: '#111318',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20,
        padding: '36px 40px',
        animation: 'slideUp 0.22s ease',
        maxHeight: '90vh',
        overflowY: 'auto' as const,
    },
    modalHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 28,
    },
    modalEyebrow: {
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase' as const,
        color: '#4e9eff',
        marginBottom: 6,
    },
    modalTitle: {
        fontFamily: 'DM Serif Display, serif',
        fontSize: 24,
        color: '#f0f4ff',
        lineHeight: 1.2,
        margin: 0,
    },
    closeBtn: {
        width: 32, height: 32,
        borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.5)',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
        transition: 'background 0.2s',
    },
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: 18,
        marginBottom: 28,
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column' as const,
        gap: 7,
    },
    fieldError: {
        fontSize: 12,
        color: '#ff9a9a',
        marginTop: 4,
    },
    modalFooter: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 12,
        paddingTop: 20,
        borderTop: '1px solid rgba(255,255,255,0.06)',
    },
};

const fieldErrorStyle: React.CSSProperties = {
    borderColor: 'rgba(255,80,80,0.5)',
    background: 'rgba(255,80,80,0.05)',
};

const Clientes = () => {
    const navigate = useNavigate();

    const [user] = useState<Usuario | null>(() => {
        const s = localStorage.getItem('user');
        return s ? JSON.parse(s) : null;
    });

    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [oportunidades, setOportunidades] = useState<OportunidadListItem[]>([]);
    const [expandedClienteId, setExpandedClienteId] = useState<string | null>(null);

    const [showForm, setShowForm] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
    const [clienteEliminando, setClienteEliminando] = useState<Cliente | null>(null);

    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    // Errores por campo en el form de CREAR
    const [formErrores, setFormErrores] = useState<Record<string, string>>({});

    const [form, setForm] = useState<FormData>(FORM_VACIO);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (!user) { setIsLoadingData(false); return; }
        const fetch = async () => {
            setIsLoadingData(true);
            try {
                const [clientesData, opsData] = await Promise.all([
                    obtenerClientes(),
                    obtenerOportunidades().catch(() => [] as OportunidadListItem[]),
                ]);
                setClientes(clientesData);
                setOportunidades(opsData);
            } catch (err) {
                setError(axios.isAxiosError(err)
                    ? err.response?.data?.message || 'Error al cargar la información'
                    : 'Error desconocido al cargar la lista');
            } finally {
                setIsLoadingData(false);
            }
        };
        fetch();
    }, [user?.id]);

    const handleChange = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        if (formErrores[k]) setFormErrores(prev => { const n = { ...prev }; delete n[k]; return n; });
    };

    const showSuccess = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3500);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // CA04.2 equivalente para creación
        const errs = validarForm(form);
        if (Object.keys(errs).length > 0) {
            setFormErrores(errs);
            return;
        }

        setLoading(true);
        try {
            const nuevo = await crearCliente(form);
            setClientes(prev => [nuevo, ...prev]);
            showSuccess('Cliente registrado correctamente.');
            setShowForm(false);
            setForm(FORM_VACIO);
            setFormErrores({});
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || err.response?.data?.message || 'Error al guardar el registro');
            } else {
                setError('Error al procesar la solicitud');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleClienteGuardado = (actualizado: Cliente) => {
        setClientes(prev => prev.map(c => c.id === actualizado.id ? actualizado : c));
        setClienteEditando(null);
        showSuccess('Los datos del cliente fueron actualizados correctamente.');
    };

    const handleClienteEliminado = (id: string) => {
        setClientes(prev => prev.filter(c => c.id !== id));
        showSuccess('El cliente fue eliminado exitosamente.');
    };

    const maxLen = form.tipo_identificacion === 'Cédula' ? 10 : form.tipo_identificacion === 'RUC' ? 13 : 20;
    const placeholder = form.tipo_identificacion === 'Cédula' ? '10 dígitos' : form.tipo_identificacion === 'RUC' ? '13 dígitos' : 'Mínimo 5 caracteres';

    if (!user) return null;

    return (
        <div className="dash-root">
            <style>{`
                @keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }
                @keyframes slideUp { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
                .row-action-btn {
                    width: 32px; height: 32px; border-radius: 8px;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: rgba(255,255,255,0.04);
                    color: rgba(255,255,255,0.45);
                    cursor: pointer; display: flex; align-items: center; justify-content: center;
                    transition: background 0.18s, color 0.18s, border-color 0.18s;
                    flex-shrink: 0;
                }
                .row-action-btn:hover { background: rgba(255,255,255,0.09); color: rgba(255,255,255,0.85); }
                .row-action-btn.edit:hover { background: rgba(78,158,255,0.12); color: #89c2ff; border-color: rgba(78,158,255,0.3); }
                .row-action-btn.delete:hover { background: rgba(255,80,80,0.1); color: #ff9a9a; border-color: rgba(255,80,80,0.3); }
                .ops-toggle-btn {
                    padding: 5px 11px; border-radius: 20px; font-size: 12px; font-weight: 500;
                    background: rgba(51,181,229,0.1); color: #33b5e5;
                    border: 1px solid rgba(51,181,229,0.25); cursor: pointer;
                    transition: background 0.18s;
                    font-family: 'DM Sans', sans-serif;
                }
                .ops-toggle-btn.open { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }
                .ops-toggle-btn:hover { opacity: 0.85; }
            `}</style>

            <Navbar user={user} />

            <div className="page-content">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p className="eyebrow">Directorio de Entidades</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 4 }}>
                            Clientes
                        </h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                            {clientes.length} registro{clientes.length !== 1 ? 's' : ''} en la base de datos
                        </p>
                    </div>
                    <button
                        className={showForm ? 'btn-secondary' : 'btn-primary'}
                        onClick={() => {
                            setShowForm(s => !s);
                            setError('');
                            setFormErrores({});
                            setForm(FORM_VACIO);
                        }}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Cliente'}
                    </button>
                </div>

                {/* Banners globales */}
                {error && (
                    <div className="error-box" style={{ marginBottom: 20 }}>
                        <ErrorIcon /> {error}
                    </div>
                )}
                {success && (
                    <div className="success-banner" style={{ marginBottom: 20 }}>
                        <IconCheck /> {success}
                    </div>
                )}

                {/* Formulario de creación */}
                {showForm && (
                    <div className="form-card" style={{ marginBottom: 28, border: '1px solid rgba(78,158,255,0.2)' }}>
                        <h2 style={{ fontSize: 17, marginBottom: 24, color: '#e8efff', fontWeight: 500 }}>
                            Nuevo Registro
                        </h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre del Cliente / Razón Social <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input
                                        className="field-input"
                                        style={formErrores.cliente ? fieldErrorStyle : undefined}
                                        type="text"
                                        value={form.cliente}
                                        onChange={handleChange('cliente')}
                                        placeholder="Ej: Corporación X"
                                    />
                                    {formErrores.cliente && <span style={{ fontSize: 12, color: '#ff9a9a', marginTop: 4 }}>{formErrores.cliente}</span>}
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Tipo de Entidad <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <select className="field-select" value={form.tipo} onChange={handleChange('tipo')}>
                                        <option value="Público">Público</option>
                                        <option value="Privado">Privado</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Tipo Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <select className="field-select" value={form.tipo_identificacion} onChange={handleChange('tipo_identificacion')}>
                                        <option value="Cédula">Cédula</option>
                                        <option value="RUC">RUC</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>

                                <div className="form-group full">
                                    <label className="field-label">Número de Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input
                                        className="field-input"
                                        style={formErrores.identificacion ? fieldErrorStyle : undefined}
                                        type="text"
                                        value={form.identificacion}
                                        onChange={handleChange('identificacion')}
                                        maxLength={maxLen}
                                        placeholder={placeholder}
                                    />
                                    {formErrores.identificacion && <span style={{ fontSize: 12, color: '#ff9a9a', marginTop: 4 }}>{formErrores.identificacion}</span>}
                                </div>
                            </div>

                            <div className="form-footer" style={{ marginTop: 0 }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                                >
                                    {loading ? <><span className="spinner" /> Procesando...</> : <><IconSend /> Confirmar Registro</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista de clientes */}
                <div className="form-card">
                    {isLoadingData ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                            <p style={{ opacity: 0.5, fontSize: 14 }}>Cargando clientes...</p>
                        </div>
                    ) : clientes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                            <p style={{ opacity: 0.4, fontSize: 14, marginBottom: 12 }}>No se encontraron clientes en la base de datos.</p>
                            <button className="btn-primary" onClick={() => setShowForm(true)} style={{ margin: '0 auto' }}>
                                + Añadir el primero
                            </button>
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {clientes.map((c) => {
                                const clientOps = oportunidades.filter(op => op.cliente_id === c.id);
                                const isExpanded = expandedClienteId === c.id;

                                return (
                                    <div
                                        key={c.id}
                                        style={{
                                            padding: '16px 20px',
                                            borderRadius: 12,
                                            background: isExpanded ? 'rgba(78,158,255,0.04)' : 'rgba(255,255,255,0.025)',
                                            border: isExpanded ? '1px solid rgba(78,158,255,0.2)' : '1px solid rgba(255,255,255,0.06)',
                                            transition: 'background 0.2s, border-color 0.2s',
                                        }}
                                    >
                                        {/* Fila principal */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                                            <div style={{ minWidth: 0 }}>
                                                <h3 style={{ fontSize: 15, fontWeight: 500, marginBottom: 4, color: '#e8efff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                    {c.cliente}
                                                </h3>
                                                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)' }}>
                                                    {c.tipo_identificacion}: <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{c.identificacion}</span>
                                                </p>
                                            </div>

                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
                                                {/* Badge tipo */}
                                                <span style={{
                                                    padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 500,
                                                    background: c.tipo === 'Público' ? 'rgba(30,58,138,0.5)' : 'rgba(6,78,59,0.5)',
                                                    color: c.tipo === 'Público' ? '#93c5fd' : '#6ee7b7',
                                                    border: c.tipo === 'Público' ? '1px solid rgba(147,197,253,0.2)' : '1px solid rgba(110,231,183,0.2)',
                                                }}>
                                                    {c.tipo}
                                                </span>

                                                {/* Toggle oportunidades */}
                                                <button
                                                    className={`ops-toggle-btn${isExpanded ? ' open' : ''}`}
                                                    onClick={() => setExpandedClienteId(isExpanded ? null : c.id)}
                                                >
                                                    Ops ({clientOps.length}) {isExpanded ? '▲' : '▼'}
                                                </button>

                                                {/* Editar – CA04.1-4 */}
                                                <button
                                                    className="row-action-btn edit"
                                                    title="Editar cliente"
                                                    onClick={() => setClienteEditando(c)}
                                                >
                                                    <EditIcon />
                                                </button>

                                                {/* Eliminar – CA04.5-7 */}
                                                <button
                                                    className="row-action-btn delete"
                                                    title="Eliminar cliente"
                                                    onClick={() => setClienteEliminando(c)}
                                                >
                                                    <TrashIcon />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Panel expandido de oportunidades */}
                                        {isExpanded && (
                                            <div style={{ marginTop: 14, paddingTop: 14, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                                                <p style={{ fontSize: 11.5, fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.3)', marginBottom: 10 }}>
                                                    Oportunidades Comerciales
                                                </p>

                                                {clientOps.length === 0 ? (
                                                    <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)', fontStyle: 'italic' }}>
                                                        No existen oportunidades vinculadas a este cliente.
                                                    </p>
                                                ) : (
                                                    <>
                                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                                            {clientOps.map(op => (
                                                                <div key={op.id} style={{
                                                                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                                                    background: 'rgba(0,0,0,0.2)', padding: '10px 14px', borderRadius: 8,
                                                                    fontSize: 13, border: '1px solid rgba(255,255,255,0.04)',
                                                                    flexWrap: 'wrap', gap: 8,
                                                                }}>
                                                                    <span style={{ fontWeight: 500, color: '#e8efff' }}>{op.nombre_oportunidad}</span>
                                                                    <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                                                        <span style={{ color: 'rgba(255,255,255,0.5)' }}>${op.monto_estimado}</span>
                                                                        <span style={{ color: '#4e9eff', fontSize: 12 }}>{op.fase_venta}</span>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                        <button
                                                            onClick={() => navigate('/oportunidades')}
                                                            style={{ marginTop: 10, background: 'transparent', color: '#33b5e5', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: '4px 0', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}
                                                        >
                                                            Ver todas en el módulo de oportunidades →
                                                        </button>
                                                    </>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {clienteEditando && (
                <EditModal
                    cliente={clienteEditando}
                    onClose={() => setClienteEditando(null)}
                    onSaved={handleClienteGuardado}
                />
            )}

            {clienteEliminando && (
                <DeleteModal
                    cliente={clienteEliminando}
                    onClose={() => setClienteEliminando(null)}
                    onDeleted={handleClienteEliminado}
                />
            )}
        </div>
    );
};

export default Clientes;