// Las secciones se comportan como workspaces de Hyprland: al saltar de una a otra
// la página se desliza en horizontal (View Transitions). Teclas 1-4 como Super+N.

export const WORKSPACES = ['inicio', 'proyectos', 'sobre-mi', 'contacto'];

let current = 'inicio';
const listeners = new Set<(id: string) => void>();

export const onWorkspaceChange = (fn: (id: string) => void) => {
  listeners.add(fn);
  fn(current);
};

const setCurrent = (id: string) => {
  if (id === current) return;
  current = id;
  listeners.forEach((fn) => fn(id));
};

export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from = WORKSPACES.indexOf(current);
  const to = WORKSPACES.indexOf(id);

  if (reduce || !document.startViewTransition || from === to || to < 0) {
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    return;
  }

  const html = document.documentElement;
  html.dataset.ws = to > from ? 'next' : 'prev';
  const vt = document.startViewTransition(() => {
    el.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
    setCurrent(id);
  });
  vt.finished.finally(() => delete html.dataset.ws);
}

export function initWorkspaces() {
  // sección visible
  const io = new IntersectionObserver(
    (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  WORKSPACES.forEach((id) => {
    const s = document.getElementById(id);
    if (s) io.observe(s);
  });

  // enlaces internos a secciones
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey) return;
    const a = (e.target as Element).closest<HTMLAnchorElement>('a[href^="#"]');
    const id = a?.getAttribute('href')?.slice(1);
    if (!id || !WORKSPACES.includes(id)) return;
    e.preventDefault();
    goToSection(id);
  });

  // 1-4 como Super+1..4 (fuera de campos de texto)
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (target instanceof Element && target.matches('input, textarea, [contenteditable]')) return;
    const id = WORKSPACES[Number(e.key) - 1];
    if (id) goToSection(id);
  });
}
