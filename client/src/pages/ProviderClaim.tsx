import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim, resubmitClaim } from '../api/claims';
import { Claim } from '../types';
import './Dashboard.css';
import './Forms.css';

export default function ProviderClaim() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [files, setFiles] = useState<FileList | null>(null);
  const [editForm, setEditForm] = useState({
    patientName: '',
    policyNumber: '',
    dateOfBirth: '',
    procedureName: '',
    procedureCode: '',
    dateOfService: '',
    lineItems: [{ description: '', quantity: 1, unitCost: 0 }],
  });

  useEffect(() => {
    if (!claimId) return;
    const load = async () => {
      try {
        const data = await getClaim(claimId);
        setClaim(data);
      } catch (err) {
        console.error('Failed to load claim', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [claimId]);

  useEffect(() => {
    if (!claim) return;
    setEditForm({
      patientName: claim.patientName,
      policyNumber: claim.policyNumber,
      dateOfBirth: claim.dateOfBirth,
      procedureName: claim.procedureName,
      procedureCode: claim.procedureCode,
      dateOfService: claim.dateOfService,
      lineItems: claim.lineItems.map((item) => ({ ...item })),
    });
  }, [claim]);

  const editable = claim && ['Rejected', 'Partially Approved'].includes(claim.status);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
    const newLineItems = [...editForm.lineItems];
    newLineItems[index] = { ...newLineItems[index], [field]: value };
    setEditForm((prev) => ({ ...prev, lineItems: newLineItems }));
  };

  const addLineItem = () => {
    setEditForm((prev) => ({
      ...prev,
      lineItems: [...prev.lineItems, { description: '', quantity: 1, unitCost: 0 }],
    }));
  };

  const removeLineItem = (index: number) => {
    setEditForm((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleResubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimId) return;

    setSubmitError('');
    setIsSubmitting(true);

    try {
      const updated = await resubmitClaim(claimId, editForm, files || undefined);
      setClaim(updated);
      setIsEditing(false);
      setFiles(null);
    } catch (err: any) {
      setSubmitError(err.response?.data?.message || 'Failed to resubmit claim');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <p>Loading claim...</p>;
  if (!claim) return <p>Claim not found.</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>Claim Detail</h1>
          <p className="subheading">Review the patient claim, coverage summary, and audit history.</p>
        </div>
        <div>
          <button onClick={() => navigate('/provider/dashboard')} className="secondary-btn">
            Back
          </button>
          {editable && !isEditing && (
            <button onClick={() => setIsEditing(true)} className="primary-btn" style={{ marginLeft: 12 }}>
              Edit & Resubmit
            </button>
          )}
        </div>
      </header>

      <section className="dashboard-content claim-detail">
        <div className="claim-summary-grid">
          <div className="claim-card">
            <h2>Patient</h2>
            <p className="claim-label">Name</p>
            <p className="claim-value">{claim.patientName}</p>
            <p className="claim-label">Policy</p>
            <p className="claim-value">#{claim.policyNumber}</p>
            <p className="claim-label">Date of Birth</p>
            <p className="claim-value">{claim.dateOfBirth}</p>
          </div>

          <div className="claim-card">
            <h2>Procedure</h2>
            <p className="claim-value">{claim.procedureName}</p>
            <p className="claim-value">Code: {claim.procedureCode}</p>
            <p className="claim-value">Date of Service: {claim.dateOfService}</p>
            <p className="claim-status">Status: <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>{claim.status}</span></p>
          </div>
        </div>

        {!isEditing ? (
          <>
            <div className="claim-card">
              <h2>Line Items</h2>
              <table className="claims-table claim-detail-table">
                <thead>
                  <tr>
                    <th>Description</th>
                    <th>Qty</th>
                    <th>Unit</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {claim.lineItems.map((li, idx) => (
                    <tr key={idx}>
                      <td>{li.description}</td>
                      <td>{li.quantity}</td>
                      <td>${li.unitCost.toFixed(2)}</td>
                      <td>${(li.quantity * li.unitCost).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="claim-summary-grid">
              <div className="claim-card">
                <h2>Coverage Calculation</h2>
                <div className="claim-stat">
                  <span>Total Amount Claimed:</span>
                  <strong>${claim.totalAmount.toFixed(2)}</strong>
                </div>
                <div className="claim-stat">
                  <span>Covered Amount (80% after deductible):</span>
                  <strong>${claim.coveredAmount.toFixed(2)}</strong>
                </div>
                <div className="claim-stat">
                  <span>Patient Responsibility:</span>
                  <strong>${claim.patientResponsibility.toFixed(2)}</strong>
                </div>
              </div>

              <div className="claim-card">
                <h2>Supporting Documents</h2>
                {claim.supportingDocuments && claim.supportingDocuments.length ? (
                  <ul className="attachment-list">
                    {claim.supportingDocuments.map((fn) => (
                      <li key={fn}><a href={`/uploads/${fn}`} target="_blank" rel="noreferrer">{fn}</a></li>
                    ))}
                  </ul>
                ) : (
                  <p>No documents uploaded.</p>
                )}
              </div>
            </div>

            <div className="claim-card claim-audit-card">
              <h2>Audit Trail</h2>
              {claim.auditTrail && claim.auditTrail.length ? (
                <ul className="audit-list">
                  {claim.auditTrail.map((a, i) => (
                    <li key={i}>
                      <span className="audit-time">{new Date(a.timestamp).toLocaleString()}</span>
                      <span className="audit-entry">{a.changedBy}: {a.action} {a.reason ? `(${a.reason})` : ''}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>No audit entries.</p>
              )}
            </div>
          </>
        ) : (
          <div className="form-card">
            <h2>Edit and Resubmit Claim</h2>
            <form onSubmit={handleResubmit}>
              <section className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Patient Name *</label>
                    <input type="text" name="patientName" value={editForm.patientName} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                  <div className="form-group">
                    <label>Policy Number *</label>
                    <input type="text" name="policyNumber" value={editForm.policyNumber} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Birth *</label>
                    <input type="date" name="dateOfBirth" value={editForm.dateOfBirth} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <div className="form-row">
                  <div className="form-group">
                    <label>Procedure Name *</label>
                    <input type="text" name="procedureName" value={editForm.procedureName} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                  <div className="form-group">
                    <label>Procedure Code *</label>
                    <input type="text" name="procedureCode" value={editForm.procedureCode} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Date of Service *</label>
                    <input type="date" name="dateOfService" value={editForm.dateOfService} onChange={handleInputChange} required disabled={isSubmitting} />
                  </div>
                </div>
              </section>

              <section className="form-section">
                <h2>Line Items</h2>
                {editForm.lineItems.map((item, index) => (
                  <div className="line-item-group" key={index}>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Description *</label>
                        <input type="text" value={item.description} onChange={(e) => handleLineItemChange(index, 'description', e.target.value)} required disabled={isSubmitting} />
                      </div>
                      <div className="form-group">
                        <label>Quantity *</label>
                        <input type="number" min="1" value={item.quantity} onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value, 10))} required disabled={isSubmitting} />
                      </div>
                      <div className="form-group">
                        <label>Unit Cost *</label>
                        <input type="number" min="0" step="0.01" value={item.unitCost} onChange={(e) => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value))} required disabled={isSubmitting} />
                      </div>
                      <div className="form-group">
                        <label>Subtotal</label>
                        <input type="text" value={`$${(item.quantity * item.unitCost).toFixed(2)}`} disabled />
                      </div>
                    </div>
                    {editForm.lineItems.length > 1 && (
                      <button type="button" onClick={() => removeLineItem(index)} className="remove-btn" disabled={isSubmitting}>Remove</button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addLineItem} className="add-btn" disabled={isSubmitting}>+ Add Line Item</button>
              </section>

              <section className="form-section">
                <div className="form-group">
                  <label>Upload Additional Documents</label>
                  <input type="file" multiple accept=".pdf,.png,.jpg,.jpeg" onChange={handleFileChange} disabled={isSubmitting} />
                </div>
              </section>

              {submitError && <div className="error-message">{submitError}</div>}

              <div className="form-actions">
                <button type="button" className="cancel-btn" onClick={() => setIsEditing(false)} disabled={isSubmitting}>Cancel</button>
                <button type="submit" className="submit-btn" disabled={isSubmitting}>{isSubmitting ? 'Resubmitting...' : 'Resubmit Claim'}</button>
              </div>
            </form>
          </div>
        )}
      </section>
    </div>
  );
}
