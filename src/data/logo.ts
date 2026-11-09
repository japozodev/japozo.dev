// Logo ASCII generado a partir de una fuente de píxeles de 8 filas.
// Cada par de filas se dibuja con medios bloques (▀ ▄ █), así cada píxel sale cuadrado
// con Hack a line-height 1.2. Para cambiar el texto basta con tocar LOGO_TEXT.

const GLYPHS: Record<string, string[]> = {
  J: ['..####', '....##', '....##', '....##', '....##', '##..##', '##..##', '.####.'],
  A: ['.####.', '##..##', '##..##', '##..##', '######', '##..##', '##..##', '##..##'],
  P: ['#####.', '##..##', '##..##', '##..##', '#####.', '##....', '##....', '##....'],
  O: ['.####.', '##..##', '##..##', '##..##', '##..##', '##..##', '##..##', '.####.'],
  Z: ['######', '....##', '...###', '..###.', '.###..', '###...', '##....', '######'],
  '>': ['##....', '.##...', '..##..', '...##.', '...##.', '..##..', '.##...', '##....'],
  _: ['......', '......', '......', '......', '......', '......', '......', '######'],
};

export const LOGO_TEXT = 'JAPOZO>';

export function renderLogo(text = LOGO_TEXT, gap = 1) {
  const rows = Array.from({ length: 8 }, (_, r) =>
    [...text].map((ch) => GLYPHS[ch]?.[r] ?? '......').join('.'.repeat(gap)),
  );
  const lines: string[] = [];
  for (let r = 0; r < rows.length; r += 2) {
    let line = '';
    for (let c = 0; c < rows[r].length; c++) {
      const top = rows[r][c] === '#';
      const bottom = rows[r + 1][c] === '#';
      line += top && bottom ? '█' : top ? '▀' : bottom ? '▄' : ' ';
    }
    lines.push(line.trimEnd());
  }
  return lines.join('\n');
}

export const LOGO = renderLogo();
export const LOGO_COLS = Math.max(...LOGO.split('\n').map((l) => l.length));
