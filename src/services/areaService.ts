import api from './api';

export interface Area {
    id: string;
    area: string;
    fecha_creacion?: string;
}

export interface NuevaAreaDTO {
    area: string;
}

export const obtenerAreas = async (): Promise<Area[]> => {
    const response = await api.get<Area[]>('/areas');
    return response.data;
};

export const crearArea = async (area: NuevaAreaDTO): Promise<Area> => {
    const response = await api.post<Area>('/areas', area);
    return response.data;
};