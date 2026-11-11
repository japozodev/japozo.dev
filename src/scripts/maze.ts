// 404: un laberinto en primera persona al estilo Wolfenstein 3D, con paredes de
// líneas verdes. Es un raycaster clásico (DDA) pintado a baja resolución. La puerta
// lleva el rótulo SALIDA y hace de botón de volver al inicio: al cruzarla se navega
// a la portada.

const TEX = 64;
const FOV = 0.66;
const MOVE = 2.7; // casillas por segundo
const TURN = 2.3; // radianes por segundo
const RADIUS = 0.22;

// # pared · D puerta de salida · S salida del jugador
const MAP = [
  '#############',
  '#S..#.......#',
  '#.#.#.###.#.#',
  '#.#...#...#.#',
  '#.#####.###.#',
  '#.....#.#...#',
  '###.#.#.#.###',
  '#...#...#...#',
  '#.#######.#.#',
  '#...........D',
  '#############',
];
const cell = (x: number, y: number) => MAP[y]?.[x] ?? '#';
const solid = (x: number, y: number) => cell(Math.floor(x), Math.floor(y)) !== '.' && cell(Math.floor(x), Math.floor(y)) !== 'S';

export function initMaze(root: HTMLElement, home: string, doorLabel: string) {
  const canvas = root.querySelector<HTMLCanvasElement>('canvas');
  const ctx = canvas?.getContext('2d');
  if (!canvas || !ctx) return;

  // resolución interna: apaisada en escritorio y con el móvil tumbado; cuadrada con
  // el móvil en vertical, para aprovechar el ancho. WALL corrige el alto de las
  // paredes para que el pasillo se vea igual en los dos formatos.
  let W = 320;
  let H = 180;
  let WALL = 0.7425;
  if (matchMedia('(pointer: coarse)').matches) root.classList.add('is-touch');
  const portrait = matchMedia('(orientation: portrait)');
  const resize = () => {
    const square = root.classList.contains('is-touch') && portrait.matches;
    W = square ? 240 : 320;
    H = square ? 240 : 180;
    WALL = square ? 1 : 0.7425;
    canvas.width = W;
    canvas.height = H;
    // píxeles nítidos al ampliar las texturas (cambiar el tamaño reinicia el contexto)
    ctx.imageSmoothingEnabled = false;
  };
  resize();
  portrait.addEventListener('change', resize);
  root.addEventListener('maze:resize', resize);

  // --- texturas: se regeneran con el tema ---
  let bg = '#121416';
  let accent = '#35bf5c';
  const makeTex = (draw: (c: CanvasRenderingContext2D) => void) => {
    const t = document.createElement('canvas');
    t.width = t.height = TEX;
    const c = t.getContext('2d')!;
    c.fillStyle = bg;
    c.fillRect(0, 0, TEX, TEX);
    c.strokeStyle = c.fillStyle = accent;
    c.lineWidth = 1;
    draw(c);
    return t;
  };
  let wallTex: HTMLCanvasElement;
  let doorTex: HTMLCanvasElement;
  const buildTextures = () => {
    const cs = getComputedStyle(document.documentElement);
    accent = cs.getPropertyValue('--accent').trim() || accent;
    bg = cs.getPropertyValue('--bg').trim() || bg;
    // pared: aparejo de ladrillo en líneas
    wallTex = makeTex((c) => {
      c.strokeRect(0.5, 0.5, TEX - 1, TEX - 1);
      c.beginPath();
      for (let row = 1; row < 4; row++) {
        c.moveTo(0, row * 16 + 0.5);
        c.lineTo(TEX, row * 16 + 0.5);
      }
      for (let row = 0; row < 4; row++) {
        for (let x = row % 2 ? 16 : 32; x < TEX; x += 32) {
          c.moveTo(x + 0.5, row * 16);
          c.lineTo(x + 0.5, row * 16 + 16);
        }
      }
      c.stroke();
    });
    // puerta: marco, rótulo y pomo
    doorTex = makeTex((c) => {
      c.lineWidth = 2;
      c.strokeRect(5, 5, TEX - 10, TEX - 6);
      c.lineWidth = 1;
      c.strokeRect(10.5, 30.5, TEX - 21, TEX - 32);
      c.fillRect(8, 9, TEX - 16, 17);
      c.fillRect(46, 44, 4, 4);
      c.fillStyle = bg;
      c.font = 'bold 11px monospace';
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      c.fillText(doorLabel, TEX / 2, 18, TEX - 20);
    });
  };
  buildTextures();
  document.addEventListener('themechange', buildTextures);

  // --- jugador ---
  const start = { x: 1.5, y: 1.5 };
  MAP.forEach((row, y) => {
    const x = row.indexOf('S');
    if (x >= 0) Object.assign(start, { x: x + 0.5, y: y + 0.5 });
  });
  const p = { x: start.x, y: start.y, a: 0 };
  let done = false;

  // --- controles: teclado, botones táctiles y arrastre para girar ---
  const keys = { fwd: 0, back: 0, left: 0, right: 0 };
  const KEYMAP: Record<string, keyof typeof keys> = {
    ArrowUp: 'fwd', w: 'fwd', W: 'fwd',
    ArrowDown: 'back', s: 'back', S: 'back',
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
  };
  addEventListener('keydown', (e) => {
    const k = KEYMAP[e.key];
    if (!k || e.ctrlKey || e.metaKey || e.altKey) return;
    e.preventDefault();
    keys[k] = 1;
  });
  addEventListener('keyup', (e) => {
    const k = KEYMAP[e.key];
    if (k) keys[k] = 0;
  });
  addEventListener('blur', () => Object.keys(keys).forEach((k) => (keys[k as keyof typeof keys] = 0)));
  root.querySelectorAll<HTMLElement>('[data-move]').forEach((btn) => {
    const k = btn.dataset.move as keyof typeof keys;
    const set = (v: number) => (e: Event) => {
      e.preventDefault();
      keys[k] = v;
    };
    btn.addEventListener('pointerdown', set(1));
    ['pointerup', 'pointerleave', 'pointercancel'].forEach((ev) => btn.addEventListener(ev, set(0)));
  });
  let dragX: number | null = null;
  canvas.addEventListener('pointerdown', (e) => {
    dragX = e.clientX;
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', (e) => {
    if (dragX === null) return;
    p.a += ((e.clientX - dragX) / canvas.clientWidth) * 2.4;
    dragX = e.clientX;
  });
  ['pointerup', 'pointercancel'].forEach((ev) => canvas.addEventListener(ev, () => (dragX = null)));

  const exit = () => {
    if (done) return;
    done = true;
    root.classList.add('is-out');
    setTimeout(() => (location.href = home), 650);
  };

  function update(dt: number) {
    p.a += (keys.right - keys.left) * TURN * dt;
    const step = (keys.fwd - keys.back) * MOVE * dt;
    if (!step) return;
    const dx = Math.cos(p.a) * step;
    const dy = Math.sin(p.a) * step;
    const nx = p.x + dx + Math.sign(dx) * RADIUS;
    const ny = p.y + dy + Math.sign(dy) * RADIUS;
    // cruzar la puerta es salir
    if (cell(Math.floor(nx), Math.floor(p.y)) === 'D' || cell(Math.floor(p.x), Math.floor(ny)) === 'D') return exit();
    if (!solid(nx, p.y)) p.x += dx;
    if (!solid(p.x, ny)) p.y += dy;
  }

  function render() {
    // techo y suelo, con unas líneas que dan profundidad al suelo
    ctx!.fillStyle = bg;
    ctx!.fillRect(0, 0, W, H);
    ctx!.fillStyle = accent;
    for (let i = 1; i <= 7; i++) {
      ctx!.globalAlpha = 0.05 + i * 0.02;
      ctx!.fillRect(0, Math.round(H / 2 + (H / 2) * (i / 7) ** 2), W, 1);
    }
    ctx!.globalAlpha = 1;

    const dirX = Math.cos(p.a);
    const dirY = Math.sin(p.a);
    const planeX = -dirY * FOV;
    const planeY = dirX * FOV;

    for (let x = 0; x < W; x++) {
      const cam = (2 * x) / W - 1;
      const rx = dirX + planeX * cam;
      const ry = dirY + planeY * cam;
      let mx = Math.floor(p.x);
      let my = Math.floor(p.y);
      const ddx = Math.abs(1 / rx);
      const ddy = Math.abs(1 / ry);
      const sx = rx < 0 ? -1 : 1;
      const sy = ry < 0 ? -1 : 1;
      let sdx = (rx < 0 ? p.x - mx : mx + 1 - p.x) * ddx;
      let sdy = (ry < 0 ? p.y - my : my + 1 - p.y) * ddy;
      let side = 0;
      let hit = '.';
      for (let n = 0; n < 40; n++) {
        if (sdx < sdy) {
          sdx += ddx;
          mx += sx;
          side = 0;
        } else {
          sdy += ddy;
          my += sy;
          side = 1;
        }
        hit = cell(mx, my);
        if (hit === '#' || hit === 'D') break;
      }
      const dist = Math.max(0.05, side === 0 ? sdx - ddx : sdy - ddy);
      const h = ((W / 2 / FOV) * WALL) / dist;
      let wx = side === 0 ? p.y + dist * ry : p.x + dist * rx;
      wx -= Math.floor(wx);
      let tx = Math.floor(wx * TEX);
      if ((side === 0 && rx < 0) || (side === 1 && ry > 0)) tx = TEX - tx - 1;
      const top = (H - h) / 2;
      ctx!.drawImage(hit === 'D' ? doorTex : wallTex, tx, 0, 1, TEX, x, top, 1, h);
      // la distancia y las caras laterales oscurecen; la puerta siempre brilla algo más
      const shade = hit === 'D' ? Math.min(0.45, dist / 30) : Math.min(0.88, dist / 9 + (side ? 0.16 : 0));
      ctx!.globalAlpha = shade;
      ctx!.fillStyle = bg;
      ctx!.fillRect(x, top, 1, h);
      ctx!.globalAlpha = 1;
    }

    // minimapa (la puerta parpadea)
    const s = 4;
    const ox = W - MAP[0].length * s - 6;
    ctx!.fillStyle = bg;
    ctx!.globalAlpha = 0.75;
    ctx!.fillRect(ox - 2, 4, MAP[0].length * s + 4, MAP.length * s + 4);
    MAP.forEach((row, y) =>
      [...row].forEach((c, x) => {
        if (c !== '#' && c !== 'D') return;
        ctx!.globalAlpha = c === 'D' ? (Math.floor(performance.now() / 350) % 2 ? 1 : 0.25) : 0.4;
        ctx!.fillStyle = accent;
        ctx!.fillRect(ox + x * s, 6 + y * s, s, s);
      }),
    );
    ctx!.globalAlpha = 1;
    ctx!.fillStyle = '#fff';
    ctx!.fillRect(Math.round(ox + p.x * s) - 1, Math.round(6 + p.y * s) - 1, 2, 2);
    ctx!.fillRect(Math.round(ox + (p.x + dirX * 0.8) * s), Math.round(6 + (p.y + dirY * 0.8) * s), 1, 1);
  }

  let last = performance.now();
  const loop = (t: number) => {
    const dt = Math.min(0.05, (t - last) / 1000);
    last = t;
    if (!done) update(dt);
    render();
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
}
