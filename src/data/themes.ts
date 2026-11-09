// Los colores viven en global.css bajo [data-theme="..."]
export const THEMES = [
  { id: 'japozo', label: 'japozo (verde)', swatch: '#35bf5c' },
  { id: 'dracula', label: 'Dracula', swatch: '#bd93f9' },
  { id: 'cyberpunk', label: 'Cyberpunk', swatch: '#fcee0a' },
  { id: 'gruvbox', label: 'Gruvbox', swatch: '#fabd2f' },
  { id: 'latte', label: 'Latte (claro)', swatch: '#40a02b' },
] as const;

export type ThemeId = (typeof THEMES)[number]['id'];
export const DEFAULT_THEME: ThemeId = 'japozo';
export const THEME_KEY = 'japozo-theme';
