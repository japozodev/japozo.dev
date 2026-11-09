// Anima la ventana btop: cada habilidad oscila alrededor de su valor y deja un rastro
// de barras como las gráficas de CPU. Se pausa cuando no está en pantalla.

const BLOCKS = '▁▂▃▄▅▆▇█';

export function initBtop(root: HTMLElement) {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clock = root.querySelector<HTMLElement>('[data-btop-clock]');
  const rows = [...root.querySelectorAll<HTMLElement>('.row')].map((row) => {
    const spark = row.querySelector<HTMLElement>('[data-spark]')!;
    const base = Number(row.dataset.base);
    return { spark, pct: row.querySelector<HTMLElement>('[data-pct]')!, base, hist: [] as number[] };
  });
  const procs = [...root.querySelectorAll<HTMLElement>('.btop__procs li')].map((li) => ({
    el: li.querySelector<HTMLElement>('[data-proc-cpu]')!,
    base: Number(li.dataset.cpu),
  }));

  // ancho de un carácter para saber cuántas barras caben
  const probe = document.createElement('span');
  probe.textContent = '0000000000';
  probe.style.cssText = 'position:absolute;visibility:hidden;white-space:pre';
  rows[0]?.spark.appendChild(probe);
  const ch = probe.getBoundingClientRect().width / 10 || 8;
  probe.remove();

  const tick = () => {
    if (clock) clock.textContent = new Date().toLocaleTimeString('es-ES');
    rows.forEach((r) => {
      const cols = Math.max(4, Math.floor(r.spark.clientWidth / ch));
      const v = Math.min(100, Math.max(5, r.base + (Math.random() - 0.5) * 18));
      r.hist.push(v);
      if (r.hist.length > cols) r.hist.splice(0, r.hist.length - cols);
      r.spark.textContent = r.hist.map((h) => BLOCKS[Math.round((h / 100) * 7)]).join('').padStart(cols, BLOCKS[0]);
      r.pct.textContent = `${Math.round(v)}%`;
    });
    procs.forEach((p) => {
      p.el.textContent = Math.max(0, p.base + (Math.random() - 0.5) * p.base * 0.8).toFixed(1);
    });
  };

  // rellena el histórico para no empezar vacío
  for (let i = 0; i < 120; i++) tick();
  if (reduce) return;

  let timer = 0;
  const start = () => !timer && (timer = window.setInterval(tick, 1000));
  const stop = () => {
    clearInterval(timer);
    timer = 0;
  };
  new IntersectionObserver(([e]) => (e.isIntersecting && !document.hidden ? start() : stop())).observe(root);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : start()));
}
