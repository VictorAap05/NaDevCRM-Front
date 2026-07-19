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
    desactivarCliente,
    reactivarCliente,
    type Cliente,
    type FiltroEstado,
} from '../services/clienteService';
import { obtenerOportunidades, type OportunidadListItem } from '../services/oportunidadService';
import { validarCedulaEcuatoriana, validarRUC } from '../utils/validaciones';

/* ─── Types ────────────────────────────────────────────── */
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

/* ─── Validaciones frontend ─────────────────────────────── */
const validarForm = (form: FormData): Record<string, string> => {
    const errores: Record<string, string> = {};
    if (!form.cliente.trim()) errores.cliente = 'El nombre del cliente es obligatorio.';
    if (!form.identificacion.trim()) {
        errores.identificacion = 'La identificación es obligatoria.';
    } else if (form.tipo_identificacion === 'Cédula' && !validarCedulaEcuatoriana(form.identificacion)) {
        errores.identificacion = 'La cédula no es válida. Debe tener 10 dígitos y cumplir el algoritmo regional ecuatoriano.';
    } else if (form.tipo_identificacion === 'RUC' && !validarRUC(form.identificacion)) {
        errores.identificacion = 'El RUC no es válido. Debe tener 13 dígitos y terminar en un establecimiento válido.';
    } else if (form.tipo_identificacion === 'Pasaporte' && form.identificacion.length < 5) {
        errores.identificacion = 'El pasaporte debe tener al menos 5 caracteres.';
    }
    return errores;
};

/* ─── Configuración de campo de identificación según tipo ─── */
const obtenerConfigIdentificacion = (tipo: string): { maxLen: number; placeholder: string } => {
    if (tipo === 'Cédula') return { maxLen: 10, placeholder: '10 dígitos' };
    if (tipo === 'RUC') return { maxLen: 13, placeholder: '13 dígitos' };
    return { maxLen: 20, placeholder: 'Mínimo 5 caracteres' };
};

/* ─── Iconos ────────────────────────────────────────────── */
const ErrorIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
        <circle cx="8" cy="8" r="7" stroke="#ff9a9a" strokeWidth="1.5" />
        <path d="M8 4.5V8.5" stroke="#ff9a9a" strokeWidth="1.5" strokeLinecap="round" />
        <circle cx="8" cy="11" r="0.75" fill="#ff9a9a" />
    </svg>
);

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const ToggleOffIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="7" />
        <circle cx="8" cy="12" r="3" fill="currentColor" />
    </svg>
);

const ToggleOnIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="5" width="22" height="14" rx="7" />
        <circle cx="16" cy="12" r="3" fill="currentColor" />
    </svg>
);

/* ─── Modal confirmación desactivar/reactivar ───────────── */
interface ToggleModalProps {
    cliente: Cliente;
    onClose: () => void;
    onConfirmed: (c: Cliente) => void;
}

