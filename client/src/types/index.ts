export type UserRole = 'admin' | 'reviewer' | 'provider';

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface UserSummary {
  _id: string;
  fullName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
}

export interface AdminUser extends UserSummary {
  createdAt: string;
  updatedAt: string;
}

export interface ClaimLineItem {
  description: string;
  quantity: number;
  unitCost: number;
}

export interface Claim {
  _id: string;
  providerId: string | UserSummary;
  patientName: string;
  policyNumber: string;
  dateOfBirth: string;
  procedureName: string;
  procedureCode: string;
  dateOfService: string;
  lineItems: ClaimLineItem[];
  totalAmount: number;
  supportingDocuments: string[];
  status: 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Paid';
  reviewerNotes?: string;
  rejectionReason?: string;
  coveredAmount: number;
  patientResponsibility: number;
  auditTrail: Array<{
    changedBy: string;
    changedByFullName?: string;
    action: string;
    timestamp: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
