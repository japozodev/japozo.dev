import { SOCIAL } from '../data/site';
import { THEMES } from '../data/themes';
import { applyTheme, currentTheme } from './theme';
import { getEmail } from './email';
import { goToSection } from './workspaces';
import { cava, cmatrix } from './effects';
import { hyprctl } from './hyprctl';

const BOOT_KEY = 'japozo-booted';

const BOOT_LINES = [
  '[    0.000000] Linux version 6.12.4 (pozo@japozo) (gcc 14.2.1)',
  '[    0.000000] Command line: BOOT_IMAGE=/boot/vmlinuz root=UUID=japozo-dev rw quiet',
  '[    0.041337] ACPI: Core revision 20240827',
  '[    0.218204] PCI: Using configuration type 1 for base access',
  '[    0.612083] nvme nvme0: 16/0/0 default/read/poll queues',
  '[  OK  ] Reached target Local File Systems.',
  '[  OK  ] Started Network Manager.',
  '[  OK  ] Mounted /home/pozo/proyectos.',
  '[  OK  ] Loaded font Hack Nerd Font.',
  '[  OK  ] Started Hyprland compositor.',
  '[  OK  ] Started JavaScript Runtime.',
  '[  OK  ] Reached target Creative Mode.',
  '[    2.104512] japozo.dev: portfolio v27 ready',
];

type Lang = 'es' | 'en';

const TXT = {
  es: {
    welcome: 'Bienvenido a <b>japozo.dev</b>. Escribe <span class="ok">help</span> para ver los comandos.',
    kittyWelcome: 'Nueva ventana de kitty. Escribe <span class="ok">exit</span> para cerrarla.',
    notFound: (c: string) => `zsh: comando no encontrado: ${c}`,
    help: [
      ['help', 'muestra esta ayuda'],
      ['whoami · fastfetch', 'quién soy'],
      ['ls · cat bio.txt', 'lista el contenido y lee la bio'],
      ['cd <sección>', 'ir a proyectos, sobre-mi, contacto'],
      ['email · github · linkedin', 'contacto'],
      ['tema [nombre]', 'cambia el tema de colores'],
      ['kitty', 'abre otra terminal en el mosaico'],
      ['cmatrix · cava', 'efectos (cualquier tecla para salir)'],
      ['hyprctl', 'ajusta el escritorio en vivo'],
      ['lang en', 'switch to English'],
      ['history · date · clear', 'lo de siempre'],
    ],
    whoami: 'pozo, desarrollador frontend en Gijón. Ex técnico de hardware, ahora picando código.',
    readme:
      'Construyo webs rápidas, cuidadas y con carácter.\nMás de 20 años de hardware me enseñaron a entender las cosas por dentro.\nAhora trabajo como frontend developer en @Kewo.',
    themes: 'Temas disponibles (usa: tema &lt;nombre&gt;):',
    themeSet: (t: string) => `Tema cambiado a <span class="ok">${t}</span>.`,
    themeBad: (t: string) => `tema: '${t}' no existe.`,
    cdBad: (t: string) => `cd: no existe el directorio: ${t}`,
    going: (t: string) => `Cambiando al workspace ~/${t}...`,
    sudo: 'pozo no está en el archivo sudoers. Este incidente será reportado.',
    hire: '[sudo] contraseña para pozo: ********\n<span class="ok">Acceso concedido.</span> Me encanta la idea. Te llevo a contacto...',
    rm: 'Buen intento. Este sistema está protegido por café y copias de seguridad.',
    exit: 'Esta es la terminal principal, no se puede cerrar. Prueba en una <span class="ok">kitty</span>.',
    opening: (t: string) => `Abriendo ${t}...`,
    neofetch: 'neofetch: descansa en paz. Prueba con <span class="ok">fastfetch</span>.',
    langSwitch: 'Cambiando de idioma...',
    kittyFull: 'hyprland: workspace lleno. Cierra una ventana con <span class="ok">exit</span>.',
    kittyOpen: 'Abriendo kitty...',
  },
  en: {
    welcome: 'Welcome to <b>japozo.dev</b>. Type <span class="ok">help</span> to list the commands.',
    kittyWelcome: 'New kitty window. Type <span class="ok">exit</span> to close it.',
    notFound: (c: string) => `zsh: command not found: ${c}`,
    help: [
      ['help', 'show this help'],
      ['whoami · fastfetch', 'who I am'],
      ['ls · cat bio.txt', 'list contents and read the bio'],
      ['cd <section>', 'go to projects, about, contact'],
      ['email · github · linkedin', 'contact'],
      ['theme [name]', 'change the colour theme'],
      ['kitty', 'open another terminal in the tiling'],
      ['cmatrix · cava', 'effects (any key to quit)'],
      ['hyprctl', 'tweak the desktop live'],
      ['lang es', 'cambiar a español'],
      ['history · date · clear', 'the usual'],
    ],
    whoami: 'pozo, frontend developer in Gijón, Spain. Former hardware tech, now writing code.',
    readme:
      "I build fast, polished websites with character.\n20+ years of hardware taught me how things work under the hood.\nI'm currently a frontend developer at @Kewo.",
    themes: 'Available themes (use: theme &lt;name&gt;):',
    themeSet: (t: string) => `Theme switched to <span class="ok">${t}</span>.`,
    themeBad: (t: string) => `theme: '${t}' not found.`,
    cdBad: (t: string) => `cd: no such directory: ${t}`,
    going: (t: string) => `Switching to workspace ~/${t}...`,
    sudo: 'pozo is not in the sudoers file. This incident will be reported.',
    hire: '[sudo] password for pozo: ********\n<span class="ok">Access granted.</span> Love the idea. Taking you to contact...',
    rm: 'Nice try. This system is protected by coffee and backups.',
    exit: "This is the main terminal, it can't be closed. Try it in a <span class=\"ok\">kitty</span>.",
    opening: (t: string) => `Opening ${t}...`,
    neofetch: 'neofetch: rest in peace. Try <span class="ok">fastfetch</span>.',
    langSwitch: 'Switching language...',
    kittyFull: 'hyprland: workspace is full. Close a window with <span class="ok">exit</span>.',
    kittyOpen: 'Opening kitty...',
  },
};