const ToggleEstadoModal: React.FC<ToggleModalProps> = ({ cliente, onClose, onConfirmed }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const desactivando = cliente.estado_activo;

    const handleConfirmar = async () => {
        setLoading(true);
        setError('');
        try {
            if (desactivando) {
                await desactivarCliente(cliente.id);
                onConfirmed({ ...cliente, estado_activo: false });
            } else {
                await reactivarCliente(cliente.id);
                onConfirmed({ ...cliente, estado_activo: true });
            }
            onClose();
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || 'Error al cambiar el estado del cliente.');
            } else {
                setError('Error inesperado.');
            }
        } finally {
            setLoading(false);
        }
    };

    let contenidoBotonConfirmar: React.ReactNode;
    if (loading) {
        contenidoBotonConfirmar = <><span className="spinner" /> Procesando...</>;
    } else if (desactivando) {
        contenidoBotonConfirmar = <><ToggleOffIcon /> Desactivar</>;
    } else {
        contenidoBotonConfirmar = <><ToggleOnIcon /> Reactivar</>;
    }

    return (
        <div
            style={styles.overlay}
            role="button"
            tabIndex={0}
            aria-label="Cerrar modal"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); }}
        >
            <div style={{ ...styles.modal, maxWidth: 440 }}>
                <div style={{ textAlign: 'center', padding: '4px 0 8px' }}>
                    <div style={{
                        width: 52, height: 52, borderRadius: '50%',
                        background: desactivando ? 'rgba(245,158,11,0.12)' : 'rgba(0,180,140,0.12)',
                        border: `1px solid ${desactivando ? 'rgba(245,158,11,0.3)' : 'rgba(0,180,140,0.3)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        margin: '0 auto 16px', color: desactivando ? '#f59e0b' : '#4ecfb3',
                    }}>
                        {desactivando ? <ToggleOffIcon /> : <ToggleOnIcon />}
                    </div>
                    <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: 20, color: '#f0f4ff', marginBottom: 10 }}>
                        {desactivando ? '¿Desactivar cliente?' : '¿Reactivar cliente?'}
                    </h2>
                    <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', lineHeight: 1.6, marginBottom: 4 }}>
                        {desactivando
                            ? 'El cliente quedará inactivo y no aparecerá en los filtros activos.'
                            : 'El cliente volverá a estar activo en el sistema.'}
                    </p>
                    <p style={{ fontSize: 15, fontWeight: 500, color: '#e8efff' }}>"{cliente.cliente}"</p>
                </div>

                {error && (
                    <div className="error-box" style={{ marginTop: 16 }}>
                        <ErrorIcon /> {error}
                    </div>
                )}

                <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 24, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    <button className="btn-secondary" style={{ minWidth: 110 }} onClick={onClose}>Cancelar</button>
                    <button
                        onClick={handleConfirmar}
                        disabled={loading}
                        style={{
                            minWidth: 140, padding: '12px 24px',
                            background: desactivando
                                ? 'linear-gradient(135deg, #b45309, #d97706)'
                                : 'linear-gradient(135deg, #0f6e56, #1d9e75)',
                            color: '#fff', border: 'none', borderRadius: 10,
                            fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
                            cursor: loading ? 'not-allowed' : 'pointer',
                            opacity: loading ? 0.6 : 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                            boxShadow: desactivando ? '0 4px 16px rgba(180,83,9,0.3)' : '0 4px 16px rgba(15,110,86,0.3)',
                            transition: 'opacity 0.2s',
                        }}
                    >
                        {contenidoBotonConfirmar}
                    </button>
                </div>
            </div>
        </div>
    );
};

/* ─── Modal de Edición ───────────────────────────────────── */
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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorGlobal('');
        const errs = validarForm(form);
        if (Object.keys(errs).length > 0) { setErrores(errs); return; }
        setLoading(true);
        try {
            const actualizado = await actualizarCliente(cliente.id, form);
            onSaved(actualizado);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setErrorGlobal(err.response?.data?.error || 'Error al actualizar el cliente.');
            } else {
                setErrorGlobal('Error inesperado al procesar la solicitud.');
            }
        } finally {
            setLoading(false);
        }
    };

    const { maxLen, placeholder } = obtenerConfigIdentificacion(form.tipo_identificacion);

    return (
        <div
            style={styles.overlay}
            role="button"
            tabIndex={0}
            aria-label="Cerrar modal"
            onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
            onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') onClose(); }}
        >
            <div style={styles.modal}>
                <div style={styles.modalHeader}>
                    <div>
                        <p style={styles.modalEyebrow}>Gestión de Clientes</p>
                        <h2 style={styles.modalTitle}>Editar <em style={{ fontStyle: 'italic', color: '#89c2ff' }}>cliente</em></h2>
                    </div>
                    <button style={styles.closeBtn} onClick={onClose}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12" /></svg>
                    </button>
                </div>

                {errorGlobal && (
                    <div className="error-box" style={{ marginBottom: 20 }}>
                        <ErrorIcon /> {errorGlobal}
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div style={styles.formGrid}>
                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label" htmlFor="editar-cliente-nombre">Nombre del Cliente / Razón Social <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input id="editar-cliente-nombre" className="field-input" style={errores.cliente ? fieldErrorStyle : undefined}
                                type="text" value={form.cliente} onChange={set('cliente')} placeholder="Ej: Corporación X" />
                            {errores.cliente && <span style={styles.fieldError}>{errores.cliente}</span>}
                        </div>
                        <div style={styles.formGroup}>
                            <label className="field-label" htmlFor="editar-cliente-tipo">Tipo de Entidad <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <select id="editar-cliente-tipo" className="field-select" value={form.tipo} onChange={set('tipo')}>
                                <option value="Público">Público</option>
                                <option value="Privado">Privado</option>
                            </select>
                        </div>
                        <div style={styles.formGroup}>
                            <label className="field-label" htmlFor="editar-cliente-tipo-id">Tipo Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <select id="editar-cliente-tipo-id" className="field-select" value={form.tipo_identificacion} onChange={set('tipo_identificacion')}>
                                <option value="Cédula">Cédula</option>
                                <option value="RUC">RUC</option>
                                <option value="Pasaporte">Pasaporte</option>
                            </select>
                        </div>
                        <div style={{ ...styles.formGroup, gridColumn: '1 / -1' }}>
                            <label className="field-label" htmlFor="editar-cliente-identificacion">Número de Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                            <input id="editar-cliente-identificacion" className="field-input" style={errores.identificacion ? fieldErrorStyle : undefined}
                                type="text" value={form.identificacion} onChange={set('identificacion')}
                                maxLength={maxLen} placeholder={placeholder} />
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

/* ─── Estilos compartidos ────────────────────────────────── */
const styles = {
    overlay: {
        position: 'fixed' as const, inset: 0,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        zIndex: 200, padding: 24, animation: 'fadeIn 0.18s ease',
    },
    modal: {
        width: '100%', maxWidth: 560,
        background: '#111318', border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: 20, padding: '36px 40px',
        animation: 'slideUp 0.22s ease', maxHeight: '90vh', overflowY: 'auto' as const,
    },
    modalHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
    modalEyebrow: { fontSize: 11, fontWeight: 500, letterSpacing: '0.18em', textTransform: 'uppercase' as const, color: '#4e9eff', marginBottom: 6 },
    modalTitle: { fontFamily: 'DM Serif Display, serif', fontSize: 24, color: '#f0f4ff', lineHeight: 1.2, margin: 0 },
    closeBtn: {
        width: 32, height: 32, borderRadius: 8,
        border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
        color: 'rgba(255,255,255,0.5)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 28 },
    formGroup: { display: 'flex', flexDirection: 'column' as const, gap: 7 },
    fieldError: { fontSize: 12, color: '#ff9a9a', marginTop: 4 },
    modalFooter: { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, paddingTop: 20, borderTop: '1px solid rgba(255,255,255,0.06)' },
};

const fieldErrorStyle: React.CSSProperties = {
    borderColor: 'rgba(255,80,80,0.5)',
    background: 'rgba(255,80,80,0.05)',
};

/* ─── Página principal ───────────────────────────────────── */
const obtenerTextoFiltro = (filtro: FiltroEstado): string => {
    if (filtro === 'activo') return 'activos';
    if (filtro === 'inactivo') return 'inactivos';
    return 'todos';
};

const obtenerMensajeSinClientes = (filtro: FiltroEstado): string => {
    if (filtro === 'inactivo') return 'No hay clientes inactivos.';
    if (filtro === 'activo') return 'No hay clientes activos.';
    return 'No se encontraron clientes.';
};

/* ─── Fila de cliente en la lista ────────────────────────── */
interface ClienteRowProps {
    cliente: Cliente;
    clientOps: OportunidadListItem[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onEditar: () => void;
    onToggleEstado: () => void;
    onVerOportunidades: () => void;
}

const ClienteRow: React.FC<ClienteRowProps> = ({
    cliente: c,
    clientOps,
    isExpanded,
    onToggleExpand,
    onEditar,
    onToggleEstado,
    onVerOportunidades,
}) => {
    const inactivo = !c.estado_activo;

    let cardBackground = 'rgba(255,255,255,0.025)';
    let cardBorder = '1px solid rgba(255,255,255,0.06)';
    if (isExpanded) {
        cardBackground = 'rgba(78,158,255,0.04)';
        cardBorder = '1px solid rgba(78,158,255,0.2)';
    } else if (inactivo) {
        cardBackground = 'rgba(255,255,255,0.015)';
        cardBorder = '1px solid rgba(255,255,255,0.04)';
    }

    return (
        <div style={{
            padding: '16px 20px', borderRadius: 12,
            background: cardBackground,
            border: cardBorder,
            opacity: inactivo ? 0.65 : 1,
            transition: 'all 0.2s',
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <h3 style={{ fontSize: 15, fontWeight: 500, color: '#e8efff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', margin: 0 }}>
                            {c.cliente}
                        </h3>
                        {inactivo && (
                            <span style={{ fontSize: 10, fontWeight: 500, padding: '2px 7px', borderRadius: 20, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)', whiteSpace: 'nowrap' }}>
                                INACTIVO
                            </span>
                        )}
                    </div>
                    <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.38)', margin: 0 }}>
                        {c.tipo_identificacion}: <span style={{ color: 'rgba(255,255,255,0.55)', fontFamily: 'monospace', letterSpacing: '0.04em' }}>{c.identificacion}</span>
                    </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
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
                        onClick={onToggleExpand}
                    >
                        Ops ({clientOps.length}) {isExpanded ? '▲' : '▼'}
                    </button>

                    {/* Editar */}
                    <button className="row-action-btn edit" title="Editar cliente" onClick={onEditar}>
                        <EditIcon />
                    </button>

                    {/* Desactivar / Reactivar */}
                    <button
                        className={`row-action-btn ${c.estado_activo ? 'deactivate' : 'activate'}`}
                        title={c.estado_activo ? 'Desactivar cliente' : 'Reactivar cliente'}
                        onClick={onToggleEstado}
                    >
                        {c.estado_activo ? <ToggleOffIcon /> : <ToggleOnIcon />}
                    </button>
                </div>
            </div>

            {/* Panel oportunidades */}
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
                                        fontSize: 13, border: '1px solid rgba(255,255,255,0.04)', flexWrap: 'wrap', gap: 8,
                                    }}>
                                        <span style={{ fontWeight: 500, color: '#e8efff' }}>{op.nombre_oportunidad}</span>
                                        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                                            <span style={{ color: 'rgba(255,255,255,0.5)' }}>${op.monto_estimado}</span>
                                            <span style={{ color: '#4e9eff', fontSize: 12 }}>{op.fase_venta}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <button onClick={onVerOportunidades}
                                style={{ marginTop: 10, background: 'transparent', color: '#33b5e5', border: 'none', cursor: 'pointer', fontSize: 12.5, padding: '4px 0', textDecoration: 'underline', fontFamily: 'DM Sans, sans-serif' }}>
                                Ver todas en el módulo de oportunidades →
                            </button>
                        </>
                    )}
                </div>
            )}
        </div>
    );
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
    const [filtro, setFiltro] = useState<FiltroEstado>('activo');

    const [showForm, setShowForm] = useState(false);
    const [clienteEditando, setClienteEditando] = useState<Cliente | null>(null);
    const [clienteToggle, setClienteToggle] = useState<Cliente | null>(null);

    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');
    const [formErrores, setFormErrores] = useState<Record<string, string>>({});
    const [form, setForm] = useState<FormData>(FORM_VACIO);

    const cargarClientes = async (estado: FiltroEstado) => {
        setIsLoadingData(true);
        try {
            const [clientesData, opsData] = await Promise.all([
                obtenerClientes(estado),
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

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (user) cargarClientes(filtro);
        else setIsLoadingData(false);
    }, [user?.id]);

    const handleFiltroChange = (nuevoFiltro: FiltroEstado) => {
        setFiltro(nuevoFiltro);
        cargarClientes(nuevoFiltro);
    };

    const handleChange = (k: keyof FormData) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setForm(f => ({ ...f, [k]: e.target.value }));
        if (formErrores[k]) setFormErrores(prev => { const n = { ...prev }; delete n[k]; return n; });
    };

    const showSuccessBanner = (msg: string) => {
        setSuccess(msg);
        setTimeout(() => setSuccess(''), 3500);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError('');
        const errs = validarForm(form);
        if (Object.keys(errs).length > 0) { setFormErrores(errs); return; }
        setLoading(true);
        try {
            const nuevo = await crearCliente(form);
            // Solo agregar a la lista si el filtro actual incluye activos
            if (filtro === 'activo' || filtro === 'todos') {
                setClientes(prev => [nuevo, ...prev]);
            }
            showSuccessBanner('Cliente registrado correctamente.');
            setShowForm(false);
            setForm(FORM_VACIO);
            setFormErrores({});
        } catch (err) {
            setError(axios.isAxiosError(err)
                ? err.response?.data?.error || err.response?.data?.message || 'Error al guardar el registro'
                : 'Error al procesar la solicitud');
        } finally {
            setLoading(false);
        }
    };

    const handleClienteGuardado = (actualizado: Cliente) => {
        setClientes(prev => prev.map(c => c.id === actualizado.id ? actualizado : c));
        setClienteEditando(null);
        showSuccessBanner('Los datos del cliente fueron actualizados correctamente.');
    };

    const handleEstadoCambiado = (actualizado: Cliente) => {
        // Si el filtro actual ya no incluye este estado, remover de la lista
        if (filtro === 'activo' && !actualizado.estado_activo) {
            setClientes(prev => prev.filter(c => c.id !== actualizado.id));
        } else if (filtro === 'inactivo' && actualizado.estado_activo) {
            setClientes(prev => prev.filter(c => c.id !== actualizado.id));
        } else {
            setClientes(prev => prev.map(c => c.id === actualizado.id ? actualizado : c));
        }
        showSuccessBanner(
            actualizado.estado_activo
                ? `"${actualizado.cliente}" fue reactivado exitosamente.`
                : `"${actualizado.cliente}" fue desactivado y movido a inactivos.`
        );
    };

    const { maxLen, placeholder } = obtenerConfigIdentificacion(form.tipo_identificacion);

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
                .row-action-btn.edit:hover { background: rgba(78,158,255,0.12); color: #89c2ff; border-color: rgba(78,158,255,0.3); }
                .row-action-btn.deactivate:hover { background: rgba(245,158,11,0.12); color: #fbbf24; border-color: rgba(245,158,11,0.3); }
                .row-action-btn.activate:hover { background: rgba(0,180,140,0.12); color: #4ecfb3; border-color: rgba(0,180,140,0.3); }
                .filtro-btn {
                    padding: 7px 16px; border-radius: 20px; font-size: 13px;
                    font-family: 'DM Sans', sans-serif; cursor: pointer;
                    border: 1px solid rgba(255,255,255,0.1);
                    background: transparent; color: rgba(255,255,255,0.45);
                    transition: all 0.18s;
                }
                .filtro-btn:hover { color: rgba(255,255,255,0.75); background: rgba(255,255,255,0.05); }
                .filtro-btn.active-filter {
                    background: rgba(78,158,255,0.12); color: #89c2ff;
                    border-color: rgba(78,158,255,0.3);
                }
                .filtro-btn.inactivo-filter.active-filter {
                    background: rgba(245,158,11,0.1); color: #fbbf24;
                    border-color: rgba(245,158,11,0.25);
                }
                .filtro-btn.todos-filter.active-filter {
                    background: rgba(255,255,255,0.07); color: rgba(255,255,255,0.8);
                    border-color: rgba(255,255,255,0.2);
                }
                .ops-toggle-btn {
                    padding: 5px 11px; border-radius: 20px; font-size: 12px; font-weight: 500;
                    background: rgba(51,181,229,0.1); color: #33b5e5;
                    border: 1px solid rgba(51,181,229,0.25); cursor: pointer;
                    transition: background 0.18s; font-family: 'DM Sans', sans-serif;
                }
                .ops-toggle-btn.open { background: rgba(255,255,255,0.08); color: rgba(255,255,255,0.7); border-color: rgba(255,255,255,0.15); }
            `}</style>

            <Navbar user={user} />

            <div className="page-content">
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p className="eyebrow">Directorio de Entidades</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 4 }}>Clientes</h1>
                        <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.3)' }}>
                            {clientes.length} registro{clientes.length !== 1 ? 's' : ''} · mostrando {obtenerTextoFiltro(filtro)}
                        </p>
                    </div>
                    <button
                        className={showForm ? 'btn-secondary' : 'btn-primary'}
                        onClick={() => { setShowForm(s => !s); setError(''); setFormErrores({}); setForm(FORM_VACIO); }}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Cliente'}
                    </button>
                </div>

                {/* Filtros de estado */}
                <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {(['activo', 'inactivo', 'todos'] as FiltroEstado[]).map(f => (
                        <button
                            key={f}
                            className={`filtro-btn ${f}-filter${filtro === f ? ' active-filter' : ''}`}
                            onClick={() => handleFiltroChange(f)}
                        >
                            {f === 'activo' && '● '}
                            {f === 'inactivo' && '○ '}
                            {f.charAt(0).toUpperCase() + f.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Banners */}
                {error && <div className="error-box" style={{ marginBottom: 20 }}><ErrorIcon /> {error}</div>}
                {success && <div className="success-banner" style={{ marginBottom: 20 }}><IconCheck /> {success}</div>}

                {/* Formulario crear */}
                {showForm && (
                    <div className="form-card" style={{ marginBottom: 28, border: '1px solid rgba(78,158,255,0.2)' }}>
                        <h2 style={{ fontSize: 17, marginBottom: 24, color: '#e8efff', fontWeight: 500 }}>Nuevo Registro</h2>
                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label" htmlFor="nuevo-cliente-nombre">Nombre del Cliente / Razón Social <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input id="nuevo-cliente-nombre" className="field-input" style={formErrores.cliente ? fieldErrorStyle : undefined}
                                        type="text" value={form.cliente} onChange={handleChange('cliente')} placeholder="Ej: Corporación X" />
                                    {formErrores.cliente && <span style={{ fontSize: 12, color: '#ff9a9a', marginTop: 4 }}>{formErrores.cliente}</span>}
                                </div>
                                <div className="form-group">
                                    <label className="field-label" htmlFor="nuevo-cliente-tipo">Tipo de Entidad <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <select id="nuevo-cliente-tipo" className="field-select" value={form.tipo} onChange={handleChange('tipo')}>
                                        <option value="Público">Público</option>
                                        <option value="Privado">Privado</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="field-label" htmlFor="nuevo-cliente-tipo-id">Tipo Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <select id="nuevo-cliente-tipo-id" className="field-select" value={form.tipo_identificacion} onChange={handleChange('tipo_identificacion')}>
                                        <option value="Cédula">Cédula</option>
                                        <option value="RUC">RUC</option>
                                        <option value="Pasaporte">Pasaporte</option>
                                    </select>
                                </div>
                                <div className="form-group full">
                                    <label className="field-label" htmlFor="nuevo-cliente-identificacion">Número de Identificación <span style={{ color: '#ff9a9a' }}>*</span></label>
                                    <input id="nuevo-cliente-identificacion" className="field-input" style={formErrores.identificacion ? fieldErrorStyle : undefined}
                                        type="text" value={form.identificacion} onChange={handleChange('identificacion')}
                                        maxLength={maxLen} placeholder={placeholder} />
                                    {formErrores.identificacion && <span style={{ fontSize: 12, color: '#ff9a9a', marginTop: 4 }}>{formErrores.identificacion}</span>}
                                </div>
                            </div>
                            <div className="form-footer" style={{ marginTop: 0 }}>
                                <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {loading ? <><span className="spinner" /> Procesando...</> : <><IconSend /> Confirmar Registro</>}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Lista */}
                <div className="form-card">
                    {isLoadingData ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
                            <span className="spinner" style={{ width: 28, height: 28, borderWidth: 3 }} />
                            <p style={{ opacity: 0.5, fontSize: 14 }}>Cargando clientes...</p>
                        </div>
                    ) : clientes.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '48px 20px' }}>
                            <p style={{ opacity: 0.4, fontSize: 14, marginBottom: 16 }}>
                                {obtenerMensajeSinClientes(filtro)}
                            </p>
                            {filtro !== 'inactivo' && (
                                <button className="btn-primary" onClick={() => setShowForm(true)} style={{ margin: '0 auto' }}>
                                    + Añadir el primero
                                </button>
                            )}
                        </div>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                            {clientes.map((c) => (
                                <ClienteRow
                                    key={c.id}
                                    cliente={c}
                                    clientOps={oportunidades.filter(op => op.cliente_id === c.id)}
                                    isExpanded={expandedClienteId === c.id}
                                    onToggleExpand={() => setExpandedClienteId(expandedClienteId === c.id ? null : c.id)}
                                    onEditar={() => setClienteEditando(c)}
                                    onToggleEstado={() => setClienteToggle(c)}
                                    onVerOportunidades={() => navigate('/oportunidades')}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Modal editar */}
            {clienteEditando && (
                <EditModal cliente={clienteEditando} onClose={() => setClienteEditando(null)} onSaved={handleClienteGuardado} />
            )}

            {/* Modal desactivar/reactivar */}
            {clienteToggle && (
                <ToggleEstadoModal cliente={clienteToggle} onClose={() => setClienteToggle(null)} onConfirmed={handleEstadoCambiado} />
            )}
        </div>
    );
};

export default Clientes;