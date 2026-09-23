import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { authApi } from '../api/services';
import { tokenStore } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMe = useCallback(async () => {
    if (!tokenStore.getAccess()) {
      setLoading(false);
      return;
    }
    try {
      const me = await authApi.me();
      setUser(me);
    } catch {
      tokenStore.clear();
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMe();
  }, [loadMe]);

  const login = async (email, password) => {
    const { user: u, accessToken, refreshToken } = await authApi.login({ email, password });
    tokenStore.set(accessToken, refreshToken);
    setUser(u);
    await loadMe();
    return u;
  };

  const register = async (payload) => {
    const { user: u, accessToken, refreshToken } = await authApi.register(payload);
    tokenStore.set(accessToken, refreshToken);
    setUser(u);
    await loadMe();
    return u;
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } catch {
      // ignore
    }
    tokenStore.clear();
    setUser(null);
  };

  const refreshProfile = async () => {
    const me = await authApi.me();
    setUser(me);
    return me;
  };

  return (
    <AuthContext.Provider
      value={{ user, setUser, loading, login, register, logout, refreshProfile }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
