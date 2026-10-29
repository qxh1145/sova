// H5 — simple hero (FAQ, legal, payment, contact, blog lists): 1919×647, stays JPEG.
// H6 — detail header (28 posts, 62 projects): 2000×1125, PNG → WebP.
// Both centre their title: the middle band stays flat near-black across the full width.
// Light lives in the top and bottom bands and the far corners only, very dim.
import { svg, n, grainRect } from '../lib/svg.mjs';
import { T, glassDefs, aurora } from '../lib/glass.mjs';

// Calm band (fraction of height) measured with tools/zones.py over every route and width.
function header({ W, H, p, band, blobs, rims, sides }) {
  let defs = `<defs>${glassDefs(p, { blur: Math.round(0.05 * W) })}`;
  defs += `<linearGradient id="${p}-base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#08090C"/><stop offset=".5" stop-color="${T.base}"/><stop offset="1" stop-color="#090B10"/></linearGradient>`;
  // flat band: opaque base across the title rows, feathered top and bottom
  const y0 = band[0] * H;
  const y1 = band[1] * H;
  const f = 0.09 * H;
  defs += `<linearGradient id="${p}-band" x1="0" y1="${n(y0 - f)}" x2="0" y2="${n(y1 + f)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="${T.base}" stop-opacity="0"/><stop offset="${n(f / (y1 - y0 + 2 * f), 3)}" stop-color="${T.base}" stop-opacity=".94"/><stop offset="${n(1 - f / (y1 - y0 + 2 * f), 3)}" stop-color="${T.base}" stop-opacity=".94"/><stop offset="1" stop-color="${T.base}" stop-opacity="0"/></linearGradient>`;
  defs += `<linearGradient id="${p}-rim" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".26"/><stop offset=".5" stop-color="#fff" stop-opacity=".07"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>`;
  // side rims may cross the title band, so they stay at ≤ 7 % white (≈ #181818 on the base)
  defs += `<linearGradient id="${p}-side" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".07"/><stop offset=".5" stop-color="#fff" stop-opacity=".045"/><stop offset="1" stop-color="#fff" stop-opacity=".02"/></linearGradient>`;
  defs += `<radialGradient id="${p}-gm0" cx="${n(0.5 * W)}" cy="${n(0.5 * H)}" r="${n(0.7 * W)}" gradientUnits="userSpaceOnUse"><stop offset=".25" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fff"/></radialGradient>`;
  defs += `<mask id="${p}-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${p}-gm0)"/></mask>`;
  defs += `</defs>`;
  const rimSvg = rims
    .map(
      (r) =>
        `<g transform="rotate(-7 ${n(r.x + r.w / 2)} ${n(r.y + r.h / 2)})"><rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" rx="${n(r.r)}" fill="#fff" fill-opacity=".02" stroke="url(#${p}-rim)" stroke-width="1.5"/></g>`,
    )
    .join('');
  const sideSvg = (sides ?? [])
    .map(
      (r) =>
        `<g transform="rotate(-7 ${n(r.x + r.w / 2)} ${n(r.y + r.h / 2)})"><rect x="${n(r.x)}" y="${n(r.y)}" width="${n(r.w)}" height="${n(r.h)}" rx="${n(r.r)}" fill="none" stroke="url(#${p}-side)" stroke-width="1.5"/></g>`,
    )
    .join('');
  const body =
    defs +
    `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>` +
    aurora(p, blobs) +
    `<rect y="${n(y0 - f)}" width="${W}" height="${n(y1 - y0 + 2 * f)}" fill="url(#${p}-band)"/>` +
    rimSvg +
    sideSvg +
    grainRect(`${p}-grain`, W, H, 0.05, `${p}-gm`);
  return svg(W, H, body);
}

function simple() {
  const W = 1919;
  const H = 647;
  return header({
    W,
    H,
    p: 'h5',
    band: [0.3, 0.7],
    blobs: [
      { x: 0.82 * W, y: 0.1 * H, rx: 0.17 * W, ry: 0.09 * H, c: T.primary, o: 0.55 },
      { x: 0.95 * W, y: 0.16 * H, rx: 0.06 * W, ry: 0.08 * H, c: T.violet, o: 0.26 },
      { x: 0.16 * W, y: 0.9 * H, rx: 0.15 * W, ry: 0.08 * H, c: T.primary, o: 0.34 },
      { x: 0.38 * W, y: 0.93 * H, rx: 0.12 * W, ry: 0.05 * H, c: T.navy2, o: 0.4 },
    ],
    rims: [
      { x: 0.58 * W, y: -0.42 * H, w: 0.34 * W, h: 0.62 * H, r: 40 },
      { x: 0.06 * W, y: 0.8 * H, w: 0.3 * W, h: 0.6 * H, r: 40 },
    ],
    sides: [
      { x: -0.12 * W, y: 0.12 * H, w: 0.2 * W, h: 1.1 * H, r: 40 },
      { x: 0.9 * W, y: -0.2 * H, w: 0.22 * W, h: 1.0 * H, r: 40 },
    ],
  });
}

function detail() {
  const W = 2000;
  const H = 1125;
  return header({
    W,
    H,
    p: 'h6',
    band: [0.24, 0.82],
    blobs: [
      { x: 0.8 * W, y: 0.1 * H, rx: 0.17 * W, ry: 0.07 * H, c: T.primary, o: 0.55 },
      { x: 0.94 * W, y: 0.14 * H, rx: 0.06 * W, ry: 0.06 * H, c: T.violet, o: 0.26 },
      { x: 0.2 * W, y: 0.91 * H, rx: 0.16 * W, ry: 0.06 * H, c: T.primary, o: 0.34 },
      { x: 0.44 * W, y: 0.94 * H, rx: 0.12 * W, ry: 0.04 * H, c: T.navy2, o: 0.4 },
    ],
    rims: [
      { x: 0.56 * W, y: -0.3 * H, w: 0.34 * W, h: 0.5 * H, r: 44 },
      { x: 0.1 * W, y: 0.86 * H, w: 0.3 * W, h: 0.44 * H, r: 44 },
    ],
    sides: [
      { x: -0.1 * W, y: 0.1 * H, w: 0.18 * W, h: 1.0 * H, r: 44 },
      { x: 0.9 * W, y: -0.1 * H, w: 0.2 * W, h: 0.95 * H, r: 44 },
    ],
  });
}

export const images = [
  { id: 'h5-simple-hero', target: 'wp-content/uploads/2024/03/contact_hero_bg.jpg', width: 1919, height: 647, format: 'jpg', quality: 82, dither: 4, svg: simple },
  { id: 'h6-detail-header', target: 'wp-content/uploads/2024/03/ec9c55cfcb4d0c64ecafd52d957c13e9.webp', replaces: 'wp-content/uploads/2024/03/ec9c55cfcb4d0c64ecafd52d957c13e9.png', width: 2000, height: 1125, format: 'webp', quality: 78, dither: 4, svg: detail },
];
