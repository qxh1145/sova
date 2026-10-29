// P2 — section and footer backgrounds (Deep Glass stage layer).
//   S1  projects horizontal-scroll section (home + 4 services): 2560×1436
//   S2  SEO / branding package cards + About "purpose": 2000×1498
//   S3  website contact-form banner: desktop 1920×1080, mobile 1080×1920 (VI), 450×800 (EN)
//   F1  footer, every page: 2000×1125 (under a .65 → .95 dark gradient)
// tools/zones.py found text over almost the whole of S1, S2 and S3 (cards scroll sideways, the
// form fills the right side), so these stay near-black everywhere: depth comes from faint pane
// rims, perspective light strips and a low aurora, never from bright spots.
import { svg, n, grainRect } from '../lib/svg.mjs';
import { T, glassDefs, aurora, ghost } from '../lib/glass.mjs';

const base = (p, W, H, stops) =>
  `<linearGradient id="${p}-base" x1="0" y1="0" x2="${stops.dir === 'x' ? 1 : 0}" y2="${stops.dir === 'x' ? 0 : 1}">${stops.c
    .map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`)
    .join('')}</linearGradient>`;

const mask = (p, id, cx, cy, r) =>
  `<radialGradient id="${p}-${id}0" cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>` +
  `<mask id="${p}-${id}" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%"><rect width="100%" height="100%" fill="url(#${p}-${id}0)"/></mask>`;

// ------------------------------------------------------------------------------ S1
// A dim studio seen from inside: ceiling light strips in perspective, a horizon of soft blue
// light behind the project cards, two faint screens at the sides. No people.
function s1() {
  const W = 2560;
  const H = 1436;
  const p = 's1';
  const vx = W / 2;
  const vy = H * 0.5;
  let strips = '';
  // ceiling: rows of strips receding to the vanishing point
  for (let row = 0; row < 5; row++) {
    const t0 = 0.08 + row * 0.13; // depth (0 near, 1 far)
    const t1 = t0 + 0.06;
    const yA = (t) => n(vy - (vy - 0) * (1 - t) * 0.95);
    for (let col = -3; col <= 3; col++) {
      const xA = (t) => vx + col * 330 * (1 - t);
      const w0 = 110 * (1 - t0);
      const w1 = 110 * (1 - t1);
      const pts = [
        [xA(t0) - w0, yA(t0)],
        [xA(t0) + w0, yA(t0)],
        [xA(t1) + w1, yA(t1)],
        [xA(t1) - w1, yA(t1)],
      ];
      const o = (0.11 - row * 0.017) * (1 - Math.abs(col) * 0.12);
      strips += `<path d="M${pts.map(([x, y]) => `${n(x)} ${y}`).join('L')}Z" fill="#DCE8FF" opacity="${n(o, 3)}"/>`;
    }
  }
  // floor: a few long horizontal planes (desks) in perspective, rim only
  let floor = '';
  for (let i = 0; i < 4; i++) {
    const y = H * (0.72 + i * 0.065);
    const half = W * (0.18 + i * 0.12);
    floor += `<path d="M${n(vx - half)} ${n(y)}H${n(vx + half)}" stroke="#fff" stroke-opacity="${n(0.05 - i * 0.008, 3)}" stroke-width="2"/>`;
  }
  let defs = `<defs>${glassDefs(p, { blur: 120 })}`;
  defs += base(p, W, H, { c: [[0, '#07080B'], [0.5, '#090B10'], [1, '#0B0D13']] });
  defs += `<filter id="${p}-haze" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter>`;
  defs += mask(p, 'gm', vx, vy, 1100);
  defs += `</defs>`;
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, [
      { x: vx, y: vy + 40, rx: 760, ry: 140, c: T.primary, o: 0.24 },
      { x: vx + 560, y: vy + 90, rx: 320, ry: 100, c: T.violet, o: 0.12 },
    ]) +
    `<g filter="url(#${p}-haze)">${strips}</g>` +
    floor +
    ghost(p, { x: 70, y: 380, w: 380, h: 560, r: 34, rot: 4, o: 0.55 }) +
    ghost(p, { x: W - 450, y: 360, w: 380, h: 600, r: 34, rot: -4, o: 0.55 }) +
    grainRect(`${p}-grain`, W, H, 0.035, `${p}-gm`);
  return svg(W, H, body);
}

