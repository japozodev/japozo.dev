// Easter egg: `claude` en la terminal. Un cangrejo en pixel art cruza la ventana de
// la terminal andando de lado, se para en el centro, guiña un ojo y se va.

const PX = 5; // tamaño de cada píxel del dibujo
const W = 14;
const H = 10;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W * PX}" height="${H * PX}" shape-rendering="crispEdges">
  <g fill="#d97757">
    <rect x="2" y="1" width="10" height="7"/>
    <rect x="0" y="4" width="14" height="2"/>
    <g class="legs-a"><rect x="2" y="8" width="1" height="2"/><rect x="9" y="8" width="1" height="2"/></g>
    <g class="legs-b"><rect x="4" y="8" width="1" height="2"/><rect x="11" y="8" width="1" height="2"/></g>
  </g>
  <g fill="#1b1b1b">
    <rect x="4" y="3" width="1" height="2"/>
    <rect class="eye" x="9" y="3" width="1" height="2"/>
    <rect class="wink" x="8.5" y="3.7" width="2" height="0.6" opacity="0"/>
  </g>
</svg>`;

let busy = false;

export async function crab(term: HTMLElement) {
  // la ventana recorta el dibujo: entra y sale por los bordes de la terminal
  const box = term.parentElement;
  if (busy || !box) return;
  busy = true;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const el = document.createElement('div');
  el.setAttribute('aria-hidden', 'true');
  el.style.cssText = `position:absolute;left:0;bottom:0;z-index:2;pointer-events:none;line-height:0`;
  el.innerHTML = SVG;
  if (getComputedStyle(box).position === 'static') box.style.position = 'relative';
  box.append(el);

  const center = box.clientWidth / 2 - (W * PX) / 2;
  const legsA = el.querySelector('.legs-a')!;
  const legsB = el.querySelector('.legs-b')!;
  const step = { duration: 220, iterations: Infinity, easing: 'steps(1)' };
  // las patas se alternan mientras anda
  const walkA = legsA.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-1px)' }, { transform: 'translateY(0)' }], step);
  const walkB = legsB.animate([{ transform: 'translateY(-1px)' }, { transform: 'translateY(0)' }, { transform: 'translateY(-1px)' }], step);
  const legs = (on: boolean) => [walkA, walkB].forEach((a) => (on ? a.play() : a.pause()));
  const walk = (from: number, to: number) =>
    el.animate([{ transform: `translateX(${from}px)` }, { transform: `translateX(${to}px)` }], {
      duration: reduce ? 0 : Math.abs(to - from) * 7,
      fill: 'forwards',
    }).finished;

  await walk(-W * PX, center);
  legs(false);
  await sleep(450);
  // guiño
  const eye = el.querySelector<SVGElement>('.eye')!;
  const wink = el.querySelector<SVGElement>('.wink')!;
  eye.setAttribute('opacity', '0');
  wink.setAttribute('opacity', '1');
  await sleep(600);
  eye.setAttribute('opacity', '1');
  wink.setAttribute('opacity', '0');
  await sleep(500);
  legs(true);
  await walk(center, box.clientWidth);
  el.remove();
  busy = false;
}
