import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim } from '../api/claims';
import './Dashboard.css';
export default function ProviderClaim() {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        if (!claimId)
            return;
        const load = async () => {
            try {
                const data = await getClaim(claimId);
                setClaim(data);
            }
            catch (err) {
                console.error('Failed to load claim', err);
            }
            finally {
                setLoading(false);
            }
        };
        load();
    }, [claimId]);
    if (loading)
        return _jsx("p", { children: "Loading claim..." });
    if (!claim)
        return _jsx("p", { children: "Claim not found." });
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsx("h1", { children: "Claim Detail" }), _jsx("button", { onClick: () => navigate('/provider/dashboard'), className: "secondary-btn", children: "Back" })] }), _jsxs("section", { className: "dashboard-content", children: [_jsx("h2", { children: "Patient" }), _jsxs("p", { children: [_jsx("strong", { children: claim.patientName }), " \u2014 Policy #", claim.policyNumber] }), _jsx("h3", { children: "Procedure" }), _jsxs("p", { children: [claim.procedureName, " (", claim.procedureCode, ") \u2014 ", claim.dateOfService] }), _jsx("h3", { children: "Line Items" }), _jsxs("table", { className: "claims-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Description" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Unit" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: claim.lineItems.map((li, idx) => (_jsxs("tr", { children: [_jsx("td", { children: li.description }), _jsx("td", { children: li.quantity }), _jsxs("td", { children: ["$", li.unitCost.toFixed(2)] }), _jsxs("td", { children: ["$", (li.quantity * li.unitCost).toFixed(2)] })] }, idx))) })] }), _jsx("h3", { children: "Coverage Calculation" }), _jsxs("p", { children: [_jsx("strong", { children: "Total Amount Claimed:" }), " $", claim.totalAmount.toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "Covered Amount (80% after deductible):" }), " $", claim.coveredAmount.toFixed(2)] }), _jsxs("p", { children: [_jsx("strong", { children: "Patient Responsibility:" }), " $", claim.patientResponsibility.toFixed(2)] }), _jsx("h3", { children: "Supporting Documents" }), claim.supportingDocuments && claim.supportingDocuments.length ? (_jsx("ul", { children: claim.supportingDocuments.map((fn) => (_jsx("li", { children: _jsx("a", { href: `/uploads/${fn}`, target: "_blank", rel: "noreferrer", children: fn }) }, fn))) })) : (_jsx("p", { children: "No documents uploaded." })), _jsx("h3", { children: "Audit Trail" }), claim.auditTrail && claim.auditTrail.length ? (_jsx("ul", { children: claim.auditTrail.map((a, i) => (_jsxs("li", { children: [new Date(a.timestamp).toLocaleString(), " \u2014 ", a.changedBy, ": ", a.action, " ", a.reason ? `(${a.reason})` : ''] }, i))) })) : (_jsx("p", { children: "No audit entries." }))] })] }));
}
