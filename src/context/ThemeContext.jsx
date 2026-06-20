import { createContext, useContext, useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'wrenchlogic_theme';
const LANG_KEY = 'wl_lang';

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

  // Global UI language (default Hebrew). Persisted, and drives the page dir.
  const [lang, setLang] = useState(() => {
    try {
      const stored = localStorage.getItem(LANG_KEY);
      // strip accidental JSON quotes (e.g. '"he"' → 'he')
      const clean = stored ? stored.replace(/^"|"$/g, '') : '';
      return clean === 'he' || clean === 'en' ? clean : 'he';
    } catch {
      return 'he';
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

  useEffect(() => {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch {
      // ignore storage failures (private mode, etc.)
    }
    document.documentElement.dir = lang === 'he' ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme, lang, setLang }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider');
  return ctx;
}
