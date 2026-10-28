#!/usr/bin/env node
// Removes Content Credentials (C2PA) blocks from built images without re-encoding them.
// The file-transfer channel used during the refresh embeds a C2PA manifest in every image it
// writes (pixel-identical, about 6 KB each). This drops it so each shipped file is exactly what
// the build produced:
//   WebP  'C2PA' RIFF chunk      JPEG  APP11 (JUMBF) segments      PNG  'caBX' chunk
//   SVG   <metadata> holding a c2pa manifest, and its xmlns:c2pa declaration
//
//   node design/images/tools/strip-c2pa.mjs                 every target in design/images/manifest.json
//   node design/images/tools/strip-c2pa.mjs <file> [...]    given files
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const PUBLIC = join(HERE, '..', '..', '..', 'apps', 'frontend', 'public');

function stripWebp(b) {
  if (b.toString('ascii', 0, 4) !== 'RIFF' || b.toString('ascii', 8, 12) !== 'WEBP') return null;
  const parts = [b.subarray(0, 12)];
  let removed = 0;
  for (let i = 12; i + 8 <= b.length; ) {
    const type = b.toString('ascii', i, i + 4);
    const size = b.readUInt32LE(i + 4);
    const end = i + 8 + size + (size & 1);
    if (type === 'C2PA') removed++;
    else parts.push(b.subarray(i, end));
    i = end;
  }
  if (!removed) return null;
  const out = Buffer.concat(parts);
  out.writeUInt32LE(out.length - 8, 4);
  return out;
}

function stripJpeg(b) {
  if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  const parts = [b.subarray(0, 2)];
  let i = 2;
  let removed = 0;
  while (i + 4 <= b.length && b[i] === 0xff) {
    const marker = b[i + 1];
    if (marker === 0xda) break; // start of scan: the rest is image data
    const len = b.readUInt16BE(i + 2);
    if (marker === 0xeb) removed++; // APP11 carries the JUMBF / C2PA box
    else parts.push(b.subarray(i, i + 2 + len));
    i += 2 + len;
  }
  if (!removed) return null;
  parts.push(b.subarray(i));
  return Buffer.concat(parts);
}

function stripPng(b) {
  if (b.readUInt32BE(0) !== 0x89504e47) return null;
  const parts = [b.subarray(0, 8)];
  let removed = 0;
  for (let i = 8; i + 12 <= b.length; ) {
    const len = b.readUInt32BE(i);
    const type = b.toString('ascii', i + 4, i + 8);
    const end = i + 12 + len;
    if (type === 'caBX') removed++;
    else parts.push(b.subarray(i, end));
    i = end;
  }
  return removed ? Buffer.concat(parts) : null;
}

function stripSvg(b) {
  const text = b.toString('utf8');
  if (!text.includes('<svg')) return null;
  let out = text.replace(/<metadata\b[\s\S]*?<\/metadata>/gi, (m) => (/c2pa/i.test(m) ? '' : m));
  if (out !== text) out = out.replace(/\s+xmlns:c2pa="[^"]*"/, '');
  return out === text ? null : Buffer.from(out);
}

const strip = (file, b) =>
  file.endsWith('.webp') ? stripWebp(b)
  : /\.jpe?g$/.test(file) ? stripJpeg(b)
  : file.endsWith('.png') ? stripPng(b)
  : file.endsWith('.svg') ? stripSvg(b)
  : null;

let files = process.argv.slice(2);
if (!files.length) {
  const manifest = JSON.parse(readFileSync(join(HERE, '..', 'manifest.json'), 'utf8'));
  files = manifest.map((m) => join(PUBLIC, m.target));
}
let changed = 0;
for (const file of files) {
  if (!existsSync(file)) continue;
  const before = readFileSync(file);
  const after = strip(file, before);
  if (!after) continue;
  writeFileSync(file, after);
  changed++;
  console.log(`${(before.length / 1024).toFixed(1).padStart(7)} -> ${(after.length / 1024).toFixed(1).padStart(7)} KB  ${file}`);
}
console.log(`strip-c2pa: ${changed} of ${files.length} file(s) changed`);
