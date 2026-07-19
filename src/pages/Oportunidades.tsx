import React, { useState, useEffect, useRef } from "react";
import Navbar from "../components/Navbar";
import type { Usuario } from "../types/auth";
import IconCheck from "../components/icons/IconCheck";
import IconSend from "../components/icons/IconSend";

import {
  obtenerOportunidades,
  crearOportunidad,
  actualizarOportunidad,
  type OportunidadListItem,
  type NuevaOportunidadDTO,
  type ActualizarOportunidadDTO,
  obtenerComentarios,
  crearComentario,
  type Comentario,
} from "../services/oportunidadService";
import { obtenerClientes, type Cliente } from "../services/clienteService";
import { obtenerUsuarios, type UserListItem } from "../services/usuarioService";
import { obtenerAreas, type Area } from "../services/areaService";
import axios from "axios";

import {
  validarEmail,
  validarTelefonoEcuador,
  validarNombreYApellido,
} from "../utils/validaciones";

const SeccionComentarios: React.FC<{ oportunidadId: string | number }> = ({
  oportunidadId,
}) => {
  const [comentarios, setComentarios] = useState<Comentario[]>([]);
  const [texto, setTexto] = useState("");
  const [loading, setLoading] = useState(false);
  const [enviando, setEnviando] = useState(false);

  const cargarComentarios = async () => {
    setLoading(true);
    try {
      const data = await obtenerComentarios(oportunidadId);
      setComentarios(data);
    } catch (err) {
      console.error("Error al cargar los comentarios:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarComentarios();
  }, [oportunidadId]);

  const handleSubmitComentario = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!texto.trim()) return;

    setEnviando(true);
    try {
      await crearComentario(oportunidadId, texto);
      setTexto("");
      cargarComentarios();
    } catch (err) {
      console.error("Error al registrar comentario:", err);
      alert("No se pudo guardar el comentario");
    } finally {
      setEnviando(false);
    }
  };

  const renderListaComentarios = () => {
    if (loading) {
      return (
        <div style={{ opacity: 0.5, fontSize: 13, padding: "10px 0" }}>
          Cargando historial...
        </div>
      );
    }

    if (comentarios.length === 0) {
      return (
        <p
          style={{
            opacity: 0.4,
            fontSize: 13,
            fontStyle: "italic",
            margin: "10px 0",
          }}
        >
          No hay comentarios registrados.
        </p>
      );
    }

    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxHeight: "240px",
          overflowY: "auto",
          paddingRight: 4,
        }}
      >
        {comentarios.map((c) => (
          <div
            key={c.comentario_id}
            style={{
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              padding: 12,
              borderRadius: 10,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 6,
                fontSize: 12,
              }}
            >
              <span style={{ fontWeight: 600, color: "#fff" }}>
                {c.usuario_nombre}{" "}
                <span style={{ opacity: 0.5, fontWeight: 400 }}>
                  ({c.usuario_rol})
                </span>
              </span>
              <span style={{ opacity: 0.4 }}>
                {new Date(c.fecha_creacion).toLocaleDateString("es-EC", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <p
              style={{
                fontSize: 13,
                opacity: 0.85,
                margin: 0,
                whiteSpace: "pre-line",
                lineHeight: 1.4,
              }}
            >
              {c.contenido}
            </p>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ marginTop: 10 }}>
      <h4
        style={{
          fontSize: 14,
          color: "var(--accent)",
          marginBottom: 12,
          fontWeight: 600,
        }}
      >
        Comentarios
      </h4>

      <form
        onSubmit={handleSubmitComentario}
        style={{ display: "flex", gap: 10, marginBottom: 16 }}
      >
        <textarea
          className="field-input"
          style={{
            minHeight: "42px",
            height: "42px",
            resize: "none",
            flex: 1,
            padding: "10px 14px",
            borderRadius: 8,
          }}
          placeholder="Escribe una actualización sobre este negocio..."
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          disabled={enviando}
          required
        />
        <button
          type="submit"
          className="btn-primary"
          style={{
            height: "42px",
            width: "45px",
            padding: 0,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            borderRadius: 8,
          }}
          disabled={enviando || !texto.trim()}
        >
          {enviando ? (
            <span className="spinner" style={{ width: 16, height: 16 }} />
          ) : (
            <IconSend />
          )}
        </button>
      </form>

      {renderListaComentarios()}
    </div>
  );
};

// ─── Modal de Edición de Oportunidad ───
interface EditOportunidadModalProps {
  oportunidad: OportunidadListItem;
  clientes: Cliente[];
  usuarios: UserListItem[];
  areas: Area[];
  onClose: () => void;
  onSaved: (op: OportunidadListItem) => void;
}

/* ─── Utilidad compartida de formato de moneda ───────────── */
const formatCurrency = (value: string) => {
  const numericValue = value.replaceAll(/\D/g, "");
  if (!numericValue) return "";
  const number = Number.parseFloat(numericValue) / 100;
  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const EditOportunidadModal: React.FC<EditOportunidadModalProps> = ({
  oportunidad,
  clientes,
  usuarios,
  areas,
  onClose,
  onSaved,
}) => {
  const [form, setForm] = useState({
    cliente_id: oportunidad.cliente_id || "",
    nombre_contacto: oportunidad.nombre_contacto || "",
    correo_contacto: oportunidad.correo_contacto || "",
    numero_contacto: oportunidad.numero_contacto || "",
    area_id: oportunidad.area_id || "",
    nombre_oportunidad: oportunidad.nombre_oportunidad || "",
    codigo_oportunidad: oportunidad.codigo_oportunidad || "",
    fase_venta: oportunidad.fase_venta || "Prospección",
    monto_estimado: oportunidad.monto_estimado
      ? Number(oportunidad.monto_estimado).toLocaleString("en-US", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : "",
    probabilidad_venta: oportunidad.probabilidad_venta || "Media",
    fecha_cierre_esperada: oportunidad.fecha_cierre_esperada
      ? oportunidad.fecha_cierre_esperada.split("T")[0]
      : "",
    resp_comercial_id: oportunidad.resp_comercial_id || "",
    resp_tecnico_id: oportunidad.resp_tecnico_id || "",
    descripcion: oportunidad.descripcion || "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      let value = e.target.value;

      if (k === "numero_contacto") {
        value = value.replaceAll(/\D/g, "").slice(0, 10);
      }
      if (k === "nombre_contacto") {
        value = value.replaceAll(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
      }
      if (k === "monto_estimado") {
        value = formatCurrency(value);
      }
      if (k === "codigo_oportunidad") {
        value = value.replaceAll(/[^A-Za-z0-9-]/g, "");
      }

      setForm((f) => ({ ...f, [k]: value }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.nombre_contacto && !validarNombreYApellido(form.nombre_contacto)) {
      setError("Por favor, ingresa al menos un nombre y un apellido válidos.");
      return;
    }
    if (form.correo_contacto && !validarEmail(form.correo_contacto)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      return;
    }
    if (form.numero_contacto && !validarTelefonoEcuador(form.numero_contacto)) {
      setError('El número de contacto debe tener 10 dígitos y empezar con "09".');
      return;
    }

    const montoParseado = Number.parseFloat(form.monto_estimado.replaceAll(/,/g, "")) || 0;
    if (montoParseado <= 0) {
      setError("El monto estimado debe ser mayor a $0.00.");
      return;
    }

    setLoading(true);
    try {
      const payload: ActualizarOportunidadDTO = {
        ...form,
        monto_estimado: montoParseado,
        codigo_oportunidad: form.codigo_oportunidad || undefined,
        nombre_contacto: form.nombre_contacto || undefined,
        correo_contacto: form.correo_contacto || undefined,
        numero_contacto: form.numero_contacto || undefined,
        resp_comercial_id: form.resp_comercial_id || undefined,
        resp_tecnico_id: form.resp_tecnico_id || undefined,
        descripcion: form.descripcion || undefined,
      };

      const actualizada = await actualizarOportunidad(oportunidad.id, payload);
      onSaved(actualizada);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Error al actualizar la oportunidad",
        );
      } else {
        setError("Error desconocido al actualizar la oportunidad");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.65)",
        backdropFilter: "blur(6px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 200,
        padding: 24,
      }}
      role="button"
      tabIndex={0}
      aria-label="Cerrar modal"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      onKeyDown={(e) => { if (e.key === "Escape" || e.key === "Enter") onClose(); }}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 720,
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#111318",
          border: "1px solid rgba(255,255,255,0.1)",
          borderRadius: 20,
          padding: "32px 36px",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 24,
          }}
        >
          <div>
            <p
              style={{
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                color: "#4e9eff",
                marginBottom: 6,
              }}
            >
              Gestión Comercial
            </p>
            <h2
              style={{
                fontFamily: "DM Serif Display, serif",
                fontSize: 24,
                color: "#f0f4ff",
                margin: 0,
              }}
            >
              Editar Oportunidad
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              border: "1px solid rgba(255,255,255,0.1)",
              background: "rgba(255,255,255,0.04)",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="error-box" style={{ marginBottom: 20 }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <h3 style={{ fontSize: 14, color: "var(--accent)", marginBottom: 15 }}>
            Datos del Cliente
          </h3>

          <div className="form-grid">
            <div className="form-group full">
              <label className="field-label" htmlFor="editar-op-cliente">Cliente Asociado *</label>
              <select
                id="editar-op-cliente"
                className="field-select"
                value={form.cliente_id}
                onChange={handleChange("cliente_id")}
                required
              >
                <option value="">Seleccione un cliente...</option>
                {clientes.map((c) => (
                  <option key={c.id} value={c.id}>{c.cliente}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-nombre-contacto">Nombre del Contacto</label>
              <input
                id="editar-op-nombre-contacto"
                className="field-input"
                type="text"
                value={form.nombre_contacto}
                onChange={handleChange("nombre_contacto")}
                placeholder="Ej: Juan Pérez"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-correo-contacto">Correo del Contacto</label>
              <input
                id="editar-op-correo-contacto"
                className="field-input"
                type="email"
                value={form.correo_contacto}
                onChange={handleChange("correo_contacto")}
                placeholder="juan@empresa.com"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-telefono-contacto">Teléfono del Contacto</label>
              <input
                id="editar-op-telefono-contacto"
                className="field-input"
                type="tel"
                value={form.numero_contacto}
                onChange={handleChange("numero_contacto")}
                placeholder="0999999999"
                maxLength={10}
              />
            </div>
          </div>

          <h3 style={{ fontSize: 14, color: "var(--accent)", marginTop: 28, marginBottom: 15 }}>
            Datos de la Oportunidad
          </h3>

          <div className="form-grid">
            <div className="form-group full">
              <label className="field-label" htmlFor="editar-op-nombre">Nombre de la Oportunidad *</label>
              <input
                id="editar-op-nombre"
                className="field-input"
                type="text"
                value={form.nombre_oportunidad}
                onChange={handleChange("nombre_oportunidad")}
                required
                minLength={5}
                maxLength={150}
                placeholder="Ej: Implementación de ERP"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-area">Área *</label>
              <select
                id="editar-op-area"
                className="field-select"
                value={form.area_id}
                onChange={handleChange("area_id")}
                required
              >
                <option value="">Seleccione el área...</option>
                {areas.map((a) => (
                  <option key={a.id} value={a.id}>{a.area}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-codigo">Código (Opcional)</label>
              <input
                id="editar-op-codigo"
                className="field-input"
                type="text"
                value={form.codigo_oportunidad}
                onChange={handleChange("codigo_oportunidad")}
                placeholder="Ej: OP-2026-001"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-monto">Monto Estimado ($) *</label>
              <input
                id="editar-op-monto"
                className="field-input"
                type="text"
                inputMode="decimal"
                value={form.monto_estimado}
                onChange={handleChange("monto_estimado")}
                required
                placeholder="$0.00"
              />
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-fase">Fase de Venta</label>
              <select
                id="editar-op-fase"
                className="field-select"
                value={form.fase_venta}
                onChange={handleChange("fase_venta")}
              >
                <option value="Prospección">Prospección</option>
                <option value="Propuesta">Propuesta</option>
                <option value="Negociación">Negociación</option>
                <option value="Cerrada Ganada">Cerrada Ganada</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-probabilidad">Probabilidad</label>
              <select
                id="editar-op-probabilidad"
                className="field-select"
                value={form.probabilidad_venta}
                onChange={handleChange("probabilidad_venta")}
              >
                <option value="Alta">Alta</option>
                <option value="Media">Media</option>
                <option value="Baja">Baja</option>
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-fecha-cierre">Fecha de Cierre Esperada *</label>
              <input
                id="editar-op-fecha-cierre"
                className="field-input"
                type="date"
                value={form.fecha_cierre_esperada}
                onChange={handleChange("fecha_cierre_esperada")}
                required
              />
            </div>
          </div>

          <h3 style={{ fontSize: 14, color: "var(--accent)", marginTop: 28, marginBottom: 15 }}>
            Equipo Asignado
          </h3>

          <div className="form-grid">
            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-resp-comercial">Responsable Comercial</label>
              <select
                id="editar-op-resp-comercial"
                className="field-select"
                value={form.resp_comercial_id}
                onChange={handleChange("resp_comercial_id")}
              >
                <option value="">Sin asignar...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="field-label" htmlFor="editar-op-resp-tecnico">Responsable Técnico</label>
              <select
                id="editar-op-resp-tecnico"
                className="field-select"
                value={form.resp_tecnico_id}
                onChange={handleChange("resp_tecnico_id")}
              >
                <option value="">Sin asignar...</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>{u.nombre}</option>
                ))}
              </select>
            </div>

            <div className="form-group full">
              <label className="field-label" htmlFor="editar-op-descripcion">Descripción Detallada</label>
              <textarea
                id="editar-op-descripcion"
                className="field-input"
                style={{ minHeight: "80px", resize: "vertical" }}
                value={form.descripcion}
                onChange={handleChange("descripcion")}
                maxLength={1000}
              />
            </div>
          </div>

          <div
            className="form-footer"
            style={{ marginTop: 24, display: "flex", justifyContent: "flex-end", gap: 12 }}
          >
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <span className="spinner" /> : <IconSend />}
              {loading ? " Guardando..." : " Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Oportunidades: React.FC = () => {
  const [user] = useState<Usuario | null>(() => {
    const userString = localStorage.getItem("user");
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
  const [error, setError] = useState("");
  const [expandedId, setExpandedId] = useState<string | number | null>(null);
  const [editingOportunidad, setEditingOportunidad] = useState<OportunidadListItem | null>(null);
  const errorRef = useRef<HTMLDivElement | null>(null);

  // --- NUEVOS ESTADOS PARA FILTROS (HU13) ---
  const [filtroCliente, setFiltroCliente] = useState("");
  const [filtroFase, setFiltroFase] = useState("");

  const [form, setForm] = useState({
    cliente_id: "",
    nombre_contacto: "",
    correo_contacto: "",
    numero_contacto: "",
    area_id: "",
    nombre_oportunidad: "",
    codigo_oportunidad: "",
    fase_venta: "Prospección",
    monto_estimado: "",
    probabilidad_venta: "Media",
    fecha_cierre_esperada: "",
    resp_comercial_id: "",
    resp_tecnico_id: "",
    descripcion: "",
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
        const [opsData, clientesData, usuariosData, areasData] =
          await Promise.all([
            obtenerOportunidades().catch(() => [] as OportunidadListItem[]),
            obtenerClientes().catch(() => [] as Cliente[]),
            obtenerUsuarios().catch(() => [] as UserListItem[]),
            obtenerAreas().catch(() => [] as Area[]),
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
  const scrollToError = () => {
    setTimeout(() => {
      errorRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }, 100);
  };

  const handleChange =
    (k: keyof typeof form) =>
    (
      e: React.ChangeEvent<
        HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
      >,
    ) => {
      let value = e.target.value;

      if (k === "numero_contacto") {
        value = value.replaceAll(/\D/g, "");
        value = value.slice(0, 10);
      }
      if (k === "nombre_contacto") {
        value = value.replaceAll(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, "");
      }
      if (k === "monto_estimado") {
        value = formatCurrency(value);
      }
      if (k === "codigo_oportunidad") {
        value = value.replaceAll(/[^A-Za-z0-9-]/g, "");
      }

      setForm((f) => ({
        ...f,
        [k]: value,
      }));
    };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (form.nombre_contacto && !validarNombreYApellido(form.nombre_contacto)) {
      setError("Por favor, ingresa al menos un nombre y un apellido válidos.");
      scrollToError();
      return;
    }

    if (form.correo_contacto && !validarEmail(form.correo_contacto)) {
      setError("Por favor, ingresa un correo electrónico válido.");
      scrollToError();
      return;
    }

    if (form.numero_contacto && !validarTelefonoEcuador(form.numero_contacto)) {
      setError(
        'El número de contacto debe tener 10 dígitos y empezar con "09".',
      );
      scrollToError();
      return;
    }

    const montoParseado =
      Number.parseFloat(form.monto_estimado.replaceAll(/,/g, "")) || 0;

    if (montoParseado <= 0) {
      setError("El monto estimado debe ser mayor a $0.00.");
      scrollToError();
      return;
    }

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
        cliente_id: "",
        nombre_contacto: "",
        correo_contacto: "",
        numero_contacto: "",
        area_id: "",
        nombre_oportunidad: "",
        codigo_oportunidad: "",
        fase_venta: "Prospección",
        monto_estimado: "",
        probabilidad_venta: "Media",
        fecha_cierre_esperada: "",
        resp_comercial_id: "",
        resp_tecnico_id: "",
        descripcion: "",
      });

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Error al guardar la oportunidad",
        );
      } else if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Error desconocido al guardar la oportunidad");
      }

      scrollToError();
    } finally {
      setLoading(false);
    }
  };

  const handleOportunidadActualizada = (actualizada: OportunidadListItem) => {
    setOportunidades((prev) =>
      prev.map((op) => (op.id === actualizada.id ? actualizada : op)),
    );
    setEditingOportunidad(null);
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };
  // --- LÓGICA DE FILTRADO (CA13.1 y CA13.2) ---
  const oportunidadesFiltradas = oportunidades.filter((op) => {
    // 1. Obtener el nombre del cliente para buscar coincidencias
    const clienteAsociado = clientes.find((c) => c.id === op.cliente_id);
    const nombreCliente = clienteAsociado ? clienteAsociado.cliente.toLowerCase() : "";

    const cumpleCliente = filtroCliente === "" || nombreCliente.includes(filtroCliente.toLowerCase());
    const cumpleFase = filtroFase === "" || op.fase_venta === filtroFase;

    return cumpleCliente && cumpleFase;
  });

  const renderContenidoLista = () => {
    if (isLoadingData) {
      return (
        <div
          style={{
            textAlign: "center",
            padding: "40px 20px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span
            className="spinner"
            style={{
              width: 30,
              height: 30,
              borderWidth: 3,
              marginBottom: 15,
            }}
          />
          <p style={{ opacity: 0.6 }}>Cargando oportunidades...</p>
        </div>
      );
    }

    if (oportunidades.length === 0) {
      return (
        <p style={{ textAlign: "center", opacity: 0.5, padding: 20 }}>
          No hay oportunidades registradas aún.
        </p>
      );
    }

    if (oportunidadesFiltradas.length === 0) {
      /* CA13.3: Mensaje dinámico si no hay coincidencias de búsqueda */
      return (
        <p style={{ textAlign: "center", opacity: 0.5, padding: 20 }}>
          No se encontraron oportunidades con los criterios seleccionados.
        </p>
      );
    }

    return oportunidadesFiltradas.map((op) => {
                const cliente = clientes.find((c) => c.id === op.cliente_id);
                const area = areas.find((a) => a.id === op.area_id);
                const respComercial = usuarios.find(
                  (u) => u.id === op.resp_comercial_id,
                );
                const respTecnico = usuarios.find(
                  (u) => u.id === op.resp_tecnico_id,
                );

                const expanded = expandedId === op.id;

                return (
                  <div
                    key={op.id}
                    style={{
                      borderRadius: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.07)",
                      overflow: "hidden",
                      transition: "0.3s",
                    }}
                  >
                    {/* HEADER */}
                    <div
                      onClick={() => setExpandedId(expanded ? null : op.id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={expanded}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setExpandedId(expanded ? null : op.id);
                        }
                      }}
                      style={{
                        padding: "16px 20px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        gap: 20,
                        flexWrap: "wrap",
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ fontSize: 16, marginBottom: 6 }}>
                          {op.nombre_oportunidad}
                        </h3>

                        <p
                          style={{
                            fontSize: 13,
                            opacity: 0.7,
                            display: "flex",
                            flexWrap: "wrap",
                            gap: 12,
                          }}
                        >
                          <span>
                            <strong>Cliente:</strong>{" "}
                            {cliente?.cliente || "No asignado"}
                          </span>

                          <span>
                            <strong>Monto:</strong> $
                            {Number(op.monto_estimado).toLocaleString("en-US", {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}
                          </span>

                          <span>
                            <strong>Cierre:</strong>{" "}
                            {op.fecha_cierre_esperada?.split("T")[0] || "N/A"}
                          </span>
                        </p>
                      </div>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                        }}
                      >
                        <span
                          className="badge"
                          style={{
                            padding: "4px 10px",
                            borderRadius: 20,
                            fontSize: 12,
                            background:
                              op.fase_venta === "Cerrada Ganada"
                                ? "#064e3b"
                                : "#78350f",
                          }}
                        >
                          {op.fase_venta}
                        </span>

                        {op.puede_editar && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingOportunidad(op);
                            }}
                            title="Editar oportunidad"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 8,
                              border: "1px solid rgba(255,255,255,0.1)",
                              background: "rgba(255,255,255,0.04)",
                              color: "rgba(255,255,255,0.5)",
                              cursor: "pointer",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              flexShrink: 0,
                              transition: "background 0.18s, color 0.18s, border-color 0.18s",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.background = "rgba(78,158,255,0.12)";
                              e.currentTarget.style.color = "#89c2ff";
                              e.currentTarget.style.borderColor = "rgba(78,158,255,0.3)";
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                              e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                              e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)";
                            }}
                          >
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                          </button>
                        )}

                        <span
                          style={{
                            fontSize: 18,
                            transform: expanded
                              ? "rotate(180deg)"
                              : "rotate(0deg)",
                            transition: "0.3s",
                          }}
                        >
                          ▼
                        </span>
                      </div>
                    </div>

                    {/* CONTENIDO EXPANDIDO */}
                    {expanded && (
                      <div
                        style={{
                          borderTop: "1px solid rgba(255,255,255,0.07)",
                          padding: 20,
                          display: "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(240px, 1fr))",
                          gap: 18,
                          background: "rgba(255,255,255,0.02)",
                        }}
                      >
                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>Código</p>
                          <strong>{op.codigo_oportunidad || "N/A"}</strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>Área</p>
                          <strong>{area?.area || "N/A"}</strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>
                            Probabilidad
                          </p>
                          <strong>{op.probabilidad_venta}</strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>
                            Responsable Comercial
                          </p>
                          <strong>
                            {respComercial?.nombre || "Sin asignar"}
                          </strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>
                            Responsable Técnico
                          </p>
                          <strong>
                            {respTecnico?.nombre || "Sin asignar"}
                          </strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>Contacto</p>
                          <strong>{op.nombre_contacto || "N/A"}</strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>Correo</p>
                          <strong>{op.correo_contacto || "N/A"}</strong>
                        </div>

                        <div>
                          <p style={{ opacity: 0.6, fontSize: 12 }}>Teléfono</p>
                          <strong>{op.numero_contacto || "N/A"}</strong>
                        </div>

                        <div
                          style={{
                            gridColumn: "1 / -1",
                          }}
                        >
                          <p style={{ opacity: 0.6, fontSize: 12 }}>
                            Descripción
                          </p>

                          <div
                            style={{
                              marginTop: 6,
                              padding: 14,
                              borderRadius: 10,
                              background: "rgba(255,255,255,0.03)",
                              lineHeight: 1.5,
                            }}
                          >
                            {op.descripcion || "Sin descripción"}
                          </div>
                        </div>
                        <div
                          style={{
                            gridColumn: "1 / -1",
                            borderTop: "1px solid rgba(255,255,255,0.06)",
                            paddingTop: 18,
                            marginTop: 6,
                          }}
                        >
                          <SeccionComentarios oportunidadId={op.id} />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
  };

  if (!user) return null;

  // 4. Renderizado principal
  return (
    <div className="dash-root">
      <Navbar user={user} />

      <div className="page-content">
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 28,
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <p className="eyebrow">Gestión Comercial</p>
            <h1
              className="page-title"
              style={{ fontSize: 32, marginBottom: 0 }}
            >
              Oportunidades
            </h1>
          </div>

          <button
            className={showForm ? "btn-secondary" : "btn-primary"}
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Cancelar" : "+ Nueva Oportunidad"}
          </button>
        </div>

        {error && (
          <div
            ref={errorRef}
            className="error-box"
            style={{
              marginBottom: 20,
              background: "#ff000022",
              border: "1px solid #ff4d4f",
              padding: 14,
              borderRadius: 10,
              color: "#fff",
              fontWeight: 500,
              scrollMarginTop: "120px",
              boxShadow: "0 0 10px rgba(255,0,0,0.2)",
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
          <div
            className="form-card"
            style={{ marginBottom: 32, border: "1px solid var(--accent)" }}
          >
            <h2
              style={{
                marginBottom: 20,
                fontSize: 18,
                borderBottom: "1px solid #333",
                paddingBottom: 10,
              }}
            >
              Ingreso de Oportunidad
            </h2>

            <form onSubmit={handleSubmit}>
              <h3
                style={{
                  fontSize: 14,
                  color: "var(--accent)",
                  marginTop: 20,
                  marginBottom: 15,
                }}
              >
                Datos del Cliente
              </h3>

              <div className="form-grid">
                <div className="form-group full">
                  <label className="field-label" htmlFor="nueva-op-cliente">Cliente Asociado *</label>
                  <select
                    id="nueva-op-cliente"
                    className="field-select"
                    value={form.cliente_id}
                    onChange={handleChange("cliente_id")}
                    required
                  >
                    <option value="">Seleccione un cliente...</option>
                    {clientes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.cliente}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-nombre-contacto">Nombre del Contacto</label>
                  <input
                    id="nueva-op-nombre-contacto"
                    className="field-input"
                    type="text"
                    value={form.nombre_contacto}
                    onChange={handleChange("nombre_contacto")}
                    placeholder="Ej: Juan Pérez"
                    pattern="^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$"
                    title="Ingrese solo letras"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-correo-contacto">Correo del Contacto</label>
                  <input
                    id="nueva-op-correo-contacto"
                    className="field-input"
                    type="email"
                    value={form.correo_contacto}
                    onChange={handleChange("correo_contacto")}
                    placeholder="juan@empresa.com"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-telefono-contacto">Teléfono del Contacto</label>
                  <input
                    id="nueva-op-telefono-contacto"
                    className="field-input"
                    type="tel"
                    value={form.numero_contacto}
                    onChange={handleChange("numero_contacto")}
                    placeholder="0999999999"
                    maxLength={10}
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: 14,
                  color: "var(--accent)",
                  marginTop: 30,
                  marginBottom: 15,
                }}
              >
                Datos de la Oportunidad
              </h3>

              <div className="form-grid">
                <div className="form-group full">
                  <label className="field-label" htmlFor="nueva-op-nombre">
                    Nombre de la Oportunidad *
                  </label>
                  <input
                    id="nueva-op-nombre"
                    className="field-input"
                    type="text"
                    value={form.nombre_oportunidad}
                    onChange={handleChange("nombre_oportunidad")}
                    required
                    minLength={5}
                    maxLength={150}
                    placeholder="Ej: Implementación de ERP"
                    title="Debe tener entre 5 y 150 caracteres"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-area">Área *</label>
                  <select
                    id="nueva-op-area"
                    className="field-select"
                    value={form.area_id}
                    onChange={handleChange("area_id")}
                    required
                  >
                    <option value="">Seleccione el área...</option>
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.area}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-codigo">Código (Opcional)</label>
                  <input
                    id="nueva-op-codigo"
                    className="field-input"
                    type="text"
                    value={form.codigo_oportunidad}
                    onChange={handleChange("codigo_oportunidad")}
                    placeholder="Ej: OP-2026-001"
                    pattern="^[A-Za-z0-9-]+$"
                    title="Solo letras, números y guiones"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-monto">Monto Estimado ($) *</label>
                  <input
                    id="nueva-op-monto"
                    className="field-input"
                    type="text"
                    inputMode="decimal"
                    value={form.monto_estimado}
                    onChange={handleChange("monto_estimado")}
                    required
                    placeholder="$0.00"
                  />
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-fase">Fase de Venta</label>
                  <select
                    id="nueva-op-fase"
                    className="field-select"
                    value={form.fase_venta}
                    onChange={handleChange("fase_venta")}
                  >
                    <option value="Prospección">Prospección</option>
                    <option value="Propuesta">Propuesta</option>
                    <option value="Negociación">Negociación</option>
                    <option value="Cerrada Ganada">Cerrada Ganada</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-probabilidad">Probabilidad</label>
                  <select
                    id="nueva-op-probabilidad"
                    className="field-select"
                    value={form.probabilidad_venta}
                    onChange={handleChange("probabilidad_venta")}
                  >
                    <option value="Alta">Alta</option>
                    <option value="Media">Media</option>
                    <option value="Baja">Baja</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-fecha-cierre">
                    Fecha de Cierre Esperada *
                  </label>
                  <input
                    id="nueva-op-fecha-cierre"
                    className="field-input"
                    type="date"
                    value={form.fecha_cierre_esperada}
                    onChange={handleChange("fecha_cierre_esperada")}
                    required
                    min={new Date().toISOString().split("T")[0]}
                  />
                </div>
              </div>

              <h3
                style={{
                  fontSize: 14,
                  color: "var(--accent)",
                  marginTop: 30,
                  marginBottom: 15,
                }}
              >
                Equipo Asignado
              </h3>

              <div className="form-grid">
                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-resp-comercial">Responsable Comercial</label>
                  <select
                    id="nueva-op-resp-comercial"
                    className="field-select"
                    value={form.resp_comercial_id}
                    onChange={handleChange("resp_comercial_id")}
                  >
                    <option value="">Sin asignar...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="field-label" htmlFor="nueva-op-resp-tecnico">Responsable Técnico</label>
                  <select
                    id="nueva-op-resp-tecnico"
                    className="field-select"
                    value={form.resp_tecnico_id}
                    onChange={handleChange("resp_tecnico_id")}
                  >
                    <option value="">Sin asignar...</option>
                    {usuarios.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nombre}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group full">
                  <label className="field-label" htmlFor="nueva-op-descripcion">Descripción Detallada</label>
                  <textarea
                    id="nueva-op-descripcion"
                    className="field-input"
                    style={{ minHeight: "80px", resize: "vertical" }}
                    value={form.descripcion}
                    onChange={handleChange("descripcion")}
                    placeholder="Detalles adicionales de la oportunidad..."
                    maxLength={1000}
                  />
                </div>
              </div>

              <div
                className="form-footer"
                style={{ marginTop: 24, textAlign: "right" }}
              >
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={loading}
                >
                  {loading ? <span className="spinner" /> : <IconSend />}
                  {loading ? " Guardando..." : " Guardar Oportunidad"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* BARRA DE BÚSQUEDA Y FILTROS */}
        <div style={{ 
            display: 'flex', 
            gap: 16, 
            marginBottom: 20, 
            alignItems: 'flex-end', 
            flexWrap: 'wrap', 
            background: 'rgba(255,255,255,0.02)', 
            padding: '16px 20px', 
            borderRadius: 12, 
            border: '1px solid rgba(255,255,255,0.05)' 
        }}>
            <div style={{ flex: 1, minWidth: 200 }}>
                <label className="field-label" htmlFor="filtro-cliente">Buscar por Cliente</label>
                <input
                    id="filtro-cliente"
                    className="field-input"
                    type="text"
                    placeholder="Escriba el nombre del cliente..."
                    value={filtroCliente}
                    onChange={(e) => setFiltroCliente(e.target.value)}
                />
            </div>
            <div style={{ flex: 1, minWidth: 200 }}>
                <label className="field-label" htmlFor="filtro-fase">Filtrar por Estado</label>
                <select
                    id="filtro-fase"
                    className="field-select"
                    value={filtroFase}
                    onChange={(e) => setFiltroFase(e.target.value)}
                >
                    <option value="">Todos los estados</option>
                    <option value="Prospección">Prospección</option>
                    <option value="Propuesta">Propuesta</option>
                    <option value="Negociación">Negociación</option>
                    <option value="Cerrada Ganada">Cerrada Ganada</option>
                </select>
            </div>
            {/* CA13.4: Botón de Limpiar Filtros */}
            <button
                className="btn-secondary"
                onClick={() => {
                    setFiltroCliente('');
                    setFiltroFase('');
                }}
                style={{ height: '42px', padding: '0 20px' }}
            >
                Limpiar Filtros
            </button>
        </div>

        <div className="form-card">
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {renderContenidoLista()}
          </div>
        </div>
      </div>

      {editingOportunidad && (
        <EditOportunidadModal
          oportunidad={editingOportunidad}
          clientes={clientes}
          usuarios={usuarios}
          areas={areas}
          onClose={() => setEditingOportunidad(null)}
          onSaved={handleOportunidadActualizada}
        />
      )}
    </div>
  );
};

export default Oportunidades;