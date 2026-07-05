import mongoose, { Schema, Document, Types } from 'mongoose';

export type ClaimStatus = 'Submitted' | 'Under Review' | 'Approved' | 'Partially Approved' | 'Rejected' | 'Paid';

export interface IClaimLineItem {
  description: string;
  quantity: number;
  unitCost: number;
}

export interface IAuditEntry {
  changedBy: string;
  action: string;
  timestamp: Date;
  reason?: string;
}

export interface IClaim extends Document {
  providerId: Types.ObjectId | string;
  patientName: string;
  policyNumber: string;
  dateOfBirth: string;
  procedureName: string;
  procedureCode: string;
  dateOfService: string;
  lineItems: IClaimLineItem[];
  totalAmount: number;
  supportingDocuments: string[];
  status: ClaimStatus;
  reviewerNotes?: string;
  rejectionReason?: string;
  coveredAmount: number;
  patientResponsibility: number;
  auditTrail: IAuditEntry[];
}

const ClaimSchema = new Schema<IClaim>({
  providerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  patientName: { type: String, required: true, trim: true },
  policyNumber: { type: String, required: true, trim: true },
  dateOfBirth: { type: String, required: true },
  procedureName: { type: String, required: true, trim: true },
  procedureCode: { type: String, required: true, trim: true },
  dateOfService: { type: String, required: true },
  lineItems: [{
    description: { type: String, required: true },
    quantity: { type: Number, required: true },
    unitCost: { type: Number, required: true },
  }],
  totalAmount: { type: Number, required: true },
  supportingDocuments: [{ type: String }],
  status: { type: String, enum: ['Submitted', 'Under Review', 'Approved', 'Partially Approved', 'Rejected', 'Paid'], default: 'Submitted' },
  reviewerNotes: { type: String },
  rejectionReason: { type: String },
  coveredAmount: { type: Number, default: 0 },
  patientResponsibility: { type: Number, default: 0 },
  auditTrail: [{
    changedBy: { type: String, required: true },
    action: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    reason: { type: String },
  }],
}, { timestamps: true });

export default mongoose.model<IClaim>('Claim', ClaimSchema);
