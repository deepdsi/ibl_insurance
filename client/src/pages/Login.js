import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { login as apiLogin } from '../api/auth';
import { useAuth } from '../context/AuthContext';
import './Auth.css';
export default function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const { token, user } = await apiLogin(email, password);
            login(user, token);
            navigate(`/${user.role}/dashboard`);
        }
        catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("div", { className: "auth-container", children: _jsxs("div", { className: "auth-card", children: [_jsx("h1", { children: "IBL Insurance Claims" }), _jsxs("form", { onSubmit: handleSubmit, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Email" }), _jsx("input", { type: "email", value: email, onChange: (e) => setEmail(e.target.value), required: true, disabled: isLoading })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { children: "Password" }), _jsx("input", { type: "password", value: password, onChange: (e) => setPassword(e.target.value), required: true, disabled: isLoading })] }), error && _jsx("div", { className: "error-message", children: error }), _jsx("button", { type: "submit", disabled: isLoading, children: isLoading ? 'Logging in...' : 'Login' })] }), _jsxs("div", { className: "auth-footer", children: [_jsxs("p", { children: ["New provider? ", _jsx(Link, { to: "/register", children: "Register here" })] }), _jsx("p", { children: "Demo credentials:" }), _jsx("p", { children: "Provider: provider@example.com / pass123" }), _jsx("p", { children: "Reviewer: reviewer@example.com / pass123" }), _jsx("p", { children: "Admin: admin@example.com / pass123" })] })] }) }));
}
