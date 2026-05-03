/* eslint-disable react-refresh/only-export-components -- context files intentionally export hooks alongside components */
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Theme = 'light' | 'dark';

interface ThemeContextValue {
  theme: Theme;
  toggle: () => void;
}

const CreateThemeContext = createContext<ThemeContextValue | null>(null);

function readInitialTheme(): Theme {
  // The anti-flash inline script already set data-theme, read it directly
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'light' ? 'light' : 'dark';
}

export function ThemeContext({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(readInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('ss-theme', theme);
  }, [theme]);

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), []);

  return <CreateThemeContext value={{ theme, toggle }}>{children}</CreateThemeContext>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(CreateThemeContext);
  if (!ctx) throw new Error('useTheme must be used within <ThemeProvider>');
  return ctx;
}
