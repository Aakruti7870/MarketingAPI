import React, { createContext, useContext, useEffect, useState } from 'react';

const AuthContext = createContext(null);
const STORAGE_KEY = 'lumina360_user';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      else localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Could not persist session:', e);
    }
  }, [user]);

  const login = async (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !password) return { success: false, message: 'Email and password are required.' };
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
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
        plan: result.user?.plan || 'Super Admin Lifetime',
        credits: result.user?.credits ?? 999999,
        isEverythingFree: result.user?.isEverythingFree === true,
        sessionToken: result.sessionToken,
      };
      setUser(authenticatedUser);
      return { success: true, user: authenticatedUser, message: result.message || 'Authenticated.' };
    } catch (error) {
      console.error('Authentication request failed:', error);
      return { success: false, message: 'Authentication service is unavailable. Please try again.' };
    }
  };

  const logout = () => setUser(null);
  const activateAdminPass = async () => ({ success: false, message: 'Admin activation requires server authentication.' });

  return (
    <AuthContext.Provider value={{ user, isAdmin: user?.isAdmin === true, isEverythingFree: user?.isEverythingFree === true, login, logout, activateAdminPass }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
