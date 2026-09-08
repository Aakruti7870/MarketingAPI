import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const ThemeContext = createContext(null);
const STORAGE_KEY = "golde-theme";
const ALLOWED = new Set(["light", "dark", "system"]);

function initialTheme() {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return ALLOWED.has(saved) ? saved : "system";
  } catch {
    return "system";
  }
}

function systemDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(initialTheme);
  const [systemIsDark, setSystemIsDark] = useState(systemDark);
  const resolvedTheme = theme === "system" ? (systemIsDark ? "dark" : "light") : theme;

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!media) return undefined;
    const onChange = (event) => setSystemIsDark(event.matches);
    media.addEventListener?.("change", onChange);
    return () => media.removeEventListener?.("change", onChange);
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = resolvedTheme;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.style.colorScheme = resolvedTheme;
    try { window.localStorage.setItem(STORAGE_KEY, theme); } catch { /* local storage can be disabled */ }
  }, [theme, resolvedTheme]);

  const setTheme = (next) => {
    if (ALLOWED.has(next)) setThemeState(next);
  };

  const toggleTheme = () => setThemeState(resolvedTheme === "dark" ? "light" : "dark");

  const value = useMemo(
    () => ({ theme, resolvedTheme, setTheme, toggleTheme }),
    [theme, resolvedTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useTheme must be used inside ThemeProvider");
  return value;
}
