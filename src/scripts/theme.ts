import { DEFAULT_THEME, THEMES, THEME_KEY } from '../data/themes';

export const currentTheme = () => document.documentElement.dataset.theme || DEFAULT_THEME;

export const isTheme = (id: string) => THEMES.some((t) => t.id === id);

export function applyTheme(id: string) {
  if (!isTheme(id)) return false;
  document.documentElement.dataset.theme = id;
  try {
    localStorage.setItem(THEME_KEY, id);
  } catch {}
  document.dispatchEvent(new CustomEvent('themechange', { detail: id }));
  return true;
}
