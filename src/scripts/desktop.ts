import { createTerminal, type TerminalApi } from './terminal';

const MAX_TILES = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export function initDesktop() {
  const tiles = document.querySelector<HTMLElement>('.tiles');
  const kittyTpl = document.getElementById('kitty-tpl') as HTMLTemplateElement | null;
  const main = tiles?.querySelector<HTMLElement>('.tile--main');
  if (!tiles || !main) return;

  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const count = () => tiles.querySelectorAll('.tile:not(.is-closing)').length;

  // reordena el mosaico animando las posiciones con View Transitions (si hay soporte)
  const relayout = (change: () => void) => {
    if (reduce || !document.startViewTransition) return change();
    const wins = [...tiles.querySelectorAll<HTMLElement>('.tile')];
    wins.forEach((w, i) => (w.style.viewTransitionName = `tile-${i}`));
    document.documentElement.dataset.tiling = '';
    const vt = document.startViewTransition(change);
    vt.finished.finally(() => {
      wins.forEach((w) => (w.style.viewTransitionName = ''));
      delete document.documentElement.dataset.tiling;
    });
  };

  const spawn = (): boolean => {
    if (!kittyTpl || count() >= MAX_TILES) return false;
    const node = (kittyTpl.content.cloneNode(true) as DocumentFragment).firstElementChild as HTMLElement;
    relayout(() => {
      tiles.appendChild(node);
      tiles.dataset.count = String(count());
    });
    requestAnimationFrame(() => node.classList.add('is-open'));
    const api = createTerminal(node, {
      close: async () => {
        node.classList.add('is-closing');
        await sleep(reduce ? 0 : 220);
        relayout(() => {
          node.remove();
          tiles.dataset.count = String(count());
        });
        mainTerm?.focus();
      },
    });
    api?.focus();
    return true;
  };

  const mainTerm: TerminalApi | null = createTerminal(main, { boot: true, spawn });

  // apertura escalonada de las ventanas al cargar
  (async () => {
    const wins = [...tiles.querySelectorAll<HTMLElement>('.tile')];
    for (const w of wins) {
      w.classList.add('is-open');
      if (!reduce) await sleep(260);
    }
  })();

  document.querySelectorAll<HTMLButtonElement>('.chip[data-cmd]').forEach((chip) =>
    chip.addEventListener('click', () => mainTerm?.typeAndRun(chip.dataset.cmd!)),
  );
}
