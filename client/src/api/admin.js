import client from './client';
export const getAdminUsers = async () => {
    const response = await client.get('/admin/users');
    return response.data;
};
export const updateAdminUserStatus = async (userId, isActive) => {
    const response = await client.patch(`/admin/users/${userId}/status`, { isActive });
    return response.data;
};
export const getAdminClaims = async () => {
    const response = await client.get('/admin/claims');
    return response.data;
};
