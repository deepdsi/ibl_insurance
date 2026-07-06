import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaims, updateClaimStatus } from '../api/claims';
import './Forms.css';
import { formatCurrency } from '../utils/currency';
export default function ReviewClaim() {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [status, setStatus] = useState('');
    const [reviewerNotes, setReviewerNotes] = useState('');
    const [rejectionReason, setRejectionReason] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    useEffect(() => {
        const fetchClaim = async () => {
            try {
                const claims = await getClaims();
                const found = claims.find((c) => c._id === claimId);
                if (found) {
                    setClaim(found);
                    setStatus(found.status);
                }
            }
            catch (err) {
                setError('Failed to load claim');
            }
            finally {
                setIsLoading(false);
            }
        };
        fetchClaim();
    }, [claimId]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsSubmitting(true);
        try {
            await updateClaimStatus(claimId, status, reviewerNotes, rejectionReason);
            navigate('/reviewer/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to update claim');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (isLoading) {
        return _jsx("div", { className: "form-container", children: _jsx("p", { children: "Loading claim..." }) });
    }
    if (!claim) {
        return _jsx("div", { className: "form-container", children: _jsx("p", { children: "Claim not found" }) });
    }
    return (_jsx("div", { className: "form-container", children: _jsxs("div", { className: "form-card", children: [_jsx("h1", { children: "Review Claim" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Claim Details" }), _jsxs("div", { className: "readonly-group", children: [_jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Patient Name" }), _jsx("p", { children: claim.patientName })] }), _jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Policy No. (UIN)" }), _jsx("p", { children: claim.policyNumber })] })] }), _jsxs("div", { className: "readonly-group", children: [_jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Procedure" }), _jsx("p", { children: claim.procedureName })] }), _jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Procedure Code" }), _jsx("p", { children: claim.procedureCode })] })] }), _jsxs("div", { className: "readonly-group", children: [_jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Date of Service" }), _jsx("p", { children: claim.dateOfService })] }), _jsxs("div", { className: "readonly-field", children: [_jsx("label", { children: "Total Amount" }), _jsx("p", { children: formatCurrency(claim.totalAmount) })] })] })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Line Items" }), _jsxs("table", { className: "line-items-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Description" }), _jsx("th", { children: "Quantity" }), _jsx("th", { children: "Unit Cost" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: claim.lineItems.map((item, index) => (_jsxs("tr", { children: [_jsx("td", { children: item.description }), _jsx("td", { children: item.quantity }), _jsx("td", { children: formatCurrency(item.unitCost) }), _jsx("td", { children: formatCurrency(item.quantity * item.unitCost) })] }, index))) })] })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Coverage Calculation" }), _jsxs("div", { className: "coverage-details", children: [_jsxs("div", { className: "coverage-row", children: [_jsx("span", { children: "Total Amount Claimed:" }), _jsx("strong", { children: formatCurrency(claim.totalAmount) })] }), _jsxs("div", { className: "coverage-row", children: [_jsx("span", { children: "Covered Amount (80% after \u20B950,000 deductible, capped at \u20B95,00,000):" }), _jsx("strong", { children: formatCurrency(claim.coveredAmount) })] }), _jsxs("div", { className: "coverage-row", children: [_jsx("span", { children: "Patient Responsibility:" }), _jsx("strong", { children: formatCurrency(claim.patientResponsibility) })] })] })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Review Decision" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Status *" }), _jsxs("select", { value: status, onChange: (e) => setStatus(e.target.value), disabled: isSubmitting, children: [_jsx("option", { value: "Submitted", children: "Submitted" }), _jsx("option", { value: "Under Review", children: "Under Review" }), _jsx("option", { value: "Approved", children: "Approved" }), _jsx("option", { value: "Partially Approved", children: "Partially Approved" }), _jsx("option", { value: "Rejected", children: "Rejected" }), _jsx("option", { value: "Paid", children: "Paid" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Reviewer Notes" }), _jsx("textarea", { value: reviewerNotes, onChange: (e) => setReviewerNotes(e.target.value), placeholder: "Enter your review notes...", disabled: isSubmitting })] }), status === 'Rejected' && (_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Rejection Reason *" }), _jsx("textarea", { value: rejectionReason, onChange: (e) => setRejectionReason(e.target.value), placeholder: "Explain why this claim is rejected...", required: true, disabled: isSubmitting })] }))] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Audit Trail" }), _jsx("div", { className: "audit-trail", children: claim.auditTrail.map((entry, index) => (_jsxs("div", { className: "audit-entry", children: [_jsxs("div", { className: "audit-header", children: [_jsx("strong", { children: entry.action }), _jsx("span", { className: "audit-time", children: new Date(entry.timestamp).toLocaleString() })] }), entry.reason && _jsx("p", { className: "audit-reason", children: entry.reason })] }, index))) })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: () => navigate('/reviewer/dashboard'), className: "cancel-btn", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isSubmitting, className: "submit-btn", children: isSubmitting ? 'Updating...' : 'Update Claim' })] })] })] }) }));
}
