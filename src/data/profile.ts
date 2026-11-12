// datos que también usan los scripts del navegador: aquí no se importan imágenes,
// para que las capturas originales no acaben en el bundle del cliente
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
