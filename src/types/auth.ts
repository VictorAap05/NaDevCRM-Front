export interface Usuario {
  id: string; // <-- El cambio clave para que acepte como lo tenías antes
  nombre: string;
  email: string;
  // Mantenemos el arreglo del rol que sí necesitábamos
  rol: 'Administrador' | 'Vendedor' | 'Gerente' | 'Jefe de Área' | 'Jefe de Area'; 
  areas?: string;
  estado_activo?: boolean;
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}