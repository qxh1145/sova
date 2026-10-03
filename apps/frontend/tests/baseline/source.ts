import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import type { BrowserContext, Page } from '@playwright/test';
import { isAllowedUrl, MAPS_EMBED_ALLOWLIST } from '../e2e/fixtures';

export const ERAS_CLONE_DIR = path.resolve(
  process.env.ERAS_CLONE_DIR ?? path.join(__dirname, '../../../../../eras-clone'),
);
export const hasSource = existsSync(path.join(ERAS_CLONE_DIR, 'index.html'));
export const missingSourceMessage = `Source mirror not found at ${ERAS_CLONE_DIR} (set ERAS_CLONE_DIR)`;
export const BASELINE_DIR = path.join(__dirname, '../../baseline');
export const SOURCE_ORIGIN = 'https://erasvietnam.vn';

const SOURCE_HOSTS = ['erasvietnam.vn', 'www.erasvietnam.vn'];
const ALIASES: Record<string, string> = {
  '/en/': 'en/home/index.html',
  '/en': 'en/home/index.html',
};
// GSAP is loaded from cdnjs; the mirror holds the same 3.12.2 build in the "Save Page" folder.
// Serving it from disk keeps the page's motion code working without any request leaving the machine.
const SAVED_FILES = 'Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files';
const LOCAL_COPIES: Record<string, string> = {
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js': `${SAVED_FILES}/gsap.min.js`,
  'https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/ScrollTrigger.min.js': `${SAVED_FILES}/ScrollTrigger.min.js`,
};

// fulfilled: erasvietnam.vn from the mirror; missing: erasvietnam.vn 404; local: cdnjs GSAP from the mirror;
// blocked: every other host (aborted); continued: data:/blob:/localhost only.
export type Evidence = {
  fulfilled: string[];
  missing: string[];
  local: string[];
  blocked: string[];
  continued: string[];
};
export type ManifestRow = {
  key: string;
  url: string;
  file?: string;
  family: string;
  locale: string;
  reason: string;
};

// The mirror stores `name.ext?query` as `name__q_<sha256(query)[:12]>.ext`.
function sourceFile(pathname: string, search: string): string | undefined {
  const rel = ALIASES[pathname] ?? decodeURIComponent(pathname).replace(/^\/+/, '');
  let file = path.resolve(ERAS_CLONE_DIR, rel);
  if (file !== ERAS_CLONE_DIR && !file.startsWith(ERAS_CLONE_DIR + path.sep)) return undefined;
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html');
  const { dir, name, ext } = path.parse(file);
  const hash = createHash('sha256').update(search.slice(1)).digest('hex').slice(0, 12);
  const candidates = search ? [path.join(dir, `${name}__q_${hash}${ext}`), file] : [file];
  return candidates.find((f) => existsSync(f) && statSync(f).isFile());
}

/** Fulfil erasvietnam.vn from ../eras-clone; abort every other host. `overrides` maps pathname -> mirror file. */
export async function serveSource(
  context: BrowserContext,
  evidence: Evidence,
  overrides: Record<string, string> = {},
) {
  await context.route('**/*', (route) => {
    const url = route.request().url();
    const { hostname, pathname, search } = new URL(url);
    if (SOURCE_HOSTS.includes(hostname)) {
      const file = overrides[pathname]
        ? path.join(ERAS_CLONE_DIR, overrides[pathname])
        : sourceFile(pathname, search);
      if (file) {
        evidence.fulfilled.push(url);
        return route.fulfill({ path: file }); // content-type from the file extension
      }
      evidence.missing.push(url);
      return route.fulfill({ status: 404, contentType: 'text/plain', body: 'Not in mirror' });
    }
    if (LOCAL_COPIES[url]) {
      evidence.local.push(url);
      return route.fulfill({ path: path.join(ERAS_CLONE_DIR, LOCAL_COPIES[url]) });
    }
    // Only local/non-http requests may pass; maps embeds are allowed for Sova e2e, not for the source.
    if (isAllowedUrl(url) && !MAPS_EMBED_ALLOWLIST.includes(hostname)) {
      evidence.continued.push(url);
      return route.continue();
    }
    evidence.blocked.push(url);
    return route.abort('blockedbyclient');
  });
}

/** Route the source and navigate to a manifest row. */
export async function openSource(page: Page, row: ManifestRow): Promise<Evidence> {
  const evidence: Evidence = { fulfilled: [], missing: [], local: [], blocked: [], continued: [] };
  await serveSource(page.context(), evidence, row.file ? { [row.url]: row.file } : {});
  await page.goto(SOURCE_ORIGIN + row.url, { waitUntil: 'load' });
  return evidence;
}

