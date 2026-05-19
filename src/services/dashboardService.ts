// Importa tu configuración de Axios si es necesario cuando conectes la API
// import api from './api';

// 1. Definimos la interfaz con las métricas solicitadas
export interface DashboardStats {
    totalOportunidades: number;
    oportunidadesPendientes: number;
    oportunidadesAprobadas: number;
    oportunidadesRechazadas: number;
}

// 2. Función para obtener las estadísticas
export const obtenerEstadisticasDashboard = async (): Promise<DashboardStats> => {
    /* ======================================================================
    CONEXIÓN REAL A LA API (Descomentar cuando el backend esté listo)
    ======================================================================
    const response = await api.get<DashboardStats>('/dashboard/stats');
    return response.data;
    */

    // VALORES QUEMADOS (MOCK DATA)
    // Simulamos un retraso de red de 500ms usando una Promesa
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                totalOportunidades: 20,
                oportunidadesPendientes: 15,
                oportunidadesAprobadas: 25,
                oportunidadesRechazadas: 8
            });
        }, 500);
    });
};