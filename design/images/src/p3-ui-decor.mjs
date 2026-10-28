// P3 — UI icons (I1: mobile bar and contact widget) and small decor (I6). UI icons are flat line
// icons in `currentColor` (an <img> or CSS background does not inherit the page colour, so the
// colour is set on the root); the call and contact-info discs use the Sova clay disc; Messenger and
// Zalo keep their official marks (lib/marks.mjs).
import { clayIcon } from '../lib/icon.mjs';
import { MESSENGER, MESSENGER_GRADIENT, ZALO_WORDMARK, ZALO_BLUE } from '../lib/marks.mjs';

const U = 'wp-content/uploads';
const root = (w, h, body, attrs = '') =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"${attrs}>${body}</svg>`;
const line = (d, width) =>
  `<path d="${d}" stroke="currentColor" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"/>`;
const WHITE = ' color="#FEFEFE"';

// ------------------------------------------------------------ shared glyphs (100-unit grid)
// Handset: a quarter ring around (78, 22) with an ear pad and a mouth pad, mirrored on the
// diagonal; two call waves sit in the hollow of the ring.
const HANDSET =
  '<path d="M28 22A50 50 0 0 0 78 72" stroke="#fff" stroke-width="18"/>' +
  '<rect x="17" y="8" width="24" height="28" rx="8" fill="#fff"/><rect x="64" y="59" width="28" height="24" rx="8" fill="#fff"/>';
const WAVES = '<path d="M58 26a16 16 0 0 1 16 16M58 12a30 30 0 0 1 30 30" stroke="#fff" stroke-width="7" stroke-linecap="round"/>';
const PIN = '<path d="M50 18C36.7 18 26 28.4 26 41.4 26 58 50 84 50 84s24-26 24-42.6C74 28.4 63.3 18 50 18zm0 14a9.4 9.4 0 1 0 0 18.8 9.4 9.4 0 0 0 0-18.8z" fill="#fff" fill-rule="evenodd"/>';
const MAIL =
  '<rect x="22" y="28" width="56" height="42" rx="8" fill="#fff"/>' +
  '<path d="M29 37 50 52 71 37" stroke="#0065DF" stroke-width="5.5" stroke-linecap="round" stroke-linejoin="round"/>';

/** Sova clay disc (70-unit space) with a white glyph from the 100-unit grid, centred on (gx, gy). */
const disc = (w, h, glyph, gx = 50, gy = 50, s = 0.46) =>
  clayIcon({ w, h, vw: 70, vh: 70 }, (k) =>
    k.C(35, 35, 34, 'b', 'T') +
    `<g transform="translate(${(35 - gx * s).toFixed(2)} ${(35 - gy * s).toFixed(2)}) scale(${s})">${glyph}</g>`);

// ------------------------------------------------------------ I1 (512 × 512)
const menu = () => root(512, 512, line('M64 128H448M64 256H448M64 384H320', 38), WHITE);

const contact = () =>
  root(
    512,
    512,
    `<rect x="140" y="50" width="300" height="412" rx="60" stroke="currentColor" stroke-width="38"/>` +
      line('M80 156h76M80 256h76M80 356h76', 38) +
      `<circle cx="290" cy="196" r="52" stroke="currentColor" stroke-width="38"/>` +
      line('M202 384a88 88 0 0 1 176 0', 38),
    WHITE,
  );

const call = () => disc(512, 512, HANDSET + WAVES, 54.5, 45.5);

const messenger = () => {
  const { cx, cy, r, stops } = MESSENGER_GRADIENT;
  return root(
    512,
    512,
    `<defs><radialGradient id="m" cx="${cx}" cy="${cy}" r="${r}">${stops.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join('')}</radialGradient></defs>` +
      // the bolt is a hole in the mark: a white disc behind it keeps it white on any background
      `<g transform="translate(25.6 25.6) scale(19.2)"><circle cx="12" cy="11.64" r="10" fill="#fff"/><path d="${MESSENGER}" fill="url(#m)"/></g>`,
  );
};

const zalo = () =>
  root(
    512,
    512,
    `<rect width="512" height="512" rx="113" fill="${ZALO_BLUE}"/>` +
      '<path d="M256 78c110 0 200 70 200 158s-90 158-200 158c-30 0-58-5-84-15-24 18-56 31-96 32 18-17 33-38 39-63-37-29-59-69-59-112 0-88 90-158 200-158z" fill="#fff"/>' +
      `<g transform="translate(118 98) scale(11.5)"><path d="${ZALO_WORDMARK}" fill="${ZALO_BLUE}"/></g>`,
  );

