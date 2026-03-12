import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as authService from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (storedToken) {
      setToken(storedToken);
    }

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }

    setLoading(false);
  }, []);

  const handleLogin = useCallback(async (credentials) => {
    const data = await authService.login(credentials);

    const nextToken = data?.token ?? null;
    setToken(nextToken);
    if (nextToken) {
      localStorage.setItem('token', nextToken);
    }

    const nextUser = {
      email: credentials.email,
    };
    setUser(nextUser);
    localStorage.setItem('user', JSON.stringify(nextUser));

    return data;
  }, []);

  const handleRegister = useCallback(async (payload) => {
    return authService.register(payload);
  }, []);

  const handleLogout = useCallback(async () => {
    await authService.logout();
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }, []);

  const value = {
    token,
    user,
    isAuthenticated: Boolean(token),
    loading,
    login: handleLogin,
    register: handleRegister,
    logout: handleLogout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth debe usarse dentro de AuthProvider');
  }
  return ctx;
};

