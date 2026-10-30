import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Page } from '@playwright/test';
import { test, expect, installRafCounter } from './fixtures';
import manifest from '../baseline/manifest.json';

export const CAP16_FINAL_STATE = ['.typewriter'];

const BEFORE_RUN_PATH = path.join(__dirname, 'cap16-before-run.json');
const PARTS_DIR = path.join(__dirname, '.cap16-parts');

export interface RouteMetrics {
  jsGzip: number;
  cls390: number;
  cls1440: number;
  idleRaf: number;
}

export type BeforeRunData = Record<string, RouteMetrics>;

/** Load cap16-before-run.json if it exists. */
export function loadBeforeRun(): BeforeRunData | null {
  if (!fs.existsSync(BEFORE_RUN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BEFORE_RUN_PATH, 'utf-8'));
  } catch {
    return null;
  }
}

/** Synchronize worker part files into cap16-before-run.json in record mode. */
export function syncBeforeRunJson(key: string, metrics: RouteMetrics) {
  fs.mkdirSync(PARTS_DIR, { recursive: true });
  fs.writeFileSync(path.join(PARTS_DIR, `${key}.json`), JSON.stringify(metrics, null, 2));

  const allParts: BeforeRunData = {};
  const partFiles = fs.readdirSync(PARTS_DIR).filter((f) => f.endsWith('.json'));
  for (const file of partFiles.sort()) {
    const k = file.replace(/\.json$/, '');
    allParts[k] = JSON.parse(fs.readFileSync(path.join(PARTS_DIR, file), 'utf-8'));
  }
  fs.writeFileSync(BEFORE_RUN_PATH, JSON.stringify(allParts, null, 2));
}

/** Check that all elements matching selectors are at their final state (opacity 1, width 100%, animation none). */
export async function expectFinalState(page: Page, selectors: string[] = CAP16_FINAL_STATE) {
  for (const selector of selectors) {
    const elements = await page.evaluate((sel) => {
      const els = Array.from(document.querySelectorAll(sel));
      return els.map((el, i) => {
        const cs = window.getComputedStyle(el);
        const parentCs = el.parentElement ? window.getComputedStyle(el.parentElement) : null;
        const anims = el.getAnimations ? el.getAnimations() : [];
        const active = anims.filter(
          (a) => a.playState === 'running' || Boolean((a as { pending?: boolean }).pending),
        );
        return {
          index: i,
          opacity: parseFloat(cs.opacity || '1'),
          widthPx: parseFloat(cs.width || '0'),
          parentWidthPx: parentCs ? parseFloat(parentCs.width || '0') : 0,
          animationName: cs.animationName,
          activeAnimationCount: active.length,
        };
      });
    }, selector);

    expect(elements.length, `Expected elements matching selector: ${selector}`).toBeGreaterThan(0);
    for (const el of elements) {
      expect(el.opacity, `${selector}[${el.index}] opacity should be 1 at final state`).toBe(1);
      expect(
        el.widthPx,
        `${selector}[${el.index}] computed width should be non-zero at final state`,
      ).toBeGreaterThan(0);
      if (el.parentWidthPx > 0) {
        expect(
          Math.abs(el.widthPx - el.parentWidthPx),
          `${selector}[${el.index}] computed width (${el.widthPx}px) should equal parent width (${el.parentWidthPx}px) at 100% final state`,
        ).toBeLessThanOrEqual(2);
      }
      expect(
        el.activeAnimationCount,
        `${selector}[${el.index}] should have no active/pending animations`,
      ).toBe(0);
      expect(el.animationName, `${selector}[${el.index}] animation property should be 'none'`).toBe(
        'none',
      );
    }
  }
}

/** Measure idle rAF count over a specified window (default 1000ms). */
export async function idleRafCount(page: Page, windowMs = 1000): Promise<number> {
  await page.evaluate(() => {
    (window as unknown as { __resetRafCount?: () => void }).__resetRafCount?.();
  });
  await page.waitForTimeout(windowMs);
  return await page.evaluate(() => {
    return (window as unknown as { __getRafCount?: () => number }).__getRafCount?.() ?? 0;
  });
}

