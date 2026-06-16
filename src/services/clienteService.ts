import api from './api';

export interface Cliente {
    id: string;
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
    creado_por?: string;
    fecha_creacion?: string;
}

export interface NuevoClienteDTO {
    cliente: string;
    tipo: string;
    tipo_identificacion: string;
    identificacion: string;
}

export const obtenerClientes = async (): Promise<Cliente[]> => {
    const response = await api.get<Cliente[]>('/clientes');
    return response.data;
};

export const crearCliente = async (cliente: NuevoClienteDTO): Promise<Cliente> => {
    const response = await api.post<Cliente>('/clientes', cliente);
    return response.data;
};

// HU04 - CA04.1, CA04.3, CA04.4
export const actualizarCliente = async (id: string, cliente: NuevoClienteDTO): Promise<Cliente> => {
    const response = await api.put<Cliente>(`/clientes/${id}`, cliente);
    return response.data;
};

// HU04 - CA04.5, CA04.6, CA04.7
export interface RespuestaEliminarCliente {
    mensaje?: string;
    eliminado?: { id: string; cliente: string };
    error?: string;
    sugerencia?: string;
    tieneRegistrosAsociados?: boolean;
    totalOportunidades?: number;
}

export const eliminarCliente = async (id: string): Promise<RespuestaEliminarCliente> => {
    const response = await api.delete<RespuestaEliminarCliente>(`/clientes/${id}`);
    return response.data;
};