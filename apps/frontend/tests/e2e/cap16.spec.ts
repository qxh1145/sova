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
  /** rAF calls in a 1s window after load at 1440px under `reducedMotion: 'reduce'`. */
  idleRaf: number;
}

export type BeforeRunData = Record<string, RouteMetrics>;

/** Load cap16-before-run.json; null only when the file is absent. A corrupt file throws. */
export function loadBeforeRun(): BeforeRunData | null {
  if (!fs.existsSync(BEFORE_RUN_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(BEFORE_RUN_PATH, 'utf-8'));
  } catch (e) {
    throw new Error(`cap16-before-run.json is unreadable: ${e}`);
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

    // React's root dispatchers are bound functions (minified name, e.g. `bound fF`) added to a
    // container React has marked `_reactListening<random>`. Only those are skipped; a bound app
    // listener on any other target still counts.
    // ponytail: an app listener bound with `.bind` on a React root (document) is still skipped;
    // match React's per-type listener burst if that ever matters.
    const isReactInternal = (target: EventTarget, listener: unknown) =>
      typeof listener === 'function' &&
      listener.name.startsWith('bound ') &&
      Object.keys(target).some((k) => k.startsWith('_reactListening'));

    EventTarget.prototype.addEventListener = function (type, listener, options) {
      if (typeof type === 'string' && trackedEvents.has(type)) {
        if (!isReactInternal(this, listener)) {
          activeListeners.set(type, (activeListeners.get(type) || 0) + 1);
        }
      }
      return origAdd.call(this, type, listener, options);
    };

    EventTarget.prototype.removeEventListener = function (type, listener, options) {
      if (typeof type === 'string' && trackedEvents.has(type)) {
        if (!isReactInternal(this, listener)) {
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

/**
 * Check that every rendered `main` heading, paragraph and `.typewriter` line is visible once finite
 * CSS animations end. `checkVisibility` walks ancestors, so text inside an `opacity: 0` or hidden
 * wrapper (e.g. a scroll-reveal block) fails even when its own opacity is 1.
 */
export async function expectTextReadable(page: Page) {
  const { total, hidden } = await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
    await Promise.all(finite.map((a) => a.finished.catch(() => undefined)));
    const els = Array.from(
      document.querySelectorAll('main :is(h1, h2, h3, h4, h5, h6, p, .typewriter)'),
    ).filter((el) => el.getClientRects().length > 0);
    return {
      total: els.length,
      hidden: els
        .filter((el) => !el.checkVisibility({ opacityProperty: true, visibilityProperty: true }))
        .map((el) => `${el.tagName} ("${(el.textContent ?? '').trim().slice(0, 30)}")`),
    };
  });

  expect(total, 'Expected at least one rendered main heading or paragraph').toBeGreaterThan(0);
  expect(hidden, 'Text hidden by opacity 0 or visibility on itself or an ancestor').toEqual([]);
}

/**
 * Idle rAF calls after load at 1440px under `reducedMotion: 'reduce'`. The record run and the
 * gate both use this, so the before-run and the check measure the same condition.
 */
export async function reducedMotionIdleRaf(page: Page, url: string): Promise<number> {
  await installRafCounter(page);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  await page.waitForTimeout(1000);
  return idleRafCount(page, 1000);
}

/** Measure route JS gzip sum and layout shift (CLS) after load, scroll to bottom and network idle. */
export async function measureRoute(
  page: Page,
  url: string,
): Promise<{ jsGzip: number; cls: number }> {
  const jsResponses = new Map<string, Buffer>();
  const bodyPromises: Promise<void>[] = [];

  const onResponse = (response: import('@playwright/test').Response) => {
    const resUrl = response.url();
    const { pathname } = new URL(resUrl);
    if (pathname.startsWith('/_next/static/') && pathname.endsWith('.js')) {
      // A failed read rejects Promise.all below: an unread chunk must fail, not shrink jsGzip.
      bodyPromises.push(
        response.body().then((body) => {
          if (!jsResponses.has(resUrl)) jsResponses.set(resUrl, body);
        }),
      );
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
  // Settle before the jump: scrolling right at `load` puts a still-mounting section under the
  // viewport, and its first layout reads as a whole-viewport shift (CLS 1.0) no user would see.
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

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

  return { jsGzip, cls };
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
      test.skip(process.env.CAP16_RECORD === '1', 'the Budget test records idleRaf');
      const base = loadBeforeRun()?.[name];
      expect(base, `Missing before-run idleRaf for ${name}: run CAP16_RECORD=1`).toBeDefined();

      const idle = await reducedMotionIdleRaf(page, url);
      expect(
        idle,
        `Idle rAF (${idle}) on ${name} exceeded recorded (${base!.idleRaf}) + 5`,
      ).toBeLessThanOrEqual(base!.idleRaf + 5);
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
      const { jsGzip, cls: cls1440 } = await measureRoute(page1440, row.url);
      await page1440.close();

      // 2. Measure at 390 (standard motion, isolated page context)
      const page390 = await context.newPage();
      await page390.setViewportSize({ width: 390, height: 844 });
      const { cls: cls390 } = await measureRoute(page390, row.url);
      await page390.close();

      if (isRecord) {
        // 3. Idle rAF under reduced motion: the reference for the idle rAF gate.
        const pageIdle = await context.newPage();
        const idleRaf = await reducedMotionIdleRaf(pageIdle, row.url);
        await pageIdle.close();
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
