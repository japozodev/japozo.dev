import { SOCIAL } from '../data/site';
import { THEMES } from '../data/themes';
import { applyTheme, currentTheme } from './theme';
import { getEmail } from './email';

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
  '[  OK  ] Started CSS Grid Layout Service.',
  '[  OK  ] Started JavaScript Runtime.',
  '[  OK  ] Reached target Creative Mode.',
  '[    2.104512] japozo.dev: portfolio v27 ready',
];

type Lang = 'es' | 'en';

const TXT = {
  es: {
    welcome: 'Bienvenido a <b>japozo.dev</b>. Escribe <span class="ok">help</span> para ver los comandos.',
    notFound: (c: string) => `zsh: comando no encontrado: ${c}`,
    help: [
      ['help', 'muestra esta ayuda'],
      ['whoami', 'quién soy'],
      ['fastfetch', 'info del sistema'],
      ['ls', 'lista el contenido'],
      ['cat bio.txt', 'presentación corta'],
      ['cd <sección>', 'ir a proyectos, sobre-mi, contacto'],
      ['email', 'muestra mi email'],
      ['github · linkedin', 'abre mis perfiles'],
      ['tema [nombre]', 'cambia el tema de colores'],
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
    going: (t: string) => `Navegando a ~/${t}...`,
    sudo: 'pozo no está en el archivo sudoers. Este incidente será reportado.',
    hire: '[sudo] contraseña para pozo: ********\n<span class="ok">Acceso concedido.</span> Me encanta la idea. Te llevo a contacto...',
    rm: 'Buen intento. Este sistema está protegido por café y copias de seguridad.',
    exit: 'No hay salida. Ya formas parte de japozo.dev.',
    opening: (t: string) => `Abriendo ${t}...`,
    neofetch: 'neofetch: descansa en paz. Prueba con <span class="ok">fastfetch</span>.',
    langSwitch: 'Cambiando de idioma...',
  },
  en: {
    welcome: 'Welcome to <b>japozo.dev</b>. Type <span class="ok">help</span> to list the commands.',
    notFound: (c: string) => `zsh: command not found: ${c}`,
    help: [
      ['help', 'show this help'],
      ['whoami', 'who I am'],
      ['fastfetch', 'system info'],
      ['ls', 'list contents'],
      ['cat bio.txt', 'short intro'],
      ['cd <section>', 'go to projects, about, contact'],
      ['email', 'show my email'],
      ['github · linkedin', 'open my profiles'],
      ['theme [name]', 'change the colour theme'],
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
    going: (t: string) => `Navigating to ~/${t}...`,
    sudo: 'pozo is not in the sudoers file. This incident will be reported.',
    hire: '[sudo] password for pozo: ********\n<span class="ok">Access granted.</span> Love the idea. Taking you to contact...',
    rm: 'Nice try. This system is protected by coffee and backups.',
    exit: 'There is no exit. You are part of japozo.dev now.',
    opening: (t: string) => `Opening ${t}...`,
    neofetch: 'neofetch: rest in peace. Try <span class="ok">fastfetch</span>.',
    langSwitch: 'Switching language...',
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
  'help', 'ayuda', 'whoami', 'fastfetch', 'ls', 'cat bio.txt', 'cd', 'email', 'github', 'linkedin',
  'tema', 'theme', 'lang', 'history', 'date', 'clear', 'sudo hire-me', 'exit',
  'proyectos', 'projects', 'contacto', 'contact', 'sobre-mi', 'about', 'echo',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function initTerminal() {
  const term = document.getElementById('term');
  const out = document.getElementById('term-out');
  const form = document.getElementById('term-form') as HTMLFormElement | null;
  const input = document.getElementById('term-input') as HTMLInputElement | null;
  if (!term || !out || !form || !input) return;

  const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  const T = TXT[lang];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const history: string[] = [];
  let histIdx = 0;
  let skipBoot = false;

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

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
  };

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
  const finishBoot = () => {
    delete term.dataset.booting;
    try {
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {}
  };

  const boot = async () => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === '1';
    } catch {}

    if (!seen && !reduceMotion) {
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

    finishBoot();
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

  // click en la terminal = foco al input (sin robar la selección de texto)
  term.addEventListener('click', () => {
    if (!getSelection()?.toString()) input.focus({ preventScroll: true });
  });

  document.querySelectorAll<HTMLButtonElement>('.chip[data-cmd]').forEach((chip) =>
    chip.addEventListener('click', async () => {
      skipBoot = true;
      await booted;
      typeAndRun(chip.dataset.cmd!, 35);
    }),
  );

  const booted = boot();
}
