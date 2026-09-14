import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const ADMIN_CREDENTIALS = {
  email: 'krushnabade54@gmail.com',
  password: 'Krushna@1208',
  name: 'Krushna Bade',
  role: 'SUPER_ADMIN',
  plan: 'Super Admin Lifetime (Everything Free)',
  credits: 999999,
  isEverythingFree: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lumina360_user');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Could not read user from localStorage', e);
    }
    // Default to Super Admin so Krushna Bade gets instant Everything Free access!
    return {
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      isAdmin: true,
      plan: ADMIN_CREDENTIALS.plan,
      credits: ADMIN_CREDENTIALS.credits,
      isEverythingFree: true,
    };
  });

  useEffect(() => {
    try {
      if (user) {
        localStorage.setItem('lumina360_user', JSON.stringify(user));
      } else {
        localStorage.removeItem('lumina360_user');
      }
    } catch (e) {
      console.warn('Could not write user to localStorage', e);
    }
  }, [user]);

  const login = (email, password) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    if (cleanEmail === ADMIN_CREDENTIALS.email.toLowerCase() && password === ADMIN_CREDENTIALS.password) {
      const adminUser = {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        isAdmin: true,
        plan: ADMIN_CREDENTIALS.plan,
        credits: ADMIN_CREDENTIALS.credits,
        isEverythingFree: true,
      };
      setUser(adminUser);
      return { success: true, user: adminUser, message: 'Super Admin Authenticated. Everything Free Access active!' };
    }

    // Standard demo or normal login
    const standardUser = {
      email: cleanEmail,
      name: cleanEmail.split('@')[0] || 'Member',
      role: 'USER',
      isAdmin: false,
      plan: 'Growth Pro',
      credits: 3500,
      isEverythingFree: false,
    };
    setUser(standardUser);
    return { success: true, user: standardUser, message: 'Welcome back!' };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('lumina360_user');
  };

  const activateAdminPass = () => {
    const adminUser = {
      email: ADMIN_CREDENTIALS.email,
      name: ADMIN_CREDENTIALS.name,
      role: ADMIN_CREDENTIALS.role,
      isAdmin: true,
      plan: ADMIN_CREDENTIALS.plan,
      credits: ADMIN_CREDENTIALS.credits,
      isEverythingFree: true,
    };
    setUser(adminUser);
    return adminUser;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin ?? (user?.role === 'SUPER_ADMIN'),
        isEverythingFree: user?.isEverythingFree ?? (user?.role === 'SUPER_ADMIN'),
        login,
        logout,
        activateAdminPass,
        ADMIN_CREDENTIALS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    // Fallback if rendered outside provider
    return {
      user: {
        email: ADMIN_CREDENTIALS.email,
        name: ADMIN_CREDENTIALS.name,
        role: ADMIN_CREDENTIALS.role,
        isAdmin: true,
        plan: ADMIN_CREDENTIALS.plan,
        credits: ADMIN_CREDENTIALS.credits,
        isEverythingFree: true,
      },
      isAdmin: true,
      isEverythingFree: true,
      login: () => {},
      logout: () => {},
      activateAdminPass: () => {},
      ADMIN_CREDENTIALS,
    };
  }
  return context;
}
