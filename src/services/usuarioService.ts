import api from './api';

export interface UserListItem {
    id: string;
    nombre: string;
    email: string;
    rol: string;
    cedula: string;
    telefono: string;
    areas: string;
    estado_activo: boolean;
}

export interface NuevoUsuarioDTO {
    nombre: string;
    email: string;
    password?: string;
    rol: string;
    cedula: string;
    telefono: string;
    areas: string;
}

export const obtenerUsuarios = async (): Promise<UserListItem[]> => {
    const response = await api.get<UserListItem[]>('/usuarios');
    return response.data;
};

export const crearUsuario = async (usuario: NuevoUsuarioDTO): Promise<UserListItem> => {
    const response = await api.post<UserListItem>('/usuarios', usuario);
    return response.data;
};