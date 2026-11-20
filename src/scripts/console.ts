// Easter egg para quien abra la consola (F12): el logo en el acento del tema y un saludo.
// Es la pareja del comentario que va al principio del HTML (ver layouts/Base.astro).

import { LOGO } from '../data/logo';
import { SOCIAL } from '../data/profile';

const TEXT = {
  es: {
    title: '¡Qué pasa, curioso! ¿Trasteando en la consola?',
    body: [
      'Aquí no hay errores que ver (espero), pero sí código',
      `que leer: ${SOCIAL.github}/japozo.dev`,
      'Si te gusta cómo trabajo, hablamos: https://japozo.dev/#contacto',
    ],
    hint: '$ prueba a escribir help en la terminal de la portada',
  },
  en: {
    title: "What's up, curious one! Poking around the console?",
    body: [
      "No errors to see here (hopefully), but there's code",
      `to read: ${SOCIAL.github}/japozo.dev`,
      "If you like how I work, let's talk: https://japozo.dev/en/#contacto",
    ],
    hint: '$ try typing help in the terminal on the home page',
  },
};

export function consoleHello() {
  const t = TEXT[document.documentElement.lang === 'en' ? 'en' : 'es'];
  // el acento del tema que tenga puesto el visitante
  const accent = getComputedStyle(document.documentElement).getPropertyValue('--accent').trim() || '#35bf5c';
  const mono = 'font-family: "Hack Nerd Font", "Fira Code", monospace; line-height: 1.2;';

  console.log(
    `%c${LOGO}\n\n%c${t.title}\n%c${t.body.join('\n')}\n\n%c${t.hint}`,
    `${mono} color: ${accent};`,
    `color: ${accent}; font-weight: bold; font-size: 1.15em;`,
    '',
    'color: #888;',
  );
}
