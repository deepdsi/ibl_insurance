import React, { useState, useEffect } from 'react';
import { getClaims } from '../api/claims';
import { Claim } from '../types';
import './Dashboard.css';

export default function AdminDashboard() {
  const [claims, setClaims] = useState<Claim[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('today');

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

  const stats = {
    total: claims.length,
    approved: claims.filter((c) => c.status === 'Approved').length,
    rejected: claims.filter((c) => c.status === 'Rejected').length,
    pending: claims.filter((c) => ['Submitted', 'Under Review'].includes(c.status)).length,
    totalAmount: claims.reduce((sum, c) => sum + c.totalAmount, 0),
    totalApproved: claims
      .filter((c) => c.status === 'Approved')
      .reduce((sum, c) => sum + c.coveredAmount, 0),
  };

  const flaggedClaims = claims.filter((c) => c.totalAmount > 3000);

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <section className="dashboard-content">
        <div className="filter-bar">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Claims</div>
            <div className="stat-value">{stats.total}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.approved}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{stats.rejected}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pending}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Amount Claimed</div>
            <div className="stat-value">${stats.totalAmount.toFixed(0)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Approved Payout</div>
            <div className="stat-value">${stats.totalApproved.toFixed(0)}</div>
          </div>
        </div>

        <h2 style={{ marginTop: '40px' }}>Flagged Claims (Amount &gt; 3x average)</h2>
        {isLoading ? (
          <p>Loading flagged claims...</p>
        ) : flaggedClaims.length === 0 ? (
          <p>No flagged claims at this time.</p>
        ) : (
          <table className="claims-table">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Procedure</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Reason</th>
              </tr>
            </thead>
            <tbody>
              {flaggedClaims.map((claim) => (
                <tr key={claim._id} className="flagged">
                  <td>{claim.patientName}</td>
                  <td>{claim.procedureName}</td>
                  <td>${claim.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                      {claim.status}
                    </span>
                  </td>
                  <td>Exceeds average amount for procedure</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
