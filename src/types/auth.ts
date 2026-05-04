export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: 'Admin' | 'Vendedor' | 'Gerente';
}

export interface LoginResponse {
  token: string;
  usuario: Usuario;
}