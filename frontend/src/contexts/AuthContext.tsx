import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import WebApp from '@twa-dev/sdk';
import { authAPI, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  login: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const login = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get Telegram initData
      const initData = WebApp.initData;

      if (!initData) {
        throw new Error('Telegram WebApp initData not available');
      }

      // Store initData for API requests
      localStorage.setItem('tg_init_data', initData);

      // Authenticate with backend
      const response = await authAPI.login(initData);
      setUser(response.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('tg_init_data');
  };

  useEffect(() => {
    // Initialize Telegram WebApp
    WebApp.ready();
    WebApp.expand();

    // Try to restore session
    const initData = localStorage.getItem('tg_init_data');
    if (initData) {
      login();
    } else {
      // Auto-login when app opens
      login();
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, error, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
