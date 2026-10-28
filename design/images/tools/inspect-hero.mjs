// Quick look at a hero raster: desktop / mobile crops + calm-zone luminance.
//   node inspect-hero.mjs <image> <out-prefix> [crop json]
// Crop defaults are the About hero (H3): object-position 48% 100%,
// desktop box 1440×720, mobile box 390×624.
import { createRequire } from 'node:module';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const require = createRequire(join(HERE, '..', '..', '..', 'apps', 'frontend', 'package.json'));
const sharp = require('sharp');

const [, , file, prefix, cropJson] = process.argv;
const spec = cropJson
  ? JSON.parse(cropJson)
  : { pos: [0.48, 1], boxes: { desktop: [1440, 720], mobile: [390, 624] } };

const lin = (c) => {
  c /= 255;
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
};
const L = (r, g, b) => 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
const LW = L(254, 254, 254);
const contrast = (l) => (LW + 0.05) / (l + 0.05);

const img = sharp(file);
const { width: W, height: H } = await img.metadata();
const raw = await img.clone().removeAlpha().raw().toBuffer();

function region(x0, y0, x1, y1) {
  const ls = [];
  for (let y = Math.max(0, Math.floor(y0)); y < Math.min(H, Math.ceil(y1)); y += 2)
    for (let x = Math.max(0, Math.floor(x0)); x < Math.min(W, Math.ceil(x1)); x += 2) {
      const i = (y * W + x) * 3;
      ls.push(L(raw[i], raw[i + 1], raw[i + 2]));
    }
  ls.sort((a, b) => a - b);
  const p = (q) => ls[Math.min(ls.length - 1, Math.floor(q * ls.length))];
  return { p50: p(0.5), p99: p(0.99), max: ls[ls.length - 1] };
}

const L222 = L(0x22, 0x22, 0x22);
const report = {};
for (const [name, [bw, bh]] of Object.entries(spec.boxes)) {
  const s = Math.max(bw / W, bh / H);
  const rw = W * s;
  const rh = H * s;
  const ox = (rw - bw) * spec.pos[0];
  const oy = (rh - bh) * spec.pos[1];
  const sx0 = ox / s;
  const sy0 = oy / s;
  const sw = bw / s;
  const sh = bh / s;
  await sharp(file)
    .extract({ left: Math.round(sx0), top: Math.round(sy0), width: Math.round(sw), height: Math.round(sh) })
    .resize(bw, bh)
    .png()
    .toFile(`${prefix}-${name}.png`);
  report[name] = { visibleX: [(sx0 / W) * 100, ((sx0 + sw) / W) * 100].map((v) => v.toFixed(1) + '%') };
}

// calm zones (source px) for H3
const zones = spec.zones ?? {
  'text (x 0–52%)': [0, 0, 0.52 * W, H],
  'mobile strip (x 34–63%)': [0.34 * W, 0, 0.63 * W, H],
  'nav band (y 0–13%)': [0, 0, W, 0.13 * H],
};
for (const [k, [x0, y0, x1, y1]] of Object.entries(zones)) {
  const r = region(x0, y0, x1, y1);
  report[k] = {
    p99: r.p99.toFixed(4),
    max: r.max.toFixed(4),
    '≤#222': r.p99 <= L222 ? 'yes' : 'NO',
    'white contrast @p99': contrast(r.p99).toFixed(1),
  };
}
console.log(JSON.stringify(report, null, 1));
