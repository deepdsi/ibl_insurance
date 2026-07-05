import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getClaim, resubmitClaim } from '../api/claims';
import './Dashboard.css';
import './Forms.css';
export default function ProviderClaim() {
    const { claimId } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [files, setFiles] = useState(null);
    const [editForm, setEditForm] = useState({
        patientName: '',
        policyNumber: '',
        dateOfBirth: '',
        procedureName: '',
        procedureCode: '',
        dateOfService: '',
        lineItems: [{ description: '', quantity: 1, unitCost: 0 }],
    });
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
    useEffect(() => {
        if (!claim)
            return;
        setEditForm({
            patientName: claim.patientName,
            policyNumber: claim.policyNumber,
            dateOfBirth: claim.dateOfBirth,
            procedureName: claim.procedureName,
            procedureCode: claim.procedureCode,
            dateOfService: claim.dateOfService,
            lineItems: claim.lineItems.map((item) => ({ ...item })),
        });
    }, [claim]);
    const editable = claim && ['Rejected', 'Partially Approved'].includes(claim.status);
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setEditForm((prev) => ({ ...prev, [name]: value }));
    };
    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...editForm.lineItems];
        newLineItems[index] = { ...newLineItems[index], [field]: value };
        setEditForm((prev) => ({ ...prev, lineItems: newLineItems }));
    };
    const addLineItem = () => {
        setEditForm((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, { description: '', quantity: 1, unitCost: 0 }],
        }));
    };
    const removeLineItem = (index) => {
        setEditForm((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    };
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };
    const handleResubmit = async (e) => {
        e.preventDefault();
        if (!claimId)
            return;
        setSubmitError('');
        setIsSubmitting(true);
        try {
            const updated = await resubmitClaim(claimId, editForm, files || undefined);
            setClaim(updated);
            setIsEditing(false);
            setFiles(null);
        }
        catch (err) {
            setSubmitError(err.response?.data?.message || 'Failed to resubmit claim');
        }
        finally {
            setIsSubmitting(false);
        }
    };
    if (loading)
        return _jsx("p", { children: "Loading claim..." });
    if (!claim)
        return _jsx("p", { children: "Claim not found." });
    return (_jsxs("div", { className: "dashboard", children: [_jsxs("header", { className: "dashboard-header", children: [_jsxs("div", { children: [_jsx("h1", { children: "Claim Detail" }), _jsx("p", { className: "subheading", children: "Review the patient claim, coverage summary, and audit history." })] }), _jsxs("div", { children: [_jsx("button", { onClick: () => navigate('/provider/dashboard'), className: "secondary-btn", children: "Back" }), editable && !isEditing && (_jsx("button", { onClick: () => setIsEditing(true), className: "primary-btn", style: { marginLeft: 12 }, children: "Edit & Resubmit" }))] })] }), _jsxs("section", { className: "dashboard-content claim-detail", children: [_jsxs("div", { className: "claim-summary-grid", children: [_jsxs("div", { className: "claim-card", children: [_jsx("h2", { children: "Patient" }), _jsx("p", { className: "claim-label", children: "Name" }), _jsx("p", { className: "claim-value", children: claim.patientName }), _jsx("p", { className: "claim-label", children: "Policy" }), _jsxs("p", { className: "claim-value", children: ["#", claim.policyNumber] }), _jsx("p", { className: "claim-label", children: "Date of Birth" }), _jsx("p", { className: "claim-value", children: claim.dateOfBirth })] }), _jsxs("div", { className: "claim-card", children: [_jsx("h2", { children: "Procedure" }), _jsx("p", { className: "claim-value", children: claim.procedureName }), _jsxs("p", { className: "claim-value", children: ["Code: ", claim.procedureCode] }), _jsxs("p", { className: "claim-value", children: ["Date of Service: ", claim.dateOfService] }), _jsxs("p", { className: "claim-status", children: ["Status: ", _jsx("span", { className: `status-badge status-${claim.status.toLowerCase().replace(/\s+/g, '-')}`, children: claim.status })] })] })] }), !isEditing ? (_jsxs(_Fragment, { children: [_jsxs("div", { className: "claim-card", children: [_jsx("h2", { children: "Line Items" }), _jsxs("table", { className: "claims-table claim-detail-table", children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { children: "Description" }), _jsx("th", { children: "Qty" }), _jsx("th", { children: "Unit" }), _jsx("th", { children: "Subtotal" })] }) }), _jsx("tbody", { children: claim.lineItems.map((li, idx) => (_jsxs("tr", { children: [_jsx("td", { children: li.description }), _jsx("td", { children: li.quantity }), _jsxs("td", { children: ["$", li.unitCost.toFixed(2)] }), _jsxs("td", { children: ["$", (li.quantity * li.unitCost).toFixed(2)] })] }, idx))) })] })] }), _jsxs("div", { className: "claim-summary-grid", children: [_jsxs("div", { className: "claim-card", children: [_jsx("h2", { children: "Coverage Calculation" }), _jsxs("div", { className: "claim-stat", children: [_jsx("span", { children: "Total Amount Claimed:" }), _jsxs("strong", { children: ["$", claim.totalAmount.toFixed(2)] })] }), _jsxs("div", { className: "claim-stat", children: [_jsx("span", { children: "Covered Amount (80% after deductible):" }), _jsxs("strong", { children: ["$", claim.coveredAmount.toFixed(2)] })] }), _jsxs("div", { className: "claim-stat", children: [_jsx("span", { children: "Patient Responsibility:" }), _jsxs("strong", { children: ["$", claim.patientResponsibility.toFixed(2)] })] })] }), _jsxs("div", { className: "claim-card", children: [_jsx("h2", { children: "Supporting Documents" }), claim.supportingDocuments && claim.supportingDocuments.length ? (_jsx("ul", { className: "attachment-list", children: claim.supportingDocuments.map((fn) => (_jsx("li", { children: _jsx("a", { href: `/uploads/${fn}`, target: "_blank", rel: "noreferrer", children: fn }) }, fn))) })) : (_jsx("p", { children: "No documents uploaded." }))] })] }), _jsxs("div", { className: "claim-card claim-audit-card", children: [_jsx("h2", { children: "Audit Trail" }), claim.auditTrail && claim.auditTrail.length ? (_jsx("ul", { className: "audit-list", children: claim.auditTrail.map((a, i) => (_jsxs("li", { children: [_jsx("span", { className: "audit-time", children: new Date(a.timestamp).toLocaleString() }), _jsxs("span", { className: "audit-entry", children: [a.changedBy, ": ", a.action, " ", a.reason ? `(${a.reason})` : ''] })] }, i))) })) : (_jsx("p", { children: "No audit entries." }))] })] })) : (_jsxs("div", { className: "form-card", children: [_jsx("h2", { children: "Edit and Resubmit Claim" }), _jsxs("form", { onSubmit: handleResubmit, children: [_jsxs("section", { className: "form-section", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Patient Name *" }), _jsx("input", { type: "text", name: "patientName", value: editForm.patientName, onChange: handleInputChange, required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Policy Number *" }), _jsx("input", { type: "text", name: "policyNumber", value: editForm.policyNumber, onChange: handleInputChange, required: true, disabled: isSubmitting })] })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Date of Birth *" }), _jsx("input", { type: "date", name: "dateOfBirth", value: editForm.dateOfBirth, onChange: handleInputChange, required: true, disabled: isSubmitting })] }) })] }), _jsxs("section", { className: "form-section", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Procedure Name *" }), _jsx("input", { type: "text", name: "procedureName", value: editForm.procedureName, onChange: handleInputChange, required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Procedure Code *" }), _jsx("input", { type: "text", name: "procedureCode", value: editForm.procedureCode, onChange: handleInputChange, required: true, disabled: isSubmitting })] })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Date of Service *" }), _jsx("input", { type: "date", name: "dateOfService", value: editForm.dateOfService, onChange: handleInputChange, required: true, disabled: isSubmitting })] }) })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Line Items" }), editForm.lineItems.map((item, index) => (_jsxs("div", { className: "line-item-group", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description *" }), _jsx("input", { type: "text", value: item.description, onChange: (e) => handleLineItemChange(index, 'description', e.target.value), required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Quantity *" }), _jsx("input", { type: "number", min: "1", value: item.quantity, onChange: (e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value, 10)), required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Unit Cost *" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: item.unitCost, onChange: (e) => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value)), required: true, disabled: isSubmitting })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Subtotal" }), _jsx("input", { type: "text", value: `$${(item.quantity * item.unitCost).toFixed(2)}`, disabled: true })] })] }), editForm.lineItems.length > 1 && (_jsx("button", { type: "button", onClick: () => removeLineItem(index), className: "remove-btn", disabled: isSubmitting, children: "Remove" }))] }, index))), _jsx("button", { type: "button", onClick: addLineItem, className: "add-btn", disabled: isSubmitting, children: "+ Add Line Item" })] }), _jsx("section", { className: "form-section", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Upload Additional Documents" }), _jsx("input", { type: "file", multiple: true, accept: ".pdf,.png,.jpg,.jpeg", onChange: handleFileChange, disabled: isSubmitting })] }) }), submitError && _jsx("div", { className: "error-message", children: submitError }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", className: "cancel-btn", onClick: () => setIsEditing(false), disabled: isSubmitting, children: "Cancel" }), _jsx("button", { type: "submit", className: "submit-btn", disabled: isSubmitting, children: isSubmitting ? 'Resubmitting...' : 'Resubmit Claim' })] })] })] }))] })] }));
}
