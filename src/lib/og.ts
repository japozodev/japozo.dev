// Imagen para compartir en redes (1200x630): el logo en píxeles, el rol y el cubo en
// alambre sobre el fondo de scanlines. Se dibuja como SVG sin fuentes (todo son
// rectángulos y líneas, así sale igual en cualquier máquina) y se pasa a PNG con sharp.
import sharp from 'sharp';
import { LOGO } from '../data/logo';
import type { Lang } from '../data/site';

const W = 1200;
const H = 630;
const BG = '#121416';
const ACCENT = '#35bf5c';
const FG = '#e4e8e9';
const MUTED = '#8c969b';

// fuente de píxeles de 5x7 para los rótulos (solo los caracteres que se usan)
const FONT: Record<string, string[]> = {
  A: ['.###.', '#...#', '#...#', '#####', '#...#', '#...#', '#...#'],
  B: ['####.', '#...#', '#...#', '####.', '#...#', '#...#', '####.'],
  D: ['####.', '#...#', '#...#', '#...#', '#...#', '#...#', '####.'],
  E: ['#####', '#....', '#....', '####.', '#....', '#....', '#####'],
  G: ['.###.', '#...#', '#....', '#.###', '#...#', '#...#', '.###.'],
  I: ['.###.', '..#..', '..#..', '..#..', '..#..', '..#..', '.###.'],
  J: ['..###', '...#.', '...#.', '...#.', '...#.', '#..#.', '.##..'],
  L: ['#....', '#....', '#....', '#....', '#....', '#....', '#####'],
  N: ['#...#', '##..#', '#.#.#', '#..##', '#...#', '#...#', '#...#'],
  O: ['.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  // la tilde ocupa dos filas por encima de la letra
  Ó: ['...#.', '..#..', '.###.', '#...#', '#...#', '#...#', '#...#', '#...#', '.###.'],
  P: ['####.', '#...#', '#...#', '####.', '#....', '#....', '#....'],
  R: ['####.', '#...#', '#...#', '####.', '#.#..', '#..#.', '#...#'],
  S: ['.####', '#....', '#....', '.###.', '....#', '....#', '####.'],
  V: ['#...#', '#...#', '#...#', '#...#', '#...#', '.#.#.', '..#..'],
  W: ['#...#', '#...#', '#...#', '#.#.#', '#.#.#', '##.##', '#...#'],
  Z: ['#####', '....#', '...#.', '..#..', '.#...', '#....', '#####'],
  '.': ['.....', '.....', '.....', '.....', '.....', '.....', '..#..'],
  ',': ['.....', '.....', '.....', '.....', '.....', '..#..', '.#...'],
  '·': ['.....', '.....', '.....', '..#..', '.....', '.....', '.....'],
};

const rect = (x: number, y: number, w: number, h: number) => `<rect x="${x}" y="${y}" width="${w}" height="${h}"/>`;

// rótulo en píxeles; (x, y) es la esquina superior izquierda de una letra sin tilde
function label(text: string, x: number, y: number, px: number, fill: string) {
  let out = '';
  [...text].forEach((ch, n) => {
    const rows = FONT[ch];
    if (!rows) return;
    const top = y - (rows.length - 7) * px;
    rows.forEach((row, r) =>
      [...row].forEach((c, col) => {
        if (c === '#') out += rect(x + (n * 6 + col) * px, top + r * px, px, px);
      }),
    );
  });
  return `<g fill="${fill}">${out}</g>`;
}

// el logo ASCII (medios bloques) convertido de vuelta a píxeles
function logo(x: number, y: number, px: number) {
  let out = '';
  LOGO.split('\n').forEach((line, r) =>
    [...line].forEach((ch, col) => {
      if (ch === '█' || ch === '▀') out += rect(x + col * px, y + r * 2 * px, px, px);
      if (ch === '█' || ch === '▄') out += rect(x + col * px, y + (r * 2 + 1) * px, px, px);
    }),
  );
  return `<g fill="${ACCENT}">${out}</g>`;
}

// --- el cubo ---
// Como la imagen no puede moverse, el giro se sugiere con una estela: dos copias
// tenues del cubo en ángulos anteriores. Las caras llevan una miniatura de lo que
// hay en la web (el nombre, los proyectos y la placa de la tapa).
type P3 = [number, number, number];
const RX = (-20 * Math.PI) / 180;

function projector(cx: number, cy: number, size: number, deg: number) {
  const ry = (deg * Math.PI) / 180;
  return ([x, y, z]: P3) => {
    const x1 = x * Math.cos(ry) + z * Math.sin(ry);
    const z1 = -x * Math.sin(ry) + z * Math.cos(ry);
    const y2 = y * Math.cos(RX) - z1 * Math.sin(RX);
    const z2 = y * Math.sin(RX) + z1 * Math.cos(RX);
    const k = 6 / (6 - z2);
    return { x: cx + x1 * size * k, y: cy + y2 * size * k, z: z2 };
  };
}

const VERTS: P3[] = [-1, 1].flatMap((z) => [-1, 1].flatMap((y) => [-1, 1].map((x) => [x, y, z] as P3)));
const EDGES: [number, number][] = [];
for (let a = 0; a < 8; a++) for (let b = a + 1; b < 8; b++) if ([1, 2, 4].includes(a ^ b)) EDGES.push([a, b]);

function wire(proj: ReturnType<typeof projector>, width: number, opacity: number) {
  const pts = VERTS.map(proj);
  // las aristas que tocan el vértice del fondo, más tenues
  const back = pts.reduce((m, q, i) => (q.z < pts[m].z ? i : m), 0);
  const lines = EDGES.map(
    ([a, b]) =>
      `<line x1="${pts[a].x.toFixed(1)}" y1="${pts[a].y.toFixed(1)}" x2="${pts[b].x.toFixed(1)}" y2="${pts[b].y.toFixed(1)}" opacity="${a === back || b === back ? 0.35 : 1}"/>`,
  ).join('');
  return `<g stroke="${ACCENT}" stroke-width="${width}" stroke-linecap="round" opacity="${opacity}">${lines}</g>`;
}

// coordenadas (u, v) de -1 a 1 sobre cada cara visible
const FACES = {
  front: (u: number, v: number): P3 => [u, v, 1],
  side: (u: number, v: number): P3 => [1, v, -u],
  top: (u: number, v: number): P3 => [u, -1, v],
};

function cube(cx: number, cy: number, size: number) {
  const proj = projector(cx, cy, size, -34);
  const at = (face: keyof typeof FACES, u: number, v: number) => {
    const q = proj(FACES[face](u, v));
    return `${q.x.toFixed(1)},${q.y.toFixed(1)}`;
  };
  const quad = (face: keyof typeof FACES, u0: number, v0: number, u1: number, v1: number, attrs: string) =>
    `<polygon points="${at(face, u0, v0)} ${at(face, u1, v0)} ${at(face, u1, v1)} ${at(face, u0, v1)}" ${attrs}/>`;
  const fill = (color: string, opacity = 1) => `fill="${color}" opacity="${opacity}"`;
  const outline = `fill="${ACCENT}" fill-opacity="0.12" stroke="${ACCENT}" stroke-width="1.5"`;

  let out = '';
  // cara delantera: velo, saludo, el nombre en píxeles, dos renglones y los botones
  out += quad('front', -1, -1, 1, 1, fill(ACCENT, 0.1));
  out += quad('front', -0.8, -0.66, -0.2, -0.61, fill(MUTED, 0.9));
  const px = 1.6 / 23;
  [...'POZO'].forEach((ch, n) =>
    FONT[ch].forEach((row, r) =>
      [...row].forEach((c, col) => {
        if (c !== '#') return;
        const u = -0.8 + (n * 6 + col) * px;
        const v = -0.5 + r * px;
        out += quad('front', u, v, u + px, v + px, fill(ACCENT));
      }),
    ),
  );
  out += quad('front', -0.8, 0.14, 0.7, 0.19, fill(MUTED, 0.7));
  out += quad('front', -0.8, 0.27, 0.45, 0.32, fill(MUTED, 0.7));
  out += quad('front', -0.8, 0.5, -0.2, 0.7, fill(ACCENT));
  out += quad('front', -0.1, 0.5, 0.4, 0.7, outline);
  // cara lateral: el mosaico de proyectos
  out += quad('side', -1, -1, 1, 1, fill(ACCENT, 0.05));
  out += quad('side', -0.78, -0.82, 0.1, -0.74, fill(FG, 0.8));
  for (const v of [-0.55, 0.2]) for (const u of [-0.78, 0.06]) out += quad('side', u, v, u + 0.72, v + 0.6, outline);
  // tapa: un integrado con sus pistas
  out += quad('top', -0.28, -0.28, 0.28, 0.28, outline);
  for (const v of [-0.16, 0, 0.16]) {
    for (const dir of [-1, 1]) {
      out += quad('top', dir * 0.28, v - 0.012, dir * 0.8, v + 0.012, fill(ACCENT, 0.8));
      out += quad('top', dir * 0.8 - 0.03, v - 0.03, dir * 0.8 + 0.03, v + 0.03, fill(ACCENT, 0.8));
    }
  }

  // estela del giro, por detrás
  const trail = wire(projector(cx, cy, size, -58), 2, 0.3) + wire(projector(cx, cy, size, -80), 2, 0.14);
  // resplandor: las mismas aristas, anchas y desenfocadas
  const glow = `<g filter="url(#glow)">${wire(proj, 7, 0.55)}</g>`;
  return trail + glow + out + wire(proj, 3, 1);
}

function svg(lang: Lang) {
  const role = lang === 'es' ? 'DESARROLLADOR WEB · GIJÓN' : 'WEB DEVELOPER · GIJÓN, SPAIN';
  let scan = '';
  for (let y = 3; y < H; y += 4) scan += rect(0, y, W, 1);
  // escuadras en las esquinas, como en las caras del cubo
  const m = 36;
  const l = 34;
  const corners = [
    [m, m, 1, 1],
    [W - m, m, -1, 1],
    [m, H - m, 1, -1],
    [W - m, H - m, -1, -1],
  ]
    .map(([x, y, sx, sy]) => `<path d="M${x + sx * l} ${y}H${x}V${y + sy * l}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
  <defs><filter id="glow" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9"/></filter></defs>
  <rect width="${W}" height="${H}" fill="${BG}"/>
  <g fill="${ACCENT}" opacity="0.07">${scan}</g>
  <g fill="none" stroke="${ACCENT}" stroke-width="3">${corners}</g>
  ${logo(84, 196, 13)}
  ${label(role, 86, 346, 4, FG)}
  ${label('JAPOZO.DEV', 86, 404, 4, MUTED)}
  <g shape-rendering="geometricPrecision">${cube(975, 322, 112)}</g>
</svg>`;
}

export const ogPng = (lang: Lang) => sharp(Buffer.from(svg(lang))).png().toBuffer();
