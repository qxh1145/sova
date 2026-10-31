import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Page } from '@playwright/test';
import { test, expect, installRafCounter } from './fixtures';
import manifest from '../baseline/manifest.json';
import { REVEAL_TARGET_SELECTOR } from '../../src/components/motion/revealTargets';

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

/**
 * Track WebGL context creation: live = canvas connected to the DOM; unreleased = connected or its
 * context not lost (a detached canvas whose context was never lost still holds GPU memory). Also
 * counts WebGL2 draw calls, so a test can prove a canvas loop stopped while other rAF loops run.
 */
export async function installWebGLContextTracker(page: Page) {
  await page.addInitScript(() => {
    const canvasesWithContext = new Map<HTMLCanvasElement, WebGLRenderingContextBase>();
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
        canvasesWithContext.set(this, ctx as WebGLRenderingContextBase);
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
      for (const c of canvasesWithContext.keys()) {
        if (c.isConnected) live++;
      }
      return live;
    };

    (
      window as unknown as { __getUnreleasedWebGLContextCount: () => number }
    ).__getUnreleasedWebGLContextCount = () => {
      let unreleased = 0;
      for (const [c, ctx] of canvasesWithContext) {
        if (c.isConnected || !ctx.isContextLost()) unreleased++;
      }
      return unreleased;
    };

    let draws = 0;
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const proto = WebGL2RenderingContext.prototype;
      const origDrawArrays = proto.drawArrays;
      const origDrawElements = proto.drawElements;
      proto.drawArrays = function (...args: Parameters<typeof origDrawArrays>) {
        draws++;
        return origDrawArrays.apply(this, args);
      };
      proto.drawElements = function (...args: Parameters<typeof origDrawElements>) {
        draws++;
        return origDrawElements.apply(this, args);
      };
    }
    const w = window as unknown as { __getDrawCount: () => number; __resetDrawCount: () => void };
    w.__getDrawCount = () => draws;
    w.__resetDrawCount = () => {
      draws = 0;
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
    const root =
      document.querySelector(
        ':is(main, [role="main"], #content, #login, .portfolio-page-wrapper)',
      ) ?? document.body;
    const els = Array.from(
      root.querySelectorAll(
        ':is(h1, h2, h3, h4, h5, h6, p, .typewriter):not(.mota_mt, .mota_mt *, [data-state="inactive"], [data-state="inactive"] *)',
      ),
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

const HOME_ROUTES = CORE_ROUTES.filter(({ name }) => name.startsWith('home-'));

const seenFamilies = new Set<string>();
const FAMILY_ROUTES = manifest.rows.filter((row) => {
  if (seenFamilies.has(row.family)) return false;
  seenFamilies.add(row.family);
  return true;
});

/** Wait until the home hero canvas is in the DOM and has issued a WebGL2 draw call. */
async function waitForHeroDraw(page: Page) {
  await expect(page.locator('canvas.gradient-ascii-canvas')).toBeAttached();
  await expect
    .poll(() =>
      page.evaluate(() => (window as unknown as { __getDrawCount: () => number }).__getDrawCount()),
    )
    .toBeGreaterThan(0);
}

/** WebGL2 draw calls over `windowMs`. */
async function drawCount(page: Page, windowMs = 1000): Promise<number> {
  await page.evaluate(() =>
    (window as unknown as { __resetDrawCount: () => void }).__resetDrawCount(),
  );
  await page.waitForTimeout(windowMs);
  return page.evaluate(() =>
    (window as unknown as { __getDrawCount: () => number }).__getDrawCount(),
  );
}

/** Set `document.hidden` and fire `visibilitychange`, as a tab switch does. */
async function setHidden(page: Page, hidden: boolean) {
  await page.evaluate((value) => {
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => value });
    document.dispatchEvent(new Event('visibilitychange'));
  }, hidden);
}

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
      // The home hero creates its context in an effect: count after it exists and has drawn.
      if (HOME_ROUTES.some((route) => route.url === url)) await waitForHeroDraw(page);

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

test.describe('CAP-16: Home hero', () => {
  for (const { name, url } of HOME_ROUTES) {
    test(`Client navigation to a sub-page releases the hero context on ${name}`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);

      const href = await page.evaluate((home) => {
        const prefix = home === '/' ? '/' : '/en/';
        const link = Array.from(document.querySelectorAll<HTMLAnchorElement>('#footer a[href]'))
          .map((a) => a.getAttribute('href') ?? '')
          .find(
            (h) =>
              h.startsWith(prefix) &&
              h !== home &&
              h !== '/' &&
              (prefix === '/en/' || !h.startsWith('/en/')),
          );
        return link ?? null;
      }, url);
      expect(href, `No footer sub-page link on ${name}`).not.toBeNull();
      await page.locator(`#footer a[href="${href}"]`).first().click();
      await expect(page).toHaveURL(new RegExp(`${href!.replace(/\//g, '\\/')}$`));

      await expect
        .poll(() =>
          page.evaluate(() =>
            (
              window as unknown as { __getUnreleasedWebGLContextCount: () => number }
            ).__getUnreleasedWebGLContextCount(),
          ),
        )
        .toBe(0);
      const live = await page.evaluate(() =>
        (
          window as unknown as { __getLiveWebGLContextCount: () => number }
        ).__getLiveWebGLContextCount(),
      );
      expect(live).toBe(0);
    });

    test(`Hero pointer input attaches only under a fine pointer on ${name}`, async ({
      browser,
    }) => {
      // The hero adds a window `pointerdown` listener only under a fine pointer; other islands may add more.
      const pointerDownListeners = async (touch: boolean) => {
        const context = await browser.newContext(
          touch ? { hasTouch: true, isMobile: true, viewport: { width: 390, height: 844 } } : {},
        );
        const page = await context.newPage();
        await installWebGLContextTracker(page);
        await page.addInitScript(() => {
          let count = 0;
          const origAdd = window.addEventListener;
          window.addEventListener = function (this: Window, ...args: Parameters<typeof origAdd>) {
            if (args[0] === 'pointerdown') count++;
            return origAdd.apply(this, args);
          } as typeof origAdd;
          (window as unknown as { __pointerDownCount: () => number }).__pointerDownCount = () =>
            count;
        });
        await page.goto(url, { waitUntil: 'load' });
        await waitForHeroDraw(page);
        const count = await page.evaluate(() =>
          (window as unknown as { __pointerDownCount: () => number }).__pointerDownCount(),
        );
        await context.close();
        return count;
      };
      expect(
        await pointerDownListeners(false),
        'Fine pointer: hero input listener',
      ).toBeGreaterThanOrEqual(1);
      expect(await pointerDownListeners(true), 'Coarse pointer: hero input listener').toBe(0);
    });

    test(`Hero stops drawing offscreen and resumes on re-entry on ${name}`, async ({ page }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls while the hero is offscreen').toBe(0);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after the hero re-enters').toBeGreaterThan(0);
    });

    test(`Hero stops drawing in a hidden tab and resumes when visible on ${name}`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);

      await setHidden(page, true);
      await page.waitForTimeout(100);
      expect(await drawCount(page), 'Draw calls while the tab is hidden').toBe(0);

      await setHidden(page, false);
      expect(await drawCount(page), 'Draw calls after the tab is visible').toBeGreaterThan(0);
    });

    test(`Hero draws one still frame under reduced motion at load on ${name}`, async ({ page }) => {
      await installWebGLContextTracker(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after load under reduced motion').toBe(0);
    });

    test(`Hero stops when reduced motion is switched on mid-run on ${name}`, async ({ page }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after switching to reduce').toBe(0);

      await page.emulateMedia({ reducedMotion: 'no-preference' });
      expect(await drawCount(page), 'Draw calls after switching back').toBeGreaterThan(0);
    });

    test(`Hero shows the CSS fallback without WebGL2 on ${name}`, async ({ page }) => {
      const pageErrors: string[] = [];
      page.on('pageerror', (e) => pageErrors.push(e.message));
      await page.addInitScript(() => {
        const orig = HTMLCanvasElement.prototype.getContext;
        (HTMLCanvasElement.prototype as unknown as { getContext: unknown }).getContext = function (
          this: HTMLCanvasElement,
          type: string,
          ...args: unknown[]
        ) {
          if (type === 'webgl2') return null;
          return (orig as (this: HTMLCanvasElement, t: string, ...r: unknown[]) => unknown).call(
            this,
            type,
            ...args,
          );
        };
      });
      await page.goto(url, { waitUntil: 'load' });

      const fallback = page.locator('.banner-bg .gradient-ascii--fallback');
      await expect(fallback).toBeVisible();
      expect(await fallback.evaluate((el) => getComputedStyle(el).backgroundImage)).toMatch(
        /gradient/,
      );
      await expect(page.locator('canvas.gradient-ascii-canvas')).toBeHidden();
      expect(pageErrors).toEqual([]);
    });

    test(`Hero shows the fallback on context loss and recovers on restore on ${name}`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page);

      await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.gradient-ascii-canvas')!;
        const ext = canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!;
        (window as unknown as { __heroLose: WEBGL_lose_context }).__heroLose = ext;
        ext.loseContext();
      });
      await expect(page.locator('.banner-bg .gradient-ascii--fallback')).toBeVisible();
      expect(await drawCount(page, 500), 'Draw calls while the context is lost').toBe(0);

      await page.evaluate(() =>
        (window as unknown as { __heroLose: WEBGL_lose_context }).__heroLose.restoreContext(),
      );
      await expect(page.locator('.banner-bg .gradient-ascii--fallback')).toHaveCount(0);
      await expect(page.locator('canvas.gradient-ascii-canvas')).toBeVisible();
      expect(await drawCount(page), 'Draw calls after restore').toBeGreaterThan(0);
      const unreleased = await page.evaluate(() =>
        (
          window as unknown as { __getUnreleasedWebGLContextCount: () => number }
        ).__getUnreleasedWebGLContextCount(),
      );
      expect(unreleased, 'Contexts held after restore').toBeLessThanOrEqual(1);
    });
  }
});

