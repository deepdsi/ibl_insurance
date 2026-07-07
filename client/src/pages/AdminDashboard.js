import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAdminClaims, getAdminUsers, updateAdminUserStatus } from '../api/admin';
import { useAuth } from '../context/AuthContext';
import { formatCurrency } from '../utils/currency';
import './Dashboard.css';
function getErrorMessage(error, fallback) {
    if (typeof error === 'object' && error !== null && 'response' in error) {
        const response = error.response;
        return response?.data?.message || fallback;
    }
    return fallback;
}
function getRoleLabel(role) {
    if (role === 'reviewer')
        return 'Claims Reviewer';
    if (role === 'provider')
        return 'Provider/Patient';
    return 'Admin';
}
function getProviderName(providerId) {
    if (typeof providerId === 'string')
        return providerId;
    return providerId.fullName || providerId.email;
}
function formatAuditActor(entry) {
    return entry.changedByFullName ? `${entry.changedByFullName} (${entry.changedBy})` : entry.changedBy;
}
function formatDate(value) {
    if (!value)
        return 'Not recorded';
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    }).format(new Date(value));
}
function toDateInputValue(date) {
    return date.toISOString().slice(0, 10);
}
function getStartOfDay(date) {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
}
export default function AdminDashboard() {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [users, setUsers] = useState([]);
    const [claims, setClaims] = useState([]);
    const [selectedClaimId, setSelectedClaimId] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [updatingUserId, setUpdatingUserId] = useState(null);
    const [error, setError] = useState('');
    const [dateRange, setDateRange] = useState('all');
    const [customStartDate, setCustomStartDate] = useState(toDateInputValue(new Date()));
    const [customEndDate, setCustomEndDate] = useState(toDateInputValue(new Date()));
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    useEffect(() => {
        const loadDashboard = async () => {
            setIsLoading(true);
            setError('');
            try {
                const [usersData, claimsData] = await Promise.all([getAdminUsers(), getAdminClaims()]);
                setUsers(usersData);
                setClaims(claimsData);
                setSelectedClaimId(claimsData[0]?._id || null);
            }
            catch (err) {
                setError(getErrorMessage(err, 'Failed to load admin dashboard'));
            }
            finally {
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
        const claimsByProcedure = claims.reduce((groups, claim) => {
            const procedureCode = claim.procedureCode.trim().toUpperCase();
            groups[procedureCode] = [...(groups[procedureCode] || []), claim];
            return groups;
        }, {});
        return claims.reduce((flags, claim) => {
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
    const selectedClaim = useMemo(() => filteredClaims.find((claim) => claim._id === selectedClaimId) || filteredClaims[0] || null, [filteredClaims, selectedClaimId]);
    const filteredUsers = useMemo(() => (userRoleFilter === 'all' ? users : users.filter((account) => account.role === userRoleFilter)), [users, userRoleFilter]);
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
    const handleStatusChange = async (account) => {
        setUpdatingUserId(account._id);
        setError('');
        try {
            const updatedUser = await updateAdminUserStatus(account._id, !account.isActive);
            setUsers((currentUsers) => currentUsers.map((item) => (item._id === updatedUser._id ? updatedUser : item)));
        }
        catch (err) {
            setError(getErrorMessage(err, 'Failed to update account status'));
        }
        finally {
            setUpdatingUserId(null);
        }
    };
    const handleLogout = () => {
        logout();
        navigate('/login');
    };
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsx("h1", { children: "Admin Dashboard" }), _jsx("button", { onClick: handleLogout, className: "logout-btn", children: "Logout" })] }), _jsxs("section", { className: "dashboard-content admin-dashboard-content", children: [error && _jsx("div", { className: "dashboard-alert", children: error }), _jsxs("div", { className: "filter-bar admin-filter-bar", children: [_jsx("label", { children: "Date Range:" }), _jsxs("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), children: [_jsx("option", { value: "all", children: "All Claims" }), _jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "This Week" }), _jsx("option", { value: "month", children: "This Month" }), _jsx("option", { value: "custom", children: "Custom Range" })] }), dateRange === 'custom' && (_jsxs("div", { className: "custom-date-range", children: [_jsx("input", { type: "date", value: customStartDate, onChange: (e) => setCustomStartDate(e.target.value) }), _jsx("span", { children: "to" }), _jsx("input", { type: "date", value: customEndDate, onChange: (e) => setCustomEndDate(e.target.value) })] }))] }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Claims Submitted" }), _jsx("div", { className: "stat-value", children: stats.totalClaims })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Approved" }), _jsx("div", { className: "stat-value", children: stats.approvedClaims })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Rejected" }), _jsx("div", { className: "stat-value", children: stats.rejectedClaims })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Pending" }), _jsx("div", { className: "stat-value", children: stats.pendingClaims })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Claim Amount" }), _jsx("div", { className: "stat-value", children: formatCurrency(stats.totalAmount) })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Approved Payout" }), _jsx("div", { className: "stat-value", children: formatCurrency(stats.totalApprovedPayout) })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Fraud Flags" }), _jsx("div", { className: "stat-value", children: stats.flaggedClaims })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Active / Suspended Accounts" }), _jsxs("div", { className: "stat-value", children: [stats.activeUsers, " / ", stats.suspendedUsers] })] })] }), _jsxs("section", { className: "admin-section", children: [_jsxs("div", { className: "admin-section-header", children: [_jsx("h2", { children: "Fraud Flags" }), _jsx("span", { children: "Claims more than 3x the average for the same procedure code" })] }), isLoading ? (_jsx("p", { children: "Loading flagged claims..." })) : stats.flaggedClaims === 0 ? (_jsx("p", { children: "No fraud-flagged claims for this date range." })) : (_jsx("div", { className: "table-scroll", children: _jsxs("table", { className: "claims-table admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Patient" }), _jsx("th", { children: "Procedure Code" }), _jsx("th", { children: "Claim Amount" }), _jsx("th", { children: "Procedure Avg." }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Submitted" })] }) }), _jsx("tbody", { children: filteredClaims
                                                .filter((claim) => fraudFlagMap[claim._id]?.isFlagged)
                                                .map((claim) => (_jsxs("tr", { className: "flagged", onClick: () => setSelectedClaimId(claim._id), children: [_jsx("td", { children: claim.patientName }), _jsx("td", { children: claim.procedureCode }), _jsx("td", { children: formatCurrency(claim.totalAmount) }), _jsx("td", { children: formatCurrency(fraudFlagMap[claim._id]?.averageAmount || 0) }), _jsx("td", { children: _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status }) }), _jsx("td", { children: formatDate(claim.createdAt) })] }, claim._id))) })] }) }))] }), _jsxs("section", { className: "admin-section", children: [_jsxs("div", { className: "admin-section-header", children: [_jsx("h2", { children: "Users" }), _jsxs("div", { className: "admin-section-controls", children: [_jsxs("label", { children: ["Role:", _jsxs("select", { value: userRoleFilter, onChange: (e) => setUserRoleFilter(e.target.value), children: [_jsx("option", { value: "all", children: "All Roles" }), _jsx("option", { value: "provider", children: "Provider/Patient" }), _jsx("option", { value: "reviewer", children: "Claims Reviewer" }), _jsx("option", { value: "admin", children: "Admin" })] })] }), _jsxs("span", { children: [filteredUsers.length, " of ", users.length, " accounts"] })] })] }), isLoading ? (_jsx("p", { children: "Loading users..." })) : filteredUsers.length === 0 ? (_jsx("p", { children: "No users match this role filter." })) : (_jsx("div", { className: "table-scroll", children: _jsxs("table", { className: "claims-table admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Name" }), _jsx("th", { children: "Email" }), _jsx("th", { children: "Role" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Created" }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: filteredUsers.map((account) => {
                                                const isSelf = account._id === user?.id;
                                                return (_jsxs("tr", { children: [_jsx("td", { children: account.fullName }), _jsx("td", { children: account.email }), _jsx("td", { children: getRoleLabel(account.role) }), _jsx("td", { children: _jsx("span", { className: `account-badge ${account.isActive ? 'account-active' : 'account-suspended'}`, children: account.isActive ? 'Active' : 'Suspended' }) }), _jsx("td", { children: formatDate(account.createdAt) }), _jsx("td", { children: _jsx("button", { type: "button", className: `secondary-btn ${account.isActive ? 'danger-btn' : ''}`, onClick: () => handleStatusChange(account), disabled: updatingUserId === account._id || (isSelf && account.isActive), children: updatingUserId === account._id ? 'Updating...' : account.isActive ? 'Suspend' : 'Activate' }) })] }, account._id));
                                            }) })] }) }))] }), _jsxs("section", { className: "admin-section", children: [_jsxs("div", { className: "admin-section-header", children: [_jsx("h2", { children: "Claims" }), _jsx("span", { children: "Read-only platform view" })] }), isLoading ? (_jsx("p", { children: "Loading claims..." })) : filteredClaims.length === 0 ? (_jsx("p", { children: "No claims submitted for this date range." })) : (_jsxs("div", { className: "admin-claims-layout", children: [_jsx("div", { className: "table-scroll", children: _jsxs("table", { className: "claims-table admin-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Patient" }), _jsx("th", { children: "Provider" }), _jsx("th", { children: "Procedure" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Fraud Flag" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Submitted" })] }) }), _jsx("tbody", { children: filteredClaims.map((claim) => (_jsxs("tr", { className: claim._id === selectedClaimId ? 'selected-row' : '', onClick: () => setSelectedClaimId(claim._id), children: [_jsx("td", { children: claim.patientName }), _jsx("td", { children: getProviderName(claim.providerId) }), _jsx("td", { children: claim.procedureName }), _jsx("td", { children: formatCurrency(claim.totalAmount) }), _jsx("td", { children: fraudFlagMap[claim._id]?.isFlagged ? (_jsx("span", { className: "fraud-badge", children: "Flagged" })) : (_jsx("span", { className: "clear-badge", children: "Clear" })) }), _jsx("td", { children: _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status }) }), _jsx("td", { children: formatDate(claim.createdAt) })] }, claim._id))) })] }) }), selectedClaim && (_jsxs("aside", { className: "claim-audit-panel", children: [_jsx("h3", { children: "Audit Trail" }), _jsxs("div", { className: "audit-claim-summary", children: [_jsx("strong", { children: selectedClaim.patientName }), _jsxs("span", { children: [selectedClaim.procedureCode, " - ", selectedClaim.procedureName] }), _jsx("span", { children: formatCurrency(selectedClaim.totalAmount) })] }), _jsx("ul", { className: "audit-list", children: selectedClaim.auditTrail.length === 0 ? (_jsx("li", { children: "No audit events recorded." })) : (selectedClaim.auditTrail.map((entry, index) => (_jsxs("li", { children: [_jsx("span", { className: "audit-time", children: formatDate(entry.timestamp) }), _jsx("span", { className: "audit-entry", children: entry.action }), _jsxs("span", { className: "audit-meta", children: ["Changed by: ", formatAuditActor(entry)] }), entry.reason && _jsxs("span", { className: "audit-meta", children: ["Reason: ", entry.reason] })] }, `${entry.timestamp}-${index}`)))) })] }))] }))] })] })] }));
}
