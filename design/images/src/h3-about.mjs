// H3 — About hero: Deep Glass stage (dark base, aurora, walls, grain) with a clay subject on the
// right, matching the service heroes (H2). Story: everything Sova builds — a website, an app that
// lifts the numbers, a brand palette, a search result on top — gathered into one studio desk.
// Text: x <= 970 at every width, so the clay group lives at x >= 1270. Mobile shows x 690–1253;
// below its CTA (y >= ~650) a dim ink slab rises from the floor at x >= 1010: calm, not dead black.
import { svg, n, grainRect } from '../lib/svg.mjs';
import { T, glassDefs, aurora, wallX } from '../lib/glass.mjs';
import { clayDefs, rect, inset, pill, ball, disc, soft, ring, tube, star, heart } from '../lib/clay.mjs';

const W = 2000;
const H = 900;
const p = 'h3';
const c = 'h3c';

const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${n(cx)} ${n(cy)})">${body}</g>`;

const A = [
  { x: 1660, y: 430, rx: 360, ry: 230, c: T.primary, o: 0.6 },
  { x: 1900, y: 640, rx: 220, ry: 170, c: T.violet, o: 0.32 },
  { x: 1500, y: 660, rx: 260, ry: 90, c: T.navy2, o: 0.45 },
];

// The clay group, drawn in H2 design units (1300 = one hero illustration) and placed with
// translate + scale, so the clay filters look exactly like the service heroes.
function clayGroup() {
  // browser window (website), tilted with the system's −6°
  const bx = 120;
  const by = 170;
  const bw = 640;
  const bh = 440;
  let win = rect(c, bx, by, bw, bh, 56, 'cream', 'xl');
  ['coral', 'yellow', 'mint'].forEach((col, i) => (win += disc(c, bx + 44 + i * 32, by + 40, 11, col, 'xs')));
  win += inset(c, bx + 150, by + 26, 260, 28, 14, 'mist');
  win += rect(c, bx + 32, by + 80, bw - 64, 170, 30, 'sova', 'm');
  win += pill(c, bx + 66, by + 116, 230, 24, 'cream');
  win += pill(c, bx + 66, by + 154, 150, 18, 'blue');
  win += rect(c, bx + 66, by + 192, 130, 36, 18, 'coral', 's');
  win += ball(c, bx + bw - 140, by + 160, 44, 'pink', 's');
  ['yellow', 'mint', 'violet'].forEach((col, i) => {
    const cw = (bw - 64 - 2 * 20) / 3;
    const cx = bx + 32 + i * (cw + 20);
    win += rect(c, cx, by + 272, cw, 132, 20, 'cream', 's');
    win += rect(c, cx + 12, by + 284, cw - 24, 58, 12, col, 'xs');
    win += pill(c, cx + 14, by + 356, cw * 0.6, 12, 'mist');
    win += pill(c, cx + 14, by + 378, cw * 0.38, 10, 'mist');
  });

  // phone (app): Sova body, rising bars and a star on the tallest one — "vươn tầm"
  const px = 700;
  const py = 300;
  let ph = rect(c, px, py, 220, 430, 48, 'sova', 'xl');
  ph += inset(c, px + 18, py + 52, 184, 352, 30, 'cream');
  ph += pill(c, px + 80, py + 22, 60, 12, 'blue');
  [
    [70, 'blue'],
    [130, 'violet'],
    [200, 'coral'],
  ].forEach(([h, col], i) => (ph += rect(c, px + 40 + i * 52, py + 372 - h, 40, h, 14, col, 's')));
  ph += soft(c, star(px + 160, py + 120, 34, 16), 'yellow', 10, 'm');
  ph += pill(c, px + 40, py + 104, 70, 14, 'mist');

  // brand palette chip (branding)
  const cx0 = 780;
  const cy0 = 110;
  let chip = rect(c, cx0, cy0, 300, 112, 56, 'cream', 'l');
  ['coral', 'yellow', 'mint', 'violet'].forEach((col, i) => (chip += disc(c, cx0 + 62 + i * 60, cy0 + 56, 22, col, 's')));

  // search result chip (SEO): magnifier + top row + up badge
  const sx = 30;
  const sy = 640;
  let seo = rect(c, sx, sy, 400, 120, 60, 'cream', 'l');
  seo += ring(c, sx + 66, sy + 58, 24, 'yellow', 13, 's');
  seo += tube(c, `M${sx + 84} ${sy + 76}l20 20`, 'ink', 12, 'xs');
  seo += pill(c, sx + 124, sy + 40, 170, 18, 'sova');
  seo += pill(c, sx + 124, sy + 70, 120, 14, 'mist');
  seo += disc(c, sx + 344, sy + 60, 32, 'mint', 'm');
  seo += soft(c, `M${sx + 344} ${sy + 40}l15 16h-9v18h-12v-18h-9z`, 'cream', 4, 'xs');

  let fl = '';
  fl += soft(c, star(150, 110, 46, 22), 'yellow', 14, 'l');
  fl += soft(c, heart(1040, 420, 40), 'coral', 6, 'm');
  fl += ball(c, 1000, 640, 26, 'violet', 's');
  fl += ball(c, 70, 360, 20, 'mint', 's');
  fl += ball(c, 640, 110, 18, 'pink', 's');
  fl += ball(c, 980, 260, 14, 'cyan', 's');

  return rot(-6, 420, 390, win + seo) + chip + ph + fl;
}