/** Count reveal targets whose top is at or below the viewport bottom (the island hides exactly these). */
function countBelowFoldTargets(page: Page) {
  return page.evaluate((sel) => {
    const h = window.innerHeight;
    return Array.from(document.querySelectorAll(sel)).filter(
      (el) => el.getBoundingClientRect().top >= h,
    ).length;
  }, REVEAL_TARGET_SELECTOR);
}

function countHiddenInViewport(page: Page, where: 'in' | 'above') {
  return page.evaluate((w) => {
    return Array.from(document.querySelectorAll('[data-reveal="hidden"]')).filter((el) => {
      const r = el.getBoundingClientRect();
      if (w === 'above') return r.bottom <= 0;
      return (
        r.bottom > 0 && r.top < window.innerHeight && r.right > 0 && r.left < window.innerWidth
      );
    }).length;
  }, where);
}

/**
 * Full reveal cycle on the current page: below-fold targets get hidden (proves the island scanned this
 * DOM), nothing in view is hidden, stepped scroll leaves 0 hidden, revealed targets end `shown` and visible.
 */
async function expectRevealCycle(page: Page, label: string, { requireTargets = true } = {}) {
  const belowFold = await countBelowFoldTargets(page);
  if (belowFold > 0) {
    await expect
      .poll(() => page.locator('[data-reveal="hidden"]').count(), {
        message: `Below-fold targets are marked hidden on ${label}`,
      })
      .toBeGreaterThan(0);
  }

  expect(
    await countHiddenInViewport(page, 'in'),
    `No in-viewport target has data-reveal="hidden" on ${label}`,
  ).toBe(0);

  await page.evaluate(async () => {
    const step = window.innerHeight || 800;
    const maxScroll = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
    for (let y = 0; y <= maxScroll; y += step) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 50));
    }
    window.scrollTo(0, maxScroll);
    await new Promise((r) => setTimeout(r, 50));
  });

  await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0);
  if (belowFold > 0) {
    expect(
      await page.locator('[data-reveal="shown"]').count(),
      `Hidden targets end data-reveal="shown" on ${label}`,
    ).toBeGreaterThan(0);
  }

  await page.evaluate(async () => {
    const finite = document
      .getAnimations()
      .filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
    await Promise.all(finite.map((a) => a.finished.catch(() => undefined)));
  });

  const { targetCount, notVisible } = await page.evaluate((sel) => {
    const targets = Array.from(document.querySelectorAll(sel));
    return {
      targetCount: targets.length,
      notVisible: targets
        .filter((el) => !el.checkVisibility({ opacityProperty: true }))
        .map((el) => `${el.tagName}.${el.className}`),
    };
  }, REVEAL_TARGET_SELECTOR);

  if (requireTargets) {
    expect(targetCount, `Reveal targets exist on ${label}`).toBeGreaterThan(0);
  }
  expect(notVisible, `Every reveal target passes checkVisibility on ${label}`).toEqual([]);
}

