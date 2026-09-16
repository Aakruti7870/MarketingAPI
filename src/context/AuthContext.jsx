import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'lumina360_user';
const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

function readStoredUser() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const stored = JSON.parse(raw);
    const issuedAt = Number(stored?.sessionIssuedAt || 0);
    if (!issuedAt || Date.now() - issuedAt >= SESSION_TTL_MS) {
      sessionStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return stored;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser);
  const [sessionChecked, setSessionChecked] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const validateSession = async () => {
      if (!user?.isAdmin) {
        if (!cancelled) setSessionChecked(true);
        return;
      }
      try {
        const response = await fetch('/api/auth/session', {
          method: 'GET',
          credentials: 'include',
          headers: user.sessionToken ? { Authorization: `Bearer ${user.sessionToken}` } : undefined,
        });
        if (!response.ok) {
          if (!cancelled) setUser(null);
          return;
        }
        const result = await response.json().catch(() => ({}));
        if (!result.authenticated) {
          if (!cancelled) setUser(null);
          return;
        }
        if (!cancelled) {
          setUser((current) => current ? {
            ...current,
            email: result.user?.email || current.email,
            name: result.user?.name || current.name,
            role: result.user?.role || current.role,
            sessionIssuedAt: Number(current.sessionIssuedAt || Date.now()),
          } : current);
        }
      } catch {
        // Do not destroy a valid browser session because of a transient network error.
      } finally {
        if (!cancelled) setSessionChecked(true);
      }
    };
    validateSession();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    try {
      if (user) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else sessionStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not persist browser session:', e);
    }
  }, [user]);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { success: false, message: 'Email and password are required.' };
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, password }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok || !result.success) return { success: false, message: result.message || 'Invalid email or password.' };

      const authenticatedUser = {
        email: result.user?.email || cleanEmail,
        name: result.user?.name || 'Super Admin',
        role: result.user?.role || 'SUPER_ADMIN',
        isAdmin: true,
        plan: result.user?.plan || 'Super Admin',
        credits: result.user?.credits ?? 0,
        isEverythingFree: result.user?.isEverythingFree === true,
        sessionToken: result.sessionToken,
        sessionIssuedAt: Date.now(),
      };
      setUser(authenticatedUser);
      setSessionChecked(true);
      return { success: true, user: authenticatedUser, message: result.message || 'Authenticated.' };
    } catch (error) {
      console.error('Authentication request failed:', error);
      return { success: false, message: 'Authentication service is unavailable. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
        headers: user?.sessionToken ? { Authorization: `Bearer ${user.sessionToken}` } : undefined,
      });
    } catch {
      // Local logout still completes if the server is unavailable.
    } finally {
      setUser(null);
      try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* ignore storage errors */ }
    }
  };

  const activateAdminPass = async () => ({
    success: false,
    message: 'Admin activation requires server authentication.',
  });

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin === true && sessionChecked,
        isEverythingFree: user?.isEverythingFree === true,
        login,
        logout,
        activateAdminPass,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
