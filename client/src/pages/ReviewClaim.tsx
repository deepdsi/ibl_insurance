import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../api/claims';
import { Claim } from '../types';
import './Forms.css';
import { formatCurrency } from '../utils/currency';

export default function ReviewClaim() {
  const { claimId } = useParams<{ claimId: string }>();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [status, setStatus] = useState('');
  const [reviewerNotes, setReviewerNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClaim = async () => {
      try {
        const claims = await getClaims();
        const found = claims.find((c) => c._id === claimId);
        if (found) {
          setClaim(found);
          setStatus(found.status);
        }
      } catch (err) {
        setError('Failed to load claim');
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaim();
  }, [claimId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      await updateClaimStatus(claimId!, status, reviewerNotes, rejectionReason);
      navigate('/reviewer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="form-container"><p>Loading claim...</p></div>;
  }

  if (!claim) {
    return <div className="form-container"><p>Claim not found</p></div>;
  }

  return (
    <div className="form-container">
      <div className="form-card">
        <h1>Review Claim</h1>
        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Claim Details</h2>
            <div className="readonly-group">
              <div className="readonly-field">
                <label>Patient Name</label>
                <p>{claim.patientName}</p>
              </div>
              <div className="readonly-field">
                <label>Policy No. (UIN)</label>
                <p>{claim.policyNumber}</p>
              </div>
            </div>
            <div className="readonly-group">
              <div className="readonly-field">
                <label>Procedure</label>
                <p>{claim.procedureName}</p>
              </div>
              <div className="readonly-field">
                <label>Procedure Code</label>
                <p>{claim.procedureCode}</p>
              </div>
            </div>
            <div className="readonly-group">
              <div className="readonly-field">
                <label>Date of Service</label>
                <p>{claim.dateOfService}</p>
              </div>
              <div className="readonly-field">
                <label>Total Amount</label>
                <p>{formatCurrency(claim.totalAmount)}</p>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Line Items</h2>
            <table className="line-items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th>Quantity</th>
                  <th>Unit Cost</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {claim.lineItems.map((item, index) => (
                  <tr key={index}>
                    <td>{item.description}</td>
                    <td>{item.quantity}</td>
                    <td>{formatCurrency(item.unitCost)}</td>
                    <td>{formatCurrency(item.quantity * item.unitCost)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>

          <section className="form-section">
            <h2>Coverage Calculation</h2>
            <div className="coverage-details">
              <div className="coverage-row">
                <span>Total Amount Claimed:</span>
                <strong>{formatCurrency(claim.totalAmount)}</strong>
              </div>
              <div className="coverage-row">
                <span>Covered Amount (80% after deductible):</span>
                <strong>{formatCurrency(claim.coveredAmount)}</strong>
              </div>
              <div className="coverage-row">
                <span>Patient Responsibility:</span>
                <strong>{formatCurrency(claim.patientResponsibility)}</strong>
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Review Decision</h2>
            <div className="form-group">
              <label>Status *</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} disabled={isSubmitting}>
                <option value="Submitted">Submitted</option>
                <option value="Under Review">Under Review</option>
                <option value="Approved">Approved</option>
                <option value="Partially Approved">Partially Approved</option>
                <option value="Rejected">Rejected</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="form-group">
              <label>Reviewer Notes</label>
              <textarea
                value={reviewerNotes}
                onChange={(e) => setReviewerNotes(e.target.value)}
                placeholder="Enter your review notes..."
                disabled={isSubmitting}
              />
            </div>
            {status === 'Rejected' && (
              <div className="form-group">
                <label>Rejection Reason *</label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this claim is rejected..."
                  required
                  disabled={isSubmitting}
                />
              </div>
            )}
          </section>

          <section className="form-section">
            <h2>Audit Trail</h2>
            <div className="audit-trail">
              {claim.auditTrail.map((entry, index) => (
                <div key={index} className="audit-entry">
                  <div className="audit-header">
                    <strong>{entry.action}</strong>
                    <span className="audit-time">{new Date(entry.timestamp).toLocaleString()}</span>
                  </div>
                  {entry.reason && <p className="audit-reason">{entry.reason}</p>}
                </div>
              ))}
            </div>
          </section>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/reviewer/dashboard')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="submit-btn">
              {isSubmitting ? 'Updating...' : 'Update Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
