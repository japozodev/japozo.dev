// Wallpaper del hero: degradado tramado (dithering Bayer 8x8) en píxeles grandes.
// Se usa como máscara en CSS, así el color sale del tema activo.
import type { APIRoute } from 'astro';

const W = 192;
const H = 108;

const BAYER = [
  [0, 32, 8, 40, 2, 34, 10, 42],
  [48, 16, 56, 24, 50, 18, 58, 26],
  [12, 44, 4, 36, 14, 46, 6, 38],
  [60, 28, 52, 20, 62, 30, 54, 22],
  [3, 35, 11, 43, 1, 33, 9, 41],
  [51, 19, 59, 27, 49, 17, 57, 25],
  [15, 47, 7, 39, 13, 45, 5, 37],
  [63, 31, 55, 23, 61, 29, 53, 21],
];

// intensidad 0..1: foco fuerte abajo a la derecha y uno suave arriba a la izquierda
const intensity = (x: number, y: number) => {
  const nx = x / W;
  const ny = y / H;
  const d1 = Math.hypot((nx - 1.02) * 1.6, ny - 1.05);
  const d2 = Math.hypot((nx + 0.05) * 1.6, ny + 0.1);
  const a = Math.max(0, 1 - d1 / 1.25) ** 1.7;
  const b = 0.3 * Math.max(0, 1 - d2 / 0.6) ** 2;
  return Math.min(1, a + b);
};

function buildPath() {
  let d = '';
  for (let y = 0; y < H; y++) {
    let run = -1;
    for (let x = 0; x <= W; x++) {
      const on = x < W && intensity(x, y) > (BAYER[y % 8][x % 8] + 0.5) / 64;
      if (on && run < 0) run = x;
      if (!on && run >= 0) {
        d += `M${run} ${y}h${x - run}v1h${run - x}z`;
        run = -1;
      }
    }
  }
  return d;
}

export const GET: APIRoute = () =>
  new Response(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMaxYMax slice" shape-rendering="crispEdges"><path d="${buildPath()}"/></svg>`,
    { headers: { 'Content-Type': 'image/svg+xml' } },
  );
