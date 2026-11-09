import type { ImageMetadata } from 'astro';
import iptopografia from '../assets/projects/iptopografia.png';
import allianz from '../assets/projects/allianz.png';
import r2r from '../assets/projects/r2r.png';

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
  stack: string[];
}

// TODO: role, stack y year son provisionales, revisar con los datos reales
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
      es: 'Web corporativa para una empresa de topografía: servicios, proyectos y contacto en una experiencia clara y rápida.',
      en: 'Corporate website for a land surveying company: services, projects and contact in a clear, fast experience.',
    },
    role: { es: 'Diseño + desarrollo', en: 'Design + development' },
    stack: ['WordPress', 'Elementor', 'CSS'],
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
      es: 'Sitio corporativo para un agente de una compañía internacional de seguros y activos financieros.',
      en: 'Corporate site for an agent of an international insurance and asset management company.',
    },
    role: { es: 'Diseño + desarrollo', en: 'Design + development' },
    stack: ['WordPress', 'Elementor', 'JavaScript'],
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
      es: 'Desarrollo web para una consultoría especializada en servicios inmobiliarios integrales.',
      en: 'Website for a consultancy specialised in end-to-end property services.',
    },
    role: { es: 'Desarrollo frontend', en: 'Frontend development' },
    stack: ['WordPress', 'CSS', 'JavaScript'],
  },
  {
    slug: 'proyecto-04',
    name: 'proyecto_04',
    year: '2026',
    status: 'queued',
    desc: {
      es: 'Hueco reservado para el próximo proyecto destacado. Compilando...',
      en: 'Slot reserved for the next featured project. Compiling...',
    },
    role: { es: 'Por definir', en: 'TBD' },
    stack: ['???'],
  },
];

// Salida estilo `pacman -Q`
export const STACK = [
  { pkg: 'html5', ver: 'living-std', icon: '' },
  { pkg: 'css3', ver: 'nesting+grid', icon: '' },
  { pkg: 'javascript', ver: 'es2025', icon: '' },
  { pkg: 'astro', ver: '7.x', icon: '' },
  { pkg: 'wordpress', ver: '6.x', icon: '' },
  { pkg: 'elementor', ver: 'pro', icon: '' },
  { pkg: 'bootstrap', ver: '5.x', icon: '' },
  { pkg: 'git', ver: '2.x', icon: '' },
  { pkg: 'github', ver: 'cli', icon: '' },
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
    msg: { es: 'feat: frontend developer en @Kewo', en: 'feat: frontend developer at @Kewo' },
  },
  {
    hash: '5e8d1ec',
    msg: { es: 'refactor: cambio de rumbo hacia el desarrollo web', en: 'refactor: career switch to web development' },
  },
  {
    hash: '0000001',
    tag: 'v1.0',
    msg: { es: 'init: +20 años trabajando con hardware', en: 'init: 20+ years working with hardware' },
  },
];
