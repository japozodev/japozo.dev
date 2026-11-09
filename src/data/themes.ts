// Los colores viven en global.css bajo [data-theme="..."]
export const THEMES = [
  { id: 'manjaro', label: 'Manjaro', swatch: '#35bf5c' },
  { id: 'tokyo', label: 'Tokyo Night', swatch: '#7aa2f7' },
  { id: 'gruvbox', label: 'Gruvbox', swatch: '#fabd2f' },
  { id: 'latte', label: 'Latte (claro)', swatch: '#40a02b' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'manjaro';
export const THEME_KEY = 'japozo-theme';
