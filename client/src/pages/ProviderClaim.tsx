import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim } from '../api/claims';
import { Claim } from '../types';
import './Dashboard.css';

export default function ProviderClaim() {
  const { claimId } = useParams();
  const navigate = useNavigate();
  const [claim, setClaim] = useState<Claim | null>(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <p>Loading claim...</p>;
  if (!claim) return <p>Claim not found.</p>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Claim Detail</h1>
        <button onClick={() => navigate('/provider/dashboard')} className="secondary-btn">Back</button>
      </header>

      <section className="dashboard-content">
        <h2>Patient</h2>
        <p><strong>{claim.patientName}</strong> — Policy #{claim.policyNumber}</p>

        <h3>Procedure</h3>
        <p>{claim.procedureName} ({claim.procedureCode}) — {claim.dateOfService}</p>

        <h3>Line Items</h3>
        <table className="claims-table">
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

        <h3>Coverage Calculation</h3>
        <p><strong>Total Amount Claimed:</strong> ${claim.totalAmount.toFixed(2)}</p>
        <p><strong>Covered Amount (80% after deductible):</strong> ${claim.coveredAmount.toFixed(2)}</p>
        <p><strong>Patient Responsibility:</strong> ${claim.patientResponsibility.toFixed(2)}</p>

        <h3>Supporting Documents</h3>
        {claim.supportingDocuments && claim.supportingDocuments.length ? (
          <ul>
            {claim.supportingDocuments.map((fn) => (
              <li key={fn}><a href={`/uploads/${fn}`} target="_blank" rel="noreferrer">{fn}</a></li>
            ))}
          </ul>
        ) : (
          <p>No documents uploaded.</p>
        )}

        <h3>Audit Trail</h3>
        {claim.auditTrail && claim.auditTrail.length ? (
          <ul>
            {claim.auditTrail.map((a, i) => (
              <li key={i}>{new Date(a.timestamp).toLocaleString()} — {a.changedBy}: {a.action} {a.reason ? `(${a.reason})` : ''}</li>
            ))}
          </ul>
        ) : (
          <p>No audit entries.</p>
        )}
      </section>
    </div>
  );
}
