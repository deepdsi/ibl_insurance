import client from './client';
import { Claim } from '../types';

export const submitClaim = async (data: any, files?: FileList) => {
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

  const response = await client.post<Claim>('/claims', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getClaims = async () => {
  const response = await client.get<Claim[]>('/claims');
  return response.data;
};

export const getClaim = async (claimId: string) => {
  const response = await client.get<Claim>(`/claims/${claimId}`);
  return response.data;
};

export const resubmitClaim = async (claimId: string, data: any, files?: FileList) => {
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

  const response = await client.put<Claim>(`/claims/${claimId}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const updateClaimStatus = async (claimId: string, status: string, reviewerNotes?: string, rejectionReason?: string) => {
  const response = await client.post<Claim>(`/claims/${claimId}/review`, {
    status,
    reviewerNotes,
    rejectionReason,
    changedBy: 'current-user', // This should be the logged-in user's ID
  });
  return response.data;
};
