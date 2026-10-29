// H4 — Projects hero: Deep Glass background (2000×1333) + clay illustration (652×517, alpha).
// Text: x <= 971 on desktop (y 226–1148); on 390 the text spans x 636–1313 for y <= 703.
// Light lives at x >= 1340 above y 720, and from x >= 1000 below it; the bottom stays dim.
import { svg, n, grainRect } from '../lib/svg.mjs';
import { T, glassDefs, aurora, ghost, bar, wallX } from '../lib/glass.mjs';
import { clayDefs, rect, inset, pill, ball, disc, shape, soft, star, heart, cursorPath, glow } from '../lib/clay.mjs';

const U = 'wp-content/uploads/2024/02';

function background() {
  const W = 2000;
  const H = 1333;
  const p = 'h4';
  const A = [
    { x: 1600, y: 900, rx: 250, ry: 230, c: T.primary, o: 0.58 },
    { x: 1880, y: 640, rx: 150, ry: 170, c: T.violet, o: 0.28 },
    { x: 1350, y: 1150, rx: 260, ry: 110, c: T.navy2, o: 0.45 },
  ];
  // ghost gallery: a grid of case-study thumbnails, tilted with the system's −7°
  let grid = '';
  const tw = 210;
  const th = 150;
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 3; c++) {
      const x = 1390 + c * (tw + 26);
      const y = 520 + r * (th + 26);
      const lit = (r === 1 && c === 1) || (r === 2 && c === 2);
      const inner =
        `<rect x="${x + 12}" y="${y + 12}" width="${tw - 24}" height="${th * 0.56}" rx="12" fill="${lit ? `url(#${p}-photo)` : '#fff'}" opacity="${lit ? 0.55 : 0.04}"/>` +
        bar(x + 14, y + th * 0.56 + 26, tw * 0.5, 9, 0.12);
      grid += ghost(p, { x, y, w: tw, h: th, r: 18, rot: 0, o: 0.9, content: inner });
    }
  }
  let defs = `<defs>${glassDefs(p, { blur: 100 })}`;
  defs += `<linearGradient id="${p}-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.base}"/><stop offset=".6" stop-color="#08090C"/><stop offset="1" stop-color="#0A0C12"/></linearGradient>`;
  defs += wallX(p, 'wall', 1060, 1380, H);
  defs += `<linearGradient id="${p}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".82" stop-color="${T.floor}" stop-opacity="0"/><stop offset="1" stop-color="${T.floor}"/></linearGradient>`;
  defs += `<radialGradient id="${p}-gm0" cx="1620" cy="880" r="480" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  defs += `<mask id="${p}-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${p}-gm0)"/></mask>`;
  // below the mobile text (y > 720) a soft glow may reach left to x 1000
  defs += `<radialGradient id="${p}-echo" cx="1180" cy="1180" r="330" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#0065DF" stop-opacity=".2"/><stop offset="1" stop-color="#0065DF" stop-opacity="0"/></radialGradient>`;
  defs += `</defs>`;
  const g = `<g transform="rotate(-7 1660 880)">${grid}</g>`;
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, A) +
    g +
    `<rect width="1380" height="${H}" fill="url(#${p}-wall)"/>` +
    `<rect x="850" y="900" width="700" height="433" fill="url(#${p}-echo)"/>` +
    `<rect width="${W}" height="${H}" fill="url(#${p}-floor)"/>` +
    grainRect(`${p}-grain`, W, H, 0.06, `${p}-gm`);
  return svg(W, H, body);
}