/** Instrument EventTarget to track coarse pointer listeners on any target. */
export async function installPointerListenerTracker(page: Page) {
  await page.addInitScript(() => {
    const trackedEvents = new Set(['pointermove', 'mousemove', 'pointerover', 'mouseover']);
    const activeListeners = new Map<string, number>();

    const origAdd = EventTarget.prototype.addEventListener;
    const origRemove = EventTarget.prototype.removeEventListener;

    const isReactInternal = (listener: unknown) =>
      typeof listener === 'function' &&
      listener.name.startsWith('bound ') &&
      listener.toString().includes('[native code]');

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (typeof type === 'string' && trackedEvents.has(type)) {
        if (!isReactInternal(listener)) {
          activeListeners.set(type, (activeListeners.get(type) || 0) + 1);
        }
      }
      return origAdd.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (typeof type === 'string' && trackedEvents.has(type)) {
        if (!isReactInternal(listener)) {
          const cur = activeListeners.get(type) || 0;
          if (cur > 0) activeListeners.set(type, cur - 1);
        }
      }
      return origRemove.call(this, type, listener, options);
    };

    (
      window as unknown as { __getCoarsePointerListenerCounts: () => Record<string, number> }
    ).__getCoarsePointerListenerCounts = () => {
      const counts: Record<string, number> = {};
      for (const [k, v] of activeListeners.entries()) {
        if (v > 0) counts[k] = v;
      }
      return counts;
    };
  });
}

/** Track WebGL context creation and count live contexts connected to DOM. */
export async function installWebGLContextTracker(page: Page) {
  await page.addInitScript(() => {
    const canvasesWithContext = new Set<HTMLCanvasElement>();
    const origGetContext = HTMLCanvasElement.prototype.getContext;

    (HTMLCanvasElement.prototype as unknown as { getContext: unknown }).getContext = function (
      this: HTMLCanvasElement,
      contextType: string,
      ...args: unknown[]
    ) {
      const ctx = (
        origGetContext as (
          this: HTMLCanvasElement,
          type: string,
          ...rest: unknown[]
        ) => RenderingContext | null
      ).call(this, contextType, ...args);
      if (
        ctx &&
        (contextType === 'webgl' ||
          contextType === 'webgl2' ||
          contextType === 'experimental-webgl')
      ) {
        canvasesWithContext.add(this);
      }
      return ctx;
    };

    (
      window as unknown as {
        __getLiveWebGLContextCount: () => number;
        __hasWebGL2: () => boolean;
      }
    ).__getLiveWebGLContextCount = () => {
      let live = 0;
      for (const c of canvasesWithContext) {
        if (c.isConnected) live++;
      }
      return live;
    };

    (window as unknown as { __hasWebGL2: () => boolean }).__hasWebGL2 = () => {
      try {
        const c = document.createElement('canvas');
        return Boolean(c.getContext('webgl2'));
      } catch {
        return false;
      }
    };
  });
}

/** Check readability of headings and paragraphs in main when JS is disabled. */
export async function expectTextReadable(page: Page) {
  let items: Array<{ tag: string; text: string; opacity: number; visibility: string }>;
  try {
    const client = await page.context().newCDPSession(page);
    const res = await client.send('Runtime.evaluate', {
      expression: `(() => {
        const els = Array.from(document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, main p'));
        return els.map(el => {
          const cs = window.getComputedStyle(el);
          return {
            tag: el.tagName,
            text: el.textContent?.slice(0, 30) ?? '',
            opacity: parseFloat(cs.opacity || '1'),
            visibility: cs.visibility
          };
        });
      })()`,
      returnByValue: true,
    });
    items = res.result?.value ?? [];
  } catch {
    items = await page.evaluate(() => {
      const els = Array.from(
        document.querySelectorAll('main h1, main h2, main h3, main h4, main h5, main h6, main p'),
      );
      return els.map((el) => {
        const cs = window.getComputedStyle(el);
        return {
          tag: el.tagName,
          text: el.textContent?.slice(0, 30) ?? '',
          opacity: parseFloat(cs.opacity || '1'),
          visibility: cs.visibility,
        };
      });
    });
  }

  expect(items.length, 'Expected at least one main heading or paragraph').toBeGreaterThan(0);
  for (const item of items) {
    expect(item.opacity, `${item.tag} ("${item.text}") opacity should be > 0`).toBeGreaterThan(0);
    expect(item.visibility, `${item.tag} ("${item.text}") visibility should be visible`).toBe(
      'visible',
    );
  }
}

