import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getClaims } from '../api/claims';
import './Dashboard.css';
export default function ProviderDashboard() {
    const navigate = useNavigate();
    const [claims, setClaims] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
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
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsx("h1", { children: "Provider Dashboard" }), _jsx("button", { onClick: () => navigate('/provider/submit-claim'), className: "primary-btn", children: "+ Submit New Claim" })] }), _jsxs("section", { className: "dashboard-content", children: [_jsx("h2", { children: "My Claims" }), isLoading ? (_jsx("p", { children: "Loading claims..." })) : claims.length === 0 ? (_jsx("p", { children: "No claims submitted yet." })) : (_jsxs("table", { className: "claims-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Patient Name" }), _jsx("th", { children: "Policy #" }), _jsx("th", { children: "Procedure" }), _jsx("th", { children: "Amount" }), _jsx("th", { children: "Status" }), _jsx("th", { children: "Action" })] }) }), _jsx("tbody", { children: claims.map((claim) => (_jsxs("tr", { children: [_jsx("td", { children: claim.patientName }), _jsx("td", { children: claim.policyNumber }), _jsx("td", { children: claim.procedureName }), _jsxs("td", { children: ["$", claim.totalAmount.toFixed(2)] }), _jsx("td", { children: _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status }) }), _jsx("td", { children: _jsx("button", { onClick: () => navigate(`/provider/claim/${claim._id}`), className: "secondary-btn", children: "View" }) })] }, claim._id))) })] }))] })] }));
}
