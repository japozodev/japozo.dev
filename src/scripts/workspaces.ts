// Las secciones se comportan como workspaces de Hyprland. Hay tres modos:
// - cubo (escritorio): caras de un cubo de verdad que gira como el de Compiz
// - swipe (móvil y tablet): cada cara ocupa la pantalla y se pasa deslizando; las
//   caras giran sobre su arista común al arrastrar el dedo (ver initSwipe)
// - página vertical de siempre, con movimiento reducido
// Teclas 1-4 como Super+N.

export const WORKSPACES = ['inicio', 'proyectos', 'sobre-mi', 'contacto'];

// mismo criterio que el script inline de Base.astro
const CUBE_MQ = '(min-width: 1100px) and (min-height: 560px)';
const MOTION_MQ = '(prefers-reduced-motion: no-preference)';
// mitad del lado del cubo en píxeles de diseño (--face en global.css)
const HALF = 360;

type Lid = 'top' | 'bottom' | null;

let current = 'inicio';
let lid: Lid = null;
// orientación del cubo en grados (y acumula vueltas, no "rebobina") y alejamiento en px
const rot = { x: 0, y: 0, z: 0 };
let raf = 0;
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

const html = document.documentElement;
const cubeOn = () => html.classList.contains('cube');
const swipeOn = () => html.classList.contains('swipe');
const cubeEl = () => document.getElementById('cube');
const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
const mod4 = (n: number) => ((n % 4) + 4) % 4;

// Giro de las caras en modo swipe. Las caras van apiladas y `pos` dice qué cara se
// ve (0-3, con decimales mientras se arrastra o se anima). p es la posición de cada
// cara respecto a la pantalla (0 encajada, 1 a la derecha, -1 a la izquierda): pivota
// sobre la arista que comparte con la vecina y una sombra la oscurece al ponerse de
// canto (un filtro en toda la sección iba a tirones en móvil). La perspectiva va
// dentro del transform y centrada en la pantalla porque Safari la desplaza.
const PERSPECTIVE = 900;
let pos = 0;
let swipeRaf = 0;
let swipeAnim = 0;
const swipeFaces = () => {
  swipeRaf = 0;
  const w = cubeEl()?.clientWidth || 1;
  WORKSPACES.forEach((id, i) => {
    const s = document.getElementById(id);
    if (!s) return;
    const shade = s.parentElement?.querySelector<HTMLElement>('.face__shade');
    if (!swipeOn()) {
      s.style.transform = s.style.visibility = '';
      return;
    }
    const p = clamp(i - pos, -1, 1);
    const edge = p > 0 ? -w / 2 : w / 2;
    const tf = p === 0 ? '' : `perspective(${PERSPECTIVE}px) translateX(${p * w + edge}px) rotateY(${p * 90}deg) translateX(${-edge}px)`;
    const vis = Math.abs(p) >= 1 ? 'hidden' : '';
    s.style.transform = tf;
    s.style.visibility = vis;
    if (shade) {
      shade.style.transform = tf;
      shade.style.visibility = vis;
      shade.style.opacity = (0.7 * Math.abs(p)).toFixed(3);
    }
  });
};
const queueSwipeFaces = () => {
  if (!swipeRaf) swipeRaf = requestAnimationFrame(swipeFaces);
};

// lleva el giro hasta la cara `to` frenando al final
function settle(to: number) {
  cancelAnimationFrame(swipeAnim);
  setCurrent(WORKSPACES[to]);
  const from = pos;
  const ms = clamp(Math.abs(to - from) * 420, 160, 700);
  const t0 = performance.now();
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / ms);
    pos = from + (to - from) * (1 - (1 - t) ** 3);
    swipeFaces();
    swipeAnim = t < 1 ? requestAnimationFrame(step) : 0;
  };
  swipeAnim = requestAnimationFrame(step);
}

