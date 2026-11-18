# japozo.dev

Portfolio personal de J. A. Pozo, desarrollador web. En vivo en [japozo.dev](https://japozo.dev) (español) y [japozo.dev/en/](https://japozo.dev/en/) (inglés).

Hecho con Astro 7, sin frameworks de interfaz: HTML, CSS y TypeScript a pelo. La estética es la de un escritorio Linux en mosaico: terminal interactiva, btop con habilidades y las secciones como caras de un cubo 3D que se gira con el ratón, el teclado o el dedo.

## Qué tiene

- **Cubo de workspaces** (pantallas de 1100px o más): cada sección es una cara. Gira arrastrando, con la rueda, con las flechas o con las teclas 1-4. Las tapas de arriba y abajo son decorativas (logo y un `git log --graph`).
- **Modo swipe** en móvil y tablet: caras apiladas que giran siguiendo al dedo.
- **Modo vertical** con movimiento reducido: la web de toda la vida, sin 3D.
- **Terminal** con comandos (`help`, `kitty`, `cube`, `exit`, `reboot`, `404`...), autocompletado y algún easter egg (`cmatrix`, `cava`, `hyprctl`, `claude`).
- **Temas**: japozo (por defecto), Dracula, Cyberpunk, Gruvbox y Latte (claro).
- **404**: un laberinto en primera persona estilo raycaster. La salida devuelve a la portada.
- **Imagen social** (`/og.png`, `/en/og.png`) generada en el build.

## Requisitos

Node 22 o superior.

## Comandos

| Comando           | Acción                                        |
| :---------------- | :-------------------------------------------- |
| `npm install`     | Instala dependencias                          |
| `npm run dev`     | Servidor de desarrollo en `localhost:4321`    |
| `npm run build`   | Genera la web estática en `./dist/`           |
| `npm run preview` | Previsualiza el build                         |

## Estructura

```
src/
├── data/
│   ├── site.ts        proyectos, stack, GITGRAPH (git log de "sobre mí")
│   ├── profile.ts     SITE y SOCIAL (sin imágenes, lo importan los scripts del cliente)
│   ├── themes.ts      lista de temas (los colores están en global.css)
│   └── logo.ts        logo ASCII
├── i18n/ui.ts         textos ES/EN
├── components/        Hero, Desktop, Terminal, Btop, Projects, About, Contact...
├── scripts/
│   ├── workspaces.ts  cubo 3D, modo swipe y navegación entre caras
│   ├── terminal.ts    terminal interactiva
│   ├── maze.ts        laberinto del 404
│   └── ...            btop, efectos, temas, correo ofuscado, easter eggs
├── styles/
│   ├── global.css     estilos base y temas
│   ├── cube.css       modo cubo
│   └── swipe.css      modo swipe
├── lib/og.ts          generador de la imagen social
├── pages/             index, en/index, 404, og.png
└── assets/projects/   capturas de los proyectos
public/
├── .htaccess          404, redirecciones (www, http, /safeMode/) y caché
└── fonts/             Hack Nerd Font recortada (licencia incluida)
```

### Añadir un proyecto

En `src/data/site.ts`, con nombre, dominio, la parte que hice, stack y una captura en `src/assets/projects/<slug>.png|jpg`.

## Despliegue

Servidor Plesk (nginx delante de Apache), así que el `.htaccess` de `public/` se aplica.

1. `npm run build`
2. Comprimir `dist/` en un zip con permisos Unix (644 ficheros, 755 carpetas).
3. En Plesk: Archivos → `httpdocs` → Cargar archivo → Extraer con reemplazar → borrar el zip.

La carpeta `httpdocs/app` del servidor no se toca.

## Licencia

El código es mío; si te sirve algo como idea, adelante. Las capturas de proyectos pertenecen a sus clientes. Hack Nerd Font tiene su propia licencia (`public/fonts/LICENSE-HackNerdFont.txt`).