// The case-study stack in clay, matching the service heroes (H2): three project cards fanned out
// (website, brand, product), a phone, a gallery tile and a cursor opening the front case.
// Drawn in H2 design units (1300 wide) and scaled to 652 × 517.
function illustration() {
  const W = 652;
  const H = 517;
  const p = 'h4c';
  const s = W / 1300;
  const card = (x, y, w, h, img, f, hills = false) => {
    let b = rect(p, x, y, w, h, 44, 'cream', f);
    b += rect(p, x + 22, y + 22, w - 44, h * 0.56, 28, img, 'm');
    if (hills) {
      const ix = x + 22;
      const iy = y + 22 + h * 0.56;
      b += `<path d="M${n(ix + 10)} ${n(iy - 8)}l${n(120)}-${n(90)} ${n(80)} ${n(52)} ${n(90)}-${n(100)} ${n(w - 44 - 320)} ${n(138)}z" fill="#fff" opacity=".28"/>`;
      b += disc(p, x + w - 100, y + 82, 26, 'yellow', 's');
    }
    b += pill(p, x + 30, y + h * 0.56 + 52, w * 0.52, 22, 'mist');
    b += pill(p, x + 30, y + h * 0.56 + 90, w * 0.34, 16, 'mist');
    b += rect(p, x + w - 140, y + h - 70, 110, 42, 21, 'coral', 's');
    return b;
  };
  const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${n(cx)} ${n(cy)})">${body}</g>`;
  let g = '';
  g += glow(p, [
    { x: 640, y: 520, rx: 460, ry: 330, c: '#0065DF', o: 0.5 },
    { x: 980, y: 640, rx: 220, ry: 200, c: '#7A5CFF', o: 0.35 },
  ]);
  g += rot(9, 840, 360, card(600, 120, 500, 420, 'mint', 'l'));
  g += rot(-1, 650, 430, card(400, 210, 520, 440, 'coral', 'l'));
  g += rot(-8, 470, 560, card(170, 330, 600, 500, 'violet', 'xl', true));
  // phone with a product screen
  let ph = rect(p, 960, 480, 210, 400, 46, 'sova', 'xl');
  ph += inset(p, 977, 530, 176, 326, 28, 'cream');
  ph += pill(p, 1035, 500, 60, 12, 'blue');
  ph += rect(p, 995, 548, 140, 120, 22, 'cyan', 's');
  ph += pill(p, 997, 690, 110, 16, 'mist');
  ph += pill(p, 997, 720, 76, 14, 'mist');
  ph += rect(p, 997, 770, 136, 46, 23, 'sova', 's');
  g += rot(6, 1065, 680, ph);
  // gallery tile: 2×2 thumbnails, one lit
  g += rot(-6, 1140, 200,
    rect(p, 1030, 90, 220, 220, 50, 'cream', 'l') +
      [0, 1, 2, 3].map((i) => rect(p, 1060 + (i % 2) * 84, 120 + Math.floor(i / 2) * 84, 72, 72, 18, i === 1 ? 'pink' : 'mist', 'xs')).join(''));
  // cursor opening the front case — the focal accent
  g += soft(p, cursorPath(690, 760, 1.3), 'yellow', 14, 'l');
  g += soft(p, star(160, 220, 62, 30), 'yellow', 18, 'l');
  g += shape(p, heart(1210, 420, 44), 'coral', 'm');
  g += ball(p, 330, 110, 34, 'pink', 'm');
  g += ball(p, 90, 640, 26, 'mint', 's');
  g += ball(p, 1230, 900, 22, 'violet', 's');
  g += ball(p, 560, 70, 16, 'cyan', 's');
  return svg(W, H, `<defs>${clayDefs(p)}</defs><g transform="scale(${n(s, 5)})">${g}</g>`);
}

export const images = [
  { id: 'h4-projects-bg', target: `${U}/de729be13c98f6a585c5656f0ce73db4-1.webp`, width: 2000, height: 1333, format: 'webp', quality: 78, dither: 4, svg: background },
  // stays PNG (alpha) to keep the file name; quantised to a palette to fit the budget
  { id: 'h4-projects-illus', target: `${U}/43e3185f955f1d3fca7ffa93786c89a0.png`, width: 652, height: 517, format: 'png', alpha: true, palette: true, quality: 90, svg: illustration },
];
