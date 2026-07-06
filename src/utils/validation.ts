import { Response } from 'express';
import { z } from 'zod';

export const userRoleSchema = z.enum(['admin', 'reviewer', 'provider']);

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, 'Invalid id');

export const registerSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: userRoleSchema.default('provider'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Valid email is required').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const claimLineItemSchema = z.object({
  description: z.string().trim().min(1, 'Line item description is required'),
  quantity: z.coerce.number().int().positive('Quantity must be greater than 0'),
  unitCost: z.coerce.number().nonnegative('Unit cost cannot be negative'),
});

export const claimPayloadSchema = z.object({
  patientName: z.string().trim().min(1, 'Patient name is required'),
  policyNumber: z.string().trim().min(1, 'Policy number is required'),
  dateOfBirth: z.string().trim().min(1, 'Date of birth is required'),
  procedureName: z.string().trim().min(1, 'Procedure name is required'),
  procedureCode: z.string().trim().min(1, 'Procedure code is required'),
  dateOfService: z.string().trim().min(1, 'Date of service is required'),
  lineItems: z.array(claimLineItemSchema).min(1, 'At least one line item is required'),
});

export const reviewClaimSchema = z.object({
  status: z.enum(['Submitted', 'Under Review', 'Approved', 'Partially Approved', 'Rejected', 'Paid']),
  reviewerNotes: z.string().trim().optional(),
  rejectionReason: z.string().trim().optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'Rejected' && !data.rejectionReason) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['rejectionReason'],
      message: 'Rejection reason is required when rejecting a claim',
    });
  }
});

export const updateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export function sendValidationError(res: Response, error: z.ZodError) {
  return res.status(400).json({
    message: 'Validation failed',
    errors: error.flatten().fieldErrors,
  });
}
