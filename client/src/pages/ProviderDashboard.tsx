import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClaims } from '../api/claims';
import { Claim } from '../types';
import './Dashboard.css';
import { formatCurrency } from '../utils/currency';

export default function ProviderDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchClaims = async () => {
      try {
        const data = await getClaims();
        setClaims(data);
      } catch (err) {
        console.error('Failed to fetch claims', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClaims();
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Provider Dashboard</h1>
        <button onClick={() => navigate('/provider/submit-claim')} className="primary-btn">
          + Submit New Claim
        </button>
      </header>

      <section className="dashboard-content">
        <h2>My Claims</h2>
        {isLoading ? (
          <p>Loading claims...</p>
        ) : claims.length === 0 ? (
          <p>No claims submitted yet.</p>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Policy No. (UIN)</th>
                <th>Procedure</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {claims.map((claim) => (
                <tr key={claim._id}>
                  <td>{claim.patientName}</td>
                  <td>{claim.policyNumber}</td>
                  <td>{claim.procedureName}</td>
                  <td>{formatCurrency(claim.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>
                    <button
                      onClick={() => navigate(`/provider/claim/${claim._id}`)}
                      className="secondary-btn"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
