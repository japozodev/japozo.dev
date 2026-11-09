# japozo.dev · v27

Portfolio personal de J. A. Pozo. Rehecho desde cero con Astro 7, estética de terminal Manjaro y fuente Hack Nerd Font.

## Comandos

| Comando           | Acción                                  |
| :---------------- | :-------------------------------------- |
| `npm install`     | Instala dependencias                    |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321` |
| `npm run build`   | Genera la web estática en `./dist/`     |
| `npm run preview` | Previsualiza el build                   |

## Estructura

- `src/data/site.ts`: datos personales, proyectos, stack y timeline. Aquí se añaden proyectos nuevos.
- `src/data/themes.ts` + `src/styles/global.css`: temas de color (Manjaro, Tokyo Night, Gruvbox, Latte).
- `src/i18n/ui.ts`: textos ES/EN. Español en `/`, inglés en `/en/`.
- `src/scripts/terminal.ts`: terminal interactiva del hero (arranque, comandos, autocompletado).
- `public/fonts/`: Hack Nerd Font recortada a woff2 (licencia en `LICENSE-HackNerdFont.txt`).
