import type { ImageMetadata } from 'astro';
import iptopografia from '../assets/projects/iptopografia.png';
import allianz from '../assets/projects/allianz.png';
import r2r from '../assets/projects/r2r.png';

// capturas opcionales: si el archivo existe en assets/projects se usa; si no, la
// tarjeta muestra el dominio
const shots = import.meta.glob<{ default: ImageMetadata }>('../assets/projects/*.{png,jpg}', { eager: true });
const shot = (name: string) => (shots[`../assets/projects/${name}.png`] ?? shots[`../assets/projects/${name}.jpg`])?.default;

export type Lang = 'es' | 'en';
type Localized = Record<Lang, string>;

export { SITE, SOCIAL } from './profile';

export interface Project {
  slug: string;
  name: string;
  domain?: string;
  url?: string;
  image?: ImageMetadata;
  year: string;
  status: 'online' | 'queued';
  desc: Localized;
  role: Localized;
  /** etiquetas; las que cambian con el idioma van localizadas */
  stack: (string | Localized)[];
}

export const PROJECTS: Project[] = [
  {
    slug: 'iptopografia',
    name: 'IP Topografía',
    domain: 'iptopografia.com',
    url: 'https://iptopografia.com',
    image: iptopografia,
    year: '2025',
    status: 'online',
    desc: {
      es: 'Web de una empresa de topografía asturiana: levantamientos, láser escáner y gestión catastral. Llegó por el Kit Digital, pero se hizo un proyecto a medida.',
      en: 'Site for an Asturian land surveying firm: surveys, laser scanning and land registry work. It came through Kit Digital, but it became a custom-built project.',
    },
    role: { es: 'Proyecto completo', en: 'End to end' },
    stack: ['WordPress', 'Elementor', 'SEO'],
  },
  {
    slug: 'allianz',
    name: 'Allianz Partner',
    domain: 'pedroalegre.es',
    url: 'https://www.pedroalegre.es/',
    image: allianz,
    year: '2025',
    status: 'online',
    desc: {
      es: 'Web para una agencia de Allianz en Gijón. Una ayuda del Kit Digital que no se quedó en lo mínimo: pensada y montada sección a sección.',
      en: "Site for an Allianz agency in Gijón. A Kit Digital grant that didn't settle for the bare minimum: planned and built section by section.",
    },
    role: { es: 'Proyecto completo', en: 'End to end' },
    stack: ['WordPress', 'Elementor', 'SEO'],
  },
  {
    slug: 'r2r',
    name: 'R2R Consulting',
    domain: 'r2r.es',
    url: 'https://r2r.es/',
    image: r2r,
    year: '2025',
    status: 'online',
    desc: {
      es: 'Web de una consultoría inmobiliaria: compraventa, alquiler, reformas e inversión. Salió del Kit Digital, pero con el mimo de un proyecto propio, y se nota al navegarla.',
      en: 'Site for a property consultancy: sales, rentals, renovations and investment. It came out of Kit Digital, but with the care of a project of my own, and it shows as you browse it.',
    },
    role: { es: 'Proyecto completo', en: 'End to end' },
    stack: ['WordPress', 'Elementor', 'Hosting'],
  },
  {
    slug: 'breoganocasion',
    name: 'Breogán Ocasión',
    domain: 'breoganocasion.com',
    url: 'https://www.breoganocasion.com/',
    image: shot('breoganocasion'),
    year: '2026',
    status: 'online',
    desc: {
      es: 'Portal de venta de coches de segunda mano. Empezó como un proyecto coral y sigue siendo un trabajo de equipo. Mi parte: darle forma, funcionalidades del panel de administración, la integración de los formularios con el CRM y el mantenimiento. La 404, una pista de coches sin fin, también es mía.',
      en: 'Used car sales portal. It started as a joint effort and is still teamwork. My part: shaping it, features for the admin panel, the form integration with the CRM and the maintenance. The 404, an endless toy car track, is mine too.',
    },
    role: { es: 'Desarrollo y mantenimiento', en: 'Development and maintenance' },
    stack: ['Laravel', 'Livewire', 'CRM'],
  },
  {
    slug: 'japozo',
    name: 'japozo.dev',
    domain: 'japozo.dev',
    url: 'https://japozo.dev',
    image: shot('japozo'),
    year: '2026',
    status: 'online',
    desc: {
      es: 'Este portfolio: un escritorio Linux con un cubo de workspaces al estilo Compiz, una terminal que funciona y una versión móvil que gira al deslizar. Astro, CSS 3D y JavaScript.',
      en: 'This portfolio: a Linux desktop with a Compiz-style workspace cube, a working terminal and a mobile version that spins as you swipe. Astro, 3D CSS and JavaScript.',
    },
    role: { es: 'Idea, diseño y desarrollo', en: 'Concept, design and development' },
    stack: ['Astro', 'CSS 3D', 'JavaScript'],
  },
];