// ------------------------------------------------------------ I6 decor
/** Diamond lattice of dots: white, fading from .45 at the centre to .12 at the tips; 3 blue dots. */
const deco = () => {
  const N = 3;
  const D = 29;
  const BLUE = ['1,-2', '-2,1', '2,2'];
  const LEVELS = [0.45, 0.36, 0.28, 0.2, 0.12];
  const buckets = LEVELS.map(() => []);
  const blue = [];
  for (let u = -N; u <= N; u++)
    for (let v = -N; v <= N; v++) {
      const x = 131 + ((u - v) * D) / Math.SQRT2;
      const y = 130.5 + ((u + v) * D) / Math.SQRT2;
      const p = `M${x.toFixed(1)} ${y.toFixed(1)}h0`;
      if (BLUE.includes(`${u},${v}`)) blue.push(p);
      else buckets[Math.min(4, Math.floor((Math.hypot(u, v) / (N * Math.SQRT2)) * 5))].push(p);
    }
  return root(
    262,
    261,
    `<g stroke-linecap="round">` +
      buckets.map((b, i) => `<path d="${b.join('')}" stroke="#fff" stroke-opacity="${String(LEVELS[i]).slice(1)}" stroke-width="6"/>`).join('') +
      `<path d="${blue.join('')}" stroke="#0065DF" stroke-width="7.5"/></g>`,
  );
};

const arrow = () => root(18, 14, line('M1.2 7h15.4M11 1.6 16.6 7 11 12.4', 1.6), WHITE);

/** clay sphere filling its canvas, with a specular dab */
const sphere = (w, h, col) => () =>
  clayIcon({ w, h }, (k) => k.B(w / 2, h / 2, Math.min(w, h) / 2 - 0.6, col, 'T') + k.hl(w * 0.36, h * 0.3, w * 0.13, h * 0.07, -35, 0.6));

// 16 × 9 down chevron, drawn at 4× and downsampled by build.mjs for clean antialiasing
const chevron = () =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="64" height="36" viewBox="0 0 16 9" fill="none"><path d="M2 1.6 8 7.4l6-5.8" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

// CSS shows it through `filter: brightness(0) invert(1)`, so the stroke colour only needs to be dark
const next = () =>
  root(32, 32, '<path d="M6.5 6.5 16 16l-9.5 9.5M16 6.5l9.5 9.5-9.5 9.5" stroke="#231f20" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>');

// ------------------------------------------------------------ outputs
const svg = { format: 'svg' };
const i1 = (id, name, draw) => ({ id: `i1-${id}`, target: `${U}/2025/04/${name}.svg`, replaces: `${U}/2025/04/${name}.png`, ...svg, svg: draw });
export const images = [
  i1('menu', 'menu-bar-1', menu),
  i1('contact', 'contact-1', contact),
  i1('call', 'call-111', call),
  i1('messenger', 'messenger-111', messenger),
  i1('zalo', 'zalo-111', zalo),
  { id: 'i6-deco', target: `${U}/2024/02/Deco-1-6.svg`, ...svg, svg: deco },
  { id: 'i6-arrow', target: `${U}/2024/02/Vector-Stroke.svg`, ...svg, svg: arrow },
  { id: 'i6-dot-grey', target: `${U}/2024/02/Ellipse-2351.svg`, ...svg, svg: sphere(28, 29, 'r') },
  { id: 'i6-dot-blue', target: `${U}/2024/02/Ellipse-2354.svg`, ...svg, svg: sphere(25, 24, 'b') },
  { id: 'i6-pin', target: `${U}/2024/02/Mask-group.svg`, ...svg, svg: () => disc(25, 25, PIN, 50, 51, 0.5) },
  { id: 'i6-phone', target: `${U}/2024/02/Mask-group-1.svg`, ...svg, svg: () => disc(25, 25, HANDSET + WAVES, 54.5, 45.5) },
  { id: 'i6-mail', target: `${U}/2024/02/Mask-group.png`, format: 'png', width: 75, height: 75, alpha: true, svg: () => disc(75, 75, MAIL, 50, 49, 0.5) },
  { id: 'i6-chevron', target: `${U}/2025/05/right-e1746699669862.png`, format: 'png', width: 16, height: 9, alpha: true, svg: chevron },
  { id: 'i6-next', target: `${U}/2025/08/arrow-next-right.svg`, ...svg, svg: next },
];
