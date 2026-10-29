// H1 — service hero backgrounds. One family; the motif changes per service.
// Text sits left (calm x < ~62 %). Light and motif live at x >= 62 %, behind the H2 illustration.
import { svg, n, grainRect } from '../lib/svg.mjs';
import { T, glassDefs, aurora, ghost, bar, dot, wallX } from '../lib/glass.mjs';

const U = 'wp-content/uploads/2024/02';

// Per-file canvas and the dark wall that keeps the text side calm. The free (light-allowed) zone
// was measured over every route and width; see IMAGE-SYSTEM.md §5. Two shared uses add bands that
// must stay dark further right: the website file is also the /ho-so-nang-luc-sova/ cover (title at
// y 48–90 %, x < 80 %), the branding file the thank-you background (card at y 28–60 %, x < 75 %).
const SPECS = {
  website: { file: `${U}/xzc-zcx-cx_.webp`, W: 1900, H: 958, wall: [0.55, 0.66] },
  mobile: { file: `${U}/svzd-zdfvx-scaled-1.webp`, W: 2560, H: 1394, wall: [0.56, 0.67] },
  seo: { file: `${U}/szfvsdbsdfbdf.webp`, W: 1920, H: 895, wall: [0.55, 0.66] },
  branding: { file: `${U}/scdscszdcs-scaled-1.webp`, W: 2560, H: 1085, wall: [0.56, 0.67] },
};

// ---------------------------------------------------------------------------- motifs
function websiteMotif(p, W, H) {
  const k = W / 1900;
  const frame = (x, y, w, h, o) => {
    let c = '';
    for (let i = 0; i < 3; i++) c += dot(x + (22 + i * 18) * k, y + 22 * k, 5 * k, '#fff', i ? 0.12 : 0.3);
    c += `<rect x="${n(x)}" y="${n(y + 44 * k)}" width="${n(w)}" height="1" fill="#fff" opacity=".1"/>`;
    const cols = 3;
    const gw = (w - 60 * k) / cols;
    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < 2; j++) {
        c += `<rect x="${n(x + 20 * k + i * (gw + 10 * k))}" y="${n(y + 64 * k + j * (h * 0.36))}" width="${n(gw)}" height="${n(h * 0.3)}" rx="${n(10 * k)}" fill="none" stroke="#fff" stroke-opacity=".07"/>`;
      }
    }
    return ghost(p, { x, y, w, h, o, content: c });
  };
  return (
    frame(0.655 * W, 0.15 * H, 0.24 * W, 0.27 * H, 0.9) + frame(0.815 * W, 0.5 * H, 0.17 * W, 0.27 * H, 0.8)
  );
}

function mobileMotif(p, W, H) {
  const ph = 0.56 * H;
  const pw = ph * (9 / 19.5);
  const device = (x, y, rot, o) => {
    const r = pw * 0.16;
    const c =
      `<rect x="${n(x + pw * 0.36)}" y="${n(y + pw * 0.06)}" width="${n(pw * 0.28)}" height="${n(pw * 0.05)}" rx="${n(pw * 0.025)}" fill="#fff" opacity=".1"/>` +
      bar(x + pw * 0.12, y + ph * 0.18, pw * 0.5, pw * 0.07, 0.08) +
      bar(x + pw * 0.12, y + ph * 0.26, pw * 0.7, pw * 0.05, 0.05) +
      `<rect x="${n(x + pw * 0.12)}" y="${n(y + ph * 0.36)}" width="${n(pw * 0.76)}" height="${n(ph * 0.24)}" rx="${n(pw * 0.08)}" fill="#0065DF" opacity=".08"/>`;
    return ghost(p, { x, y, w: pw, h: ph, r, rot, o, content: c });
  };
  return device(0.665 * W, 0.2 * H, -7, 0.85) + device(0.8 * W, 0.12 * H, -7, 0.95) + device(0.915 * W, 0.34 * H, -18, 0.6);
}

