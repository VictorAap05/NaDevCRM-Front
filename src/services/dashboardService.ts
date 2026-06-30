import api from './api'; 

// NUEVO: Interfaz para los registros de auditoría
export interface AuditoriaLog {
    id: number;
    action: string;
    table_name: string;
    created_at: string;
    usuario_nombre: string | null;
}

// Actualizamos la interfaz del Admin
export interface AdminDashboardStats {
    usuariosActivos: number;
    clientesActivos: number;
    totalOportunidades: number;
    numeroAreas: number;
    ultimosCambios: AuditoriaLog[]; // Añadimos el array de auditoría
}

// ... (El resto del archivo queda exactamente igual con Jefe y Responsable) ...

// NUEVO: Interfaces alineadas con las fases de la base de datos
export interface JefeDashboardStats {
    prospeccion: number;
    propuesta: number;
    negociacion: number;
    ganadas: number;
}

export interface ResponsableDashboardStats {
    prospeccion: number;
    propuesta: number;
    negociacion: number;
    ganadas: number;
}

// Métodos del servicio
export const obtenerEstadisticasAdmin = async (): Promise<AdminDashboardStats> => {
    const response = await api.get<AdminDashboardStats>('/dashboard/admin');
    return response.data;
};

export const obtenerEstadisticasJefe = async (): Promise<JefeDashboardStats> => {
    const response = await api.get<JefeDashboardStats>('/dashboard/jefe');
    return response.data;
};

export const obtenerEstadisticasResponsable = async (): Promise<ResponsableDashboardStats> => {
    const response = await api.get<ResponsableDashboardStats>('/dashboard/responsable');
    return response.data;
};