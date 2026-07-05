import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClaims } from '../api/claims';
import { Claim } from '../types';
import './Dashboard.css';
import { formatCurrency } from '../utils/currency';

export default function ReviewerDashboard() {
  const navigate = useNavigate();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filteredStatus, setFilteredStatus] = useState('all');

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

  const pendingClaims = claims.filter((c) => ['Submitted', 'Under Review'].includes(c.status));
  const displayClaims = filteredStatus === 'all' ? claims : claims.filter((c) => c.status === filteredStatus);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Reviewer Dashboard</h1>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-value">{pendingClaims.length}</div>
            <div className="stat-label">Pending Review</div>
          </div>
        </div>
      </header>

      <section className="dashboard-content">
        <div className="filter-bar">
          <label>Filter by Status:</label>
          <select value={filteredStatus} onChange={(e) => setFilteredStatus(e.target.value)}>
            <option value="all">All Claims</option>
            <option value="Submitted">Submitted</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {isLoading ? (
          <p>Loading claims...</p>
        ) : displayClaims.length === 0 ? (
          <p>No claims to display.</p>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Procedure</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Submitted</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {displayClaims.map((claim) => (
                <tr key={claim._id} className={pendingClaims.some((c) => c._id === claim._id) ? 'pending' : ''}>
                  <td>{claim.patientName}</td>
                  <td>{claim.procedureName}</td>
                  <td>{formatCurrency(claim.totalAmount)}</td>
                  <td>
                    <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>{new Date(claim.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button
                      onClick={() => navigate(`/reviewer/review/${claim._id}`)}
                      className="secondary-btn"
                    >
                      Review
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