// deslizar con el dedo. El navegador solo se queda el desplazamiento vertical
// (touch-action: pan-y en swipe.css), así que cada gesto es o scroll de la cara o
// giro, nunca las dos cosas. Un giro no cuenta como toque: no abre la tarjeta que
// hubiera debajo del dedo.
function initSwipe() {
  const scroller = cubeEl();
  if (!scroller) return;
  scroller.querySelectorAll('.face:not(.face--lid)').forEach((f) => {
    const shade = document.createElement('div');
    shade.className = 'face__shade';
    f.append(shade);
  });
  let drag: { id: number; x: number; y: number; from: number; lastX: number; lastT: number; v: number; on: boolean } | null = null;
  let swallow = false;

  scroller.addEventListener('pointerdown', (e) => {
    if (!swipeOn() || e.pointerType === 'mouse' || !e.isPrimary) return;
    // tocar mientras gira lo para donde esté y ese toque no pulsa nada
    swallow = !!swipeAnim;
    cancelAnimationFrame(swipeAnim);
    swipeAnim = 0;
    drag = { id: e.pointerId, x: e.clientX, y: e.clientY, from: pos, lastX: e.clientX, lastT: e.timeStamp, v: 0, on: false };
  });
  addEventListener('pointermove', (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    if (!drag.on) {
      const dx = e.clientX - drag.x;
      if (Math.abs(dx) < 8 || Math.abs(dx) < Math.abs(e.clientY - drag.y)) return;
      drag.on = true;
      drag.x = drag.lastX = e.clientX;
      drag.lastT = e.timeStamp;
      html.classList.add('swiping');
      return;
    }
    const dt = e.timeStamp - drag.lastT;
    if (dt > 0) drag.v = 0.7 * ((e.clientX - drag.lastX) / dt) + 0.3 * drag.v;
    drag.lastX = e.clientX;
    drag.lastT = e.timeStamp;
    // en las caras de los extremos el giro se resiste
    const p = drag.from - (e.clientX - drag.x) / (scroller.clientWidth || 1);
    pos = p < 0 ? p / 3 : p > 3 ? 3 + (p - 3) / 3 : p;
    queueSwipeFaces();
  });
  const end = (e: PointerEvent) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag;
    drag = null;
    html.classList.remove('swiping');
    if (d.on) swallow = true;
    // un gesto rápido basta para pasar de cara aunque el dedo haya recorrido poco
    const fling = e.type === 'pointerup' && d.on && Math.abs(d.v) > 0.3 && e.timeStamp - d.lastT < 120;
    const to = fling ? (d.v < 0 ? Math.floor(pos) + 1 : Math.ceil(pos) - 1) : Math.round(pos);
    if (d.on || pos !== Math.round(pos)) settle(clamp(to, 0, 3));
    setTimeout(() => (swallow = false), 60);
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
  scroller.addEventListener(
    'click',
    (e) => {
      if (!swallow) return;
      e.preventDefault();
      e.stopPropagation();
    },
    true,
  );
}

const render = () => {
  const cube = cubeEl();
  if (cube) cube.style.transform = `translateZ(${-HALF - rot.z}px) rotateX(${rot.x}deg) rotateY(${rot.y}deg)`;
};

// solo la cara visible es navegable; el resto queda inerte
const syncFaces = () => {
  WORKSPACES.forEach((id) => {
    const s = document.getElementById(id);
    if (!s) return;
    const off = cubeOn() && (id !== current || !!lid);
    s.toggleAttribute('inert', off);
    s.classList.toggle('is-front', cubeOn() && !off);
  });
  document.querySelectorAll('.lid').forEach((l) => l.classList.toggle('is-front', !!lid && l.classList.contains(`lid--${lid}`)));
  // las tapas se leen siempre derechas, se llegue desde la cara que se llegue
  cubeEl()?.style.setProperty('--lid-rot', `${Math.round(rot.y / 90) * 90}deg`);
};

const stop = () => {
  cancelAnimationFrame(raf);
  raf = 0;
};

