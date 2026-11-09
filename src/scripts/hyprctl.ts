// hyprctl de juguete: cambia variables CSS del "escritorio" en vivo

const root = () => document.documentElement.style;

const KEYWORDS: Record<string, { prop: string; min: number; max: number; unit: string; toCss?: (n: number) => string }> = {
  'decoration:rounding': { prop: '--radius', min: 0, max: 32, unit: 'px' },
  'general:border_size': { prop: '--win-border', min: 0, max: 8, unit: 'px' },
  'general:gaps_in': { prop: '--gaps', min: 0, max: 40, unit: 'px', toCss: (n) => `${n * 2}px` },
  'decoration:inactive_opacity': { prop: '--inactive-alpha', min: 0.2, max: 1, unit: '', toCss: (n) => `${Math.round(n * 100)}%` },
};

const USAGE = {
  es: `uso: hyprctl &lt;comando&gt;
  <span class="ok">clients</span>                                  lista las ventanas
  <span class="ok">keyword decoration:rounding</span> 0-32          radio de las esquinas
  <span class="ok">keyword general:border_size</span> 0-8           grosor del borde
  <span class="ok">keyword general:gaps_in</span> 0-20              separación entre ventanas
  <span class="ok">keyword decoration:inactive_opacity</span> 0.2-1 opacidad inactiva
  <span class="ok">reload</span>                                   vuelve a los valores por defecto`,
  en: `usage: hyprctl &lt;command&gt;
  <span class="ok">clients</span>                                  list windows
  <span class="ok">keyword decoration:rounding</span> 0-32          corner radius
  <span class="ok">keyword general:border_size</span> 0-8           border width
  <span class="ok">keyword general:gaps_in</span> 0-20              gaps between windows
  <span class="ok">keyword decoration:inactive_opacity</span> 0.2-1 inactive opacity
  <span class="ok">reload</span>                                   reset to defaults`,
};

export function hyprctl(args: string[], lang: 'es' | 'en'): string {
  const [sub, key, value] = args;
  switch (sub) {
    case 'keyword': {
      const k = KEYWORDS[key];
      const n = Number(value);
      if (!k || value === undefined || Number.isNaN(n)) return USAGE[lang];
      const v = Math.min(k.max, Math.max(k.min, n));
      root().setProperty(k.prop, k.toCss ? k.toCss(v) : `${v}${k.unit}`);
      return '<span class="ok">ok</span>';
    }
    case 'clients': {
      const wins = [...document.querySelectorAll<HTMLElement>('.tiles .window')];
      return wins
        .map((w, i) => {
          const title = w.querySelector('.window__title')?.textContent ?? '?';
          const cls = w.classList.contains('tile--btop') ? 'btop' : 'kitty';
          return `Window ${(0x5a1f00 + i * 0x2a).toString(16)} -&gt; ${title}:\n  class: ${cls}\n  workspace: 1\n  floating: 0\n  focused: ${w.matches(':focus-within') ? 1 : 0}`;
        })
        .join('\n\n');
    }
    case 'reload':
      Object.values(KEYWORDS).forEach((k) => root().removeProperty(k.prop));
      return '<span class="ok">ok</span>';
    case 'version':
      return 'Hyprland 0.52.0 (japozo.dev edition)';
    default:
      return USAGE[lang];
  }
}
