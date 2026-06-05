import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wrenchlogic_theme';

const ThemeContext = createContext(null);

// Apply the theme by toggling a class on <html>, which our light-mode CSS
// overrides in index.css hook into. Default is light.
function applyTheme(theme) {
  const root = document.documentElement;
  root.classList.toggle('light', theme === 'light');
  root.classList.toggle('dark', theme !== 'light');
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      // Default to light mode for first-time visitors; honour an explicit
      // stored 'dark' choice from a returning user.
      return localStorage.getItem(STORAGE_KEY) === 'dark' ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    applyTheme(theme);
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
  }, [theme]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
