import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { submitClaim } from '../api/claims';
import './Forms.css';

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
  const [files, setFiles] = useState<FileList | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLineItemChange = (index: number, field: string, value: any) => {
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

  const removeLineItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      lineItems: prev.lineItems.filter((_, i) => i !== index),
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await submitClaim(formData, files || undefined);
      navigate('/provider/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit claim');
    } finally {
      setIsLoading(false);
    }
  };

  const totalAmount = formData.lineItems.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  return (
    <div className="form-container">
      <div className="form-card">
        <h1>Submit Insurance Claim</h1>
        <form onSubmit={handleSubmit}>
          <section className="form-section">
            <h2>Patient Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Patient Name *</label>
                <input
                  type="text"
                  name="patientName"
                  value={formData.patientName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Policy Number *</label>
                <input
                  type="text"
                  name="policyNumber"
                  value={formData.policyNumber}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Birth *</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Procedure Information</h2>
            <div className="form-row">
              <div className="form-group">
                <label>Procedure Name *</label>
                <input
                  type="text"
                  name="procedureName"
                  value={formData.procedureName}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="form-group">
                <label>Procedure Code *</label>
                <input
                  type="text"
                  name="procedureCode"
                  value={formData.procedureCode}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Date of Service *</label>
                <input
                  type="date"
                  name="dateOfService"
                  value={formData.dateOfService}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>
          </section>

          <section className="form-section">
            <h2>Line Items</h2>
            {formData.lineItems.map((item, index) => (
              <div key={index} className="line-item-group">
                <div className="form-row">
                  <div className="form-group">
                    <label>Description *</label>
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleLineItemChange(index, 'description', e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Quantity *</label>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => handleLineItemChange(index, 'quantity', parseInt(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Unit Cost *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitCost}
                      onChange={(e) => handleLineItemChange(index, 'unitCost', parseFloat(e.target.value))}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="form-group">
                    <label>Subtotal</label>
                    <input type="text" value={`$${(item.quantity * item.unitCost).toFixed(2)}`} disabled />
                  </div>
                </div>
                {formData.lineItems.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeLineItem(index)}
                    className="remove-btn"
                    disabled={isLoading}
                  >
                    Remove
                  </button>
                )}
              </div>
            ))}
            <button type="button" onClick={addLineItem} className="add-btn" disabled={isLoading}>
              + Add Line Item
            </button>
            <div className="line-item-total">
              <strong>Total Amount: ${totalAmount.toFixed(2)}</strong>
            </div>
          </section>

          <section className="form-section">
            <h2>Supporting Documents</h2>
            <div className="form-group">
              <label>Upload Documents (PDF, PNG, JPG)</label>
              <input
                type="file"
                multiple
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                disabled={isLoading}
              />
            </div>
          </section>

          {error && <div className="error-message">{error}</div>}

          <div className="form-actions">
            <button type="button" onClick={() => navigate('/provider/dashboard')} className="cancel-btn">
              Cancel
            </button>
            <button type="submit" disabled={isLoading} className="submit-btn">
              {isLoading ? 'Submitting...' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
