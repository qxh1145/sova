import type { Page } from '@playwright/test';
import { test, expect } from './fixtures';
import manifest from '../baseline/manifest.json';
import { REVEAL_TARGET_SELECTOR } from '../../src/components/motion/revealTargets';
import {
  CAP16_FINAL_STATE,
  loadBeforeRun,
  syncBeforeRunJson,
  expectFinalState,
  installPointerListenerTracker,
  installWebGLContextTracker,
  expectTextReadable,
  reducedMotionIdleRaf,
  measureRoute,
  TOUCH_CONTEXT,
  waitForRevealed,
} from './cap16-helpers';

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

/** Wait until the hero canvas is in the DOM and has issued a WebGL2 draw call. */
async function waitForHeroDraw(page: Page, selector = 'canvas.gradient-ascii-canvas') {
  await expect(page.locator(selector)).toBeAttached();
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
      const context = await browser.newContext(TOUCH_CONTEXT);
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
      // The heroes create their contexts in effects: count after they exist and have drawn.
      if (HOME_ROUTES.some((route) => route.url === url)) {
        await waitForHeroDraw(page);
      } else if (url === '/thiet-ke-website/') {
        await waitForHeroDraw(page, 'canvas.light-rays-canvas');
      }

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
        const context = await browser.newContext(touch ? TOUCH_CONTEXT : {});
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

const SUB_HERO_ROUTES = [
  { name: 'about', url: '/gioi-thieu/' },
  { name: 'projects', url: '/du-an/' },
  { name: 'website', url: '/thiet-ke-website/' },
  { name: 'faq', url: '/cau-hoi-thuong-gap/' },
  { name: 'privacy', url: '/chinh-sach-bao-mat/' },
];

test.describe('CAP-16: Sub-page hero', () => {
  for (const { name, url } of SUB_HERO_ROUTES) {
    test(`Happy path draws and steers toward pointer on ${name} (${url})`, async ({ page }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      const hero = page.locator('.banner-bg .light-rays');
      await expect(hero).toBeVisible();
      await expect(page.locator('canvas.light-rays-canvas')).toBeVisible();

      // The time loop draws regardless of the pointer, so read the aim direction itself:
      // its x component follows the pointer across the hero.
      const aimX = () =>
        page.evaluate(
          () => (window as unknown as { __getAim: () => [number, number] | null }).__getAim()?.[0],
        );
      const { width } = page.viewportSize()!;
      await page.mouse.move(20, 200);
      await expect.poll(aimX, { message: 'Rays steer left toward pointer' }).toBeLessThan(-0.01);
      await page.mouse.move(width - 20, 200);
      await expect.poll(aimX, { message: 'Rays steer right toward pointer' }).toBeGreaterThan(0.01);
    });

    test(`Client navigation from home acquires context and keeps count <= 1 on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto('/', { waitUntil: 'load' });
      await waitForHeroDraw(page);

      const link = page.locator(`#footer a[href="${url}"]`).first();
      await expect(link).toBeAttached();
      await link.click();
      await expect(page).toHaveURL(new RegExp(`${url.replace(/\//g, '\\/')}$`));
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      const live = await page.evaluate(() =>
        (
          window as unknown as { __getLiveWebGLContextCount: () => number }
        ).__getLiveWebGLContextCount(),
      );
      expect(live, 'Live WebGL contexts after client nav').toBe(1);

      const unreleased = await page.evaluate(() =>
        (
          window as unknown as { __getUnreleasedWebGLContextCount: () => number }
        ).__getUnreleasedWebGLContextCount(),
      );
      expect(unreleased, 'Unreleased WebGL contexts after client nav').toBeLessThanOrEqual(1);
    });

    test(`Coarse pointer draws without window pointermove listener on ${name} (${url})`, async ({
      browser,
    }) => {
      const pointerMoveListeners = async (touch: boolean) => {
        const context = await browser.newContext(touch ? TOUCH_CONTEXT : {});
        const page = await context.newPage();
        await installWebGLContextTracker(page);
        await page.addInitScript(() => {
          let count = 0;
          const origAdd = window.addEventListener;
          window.addEventListener = function (this: Window, ...args: Parameters<typeof origAdd>) {
            if (args[0] === 'pointermove') count++;
            return origAdd.apply(this, args);
          } as typeof origAdd;
          (window as unknown as { __pointerMoveCount: () => number }).__pointerMoveCount = () =>
            count;
        });
        await page.goto(url, { waitUntil: 'load' });
        await waitForHeroDraw(page, 'canvas.light-rays-canvas');
        const count = await page.evaluate(() =>
          (window as unknown as { __pointerMoveCount: () => number }).__pointerMoveCount(),
        );
        const draws = await drawCount(page, 500);
        await context.close();
        return { count, draws };
      };

      const fine = await pointerMoveListeners(false);
      expect(fine.count, 'Fine pointer: window pointermove attached').toBeGreaterThanOrEqual(1);
      expect(fine.draws, 'Fine pointer: draws').toBeGreaterThan(0);

      const coarse = await pointerMoveListeners(true);
      expect(coarse.count, 'Coarse pointer: window pointermove listener not attached').toBe(0);
      expect(coarse.draws, 'Coarse pointer: draws').toBeGreaterThan(0);
    });

    test(`Mobile DPR keeps canvas width at the sampling cap on ${name} (${url})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
      });
      const page = await context.newPage();
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      const { canvasWidth, clientWidth } = await page.evaluate(() => {
        const c = document.querySelector<HTMLCanvasElement>('canvas.light-rays-canvas')!;
        return { canvasWidth: c.width, clientWidth: c.clientWidth };
      });
      // The source sampling cap (≈0.523 at the hard-coded density/sharpness) binds before DPR ≤ 2;
      // pin it so a constant tweak cannot quietly grow the mobile backbuffer up to 2×.
      expect(canvasWidth).toBeLessThanOrEqual(Math.ceil(clientWidth * 0.53));
      await context.close();
    });

    test(`Hero stops drawing offscreen and resumes on re-entry on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls while hero is offscreen').toBe(0);

      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after hero re-enters').toBeGreaterThan(0);
    });

    test(`Hero stops drawing in a hidden tab and resumes when visible on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      await setHidden(page, true);
      await page.waitForTimeout(100);
      expect(await drawCount(page), 'Draw calls while tab is hidden').toBe(0);

      await setHidden(page, false);
      expect(await drawCount(page), 'Draw calls after tab is visible').toBeGreaterThan(0);
    });

    test(`Hero draws one still frame under reduced motion at load on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');
      await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after load under reduced motion').toBe(0);
    });

    test(`Hero stops when reduced motion is switched on mid-run on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.waitForTimeout(300);
      expect(await drawCount(page), 'Draw calls after switching to reduce').toBe(0);

      await page.emulateMedia({ reducedMotion: 'no-preference' });
      expect(await drawCount(page), 'Draw calls after switching back').toBeGreaterThan(0);
    });

    test(`Hero without WebGL2 shows background image with no page error on ${name} (${url})`, async ({
      page,
    }) => {
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

      await expect(page.locator('canvas.light-rays-canvas')).toHaveCount(0);
      await expect(page.locator('.banner-bg img').first()).toBeVisible();
      expect(pageErrors).toEqual([]);
    });

    test(`Hero shows image on context loss and recovers on restore on ${name} (${url})`, async ({
      page,
    }) => {
      await installWebGLContextTracker(page);
      await page.goto(url, { waitUntil: 'load' });
      await waitForHeroDraw(page, 'canvas.light-rays-canvas');

      await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.light-rays-canvas')!;
        const ext = canvas.getContext('webgl2')!.getExtension('WEBGL_lose_context')!;
        (window as unknown as { __subHeroLose: WEBGL_lose_context }).__subHeroLose = ext;
        ext.loseContext();
      });
      await expect(page.locator('.banner-bg .light-rays--lost')).toBeVisible();
      await expect(page.locator('.banner-bg img').first()).toBeVisible();
      expect(await drawCount(page, 500), 'Draw calls while context is lost').toBe(0);

      await page.evaluate(() =>
        (window as unknown as { __subHeroLose: WEBGL_lose_context }).__subHeroLose.restoreContext(),
      );
      await expect(page.locator('.banner-bg .light-rays--lost')).toHaveCount(0);
      await expect(page.locator('canvas.light-rays-canvas')).toBeVisible();
      expect(await drawCount(page), 'Draw calls after restore').toBeGreaterThan(0);
      const unreleased = await page.evaluate(() =>
        (
          window as unknown as { __getUnreleasedWebGLContextCount: () => number }
        ).__getUnreleasedWebGLContextCount(),
      );
      expect(unreleased, 'Contexts held after restore').toBeLessThanOrEqual(1);
    });

    test(`Hero with JS off shows background image and all text reads on ${name} (${url})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({ javaScriptEnabled: false });
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'load' });

      await expect(page.locator('canvas.light-rays-canvas')).toHaveCount(0);
      await expect(page.locator('.banner-bg img').first()).toBeVisible();
      await expectTextReadable(page);
      await context.close();
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
    // Scroll-driven animations (scroll stack) finish only when scrolled, not in time: skip them.
    const finite = document
      .getAnimations()
      .filter(
        (a) =>
          a.timeline instanceof DocumentTimeline &&
          a.effect?.getComputedTiming().endTime !== Infinity,
      );
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

  test('Without :has() support, reveal is skipped: no target hidden, page renders', async ({
    page,
  }) => {
    // Firefox < 121 has no :has(); stub CSS.supports so the guard takes that path in Chromium.
    await page.addInitScript(() => {
      const supports = CSS.supports.bind(CSS);
      CSS.supports = ((...args: [string, string?]) =>
        args.length === 1 && args[0].includes(':has(')
          ? false
          : supports(...(args as [string, string]))) as typeof CSS.supports;
    });
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('main#main')).toBeVisible();
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    await expect(page.locator('[data-reveal]')).toHaveCount(0);
    expect(errors, 'no page error without :has()').toEqual([]);
  });

  test('Print media shows below-fold targets that are still hidden on screen', async ({ page }) => {
    await page.goto('/', { waitUntil: 'load' });
    const hidden = page.locator('[data-reveal="hidden"]').first();
    await expect(hidden).toHaveCount(1);
    await page.emulateMedia({ media: 'print' });
    await expect.poll(() => hidden.evaluate((el) => getComputedStyle(el).opacity)).toBe('1');
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
      url: '/thiet-ke-website/',
      selector: '.scroll-item .item-content[data-pointer="card"]',
    },
    {
      name: 'ServiceDetailCards',
      url: '/thiet-ke-website/',
      // PricingCards renders first with `.hover_border eras-table-price`; exclude it.
      selector: '.eras-table-price:not(.hover_border) .col-inner[data-pointer="card"]',
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
      await waitForRevealed(card);

      const box = await card.boundingBox();
      expect(box, `${family.name} should have a bounding box`).not.toBeNull();

      // Point 1
      await page.mouse.move(box!.x + 40, box!.y + 40);
      await page.waitForTimeout(350);

      const readSpot = () =>
        card.evaluate((el) => ({
          x: el.style.getPropertyValue('--pointer-x'),
          y: el.style.getPropertyValue('--pointer-y'),
          bg: window.getComputedStyle(el, '::before').backgroundImage,
        }));

      const spot1 = await readSpot();
      const x1 = spot1.x;
      const opacity1 = await card.evaluate((el) => {
        return parseFloat(window.getComputedStyle(el, '::before').opacity);
      });

      expect(x1, `${family.name} should set --pointer-x at point 1`).not.toBe('');
      expect(opacity1, `${family.name} overlay opacity should be > 0 on hover`).toBeGreaterThan(0);
      expect(spot1.bg, `${family.name} spotlight should sit at the pointer`).toContain(
        `${spot1.x} ${spot1.y}`,
      );

      // Point 2
      await page.mouse.move(box!.x + 80, box!.y + 80);
      await page.waitForTimeout(100);

      const spot2 = await readSpot();
      const x2 = spot2.x;
      expect(x2, `${family.name} should set --pointer-x at point 2`).not.toBe('');
      expect(x2, `${family.name} --pointer-x should differ between two hover points`).not.toEqual(
        x1,
      );
      expect(spot2.bg, `${family.name} spotlight should follow the pointer`).toContain(
        `${spot2.x} ${spot2.y}`,
      );
      expect(spot2.bg).not.toEqual(spot1.bg);

      // Pointer leaves
      await page.mouse.move(0, 0);
      // Poll: a fixed wait can land on the 300ms fade's last frame (opacity ~1e-13).
      await expect
        .poll(
          () => card.evaluate((el) => parseFloat(window.getComputedStyle(el, '::before').opacity)),
          { message: `${family.name} overlay opacity should fade to 0 on pointer leave` },
        )
        .toBe(0);
    });

    test(`Touch tap sets no --pointer-x and leaves overlay opacity at 0 on ${family.name} (${family.url})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...TOUCH_CONTEXT,
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

    const card = page
      .locator('.eras-table-price:not(.hover_border) .col-inner[data-pointer="card"]')
      .first();
    const box = await card.boundingBox();
    expect(box, 'ServiceDetailCards card should have a bounding box').not.toBeNull();
    await page.mouse.move(box!.x + 40, box!.y + 40);
    await page.waitForTimeout(200);
    const opacity = await card.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el, '::before').opacity);
    });
    expect(opacity).toBe(0);
    await context.close();
  });

  test('JS off: hovering a card shows no overlay', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    const card = page.locator('#row-1975763604 .col-inner[data-pointer="card"]').first();
    await card.scrollIntoViewIfNeeded();
    const box = await card.boundingBox();
    expect(box, 'PricingCards card should have a bounding box').not.toBeNull();
    await page.mouse.move(box!.x + 40, box!.y + 40);
    await page.waitForTimeout(350);
    const opacity = await card.evaluate((el) => {
      return parseFloat(window.getComputedStyle(el, '::before').opacity);
    });
    expect(opacity).toBe(0);
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
    // Two fine-pointer listeners: PointerTracker on document + LightRays on window.
    expect(listeners['pointermove'] ?? 0).toBe(2);

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

test.describe('CAP-16: CTA effects', () => {
  const CTA_SITES = [
    {
      name: 'HomeHeroCTA',
      url: '/',
      selector: '.link_banner a[data-pointer="cta"]',
    },
    {
      name: 'PricingCardsCTA',
      url: '/thiet-ke-website/',
      selector: '#row-1975763604 a.but-lh[data-pointer="cta"]',
    },
    {
      name: 'PageHeroCTA',
      url: '/gioi-thieu/',
      selector:
        '.service-hero-heading ~ * a.but-lh[data-pointer="cta"], .banner a.but-lh[data-pointer="cta"]',
    },
    {
      name: 'FooterCTA',
      url: '/',
      selector: 'section.ss-last a.plain[data-pointer="cta"]',
    },
  ];

  for (const site of CTA_SITES) {
    test(`Fine pointer hover pulls CTA and shows rotating ring, pointer leave resets on ${site.name} (${site.url})`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(site.url, { waitUntil: 'load' });
      const cta = page.locator(site.selector).first();
      await cta.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollBy(0, r.top - 150);
      });
      await waitForRevealed(cta);

      const box = await cta.boundingBox();
      expect(box, `${site.name} CTA should have a bounding box`).not.toBeNull();
      // Box centre is unaffected by the legacy hover scale, so its shift is the pull alone.
      const restCentre = { x: box!.x + box!.width / 2, y: box!.y + box!.height / 2 };

      // Hover off-centre (at 80% width, 80% height)
      await page.mouse.move(box!.x + box!.width * 0.8, box!.y + box!.height * 0.8);
      await page.waitForTimeout(350);

      const hoverState = await cta.evaluate((el) => {
        const r = el.getBoundingClientRect();
        const ring = window.getComputedStyle(el, '::after');
        return {
          x: el.style.getPropertyValue('--pointer-x'),
          y: el.style.getPropertyValue('--pointer-y'),
          cx: r.x + r.width / 2,
          cy: r.y + r.height / 2,
          ringOpacity: parseFloat(ring.opacity),
          ringAnim: ring.animationName,
          ringWidth: parseFloat(ring.width),
          ringHeight: parseFloat(ring.height),
          width: r.width,
          height: r.height,
        };
      });

      expect(hoverState.x, `${site.name} should set --pointer-x`).not.toBe('');
      expect(hoverState.y, `${site.name} should set --pointer-y`).not.toBe('');
      // computed `translate` reports the declared value even on inline boxes it cannot move.
      expect(
        hoverState.cx - restCentre.x,
        `${site.name} should move right toward pointer`,
      ).toBeGreaterThan(1);
      expect(
        hoverState.cy - restCentre.y,
        `${site.name} should move down toward pointer`,
      ).toBeGreaterThan(1);
      expect(hoverState.ringOpacity, `${site.name} ring opacity should be > 0`).toBeGreaterThan(0);
      expect(hoverState.ringAnim).toBe('cta-ring-rotate');
      // Ring wraps the anchor box (untransformed size), not an inline fragment.
      expect(hoverState.ringWidth, `${site.name} ring should span the CTA width`).toBeGreaterThan(
        hoverState.width * 0.8,
      );
      expect(hoverState.ringHeight, `${site.name} ring should span the CTA height`).toBeGreaterThan(
        hoverState.height * 0.8,
      );

      // Pointer leaves
      await page.mouse.move(0, 0);
      await page.waitForTimeout(400);

      const leaveState = await cta.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return {
          cx: r.x + r.width / 2,
          cy: r.y + r.height / 2,
          translate: window.getComputedStyle(el).translate,
          ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
        };
      });

      expect(leaveState.translate, `${site.name} translate should return to none`).toBe('none');
      expect(Math.abs(leaveState.cx - restCentre.x)).toBeLessThan(1);
      expect(Math.abs(leaveState.cy - restCentre.y)).toBeLessThan(1);
      expect(leaveState.ringOpacity, `${site.name} ring opacity should fade to 0`).toBe(0);
    });

    test(`Touch tap sets no --pointer-x and leaves translate at none on ${site.name} (${site.url})`, async ({
      browser,
    }) => {
      const context = await browser.newContext({
        ...TOUCH_CONTEXT,
        viewport: { width: 800, height: 1000 },
      });
      const page = await context.newPage();
      await page.goto(site.url, { waitUntil: 'load' });
      await page.evaluate(() => {
        window.addEventListener('click', (e) => e.preventDefault(), { capture: true });
      });
      const cta = page.locator(site.selector).first();
      await cta.evaluate((el) => {
        const r = el.getBoundingClientRect();
        window.scrollBy(0, r.top - 150);
      });
      await waitForRevealed(cta);
      await cta.tap();
      await page.waitForTimeout(100);

      const tapState = await cta.evaluate((el) => ({
        x: el.style.getPropertyValue('--pointer-x'),
        translate: window.getComputedStyle(el).translate,
        ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
      }));

      expect(tapState.x, `${site.name} touch tap should not set --pointer-x`).toBe('');
      expect(tapState.translate, `${site.name} touch tap translate should be none`).toBe('none');
      expect(tapState.ringOpacity, `${site.name} touch tap ring opacity should be 0`).toBe(0);

      await context.close();
    });
  }

  test('Keyboard focus shows ring and keeps outline visible', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });
    const cta = page.locator('.link_banner a[data-pointer="cta"]');
    await cta.focus();
    await page.waitForTimeout(350);

    const focusState = await cta.evaluate((el) => ({
      ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
      animName: window.getComputedStyle(el, '::after').animationName,
      outlineStyle: window.getComputedStyle(el).outlineStyle,
      outlineWidth: window.getComputedStyle(el).outlineWidth,
    }));

    expect(focusState.ringOpacity, 'Focus should show rotating ring').toBeGreaterThan(0);
    expect(focusState.animName).toBe('cta-ring-rotate');
    expect(focusState.outlineStyle).not.toBe('none');
    expect(focusState.outlineWidth).not.toBe('0px');
  });

  test('Reduced motion disables CTA pull, ring and hero sheen', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });

    // Check hero sheen is disabled
    const sheenAnim = await page.locator('.home-hero-sheen').evaluate((el) => {
      return window.getComputedStyle(el).animationName;
    });
    expect(sheenAnim, 'Hero sheen animation should be none under reduced motion').toBe('none');

    // Check typewriter final state
    const typewriterOpacity = await page
      .locator('.typewriter')
      .first()
      .evaluate((el) => {
        return window.getComputedStyle(el).opacity;
      });
    expect(typewriterOpacity).toBe('1');

    // Check CTA hover has no pull and no ring
    const cta = page.locator('.link_banner a[data-pointer="cta"]');
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();
    await page.mouse.move(box!.x + 40, box!.y + 20);
    await page.waitForTimeout(200);

    const ctaState = await cta.evaluate((el) => ({
      translate: window.getComputedStyle(el).translate,
      ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
    }));
    expect(ctaState.translate).toBe('none');
    expect(ctaState.ringOpacity).toBe(0);

    // Keyboard focus shows no ring either
    await page.mouse.move(0, 0);
    await cta.focus();
    await page.waitForTimeout(350);
    const focusState = await cta.evaluate((el) => ({
      ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
      ringAnim: window.getComputedStyle(el, '::after').animationName,
    }));
    expect(focusState.ringOpacity, 'Reduced motion focus should show no ring').toBe(0);
    expect(focusState.ringAnim).toBe('none');

    await context.close();
  });

  test('Hero sheen animation runs on third typewriter line under normal motion', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/', { waitUntil: 'load' });

    const sheen = page.locator('.home-hero-sheen');
    await expect(sheen).toBeVisible();
    const animName = await sheen.evaluate((el) => window.getComputedStyle(el).animationName);
    expect(animName, 'Hero sheen should have running animation-name').toBe('home-hero-sheen');
  });

  test('Hero sheen under forced-colors: active keeps line 3 readable with non-transparent text', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.emulateMedia({ forcedColors: 'active' });
    await page.goto('/', { waitUntil: 'load' });

    const sheen = page.locator('.home-hero-sheen');
    await expect(sheen).toBeVisible();
    const style = await sheen.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return {
        fillColor: cs.webkitTextFillColor,
        bgImage: cs.backgroundImage,
      };
    });
    expect(
      style.fillColor,
      'Hero sheen text fill color must not be transparent under forced colors',
    ).not.toBe('rgba(0, 0, 0, 0)');
    expect(style.bgImage, 'Hero sheen gradient must be removed under forced colors').toBe('none');
  });

  test('Nested CTA in card: hovering CTA sets vars on CTA while card spotlight holds last point', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });

    const card = page.locator('#row-1975763604 .col-inner[data-pointer="card"]').first();
    await card.evaluate((el) => {
      const r = el.getBoundingClientRect();
      window.scrollBy(0, r.top - 150);
    });
    await waitForRevealed(card);

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    // 1. Move to a card point outside the CTA
    await page.mouse.move(cardBox!.x + 50, cardBox!.y + 50);
    await page.waitForTimeout(200);

    const cardSpot1 = await card.evaluate((el) => ({
      x: el.style.getPropertyValue('--pointer-x'),
      y: el.style.getPropertyValue('--pointer-y'),
    }));
    expect(cardSpot1.x).not.toBe('');

    // 2. Move pointer over the nested CTA inside this card
    const cta = card.locator('a.but-lh[data-pointer="cta"]');
    const ctaBox = await cta.boundingBox();
    expect(ctaBox).not.toBeNull();
    await page.mouse.move(ctaBox!.x + ctaBox!.width * 0.7, ctaBox!.y + ctaBox!.height * 0.7);
    await page.waitForTimeout(200);

    const ctaState = await cta.evaluate((el) => {
      const r = el.getBoundingClientRect();
      return { x: el.style.getPropertyValue('--pointer-x'), cx: r.x + r.width / 2 };
    });
    expect(ctaState.x, 'Nested CTA should receive pointer coords').not.toBe('');
    expect(
      ctaState.cx - (ctaBox!.x + ctaBox!.width / 2),
      'Nested CTA should pull toward pointer',
    ).toBeGreaterThan(1);

    // Card variables should hold last point
    const cardSpot2 = await card.evaluate((el) => ({
      x: el.style.getPropertyValue('--pointer-x'),
      y: el.style.getPropertyValue('--pointer-y'),
    }));
    expect(cardSpot2.x).toBe(cardSpot1.x);
    expect(cardSpot2.y).toBe(cardSpot1.y);
  });

  test('JS off: no pull island, but hover and focus ring still function in CSS', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/', { waitUntil: 'load' });

    const cta = page.locator('.link_banner a[data-pointer="cta"]');
    const box = await cta.boundingBox();
    expect(box).not.toBeNull();

    await page.mouse.move(box!.x + 40, box!.y + 20);
    await page.waitForTimeout(350);

    const hoverState = await cta.evaluate((el) => ({
      translate: window.getComputedStyle(el).translate,
      ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
      ringAnim: window.getComputedStyle(el, '::after').animationName,
    }));

    expect(hoverState.translate, 'With JS off, translate must stay none').toBe('none');
    expect(
      hoverState.ringOpacity,
      'With JS off, ring opacity must still show via CSS :hover',
    ).toBeGreaterThan(0);
    expect(hoverState.ringAnim).toBe('cta-ring-rotate');

    await page.mouse.move(0, 0);
    await cta.focus();
    await page.waitForTimeout(350);
    const focusState = await cta.evaluate((el) => ({
      ringOpacity: parseFloat(window.getComputedStyle(el, '::after').opacity),
      ringAnim: window.getComputedStyle(el, '::after').animationName,
    }));
    expect(focusState.ringOpacity, 'With JS off, focus ring must still show').toBeGreaterThan(0);
    expect(focusState.ringAnim).toBe('cta-ring-rotate');

    await context.close();
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

test.describe('CAP-16: Showcase', () => {
  const STACK_ROUTES = [
    '/thiet-ke-website/',
    '/thiet-ke-app-mobile/',
    '/seo-tu-khoa-website/',
    '/ui-ux-branding-design/',
    '/en/website-development/',
    '/en/app-mobile-development/',
    '/en/website-keyword-seo/',
    '/en/ui-ux-branding-design/',
  ];
  const STACK = '[data-scroll-stack]';
  const TILT = '.portfolio-box > .box-image[data-tilt] > div';

  /** Computed `translate` of every `.col` in the first stack row, after placing its top at `top`. */
  async function stackState(page: Page, top: number | 'past') {
    const row = page.locator(STACK).first();
    await row.evaluate((el, at) => {
      if (at === 'past') window.scrollTo(0, document.documentElement.scrollHeight);
      else window.scrollBy(0, el.getBoundingClientRect().top - at);
    }, top);
    // A timeout, not rAF: rAF callbacks never run in a JS-off context.
    await page.waitForTimeout(150);
    return row.evaluate((el) => {
      const cols = Array.from(el.querySelectorAll<HTMLElement>(':scope > .col'));
      return {
        translates: cols.map((c) => getComputedStyle(c).translate),
        rotates: cols.map((c) => getComputedStyle(c).rotate),
        lefts: cols.map((c) => Math.round(c.getBoundingClientRect().left)),
      };
    });
  }

  const isFlat = (s: { translates: string[]; rotates: string[] }) =>
    s.translates.every((t) => t === 'none') && s.rotates.every((r) => r === 'none');

  /** First listing card scrolled to 150px from the top, with its box. */
  async function firstCard(page: Page) {
    const card = page.locator('.portfolio-box[data-pointer="card"]').first();
    await card.evaluate((el) => window.scrollBy(0, el.getBoundingClientRect().top - 150));
    await waitForRevealed(card);
    const box = await card.boundingBox();
    expect(box, 'project card should have a bounding box').not.toBeNull();
    return { card, box: box! };
  }

  const tiltOf = (page: Page) =>
    page
      .locator('.portfolio-box[data-pointer="card"]')
      .first()
      .evaluate((el) => {
        const inner = el.querySelector<HTMLElement>('.box-image > div');
        const transform = inner ? getComputedStyle(inner).transform : 'none';
        const match = transform.match(/matrix3d\((.+)\)/);
        if (!match) return { inner: transform, rotateX: 0, rotateY: 0 };
        const m = match[1].split(',').map(Number);
        const rotateY = Math.asin(Math.max(-1, Math.min(1, -m[2]))) * (180 / Math.PI);
        const rotateX = Math.asin(Math.max(-1, Math.min(1, m[6]))) * (180 / Math.PI);
        return { inner: transform, rotateX, rotateY };
      });

  for (const url of STACK_ROUTES) {
    test(`Scroll stack spreads to source columns and ends flat on ${url}`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(url, { waitUntil: 'load' });
      const rows = await page.locator(STACK).count();
      expect(rows, `${url} should mark its desktop package row`).toBeGreaterThan(0);

      // Row top just inside the viewport bottom: cards sit stacked over the first column.
      const entering = await stackState(page, 880);
      expect(entering.translates.length).toBeGreaterThan(1);
      expect(entering.translates[0]).toBe('none');
      expect(entering.rotates[0]).toBe('none');
      expect(entering.translates.slice(1).every((t) => t !== 'none')).toBe(true);
      expect(entering.rotates.slice(1).every((r) => r !== 'none')).toBe(true);
      const spread = entering.lefts[entering.lefts.length - 1] - entering.lefts[0];

      // Row near the top: range ended, transform none, columns at their source places.
      const inView = await stackState(page, 100);
      expect(
        isFlat(inView),
        `${url} translate/rotate at range end: ${inView.translates} / ${inView.rotates}`,
      ).toBe(true);
      expect(inView.lefts[inView.lefts.length - 1] - inView.lefts[0]).toBeGreaterThan(spread + 50);

      // Section fully passed: still the original layout.
      const past = await stackState(page, 'past');
      expect(
        isFlat(past),
        `${url} translate/rotate after scroll past: ${past.translates} / ${past.rotates}`,
      ).toBe(true);
    });
  }

  test('Scroll stack sits only behind @supports (animation-timeline: view())', async ({ page }) => {
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    const placement = await page.evaluate(() => {
      const out: { inSupports: number; outside: number } = { inSupports: 0, outside: 0 };
      const walk = (rules: CSSRuleList, supported: boolean) => {
        for (const rule of Array.from(rules)) {
          if (rule instanceof CSSSupportsRule) {
            walk(rule.cssRules, supported || rule.conditionText.includes('animation-timeline'));
          } else if (rule instanceof CSSGroupingRule) {
            walk(rule.cssRules, supported);
          } else if (
            rule instanceof CSSStyleRule &&
            rule.selectorText.includes('data-scroll-stack')
          ) {
            out[supported ? 'inSupports' : 'outside']++;
          }
        }
      };
      for (const sheet of Array.from(document.styleSheets)) {
        try {
          walk(sheet.cssRules, false);
        } catch {}
      }
      return out;
    });
    expect(placement.inSupports, 'stack rules should exist').toBeGreaterThan(0);
    expect(placement.outside, 'no stack rule may apply without scroll-timeline support').toBe(0);
  });

  test('Tilt follows the pointer on /du-an/ and resets on leave; box keeps legacy lift', async ({
    page,
  }) => {
    await installPointerListenerTracker(page);
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/du-an/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    expect(await page.locator(TILT).count()).toBeGreaterThan(0);
    const { card, box } = await firstCard(page);

    // Probe element to prove the sign rule for matrix decomposition
    const probe = await page.evaluate(() => {
      const el = document.createElement('div');
      el.style.transform = 'rotateY(5deg)';
      document.body.appendChild(el);
      const cs = window.getComputedStyle(el).transform;
      document.body.removeChild(el);
      const match = cs.match(/matrix3d\((.+)\)/);
      if (!match) return { rotateY: 0 };
      const m = match[1].split(',').map(Number);
      return { rotateY: Math.asin(Math.max(-1, Math.min(1, -m[2]))) * (180 / Math.PI) };
    });
    expect(probe.rotateY, 'probe rotateY(5deg) should yield positive rotateY').toBeGreaterThan(0);

    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(400);
    const t1 = await tiltOf(page);
    await page.mouse.move(box.x + box.width - 30, box.y + 120);
    await page.waitForTimeout(400);
    const t2 = await tiltOf(page);
    expect(t1.inner, 'inner layer should tilt').not.toBe('none');
    expect(t2.inner).not.toBe('none');
    expect(t2.inner, 'tilt should differ between two points').not.toEqual(t1.inner);
    expect(t1.rotateY, 'top-left pointer should produce negative rotateY').toBeLessThan(0);
    expect(t1.rotateX, 'top-left pointer should produce positive rotateX').toBeGreaterThan(0);
    expect(t2.rotateY, 'right pointer should produce positive rotateY').toBeGreaterThan(0);
    const boxTransform = await card.evaluate((el) => getComputedStyle(el).transform);
    expect(boxTransform, '.portfolio-box keeps its legacy translateY(-5px)').toBe(
      'matrix(1, 0, 0, 1, 0, -5)',
    );

    // One shared PointerTracker listener (+ the PageHero LightRays one), no tilt listener.
    const listeners = await page.evaluate(
      () =>
        (
          window as unknown as { __getCoarsePointerListenerCounts: () => Record<string, number> }
        ).__getCoarsePointerListenerCounts()['pointermove'] ?? 0,
    );
    expect(listeners).toBe(2);

    await page.mouse.move(0, 0);
    await page.waitForTimeout(450);
    expect((await tiltOf(page)).inner, 'tilt should return to none').toBe('none');
  });

  test('Touch: no stack transform, no tilt, no pointer listeners', async ({ browser }) => {
    const context = await browser.newContext({
      ...TOUCH_CONTEXT,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await installPointerListenerTracker(page);
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    expect(isFlat(await stackState(page, 880)), 'no stack transform on touch').toBe(true);

    await page.goto('/du-an/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    await page.evaluate(() => {
      window.addEventListener('click', (e) => e.preventDefault(), { capture: true });
    });
    const { card } = await firstCard(page);
    await card.tap();
    await page.waitForTimeout(400);
    expect((await tiltOf(page)).inner, 'no tilt on touch').toBe('none');
    const listeners = await page.evaluate(() =>
      (
        window as unknown as { __getCoarsePointerListenerCounts: () => Record<string, number> }
      ).__getCoarsePointerListenerCounts(),
    );
    // Pre-epic listeners (CustomCursor mousemove) are out of scope; the tilt adds no pointermove.
    expect(listeners['pointermove'] ?? 0).toBe(0);
    await context.close();
  });

  test('Reduced motion at load: original layout and no tilt', async ({ browser }) => {
    const context = await browser.newContext({
      reducedMotion: 'reduce',
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    expect(isFlat(await stackState(page, 880))).toBe(true);

    await page.goto('/du-an/', { waitUntil: 'load' });
    const { box } = await firstCard(page);
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(400);
    expect((await tiltOf(page)).inner).toBe('none');
    await context.close();
  });

  test('Reduced motion switched mid-run: stack and tilt drop at once', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    expect(isFlat(await stackState(page, 880))).toBe(false);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(isFlat(await stackState(page, 880))).toBe(true);

    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/du-an/', { waitUntil: 'load' });
    const { box } = await firstCard(page);
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(400);
    expect((await tiltOf(page)).inner).not.toBe('none');
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(100);
    expect((await tiltOf(page)).inner).toBe('none');
  });

  test('Masonry /featured_item/: no tilt and ProjectGrid columns unchanged on hover', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/featured_item/', { waitUntil: 'load' });
    await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    expect(await page.locator('[data-tilt]').count()).toBe(0);
    const { box } = await firstCard(page);
    const grid = () =>
      page.evaluate(() =>
        Array.from(document.querySelectorAll<HTMLElement>('.portfolio-box'))
          .map((b) => b.closest('.col') as HTMLElement)
          .map((c) => `${c.offsetLeft},${c.offsetTop},${c.offsetHeight}`),
      );
    const before = await grid();
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(400);
    expect((await tiltOf(page)).inner).toBe('none');
    expect(await grid()).toEqual(before);
  });

  test('JS off: stack runs from CSS, no tilt, text reads', async ({ browser }) => {
    const context = await browser.newContext({
      javaScriptEnabled: false,
      viewport: { width: 1440, height: 900 },
    });
    const page = await context.newPage();
    await page.goto('/thiet-ke-website/', { waitUntil: 'load' });
    expect(isFlat(await stackState(page, 880)), 'CSS-only stack runs with JS off').toBe(false);
    expect(isFlat(await stackState(page, 100))).toBe(true);

    await page.goto('/du-an/', { waitUntil: 'load' });
    await expectTextReadable(page);
    const { box } = await firstCard(page);
    await page.mouse.move(box.x + 30, box.y + 30);
    await page.waitForTimeout(400);
    expect((await tiltOf(page)).inner).toBe('none');
    await context.close();
  });
});