type MotionWindow = {
  gsap?: {
    globalTimeline: {
      getChildren(
        n: boolean,
        t: boolean,
        tl: boolean,
      ): { progress(v: number): { pause(): void } }[];
    };
  };
  ScrollTrigger?: { getAll(): { disable(revert: boolean): void }[] };
  jQuery?: (el: Element) => {
    data(
      key: string,
    ): { stopPlayer?(): void; select?(i: number, w: boolean, instant: boolean): void } | undefined;
  };
};

/** Load lazy content and stop all motion so screenshots are deterministic. Same for capture and compare. */
export async function freeze(page: Page) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addStyleTag({
    content:
      '*,*::before,*::after{transition:none!important;animation-duration:0s!important;animation-delay:0s!important;animation-iteration-count:1!important;scroll-behavior:auto!important}',
  });
  await page.evaluate(async () => {
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    document
      .querySelectorAll<HTMLImageElement>('img[loading="lazy"]')
      .forEach((img) => (img.loading = 'eager'));
    for (let y = 0; y < document.documentElement.scrollHeight; y += Math.round(innerHeight / 2)) {
      scrollTo(0, y);
      await wait(60);
    }
    scrollTo(0, document.documentElement.scrollHeight);
    await wait(300);
    scrollTo(0, 0);
    await wait(300);
  });
  await page.evaluate(async () => {
    const w = window as unknown as MotionWindow;
    w.gsap?.globalTimeline.getChildren(true, true, true).forEach((t) => t.progress(1).pause());
    w.ScrollTrigger?.getAll().forEach((t) => t.disable(false));
    document.querySelectorAll('.flickity-enabled').forEach((el) => {
      const f = w.jQuery?.(el).data('flickity');
      f?.stopPlayer?.();
      f?.select?.(0, false, true);
    });
    document.querySelectorAll('video').forEach((v) => {
      v.pause();
      v.currentTime = 0;
    });
    await document.fonts.ready;
    // decode() waits for load and decode (images are `decoding="async"`); broken images reject, ignored.
    const images = Promise.all(
      Array.from(document.images).map((img) => img.decode().catch(() => undefined)),
    );
    // ponytail: 10s cap so one stuck asset cannot hang a shot; the evidence JSON lists what was missing.
    await Promise.race([images, new Promise((r) => setTimeout(r, 10_000))]);
  });
  // Late layout (resize handlers, decoded images) can still move the page: wait until its height holds.
  for (let last = -1, i = 0; i < 40; i++) {
    const height = await page.evaluate(() => document.documentElement.scrollHeight);
    if (height === last) break;
    last = height;
    await page.waitForTimeout(250);
  }
}

/** Full-page shot taken like toHaveScreenshot does: repeat until two consecutive shots are identical. */
export async function stableScreenshot(page: Page): Promise<Buffer> {
  const options = { fullPage: true, animations: 'disabled' } as const;
  let previous = await page.screenshot(options);
  for (let i = 0; i < 5; i++) {
    const next = await page.screenshot(options);
    if (next.equals(previous)) break;
    previous = next;
  }
  return previous;
}

export async function domSummary(page: Page) {
  return page.evaluate(() => {
    const text = (sel: string) =>
      Array.from(document.querySelectorAll(sel)).map((el) =>
        (el.textContent ?? '').replace(/\s+/g, ' ').trim(),
      );
    return {
      title: document.title,
      h1: text('h1'),
      h2: text('h2'),
      h3: text('h3'),
      links: document.links.length,
    };
  });
}

// Tool state and planning notes, not site source (diverges from verify-docs.py on purpose).
const HASH_SKIP_TOP = ['.omc', 'docs'];

/** SHA-256 of every mirror file except under `.git` (anywhere), top-level `.omc/` and `docs/`; keyed by relative path, sorted. */
export function hashSource(): Record<string, string> {
  const files = (readdirSync(ERAS_CLONE_DIR, { recursive: true }) as string[])
    .map((rel) => rel.split(path.sep).join('/'))
    .filter(
      (rel) =>
        !rel.split('/').includes('.git') &&
        !HASH_SKIP_TOP.includes(rel.split('/')[0]) &&
        statSync(path.join(ERAS_CLONE_DIR, rel)).isFile(),
    )
    .sort();
  return Object.fromEntries(
    files.map((rel) => [
      rel,
      createHash('sha256')
        .update(readFileSync(path.join(ERAS_CLONE_DIR, rel)))
        .digest('hex'),
    ]),
  );
}
