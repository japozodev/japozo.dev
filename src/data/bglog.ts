// Log de fondo del hero: líneas tipo journalctl que se desplazan muy despacio.
// Determinista (sin Math.random) para que el HTML sea igual en cada build.

const UNITS = ['systemd[1]', 'kernel', 'NetworkManager[612]', 'hyprland[1043]', 'zsh[2210]', 'astro[3318]', 'git[3402]', 'pipewire[987]'];

const MSGS = [
  'Started User Manager for UID 1000.',
  'Reached target Graphical Interface.',
  'wlp3s0: link becomes ready',
  'workspace 1: focused window kitty',
  'building static routes...',
  '2 page(s) built in 1.92s',
  'nvme0n1: p1 p2 p3',
  'commit 06e198a: recupera el hero',
  'dhcp4 (wlp3s0): state changed bound',
  'monitor eDP-1 1920x1080@60',
  'compiling src/pages/index.astro',
  'optimized 15 images',
  'Finished Cleanup of Temporary Directories.',
  'EXT4-fs (nvme0n1p2): mounted filesystem',
  'npm run dev -- watching for changes',
  'Started Daily man-db regeneration.',
  'layer surface: waybar mapped',
  'push origin main: done',
  'audit: type=1130 res=success',
  'fastfetch: rendered logo JAPOZO>',
];

export const BG_LOG = Array.from({ length: 36 }, (_, i) => {
  const s = (i * 7919) % 86400;
  const time = [Math.floor(s / 3600), Math.floor((s % 3600) / 60), s % 60].map((n) => String(n).padStart(2, '0')).join(':');
  return `nov 09 ${time} japozo ${UNITS[(i * 5) % UNITS.length]}: ${MSGS[(i * 3) % MSGS.length]}`;
}).sort();
