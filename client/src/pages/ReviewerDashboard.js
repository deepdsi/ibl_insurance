import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClaims } from '../api/claims';
import './Dashboard.css';
import { formatCurrency } from '../utils/currency';
export default function ReviewerDashboard() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filteredStatus, setFilteredStatus] = useState('all');
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
    const pendingClaims = claims.filter((c) => ['Submitted', 'Under Review'].includes(c.status));
    const displayClaims = filteredStatus === 'all' ? claims : claims.filter((c) => c.status === filteredStatus);
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsx("h1", { children: "Reviewer Dashboard" }), _jsx("div", { className: "header-stats", children: _jsxs("div", { className: "stat-card", children: [_jsx("div", { className: "stat-value", children: pendingClaims.length }), _jsx("div", { className: "stat-label", children: "Pending Review" })] }) })] }), _jsxs("section", { className: "dashboard-content", children: [_jsxs("div", { className: "filter-bar", children: [_jsx("label", { children: "Filter by Status:" }), _jsxs("select", { value: filteredStatus, onChange: (e) => setFilteredStatus(e.target.value), children: [_jsx("option", { value: "all", children: "All Claims" }), _jsx("option", { value: "Submitted", children: "Submitted" }), _jsx("option", { value: "Under Review", children: "Under Review" }), _jsx("option", { value: "Approved", children: "Approved" }), _jsx("option", { value: "Rejected", children: "Rejected" })] })] }), isLoading ? (_jsx("p", { children: "Loading claims..." })) : displayClaims.length === 0 ? (_jsx("p", { children: "No claims to display." })) : (_jsxs("table", { className: "claims-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Patient Name" }), _jsx("th", { children: "Procedure" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Date Submitted" }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: displayClaims.map((claim) => (_jsxs("tr", { className: pendingClaims.some((c) => c._id === claim._id) ? 'pending' : '', children: [_jsx("td", { children: claim.patientName }), _jsx("td", { children: claim.procedureName }), _jsx("td", { children: formatCurrency(claim.totalAmount) }), _jsx("td", { children: _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status }) }), _jsx("td", { children: new Date(claim.createdAt).toLocaleDateString() }), _jsx("td", { children: _jsx("button", { onClick: () => navigate(`/reviewer/review/${claim._id}`), className: "secondary-btn", children: "Review" }) })] }, claim._id))) })] }))] })] }));
}