function seoMotif(p, W, H) {
  const pts = [
    [0.64, 0.82],
    [0.71, 0.7],
    [0.77, 0.73],
    [0.83, 0.52],
    [0.89, 0.43],
    [0.95, 0.24],
  ].map(([x, y]) => [x * W, y * H]);
  const d = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${n(x)} ${n(y)}`).join('');
  let s = '';
  // ascending glass bars
  const bw = 0.035 * W;
  [0.36, 0.48, 0.44, 0.62, 0.7, 0.86].forEach((hgt, i) => {
    const x = (0.635 + i * 0.058) * W;
    const h = hgt * 0.62 * H;
    s += `<rect x="${n(x)}" y="${n(0.97 * H - h)}" width="${n(bw)}" height="${n(h)}" rx="${n(bw * 0.3)}" fill="#fff" fill-opacity=".025" stroke="url(#${p}-ghost)" stroke-width="1.5"/>`;
  });
  s += `<path d="${d}" fill="none" stroke="#0065DF" stroke-width="10" opacity=".35" filter="url(#${p}-soft)"/>`;
  s += `<path d="${d}" fill="none" stroke="url(#${p}-iceblue)" stroke-width="2.5" opacity=".75" stroke-linejoin="round"/>`;
  pts.forEach(([x, y], i) => {
    s += dot(x, y, i === pts.length - 1 ? 16 : 10, '#0065DF', 0.35);
    s += dot(x, y, i === pts.length - 1 ? 6 : 4, i === pts.length - 1 ? '#FEFEFE' : '#9CC3FF', 0.9);
  });
  return s;
}

function brandingMotif(p, W, H) {
  const k = W / 2560;
  const sz = 120 * k;
  const gap = 26 * k;
  const x0 = 0.775 * W;
  const y0 = 0.16 * H;
  const tints = ['#0065DF', '#4F94FF', '#5B4BFF', '#0A3A8C', '#9CC3FF', '#0065DF', '#1B2A44', '#4F94FF', '#0A1A33'];
  let c = '';
  tints.forEach((t, i) => {
    const x = x0 + (i % 3) * (sz + gap);
    const y = y0 + Math.floor(i / 3) * (sz + gap);
    c += `<rect x="${n(x)}" y="${n(y)}" width="${n(sz)}" height="${n(sz)}" rx="${n(sz * 0.22)}" fill="${t}" fill-opacity="${i % 4 === 0 ? 0.22 : 0.1}" stroke="url(#${p}-ghost)" stroke-width="1.5"/>`;
  });
  const g = `<g transform="rotate(-7 ${n(x0 + 1.5 * sz)} ${n(y0 + 1.5 * sz)})">${c}</g>`;
  // primitive shapes: a ring and an arc, low on the right
  const ring = `<circle cx="${n(0.69 * W)}" cy="${n(0.8 * H)}" r="${n(70 * k)}" fill="none" stroke="url(#${p}-ghost)" stroke-width="1.5"/>`;
  const arc = `<path d="M${n(0.84 * W)} ${n(0.95 * H)}a${n(150 * k)} ${n(150 * k)} 0 0 1 ${n(300 * k)} 0" fill="none" stroke="#4F94FF" stroke-opacity=".25" stroke-width="2"/>`;
  return g + ring + arc;
}

const MOTIF = { website: websiteMotif, mobile: mobileMotif, seo: seoMotif, branding: brandingMotif };

// Aurora per service: same family, light anchored low behind the right column, where every
// desktop crop (bottom-anchored) still shows it and no text box ever reaches.
function lights(key, W, H) {
  const L = {
    website: [
      { x: 0.8, y: 0.38, rx: 0.075, ry: 0.13, c: T.primary, o: 0.5 },
      { x: 0.9, y: 0.68, rx: 0.065, ry: 0.17, c: T.primary, o: 0.55 },
      { x: 0.97, y: 0.84, rx: 0.05, ry: 0.1, c: T.violet, o: 0.3 },
      { x: 0.72, y: 0.27, rx: 0.07, ry: 0.07, c: T.navy2, o: 0.45 },
    ],
    mobile: [
      { x: 0.79, y: 0.6, rx: 0.1, ry: 0.2, c: T.primary, o: 0.55 },
      { x: 0.92, y: 0.8, rx: 0.06, ry: 0.14, c: T.violet, o: 0.3 },
      { x: 0.7, y: 0.86, rx: 0.08, ry: 0.07, c: T.navy2, o: 0.45 },
    ],
    seo: [
      { x: 0.77, y: 0.56, rx: 0.09, ry: 0.2, c: T.primary, o: 0.55 },
      { x: 0.89, y: 0.78, rx: 0.06, ry: 0.13, c: T.violet, o: 0.28 },
      { x: 0.69, y: 0.86, rx: 0.07, ry: 0.07, c: T.navy2, o: 0.45 },
    ],
    branding: [
      { x: 0.85, y: 0.68, rx: 0.08, ry: 0.19, c: T.primary, o: 0.55 },
      { x: 0.94, y: 0.44, rx: 0.045, ry: 0.11, c: T.violet, o: 0.3 },
      { x: 0.75, y: 0.88, rx: 0.07, ry: 0.07, c: T.navy2, o: 0.45 },
    ],
  }[key];
  return L.map((b) => ({ ...b, x: b.x * W, y: b.y * H, rx: b.rx * W, ry: b.ry * H }));
}

function build(key) {
  const { W, H, wall } = SPECS[key];
  const p = `h1${key[0]}`;
  const L = lights(key, W, H);
  let defs = `<defs>${glassDefs(p, { blur: Math.round(0.045 * W) })}`;
  defs += `<linearGradient id="${p}-base" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="${T.base}"/><stop offset=".55" stop-color="${T.base}"/><stop offset=".82" stop-color="#090B10"/><stop offset="1" stop-color="#0B0E15"/></linearGradient>`;
  defs += wallX(p, 'wall', wall[0] * W, wall[1] * W, H);
  defs += `<linearGradient id="${p}-top" x1="0" y1="0" x2="0" y2="${n(0.24 * H)}" gradientUnits="userSpaceOnUse"><stop offset=".45" stop-color="${T.base}"/><stop offset="1" stop-color="${T.base}" stop-opacity="0"/></linearGradient>`;
  defs += `<linearGradient id="${p}-floor" x1="0" y1="0" x2="0" y2="1"><stop offset=".8" stop-color="${T.floor}" stop-opacity="0"/><stop offset="1" stop-color="${T.floor}"/></linearGradient>`;
  defs += `<radialGradient id="${p}-gm0" cx="${n(0.82 * W)}" cy="${n(0.45 * H)}" r="${n(0.28 * W)}" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;
  defs += `<mask id="${p}-gm" maskUnits="userSpaceOnUse" x="0" y="0" width="${W}" height="${H}"><rect width="${W}" height="${H}" fill="url(#${p}-gm0)"/></mask>`;
  defs += `</defs>`;

  let body = defs + `<rect width="${W}" height="${H}" fill="url(#${p}-base)"/>`;
  body += aurora(p, L);
  body += MOTIF[key](p, W, H);
  body += `<rect width="${n(wall[1] * W)}" height="${H}" fill="url(#${p}-wall)"/>`;
  body += `<rect width="${W}" height="${n(0.24 * H)}" fill="url(#${p}-top)"/>`;
  body += `<rect width="${W}" height="${H}" fill="url(#${p}-floor)"/>`;
  body += grainRect(`${p}-grain`, W, H, 0.06, `${p}-gm`);
  return svg(W, H, body);
}

export const images = Object.entries(SPECS).map(([key, s]) => ({
  id: `h1-${key}-bg`,
  target: s.file,
  width: s.W,
  height: s.H,
  format: 'webp',
  quality: 78,
  dither: 4,
  svg: () => build(key),
}));
