import client from './client';
import { AdminUser, Claim } from '../types';

export const getAdminUsers = async () => {
  const response = await client.get<AdminUser[]>('/admin/users');
  return response.data;
};

export const updateAdminUserStatus = async (userId: string, isActive: boolean) => {
  const response = await client.patch<AdminUser>(`/admin/users/${userId}/status`, { isActive });
  return response.data;
};

export const getAdminClaims = async () => {
  const response = await client.get<Claim[]>('/admin/claims');
  return response.data;
};