/** Measure route JS gzip sum, layout shift (CLS), and optional idle rAF after load. */
export async function measureRoute(
  page: Page,
  url: string,
  measureIdleRaf = false,
): Promise<{ jsGzip: number; cls: number; idleRaf: number }> {
  const jsResponses = new Map<string, Buffer>();
  const bodyPromises: Promise<void>[] = [];

  const onResponse = (response: import('@playwright/test').Response) => {
    const resUrl = response.url();
    if (resUrl.includes('/_next/static/') && resUrl.endsWith('.js')) {
      const p = Promise.race([
        response.body(),
        new Promise<Buffer>((_, reject) =>
          setTimeout(() => reject(new Error('body read timeout')), 3000),
        ),
      ])
        .then((body) => {
          if (!jsResponses.has(resUrl)) {
            jsResponses.set(resUrl, body);
          }
        })
        .catch(() => {});
      bodyPromises.push(p);
    }
  };

  page.on('response', onResponse);

  if (!(page as unknown as { __clsTrackerInstalled?: boolean }).__clsTrackerInstalled) {
    (page as unknown as { __clsTrackerInstalled?: boolean }).__clsTrackerInstalled = true;
    await page.addInitScript(() => {
      let clsValue = 0;
      try {
        const observer = new PerformanceObserver((entryList) => {
          for (const entry of entryList.getEntries()) {
            const shift = entry as unknown as { value: number; hadRecentInput: boolean };
            if (!shift.hadRecentInput) {
              clsValue += shift.value;
            }
          }
        });
        observer.observe({ type: 'layout-shift', buffered: true });
      } catch {}
      (window as unknown as { __getClsValue: () => number }).__getClsValue = () => clsValue;
    });
  }

  await page.goto(url, { waitUntil: 'load' });

  let idleRaf = 0;
  if (measureIdleRaf) {
    await page.waitForTimeout(1000);
    idleRaf = await idleRafCount(page, 1000);
  }

  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
  await page.waitForTimeout(500);
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

  const cls = await page.evaluate(() => {
    return (window as unknown as { __getClsValue?: () => number }).__getClsValue?.() ?? 0;
  });

  page.off('response', onResponse);
  await Promise.all(bodyPromises);

  let jsGzip = 0;
  for (const body of jsResponses.values()) {
    jsGzip += zlib.gzipSync(body).length;
  }

  return { jsGzip, cls, idleRaf };
}

// Target test routes for matrix suites
const CORE_ROUTES = [
  { name: 'home-vi', url: '/' },
  { name: 'home-en', url: '/en/home/' },
  { name: 'website-vi', url: '/thiet-ke-website/' },
];

test.describe('CAP-16: Reduced Motion & Typewriter', () => {
  for (const { name, url } of CORE_ROUTES) {
    test(`Typewriter shows final state on ${name} (${url})`, async ({ page }) => {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(url, { waitUntil: 'load' });
      await expectFinalState(page, CAP16_FINAL_STATE);
    });
  }
});