// alias de directorios -> id de sección
const SECTIONS: Record<string, string> = {
  inicio: 'inicio',
  home: 'inicio',
  '~': 'inicio',
  proyectos: 'proyectos',
  projects: 'proyectos',
  'sobre-mi': 'sobre-mi',
  'sobre-mí': 'sobre-mi',
  about: 'sobre-mi',
  contacto: 'contacto',
  contact: 'contacto',
};

const COMMANDS = [
  'help', 'whoami', 'fastfetch', 'ls', 'cat bio.txt', 'cd', 'email', 'github', 'linkedin',
  'tema', 'theme', 'kitty', 'cmatrix', 'cava', 'hyprctl', 'lang', 'history', 'date', 'clear',
  'sudo hire-me', 'exit', 'proyectos', 'projects', 'contacto', 'contact', 'sobre-mi', 'about', 'echo',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
export const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export interface TerminalOptions {
  boot?: boolean;
  /** abre una kitty nueva; devuelve false si no cabe */
  spawn?: () => boolean;
  /** cierra esta ventana (solo en kitties) */
  close?: () => void;
}

export interface TerminalApi {
  run: (cmd: string) => void;
  typeAndRun: (cmd: string, speed?: number) => Promise<void>;
  ready: Promise<void>;
  focus: () => void;
}

export function createTerminal(root: HTMLElement, opts: TerminalOptions = {}): TerminalApi | null {
  const term = root.querySelector<HTMLElement>('.term');
  const out = root.querySelector<HTMLElement>('.term__out');
  const form = root.querySelector<HTMLFormElement>('.term__line');
  const input = root.querySelector<HTMLInputElement>('.term__input');
  if (!term || !out || !form || !input) return null;

  const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  const T = TXT[lang];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const history: string[] = [];
  let histIdx = 0;
  let skipBoot = false;
  // efecto a pantalla completa en curso (cmatrix, cava); se para con cualquier tecla
  let stopEffect: (() => void) | null = null;

  const scrollDown = () => (term.scrollTop = term.scrollHeight);

  const print = (html: string, cls = '') => {
    const line = document.createElement('div');
    line.className = `line ${cls}`.trim();
    line.innerHTML = html;
    out.appendChild(line);
    scrollDown();
    return line;
  };

  const promptHtml = (cmd: string) =>
    `<span class="prompt"><span class="seg seg--os">pozo</span><span class="seg seg--path">~</span><span class="seg-end"></span></span> ${esc(cmd)}`;

  // fastfetch: la salida se renderiza en el servidor dentro de <template id="ff-tpl">
  const fastfetch = () => {
    const tpl = document.getElementById('ff-tpl') as HTMLTemplateElement | null;
    if (tpl) print('').appendChild(tpl.content.cloneNode(true));
  };

  const goTo = (id: string) => goToSection(id);

  const run = (raw: string) => {
    const cmdline = raw.trim();
    print(promptHtml(cmdline));
    if (!cmdline) return;
    history.push(cmdline);
    histIdx = history.length;

    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(' ');
    const c = cmd.toLowerCase();

    if (SECTIONS[c] && c !== '~') {
      print(T.going(c), 'c-muted');
      return goTo(SECTIONS[c]);
    }

    switch (c) {
      case 'help':
      case 'ayuda':
        return print(`<div class="cols">${T.help.map(([k, v]) => `<span class="ok">${esc(k)}</span><span class="c-muted">${v}</span>`).join('')}</div>`);
      case 'whoami':
        return print(T.whoami);
      case 'fastfetch':
        return fastfetch();
      case 'neofetch':
        return print(T.neofetch);
      case 'ls':
        return print(['proyectos', 'sobre-mi', 'contacto'].map((d) => `<a href="#${d}">${d}/</a>`).join('  ') + '  bio.txt');
      case 'cat':
        return /^bio/.test(arg) ? print(T.readme) : print(`cat: ${esc(arg || '')}: No such file or directory`, 'c-danger');
      case 'cd': {
        const target = SECTIONS[arg.replace(/\/$/, '').toLowerCase() || '~'];
        if (!target) return print(T.cdBad(esc(arg)), 'c-danger');
        print(T.going(esc(arg || '~')), 'c-muted');
        return goTo(target);
      }
      case 'email': {
        const mail = getEmail();
        return print(`<a href="mailto:${mail}">${mail}</a>`);
      }
      case 'github':
      case 'linkedin': {
        const url = SOCIAL[c];
        print(`${T.opening(c)} <a href="${url}" target="_blank" rel="noopener">${url}</a>`, 'c-muted');
        window.open(url, '_blank', 'noopener');
        return;
      }
      case 'tema':
      case 'theme': {
        if (!arg) {
          return print(
            `${T.themes}\n` +
              THEMES.map((th) => `  ${th.id === currentTheme() ? '<span class="ok">●</span>' : '○'} ${th.id}  <span class="c-muted">${th.label}</span>`).join('\n'),
          );
        }
        const id = arg.toLowerCase().split(/\s/)[0];
        return applyTheme(id) ? print(T.themeSet(id)) : print(T.themeBad(esc(id)), 'c-danger');
      }
      case 'kitty':
      case 'alacritty':
      case 'foot': {
        if (!opts.spawn) return print(T.notFound(esc(cmd)), 'c-danger');
        print(T.kittyOpen, 'c-muted');
        if (!opts.spawn()) print(T.kittyFull, 'c-warn');
        return;
      }
      case 'cmatrix':
        stopEffect = cmatrix(term);
        return;
      case 'cava':
        stopEffect = cava(term);
        return;
      case 'hyprctl':
        return print(hyprctl(args, lang));
      case 'lang':
      case 'idioma': {
        const to = arg.toLowerCase() === 'en' ? 'en' : arg.toLowerCase() === 'es' ? 'es' : lang === 'es' ? 'en' : 'es';
        if (to === lang) return;
        print(T.langSwitch, 'c-muted');
        setTimeout(() => (location.href = to === 'es' ? '/' : '/en/'), 300);
        return;
      }
      case 'history':
        return print(history.map((h, i) => `${String(i + 1).padStart(4)}  ${esc(h)}`).join('\n'));
      case 'date':
        return print(new Date().toLocaleString(lang === 'es' ? 'es-ES' : 'en-GB', { dateStyle: 'full', timeStyle: 'medium' }));
      case 'clear':
        out.innerHTML = '';
        return;
      case 'echo':
        return print(esc(arg));
      case 'sudo':
        if (/hire|contrat/i.test(arg)) {
          print(T.hire);
          setTimeout(() => goTo('contacto'), 900);
          return;
        }
        return print(T.sudo, 'c-danger');
      case 'rm':
        return print(T.rm, 'c-warn');
      case 'exit':
      case 'logout':
        if (opts.close) return opts.close();
        return print(T.exit, 'c-magenta');
      default:
        return print(T.notFound(esc(cmd)), 'c-danger');
    }
  };

  const typeAndRun = async (cmd: string, speed = 45) => {
    if (reduceMotion) return run(cmd);
    input.value = '';
    for (const ch of cmd) {
      input.value += ch;
      await sleep(speed);
    }
    input.value = '';
    run(cmd);
  };

  // --- arranque: rápido, no bloquea la página y se puede saltar ---
  const boot = async () => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === '1';
    } catch {}

    if (!seen && !reduceMotion) {
      term.dataset.booting = '';
      out.setAttribute('aria-busy', 'true');
      const skip = () => (skipBoot = true);
      term.addEventListener('pointerdown', skip, { once: true });
      document.addEventListener('keydown', skip, { once: true });

      for (const l of BOOT_LINES) {
        if (skipBoot) break;
        print(
          esc(l)
            .replace(/\[\s+OK\s+\]/, '[<span class="ok">  OK  </span>]')
            .replace(/^\[\s*[\d.]+\]/, (m) => `<span class="ts">${m}</span>`),
          'boot',
        );
        await sleep(40 + Math.random() * 60);
      }
      if (!skipBoot) await sleep(250);
      out.innerHTML = '';
      out.removeAttribute('aria-busy');
    }

    delete term.dataset.booting;
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {}

    print(promptHtml('fastfetch').replace(/ fastfetch$/, ' '), 'typing');
    const typingLine = out.lastElementChild as HTMLElement;
    if (!reduceMotion && !skipBoot && !seen) {
      typingLine.innerHTML += '<span class="cursor"></span>';
      for (const ch of 'fastfetch') {
        await sleep(55);
        typingLine.querySelector('.cursor')!.insertAdjacentText('beforebegin', ch);
      }
      await sleep(150);
    }
    typingLine.remove();
    run('fastfetch');
    history.length = 0;
    histIdx = 0;
    print(T.welcome);
  };

  // --- interacción ---
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const v = input.value;
    input.value = '';
    run(v);
  });

  input.addEventListener('keydown', (e) => {
    if (stopEffect) {
      e.preventDefault();
      stopEffect();
      stopEffect = null;
      return;
    }
    if (e.key === 'ArrowUp' && history.length) {
      e.preventDefault();
      histIdx = Math.max(0, histIdx - 1);
      input.value = history[histIdx] ?? '';
    } else if (e.key === 'ArrowDown' && history.length) {
      e.preventDefault();
      histIdx = Math.min(history.length, histIdx + 1);
      input.value = history[histIdx] ?? '';
    } else if (e.key === 'Tab') {
      const v = input.value.toLowerCase();
      if (!v) return;
      e.preventDefault();
      const [first, ...rest] = v.split(' ');
      if (rest.length && (first === 'cd' || first === 'tema' || first === 'theme')) {
        const pool = first === 'cd' ? Object.keys(SECTIONS) : THEMES.map((t) => t.id);
        const hit = pool.find((p) => p.startsWith(rest.join(' ')));
        if (hit) input.value = `${first} ${hit}`;
      } else {
        const hit = COMMANDS.find((c) => c.startsWith(v));
        if (hit) input.value = hit;
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      out.innerHTML = '';
    }
  });

  // click en la terminal = foco al input (sin robar la selección de texto); también corta efectos
  term.addEventListener('click', () => {
    if (stopEffect) {
      stopEffect();
      stopEffect = null;
    }
    if (!getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  let ready: Promise<void>;
  if (opts.boot) {
    ready = boot();
  } else {
    print(T.kittyWelcome);
    ready = Promise.resolve();
  }

  return {
    run,
    async typeAndRun(cmd, speed = 35) {
      skipBoot = true;
      await ready;
      return typeAndRun(cmd, speed);
    },
    ready,
    focus: () => input.focus({ preventScroll: true }),
  };
}
