// Efectos que ocupan la ventana de la terminal. Cada uno devuelve una función para pararlo.

const css = (name: string) => getComputedStyle(document.documentElement).getPropertyValue(name).trim();

function overlay(term: HTMLElement) {
  const host = term.parentElement!;
  host.style.position = 'relative';
  const canvas = document.createElement('canvas');
  canvas.className = 'term-fx';
  canvas.setAttribute('aria-hidden', 'true');
  host.appendChild(canvas);
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = host.clientWidth;
  const h = host.clientHeight;
  canvas.width = w * dpr;
  canvas.height = h * dpr;
  const ctx = canvas.getContext('2d')!;
  ctx.scale(dpr, dpr);
  return { canvas, ctx, w, h };
}

function loop(draw: () => void, fps: number) {
  let raf = 0;
  let last = 0;
  const tick = (t: number) => {
    raf = requestAnimationFrame(tick);
    if (t - last < 1000 / fps) return;
    last = t;
    draw();
  };
  raf = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(raf);
}

export function cmatrix(term: HTMLElement) {
  const { canvas, ctx, w, h } = overlay(term);
  const size = 14;
  const cols = Math.ceil(w / size);
  const drops = Array.from({ length: cols }, () => Math.random() * -(h / size));
  // solo caracteres incluidos en el subset de Hack (sin katakana)
  const glyphs = '01$#{}[]<>/\\|=+*japozo';
  const bg = css('--bg-alt');
  const accent = css('--accent');
  const fg = css('--fg');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);
  ctx.font = `${size}px 'Hack Nerd Font', monospace`;

  const stop = loop(() => {
    ctx.globalAlpha = 0.12;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.globalAlpha = 1;
    drops.forEach((y, i) => {
      const ch = glyphs[(Math.random() * glyphs.length) | 0];
      ctx.fillStyle = Math.random() < 0.06 ? fg : accent;
      ctx.fillText(ch, i * size, y * size);
      drops[i] = y * size > h && Math.random() > 0.975 ? 0 : y + 1;
    });
  }, 24);

  return () => {
    stop();
    canvas.remove();
  };
}

export function cava(term: HTMLElement) {
  const { canvas, ctx, w, h } = overlay(term);
  const bars = Math.max(16, Math.floor(w / 18));
  const barW = w / bars;
  const levels = new Array(bars).fill(0);
  const phase = Array.from({ length: bars }, () => Math.random() * Math.PI * 2);
  const bg = css('--bg-alt');
  const grad = ctx.createLinearGradient(0, h, 0, 0);
  grad.addColorStop(0, css('--accent'));
  grad.addColorStop(1, css('--accent-2'));
  let t = 0;

  // no hay audio real: una mezcla de senos con "bombo" cada ~0,5 s
  const stop = loop(() => {
    t += 1;
    const kick = Math.max(0, Math.sin((t / 30) * Math.PI * 2)) ** 8;
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = grad;
    for (let i = 0; i < bars; i++) {
      const x = i / bars;
      const bassBoost = (1 - x) ** 2 * kick;
      const target =
        0.25 + 0.2 * Math.sin(t / 7 + phase[i]) + 0.15 * Math.sin(t / 3.3 + i) + 0.45 * bassBoost + Math.random() * 0.1;
      levels[i] += (Math.min(1, Math.max(0.03, target)) - levels[i]) * 0.35;
      const bh = levels[i] * (h - 16);
      // barras hechas de "bloques" como en la terminal
      for (let y = 0; y < bh; y += 8) {
        ctx.fillRect(i * barW + 2, h - 8 - y, barW - 4, 6);
      }
    }
  }, 30);

  return () => {
    stop();
    canvas.remove();
  };
}