test.describe('CAP-16: Scroll reveal', () => {
  for (const row of FAMILY_ROUTES) {
    test(`Targets in viewport are visible on load and below-fold reveal on scroll on ${row.key} (${row.url})`, async ({
      page,
    }) => {
      await page.goto(row.url, { waitUntil: 'load' });
      // (a) + (b): nothing in view hidden; below-fold targets hide, then reveal on scroll
      await expectRevealCycle(page, row.key, {
        requireTargets: !['login', 'profile'].includes(row.family),
      });
    });

    test(`Zero targets marked hidden under reduced motion on ${row.key} (${row.url})`, async ({
      page,
    }) => {
      // (d) under reducedMotion: 'reduce' 0 targets are marked hidden
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(row.url, { waitUntil: 'load' });
      const hiddenCount = await page.locator('[data-reveal="hidden"]').count();
      expect(hiddenCount, '0 targets marked hidden under reduced motion').toBe(0);
    });
  }

  test('Scroll reveal persists across client soft navigation from / to /gioi-thieu/ and back', async ({
    page,
  }) => {
    // (c) same after a soft nav from / via a header link (to /gioi-thieu/) and from /gioi-thieu/ back to /
    await page.goto('/', { waitUntil: 'load' });

    // Mark window to verify soft navigation
    await page.evaluate(() => {
      (window as unknown as { __softNavMarker?: number }).__softNavMarker = 42;
    });

    // Soft nav to /gioi-thieu/ via header link
    await page.locator('#header a[href="/gioi-thieu/"]').first().click();
    await expect(page).toHaveURL(/\/gioi-thieu\/?$/);
    await expect(page.locator('#content[role="main"]')).toBeVisible();
    const marker1 = await page.evaluate(
      () => (window as unknown as { __softNavMarker?: number }).__softNavMarker,
    );
    expect(marker1, 'Soft navigation preserved window marker to /gioi-thieu/').toBe(42);
    await expectRevealCycle(page, '/gioi-thieu/ after soft nav');

    // Soft nav back to / via header link
    await page.locator('#header a[href="/"]').first().click();
    await expect(page).toHaveURL(/^https?:\/\/[^/]+\/?$/);
    await expect(page.locator('main#main')).toBeVisible();
    const marker2 = await page.evaluate(
      () => (window as unknown as { __softNavMarker?: number }).__softNavMarker,
    );
    expect(marker2, 'Soft navigation preserved window marker back to /').toBe(42);
    await page.evaluate(() => window.scrollTo(0, 0));
    await expectRevealCycle(page, '/ after soft nav back');
  });

  test('Switching to reduced motion mid-run shows hidden targets; switching back never hides targets above the viewport', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'load' });
    await expect.poll(() => page.locator('[data-reveal="hidden"]').count()).toBeGreaterThan(0);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await expect(page.locator('[data-reveal="hidden"]')).toHaveCount(0);

    // Re-scan from mid-page: targets below hide again, targets above stay visible
    await page.evaluate(() =>
      window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) / 2),
    );
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await expect.poll(() => page.locator('[data-reveal="hidden"]').count()).toBeGreaterThan(0);
    expect(
      await countHiddenInViewport(page, 'above'),
      'No target above the viewport is hidden on a mid-page scan',
    ).toBe(0);
    expect(
      await countHiddenInViewport(page, 'in'),
      'No in-viewport target is hidden on a mid-page scan',
    ).toBe(0);
  });

  test('horizontal-scroll-section, its .section ancestor, descendants and ProjectGrid .col never get data-reveal', async ({
    page,
  }) => {
    // (e) the pin, the .section wrapping it, its descendants and ProjectGrid .col never get data-reveal
    for (const url of ['/', '/thiet-ke-website/', '/ui-ux-branding-design/', '/du-an/']) {
      await page.goto(url, { waitUntil: 'load' });
      const badReveals = await page.evaluate(() => {
        const horizontalEls = Array.from(
          document.querySelectorAll(
            '.horizontal-scroll-section, .horizontal-scroll-section *, .section:has(.horizontal-scroll-section)',
          ),
        );
        const projectCols = Array.from(
          document.querySelectorAll('.row > .col:has(.portfolio-box), #portfolio-isotope > .col'),
        );
        return [...horizontalEls, ...projectCols]
          .filter((el) => el.hasAttribute('data-reveal'))
          .map((el) => `${el.tagName}.${el.className}`);
      });
      expect(badReveals, `Excluded elements on ${url} must never have data-reveal`).toEqual([]);
    }
  });
});

