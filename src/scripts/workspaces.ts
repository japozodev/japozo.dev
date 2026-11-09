// Las secciones se comportan como workspaces de Hyprland. En escritorio son las
// caras de un cubo que gira como el de Compiz; en móvil o con movimiento reducido
// se desliza la página en horizontal (View Transitions). Teclas 1-4 como Super+N.

export const WORKSPACES = ['inicio', 'proyectos', 'sobre-mi', 'contacto'];

// mismo criterio que el script inline de Base.astro
const CUBE_MQ = '(min-width: 900px) and (min-height: 560px) and (prefers-reduced-motion: no-preference)';
const SPIN_MS = 1100;

let current = 'inicio';
let turns = 0; // giros acumulados en cuartos de vuelta (el cubo no "rebobina")
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

const cubeOn = () => document.documentElement.classList.contains('cube');
const cubeEl = () => document.getElementById('cube');

const restTransform = (r: number, q: number) => `translateZ(${-r}px) rotateY(${-q * 90}deg)`;

// solo la cara visible es navegable; el resto queda inerte
const syncFaces = () => {
  WORKSPACES.forEach((id) => {
    const s = document.getElementById(id);
    if (!s) return;
    const off = cubeOn() && id !== current;
    s.toggleAttribute('inert', off);
    s.classList.toggle('is-front', cubeOn() && !off);
  });
};

// gira el cubo `delta` cuartos de vuelta: se aleja, rota y vuelve a pegarse a la pantalla
function spin(delta: number) {
  const cube = cubeEl();
  if (!cube) return;
  const r = cube.clientWidth / 2;
  const from = getComputedStyle(cube).transform;
  cube.getAnimations().forEach((a) => a.cancel());

  const startQ = turns;
  turns += delta;
  const zoom = r * (0.45 + 0.15 * Math.min(Math.abs(delta), 4));
  const html = document.documentElement;
  html.dataset.spin = '';
  const anim = cube.animate(
    [
      { transform: from === 'none' ? restTransform(r, startQ) : from },
      { transform: `translateZ(${-r - zoom}px) rotateY(${-startQ * 90}deg)`, offset: 0.22, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' },
      { transform: `translateZ(${-r - zoom}px) rotateY(${-turns * 90}deg)`, offset: 0.72, easing: 'cubic-bezier(0.3, 0, 0.1, 1)' },
      { transform: restTransform(r, turns) },
    ],
    { duration: SPIN_MS * (Math.abs(delta) > 1 ? 1.25 : 1), easing: 'cubic-bezier(0.45, 0, 0.2, 1)' },
  );
  cube.style.transform = restTransform(r, turns);
  anim.finished.then(() => delete html.dataset.spin, () => {});
}

const spinning = () => !!cubeEl()?.getAnimations().length;

// rueda del ratón: hace scroll dentro de la cara y, al llegar al borde, un gesto
// nuevo de rueda gira el cubo a la cara siguiente o anterior
function initWheel() {
  let last = 0;
  let armed = false;
  let acc = 0;
  document.getElementById('main')?.addEventListener(
    'wheel',
    (e) => {
      if (!cubeOn() || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
      const now = performance.now();
      const fresh = now - last > 220; // la rueda llevaba un rato quieta: gesto nuevo
      last = now;
      if (spinning()) {
        e.preventDefault();
        armed = false;
        return;
      }
      const face = document.getElementById(current);
      if (!face) return;
      const down = e.deltaY > 0;
      const atEdge = down ? face.scrollTop + face.clientHeight >= face.scrollHeight - 2 : face.scrollTop <= 0;
      if (!atEdge) {
        armed = false;
        acc = 0;
        return;
      }
      e.preventDefault();
      if (fresh) {
        armed = true;
        acc = 0;
      }
      if (!armed) return;
      acc += e.deltaY;
      if (Math.abs(acc) < 60) return;
      armed = false;
      acc = 0;
      const i = WORKSPACES.indexOf(current);
      goToSection(WORKSPACES[(i + (down ? 1 : 3)) % 4]);
    },
    { passive: false },
  );
}

// inclinación leve que sigue al ratón
function initTilt() {
  const tilt = document.getElementById('cube-tilt');
  if (!tilt) return;
  let frame = 0;
  addEventListener('pointermove', (e) => {
    if (!cubeOn() || e.pointerType !== 'mouse' || frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const x = e.clientX / innerWidth - 0.5;
      const y = e.clientY / innerHeight - 0.5;
      tilt.style.setProperty('--tilt-y', `${(x * 10).toFixed(2)}deg`);
      tilt.style.setProperty('--tilt-x', `${(-y * 6).toFixed(2)}deg`);
    });
  });
}

// una vuelta completa sin cambiar de workspace (comando `cube` de la terminal)
export function spinCube() {
  if (cubeOn()) spin(4);
}

export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from = WORKSPACES.indexOf(current);
  const to = WORKSPACES.indexOf(id);

  if (cubeOn() && to >= 0) {
    if (from === to) return;
    // camino más corto alrededor del cubo
    let delta = (to - from + 4) % 4;
    if (delta === 3) delta = -1;
    spin(delta);
    setCurrent(id);
    syncFaces();
    el.scrollTop = 0;
    el.focus({ preventScroll: true });
    return;
  }

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
  // modo cubo según el tamaño de pantalla; al cambiar se recoloca sin animación
  const mq = matchMedia(CUBE_MQ);
  const applyMode = () => {
    const html = document.documentElement;
    const was = cubeOn();
    html.classList.toggle('cube', mq.matches);
    const cube = cubeEl();
    if (cube) {
      cube.getAnimations().forEach((a) => a.cancel());
      turns = WORKSPACES.indexOf(current);
      cube.style.transform = mq.matches ? restTransform(cube.clientWidth / 2, turns) : '';
    }
    syncFaces();
    if (was && !mq.matches) document.getElementById(current)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  };
  mq.addEventListener('change', applyMode);
  applyMode();
  initWheel();
  initTilt();
  addEventListener('resize', () => {
    const cube = cubeEl();
    if (cube && cubeOn() && !cube.getAnimations().length) cube.style.transform = restTransform(cube.clientWidth / 2, turns);
  });

  // sección visible (solo en modo scroll; en el cubo manda el giro)
  const io = new IntersectionObserver(
    (entries) => !cubeOn() && entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
    { rootMargin: '-45% 0px -50% 0px' },
  );
  WORKSPACES.forEach((id) => {
    const s = document.getElementById(id);
    if (s) {
      s.tabIndex = -1;
      io.observe(s);
    }
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

  // 1-4 como Super+1..4 y flechas laterales para girar el cubo (fuera de campos de texto)
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (target instanceof Element && target.matches('input, textarea, [contenteditable]')) return;
    const i = WORKSPACES.indexOf(current);
    if (cubeOn() && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
      e.preventDefault();
      return goToSection(WORKSPACES[(i + (e.key === 'ArrowRight' ? 1 : 3)) % 4]);
    }
    const id = WORKSPACES[Number(e.key) - 1];
    if (id) goToSection(id);
  });
}
