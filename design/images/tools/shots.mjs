#!/usr/bin/env node
// Before/after screenshots into design/images/shots/[<dir>/]<name>/{before,after}__<width>.png.
//
//   1. Start the site on port 3002 (npm run dev -- --port 3002, or build + start).
//   2. node design/images/tools/shots.mjs                 → "after" shots of every P1 route
//      node design/images/tools/shots.mjs --before        → also "before": each replaced file is
//                                                            served from its git HEAD version
//   Options: --widths 1440,1024,768,390   --routes <file>   --port 3002   --originals <dir>
//            --dir p3 (subfolder of shots/)   --only i1,i6 (swap only manifest ids with these prefixes)
//
// --originals reads the old files from a folder laid out like public/ instead of git.
// "Before" intercepts the requests for each manifest target and answers with the original bytes and
// their content type, so a format change (.png → .svg) still shows the old image. New files
// (replaces: null) have no original and show as they are.
//
// A routes file line is a route, optionally followed by ` | key: value` fields:
//   el: <selector>      screenshot that element (scrolled into view) instead of the viewport
//   click: <selector>   click it first (e.g. open a widget)
//   widths: 1440,390    only these widths
//   as: <name>          folder name (default: the route's slug)
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import { mkdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const IMAGES = join(HERE, '..');
const REPO = join(IMAGES, '..', '..');
const FRONTEND = join(REPO, 'apps', 'frontend');
const require = createRequire(join(FRONTEND, 'package.json'));
const { chromium } = require('@playwright/test');

const argv = process.argv.slice(2);
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : def;
};
const widths = opt('widths', '1440,1024,768,390').split(',').map(Number);
const port = opt('port', '3002');
const OUT = join(IMAGES, 'shots', opt('dir', ''));
const HEIGHT = { 1920: 1080, 1440: 900, 1024: 768, 768: 1024, 390: 844 };
const slug = (r) => r.replace(/^\/|\/$/g, '').replaceAll('/', '_') || 'home';
const shots = readFileSync(opt('routes', join(HERE, 'p1-routes.txt')), 'utf8')
  .split('\n')
  .map((l) => l.trim())
  .filter((l) => l && !l.startsWith('#'))
  .map((l) => {
    const [route, ...fields] = l.split(' | ');
    const o = Object.fromEntries(fields.map((f) => [f.slice(0, f.indexOf(':')).trim(), f.slice(f.indexOf(':') + 1).trim()]));
    return { route: route.trim(), el: o.el, click: o.click, widths: o.widths?.split(',').map(Number), name: o.as ?? slug(route.trim()) };
  });
const TYPES = { '.png': 'image/png', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml' };

async function shoot(label, originals) {
  const browser = await chromium.launch();
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: HEIGHT[w] ?? 900 }, reducedMotion: 'reduce' });
    if (originals)
      await ctx.route(
        (url) => originals.has(decodeURIComponent(url.pathname)),
        (route) => route.fulfill({ status: 200, ...originals.get(decodeURIComponent(new URL(route.request().url()).pathname)) }),
      );
    const page = await ctx.newPage();
    for (const s of shots.filter((x) => !x.widths || x.widths.includes(w))) {
      const dir = join(OUT, s.name);
      mkdirSync(dir, { recursive: true });
      try {
        await page.goto(`http://localhost:${port}${s.route}`, { waitUntil: 'load', timeout: 90_000 });
        await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' });
        await page.waitForTimeout(2200);
        if (s.click) {
          await page.locator(s.click).first().click();
          await page.waitForTimeout(1200);
        }
        const file = join(dir, `${label}__${w}.png`);
        if (s.el) {
          const el = page.locator(s.el).first();
          await el.scrollIntoViewIfNeeded();
          await page.waitForTimeout(1500);
          await el.screenshot({ path: file });
        } else await page.screenshot({ path: file });
      } catch (e) {
        console.warn('FAIL', s.name, w, String(e).slice(0, 160));
      }
    }
    await ctx.close();
  }
  await browser.close();
}

function oldBytes(rel, originals) {
  if (originals) return readFileSync(join(originals, rel));
  return execFileSync('git', ['show', `HEAD:apps/frontend/public/${rel}`], { cwd: REPO, maxBuffer: 64 << 20 });
}

if (argv.includes('--before')) {
  const only = opt('only', '').split(',').filter(Boolean);
  const manifest = JSON.parse(readFileSync(join(IMAGES, 'manifest.json'), 'utf8'));
  const originals = new Map();
  for (const m of manifest) {
    if (!m.replaces || (only.length && !only.some((p) => m.id.startsWith(p)))) continue;
    originals.set(`/${m.target}`, { body: oldBytes(m.replaces, opt('originals')), contentType: TYPES[extname(m.replaces)] });
  }
  await shoot('before', originals);
  console.log(`before: ${shots.length} shots × ${widths.length} widths (${originals.size} files served as originals)`);
}
await shoot('after');
console.log(`after: ${shots.length} shots × ${widths.length} widths → ${OUT}`);