// One route per family plus the core VI/EN routes, deduplicated by URL.
const JS_OFF_ROUTES = [
  ...CORE_ROUTES.map(({ name, url }) => ({ key: name, url })),
  ...FAMILY_ROUTES.map(({ key, url }) => ({ key, url })),
].filter((route, i, all) => all.findIndex((r) => r.url === route.url) === i);

test.describe('CAP-16: JS Off Readability', () => {
  for (const { key, url } of JS_OFF_ROUTES) {
    test(`Headings and paragraphs readable with JS off on ${key}`, async ({ browser }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'load' });
      await expectTextReadable(page);
      await context.close();
    });
  }
});

test.describe('CAP-16: Card hover', () => {
  const CARD_FAMILIES = [
    {
      name: 'ServicesList',
      url: '/',
      selector: '.dich_vu[data-pointer="card"]',
    },
    {
      name: 'PostCard',
      url: '/',
      selector: '.box-blog-post[data-pointer="card"]',
    },
    {
      name: 'showcase',
      url: '/',
      selector: '.scroll-item .item-content[data-pointer="card"]',
    },
    {
      name: 'ServiceDetailCards',
      url: '/thiet-ke-website/',
      selector: '.eras-table-price .col-inner[data-pointer="card"]',
    },
    {
      name: 'PricingCards',
      url: '/thiet-ke-website/',
      selector: '#row-1975763604 .col-inner[data-pointer="card"]',
    },
    {
      name: 'ServicePackageCards',
      url: '/seo-tu-khoa-website/',
      selector: '.col-inner[data-pointer="card"]',
    },
    {
      name: 'ProjectCard',
      url: '/featured_item/',
      selector: '.portfolio-box[data-pointer="card"]',
    },
  ];

  for (const family of CARD_FAMILIES) {
    test(`Fine pointer hover updates --pointer-x and overlay opacity on ${family.name} (${family.url})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(family.url, { waitUntil: 'load' });
      const card = page.locator(family.selector).first();
      await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollBy(0, r.top - 150);
      });
      await page.waitForTimeout(200);

      const box = await card.boundingBox();
      expect(box, `${family.name} should have a bounding box`).not.toBeNull();

      // Point 1
      await page.mouse.move(box!.x + 40, box!.y + 40);
      await page.waitForTimeout(350);

      const x1 = await card.evaluate((el) => el.style.getPropertyValue('--pointer-x'));
      const opacity1 = await card.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el, '::before').opacity);
      });

      expect(x1, `${family.name} should set --pointer-x at point 1`).not.toBe('');
      expect(opacity1, `${family.name} overlay opacity should be > 0 on hover`).toBeGreaterThan(0);

      // Point 2
      await page.mouse.move(box!.x + 80, box!.y + 80);
      await page.waitForTimeout(100);

      const x2 = await card.evaluate((el) => el.style.getPropertyValue('--pointer-x'));
      expect(x2, `${family.name} should set --pointer-x at point 2`).not.toBe('');
      expect(x2, `${family.name} --pointer-x should differ between two hover points`).not.toEqual(
        x1,
      );

      // Pointer leaves
      await page.mouse.move(0, 0);
      await page.waitForTimeout(350);
      const opacityOff = await card.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el, '::before').opacity);
      });
      expect(opacityOff, `${family.name} overlay opacity should fade to 0 on pointer leave`).toBe(
        0,
      );
    });

    test(`Touch tap sets no --pointer-x and leaves overlay opacity at 0 on ${family.name} (${family.url})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        hasTouch: true,
        isMobile: true,
        viewport: { width: 800, height: 1000 },
      });
      const page = await context.newPage();
      await page.goto(family.url, { waitUntil: 'load' });
      await page.evaluate(() => {
        window.addEventListener('click', (e) => e.preventDefault(), { capture: true });
      });
      const card = page.locator(family.selector).first();
      await card.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollBy(0, r.top - 150);
      });
      await page.waitForTimeout(200);
      await card.tap();
      await page.waitForTimeout(100);

      const tapX = await card.evaluate((el) => el.style.getPropertyValue('--pointer-x'));
      const tapOpacity = await card.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el, '::before').opacity);
      });

      expect(tapX, `${family.name} tap should not set --pointer-x`).toBe('');
      expect(tapOpacity, `${family.name} tap overlay opacity should be 0`).toBe(0);

      await context.close();
    });
  }

  test('Reduced motion at load attaches no pointermove listener and leaves overlay hidden', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await installPointerListenerTracker(page);
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
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
    expect(listeners['pointermove'] ?? 0).toBe(0);

    const card = page.locator('.eras-table-price .col-inner[data-pointer="card"]').first();
    const box = await card.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 40, box.y + 40);
      await page.waitForTimeout(200);
      const opacity = await card.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el, '::before').opacity);
      });
      expect(opacity).toBe(0);
    }
    await context.close();
  });

  test('Switching reduced motion mid-run removes pointermove listener', async ({ page }) => {
    await installPointerListenerTracker(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

    let listeners = await page.evaluate(() => {
      return (
        (
          window as unknown as {
            __getCoarsePointerListenerCounts?: () => Record<string, number>;
          }
        ).__getCoarsePointerListenerCounts?.() ?? {}
      );
    });
    expect(listeners['pointermove'] ?? 0).toBe(1);

    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(200);

    listeners = await page.evaluate(() => {
      return (
        (
          window as unknown as {
            __getCoarsePointerListenerCounts?: () => Record<string, number>;
          }
        ).__getCoarsePointerListenerCounts?.() ?? {}
      );
    });
    expect(listeners['pointermove'] ?? 0).toBe(0);
  });
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
