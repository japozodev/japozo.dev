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

export const SITE = {
  name: 'J. A. Pozo',
  handle: 'japozo',
  domain: 'https://japozo.dev',
  // base64 para que los bots no lo lean del HTML; se decodifica al hacer click
  emailB64: 'cG96b0BqYXBvem8uZGV2',
  birth: { year: 1982, month: 4 },
};

export const SOCIAL = {
  github: 'https://github.com/japozodev',
  linkedin: 'https://www.linkedin.com/in/joseantoniopozogonzalez/',
};

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
      es: 'Web corporativa para una empresa de topografía, dentro del programa Kit Digital. Del briefing al dominio en producción: diseño, desarrollo, hosting y SEO.',
      en: 'Corporate site for a land surveying company, part of the Kit Digital programme. From brief to live domain: design, build, hosting and SEO.',
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
      es: 'Web para un agente de Allianz, dentro del Kit Digital. Diseño a partir del briefing, desarrollo, alta de dominio y hosting, migración a producción y SEO.',
      en: 'Site for an Allianz agent, part of Kit Digital. Design from the brief, build, domain and hosting setup, migration to production and SEO.',
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
      es: 'Web para una consultoría inmobiliaria, dentro del Kit Digital. Me encargué de todo: diseño, desarrollo, servidor y puesta en producción.',
      en: 'Site for a property consultancy, part of Kit Digital. I handled everything: design, build, server and go-live.',
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
      es: 'Portal de venta de coches de segunda mano. Empezó como un proyecto coral y sigue siendo un trabajo de equipo. Mi parte: darle forma, los plugins a medida, la integración de los formularios con el CRM y el mantenimiento. La 404, una pista de coches sin fin, también es mía.',
      en: 'Used car sales portal. It started as a joint effort and is still teamwork. My part: shaping it, the custom plugins, the form integration with the CRM and the maintenance. The 404, an endless toy car track, is mine too.',
    },
    role: { es: 'Desarrollo y mantenimiento', en: 'Development and maintenance' },
    stack: ['WordPress', { es: 'Plugins a medida', en: 'Custom plugins' }, 'CRM'],
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
      es: 'Este portfolio: un escritorio Linux con un cubo de workspaces al estilo Compiz, una terminal que funciona y una versión móvil que gira al deslizar. Astro, CSS 3D y JavaScript a mano.',
      en: 'This portfolio: a Linux desktop with a Compiz-style workspace cube, a working terminal and a mobile version that spins as you swipe. Astro, 3D CSS and hand-written JavaScript.',
    },
    role: { es: 'Idea, diseño y desarrollo', en: 'Concept, design and development' },
    stack: ['Astro', 'CSS 3D', 'JavaScript'],
  },
  {
    slug: 'proyecto-06',
    name: 'proyecto_06',
    year: '2026',
    status: 'queued',
    desc: {
      es: 'Hueco reservado para el próximo proyecto. Compilando...',
      en: 'Slot reserved for the next project. Compiling...',
    },
    role: { es: 'Por definir', en: 'TBD' },
    stack: ['???'],
  },
];

// Salida estilo `pacman -Q`
export const STACK = [
  { pkg: 'wordpress', ver: '6.x', icon: '' },
  { pkg: 'elementor', ver: 'pro', icon: '' },
  { pkg: 'astro', ver: '7.x', icon: '' },
  { pkg: 'javascript', ver: 'es2025', icon: '' },
  { pkg: 'html5', ver: 'living-std', icon: '' },
  { pkg: 'css3', ver: 'nesting+grid', icon: '' },
  { pkg: 'tailwind', ver: '4.x', icon: '' },
  { pkg: 'bootstrap', ver: '5.x', icon: '' },
  { pkg: 'plesk', ver: 'obsidian', icon: '' },
  { pkg: 'docker', ver: 'compose', icon: '' },
  { pkg: 'redis', ver: 'cache', icon: '' },
  { pkg: 'cloudflare', ver: 'cdn+dns', icon: '' },
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
    msg: { es: 'refactor: 10 años de encargado en Viserco (proyectos y clientes)', en: 'refactor: 10 years as supervisor at Viserco (projects and clients)' },
  },
  {
    hash: '0000001',
    tag: 'v1.0',
    msg: { es: 'init: técnico de seguridad y sistemas', en: 'init: security and systems technician' },
  },
];
