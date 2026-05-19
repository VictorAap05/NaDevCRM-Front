import api from './api'; 

export interface AuditLog {
    id: number;
    table_name: string;
    action: string;
    old_data: any | null;
    new_data: any | null;
    created_at: string;
    usuario_nombre: string | null;
    usuario_email: string | null;
}

export const obtenerAudit = async (): Promise<AuditLog[]> => {
    // Usamos 'api' en lugar de 'axios' directamente
    const response = await api.get<AuditLog[]>('/audit');
    return response.data;
};
