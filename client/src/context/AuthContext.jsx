import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('walletwise_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [wallet, setWallet] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem('walletwise_token') || null);
  const [loading, setLoading] = useState(true);

  // Load user details and wallet on init or token change
  useEffect(() => {
    async function loadUserData() {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        if (res.success && res.user) {
          setUser(res.user);
          localStorage.setItem('walletwise_user', JSON.stringify(res.user));
          if (res.user.wallet) {
            setWallet(res.user.wallet);
          }
        }
      } catch (err) {
        console.warn('Session expired or invalid, logging out:', err.message);
        logout();
      } finally {
        setLoading(false);
      }
    }

    loadUserData();
  }, [token]);

  // Refresh wallet balance from DB
  const refreshWallet = async () => {
    try {
      const res = await api.getWallet();
      if (res.success && res.wallet) {
        setWallet(res.wallet);
        return res.wallet;
      }
    } catch (err) {
      console.error('Failed to refresh wallet:', err);
    }
    return null;
  };

  const login = async (email, password) => {
    const res = await api.login(email, password);
    if (res.success && res.token) {
      localStorage.setItem('walletwise_token', res.token);
      localStorage.setItem('walletwise_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      if (res.user.wallet) {
        setWallet(res.user.wallet);
      } else {
        await refreshWallet();
      }
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const register = async (fullName, email, password, phone) => {
    const res = await api.register(fullName, email, password, phone);
    if (res.success && res.token) {
      localStorage.setItem('walletwise_token', res.token);
      localStorage.setItem('walletwise_user', JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      if (res.user.wallet) {
        setWallet(res.user.wallet);
      }
      return res;
    }
    throw new Error(res.message || 'Registration failed');
  };

  const logout = async () => {
    try {
      if (token) await api.logout().catch(() => {});
    } finally {
      localStorage.removeItem('walletwise_token');
      localStorage.removeItem('walletwise_user');
      setToken(null);
      setUser(null);
      setWallet(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        wallet,
        token,
        loading,
        isAuthenticated: !!token && !!user,
        isAdmin: user?.role === 'ADMIN',
        login,
        register,
        logout,
        refreshWallet,
        setWallet,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