// gira el cubo hasta (tx, ty): se aleja, rota y vuelve a pegarse a la pantalla
function animateTo(tx: number, ty: number) {
  stop();
  const from = { ...rot };
  const dist = Math.max(Math.abs(tx - from.x), Math.abs(ty - from.y));
  const ms = clamp(450 + dist * 4.5, 500, 1900);
  const zoom = HALF * Math.min(0.75, dist / 140);
  const t0 = performance.now();
  html.dataset.spin = '';
  const step = (now: number) => {
    const t = Math.min(1, (now - t0) / ms);
    const e = t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2;
    rot.x = from.x + (tx - from.x) * e;
    rot.y = from.y + (ty - from.y) * e;
    rot.z = from.z * (1 - e) + zoom * Math.sin(Math.PI * t);
    render();
    if (t < 1) {
      raf = requestAnimationFrame(step);
    } else {
      raf = 0;
      delete html.dataset.spin;
    }
  };
  raf = requestAnimationFrame(step);
}

// ángulo equivalente a la cara `i` más cercano a la orientación actual
const ringAngle = (i: number) => -90 * i + 360 * Math.round((rot.y + 90 * i) / 360);

// tapa de arriba o de abajo (↑ ↓ o arrastrando); son decorativas, no workspaces
function showLid(which: Exclude<Lid, null>) {
  lid = which;
  const ty = Math.round(rot.y / 90) * 90;
  syncFaces();
  animateTo(which === 'top' ? -90 : 90, ty);
}

// rueda del ratón sobre el cubo: cada gesto nuevo gira a la cara siguiente o anterior
function initWheel() {
  let last = 0;
  let armed = false;
  let acc = 0;
  document.getElementById('main')?.addEventListener(
    'wheel',
    (e) => {
      // en el cubo manda la rueda vertical; en swipe, el gesto horizontal del trackpad
      const swipe = swipeOn();
      if (!cubeOn() && !swipe) return;
      const delta = swipe ? e.deltaX : e.deltaY;
      if (e.ctrlKey || Math.abs(delta) < Math.abs(swipe ? e.deltaY : e.deltaX)) return;
      if ((e.target as Element).closest('.dock')) return;
      // una lista con scroll dentro de la cara (proyectos) se desplaza primero; el
      // cubo solo gira cuando ya está en el tope
      const list = swipe ? null : (e.target as Element).closest<HTMLElement>('.projects');
      if (list && list.scrollHeight > list.clientHeight + 1) {
        const atEdge = e.deltaY > 0 ? list.scrollTop + list.clientHeight >= list.scrollHeight - 2 : list.scrollTop <= 0;
        if (!atEdge) return void (last = performance.now());
      }
      e.preventDefault();
      const now = performance.now();
      const fresh = now - last > 220; // la rueda llevaba un rato quieta: gesto nuevo
      last = now;
      if (raf || swipeAnim) return void (armed = false);
      if (fresh) {
        armed = true;
        acc = 0;
      }
      if (!armed) return;
      acc += delta;
      if (Math.abs(acc) < 60) return;
      armed = false;
      const i = WORKSPACES.indexOf(current);
      const next = i + (acc > 0 ? 1 : -1);
      goToSection(lid ? current : WORKSPACES[swipe ? clamp(next, 0, 3) : mod4(next)]);
      acc = 0;
    },
    { passive: false },
  );
}

// arrastrar con el ratón: rotación libre y, al soltar, encaja en la cara más cercana
function initDrag() {
  const main = document.getElementById('main');
  if (!main) return;
  let start: { x: number; y: number; rx: number; ry: number } | null = null;
  let dragging = false;

  main.addEventListener('pointerdown', (e) => {
    if (!cubeOn() || e.button !== 0) return;
    if ((e.target as Element).closest('a, button, input, textarea, .dock')) return;
    start = { x: e.clientX, y: e.clientY, rx: 0, ry: 0 };
  });
  addEventListener('pointermove', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x;
    const dy = e.clientY - start.y;
    if (!dragging) {
      if (Math.hypot(dx, dy) < 8) return;
      dragging = true;
      stop();
      start = { x: e.clientX, y: e.clientY, rx: rot.x, ry: rot.y };
      html.dataset.spin = '';
      html.classList.add('cube-drag');
      getSelection()?.removeAllRanges();
      return;
    }
    rot.y = start.ry + dx * 0.35;
    rot.x = clamp(start.rx - dy * 0.35, -90, 90);
    rot.z += (HALF * 0.45 - rot.z) * 0.15;
    render();
  });
  const end = () => {
    if (!start) return;
    start = null;
    if (!dragging) return;
    dragging = false;
    html.classList.remove('cube-drag');
    const ty = Math.round(rot.y / 90) * 90;
    lid = rot.x < -45 ? 'top' : rot.x > 45 ? 'bottom' : null;
    if (!lid) setCurrent(WORKSPACES[mod4(Math.round(-ty / 90))]);
    syncFaces();
    animateTo(lid === 'top' ? -90 : lid === 'bottom' ? 90 : 0, ty);
  };
  addEventListener('pointerup', end);
  addEventListener('pointercancel', end);
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
      tilt.style.setProperty('--tilt-y', `${(x * 14).toFixed(2)}deg`);
      tilt.style.setProperty('--tilt-x', `${(-y * 10).toFixed(2)}deg`);
    });
  });
}

