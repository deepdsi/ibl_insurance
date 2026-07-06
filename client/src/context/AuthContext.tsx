import React, { createContext, useCallback, useContext, useState, useEffect } from 'react';
import { AuthUser } from '../types';

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  login: (user: AuthUser, token: string) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getTokenExpiry(token: string) {
  try {
    const payload = JSON.parse(atob(token.split('.')[1])) as { exp?: number };
    return payload.exp ? payload.exp * 1000 : null;
  } catch (error) {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = (newUser: AuthUser, newToken: string) => {
    setUser(newUser);
    setToken(newToken);
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    const tokenExpiry = storedToken ? getTokenExpiry(storedToken) : null;

    if (storedToken && storedUser && (!tokenExpiry || tokenExpiry > Date.now())) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    } else if (storedToken || storedUser) {
      logout();
    }

    setIsLoading(false);
  }, [logout]);

  useEffect(() => {
    if (!token) return;

    const tokenExpiry = getTokenExpiry(token);
    if (!tokenExpiry) return;

    const timeout = tokenExpiry - Date.now();
    if (timeout <= 0) {
      logout();
      return;
    }

    const timeoutId = window.setTimeout(logout, timeout);
    return () => window.clearTimeout(timeoutId);
  }, [logout, token]);

  useEffect(() => {
    window.addEventListener('auth:logout', logout);
    return () => window.removeEventListener('auth:logout', logout);
  }, [logout]);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
