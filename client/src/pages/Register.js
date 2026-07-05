import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import './Auth.css';
export default function Register() {
    const navigate = useNavigate();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setIsLoading(true);
        try {
            await apiRegister(fullName, email, password, 'provider');
            setSuccess('Provider registered successfully. You can now login.');
            setTimeout(() => navigate('/login'), 1200);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "Create Provider Account" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Full Name" }), _jsx("input", { type: "text", value: fullName, onChange: (e) => setFullName(e.target.value), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: isLoading })] }), error && _jsx("div", { className: "error-message", children: error }), success && _jsx("div", { className: "success-message", children: success }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Creating account...' : 'Register Provider' })] }), _jsx("div", { className: "auth-footer", children: _jsxs("p", { children: ["Already have an account? ", _jsx(Link, { to: "/login", children: "Login" })] }) })] }) }));
}