// ------------------------------------------------------------------------------ S2
// Behind translucent package cards: a low aurora along the bottom edge, two big faint pane rims
// and a dot field that fades out towards the top, where the section heading sits.
function s2() {
  const W = 2000;
  const H = 1498;
  const p = 's2';
  let defs = `<defs>${glassDefs(p, { blur: 130 })}`;
  defs += base(p, W, H, { c: [[0, '#07080B'], [0.6, '#08090D'], [1, '#0A0C12']] });
  defs += `<pattern id="${p}-dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="11" cy="11" r="1.4" fill="#9CC3FF" fill-opacity=".13"/></pattern>`;
  defs += `<linearGradient id="${p}-fade0" x1="0" y1="0" x2="0" y2="1"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></linearGradient>`;
  defs += `<mask id="${p}-fade" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${p}-fade0)"/></mask>`;
  defs += mask(p, 'gm', W * 0.5, H, 900);
  defs += `</defs>`;
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, [
      { x: W * 0.22, y: H * 1.0, rx: 540, ry: 170, c: T.primary, o: 0.42 },
      { x: W * 0.78, y: H * 0.98, rx: 480, ry: 160, c: T.primary, o: 0.36 },
      { x: W * 0.6, y: H * 1.03, rx: 280, ry: 100, c: T.violet, o: 0.22 },
    ]) +
    `<rect width="${W}" height="${H}" fill="url(#${p}-dots)" mask="url(#${p}-fade)"/>` +
    ghost(p, { x: -160, y: H * 0.42, w: 760, h: 980, r: 60, rot: -7, o: 0.65 }) +
    ghost(p, { x: W - 560, y: H * 0.5, w: 720, h: 900, r: 60, rot: -7, o: 0.6 }) +
    grainRect(`${p}-grain`, W, H, 0.035, `${p}-gm`);
  return svg(W, H, body);
}

// ------------------------------------------------------------------------------ S3
// One composition, three crops. Text sits left and the form right, so the light stays in the far
// top-right corner and along the bottom edge; two big pane rims give the card some depth.
function s3(W, H) {
  const p = W > H ? 's3d' : 's3m';
  const land = W > H;
  let defs = `<defs>${glassDefs(p, { blur: Math.round(0.065 * Math.max(W, H)) })}`;
  defs += base(p, W, H, { dir: 'x', c: [[0, '#08090D'], [0.7, '#090B11'], [1, '#0B0E17']] });
  defs += mask(p, 'gm', W, 0, Math.max(W, H) * 0.5);
  defs += `</defs>`;
  const L = land
    ? [
        { x: W * 1.0, y: -H * 0.05, rx: W * 0.16, ry: H * 0.26, c: T.primary, o: 0.45 },
        { x: W * 1.02, y: H * 0.42, rx: W * 0.05, ry: H * 0.16, c: T.violet, o: 0.25 },
        { x: W * 0.45, y: H * 1.08, rx: W * 0.3, ry: H * 0.1, c: T.primary, o: 0.18 },
      ]
    : [
        { x: W * 1.04, y: -H * 0.02, rx: W * 0.36, ry: H * 0.12, c: T.primary, o: 0.42 },
        { x: W * 1.06, y: H * 0.36, rx: W * 0.1, ry: H * 0.08, c: T.violet, o: 0.22 },
        { x: W * 0.5, y: H * 1.04, rx: W * 0.6, ry: H * 0.06, c: T.primary, o: 0.18 },
      ];
  const rims = land
    ? ghost(p, { x: W * 0.5, y: H * 0.1, w: W * 0.42, h: H * 0.86, r: 44, rot: -7, o: 0.35 }) +
      ghost(p, { x: -W * 0.08, y: H * 0.55, w: W * 0.3, h: H * 0.62, r: 44, rot: -7, o: 0.3 })
    : ghost(p, { x: W * 0.12, y: H * 0.5, w: W * 0.9, h: H * 0.46, r: 44, rot: -7, o: 0.32 }) +
      ghost(p, { x: -W * 0.2, y: H * 0.04, w: W * 0.6, h: H * 0.3, r: 44, rot: -7, o: 0.26 });
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, L) +
    rims +
    grainRect(`${p}-grain`, W, H, 0.05, `${p}-gm`);
  return svg(W, H, body);
}