// una vuelta completa sin cambiar de workspace (comando `cube` de la terminal)
export function spinCube() {
  if (!cubeOn()) return;
  lid = null;
  syncFaces();
  animateTo(0, ringAngle(WORKSPACES.indexOf(current)) - 360);
}

export function goToSection(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const from = WORKSPACES.indexOf(current);
  const to = WORKSPACES.indexOf(id);

  if (cubeOn() && to >= 0) {
    if (from === to && !lid) return;
    lid = null;
    setCurrent(id);
    syncFaces();
    animateTo(0, ringAngle(to));
    el.focus({ preventScroll: true });
    return;
  }

  if (swipeOn() && to >= 0) {
    settle(to);
    return;
  }

  if (reduce || !document.startViewTransition || from === to || to < 0) {
    el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    return;
  }

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
  const motion = matchMedia(MOTION_MQ);
  const applyMode = () => {
    const was = cubeOn() || swipeOn();
    const cubeMode = motion.matches && mq.matches;
    const swipeMode = motion.matches && !mq.matches;
    html.classList.toggle('cube', cubeMode);
    html.classList.toggle('swipe', swipeMode);
    stop();
    delete html.dataset.spin;
    lid = null;
    Object.assign(rot, { x: 0, y: -90 * WORKSPACES.indexOf(current), z: 0 });
    const cube = cubeEl();
    if (cubeMode) render();
    else if (cube) cube.style.transform = '';
    // en el cubo la terminal vive fuera, como una ventana más del escritorio
    const desktop = document.querySelector('.desktop');
    const home = document.querySelector(cubeMode ? '#dock' : '.hero__grid');
    if (desktop && home && desktop.parentElement !== home) home.append(desktop);
    syncFaces();
    cancelAnimationFrame(swipeAnim);
    swipeAnim = 0;
    pos = WORKSPACES.indexOf(current);
    swipeFaces();
    if (was && !cubeMode && !swipeMode) document.getElementById(current)?.scrollIntoView({ behavior: 'instant' as ScrollBehavior });
  };
  mq.addEventListener('change', applyMode);
  motion.addEventListener('change', applyMode);
  addEventListener('resize', queueSwipeFaces, { passive: true });
  applyMode();
  initWheel();
  initDrag();
  initTilt();
  initSwipe();

  // sección visible (solo en modo scroll; en el cubo manda el giro)
  const io = new IntersectionObserver(
    (entries) => !cubeOn() && !swipeOn() && entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
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

  // 1-4 como Super+1..4 y flechas para girar el cubo (fuera de campos de texto)
  document.addEventListener('keydown', (e) => {
    const target = e.target;
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (target instanceof Element && target.matches('input, textarea, [contenteditable]')) return;
    const i = WORKSPACES.indexOf(current);
    if (cubeOn() && e.key.startsWith('Arrow')) {
      e.preventDefault();
      if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
        return goToSection(lid ? current : WORKSPACES[mod4(i + (e.key === 'ArrowRight' ? 1 : -1))]);
      }
      const want: Lid = e.key === 'ArrowUp' ? 'top' : 'bottom';
      return lid ? (lid === want ? undefined : goToSection(current)) : showLid(want);
    }
    const id = WORKSPACES[Number(e.key) - 1];
    if (id) goToSection(id);
  });
}
