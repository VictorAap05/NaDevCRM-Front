import api from './api';
import type { LoginResponse } from '../types/auth';

export const loginUsuario = async (email: string, password: string): Promise<LoginResponse> => {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  return response.data;
};