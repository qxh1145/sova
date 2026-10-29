#!/usr/bin/env node
// Regenerates every Sova image from its SVG source.
//
//   node design/images/build.mjs                    build every image in src/ into apps/frontend/public
//   node design/images/build.mjs h1 h3              only images whose id starts with h1 or h3
//   node design/images/build.mjs --out /tmp/x       write the outputs under another public/ root
//   node design/images/build.mjs directions         rebuild the Step 1 direction samples
//   node design/images/build.mjs --record           only rewrite apps/frontend/tests/baseline/redesigned-hash.json
//
// Each generator in src/ exports `images`: [{ id, target, width, height, format, quality, dither, svg }].
// The SVG source of every image is written to svg/<id>.svg; the raster goes to <public>/<target>.
// sharp is resolved from apps/frontend/node_modules (it ships with Next.js).
// A build into apps/frontend/public (no --out) also rewrites tests/baseline/redesigned-hash.json, the
// hashes `npm run verify:assets` checks every redesigned file against.
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO = join(HERE, '..', '..');
const FRONTEND = join(REPO, 'apps', 'frontend');
const require = createRequire(join(FRONTEND, 'package.json'));
const sharp = require('sharp');

const kb = (file) => (statSync(file).size / 1024).toFixed(1);

function write(file, data) {
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, data);
}

// Seeded triangular noise of ±amp levels, added before encoding. Near-black gradients
// otherwise band into visible rings once WebP/JPEG quantises them.
function dither(buf, amp, channels, seed = 1) {
  let s = seed >>> 0;
  const rand = () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return (s >>> 0) / 4294967296;
  };
  for (let i = 0; i < buf.length; i += channels) {
    const d = (rand() - rand()) * amp; // same offset on R, G, B: luminance grain, no colour noise
    for (let c = 0; c < 3; c++) buf[i + c] = Math.max(0, Math.min(255, Math.round(buf[i + c] + d)));
  }
  return buf;
}

async function raster(svgString, out, { width, height, format, quality = 78, alphaQuality = 90, ditherAmp = 0, alpha = false, palette = false }) {
  // density 72 keeps 1 SVG unit = 1 px; every source is authored at its output size.
  let img = sharp(Buffer.from(svgString), { density: 72, limitInputPixels: false });
  if (width || height) img = img.resize(width, height, { fit: 'fill' });
  if (!alpha) img = img.flatten({ background: '#07080B' });
  if (ditherAmp) {
    const { data, info } = await img.raw().toBuffer({ resolveWithObject: true });
    img = sharp(dither(data, ditherAmp, info.channels), {
      raw: { width: info.width, height: info.height, channels: info.channels },
    });
  }
  if (format === 'webp') img = img.webp({ quality, alphaQuality, effort: 6, smartSubsample: true });
  else if (format === 'png') img = img.png({ compressionLevel: 9, palette, quality: palette ? quality : 100, effort: 10 });
  else if (format === 'jpg') img = img.jpeg({ quality, mozjpeg: true, chromaSubsampling: '4:4:4' });
  mkdirSync(dirname(out), { recursive: true });
  await img.toFile(out);
  return out;
}

// ---------------------------------------------------------------- production images (src/)
async function buildImages(filters, publicRoot) {
  const rows = [];
  const dir = join(HERE, 'src');
  for (const f of readdirSync(dir).filter((x) => x.endsWith('.mjs')).sort()) {
    const mod = await import(pathToFileURL(join(dir, f)).href);
    for (const im of mod.images ?? []) {
      if (filters.length && !filters.some((q) => im.id.startsWith(q))) continue;
      const svgText = im.svg();
      write(join(HERE, 'svg', `${im.id}.svg`), svgText);
      const out = join(publicRoot, im.target);
      if (im.format === 'svg') {
        write(out, svgText);
      } else {
        await raster(svgText, out, {
          width: im.width,
          height: im.height,
          format: im.format,
          quality: im.quality,
          alphaQuality: im.alphaQuality,
          ditherAmp: im.dither ?? 0,
          alpha: !!im.alpha,
          palette: !!im.palette,
        });
      }
      rows.push([im.id, relative(REPO, out), kb(out)]);
      // `replaces: null` marks a new file (nothing in the source to swap back to)
      manifest.push({ id: im.id, target: im.target, replaces: im.replaces === undefined ? im.target : im.replaces, kb: Number(kb(out)) });
    }
  }
  return rows;
}

