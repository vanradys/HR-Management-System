import { useState, useCallback } from 'react';
import type { AuthState, UserRole } from '../types/types';
import { getFromStorage, setToStorage } from './useLocalStorage';

const AUTH_KEY = 'hrptaa_auth';

const DEFAULT_AUTH: AuthState = {
  isLoggedIn: false,
  userId: '',
  name: '',
  email: '',
  role: 'Admin',
};

export function useAuth() {
  const [auth, setAuth] = useState<AuthState>(() => {
    return getFromStorage<AuthState>(AUTH_KEY, DEFAULT_AUTH);
  });

  const login = useCallback((name: string, email: string, role: UserRole = 'Admin') => {
    const newAuth: AuthState = { isLoggedIn: true, userId: 'EMP001', name, email, role };
    setAuth(newAuth);
    setToStorage(AUTH_KEY, newAuth);
  }, []);

  const logout = useCallback(() => {
    setAuth(DEFAULT_AUTH);
    setToStorage(AUTH_KEY, DEFAULT_AUTH);
  }, []);

  const updateRole = useCallback((role: UserRole) => {
    setAuth((prev) => {
      const next = { ...prev, role };
      setToStorage(AUTH_KEY, next);
      return next;
    });
  }, []);

  return { auth, login, logout, updateRole };
}