function svgText() {
  let defs = `<defs>${glassDefs(p, { blur: 110, frost: 50, shadow: 26, grainSeed: 5 })}${clayDefs(c)}`;
  defs += `<linearGradient id="${p}-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.base}"/><stop offset=".6" stop-color="#08090C"/><stop offset="1" stop-color="#0A0C12"/></linearGradient>`;
  defs += wallX(p, 'wall', 1080, 1420, H);
  defs += `<linearGradient id="${p}-top" x1="0" y1="0" x2="0" y2="200" gradientUnits="userSpaceOnUse"><stop offset=".3" stop-color="${T.base}"/><stop offset="1" stop-color="${T.base}" stop-opacity="0"/></linearGradient>`;
  defs += `<linearGradient id="${p}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="${T.floor}" stop-opacity="0"/><stop offset="1" stop-color="${T.floor}"/></linearGradient>`;
  defs += `<radialGradient id="${p}-gm0" cx="1660" cy="460" r="520" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  defs += `<mask id="${p}-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${p}-gm0)"/></mask>`;
  defs += `<radialGradient id="${p}-echo" cx="1180" cy="860" r="300" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity=".28"/><stop offset="1" stop-color="#0065DF" stop-opacity="0"/></radialGradient>`;
  defs += `</defs>`;

  // mobile echo: a dim ink slab rising from the floor, only its top-left corner reaches the strip
  const echo =
    `<rect x="900" y="640" width="600" height="260" fill="url(#${p}-echo)"/>` +
    `<g opacity=".45">${rot(-7, 1260, 900, rect(c, 1010, 760, 520, 300, 44, 'ink', 'l') + pill(c, 1060, 800, 150, 18, 'mist'))}</g>` +
    `<g opacity=".7">${ball(c, 1150, 735, 13, 'sova', 's')}</g>`;

  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, A) +
    `<rect width="1420" height="${H}" fill="url(#${p}-wall)"/>` +
    `<rect width="${W}" height="200" fill="url(#${p}-top)"/>` +
    echo +
    `<g transform="translate(1255 165) scale(.52)">${clayGroup()}</g>` +
    `<rect width="${W}" height="${H}" fill="url(#${p}-floor)"/>` +
    grainRect(`${p}-grain`, W, H, 0.05, `${p}-gm`);
  return svg(W, H, body);
}

export const images = [
  {
    id: 'h3-about-bg',
    target: 'wp-content/uploads/2024/02/b803093e046f6c0f65cdc5e8b18780ed.webp',
    width: W,
    height: H,
    format: 'webp',
    quality: 80,
    dither: 3,
    svg: svgText,
  },
];
