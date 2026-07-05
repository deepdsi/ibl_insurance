import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitClaim } from '../api/claims';
import './Forms.css';
import { formatCurrency } from '../utils/currency';
export default function SubmitClaim() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        patientName: '',
        policyNumber: '',
        dateOfBirth: '',
        procedureName: '',
        procedureCode: '',
        dateOfService: '',
        lineItems: [{ description: '', quantity: 1, unitCost: 0 }],
    });
    const [files, setFiles] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };
    const handleLineItemChange = (index, field, value) => {
        const newLineItems = [...formData.lineItems];
        newLineItems[index] = { ...newLineItems[index], [field]: value };
        setFormData((prev) => ({ ...prev, lineItems: newLineItems }));
    };
    const addLineItem = () => {
        setFormData((prev) => ({
            ...prev,
            lineItems: [...prev.lineItems, { description: '', quantity: 1, unitCost: 0 }],
        }));
    };
    const removeLineItem = (index) => {
        setFormData((prev) => ({
            ...prev,
            lineItems: prev.lineItems.filter((_, i) => i !== index),
        }));
    };
    const handleFileChange = (e) => {
        setFiles(e.target.files);
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await submitClaim(formData, files || undefined);
            navigate('/provider/dashboard');
        }
        catch (err) {
            setError(err.response?.data?.message || 'Failed to submit claim');
        }
        finally {
            setIsLoading(false);
        }
    };
    const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);
    return (_jsx("div", { className: "form-container", children: _jsxs("div", { className: "form-card", children: [_jsx("h1", { children: "Submit Insurance Claim" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Patient Information" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Patient Name *" }), _jsx("input", { type: "text", name: "patientName", value: formData.patientName, onChange: handleInputChange, required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Policy No. (UIN) *" }), _jsx("input", { type: "text", name: "policyNumber", value: formData.policyNumber, onChange: handleInputChange, required: true, disabled: isLoading })] })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Date of Birth *" }), _jsx("input", { type: "date", name: "dateOfBirth", value: formData.dateOfBirth, onChange: handleInputChange, required: true, disabled: isLoading })] }) })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Procedure Information" }), _jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Procedure Name *" }), _jsx("input", { type: "text", name: "procedureName", value: formData.procedureName, onChange: handleInputChange, required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Procedure Code *" }), _jsx("input", { type: "text", name: "procedureCode", value: formData.procedureCode, onChange: handleInputChange, required: true, disabled: isLoading })] })] }), _jsx("div", { className: "form-row", children: _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Date of Service *" }), _jsx("input", { type: "date", name: "dateOfService", value: formData.dateOfService, onChange: handleInputChange, required: true, disabled: isLoading })] }) })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Line Items" }), formData.lineItems.map((item, index) => (_jsxs("div", { className: "line-item-group", children: [_jsxs("div", { className: "form-row", children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Description *" }), _jsx("input", { type: "text", value: item.description, onChange: (e) => handleLineItemChange(index, 'description', e.target.value), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Quantity *" }), _jsx("input", { type: "number", min: "1", value: item.quantity, onChange: (e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value)), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Unit Cost *" }), _jsx("input", { type: "number", min: "0", step: "0.01", value: item.unitCost, onChange: (e) => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value)), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Subtotal" }), _jsx("input", { type: "text", value: formatCurrency(item.quantity * item.unitCost), disabled: true })] })] }), formData.lineItems.length > 1 && (_jsx("button", { type: "button", onClick: () => removeLineItem(index), className: "remove-btn", disabled: isLoading, children: "Remove" }))] }, index))), _jsx("button", { type: "button", onClick: addLineItem, className: "add-btn", disabled: isLoading, children: "+ Add Line Item" }), _jsx("div", { className: "line-item-total", children: _jsxs("strong", { children: ["Total Amount: ", formatCurrency(totalAmount)] }) })] }), _jsxs("section", { className: "form-section", children: [_jsx("h2", { children: "Supporting Documents" }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Upload Documents (PDF, PNG, JPG)" }), _jsx("input", { type: "file", multiple: true, accept: ".pdf,.png,.jpg,.jpeg", onChange: handleFileChange, disabled: isLoading })] })] }), error && _jsx("div", { className: "error-message", children: error }), _jsxs("div", { className: "form-actions", children: [_jsx("button", { type: "button", onClick: () => navigate('/provider/dashboard'), className: "cancel-btn", children: "Cancel" }), _jsx("button", { type: "submit", disabled: isLoading, className: "submit-btn", children: isLoading ? 'Submitting...' : 'Submit Claim' })] })] })] }) }));
}
