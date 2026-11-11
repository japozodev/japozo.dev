// Wallpaper: pistas de una placa de circuito (buses que entran por los lados, giran
// a 45° y acaban en vías o en un integrado). Se genera con una semilla fija y se usa
// como máscara en CSS, así el color sale del tema activo.
import type { APIRoute } from 'astro';

const W = 1920;
const H = 1080;
const S = 12; // separación entre pistas de un mismo bus
const K = Math.SQRT2 - 1; // desplazamiento del codo para que las pistas sigan paralelas

// generador determinista: el dibujo es siempre el mismo
let seed = 2027;
const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32;
const between = (a: number, b: number) => a + rnd() * (b - a);
const n = (v: number) => +v.toFixed(1);

function side(mirror: boolean) {
  const x = (v: number) => n(mirror ? W - v : v);
  let lines = '';
  let pads = '';
  let cursor = between(10, 60);
  let chip = 0;

  while (cursor < H - 40) {
    const k = 2 + Math.floor(rnd() * 6);
    const dy = rnd() < 0.2 ? 0 : (rnd() < 0.5 ? -1 : 1) * S * Math.round(between(2, 10));
    const y0 = cursor + (dy < 0 ? -dy : 0);
    const x1 = between(90, 420);
    const x2 = x1 + Math.abs(dy);
    const xe = Math.min(x2 + between(70, 300), W * 0.38);
    const toChip = k >= 4 && rnd() < 0.4;
    const stagger = rnd() < 0.5 ? 1 : -1;

    for (let i = 0; i < k; i++) {
      const y = y0 + i * S;
      const shift = -Math.sign(dy) * i * S * K;
      const end = toChip ? xe : xe - (stagger > 0 ? i : k - 1 - i) * S * 1.5;
      lines += `<path d="M${x(0)} ${n(y)}H${x(x1 + shift)}L${x(x2 + shift)} ${n(y + dy)}H${x(end - (toChip ? 0 : 4))}"/>`;
      if (toChip) pads += `<rect x="${x(mirror ? end + 9 : end)}" y="${n(y + dy - 2.5)}" width="9" height="5"/>`;
      else lines += `<circle cx="${x(end)}" cy="${n(y + dy)}" r="4"/>`;
    }

    if (toChip) {
      // integrado: patillas a ambos lados y un par de pistas que siguen hasta una vía
      const cw = between(70, 120);
      const top = y0 + dy - 12;
      const ch = (k - 1) * S + 24;
      const left = xe + 9;
      lines += `<rect x="${x(mirror ? left + cw : left)}" y="${n(top)}" width="${n(cw)}" height="${n(ch)}"/>`;
      lines += `<circle cx="${x(left + 10)}" cy="${n(top + 10)}" r="2.5"/>`;
      pads += `<text x="${x(left + cw / 2)}" y="${n(top + ch / 2 + 4)}" text-anchor="middle">JPZ${27 + chip++}</text>`;
      for (let i = 0; i < k; i++) {
        const y = y0 + dy + i * S;
        const px = left + cw;
        pads += `<rect x="${x(mirror ? px + 9 : px)}" y="${n(y - 2.5)}" width="9" height="5"/>`;
        if (rnd() < 0.5) {
          const len = between(30, 110);
          lines += `<path d="M${x(px + 9)} ${n(y)}H${x(px + 9 + len - 4)}"/><circle cx="${x(px + 9 + len)}" cy="${n(y)}" r="4"/>`;
        }
      }
    }

    cursor = y0 + (k - 1) * S + Math.max(dy, 0) + between(34, 90);
  }
  return { lines, pads };
}

const left = side(false);
const right = side(true);
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice"><g fill="none" stroke="#000" stroke-width="1.6" stroke-linejoin="round">${left.lines}${right.lines}</g><g fill="#000" font-family="monospace" font-size="11">${left.pads}${right.pads}</g></svg>`;

export const GET: APIRoute = () => new Response(SVG, { headers: { 'Content-Type': 'image/svg+xml' } });
