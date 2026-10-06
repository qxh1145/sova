import type { Page } from '@playwright/test';
import { expect, expectNoDuplicateIds, STAGING, test } from './fixtures';

const WIDTHS = [390, 549, 550, 575, 768, 849, 850, 1199, 1280, 1380, 1440];
const STAT_VALUES = ['3500', '1500', '40', '09'];

const HOME_COPY = {
  '/': {
    lines: ['Thấu hiểu, đồng hành', 'và thiết kế trải nghiệm', 'digital toàn diện'],
    cta: { label: 'Về chúng tôi →', href: '/gioi-thieu/' },
    statsTitle: 'Thành tựu chúng tôi đạt được',
    labels: ['Khách hàng hài lòng', 'Dự án hoàn thành', 'Thành viên', 'Năm kinh nghiệm'],
  },
  '/en/home/': {
    lines: ['From Understanding', 'to Innovation', 'We Craft Digital Excellence'],
    cta: { label: 'About us →', href: '/en/about-us/' },
    statsTitle: 'Our Achievements',
    labels: ['Satisfied Clients', 'Projects Completed', 'Team members', 'Years of experience'],
  },
} as const;

/** Records every text a .count-up span shows, from first parse on. */
async function recordCountUps(page: Page) {
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { __countUps: string[] }).__countUps = seen;
    new MutationObserver((records) => {
      for (const record of records) {
        const node = record.target;
        const el = (node instanceof Element ? node : node.parentElement)?.closest('.count-up');
        if (el) seen.push(el.textContent ?? '');
      }
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
}

const countUpTexts = (page: Page) =>
  page.evaluate(() => (window as unknown as { __countUps: string[] }).__countUps.slice());

test.describe('Home query, hero and stats', () => {
  test.beforeEach(async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (
          !text.startsWith('Failed to load resource: the server responded with a status of 404')
        ) {
          consoleErrors.push(text);
        }
      }
    });
    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });
    page.on('response', (res) => {
      if (res.status() !== 404) return;
      const url = new URL(res.url());
      if (
        url.pathname.startsWith('/dev-fixtures/') ||
        url.pathname === '/fixture.png' ||
        url.searchParams.has('_rsc')
      )
        return;
      consoleErrors.push(`404 ${res.url()}`);
    });
    (page as unknown as { __consoleErrors: string[] }).__consoleErrors = consoleErrors;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __consoleErrors?: string[] }).__consoleErrors ?? [];
    expect(errors, `Unexpected console/page errors:\n${errors.join('\n')}`).toEqual([]);
  });

  test('Video banner attributes, single H1, and no duplicate IDs on VI and EN home routes', async ({
    page,
  }) => {
    for (const path of ['/', '/en/home/']) {
      await page.goto(path);

      const video = page.locator('video.video-bg');
      await expect(video).toBeVisible();
      await expect(video).toHaveAttribute('autoplay', '');
      await expect(video).toHaveAttribute('muted', '');
      await expect(video).toHaveAttribute('loop', '');
      await expect(video).toHaveAttribute('playsinline', '');
      await expect(video).toHaveAttribute('preload', /auto|metadata/);
      await expect(video.locator('source')).toHaveAttribute('src', /video-banner-2\.mp4/);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      await expectNoDuplicateIds(page);
    }
  });

  test('Hero heading, CTA and stats copy come from the locale record', async ({ page }) => {
    for (const [path, copy] of Object.entries(HOME_COPY)) {
      await page.goto(path);

      await expect(page.locator('main h1 .typewriter')).toHaveText([...copy.lines]);
      const cta = page.locator('.link_banner a.home-hero-cta');
      await expect(cta).toHaveText(copy.cta.label);
      await expect(cta).toHaveAttribute('href', copy.cta.href);

      const stats = page.locator('.col-thanhtuu');
      await expect(stats.locator('h2')).toHaveText(copy.statsTitle);
      await expect(stats.locator('.row-num')).toHaveCount(4);
      for (const [idx, label] of copy.labels.entries()) {
        const row = stats.locator('.row-num').nth(idx);
        await expect(row).toContainText(label);
        await expect(row).toContainText('+');
      }
    }
  });

  test('With JS, stats count up once on first intersection and end on server values', async ({
    page,
  }) => {
    await recordCountUps(page);
    await page.goto('/');
    const countUps = page.locator('.col-thanhtuu span.count-up');

    await countUps.first().scrollIntoViewIfNeeded();
    await expect(countUps).toHaveText(STAT_VALUES);
    const firstRun = await countUpTexts(page);
    expect(firstRun.some((text) => !STAT_VALUES.includes(text))).toBe(true);

    await page.evaluate(() => {
      (window as unknown as { __countUps: string[] }).__countUps.length = 0;
      window.scrollTo(0, 0);
    });
    await countUps.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    expect(await countUpTexts(page)).toEqual([]);
    await expect(countUps).toHaveText(STAT_VALUES);
  });

  test('Under reduced motion, stats keep their server values', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await recordCountUps(page);
    await page.goto('/');
    const countUps = page.locator('.col-thanhtuu span.count-up');

    await countUps.first().scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    await expect(countUps).toHaveText(STAT_VALUES);
    expect((await countUpTexts(page)).every((text) => STAT_VALUES.includes(text))).toBe(true);
  });

  for (const width of WIDTHS) {
    test(`Typewriter lines are not clipped at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ['/', '/en/home/']) {
        await page.goto(path);

        await page.evaluate(() => {
          document.querySelectorAll('h1 .typewriter').forEach((el) => {
            el.getAnimations().forEach((anim) => {
              try {
                anim.finish();
              } catch {
                // ignore infinite animations
              }
            });
          });
        });

        const lines = page.locator('h1 .typewriter');
        await expect(lines).toHaveCount(3);

        const clipping = await page.evaluate(() => {
          const spans = Array.from(document.querySelectorAll('h1 .typewriter'));
          return spans.map((span) => ({
            text: span.textContent,
            scrollWidth: span.scrollWidth,
            clientWidth: span.clientWidth,
            isClipped: span.scrollWidth > span.clientWidth,
          }));
        });

        for (const line of clipping) {
          expect(
            line.isClipped,
            `Line "${line.text}" is clipped at ${width}px on ${path}: scrollWidth (${line.scrollWidth}) > clientWidth (${line.clientWidth})`,
          ).toBe(false);
        }
      }
    });
  }

  test('Given JS disabled, when Stats render, then four stats show their server values', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();

    for (const path of ['/', '/en/home/']) {
      await page.goto(path);
      const countUps = page.locator('.col-thanhtuu span.count-up');
      await expect(countUps).toHaveCount(4);
      const values = await countUps.allInnerTexts();
      expect(values).toEqual(STAT_VALUES);
    }

    await context.close();
  });

  test('Given the empty scenario, then only the shell renders', async ({ page }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const url of ['/dev-fixtures/home/empty', '/dev-fixtures/home/empty?locale=en']) {
      await page.goto(url);
      await expect(page.locator('#header')).toBeVisible();
      await expect(page.locator('#footer')).toBeVisible();
      await expect(page.locator('.banner.has-video')).toHaveCount(0);
      await expect(page.locator('.col-thanhtuu')).toHaveCount(0);
      await expect(page.locator('main#main')).toBeEmpty();
    }
  });

  test('Given the error scenario, then the localized error renders with no error message or stack', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const [url, expectedTitle] of [
      ['/dev-fixtures/home/error', 'Đã có lỗi xảy ra'],
      ['/dev-fixtures/home/error?locale=en', 'An error occurred'],
    ]) {
      await page.goto(url);
      const error = page.locator('.page-error-main');
      await expect(error.locator('h2')).toHaveText(expectedTitle);
      const text = await error.innerText();
      expect(text).not.toContain('Transport error');
      expect(text).not.toContain('Error:');
      expect(text).not.toContain('stack');

      // Retry re-runs the server render; the error repository still rejects.
      await error.getByRole('button').click();
      await expect(page.locator('.page-error-main h2')).toHaveText(expectedTitle);
    }

    // The thrown render is expected here: a 500 document/RSC response and React's redacted
    // Server Components error (#441). Anything else still fails afterEach.
    const errors = (page as unknown as { __consoleErrors: string[] }).__consoleErrors;
    const unexpected = errors.filter(
      (e) => !e.includes('status of 500') && !e.includes('react.dev/errors/441'),
    );
    errors.splice(0, errors.length, ...unexpected);
  });

  test('Six featured project cards render in placement order on VI, and none on EN', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const items = section.locator('.scroll-item');
    await expect(items).toHaveCount(6);

    const expectedProjects = [
      {
        path: '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
        title: 'Công ty Cổ phần Phát triển Công nghệ THP',
        category: 'Branding',
        image: 'blight-02',
      },
      {
        path: '/featured_item/flexius-cong-ty-co-phan-the-gioi-bang/',
        title: 'FLEXIUS – Công ty Cổ phần Thế Giới Bảng',
        category: 'Website',
        image: 'Flexius-01',
      },
      {
        path: '/featured_item/sencom-home-decor-lighting-design/',
        title: 'SENCOM – Home decor – Lighting – Design',
        category: 'Website',
        image: 'sencom-01',
      },
      {
        path: '/featured_item/so-y-te-benh-vien-mat-ha-giang/',
        title: 'Sở Y Tế Bệnh Viện Mắt Hà Giang',
        category: 'Website',
        image: 'benh-vien-mat-ha-giang-01-scaled-1',
      },
      {
        path: '/featured_item/cong-ty-tnhh-konnertec-viet-nam/',
        title: 'Công ty TNHH Konnertec Việt Nam',
        category: 'Website',
        image: 'konnertec-01',
      },
      {
        path: '/featured_item/cong-ty-co-phan-square-orange/',
        title: 'CÔNG TY CỔ PHẦN SQUARE ORANGE',
        category: 'Website',
        image: 'squareorange-01-min',
      },
    ];

    for (const [idx, expected] of expectedProjects.entries()) {
      const item = items.nth(idx);
      const link = item.locator('a.item-link');
      await expect(link).toHaveAttribute('href', expected.path);
      await expect(item.locator('.item-title')).toHaveText(expected.title);
      await expect(item.locator('.item-categories .item-term')).toHaveText(expected.category);
      const content = item.locator('.item-content');
      const bgStyle = await content.evaluate((el) => el.style.backgroundImage);
      expect(bgStyle).toContain(expected.image);
    }

    // On EN home, no .horizontal-scroll-section
    await page.goto('/en/home/');
    await expect(page.locator('.horizontal-scroll-section')).toHaveCount(0);
  });

  for (const width of [1440, 390]) {
    test(`Horizontal projects pin and scrub at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      const { startY, distance } = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
        const sec = document.querySelector('.horizontal-scroll-section') as HTMLElement;
        const trigger = pinSpacer ?? sec;
        const rect = trigger.getBoundingClientRect();
        return {
          startY: window.scrollY + rect.top,
          distance: wrapper.scrollWidth - window.innerWidth,
        };
      });

      // Scroll to 50% of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + 0.5 * distance);
      await page.waitForTimeout(300);

      const halfData = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
        const transform = window.getComputedStyle(wrapper).transform;
        const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
        return {
          hasPinSpacer: Boolean(pinSpacer),
          translateX: matrix ? matrix.m41 : 0,
        };
      });

      expect(halfData.hasPinSpacer).toBe(true);
      expect(Math.abs(halfData.translateX - (-0.5 * distance))).toBeLessThanOrEqual(25);

      // Scroll to end of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + distance);
      await page.waitForTimeout(300);

      const endData = await page.evaluate(() => {
        const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
        const transform = window.getComputedStyle(wrapper).transform;
        const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
        return {
          translateX: matrix ? matrix.m41 : 0,
        };
      });

      expect(Math.abs(endData.translateX - (-distance))).toBeLessThanOrEqual(25);
    });
  }

  test('Client navigation away from / removes .pin-spacer and cleans up ScrollTrigger', async ({
    page,
  }) => {
    await page.goto('/');
    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    // Verify ScrollTrigger exists if test hook is available
    const initialTriggers = await page.evaluate(() => {
      const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
        .ScrollTrigger;
      return st ? st.getAll().length : null;
    });
    if (initialTriggers !== null) {
      expect(initialTriggers).toBeGreaterThan(0);
    }

    // Client navigate away using the language switcher link (/en/home/)
    await page.locator('#header a[href="/en/home/"]').click();
    await page.waitForURL('**/en/home/**');

    // Verify no pin-spacer remains
    await expect(page.locator('.pin-spacer')).toHaveCount(0);

    // Verify ScrollTrigger.getAll().length === 0
    const liveTriggers = await page.evaluate(() => {
      const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
        .ScrollTrigger;
      return st ? st.getAll().length : 0;
    });
    expect(liveTriggers).toBe(0);
  });

  test('Under reduced motion, pin and translation still occur and hover leaves scale at 1', async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const { startY, distance } = await page.evaluate(() => {
      const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
      const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
      const sec = document.querySelector('.horizontal-scroll-section') as HTMLElement;
      const trigger = pinSpacer ?? sec;
      const rect = trigger.getBoundingClientRect();
      return {
        startY: window.scrollY + rect.top,
        distance: wrapper.scrollWidth - window.innerWidth,
      };
    });

    // Hover over first card while at start (inside viewport)
    await page.evaluate((y) => window.scrollTo(0, y), startY);
    await page.waitForTimeout(300);
    const firstCard = page.locator('.scroll-item').first();
    await firstCard.hover();
    await page.waitForTimeout(350);

    const scale = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (!transform || transform === 'none') return 1;
      const matrix = new DOMMatrixReadOnly(transform);
      return matrix.a; // matrix.a is scaleX
    });

    expect(scale).toBe(1);

    // Scroll to 50%
    await page.evaluate((y) => window.scrollTo(0, y), startY + 0.5 * distance);
    await page.waitForTimeout(300);

    const halfData = await page.evaluate(() => {
      const wrapper = document.querySelector('.scrolling-wrapper') as HTMLElement;
      const pinSpacer = document.querySelector('.pin-spacer') as HTMLElement;
      const transform = window.getComputedStyle(wrapper).transform;
      const matrix = transform && transform !== 'none' ? new DOMMatrixReadOnly(transform) : null;
      return {
        hasPinSpacer: Boolean(pinSpacer),
        translateX: matrix ? matrix.m41 : 0,
      };
    });

    expect(halfData.hasPinSpacer).toBe(true);
    expect(Math.abs(halfData.translateX - (-0.5 * distance))).toBeLessThanOrEqual(25);
  });

  test('Hover over card scales up to 1.05 under normal motion', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.goto('/');

    const firstCard = page.locator('.scroll-item').first();
    await firstCard.scrollIntoViewIfNeeded();
    await firstCard.hover();
    await page.waitForTimeout(400);

    const scale = await firstCard.evaluate((el) => {
      const style = window.getComputedStyle(el);
      const transform = style.transform;
      if (!transform || transform === 'none') return 1;
      const matrix = new DOMMatrixReadOnly(transform);
      return Math.round(matrix.a * 100) / 100;
    });

    expect(scale).toBe(1.05);
  });
});