// Salida estilo `pacman -Q`, con para qué se usa cada cosa en lugar de la versión
export const STACK = [
  { pkg: 'wordpress', use: { es: 'webs de cliente', en: 'client sites' }, icon: '' },
  { pkg: 'elementor', use: { es: 'diseño visual', en: 'visual design' }, icon: '' },
  { pkg: 'astro', use: { es: 'webs rápidas', en: 'fast sites' }, icon: '' },
  { pkg: 'laravel', use: { es: 'apps a medida', en: 'custom apps' }, icon: '' },
  { pkg: 'livewire', use: { es: 'paneles admin', en: 'admin panels' }, icon: '' },
  { pkg: 'javascript', use: { es: 'interacción', en: 'interactivity' }, icon: '' },
  { pkg: 'html5', use: { es: 'maquetación', en: 'layout' }, icon: '' },
  { pkg: 'css3', use: { es: 'estilo y 3D', en: 'style & 3D' }, icon: '' },
  { pkg: 'tailwind', use: { es: 'estilo y prototipos', en: 'styling & prototypes' }, icon: '' },
  { pkg: 'bootstrap', use: { es: 'estilos y diseño', en: 'styling & design' }, icon: '' },
  { pkg: 'plesk', use: { es: 'servidores', en: 'servers' }, icon: '' },
  { pkg: 'docker', use: { es: 'entornos dev', en: 'dev setups' }, icon: '' },
  { pkg: 'redis', use: { es: 'caché', en: 'caching' }, icon: '' },
  { pkg: 'cloudflare', use: { es: 'cdn y dns', en: 'cdn & dns' }, icon: '' },
];

// Salida estilo `git log --oneline`
export const TIMELINE: { hash: string; tag?: string; msg: Localized }[] = [
  {
    hash: 'a27f0de',
    tag: 'HEAD -> main',
    msg: { es: 'feat: japozo.dev v27, rehecha desde cero', en: 'feat: japozo.dev v27, rebuilt from scratch' },
  },
  {
    hash: '9c41b2e',
    msg: { es: 'feat: desarrollador web en @Kewo tras las prácticas', en: 'feat: web developer at @Kewo after the internship' },
  },
  {
    hash: '7d3e9a1',
    msg: { es: 'feat: ciclo superior de desarrollo web, 3 años a la vez que el trabajo', en: 'feat: web development degree, 3 years alongside the job' },
  },
  {
    hash: '5e8d1ec',
    msg: { es: 'refactor: 10 años de encargado en Viserco Seguridad (proyectos y clientes)', en: 'refactor: 10 years as supervisor at Viserco Seguridad (projects and clients)' },
  },
  {
    hash: '0000001',
    tag: 'v1.0',
    msg: {
      es: 'init: 10 años departamento sistemas en Desecom Seguridad (León)',
      en: 'init: 10 years, systems department at Desecom Seguridad (León)',
    },
  },
];

// Salida estilo `git log --graph --oneline --decorate` para la base del cubo: la
// rama de estudios sale del trabajo en seguridad y se fusiona en main al entrar en
// Kewo. `graph` es el dibujo de ramas tal cual lo pinta git (columna 0 = main).
export const GITGRAPH: { graph: string; hash?: string; refs?: string; msg?: Localized }[] = [
  {
    graph: '* ',
    hash: 'a27f0de',
    refs: 'HEAD -> main',
    msg: { es: 'feat: japozo.dev v27, rehecha desde cero', en: 'feat: japozo.dev v27, rebuilt from scratch' },
  },
  { graph: '* ', hash: '9c41b2e', msg: { es: 'feat: desarrollador web en @Kewo', en: 'feat: web developer at @Kewo' } },
  {
    graph: '*   ',
    hash: 'e1f0b7c',
    msg: { es: "Merge branch 'desarrollo-web'", en: "Merge branch 'desarrollo-web'" },
  },
  { graph: '|\\' },
  {
    graph: '| * ',
    hash: '7d3e9a1',
    refs: 'desarrollo-web',
    msg: { es: 'feat: prácticas en @Kewo', en: 'feat: internship at @Kewo' },
  },
  {
    graph: '| * ',
    hash: 'b84d2f0',
    msg: { es: 'feat: ciclo superior de desarrollo web, 3 años', en: 'feat: web development degree, 3 years' },
  },
  {
    graph: '* | ',
    hash: 'c5a1d9e',
    msg: { es: 'chore: encargado, padre y estudiante a la vez', en: 'chore: supervisor, dad and student at once' },
  },
  { graph: '|/' },
  {
    graph: '* ',
    hash: '5e8d1ec',
    msg: { es: 'feat: 10 años de encargado en Viserco Seguridad', en: 'feat: 10 years as supervisor at Viserco Seguridad' },
  },
  {
    graph: '* ',
    hash: '0000001',
    refs: 'tag: v1.0',
    msg: {
      es: 'init: 10 años departamento sistemas en Desecom Seguridad (León)',
      en: 'init: 10 years, systems department at Desecom Seguridad (León)',
    },
  },
];