// ------------------------------------------------------------------------------ F1
// Under a 65–95 % dark gradient: a fine dot grid, three tilted pane rims echoing the heroes and the
// aurora in the top-right corner. Slightly brighter than the other stage images on purpose — the
// overlay takes it back down.
function f1() {
  const W = 2000;
  const H = 1125;
  const p = 'f1';
  let defs = `<defs>${glassDefs(p, { blur: 120 })}`;
  defs += base(p, W, H, { c: [[0, '#0A0C12'], [1, '#08090D']] });
  defs += `<pattern id="${p}-dots" width="26" height="26" patternUnits="userSpaceOnUse"><circle cx="13" cy="13" r="1.5" fill="#CFE0FF" fill-opacity=".16"/></pattern>`;
  defs += mask(p, 'gm', W * 0.85, 0, 900);
  defs += mask(p, 'dm', W * 0.7, H * 0.2, 1300);
  defs += `</defs>`;
  const rimSet = [
    { x: W * 0.62, y: H * 0.05, w: 520, h: 360, r: 40, o: 0.9 },
    { x: W * 0.74, y: H * 0.36, w: 460, h: 320, r: 38, o: 0.7 },
    { x: W * 0.06, y: H * 0.62, w: 480, h: 340, r: 38, o: 0.55 },
  ]
    .map((g) => ghost(p, { ...g, rot: -7 }))
    .join('');
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, [
      { x: W * 0.86, y: H * 0.08, rx: 440, ry: 260, c: T.primary, o: 0.62 },
      { x: W * 0.98, y: H * 0.4, rx: 180, ry: 160, c: T.violet, o: 0.28 },
      { x: W * 0.12, y: H * 1.02, rx: 420, ry: 140, c: T.primary, o: 0.25 },
    ]) +
    `<rect width="${W}" height="${H}" fill="url(#${p}-dots)" mask="url(#${p}-dm)"/>` +
    rimSet +
    grainRect(`${p}-grain`, W, H, 0.05, `${p}-gm`);
  return svg(W, H, body);
}

const U24 = 'wp-content/uploads/2024/02';
const U25 = 'wp-content/uploads/2025/04';
const bg = { format: 'webp', quality: 78, dither: 4 };

export const images = [
  { id: 's1-projects-bg', target: `${U25}/alex-kotliarskyi-QBpZGqEMsKg-unsplash.webp`, width: 2560, height: 1436, svg: s1, ...bg },
  { id: 's2-packages-bg', target: `${U24}/b64598d7e18308083c456d32c69bae66.webp`, width: 2000, height: 1498, svg: s2, ...bg },
  { id: 's3-contact-desktop', target: `${U25}/anh-nen-new-111.webp`, width: 1920, height: 1080, svg: () => s3(1920, 1080), ...bg },
  { id: 's3-contact-mobile', target: `${U25}/anh-nen-doc-111.webp`, width: 1080, height: 1920, svg: () => s3(1080, 1920), ...bg },
  // EN mobile: the same composition, downscaled
  { id: 's3-contact-mobile-en', target: `${U25}/anh-nen-doc-111-450x800.webp`, width: 450, height: 800, svg: () => s3(1080, 1920), ...bg, dither: 3 },
  { id: 'f1-footer-bg', target: `${U24}/8b7867237f3d84a4414a09ba3e720c8d.webp`, width: 2000, height: 1125, svg: f1, ...bg },
];
