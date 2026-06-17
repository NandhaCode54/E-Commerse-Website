import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AuthContext = createContext(null);

const AUTH_STORAGE_KEY = 'ecommerce_auth';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    if (stored) {
      try {
        const data = JSON.parse(stored);
        if (data.token && data.id) {
          setUser({
            id: data.id,
            name: data.name,
            email: data.email,
            role: data.role || 'USER',
            token: data.token,
          });
          localStorage.setItem('auth_token', data.token);
        }
      } catch (e) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem('auth_token');
      }
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await apiLogin(email, password);
    const userData = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role || 'USER',
      token: res.token,
    };
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem('auth_token', res.token);
    return userData;
  }, []);

  const register = useCallback(async (name, email, password, role = 'USER') => {
    const res = await apiRegister(name, email, password, role);
    const userData = {
      id: res.id,
      name: res.name,
      email: res.email,
      role: res.role || 'USER',
      token: res.token,
    };
    setUser(userData);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
    localStorage.setItem('auth_token', res.token);
    return userData;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    localStorage.removeItem('auth_token');
  }, []);

  const isAdmin = user?.role === 'ADMIN';

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    isAdmin,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