test.describe('CAP-16: Idle rAF under Reduced Motion', () => {
  for (const { name, url } of CORE_ROUTES) {
    test(`rAF calls within ceiling on ${name} (${url})`, async ({ page }) => {
      await installRafCounter(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(1000);

      const idle = await idleRafCount(page, 1000);
      const beforeRun = loadBeforeRun();
      const recorded = beforeRun?.[name]?.idleRaf ?? 0;
      const ceiling = recorded + 5;

      if (process.env.CAP16_RECORD !== '1') {
        expect(
          idle,
          `Idle rAF (${idle}) on ${name} exceeded recorded (${recorded}) + 5`,
        ).toBeLessThanOrEqual(ceiling);
      }
    });
  }
});

test.describe('CAP-16: Coarse Pointer', () => {
  for (const { name, url } of CORE_ROUTES) {
    test(`No pointermove/mousemove/pointerover/mouseover listeners on ${name}`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        hasTouch: true,
        isMobile: true,
        viewport: { width: 390, height: 844 },
      });
      const page = await context.newPage();
      await installPointerListenerTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

      const listeners = await page.evaluate(() => {
        return (
          (
            window as unknown as {
              __getCoarsePointerListenerCounts?: () => Record<string, number>;
            }
          ).__getCoarsePointerListenerCounts?.() ?? {}
        );
      });

      expect(
        Object.keys(listeners).length,
        `Coarse pointer attached hover listeners on ${name}: ${JSON.stringify(listeners)}`,
      ).toBe(0);
      await context.close();
    });
  }
});

test.describe('CAP-16: WebGL Contexts', () => {
  for (const { name, url } of CORE_ROUTES) {
    test(`Live connected WebGL/WebGL2 contexts <= 1 on ${name}`, async ({ page }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

      const live = await page.evaluate(() => {
        return (
          (
            window as unknown as { __getLiveWebGLContextCount?: () => number }
          ).__getLiveWebGLContextCount?.() ?? 0
        );
      });
      expect(live, `Live WebGL contexts on ${name} exceeded 1`).toBeLessThanOrEqual(1);

      const hasWebGL2 = await page.evaluate(() => {
        return (window as unknown as { __hasWebGL2?: () => boolean }).__hasWebGL2?.() ?? false;
      });
      test.info().annotations.push({
        type: 'webgl2-support',
        description: hasWebGL2 ? 'available' : 'unavailable',
      });
    });
  }
});

test.describe('CAP-16: JS Off Readability', () => {
  for (const { name, url } of CORE_ROUTES) {
    test(`Headings and paragraphs readable with JS off on ${name}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'load' });
      await expectTextReadable(page);
      await context.close();
    });
  }
});

test.describe('CAP-16: Budget & CLS Gate', () => {
  const isRecord = process.env.CAP16_RECORD === '1';

  for (const row of manifest.rows) {
    test(`Budget and CLS on ${row.key} (${row.url})`, async ({ context }) => {
      // 1. Measure at 1440 (standard motion, isolated page context)
      const page1440 = await context.newPage();
      await page1440.setViewportSize({ width: 1440, height: 900 });
      await installRafCounter(page1440);

      const { jsGzip, cls: cls1440, idleRaf } = await measureRoute(page1440, row.url, true);
      await page1440.close();

      // 2. Measure at 390 (standard motion, isolated page context)
      const page390 = await context.newPage();
      await page390.setViewportSize({ width: 390, height: 844 });
      const { cls: cls390 } = await measureRoute(page390, row.url, false);
      await page390.close();

      if (isRecord) {
        syncBeforeRunJson(row.key, { jsGzip, cls390, cls1440, idleRaf });
      } else {
        const beforeRun = loadBeforeRun();
        expect(beforeRun, 'Missing cap16-before-run.json: run CAP16_RECORD=1 first').not.toBeNull();
        const base = beforeRun![row.key];
        expect(base, `Missing before-run baseline for ${row.key}`).toBeDefined();

        expect(
          jsGzip,
          `JS gzip (${jsGzip} B) exceeded baseline (${base.jsGzip} B) + 40 KB`,
        ).toBeLessThanOrEqual(base.jsGzip + 40960);

        const ceiling390 = Math.max(0.1, base.cls390);
        expect(
          cls390,
          `CLS at 390px (${cls390.toFixed(4)}) exceeded ceiling ${ceiling390.toFixed(4)}`,
        ).toBeLessThanOrEqual(ceiling390);

        const ceiling1440 = Math.max(0.1, base.cls1440);
        expect(
          cls1440,
          `CLS at 1440px (${cls1440.toFixed(4)}) exceeded ceiling ${ceiling1440.toFixed(4)}`,
        ).toBeLessThanOrEqual(ceiling1440);
      }
    });
  }
});
