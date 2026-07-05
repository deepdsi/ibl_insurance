import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { getClaims } from '../api/claims';
import './Dashboard.css';
import { formatCurrency } from '../utils/currency';
export default function AdminDashboard() {
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [dateRange, setDateRange] = useState('today');
    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const data = await getClaims();
                setClaims(data);
            }
            catch (err) {
                console.error('Failed to fetch claims', err);
            }
            finally {
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
    return (_jsxs("div", { className: "dashboard", children: [_jsx("header", { className: "dashboard-header", children: _jsx("h1", { children: "Admin Dashboard" }) }), _jsxs("section", { className: "dashboard-content", children: [_jsxs("div", { className: "filter-bar", children: [_jsx("label", { children: "Date Range:" }), _jsxs("select", { value: dateRange, onChange: (e) => setDateRange(e.target.value), children: [_jsx("option", { value: "today", children: "Today" }), _jsx("option", { value: "week", children: "This Week" }), _jsx("option", { value: "month", children: "This Month" }), _jsx("option", { value: "custom", children: "Custom Range" })] })] }), _jsxs("div", { className: "stats-grid", children: [_jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Claims" }), _jsx("div", { className: "stat-value", children: stats.total })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Approved" }), _jsx("div", { className: "stat-value", children: stats.approved })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Rejected" }), _jsx("div", { className: "stat-value", children: stats.rejected })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Pending" }), _jsx("div", { className: "stat-value", children: stats.pending })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Amount Claimed" }), _jsx("div", { className: "stat-value", children: formatCurrency(stats.totalAmount) })] }), _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-label", children: "Total Approved Payout" }), _jsx("div", { className: "stat-value", children: formatCurrency(stats.totalApproved) })] })] }), _jsx("h2", { style: { marginTop: '40px' }, children: "Flagged Claims (Amount > 3x average)" }), isLoading ? (_jsx("p", { children: "Loading flagged claims..." })) : flaggedClaims.length === 0 ? (_jsx("p", { children: "No flagged claims at this time." })) : (_jsxs("table", { className: "claims-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Patient Name" }), _jsx("th", { children: "Procedure" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Reason" })] }) }), _jsx("tbody", { children: flaggedClaims.map((claim) => (_jsxs("tr", { className: "flagged", children: [_jsx("td", { children: claim.patientName }), _jsx("td", { children: claim.procedureName }), _jsx("td", { children: formatCurrency(claim.totalAmount) }), _jsx("td", { children: _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status }) }), _jsx("td", { children: "Exceeds average amount for procedure" })] }, claim._id))) })] }))] })] }));
}
