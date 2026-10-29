// H2 — service hero illustrations in claymorphism: puffy matte shapes, vibrant accents on a
// Sova-blue body, transparent background. No readable text: every label is a pill.
// Each scene is drawn in a 1300-unit-wide design space and scaled to the file's pixel size,
// so the clay filters (lib/clay.mjs) look the same in all four.
import { svg, n } from '../lib/svg.mjs';
import { clayDefs, rect, inset, pill, ball, disc, shape, soft, tube, ring, star, heart, cursorPath, glow } from '../lib/clay.mjs';

const U = 'wp-content/uploads/2024/02';
const DW = 1300;

const rot = (deg, cx, cy, body) => `<g transform="rotate(${deg} ${n(cx)} ${n(cy)})">${body}</g>`;
const check = (d, w) =>
  `<path d="${d}" fill="none" stroke="#FEFEFE" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;

function scene(p, W, H, body) {
  const s = W / DW;
  return svg(W, H, `<defs>${clayDefs(p)}</defs><g transform="scale(${n(s, 5)})">${body}</g>`);
}

// ------------------------------------------------------------------------------ website
function website() {
  const W = 2560;
  const H = 1428;
  const p = 'cw';
  // browser window
  const bx = 150;
  const by = 95;
  const bw = 760;
  const bh = 520;
  let win = rect(p, bx, by, bw, bh, 62, 'sova', 'xl');
  ['coral', 'yellow', 'mint'].forEach((c, i) => (win += disc(p, bx + 46 + i * 34, by + 40, 12, c, 'xs')));
  win += inset(p, bx + 160, by + 26, 300, 28, 14, 'blue');
  const sx = bx + 30;
  const sy = by + 78;
  const sw = bw - 60;
  const sh = bh - 108;
  win += inset(p, sx, sy, sw, sh, 34, 'cream');
  // hero block
  win += rect(p, sx + 26, sy + 24, sw - 52, 168, 26, 'violet', 'm');
  win += pill(p, sx + 60, sy + 58, 250, 26, 'cream');
  win += pill(p, sx + 60, sy + 98, 170, 20, 'mist');
  win += rect(p, sx + 60, sy + 134, 150, 38, 19, 'coral', 's');
  win += ball(p, sx + sw - 130, sy + 108, 52, 'pink', 's');
  win += ball(p, sx + sw - 200, sy + 150, 22, 'yellow', 's');
  // three cards
  const cw = (sw - 52 - 2 * 22) / 3;
  ['yellow', 'mint', 'cyan'].forEach((c, i) => {
    const cx = sx + 26 + i * (cw + 22);
    const cy = sy + 214;
    win += rect(p, cx, cy, cw, sh - 238, 22, 'cream', 's');
    win += rect(p, cx + 14, cy + 14, cw - 28, 82, 14, c, 'xs');
    win += pill(p, cx + 16, cy + 112, cw * 0.62, 14, 'mist');
    win += pill(p, cx + 16, cy + 136, cw * 0.4, 12, 'mist');
  });
  // cursor clicking the CTA — the focal accent
  const cur = soft(p, cursorPath(sx + 170, sy + 160, 1.15), 'yellow', 14, 'm');

  // floating parts, right of the window
  let fl = '';
  fl += rect(p, 960, 112, 200, 92, 46, 'mint', 'm') + disc(p, 1114, 158, 36, 'cream', 's');
  // layout tile: a component block made of four squares
  fl += rot(
    8,
    1060,
    360,
    rect(p, 960, 262, 196, 196, 46, 'cyan', 'l') +
      [0, 1, 2, 3].map((i) => rect(p, 990 + (i % 2) * 74, 292 + Math.floor(i / 2) * 74, 62, 62, 16, i === 1 ? 'coral' : 'cream', 'xs')).join(''),
  );
  fl += soft(p, star(1100, 570, 78, 38), 'yellow', 22, 'l');
  fl += shape(p, heart(118, 560, 58), 'coral', 'm');
  fl += ball(p, 922, 100, 46, 'pink', 'm');
  fl += ball(p, 1228, 236, 24, 'violet', 's');
  fl += ball(p, 70, 214, 18, 'mint', 's');
  fl += ball(p, 940, 650, 16, 'yellow', 's');

  const body =
    glow(p, [
      { x: 560, y: 360, rx: 420, ry: 260, c: '#0065DF', o: 0.5 },
      { x: 1040, y: 420, rx: 220, ry: 220, c: '#7A5CFF', o: 0.35 },
    ]) +
    rot(-5, bx + bw / 2, by + bh / 2, win + cur) +
    fl;
  return scene(p, W, H, body);
}

// ------------------------------------------------------------------------------ app mobile
function phone(p, x, y, w, col, content) {
  const h = w * 2.05;
  let s = rect(p, x, y, w, h, w * 0.18, col, 'xl');
  s += inset(p, x + 18, y + 18, w - 36, h - 36, w * 0.13, 'cream');
  s += rect(p, x + w / 2 - 46, y + 34, 92, 22, 11, 'ink', 'xs');
  s += content(x + 18, y + 18, w - 36, h - 36);
  return s;
}

function mobile() {
  const W = 1482;
  const H = 1233;
  const p = 'cm';
  // back phone: onboarding
  const back = phone(p, 250, 130, 340, 'violet', (x, y, w, h) => {
    let c = ring(p, x + w / 2, y + 250, 88, 'mint', 40, 'm');
    c += ball(p, x + w / 2, y + 250, 44, 'yellow', 's');
    c += pill(p, x + 60, y + 430, w - 120, 24, 'mist');
    c += pill(p, x + 90, y + 470, w - 180, 18, 'mist');
    c += rect(p, x + 50, y + h - 120, w - 100, 56, 28, 'sova', 's');
    return c;
  });
  // front phone: a list screen
  const front = phone(p, 600, 190, 360, 'sova', (x, y, w, h) => {
    let c = pill(p, x + 30, y + 74, 140, 22, 'mist') + disc(p, x + w - 52, y + 84, 24, 'pink', 'xs');
    c += rect(p, x + 22, y + 124, w - 44, 200, 30, 'coral', 'm');
    c += pill(p, x + 50, y + 236, 160, 22, 'cream');
    c += pill(p, x + 50, y + 272, 110, 16, 'cream');
    c += ball(p, x + w - 90, y + 190, 40, 'yellow', 's');
    ['mint', 'yellow', 'violet'].forEach((col, i) => {
      const ry = y + 350 + i * 92;
      c += rect(p, x + 22, ry, w - 44, 76, 22, 'cream', 's');
      c += rect(p, x + 38, ry + 14, 48, 48, 14, col, 'xs');
      c += pill(p, x + 102, ry + 20, 150, 14, 'mist');
      c += pill(p, x + 102, ry + 44, 96, 12, 'mist');
    });
    c += rect(p, x + 22, y + h - 82, w - 44, 60, 30, 'mist', 's');
    [0, 1, 2, 3].forEach((i) => (c += disc(p, x + 66 + i * 68, y + h - 52, 11, i === 0 ? 'sova' : 'cream', 'xs')));
    return c;
  });

  let fl = '';
  // notification chip — the focal accent
  fl += rot(
    -4,
    1000,
    820,
    rect(p, 820, 760, 380, 120, 40, 'cream', 'l') +
      rect(p, 844, 784, 72, 72, 22, 'coral', 's') +
      check('M862 822l16 16 22-28', 9) +
      pill(p, 936, 794, 200, 20, 'mist') +
      pill(p, 936, 830, 130, 16, 'mist'),
  );
  fl += shape(p, heart(1110, 250, 74), 'pink', 'l');
  // chat bubble
  fl += shape(p, 'M100 690h200a40 40 0 0 1 40 40v70a40 40 0 0 1-40 40h-120l-46 40 8-40h-42a40 40 0 0 1-40-40v-70a40 40 0 0 1 40-40z', 'yellow', 'm');
  [0, 1, 2].forEach((i) => (fl += disc(p, 160 + i * 50, 765, 12, 'cream', 'xs')));
  fl += rect(p, 1050, 470, 170, 80, 40, 'mint', 'm') + disc(p, 1180, 510, 30, 'cream', 's');
  fl += ball(p, 200, 220, 36, 'cyan', 'm');
  fl += ball(p, 1180, 680, 22, 'violet', 's');
  fl += ball(p, 560, 1040, 18, 'yellow', 's');

  const body =
    glow(p, [
      { x: 650, y: 560, rx: 420, ry: 380, c: '#0065DF', o: 0.5 },
      { x: 980, y: 760, rx: 220, ry: 200, c: '#7A5CFF', o: 0.35 },
    ]) +
    rot(-9, 420, 480, back) +
    rot(5, 780, 560, front) +
    fl;
  return scene(p, W, H, body);
}

// ------------------------------------------------------------------------------ SEO
function seo() {
  const W = 1300;
  const H = 880;
  const p = 'cs';
  // ranking card, behind on the right
  let rank = rect(p, 760, 120, 380, 420, 48, 'violet', 'l');
  [0, 1, 2, 3].forEach((i) => {
    const y = 160 + i * 88;
    rank += rect(p, 790, y, 320, 68, 22, i === 0 ? 'yellow' : 'cream', 's');
    rank += disc(p, 826, y + 34, 18, i === 0 ? 'cream' : 'mist', 'xs');
    rank += pill(p, 858, y + 20, i === 0 ? 180 : 150 - i * 14, 14, i === 0 ? 'cream' : 'mist');
    rank += pill(p, 858, y + 42, 90, 10, i === 0 ? 'cream' : 'mist');
  });
  // chart card
  let chart = rect(p, 170, 150, 640, 470, 54, 'cream', 'xl');
  chart += pill(p, 220, 200, 200, 24, 'mist') + pill(p, 220, 238, 130, 16, 'mist');
  const base = 560;
  const bars = [
    [0.28, 'blue'],
    [0.42, 'blue'],
    [0.36, 'cyan'],
    [0.6, 'violet'],
    [0.86, 'coral'],
  ];
  bars.forEach(([v, col], i) => {
    const x = 230 + i * 106;
    const hgt = v * 290;
    chart += rect(p, x, base - hgt, 72, hgt, 22, col, 'm');
  });
  chart += inset(p, 214, base + 8, 560, 14, 7, 'mist');
  // up-arrow badge on the tallest bar — the focal accent
  const ax = 230 + 4 * 106 + 36;
  const ay = base - 0.86 * 290 - 70;
  chart += disc(p, ax, ay, 48, 'mint', 'm');
  chart += soft(p, `M${ax} ${ay - 26}l24 26h-14v24h-20v-24h-14z`, 'cream', 8, 'xs');
  // magnifier
  const mx = 300;
  const my = 650;
  let mag = tube(p, `M${mx - 60} ${my + 60}l-90 90`, 'sova', 46, 'm');
  mag += inset(p, mx - 82, my - 82, 164, 164, 82, 'cyan');
  mag += ring(p, mx, my, 96, 'yellow', 40, 'l');
  mag += `<ellipse cx="${mx - 30}" cy="${my - 34}" rx="34" ry="18" fill="#fff" opacity=".55" transform="rotate(-35 ${mx - 30} ${my - 34})"/>`;

  let fl = '';
  fl += soft(p, star(1150, 640, 56, 27), 'yellow', 16, 'm');
  fl += ball(p, 1080, 760, 34, 'pink', 'm');
  fl += ball(p, 110, 210, 26, 'mint', 's');
  fl += ball(p, 660, 760, 20, 'violet', 's');
  fl += shape(p, heart(560, 110, 34), 'coral', 's');

  const body =
    glow(p, [
      { x: 560, y: 420, rx: 380, ry: 280, c: '#0065DF', o: 0.5 },
      { x: 960, y: 380, rx: 220, ry: 220, c: '#7A5CFF', o: 0.35 },
    ]) +
    rot(7, 950, 330, rank) +
    rot(-5, 490, 385, chart) +
    rot(-5, mx, my, mag) +
    fl;
  return scene(p, W, H, body);
}

// ------------------------------------------------------------------------------ branding
function branding() {
  const W = 2560;
  const H = 2184;
  const p = 'cb';
  // palette card
  let pal = rect(p, 120, 210, 520, 600, 60, 'cream', 'xl');
  pal += rect(p, 160, 250, 440, 220, 36, 'violet', 'm');
  pal += pill(p, 196, 400, 170, 24, 'cream');
  pal += pill(p, 196, 436, 110, 16, 'mist');
  ['coral', 'yellow', 'mint', 'pink', 'cyan', 'sova'].forEach((c, i) => {
    pal += disc(p, 220 + (i % 3) * 160, 560 + Math.floor(i / 3) * 140, 52, c, 'm');
  });
  // type-scale card
  let type = rect(p, 680, 690, 540, 340, 56, 'sova', 'xl');
  [
    [38, 0.62],
    [26, 0.46],
    [16, 0.72],
    [16, 0.58],
    [16, 0.4],
  ].reduce((y, [hh, k]) => {
    type += pill(p, 734, y, 430 * k, hh, y < 800 ? 'cream' : 'blue');
    return y + hh + 26;
  }, 744);
  type += disc(p, 1150, 770, 32, 'yellow', 's');
  // shape primitives — the focal accents
  let prim = '';
  prim += ball(p, 990, 250, 118, 'pink', 'xl');
  prim += rot(14, 1050, 520, rect(p, 960, 430, 180, 180, 46, 'yellow', 'l'));
  prim += soft(p, 'M760 300l96 166h-192z', 'mint', 44, 'l');
  prim += ring(p, 250, 930, 78, 'coral', 50, 'l');
  // pen tool: a bezier tube with anchors and handles
  const a0 = [470, 860];
  const c0 = [600, 720];
  const c1 = [760, 560];
  const a1 = [900, 520];
  let pen = tube(p, `M${a0} C${c0} ${c1} ${a1}`, 'violet', 22, 's');
  for (const [a, c] of [
    [a0, c0],
    [a1, c1],
  ]) {
    pen += `<path d="M${a}L${c}" stroke="#FEFEFE" stroke-opacity=".7" stroke-width="4"/>`;
    pen += disc(p, c[0], c[1], 14, 'cream', 'xs');
    pen += rect(p, a[0] - 20, a[1] - 20, 40, 40, 10, 'cream', 's');
  }
  let fl = '';
  fl += ball(p, 1210, 170, 30, 'cyan', 's');
  fl += ball(p, 90, 160, 26, 'yellow', 's');
  fl += ball(p, 1240, 640, 30, 'violet', 'm');
  fl += soft(p, star(520, 1010, 46, 22), 'yellow', 14, 'm');

  const body =
    glow(p, [
      { x: 650, y: 560, rx: 460, ry: 380, c: '#0065DF', o: 0.5 },
      { x: 960, y: 820, rx: 260, ry: 220, c: '#7A5CFF', o: 0.35 },
    ]) +
    rot(-6, 380, 510, pal) +
    rot(4, 950, 860, type) +
    pen +
    prim +
    fl;
  return scene(p, W, H, body);
}

export const images = [
  { id: 'h2-website-illus', target: `${U}/vc-zx-dfzfvxfd-scaled-1.webp`, width: 2560, height: 1428, svg: website },
  { id: 'h2-mobile-illus', target: `${U}/Mesa-de-trabajo-1-copia-3@4x.webp`, width: 1482, height: 1233, svg: mobile },
  { id: 'h2-seo-illus', target: `${U}/sdcasdcsvdzfvad.webp`, width: 1300, height: 880, svg: seo },
  { id: 'h2-branding-illus', target: `${U}/xcgbxfgb-fcgbg-scaled-1.webp`, width: 2560, height: 2184, svg: branding, quality: 76 },
].map((im) => ({ format: 'webp', quality: 82, alphaQuality: 70, alpha: true, ...im }));
