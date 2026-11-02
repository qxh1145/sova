import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { Locator, Page } from '@playwright/test';
import { expect, installRafCounter } from './fixtures';

export const CAP16_FINAL_STATE = ['.typewriter'];

export const TOUCH_CONTEXT = {
  hasTouch: true,
  isMobile: true,
  viewport: { width: 390, height: 844 },
};

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

/** Wait until every scroll-reveal host of the element is shown and its 600ms transition has ended. */
export async function waitForRevealed(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((el) => {
        for (
          let n = el.closest('[data-reveal]');
          n;
          n = n.parentElement?.closest('[data-reveal]') ?? null
        ) {
          if (n.getAttribute('data-reveal') === 'hidden' || n.getAnimations().length > 0)
            return false;
        }
        return true;
      }),
    )
    .toBe(true);
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
    // Last `uAim` value sent by LightRays, so a test can prove pointer steering, not just drawing.
    let aim: [number, number] | null = null;
    if (typeof WebGL2RenderingContext !== 'undefined') {
      const proto = WebGL2RenderingContext.prototype;
      const aimLocations = new WeakSet<WebGLUniformLocation>();
      const origGetUniformLocation = proto.getUniformLocation;
      const origUniform2f = proto.uniform2f;
      proto.getUniformLocation = function (...args: Parameters<typeof origGetUniformLocation>) {
        const location = origGetUniformLocation.apply(this, args);
        if (location && args[1] === 'uAim') aimLocations.add(location);
        return location;
      };
      proto.uniform2f = function (...args: Parameters<typeof origUniform2f>) {
        if (args[0] && aimLocations.has(args[0])) aim = [args[1], args[2]];
        return origUniform2f.apply(this, args);
      };
    }
    const w = window as unknown as {
      __getAim: () => [number, number] | null;
      __getDrawCount: () => number;
      __resetDrawCount: () => void;
    };
    w.__getAim = () => aim;
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
    // Scroll-driven animations (scroll stack) finish only when scrolled, not in time: skip them.
    const finite = document
      .getAnimations()
      .filter(
        (a) =>
          a.timeline instanceof DocumentTimeline &&
          a.effect?.getComputedTiming().endTime !== Infinity,
      );
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
