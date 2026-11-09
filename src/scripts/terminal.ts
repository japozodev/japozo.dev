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
  '[  OK  ] Reached target Graphical Interface.',
  '[    1.904512] japozo.dev: v27 ready',
];

type Lang = 'es' | 'en';

const TXT = {
  es: {
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
    bio: 'Hago webs rápidas, cuidadas y con carácter.',
    themes: 'Temas disponibles (usa: tema &lt;nombre&gt;):',
    themeSet: (t: string) => `Tema cambiado a <span class="ok">${t}</span>.`,
    themeBad: (t: string) => `tema: '${t}' no existe.`,
    cdBad: (t: string) => `cd: no existe el directorio: ${t}`,
    sudo: 'pozo no está en el archivo sudoers. Este incidente será reportado.',
    hire: '[sudo] contraseña para pozo: ********\n<span class="ok">Acceso concedido.</span> Me encanta la idea. Te llevo a contacto...',
    rm: 'Buen intento. Este sistema está protegido por café y copias de seguridad.',
    neofetch: 'neofetch: descansa en paz. Prueba con <span class="ok">fastfetch</span>.',
    exit: 'No hay salida. Ya formas parte de japozo.dev.',
    opening: (t: string) => `Abriendo ${t}...`,
    langSwitch: 'Cambiando de idioma...',
  },
  en: {
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
    bio: 'I build fast, polished websites with character.',
    themes: 'Available themes (use: theme &lt;name&gt;):',
    themeSet: (t: string) => `Theme switched to <span class="ok">${t}</span>.`,
    themeBad: (t: string) => `theme: '${t}' not found.`,
    cdBad: (t: string) => `cd: no such directory: ${t}`,
    sudo: 'pozo is not in the sudoers file. This incident will be reported.',
    hire: '[sudo] password for pozo: ********\n<span class="ok">Access granted.</span> Love the idea. Taking you to contact...',
    rm: 'Nice try. This system is protected by coffee and backups.',
    neofetch: 'neofetch: rest in peace. Try <span class="ok">fastfetch</span>.',
    exit: 'There is no exit. You are part of japozo.dev now.',
    opening: (t: string) => `Opening ${t}...`,
    langSwitch: 'Switching language...',
  },
};

// alias de directorios -> id de sección
const SECTIONS: Record<string, string> = {
  '~': 'inicio',
  inicio: 'inicio',
  home: 'inicio',
  proyectos: 'proyectos',
  projects: 'proyectos',
  'sobre-mi': 'sobre-mi',
  about: 'sobre-mi',
  contacto: 'contacto',
  contact: 'contacto',
};

const COMMANDS = [
  'help', 'whoami', 'fastfetch', 'ls', 'cat bio.txt', 'cd', 'email', 'github', 'linkedin',
  'tema', 'theme', 'lang', 'history', 'date', 'clear', 'sudo hire-me', 'exit', 'echo',
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);

