import { useEffect, useState } from 'react';

/**
 * Dark/light theme controller. Writes the choice to <html data-theme>.
 * We intentionally keep it in memory only (no localStorage) — defaults to the
 * dark control-room look, with a toggle for light.
 */
export function useTheme() {
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, toggle };
}
