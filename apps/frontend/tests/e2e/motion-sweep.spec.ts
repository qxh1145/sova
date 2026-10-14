import { test, expect, installListenerCounter } from './fixtures';
import { routes } from '@/data/routes';

test.describe('Motion Sweep: Listener leaks, pin resilience, reduced motion, and edge guards', () => {
  test.describe('Listener leak across client navigation cycles', () => {
    test('Cycle navigation from /lien-he/ to home, service, and mobile-menu offcanvas', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await installListenerCounter(page);

      // Start at plain VI route
      await page.goto('/lien-he/');
      await expect(page.locator('header#header')).toBeVisible();

      let navSeq = 0;
      async function clickAndAssertSoftNav(
        locator: ReturnType<typeof page.locator>,
        expectedUrlPattern: RegExp,
        description: string,
      ) {
        navSeq += 1;
        const currentMarker = navSeq;
        await page.evaluate((marker) => {
          (window as unknown as { __navMarker?: number }).__navMarker = marker;
        }, currentMarker);
        await locator.first().click();
        await expect(page).toHaveURL(expectedUrlPattern);
        const actualMarker = await page.evaluate(
          () => (window as unknown as { __navMarker?: number }).__navMarker,
        );
        expect(
          actualMarker,
          `Soft nav preserved window.__navMarker (${currentMarker}) on ${description}`,
        ).toBe(currentMarker);
      }

      // Cycle 1: /lien-he/ -> /thiet-ke-website/ -> /lien-he/ -> / -> /lien-he/ -> offcanvas open + nav -> /lien-he/
      // 1. Visit service page with pin and carousel (/thiet-ke-website/)
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/thiet-ke-website/"]'),
        /\/thiet-ke-website\/?$/,
        '/thiet-ke-website/',
      );

      // Nav back to /lien-he/ via footer
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        '/lien-he/',
      );

      // 2. Visit VI home via footer
      await clickAndAssertSoftNav(page.locator('#footer a[href="/"]'), /^https?:\/\/[^/]+\/$/, '/');

      // Nav back to /lien-he/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        '/lien-he/',
      );

      // 3. Offcanvas cycle: open mobile menu at 390 and navigate via menu link
      const menuTrigger = page
        .locator(
          '.flex-col a[aria-controls="main-menu"]:visible, #azt-contact-footer a[data-open="#main-menu"]',
        )
        .first();
      await menuTrigger.click();
      await expect(page.locator('#main-menu')).toBeVisible();
      await clickAndAssertSoftNav(
        page.locator('#main-menu a[href="/gioi-thieu/"]'),
        /\/gioi-thieu\/?$/,
        '/gioi-thieu/',
      );

      // Nav back to /lien-he/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        '/lien-he/',
      );

      // Record listener counts and triggers after cycle 1
      const cycle1Listeners = await page.evaluate(() =>
        (window as unknown as { __liveListeners: () => Record<string, number> }).__liveListeners(),
      );
      const cycle1Triggers = await page.evaluate(() => {
        const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
          .ScrollTrigger;
        return st ? st.getAll().length : 0;
      });
      expect(cycle1Triggers, 'ScrollTrigger count on /lien-he/ after cycle 1 must be 0').toBe(0);

      // Cycle 2: Repeat the exact same sequence
      // 1. /thiet-ke-website/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/thiet-ke-website/"]'),
        /\/thiet-ke-website\/?$/,
        'Cycle 2: /thiet-ke-website/',
      );

      // Back to /lien-he/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        'Cycle 2: /lien-he/',
      );

      // 2. Home /
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/"]'),
        /^https?:\/\/[^/]+\/$/,
        'Cycle 2: /',
      );

      // Back to /lien-he/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        'Cycle 2: /lien-he/',
      );

      // 3. Offcanvas menu to /gioi-thieu/
      const menuTrigger2 = page
        .locator(
          '.flex-col a[aria-controls="main-menu"]:visible, #azt-contact-footer a[data-open="#main-menu"]',
        )
        .first();
      await menuTrigger2.click();
      await expect(page.locator('#main-menu')).toBeVisible();
      await clickAndAssertSoftNav(
        page.locator('#main-menu a[href="/gioi-thieu/"]'),
        /\/gioi-thieu\/?$/,
        'Cycle 2: /gioi-thieu/',
      );

      // Back to /lien-he/
      await clickAndAssertSoftNav(
        page.locator('#footer a[href="/lien-he/"]'),
        /\/lien-he\/?$/,
        'Cycle 2: /lien-he/',
      );

      // Record listener counts and triggers after cycle 2
      const cycle2Listeners = await page.evaluate(() =>
        (window as unknown as { __liveListeners: () => Record<string, number> }).__liveListeners(),
      );
      const cycle2Triggers = await page.evaluate(() => {
        const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
          .ScrollTrigger;
        return st ? st.getAll().length : 0;
      });
      expect(cycle2Triggers, 'ScrollTrigger count on /lien-he/ after cycle 2 must be 0').toBe(0);

      expect(
        cycle2Listeners,
        `Listener leak detected! Cycle 1: ${JSON.stringify(cycle1Listeners)}, Cycle 2: ${JSON.stringify(cycle2Listeners)}`,
      ).toEqual(cycle1Listeners);
    });
  });

  test.describe('IS1 accordion pin refresh at 390px and 549px', () => {
    for (const width of [390, 549]) {
      test(`Closing open accordion item at ${width}px refreshes pin trigger start and maintains scroll translation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto('/');

        const section = page.locator('.horizontal-scroll-section');
        await expect(section).toBeVisible();

        // Check accordion item is open by default
        const firstItem = page.locator('.acc_dvu .accordion-item').first();
        await expect(firstItem).toHaveClass(/is-active/);

        // Close the open item
        const firstTrigger = firstItem.locator('button.accordion-title');
        await firstTrigger.click();
        await expect(firstItem).not.toHaveClass(/is-active/);

        // Wait for ResizeObserver / rAF
        await page.waitForTimeout(100);

        // Measure trigger start and pin-spacer top
        const pinData = await page.evaluate(() => {
          const st = (
            window as unknown as {
              ScrollTrigger?: {
                getAll: () => {
                  trigger?: HTMLElement;
                  start: number;
                  end: number;
                }[];
              };
            }
          ).ScrollTrigger;
          const triggerObj = st
            ?.getAll()
            .find(
              (t) =>
                t.trigger?.classList.contains('horizontal-scroll-section') ||
                Boolean(t.trigger?.querySelector('.scrolling-wrapper')),
            );
          const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
          const rect = pinSpacer.getBoundingClientRect();
          const spacerDocTop = Math.round(window.scrollY + rect.top);
          const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
          const distance = Math.max(0, wrapper.scrollWidth - window.innerWidth);

          return {
            triggerStart: triggerObj ? Math.round(triggerObj.start) : -1,
            spacerDocTop,
            distance,
          };
        });

        expect(
          Math.abs(pinData.triggerStart - pinData.spacerDocTop),
          `At ${width}px: trigger.start (${pinData.triggerStart}) must equal pinSpacer top (${pinData.spacerDocTop}) within 2px`,
        ).toBeLessThanOrEqual(2);

        // Scroll to start + 50% distance
        const scrollTarget = pinData.triggerStart + 0.5 * pinData.distance;
        await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
        await page.waitForTimeout(300);

        const halfData = await page.evaluate(() => {
          const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
          const transform = window.getComputedStyle(wrapper).transform;
          const matrix =
            transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
          return {
            translateX: matrix ? matrix.m41 : 0,
          };
        });

        expect(
          Math.abs(halfData.translateX - -0.5 * pinData.distance),
          `At ${width}px: translateX (${halfData.translateX}) must equal -50% distance (${-0.5 * pinData.distance}) within 25px`,
        ).toBeLessThanOrEqual(25);
      });
    }
  });

  test.describe('Resize from 1440 to 390 on home and service page', () => {
    for (const testPath of ['/', '/thiet-ke-website/']) {
      test(`Resize 1440 -> 390 on ${testPath} refreshes pin start and translation`, async ({
        page,
      }) => {
        await page.setViewportSize({ width: 1440, height: 900 });
        await page.goto(testPath);

        const section = page.locator('.horizontal-scroll-section');
        await expect(section).toBeVisible();

        // Resize down to 390
        await page.setViewportSize({ width: 390, height: 900 });
        await page.waitForTimeout(100);

        const pinData = await page.evaluate(() => {
          const st = (
            window as unknown as {
              ScrollTrigger?: {
                getAll: () => {
                  trigger?: HTMLElement;
                  start: number;
                  end: number;
                }[];
              };
            }
          ).ScrollTrigger;
          const triggerObj = st
            ?.getAll()
            .find(
              (t) =>
                t.trigger?.classList.contains('horizontal-scroll-section') ||
                Boolean(t.trigger?.querySelector('.scrolling-wrapper')),
            );
          const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
          const rect = pinSpacer.getBoundingClientRect();
          const spacerDocTop = Math.round(window.scrollY + rect.top);
          const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
          const distance = Math.max(0, wrapper.scrollWidth - window.innerWidth);

          return {
            triggerStart: triggerObj ? Math.round(triggerObj.start) : -1,
            spacerDocTop,
            distance,
          };
        });

        expect(
          Math.abs(pinData.triggerStart - pinData.spacerDocTop),
          `On ${testPath}: trigger.start (${pinData.triggerStart}) must equal pinSpacer top (${pinData.spacerDocTop}) within 2px`,
        ).toBeLessThanOrEqual(2);

        // Scroll to start + 50% distance
        const scrollTarget = pinData.triggerStart + 0.5 * pinData.distance;
        await page.evaluate((y) => window.scrollTo(0, y), scrollTarget);
        await page.waitForTimeout(300);

        const halfData = await page.evaluate(() => {
          const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
          const transform = window.getComputedStyle(wrapper).transform;
          const matrix =
            transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
          return {
            translateX: matrix ? matrix.m41 : 0,
          };
        });

        expect(
          Math.abs(halfData.translateX - -0.5 * pinData.distance),
          `On ${testPath}: translateX (${halfData.translateX}) must equal -50% distance (${-0.5 * pinData.distance}) within 25px`,
        ).toBeLessThanOrEqual(25);
      });
    }
  });

  test.describe('Late image load pin trigger refresh', () => {
    test('Holding and releasing card background images updates pin start correctly', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 900 });

      // Hold card background image requests
      const heldRoutes: (() => Promise<void>)[] = [];
      let released = false;
      await page.route(/\/wp-content\/uploads\/.*\.(png|jpg|jpeg|webp)/i, async (route) => {
        if (released) return route.continue();
        heldRoutes.push(async () => {
          await route.continue();
        });
      });

      await page.goto('/', { waitUntil: 'domcontentloaded' });
      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      // Release held card background image requests
      expect(
        heldRoutes.length,
        'At least one image request must be held before release',
      ).toBeGreaterThan(0);
      released = true;
      for (const release of heldRoutes) {
        await release();
      }
      heldRoutes.length = 0;

      // Allow image onload handlers and ResizeObserver to fire
      await page.waitForTimeout(400);

      const pinData = await page.evaluate(() => {
        const st = (
          window as unknown as {
            ScrollTrigger?: {
              getAll: () => {
                trigger?: HTMLElement;
                start: number;
                end: number;
              }[];
            };
          }
        ).ScrollTrigger;
        const triggerObj = st
          ?.getAll()
          .find(
            (t) =>
              t.trigger?.classList.contains('horizontal-scroll-section') ||
              Boolean(t.trigger?.querySelector('.scrolling-wrapper')),
          );
        const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
        const rect = pinSpacer.getBoundingClientRect();
        const spacerDocTop = Math.round(window.scrollY + rect.top);

        return {
          triggerStart: triggerObj ? Math.round(triggerObj.start) : -1,
          spacerDocTop,
        };
      });

      expect(
        Math.abs(pinData.triggerStart - pinData.spacerDocTop),
        `After releasing images: trigger.start (${pinData.triggerStart}) must equal pinSpacer top (${pinData.spacerDocTop}) within 2px`,
      ).toBeLessThanOrEqual(2);
    });
  });

  test.describe('Refresh coalescing (R-04)', () => {
    test('Warm-cache remount of a pinned service page refreshes fewer times than it has cards', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/lien-he/');
      await expect(page.locator('header#header')).toBeVisible();

      const softNav = async (href: string) => {
        await page.evaluate(() => {
          (window as unknown as { __navMarker?: string }).__navMarker = 'r04';
        });
        await page.locator(`#footer a[href="${href}"]`).first().click();
        await expect(page).toHaveURL(new RegExp(`${href}$`));
        const marker = await page.evaluate(
          () => (window as unknown as { __navMarker?: string }).__navMarker,
        );
        expect(marker, `Soft nav to ${href} kept window.__navMarker`).toBe('r04');
      };

      // Cold mount, then make sure every card image sits in the document's image cache.
      await softNav('/thiet-ke-website/');
      await expect(page.locator('.horizontal-scroll-section')).toBeVisible();
      await page.evaluate(async () => {
        const urls = Array.from(
          document.querySelectorAll<HTMLElement>('.horizontal-scroll-section .item-content'),
        )
          .map((el) => el.style.backgroundImage.match(/url\(["']?([^"')]+)["']?\)/)?.[1])
          .filter((src): src is string => Boolean(src));
        await Promise.all(
          urls.map(
            (src) =>
              new Promise((resolve) => {
                const img = new Image();
                img.onload = img.onerror = resolve;
                img.src = src;
              }),
          ),
        );
      });
      await softNav('/lien-he/');

      // gsap never calls the static refresh() itself, so every counted call comes from the island.
      await page.evaluate(() => {
        const w = window as unknown as {
          ScrollTrigger: { refresh: (...args: unknown[]) => unknown };
          __refreshCalls?: number;
        };
        const original = w.ScrollTrigger.refresh;
        w.__refreshCalls = 0;
        w.ScrollTrigger.refresh = function (this: unknown, ...args: unknown[]) {
          w.__refreshCalls = (w.__refreshCalls ?? 0) + 1;
          return original.apply(this, args);
        };
      });

      await softNav('/thiet-ke-website/');
      await expect(page.locator('.horizontal-scroll-section')).toBeVisible();
      await page.waitForTimeout(300);

      // Only cards with a background image register a load refresh.
      const cards = await page.evaluate(
        () =>
          Array.from(
            document.querySelectorAll<HTMLElement>('.horizontal-scroll-section .item-content'),
          ).filter((el) => el.style.backgroundImage.includes('url(')).length,
      );
      const refreshCalls = await page.evaluate(
        () => (window as unknown as { __refreshCalls?: number }).__refreshCalls ?? 0,
      );
      expect(
        cards,
        'Need several image cards to tell coalesced from per-card refreshes',
      ).toBeGreaterThanOrEqual(4);
      expect(
        refreshCalls,
        `Refresh calls (${refreshCalls}) must stay below the image card count (${cards})`,
      ).toBeLessThan(cards);
    });
  });

  test.describe('IS2 guard: one-card fixture', () => {
    test('translateX is never > 0 at any scroll position when cards are narrower than viewport', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto('/dev-fixtures/home/one-card');

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      // Precondition: the one card is narrower than the viewport, so the raw distance is negative.
      const rawDistance = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        return wrapper.scrollWidth - window.innerWidth;
      });
      expect(rawDistance, 'one-card wrapper must be narrower than the viewport').toBeLessThan(0);

      // The component's own trigger must use the clamped distance (end >= start).
      const range = await page.evaluate(() => {
        const st = (
          window as unknown as {
            ScrollTrigger?: {
              getAll: () => { trigger?: HTMLElement; start: number; end: number }[];
            };
          }
        ).ScrollTrigger;
        const t = st
          ?.getAll()
          .find((x) => x.trigger?.classList.contains('horizontal-scroll-section'));
        return t ? { start: t.start, end: t.end } : null;
      });
      expect(range, 'pin ScrollTrigger must exist on the one-card fixture').not.toBeNull();
      expect(range!.end - range!.start, 'pin range must not be negative').toBeGreaterThanOrEqual(0);

      // Scroll across multiple positions, past the pin start
      for (const scrollY of [0, 200, 500, 1000]) {
        await page.evaluate((y) => window.scrollTo(0, y), scrollY);
        await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(scrollY);
        await page.waitForTimeout(50);

        const translateX = await page.evaluate(() => {
          const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
          const transform = window.getComputedStyle(wrapper).transform;
          const matrix =
            transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
          return matrix ? matrix.m41 : 0;
        });

        expect(
          translateX,
          `translateX at scroll ${scrollY}px must never be > 0`,
        ).toBeLessThanOrEqual(0);
      }
    });
  });

  test.describe('Reduced motion per family', () => {
    const familyMap = new Map<string, string>();
    for (const r of routes) {
      if (!familyMap.has(r.kind)) {
        familyMap.set(r.kind, r.path);
      }
    }
    const familyEntries = Array.from(familyMap.entries());

    for (const [kind, path] of familyEntries) {
      test(`Reduced motion on ${kind} (${path}): no infinite running animations`, async ({
        page,
      }) => {
        await page.emulateMedia({ reducedMotion: 'reduce' });
        await page.goto(path);

        const runningInfiniteAnimations = await page.evaluate(() => {
          const anims = document.getAnimations();
          const offenders: string[] = [];
          for (const anim of anims) {
            if (anim.playState === 'running') {
              const effect = anim.effect;
              if (effect && 'getComputedTiming' in effect) {
                const timing = effect.getComputedTiming();
                if (timing.iterations === Infinity) {
                  const animName =
                    (anim as { animationName?: string }).animationName ?? anim.id ?? 'unnamed';
                  offenders.push(animName);
                }
              }
            }
          }
          return offenders;
        });

        expect(
          runningInfiniteAnimations,
          `Running infinite animations under reduced motion on ${path} (${kind}): ${runningInfiniteAnimations.join(', ')}`,
        ).toEqual([]);
      });
    }
  });
});
