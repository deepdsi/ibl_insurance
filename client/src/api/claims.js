import client from './client';
export const submitClaim = async (data, files) => {
    const formData = new FormData();
    formData.append('patientName', data.patientName);
    formData.append('policyNumber', data.policyNumber);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('procedureName', data.procedureName);
    formData.append('procedureCode', data.procedureCode);
    formData.append('dateOfService', data.dateOfService);
    formData.append('lineItems', JSON.stringify(data.lineItems));
    if (files) {
        for (let i = 0; i < files.length; i++) {
            formData.append('documents', files[i]);
        }
    }
    const response = await client.post('/claims', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
export const getClaims = async () => {
    const response = await client.get('/claims');
    return response.data;
};
export const getClaim = async (claimId) => {
    const response = await client.get(`/claims/${claimId}`);
    return response.data;
};
export const resubmitClaim = async (claimId, data, files) => {
    const formData = new FormData();
    formData.append('patientName', data.patientName);
    formData.append('policyNumber', data.policyNumber);
    formData.append('dateOfBirth', data.dateOfBirth);
    formData.append('procedureName', data.procedureName);
    formData.append('procedureCode', data.procedureCode);
    formData.append('dateOfService', data.dateOfService);
    formData.append('lineItems', JSON.stringify(data.lineItems));
    if (files) {
        for (let i = 0; i < files.length; i++) {
            formData.append('documents', files[i]);
        }
    }
    const response = await client.put(`/claims/${claimId}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
};
export const updateClaimStatus = async (claimId, status, reviewerNotes, rejectionReason) => {
    const response = await client.post(`/claims/${claimId}/review`, {
        status,
        reviewerNotes,
        rejectionReason,
        changedBy: 'current-user', // This should be the logged-in user's ID
    });
    return response.data;
};
