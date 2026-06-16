import api from './api';

export interface Cliente {
    id: string;
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
    estado_activo: boolean;
    creado_por?: string;
    fecha_creacion?: string;
}

export interface NuevoClienteDTO {
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
}

export type FiltroEstado = 'activo' | 'inactivo' | 'todos';

export const obtenerClientes = async (estado: FiltroEstado = 'todos'): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes', { params: { estado } });
    return response.data;
};

export const crearCliente = async (cliente: NuevoClienteDTO): Promise<Cliente> => {
    const response = await api.post<Cliente>('/clientes', cliente);
    return response.data;
};

export const actualizarCliente = async (id: string, cliente: NuevoClienteDTO): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/clientes/${id}`, cliente);
    return response.data;
};

export const desactivarCliente = async (id: string): Promise<{ mensaje: string; cliente: Cliente }> => {
    const response = await api.delete(`/clientes/${id}`);
    return response.data;
};

export const reactivarCliente = async (id: string): Promise<{ mensaje: string; cliente: Cliente }> => {
    const response = await api.patch(`/clientes/${id}/reactivar`);
    return response.data;
};