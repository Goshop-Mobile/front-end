'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AdminUser } from '@/types';
import { api, TokenStore } from '@/lib/api';

interface AuthContextValue {
  user: AdminUser | null;
  loading: boolean;
  login: (phone: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isModerator: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function decodeUser(token: string): AdminUser | null {
  try {
    // Simple base64 decode for JWT payload
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (!['admin', 'moderator'].includes(payload.role)) return null;
    return {
      user_id: payload.sub,
      role: payload.role,
      full_name: payload.full_name || 'Admin',
    };
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = TokenStore.getAccess();
    if (token) {
      const decoded = decodeUser(token);
      if (decoded) setUser(decoded);
      else TokenStore.clear();
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (phone: string, password: string) => {
    const { data } = await api.post('/auth/login', { phone, password });
    const decoded = decodeUser(data.access_token);
    if (!decoded) throw new Error('Accès réservé aux administrateurs et modérateurs');
    TokenStore.setTokens(data.access_token, data.refresh_token);
    setUser(decoded);
  }, []);

  const logout = useCallback(async () => {
    const refresh = TokenStore.getRefresh();
    try {
      if (refresh) await api.post('/auth/logout', { refresh_token: refresh });
    } finally {
      TokenStore.clear();
      setUser(null);
    }
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      isAdmin: user?.role === 'admin',
      isModerator: user?.role === 'moderator' || user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
