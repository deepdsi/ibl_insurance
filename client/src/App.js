import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import Login from './pages/Login';
import ProviderDashboard from './pages/ProviderDashboard';
import SubmitClaim from './pages/SubmitClaim';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ReviewClaim from './pages/ReviewClaim';
import AdminDashboard from './pages/AdminDashboard';
import ProviderClaim from './pages/ProviderClaim';
export default function App() {
    return (_jsx(BrowserRouter, { children: _jsx(AuthProvider, { children: _jsx(ErrorBoundary, { children: _jsxs(Routes, { children: [_jsx(Route, { path: "/login", element: _jsx(Login, {}) }), _jsx(Route, { path: "/provider/dashboard", element: _jsx(ProtectedRoute, { requiredRoles: ['provider'], children: _jsx(ProviderDashboard, {}) }) }), _jsx(Route, { path: "/provider/claim/:claimId", element: _jsx(ProtectedRoute, { requiredRoles: ["provider"], children: _jsx(ProviderClaim, {}) }) }), _jsx(Route, { path: "/provider/submit-claim", element: _jsx(ProtectedRoute, { requiredRoles: ['provider'], children: _jsx(SubmitClaim, {}) }) }), _jsx(Route, { path: "/reviewer/dashboard", element: _jsx(ProtectedRoute, { requiredRoles: ['reviewer', 'admin'], children: _jsx(ReviewerDashboard, {}) }) }), _jsx(Route, { path: "/reviewer/review/:claimId", element: _jsx(ProtectedRoute, { requiredRoles: ['reviewer', 'admin'], children: _jsx(ReviewClaim, {}) }) }), _jsx(Route, { path: "/admin/dashboard", element: _jsx(ProtectedRoute, { requiredRoles: ['admin'], children: _jsx(AdminDashboard, {}) }) }), _jsx(Route, { path: "/", element: _jsx(Navigate, { to: "/login" }) })] }) }) }) }));
}
