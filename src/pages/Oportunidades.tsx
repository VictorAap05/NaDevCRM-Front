import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';

import { obtenerOportunidades, crearOportunidad, type OportunidadListItem, type NuevaOportunidadDTO } from '../services/oportunidadService';
import { obtenerClientes, type Cliente } from '../services/clienteService';
import { obtenerUsuarios, type UserListItem } from '../services/usuarioService';
import { obtenerAreas, type Area } from '../services/areaService';
import axios from 'axios';

// Importamos tus funciones de validación
import { validarEmail, validarTelefonoEcuador } from '../utils/validaciones';

const Oportunidades: React.FC = () => {
    // 1. Estados
    const [user] = useState<Usuario | null>(() => {
        const userString = localStorage.getItem('user');
        return userString ? JSON.parse(userString) : null;
    });

    const [oportunidades, setOportunidades] = useState<OportunidadListItem[]>([]);
    const [clientes, setClientes] = useState<Cliente[]>([]);
    const [usuarios, setUsuarios] = useState<UserListItem[]>([]);
    const [areas, setAreas] = useState<Area[]>([]);

    const [showForm, setShowForm] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [loading, setLoading] = useState(false); 
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        cliente_id: '',
        nombre_contacto: '',
        correo_contacto: '',
        numero_contacto: '',
        area_id: '',
        nombre_oportunidad: '',
        codigo_oportunidad: '',
        fase_venta: 'Prospección',
        monto_estimado: '',
        probabilidad_venta: 'Media',
        fecha_cierre_esperada: '',
        resp_comercial_id: '',
        resp_tecnico_id: '',
        descripcion: ''
    });

    // 2. Efecto de carga inicial
    useEffect(() => {
        if (!user?.id) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoadingData(false);
            return;
        }

        let isMounted = true;

        const fetchData = async () => {
            setIsLoadingData(true);
            try {
                const [opsData, clientesData, usuariosData, areasData] = await Promise.all([
                    obtenerOportunidades().catch(() => [] as OportunidadListItem[]),
                    obtenerClientes().catch(() => [] as Cliente[]),
                    obtenerUsuarios().catch(() => [] as UserListItem[]),
                    obtenerAreas().catch(() => [] as Area[])
                ]);

                if (isMounted) {
                    setOportunidades(opsData);
                    setClientes(clientesData);
                    setUsuarios(usuariosData);
                    setAreas(areasData);
                }
            } catch (err) {
                console.error("Error cargando dependencias iniciales:", err);
            } finally {
                if (isMounted) {
                    setIsLoadingData(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, [user?.id]); 

    // 3. Funciones auxiliares y manejadores
    const formatCurrency = (value: string) => {
        const numericValue = value.replace(/\D/g, '');
        if (!numericValue) return '';
        const number = parseFloat(numericValue) / 100;
        return number.toLocaleString('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleChange = (k: keyof typeof form) => (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        let value = e.target.value;

        if (k === 'numero_contacto') {
            value = value.replace(/\D/g, '');
            value = value.slice(0, 10);
        }
        if (k === 'nombre_contacto') {
            value = value.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '');
        }
        if (k === 'monto_estimado') {
            value = formatCurrency(value);
        }
        if (k === 'codigo_oportunidad') {
            value = value.replace(/[^A-Za-z0-9-]/g, '');
        }

        setForm((f) => ({
            ...f,
            [k]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        // VALIDACIONES FRONTEND ANTES DE ENVIAR AL BACKEND
        if (form.correo_contacto && !validarEmail(form.correo_contacto)) {
            setError('Por favor, ingresa un correo electrónico válido.');
            return;
        }

        if (form.numero_contacto && !validarTelefonoEcuador(form.numero_contacto)) {
            setError('El número de contacto debe tener 10 dígitos y empezar con "09".');
            return;
        }

        const montoParseado = parseFloat(form.monto_estimado.replace(/,/g, '')) || 0;
        if (montoParseado <= 0) {
            setError('El monto estimado debe ser mayor a $0.00.');
            return;
        }

        // Si pasa todas las validaciones
        setLoading(true);

        try {
            const payload: NuevaOportunidadDTO = {
                ...form,
                monto_estimado: montoParseado,
                creado_por: user?.id,
                codigo_oportunidad: form.codigo_oportunidad || undefined,
                nombre_contacto: form.nombre_contacto || undefined,
                correo_contacto: form.correo_contacto || undefined,
                numero_contacto: form.numero_contacto || undefined,
                resp_comercial_id: form.resp_comercial_id || undefined,
                resp_tecnico_id: form.resp_tecnico_id || undefined,
                descripcion: form.descripcion || undefined,
            };

            const nuevaOportunidad = await crearOportunidad(payload);

            setOportunidades([nuevaOportunidad, ...oportunidades]);
            setSuccess(true);
            setShowForm(false);

            setForm({
                cliente_id: '',
                nombre_contacto: '',
                correo_contacto: '',
                numero_contacto: '',
                area_id: '',
                nombre_oportunidad: '',
                codigo_oportunidad: '',
                fase_venta: 'Prospección',
                monto_estimado: '',
                probabilidad_venta: 'Media',
                fecha_cierre_esperada: '',
                resp_comercial_id: '',
                resp_tecnico_id: '',
                descripcion: ''
            });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || err.message || 'Error al guardar la oportunidad');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al guardar la oportunidad');
            }
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null;

    // 4. Renderizado principal
    return (
        <div className="dash-root">
            <Navbar user={user} />

            <div className="page-content">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
                    <div>
                        <p className="eyebrow">Gestión Comercial</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>Oportunidades</h1>
                    </div>

                    <button
                        className={showForm ? "btn-secondary" : "btn-primary"}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancelar' : '+ Nueva Oportunidad'}
                    </button>
                </div>

                {error && (
                    <div
                        className="error-box"
                        style={{
                            marginBottom: 20,
                            background: '#ff000022',
                            border: '1px solid red',
                            padding: 10
                        }}
                    >
                        <strong>Error:</strong> {error}
                    </div>
                )}

                {success && (
                    <div className="success-banner" style={{ marginBottom: 20 }}>
                        <IconCheck /> Oportunidad registrada con éxito.
                    </div>
                )}

                {showForm && (
                    <div className="form-card" style={{ marginBottom: 32, border: '1px solid var(--accent)' }}>
                        <h2
                            style={{
                                marginBottom: 20,
                                fontSize: 18,
                                borderBottom: '1px solid #333',
                                paddingBottom: 10
                            }}
                        >
                            Ingreso de Oportunidad
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <h3 style={{ fontSize: 14, color: 'var(--accent)', marginTop: 20, marginBottom: 15 }}>
                                Datos del Cliente
                            </h3>

                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Cliente Asociado *</label>
                                    <select
                                        className="field-select"
                                        value={form.cliente_id}
                                        onChange={handleChange('cliente_id')}
                                        required
                                    >
                                        <option value="">Seleccione un cliente...</option>
                                        {clientes.map(c => (
                                            <option key={c.id} value={c.id}>
                                                {c.cliente}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Nombre del Contacto</label>
                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.nombre_contacto}
                                        onChange={handleChange('nombre_contacto')}
                                        placeholder="Ej: Juan Pérez"
                                        pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                                        title="Ingrese solo letras"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Correo del Contacto</label>
                                    <input
                                        className="field-input"
                                        type="email"
                                        value={form.correo_contacto}
                                        onChange={handleChange('correo_contacto')}
                                        placeholder="juan@empresa.com"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Teléfono del Contacto</label>
                                    <input
                                        className="field-input"
                                        type="tel"
                                        value={form.numero_contacto}
                                        onChange={handleChange('numero_contacto')}
                                        placeholder="0999999999"
                                        maxLength={10}
                                    />
                                </div>
                            </div>

                            <h3 style={{ fontSize: 14, color: 'var(--accent)', marginTop: 30, marginBottom: 15 }}>
                                Datos de la Oportunidad
                            </h3>

                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre de la Oportunidad *</label>
                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.nombre_oportunidad}
                                        onChange={handleChange('nombre_oportunidad')}
                                        required
                                        minLength={5}
                                        maxLength={150}
                                        placeholder="Ej: Implementación de ERP"
                                        title="Debe tener entre 5 y 150 caracteres"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Área *</label>
                                    <select
                                        className="field-select"
                                        value={form.area_id}
                                        onChange={handleChange('area_id')}
                                        required
                                    >
                                        <option value="">Seleccione el área...</option>
                                        {areas.map(a => (
                                            <option key={a.id} value={a.id}>
                                                {a.area}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Código (Opcional)</label>
                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.codigo_oportunidad}
                                        onChange={handleChange('codigo_oportunidad')}
                                        placeholder="Ej: OP-2026-001"
                                        pattern="^[A-Za-z0-9-]+$"
                                        title="Solo letras, números y guiones"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Monto Estimado ($) *</label>
                                    <input
                                        className="field-input"
                                        type="text"
                                        inputMode="decimal"
                                        value={form.monto_estimado}
                                        onChange={handleChange('monto_estimado')}
                                        required
                                        placeholder="$0.00"
                                    />
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Fase de Venta</label>
                                    <select
                                        className="field-select"
                                        value={form.fase_venta}
                                        onChange={handleChange('fase_venta')}
                                    >
                                        <option value="Prospección">Prospección</option>
                                        <option value="Propuesta">Propuesta</option>
                                        <option value="Negociación">Negociación</option>
                                        <option value="Cerrada Ganada">Cerrada Ganada</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Probabilidad</label>
                                    <select
                                        className="field-select"
                                        value={form.probabilidad_venta}
                                        onChange={handleChange('probabilidad_venta')}
                                    >
                                        <option value="Alta">Alta</option>
                                        <option value="Media">Media</option>
                                        <option value="Baja">Baja</option>
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Fecha de Cierre Esperada *</label>
                                    <input
                                        className="field-input"
                                        type="date"
                                        value={form.fecha_cierre_esperada}
                                        onChange={handleChange('fecha_cierre_esperada')}
                                        required
                                        min={new Date().toISOString().split('T')[0]}
                                    />
                                </div>
                            </div>

                            <h3 style={{ fontSize: 14, color: 'var(--accent)', marginTop: 30, marginBottom: 15 }}>
                                Equipo Asignado
                            </h3>

                            <div className="form-grid">
                                <div className="form-group">
                                    <label className="field-label">Responsable Comercial</label>
                                    <select
                                        className="field-select"
                                        value={form.resp_comercial_id}
                                        onChange={handleChange('resp_comercial_id')}
                                    >
                                        <option value="">Sin asignar...</option>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label className="field-label">Responsable Técnico</label>
                                    <select
                                        className="field-select"
                                        value={form.resp_tecnico_id}
                                        onChange={handleChange('resp_tecnico_id')}
                                    >
                                        <option value="">Sin asignar...</option>
                                        {usuarios.map(u => (
                                            <option key={u.id} value={u.id}>
                                                {u.nombre}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group full">
                                    <label className="field-label">Descripción Detallada</label>
                                    <textarea
                                        className="field-input"
                                        style={{ minHeight: '80px', resize: 'vertical' }}
                                        value={form.descripcion}
                                        onChange={handleChange('descripcion')}
                                        placeholder="Detalles adicionales de la oportunidad..."
                                        maxLength={1000}
                                    />
                                </div>
                            </div>

                            <div className="form-footer" style={{ marginTop: 24, textAlign: 'right' }}>
                                <button
                                    type="submit"
                                    className="btn-primary"
                                    disabled={loading}
                                >
                                    {loading ? <span className="spinner" /> : <IconSend />}
                                    {loading ? ' Guardando...' : ' Guardar Oportunidad'}
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
                                <p style={{ opacity: 0.6 }}>Cargando oportunidades...</p>
                            </div>
                        ) : oportunidades.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: 20 }}>
                                No hay oportunidades registradas aún.
                            </p>
                        ) : (
                            oportunidades.map((op) => (
                                <div
                                    key={op.id}
                                    style={{
                                        padding: '16px 20px',
                                        borderRadius: 12,
                                        background: 'rgba(255,255,255,0.03)',
                                        border: '1px solid rgba(255,255,255,0.07)',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center'
                                    }}
                                >
                                    <div>
                                        <h3 style={{ fontSize: 16, marginBottom: 4 }}>
                                            {op.nombre_oportunidad}
                                        </h3>

                                        <p style={{ fontSize: 13, opacity: 0.6 }}>
                                            Monto: ${op.monto_estimado} | Cierre:{' '}
                                            {op.fecha_cierre_esperada?.split('T')[0] || 'N/A'}
                                        </p>
                                    </div>

                                    <div style={{ textAlign: 'right' }}>
                                        <span
                                            className="badge"
                                            style={{
                                                padding: '4px 10px',
                                                borderRadius: 20,
                                                fontSize: 12,
                                                background:
                                                    op.fase_venta === 'Cerrada Ganada'
                                                        ? '#064e3b'
                                                        : '#78350f'
                                            }}
                                        >
                                            {op.fase_venta}
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

export default Oportunidades;