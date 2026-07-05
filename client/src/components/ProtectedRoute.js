import { jsx as _jsx, Fragment as _Fragment } from "react/jsx-runtime";
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
export default function ProtectedRoute({ children, requiredRoles = [] }) {
    const { user, token, isLoading } = useAuth();
    if (isLoading) {
        return _jsx("div", { style: { padding: '40px', textAlign: 'center' }, children: "Loading..." });
    }
    if (!token || !user) {
        return _jsx(Navigate, { to: "/login" });
    }
    if (requiredRoles.length > 0 && !requiredRoles.includes(user.role)) {
        return _jsx(Navigate, { to: "/login" });
    }
    return _jsx(_Fragment, { children: children });
}
