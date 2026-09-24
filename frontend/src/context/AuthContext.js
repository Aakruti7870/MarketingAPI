import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

function applyAuth(data, setUser) {
  const token = data?.tokens?.access_token || data?.token;
  if (token) localStorage.setItem("golde_token", token);
  setUser(data?.user || false);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const token = localStorage.getItem("golde_token");

  useEffect(() => {
    if (!token) {
      setUser(false);
      return;
    }
    api.get("/auth/me")
      .then((r) => setUser(r.data?.data || r.data))
      .catch(() => {
        localStorage.removeItem("golde_token");
        setUser(false);
      });
  }, [token]);

  const login = async (email, password) => {
    const { data: envelope } = await api.post("/auth/login", { email, password });
    const data = envelope?.data || envelope;
    applyAuth(data, setUser);
  };

  const register = async (payload) => {
    const names = String(payload.name || "").trim().split(/\s+/);
    const { data: envelope } = await api.post("/auth/register", {
      email: payload.email,
      password: payload.password,
      first_name: names[0] || "User",
      last_name: names.slice(1).join(" ") || "User",
      workspace_name: payload.workspace_name || undefined,
    });
    const data = envelope?.data || envelope;
    applyAuth(data, setUser);
  };

  const logout = () => {
    localStorage.removeItem("golde_token");
    setUser(false);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
