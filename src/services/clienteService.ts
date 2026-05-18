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