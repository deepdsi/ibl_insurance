export interface AuthUser {
  id: string;
  email: string;
  role: 'admin' | 'reviewer' | 'provider';
}

export interface ClaimLineItem {
  description: string;
  quantity: number;
  unitCost: number;
}

export interface Claim {
  _id: string;
  providerId: string;
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
    action: string;
    timestamp: string;
    reason?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}
