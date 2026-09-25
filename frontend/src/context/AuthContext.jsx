import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('outreach_admin_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('outreach_admin_token');
      if (storedToken) {
        try {
          const res = await api.get('/api/auth/me');
          setAdmin(res.data);
          setToken(storedToken);
        } catch (err) {
          localStorage.removeItem('outreach_admin_token');
          localStorage.removeItem('outreach_admin_user');
          setAdmin(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    verifyToken();
  }, []);

  const login = async (email, password, rememberMe = false) => {
    const res = await api.post('/api/auth/login', {
      email,
      password,
      remember_me: rememberMe,
    });
    const { access_token, admin: adminData } = res.data;
    localStorage.setItem('outreach_admin_token', access_token);
    localStorage.setItem('outreach_admin_user', JSON.stringify(adminData));
    setToken(access_token);
    setAdmin(adminData);
    return adminData;
  };

  const logout = () => {
    localStorage.removeItem('outreach_admin_token');
    localStorage.removeItem('outreach_admin_user');
    setToken(null);
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
