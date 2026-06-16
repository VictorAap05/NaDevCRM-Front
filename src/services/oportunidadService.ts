import api from './api';

export interface OportunidadListItem {
    id: string;
    cliente_id: string;
    nombre_contacto?: string;
    correo_contacto?: string;
    numero_contacto?: string;
    area_id: string;
    nombre_oportunidad: string;
    codigo_oportunidad?: string;
    fase_venta: string;
    monto_estimado: number;
    probabilidad_venta: string;
    fecha_cierre_esperada: string;
    resp_comercial_id?: string;
    resp_tecnico_id?: string;
    descripcion?: string;
    creado_por?: string;
    estado_activo: boolean;
    fecha_creacion?: string;
}

export interface NuevaOportunidadDTO {
    cliente_id: string;
    nombre_contacto?: string;
    correo_contacto?: string;
    numero_contacto?: string;
    area_id: string;
    nombre_oportunidad: string;
    codigo_oportunidad?: string;
    fase_venta?: string;
    monto_estimado: number;
    probabilidad_venta?: string;
    fecha_cierre_esperada: string;
    resp_comercial_id?: string;
    resp_tecnico_id?: string;
    descripcion?: string;
    creado_por?: string;
}

export const obtenerOportunidades = async (): Promise<OportunidadListItem[]> => {
    const response = await api.get<OportunidadListItem[]>('/oportunidades');
    return response.data;
};

export const crearOportunidad = async (oportunidad: NuevaOportunidadDTO): Promise<OportunidadListItem> => {
    const response = await api.post<OportunidadListItem>('/oportunidades', oportunidad);
    return response.data;
};

export interface Comentario {
    comentario_id: string;
    contenido: string;
    fecha_creacion: string;
    usuario_id: string;
    usuario_nombre: string;
    usuario_rol: string;
}

export const obtenerComentarios = async (oportunidadId: string | number) => {
    const response = await api.get(`/oportunidades/${oportunidadId}/comentarios`);
    return response.data.comentarios;
};

export const crearComentario = async (oportunidadId: string | number, contenido: string) => {
    const response = await api.post(`/oportunidades/${oportunidadId}/comentarios`, { contenido });
    return response.data;
};