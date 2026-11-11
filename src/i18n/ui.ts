import type { Lang } from '../data/site';

export const LANGS: Lang[] = ['es', 'en'];

export const ui = {
  es: {
    meta: {
      title: 'Pozo · Frontend Developer en Gijón',
      description:
        'Portfolio de J. A. Pozo, desarrollador frontend en Gijón. Webs rápidas, cuidadas y con carácter: Astro, JavaScript, WordPress y mucho terminal.',
    },
    nav: { home: 'inicio', projects: 'proyectos', about: 'sobre-mí', contact: 'contacto' },
    skip: 'Saltar al contenido',
    theme: 'Tema',
    switchLang: 'Read in English',
    hero: {
      kicker: 'frontend developer · gijón, asturias',
      hello: 'Hola, soy',
      roles: ['desarrollador frontend', 'creador de interfaces', 'ex técnico de hardware', 'amante de la terminal'],
      lead: 'Construyo webs rápidas, cuidadas y con carácter. Más de 20 años entre hardware y sistemas me enseñaron a entender cómo funcionan las cosas por dentro; ahora lo aplico al código.',
      ctaProjects: 'ver proyectos',
      ctaContact: 'hablemos',
      keys: ['girar', 'workspace', 'tapas', 'arrastrar', 'rotación libre'],
    },
    terminal: {
      title: 'pozo@japozo: ~',
      inputLabel: 'Escribe un comando',
      skip: 'click para saltar',
      ff: [
        ['Rol', 'Desarrollador frontend'],
        ['Base', 'Gijón, Asturias'],
        ['Ahora', '@Kewo'],
        ['Stack', 'Astro, JS, CSS, WordPress'],
        ['Antes', '20+ años con hardware'],
        ['Shell', 'zsh'],
        ['Font', 'Hack Nerd Font'],
      ],
      uptime: 'Uptime',
      years: 'años',
    },
    projects: {
      title: 'Proyectos',
      lead: 'Una selección de trabajos reales, en producción y con clientes de verdad.',
      visit: 'visitar',
      online: 'online',
      queued: 'en cola',
      role: 'rol',
      stack: 'stack',
      soon: 'próximamente',
    },
    about: {
      title: 'Sobre mí',
      p1: 'Me apasiona la tecnología desde que era un crío. Pasé más de 20 años trabajando con hardware: montando, reparando y entendiendo máquinas por dentro.',
      p2: 'Un día decidí cambiar de rumbo y centrarme en lo que de verdad me motiva: el desarrollo. Hoy diseño y construyo soluciones web con identidad propia, cuidando tanto la eficiencia del código como la experiencia de quien las usa.',
      stackTitle: 'paquetes instalados',
      logTitle: 'historial',
      photoAlt: 'Foto de J. A. Pozo',
    },
    contact: {
      title: '¿Hablamos?',
      lead: 'Si tienes un proyecto en mente, una idea a medio cocinar o simplemente quieres saludar, mi bandeja de entrada está abierta.',
      email: 'email',
      reveal: 'mostrar',
      copy: 'copiar',
      copied: 'email copiado al portapapeles',
      copyError: 'no se pudo copiar, selecciónalo a mano',
      location: 'ubicación',
      locationValue: 'Gijón, Asturias · remoto',
    },
    footer: { made: 'Hecho a mano con Astro, Hack Nerd Font y Fira Code' },
  },
  en: {
    meta: {
      title: 'Pozo · Frontend Developer in Gijón, Spain',
      description:
        'Portfolio of J. A. Pozo, frontend developer based in Gijón, Spain. Fast, polished websites with character: Astro, JavaScript, WordPress and plenty of terminal.',
    },
    nav: { home: 'home', projects: 'projects', about: 'about', contact: 'contact' },
    skip: 'Skip to content',
    theme: 'Theme',
    switchLang: 'Leer en español',
    hero: {
      kicker: 'frontend developer · gijón, spain',
      hello: "Hi, I'm",
      roles: ['frontend developer', 'interface builder', 'former hardware tech', 'terminal lover'],
      lead: 'I build fast, polished websites with character. Over 20 years in hardware and systems taught me how things work under the hood; now I bring that to code.',
      ctaProjects: 'see projects',
      ctaContact: "let's talk",
      keys: ['spin', 'workspace', 'lids', 'drag', 'free rotation'],
    },
    terminal: {
      title: 'pozo@japozo: ~',
      inputLabel: 'Type a command',
      skip: 'click to skip',
      ff: [
        ['Role', 'Frontend developer'],
        ['Based', 'Gijón, Spain'],
        ['Now', '@Kewo'],
        ['Stack', 'Astro, JS, CSS, WordPress'],
        ['Before', '20+ years in hardware'],
        ['Shell', 'zsh'],
        ['Font', 'Hack Nerd Font'],
      ],
      uptime: 'Uptime',
      years: 'years',
    },
    projects: {
      title: 'Projects',
      lead: 'A selection of real work, live in production for real clients.',
      visit: 'visit',
      online: 'online',
      queued: 'queued',
      role: 'role',
      stack: 'stack',
      soon: 'coming soon',
    },
    about: {
      title: 'About me',
      p1: "I've been into technology since I was a kid. I spent over 20 years working with hardware: building, repairing and understanding machines from the inside.",
      p2: 'One day I changed course to focus on what truly drives me: development. Today I design and build web solutions with their own identity, caring as much about efficient code as about the people who use them.',
      stackTitle: 'installed packages',
      logTitle: 'history',
      photoAlt: 'Photo of J. A. Pozo',
    },
    contact: {
      title: "Let's talk",
      lead: "Got a project in mind, a half-baked idea or just want to say hi? My inbox is open.",
      email: 'email',
      reveal: 'reveal',
      copy: 'copy',
      copied: 'email copied to clipboard',
      copyError: "couldn't copy, select it manually",
      location: 'location',
      locationValue: 'Gijón, Spain · remote',
    },
    footer: { made: 'Handmade with Astro, Hack Nerd Font and Fira Code' },
  },
} as const;

export const useTranslations = (lang: Lang) => ui[lang];

export const pathFor = (lang: Lang) => (lang === 'es' ? '/' : '/en/');