export function initTerminal() {
  const session = document.getElementById('session');
  const log = document.getElementById('term-log');
  const form = document.getElementById('term-form') as HTMLFormElement | null;
  const input = document.getElementById('term-input') as HTMLInputElement | null;
  const bootEl = document.getElementById('boot');
  if (!session || !log || !form || !input || !bootEl) return;

  const lang: Lang = document.documentElement.lang === 'en' ? 'en' : 'es';
  const T = TXT[lang];
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const steps = [...session.querySelectorAll<HTMLElement>(':scope > .step')];
  const history: string[] = [];
  let histIdx = 0;

  const print = (html: string, cls = '') => {
    const line = document.createElement('div');
    line.className = `line ${cls}`.trim();
    line.innerHTML = html;
    log.appendChild(line);
    return line;
  };

  const ps1 = '<span class="ps1"><b>pozo@japozo</b> <i>~</i> $</span>';

  // fastfetch reutiliza el bloque renderizado en el servidor (sin el h1 ni el texto oculto)
  const fastfetch = () => {
    const ff = document.getElementById('ff')!.cloneNode(true) as HTMLElement;
    ff.removeAttribute('id');
    const h1 = ff.querySelector('h1')!;
    const logo = document.createElement('div');
    logo.className = h1.className;
    logo.appendChild(h1.querySelector('.ff__art')!);
    h1.replaceWith(logo);
    print('').appendChild(ff);
  };

  const goTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });

  const clear = () => {
    log.innerHTML = '';
    steps.forEach((s) => s !== form && (s.hidden = true));
  };

  const run = (raw: string) => {
    const cmdline = raw.trim();
    print(`${ps1} ${esc(cmdline)}`, 'is-cmd');
    if (!cmdline) return;
    history.push(cmdline);
    histIdx = history.length;

    const [cmd, ...args] = cmdline.split(/\s+/);
    const arg = args.join(' ');
    const c = cmd.toLowerCase();

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
        return print(
          [...document.querySelectorAll<HTMLAnchorElement>('.ls a')].map((a) => a.outerHTML).join('   ') + '   bio.txt',
        );
      case 'cat':
        return /^bio/.test(arg) ? print(T.bio) : print(`cat: ${esc(arg)}: No such file or directory`, 'c-danger');
      case 'cd': {
        const target = SECTIONS[arg.replace(/\/$/, '').toLowerCase() || '~'];
        if (!target) return print(T.cdBad(esc(arg)), 'c-danger');
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
            `${T.themes}\n` + THEMES.map((th) => `  ${th.id === currentTheme() ? '<span class="ok">*</span>' : ' '} ${th.id}`).join('\n'),
          );
        }
        const id = arg.toLowerCase().split(/\s/)[0];
        return applyTheme(id) ? print(T.themeSet(id)) : print(T.themeBad(esc(id)), 'c-danger');
      }
      case 'lang': {
        const a = arg.toLowerCase();
        const to = a === 'en' || a === 'es' ? a : lang === 'es' ? 'en' : 'es';
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
        return clear();
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

  // --- arranque: solo la primera vez por sesión, ~2s, se salta con cualquier interacción ---
  const boot = async () => {
    let seen = false;
    try {
      seen = sessionStorage.getItem(BOOT_KEY) === '1';
      sessionStorage.setItem(BOOT_KEY, '1');
    } catch {}
    if (seen || reduceMotion) return bootEl.remove();

    let skip = false;
    const onSkip = () => (skip = true);
    const skipEvents = ['pointerdown', 'keydown', 'wheel', 'touchstart'] as const;
    skipEvents.forEach((e) => addEventListener(e, onSkip, { passive: true }));

    session.classList.add('is-booting');
    for (const l of BOOT_LINES) {
      if (skip) break;
      const div = document.createElement('div');
      div.innerHTML = esc(l).replace(/\[\s+OK\s+\]/, '[<span class="ok">  OK  </span>]');
      bootEl.appendChild(div);
      await sleep(30 + Math.random() * 40);
    }
    if (!skip) await sleep(150);
    session.classList.remove('is-booting');
    bootEl.remove();

    // revela la sesión paso a paso, tecleando cada comando
    steps.forEach((s) => s.classList.add('is-pending'));
    for (const step of steps) {
      const typed = step.querySelector<HTMLElement>('.typed');
      const body = [...step.children].filter((c) => !c.classList.contains('cmd'));
      step.classList.remove('is-pending');
      if (!typed || skip) continue;
      const text = typed.textContent ?? '';
      body.forEach((b) => b.classList.add('is-pending'));
      typed.textContent = '';
      for (const ch of text) {
        if (skip) break;
        typed.textContent += ch;
        await sleep(28);
      }
      typed.textContent = text;
      if (!skip) await sleep(90);
      body.forEach((b) => b.classList.remove('is-pending'));
      if (!skip) await sleep(160);
    }
    skipEvents.forEach((e) => removeEventListener(e, onSkip));
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
      if (rest.length && ['cd', 'tema', 'theme'].includes(first)) {
        const pool = first === 'cd' ? Object.keys(SECTIONS) : THEMES.map((t) => t.id);
        const hit = pool.find((p) => p.startsWith(rest.join(' ')));
        if (hit) input.value = `${first} ${hit}`;
      } else {
        const hit = COMMANDS.find((c) => c.startsWith(v));
        if (hit) input.value = hit;
      }
    } else if (e.key === 'l' && e.ctrlKey) {
      e.preventDefault();
      clear();
    }
  });

  boot();
}
