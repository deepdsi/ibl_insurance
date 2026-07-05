import client from './client';
import { AuthUser } from '../types';

export const register = async (fullName: string, email: string, password: string, role: string) => {
  const response = await client.post<{ user: AuthUser }>('/auth/register', {
    fullName,
    email,
    password,
    role,
  });
  return response.data;
};

export const login = async (email: string, password: string) => {
  const response = await client.post<{ token: string; user: AuthUser }>('/auth/login', {
    email,
    password,
  });
  return response.data;
};
