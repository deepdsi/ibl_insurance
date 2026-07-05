import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';

import Login from './pages/Login';
import Register from './pages/Register';
import ProviderDashboard from './pages/ProviderDashboard';
import SubmitClaim from './pages/SubmitClaim';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ReviewClaim from './pages/ReviewClaim';
import AdminDashboard from './pages/AdminDashboard';
import ProviderClaim from './pages/ProviderClaim';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Provider Routes */}
          <Route
            path="/provider/dashboard"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <ProviderDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/claim/:claimId"
            element={
              <ProtectedRoute requiredRoles={["provider"]}>
                <ProviderClaim />
              </ProtectedRoute>
            }
          />
          <Route
            path="/provider/submit-claim"
            element={
              <ProtectedRoute requiredRoles={['provider']}>
                <SubmitClaim />
              </ProtectedRoute>
            }
          />

          {/* Reviewer Routes */}
          <Route
            path="/reviewer/dashboard"
            element={
              <ProtectedRoute requiredRoles={['reviewer', 'admin']}>
                <ReviewerDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/reviewer/review/:claimId"
            element={
              <ProtectedRoute requiredRoles={['reviewer', 'admin']}>
                <ReviewClaim />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute requiredRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