// Every image built, for tools/shots.mjs (which file to swap back for a "before" shot).
const manifest = [];

// ---------------------------------------------------------------- Step 1 samples
const DIRECTIONS = ['a-blueprint', 'b-glass', 'c-signal'];

async function buildDirections(only) {
  const rows = [];
  for (const id of DIRECTIONS.filter((d) => !only.length || only.includes(d))) {
    const mod = await import(`./directions/${id}.mjs`);
    const base = join(HERE, 'directions', id);
    const h3 = mod.h3();
    write(join(base, 'h3-about-hero.svg'), h3);
    const h3Out = await raster(h3, join(base, 'out', 'b803093e046f6c0f65cdc5e8b18780ed.webp'), {
      format: 'webp',
      quality: 78,
      ditherAmp: 4,
    });
    rows.push([id, relative(HERE, h3Out), kb(h3Out)]);
    const i4 = mod.i4();
    write(join(base, 'i4-website-reach.svg'), i4);
    const i4Out = join(base, 'out', 'benefit-icon-1.svg');
    write(i4Out, i4);
    rows.push([id, relative(HERE, i4Out), kb(i4Out)]);
    await raster(i4, join(base, 'out', 'preview', 'i4@4x.png'), { width: 280, height: 280, format: 'png', alpha: true });
  }
  return rows;
}

// ---------------------------------------------------------------- redesigned-hash.json
// { "<target>": { sha256, original } } for every manifest entry, from the file now in public/.
function record() {
  const entries = JSON.parse(readFileSync(join(HERE, 'manifest.json'), 'utf8'));
  const out = {};
  for (const m of entries.sort((a, b) => (a.target < b.target ? -1 : 1))) {
    const sha256 = createHash('sha256').update(readFileSync(join(FRONTEND, 'public', m.target))).digest('hex');
    out[m.target] = { sha256, original: m.replaces };
  }
  write(join(FRONTEND, 'tests', 'baseline', 'redesigned-hash.json'), JSON.stringify(out, null, 2) + '\n');
  console.log(`redesigned-hash.json: ${entries.length} files`);
}

// ---------------------------------------------------------------- CLI
const args = process.argv.slice(2);
if (args.includes('--record')) {
  record();
  process.exit(0);
}
let publicRoot = join(FRONTEND, 'public');
const outIdx = args.indexOf('--out');
if (outIdx >= 0) {
  publicRoot = args[outIdx + 1];
  args.splice(outIdx, 2);
}
const rows =
  args[0] === 'directions' ? await buildDirections(args.slice(1)) : await buildImages(args, publicRoot);
if (manifest.length) {
  const file = join(HERE, 'manifest.json');
  let prev = [];
  try {
    prev = JSON.parse(readFileSync(file, 'utf8'));
  } catch {
    prev = [];
  }
  const byId = new Map(prev.map((m) => [m.id, m]));
  for (const m of manifest) byId.set(m.id, m);
  write(file, JSON.stringify([...byId.values()].sort((a, b) => a.id.localeCompare(b.id)), null, 2) + '\n');
}
if (!existsSync(publicRoot)) mkdirSync(publicRoot, { recursive: true });
for (const [id, f, s] of rows) console.log(`${s.padStart(8)} KB  ${id.padEnd(22)} ${f}`);
if (outIdx < 0 && args[0] !== 'directions' && manifest.length) record();
