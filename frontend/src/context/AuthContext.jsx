import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, unwrap } from '../lib/api.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
  try {
  const res = await api.get('/auth/me');
  setUser(unwrap(res));
  } catch {
  setUser(null);
  } finally {
  setLoading(false);
  }
  }, []);

  useEffect(() => {
  refresh();
  }, [refresh]);

  useEffect(() => {
  const onExpired = () => setUser(null);
  window.addEventListener('auth:expired', onExpired);
  return () => window.removeEventListener('auth:expired', onExpired);
  }, []);

  const login = useCallback(async (email, password) => {
  const res = await api.post('/auth/login', { email, password });
  const u = unwrap(res);
  setUser(u);
  return u;
  }, []);

  const signup = useCallback(async (payload) => {
  const res = await api.post('/auth/signup', payload);
  const u = unwrap(res);
  setUser(u);
  return u;
  }, []);

  const logout = useCallback(async () => {
  try {
  await api.post('/auth/logout');
  } catch {
  /* ignore */
  }
  setUser(null);
  }, []);

  const value = {
  user,
  loading,
  isCustomer: user?.role === 'customer',
  isSeller: user?.role === 'seller',
  isAdmin: user?.role === 'admin',
  login,
  signup,
  logout,
  setUser,
  refresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
