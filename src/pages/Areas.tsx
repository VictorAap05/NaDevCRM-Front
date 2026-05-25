import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import type { Usuario } from '../types/auth';
import IconCheck from '../components/icons/IconCheck';
import IconSend from '../components/icons/IconSend';
import { obtenerAreas, crearArea, type Area, type NuevaAreaDTO } from '../services/areaService';
import axios from 'axios';

const Areas: React.FC = () => {
   const [user] = useState<Usuario | null>(() => {
    const userString = localStorage.getItem('user');
    return userString ? JSON.parse(userString) : null;
});

    const [areas, setAreas] = useState<Area[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [isLoadingData, setIsLoadingData] = useState(true);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState('');

    const [form, setForm] = useState({
        area: ''
    });

    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        if (!user) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setIsLoadingData(false);
            return;
        }

        const fetchAreas = async () => {
            try {
                setIsLoadingData(true);

                const areasData = await obtenerAreas();

                if (Array.isArray(areasData)) {
                    setAreas(areasData);
                } else {
                    setAreas([]);
                }

            } catch (err) {
                console.error("Error cargando áreas:", err);
                setAreas([]);
            } finally {
                setIsLoadingData(false);
            }
        };

        fetchAreas();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ area: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!form.area.trim()) {
            setError('El nombre del área es obligatorio');

            setTimeout(() => scrollToTop(), 100);

            return;
        }

        setLoading(true);

        try {
            const payload: NuevaAreaDTO = { area: form.area.trim() };
            const nuevaArea = await crearArea(payload);

            setAreas([nuevaArea, ...areas]);
            setSuccess(true);
            setShowForm(false);
            setForm({ area: '' });

            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.error || err.message || 'Error al guardar el área');
            } else if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Error desconocido al guardar el área');
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
                        <p className="eyebrow">Configuración del Sistema</p>
                        <h1 className="page-title" style={{ fontSize: 32, marginBottom: 0 }}>Gestión de Áreas</h1>
                    </div>

                    <button
                        className={showForm ? "btn-secondary" : "btn-primary"}
                        onClick={() => setShowForm(!showForm)}
                    >
                        {showForm ? 'Cancelar' : '+ Añadir Área'}
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
                        <IconCheck /> Área registrada con éxito.
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
                            Nueva Área
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-grid">
                                <div className="form-group full">
                                    <label className="field-label">Nombre del Área *</label>

                                    <input
                                        className="field-input"
                                        type="text"
                                        value={form.area}
                                        onChange={handleChange}
                                        required
                                        placeholder="Ej: Recursos Humanos"
                                    />
                                </div>
                            </div>

                            <div className="form-footer" style={{ marginTop: 24, textAlign: 'right' }}>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? <span className="spinner" /> : <IconSend />}
                                    {loading ? ' Guardando...' : ' Guardar Área'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="form-card">
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {isLoadingData ? (
                            <div
                                style={{
                                    textAlign: 'center',
                                    padding: '40px 20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center'
                                }}
                            >
                                <span
                                    className="spinner"
                                    style={{
                                        width: 30,
                                        height: 30,
                                        borderWidth: 3,
                                        marginBottom: 15
                                    }}
                                />

                                <p style={{ opacity: 0.6 }}>
                                    Cargando áreas...
                                </p>
                            </div>
                        ) : !Array.isArray(areas) || areas.length === 0 ? (
                            <p style={{ textAlign: 'center', opacity: 0.5, padding: 20 }}>
                                No hay áreas registradas en la base de datos.
                            </p>
                        ) : (
                            areas.map((a) => (
                                <div
                                    key={a.id}
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
                                    <h3 style={{ fontSize: 16, margin: 0 }}>
                                        {a.area}
                                    </h3>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Areas;