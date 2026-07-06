import React, { useEffect, useMemo, useState } from 'react';
import { getAdminClaims, getAdminUsers, updateAdminUserStatus } from '../api/admin';
import { AdminUser, Claim } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import './Dashboard.css';

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { message?: string } } }).response;
    return response?.data?.message || fallback;
  }

  return fallback;
}

function getRoleLabel(role: AdminUser['role']) {
  if (role === 'reviewer') return 'Claims Reviewer';
  if (role === 'provider') return 'Provider/Patient';
  return 'Admin';
}

function getProviderName(providerId: Claim['providerId']) {
  if (typeof providerId === 'string') return providerId;
  return providerId.fullName || providerId.email;
}

function formatAuditActor(entry: Claim['auditTrail'][number]) {
  return entry.changedByFullName ? `${entry.changedByFullName} (${entry.changedBy})` : entry.changedBy;
}

function formatDate(value?: string) {
  if (!value) return 'Not recorded';
  return new Intl.DateTimeFormat('en-IN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

function getStartOfDay(date: Date) {
  const value = new Date(date);
  value.setHours(0, 0, 0, 0);
  return value;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('all');
  const [customStartDate, setCustomStartDate] = useState(toDateInputValue(new Date()));
  const [customEndDate, setCustomEndDate] = useState(toDateInputValue(new Date()));

  useEffect(() => {
    const loadDashboard = async () => {
      setIsLoading(true);
      setError('');

      try {
        const [usersData, claimsData] = await Promise.all([getAdminUsers(), getAdminClaims()]);
        setUsers(usersData);
        setClaims(claimsData);
        setSelectedClaimId(claimsData[0]?._id || null);
      } catch (err) {
        setError(getErrorMessage(err, 'Failed to load admin dashboard'));
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const filteredClaims = useMemo(() => {
    if (dateRange === 'all') {
      return claims;
    }

    const now = new Date();
    let start = getStartOfDay(now);
    let end = new Date(now);
    end.setHours(23, 59, 59, 999);

    if (dateRange === 'week') {
      start = getStartOfDay(now);
      const dayOfWeek = now.getDay();
      const daysSinceMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(now.getDate() - daysSinceMonday);
    }

    if (dateRange === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (dateRange === 'custom') {
      start = getStartOfDay(new Date(customStartDate));
      end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);

      if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return [];
      }
    }

    return claims.filter((claim) => {
      const submittedAt = new Date(claim.createdAt);
      return submittedAt >= start && submittedAt <= end;
    });
  }, [claims, dateRange, customStartDate, customEndDate]);

  const fraudFlagMap = useMemo(() => {
    const claimsByProcedure = claims.reduce<Record<string, Claim[]>>((groups, claim) => {
      const procedureCode = claim.procedureCode.trim().toUpperCase();
      groups[procedureCode] = [...(groups[procedureCode] || []), claim];
      return groups;
    }, {});

    return claims.reduce<Record<string, { isFlagged: boolean; averageAmount: number }>>((flags, claim) => {
      const procedureCode = claim.procedureCode.trim().toUpperCase();
      const matchingClaims = claimsByProcedure[procedureCode] || [];
      const peerClaims = matchingClaims.filter((item) => item._id !== claim._id);
      const comparisonClaims = peerClaims.length > 0 ? peerClaims : matchingClaims;
      const averageAmount = comparisonClaims.reduce((sum, item) => sum + item.totalAmount, 0) / comparisonClaims.length;

      flags[claim._id] = {
        averageAmount,
        isFlagged: peerClaims.length > 0 && claim.totalAmount > averageAmount * 3,
      };

      return flags;
    }, {});
  }, [claims]);

  const selectedClaim = useMemo(
    () => filteredClaims.find((claim) => claim._id === selectedClaimId) || filteredClaims[0] || null,
    [filteredClaims, selectedClaimId],
  );

  useEffect(() => {
    if (!filteredClaims.length) {
      setSelectedClaimId(null);
      return;
    }

    if (!filteredClaims.some((claim) => claim._id === selectedClaimId)) {
      setSelectedClaimId(filteredClaims[0]._id);
    }
  }, [filteredClaims, selectedClaimId]);

  const stats = {
    activeUsers: users.filter((account) => account.isActive).length,
    suspendedUsers: users.filter((account) => !account.isActive).length,
    totalClaims: filteredClaims.length,
    approvedClaims: filteredClaims.filter((claim) => ['Approved', 'Partially Approved', 'Paid'].includes(claim.status)).length,
    rejectedClaims: filteredClaims.filter((claim) => claim.status === 'Rejected').length,
    pendingClaims: filteredClaims.filter((claim) => ['Submitted', 'Under Review'].includes(claim.status)).length,
    totalAmount: filteredClaims.reduce((sum, claim) => sum + claim.totalAmount, 0),
    totalApprovedPayout: filteredClaims
      .filter((claim) => ['Approved', 'Partially Approved', 'Paid'].includes(claim.status))
      .reduce((sum, claim) => sum + claim.coveredAmount, 0),
    auditEvents: filteredClaims.reduce((sum, claim) => sum + claim.auditTrail.length, 0),
    flaggedClaims: filteredClaims.filter((claim) => fraudFlagMap[claim._id]?.isFlagged).length,
  };

  const handleStatusChange = async (account: AdminUser) => {
    setUpdatingUserId(account._id);
    setError('');

    try {
      const updatedUser = await updateAdminUserStatus(account._id, !account.isActive);
      setUsers((currentUsers) => currentUsers.map((item) => (item._id === updatedUser._id ? updatedUser : item)));
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to update account status'));
    } finally {
      setUpdatingUserId(null);
    }
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
      </header>

      <section className="dashboard-content admin-dashboard-content">
        {error && <div className="dashboard-alert">{error}</div>}

        <div className="filter-bar admin-filter-bar">
          <label>Date Range:</label>
          <select value={dateRange} onChange={(e) => setDateRange(e.target.value as typeof dateRange)}>
            <option value="all">All Claims</option>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="custom">Custom Range</option>
          </select>

          {dateRange === 'custom' && (
            <div className="custom-date-range">
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
              />
              <span>to</span>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">Total Claims Submitted</div>
            <div className="stat-value">{stats.totalClaims}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Approved</div>
            <div className="stat-value">{stats.approvedClaims}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Rejected</div>
            <div className="stat-value">{stats.rejectedClaims}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Pending</div>
            <div className="stat-value">{stats.pendingClaims}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Claim Amount</div>
            <div className="stat-value">{formatCurrency(stats.totalAmount)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Total Approved Payout</div>
            <div className="stat-value">{formatCurrency(stats.totalApprovedPayout)}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Fraud Flags</div>
            <div className="stat-value">{stats.flaggedClaims}</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Active / Suspended Accounts</div>
            <div className="stat-value">{stats.activeUsers} / {stats.suspendedUsers}</div>
          </div>
        </div>

        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Fraud Flags</h2>
            <span>Claims more than 3x the average for the same procedure code</span>
          </div>

          {isLoading ? (
            <p>Loading flagged claims...</p>
          ) : stats.flaggedClaims === 0 ? (
            <p>No fraud-flagged claims for this date range.</p>
          ) : (
            <div className="table-scroll">
              <table className="claims-table admin-table">
                <thead>
                  <tr>
                    <th>Patient</th>
                    <th>Procedure Code</th>
                    <th>Claim Amount</th>
                    <th>Procedure Avg.</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredClaims
                    .filter((claim) => fraudFlagMap[claim._id]?.isFlagged)
                    .map((claim) => (
                      <tr key={claim._id} className="flagged" onClick={() => setSelectedClaimId(claim._id)}>
                        <td>{claim.patientName}</td>
                        <td>{claim.procedureCode}</td>
                        <td>{formatCurrency(claim.totalAmount)}</td>
                        <td>{formatCurrency(fraudFlagMap[claim._id]?.averageAmount || 0)}</td>
                        <td>
                          <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>{formatDate(claim.createdAt)}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Users</h2>
            <span>{users.length} accounts</span>
          </div>

          {isLoading ? (
            <p>Loading users...</p>
          ) : (
            <div className="table-scroll">
              <table className="claims-table admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((account) => {
                    const isSelf = account._id === user?.id;
                    return (
                      <tr key={account._id}>
                        <td>{account.fullName}</td>
                        <td>{account.email}</td>
                        <td>{getRoleLabel(account.role)}</td>
                        <td>
                          <span className={`account-badge ${account.isActive ? 'account-active' : 'account-suspended'}`}>
                            {account.isActive ? 'Active' : 'Suspended'}
                          </span>
                        </td>
                        <td>{formatDate(account.createdAt)}</td>
                        <td>
                          <button
                            type="button"
                            className={`secondary-btn ${account.isActive ? 'danger-btn' : ''}`}
                            onClick={() => handleStatusChange(account)}
                            disabled={updatingUserId === account._id || (isSelf && account.isActive)}
                          >
                            {updatingUserId === account._id ? 'Updating...' : account.isActive ? 'Suspend' : 'Activate'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="admin-section">
          <div className="admin-section-header">
            <h2>Claims</h2>
            <span>Read-only platform view</span>
          </div>

          {isLoading ? (
            <p>Loading claims...</p>
          ) : filteredClaims.length === 0 ? (
            <p>No claims submitted for this date range.</p>
          ) : (
            <div className="admin-claims-layout">
              <div className="table-scroll">
                <table className="claims-table admin-table">
                  <thead>
                    <tr>
                      <th>Patient</th>
                      <th>Provider</th>
                      <th>Procedure</th>
                      <th>Amount</th>
                      <th>Fraud Flag</th>
                      <th>Status</th>
                      <th>Submitted</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredClaims.map((claim) => (
                      <tr
                        key={claim._id}
                        className={claim._id === selectedClaimId ? 'selected-row' : ''}
                        onClick={() => setSelectedClaimId(claim._id)}
                      >
                        <td>{claim.patientName}</td>
                        <td>{getProviderName(claim.providerId)}</td>
                        <td>{claim.procedureName}</td>
                        <td>{formatCurrency(claim.totalAmount)}</td>
                        <td>
                          {fraudFlagMap[claim._id]?.isFlagged ? (
                            <span className="fraud-badge">Flagged</span>
                          ) : (
                            <span className="clear-badge">Clear</span>
                          )}
                        </td>
                        <td>
                          <span className={`status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`}>
                            {claim.status}
                          </span>
                        </td>
                        <td>{formatDate(claim.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedClaim && (
                <aside className="claim-audit-panel">
                  <h3>Audit Trail</h3>
                  <div className="audit-claim-summary">
                    <strong>{selectedClaim.patientName}</strong>
                    <span>{selectedClaim.procedureCode} - {selectedClaim.procedureName}</span>
                    <span>{formatCurrency(selectedClaim.totalAmount)}</span>
                  </div>

                  <ul className="audit-list">
                    {selectedClaim.auditTrail.length === 0 ? (
                      <li>No audit events recorded.</li>
                    ) : (
                      selectedClaim.auditTrail.map((entry, index) => (
                        <li key={`${entry.timestamp}-${index}`}>
                          <span className="audit-time">{formatDate(entry.timestamp)}</span>
                          <span className="audit-entry">{entry.action}</span>
                          <span className="audit-meta">Changed by: {formatAuditActor(entry)}</span>
                          {entry.reason && <span className="audit-meta">Reason: {entry.reason}</span>}
                        </li>
                      ))
                    )}
                  </ul>
                </aside>
              )}
            </div>
          )}
        </section>
      </section>
    </div>
  );
}
