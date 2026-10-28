// S4 — SEO "advantages" column (replaces a stock photo of another brand's logo).
// A clay illustration on an opaque dark glass panel, 4 : 5. The <img> uses a srcset, so the three
// smaller variants are rendered from the same source.
//   Story: clay steps climb to the top search result; the top row is lit yellow and ticked.
import { svg, n } from '../lib/svg.mjs';
import { clayDefs, rect, inset, pill, ball, disc, soft, ring, tube, star, glow } from '../lib/clay.mjs';
import { glassDefs, ghost } from '../lib/glass.mjs';

const DW = 1300;
const DH = 1625;
const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${n(cx)} ${n(cy)})">${body}</g>`;

function art() {
  const p = 's4';
  // panel (stage layer)
  const panel =
    `<linearGradient id="${p}-bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0B0D13"/><stop offset="1" stop-color="#0E1118"/></linearGradient>` +
    `<pattern id="${p}-grid" width="65" height="65" patternUnits="userSpaceOnUse"><path d="M65 0H0V65" fill="none" stroke="#fff" stroke-opacity=".035"/></pattern>`;
  const stage =
    `<rect width="${DW}" height="${DH}" fill="url(#${p}-bg)"/>` +
    `<rect width="${DW}" height="${DH}" fill="url(#${p}-grid)"/>` +
    ghost('s4g', { x: 120, y: 120, w: 1060, h: 1380, r: 70, rot: 0, o: 0.5 });

  // top search result card
  let card = rect(p, 210, 230, 880, 520, 64, 'cream', 'xl');
  card += inset(p, 260, 280, 780, 86, 43, 'mist');
  card += `<circle cx="318" cy="323" r="20" fill="none" stroke="#5E6C8F" stroke-width="9"/><path d="M333 338l18 18" stroke="#5E6C8F" stroke-width="9" stroke-linecap="round"/>`;
  card += pill(p, 370, 312, 330, 22, 'cream');
  card += rect(p, 940, 292, 82, 62, 31, 'sova', 's');
  // result rows: the top one lit
  [0, 1, 2].forEach((i) => {
    const y = 400 + i * 108;
    const top = i === 0;
    card += rect(p, 260, y, 780, 88, 28, top ? 'yellow' : 'cream', top ? 'm' : 's');
    card += disc(p, 312, y + 44, 22, top ? 'cream' : 'mist', 'xs');
    card += pill(p, 352, y + 24, top ? 380 : 330 - i * 40, 18, top ? 'cream' : 'mist');
    card += pill(p, 352, y + 54, top ? 240 : 200, 12, top ? 'cream' : 'mist');
  });
  // the tick on the top row — the focal accent
  card += disc(p, 980, 444, 46, 'mint', 'm');
  card += `<path d="M960 444l14 14 26-28" fill="none" stroke="#FEFEFE" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;

  // clay steps rising to the card
  let steps = '';
  const sx = 230;
  const base = 1420;
  [
    [150, 'blue'],
    [270, 'blue'],
    [390, 'violet'],
    [510, 'coral'],
  ].forEach(([h, col], i) => {
    steps += rect(p, sx + i * 210, base - h, 190, h, 40, col, 'l');
    steps += pill(p, sx + i * 210 + 30, base - h + 30, 90, 16, 'cream');
  });
  // a yellow star on the top step
  steps += soft(p, star(sx + 3 * 210 + 95, base - 510 - 80, 70, 34), 'yellow', 20, 'l');
  // an up-arrow badge riding the steps
  steps += disc(p, sx + 2 * 210 + 95, base - 390 - 70, 46, 'pink', 'm');
  steps += soft(p, `M${sx + 2 * 210 + 95} ${base - 390 - 96}l24 26h-14v24h-20v-24h-14z`, 'cream', 8, 'xs');

  // magnifier, lower right
  const mx = 1030;
  const my = 1180;
  let mag = tube(p, `M${mx + 64} ${my + 64}l86 86`, 'sova', 50, 'm');
  mag += inset(p, mx - 86, my - 86, 172, 172, 86, 'cyan');
  mag += ring(p, mx, my, 100, 'yellow', 42, 'l');
  mag += `<ellipse cx="${mx - 32}" cy="${my - 36}" rx="34" ry="18" fill="#fff" opacity=".55" transform="rotate(-35 ${mx - 32} ${my - 36})"/>`;

  let fl = '';
  fl += ball(p, 1130, 200, 34, 'pink', 'm');
  fl += ball(p, 140, 860, 26, 'mint', 's');
  fl += ball(p, 1180, 860, 20, 'violet', 's');
  fl += ball(p, 180, 150, 18, 'yellow', 's');
  fl += soft(p, star(1170, 640, 40, 19), 'yellow', 12, 's');

  const body =
    `<defs>${clayDefs(p)}${glassDefs('s4g')}${panel}</defs>` +
    stage +
    glow(p, [
      { x: 650, y: 820, rx: 480, ry: 520, c: '#0065DF', o: 0.45 },
      { x: 900, y: 1200, rx: 260, ry: 220, c: '#7A5CFF', o: 0.3 },
    ]) +
    rot(-4, 650, 490, card) +
    steps +
    rot(-8, mx, my, mag) +
    fl;
  return body;
}

// render the design space into any 4 : 5 size
const at = (W, H) => () => svg(W, H, `<g transform="scale(${n(W / DW, 5)})">${art()}</g>`);

const U = 'wp-content/uploads/2024/02/arthur-osipyan-5OyvN4Yx46E-unsplash';
const im = { format: 'webp', quality: 82, dither: 2 };
export const images = [
  { id: 's4-seo-advantages', target: `${U}.webp`, width: 1000, height: 1250, svg: at(1000, 1250), ...im },
  { id: 's4-seo-advantages-768', target: `${U}-768x960.webp`, width: 768, height: 960, svg: at(1000, 1250), ...im },
  { id: 's4-seo-advantages-640', target: `${U}-640x800.webp`, width: 640, height: 800, svg: at(1000, 1250), ...im },
  { id: 's4-seo-advantages-320', target: `${U}-320x400.webp`, width: 320, height: 400, svg: at(1000, 1250), ...im },
];
