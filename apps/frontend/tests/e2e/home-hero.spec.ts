import type { Page } from '@playwright/test';
import { expect, expectNoDuplicateIds, KNOWN_ABSENT_CSS_ASSETS, STAGING, test } from './fixtures';
import manifest from '../baseline/manifest.json';
import { homePages } from '../../src/data/pages/home';
import type { SectionCopy } from '@/types/content';

const WIDTHS = [...manifest.viewports, ...manifest.marqueeViewports].sort((a, b) => a - b);
const STAT_VALUES = ['500', '50', '20', '03'];

const homeVi = homePages.find((p) => p.locale === 'vi')!;
const homeEn = homePages.find((p) => p.locale === 'en')!;
const statsBreaks = ({ titleLines }: SectionCopy) => (titleLines?.length ?? 1) - 1;

const HOME_COPY = {
  '/': {
    lines: homeVi.hero.headingLines,
    cta: { label: 'Về chúng tôi →', href: '/gioi-thieu/' },
    statsTitle: homeVi.sectionCopy.achievements.title,
    statsBreaks: statsBreaks(homeVi.sectionCopy.achievements),
    statsDesc: { id: 'text-718633786', start: homeVi.sectionCopy.achievements.description! },
    labels: ['Khách hàng hài lòng', 'Dự án hoàn thành', 'Thành viên', 'Năm kinh nghiệm'],
  },
  '/en/home/': {
    lines: homeEn.hero.headingLines,
    cta: { label: 'About us →', href: '/en/about-us/' },
    statsTitle: homeEn.sectionCopy.achievements.title,
    statsBreaks: statsBreaks(homeEn.sectionCopy.achievements),
    statsDesc: { id: 'text-3546826826', start: homeEn.sectionCopy.achievements.description! },
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
    const missingResponses: string[] = [];
    page.on('response', (res) => {
      if (res.status() !== 404) return;
      const url = new URL(res.url());
      if (
        url.pathname.startsWith('/dev-fixtures/') ||
        url.pathname === '/fixture.png' ||
        KNOWN_ABSENT_CSS_ASSETS.has(url.pathname) ||
        url.searchParams.has('_rsc')
      )
        return;
      missingResponses.push(`404 ${res.url()}`);
    });
    (page as unknown as { __missingResponses: string[] }).__missingResponses = missingResponses;
  });

  test.afterEach(async ({ page }) => {
    const errors = (page as unknown as { __missingResponses?: string[] }).__missingResponses ?? [];
    expect(errors, `Unexpected 404 responses:\n${errors.join('\n')}`).toEqual([]);
  });

  test('ASCII gradient background, single H1, and no duplicate IDs on VI and EN home routes', async ({
    page,
  }) => {
    for (const path of ['/', '/en/home/']) {
      await page.goto(path);

      await expect(page.locator('.banner-bg canvas.gradient-ascii-canvas')).toBeVisible();
      await expect(page.locator('video.video-bg')).toHaveCount(0);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      await expectNoDuplicateIds(page);
    }
  });

  test('Hero heading, CTA and stats copy come from the locale record', async ({ page }) => {
    for (const [path, copy] of Object.entries(HOME_COPY)) {
      await page.goto(path);

      await expect(page.locator('main h1 .typewriter')).toHaveText([...copy.lines]);
      const cta = page.locator('.link_banner a');
      await expect(cta).toHaveText(copy.cta.label);
      await expect(cta).toHaveAttribute('href', copy.cta.href);

      const stats = page.locator('.col-thanhtuu');
      await expect(stats.locator('h2')).toHaveText(copy.statsTitle);
      await expect(stats.locator('h2 br')).toHaveCount(copy.statsBreaks);
      await expect(stats.locator(`#${copy.statsDesc.id} p`)).toContainText(copy.statsDesc.start);
      await expect(stats.locator('.row-num')).toHaveCount(4);
      for (const [idx, label] of copy.labels.entries()) {
        const row = stats.locator('.row-num').nth(idx);
        await expect(row).toContainText(label);
        await expect(row).toContainText('+');
      }
    }
  });

  test('Hero CTA is hidden below 550px (hide-for-small)', async ({ page }) => {
    await page.goto('/');
    const cta = page.locator('.link_banner.hide-for-small a');
    await page.setViewportSize({ width: 390, height: 900 });
    await expect(cta).toBeHidden();
    await page.setViewportSize({ width: 550, height: 900 });
    await expect(cta).toBeVisible();
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
    test(`Hero heading matches expected font size at width ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      for (const path of ['/', '/en/home/']) {
        await page.goto(path);
        const sizes = await page.locator('.home-hero-heading').evaluate((heading) => ({
          heading: getComputedStyle(heading).fontSize,
          line: getComputedStyle(heading.querySelector('.typewriter')!).fontSize,
        }));
        if (width >= 550 && width < 1200) {
          // Story 8.1 responsive fix: clamp(30px, 4vw, 48px) in responsive-fixes.css replaces the source size.
          const fluid = Math.min(48, Math.max(30, width * 0.04));
          expect(parseFloat(sizes.heading)).toBeCloseTo(fluid, 1);
          expect(parseFloat(sizes.line)).toBeCloseTo(fluid, 1);
          continue;
        }
        expect(sizes.heading).toBe(width < 550 ? '40px' : '67.2px');
        expect(sizes.line).toBe(width < 550 ? '34px' : '67.2px');
      }
    });
  }

  for (const width of [390, 549]) {
    test(`Hero lines keep source 40px boxes and 49.1px pitch at width ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');
      const boxes = await page.locator('.home-hero-heading .typewriter').evaluateAll((lines) =>
        lines.map((line) => {
          const { top, height } = line.getBoundingClientRect();
          return { top, height };
        }),
      );
      expect(boxes).toHaveLength(3);
      boxes.forEach((box) => expect(box.height).toBeCloseTo(40, 0));
      expect(boxes[1].top - boxes[0].top).toBeCloseTo(49.1, 0);
      expect(boxes[2].top - boxes[1].top).toBeCloseTo(49.1, 0);
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
      expect(Math.abs(halfData.translateX - -0.5 * distance)).toBeLessThanOrEqual(25);

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

      expect(Math.abs(endData.translateX - -distance)).toBeLessThanOrEqual(25);
    });
  }

  // Every route change from / crosses a root layout (full reload), so unmount is driven in place.
  test('Unmounting the island removes .pin-spacer and kills its ScrollTrigger', async ({
    page,
  }) => {
    const liveTriggers = () =>
      page.evaluate(() => {
        const st = (window as unknown as { ScrollTrigger?: { getAll: () => unknown[] } })
          .ScrollTrigger;
        return st ? st.getAll().length : null;
      });

    await page.goto('/dev-fixtures/home/unmount');
    await expect(page.locator('.horizontal-scroll-section')).toBeVisible();
    await expect(page.locator('.pin-spacer')).toHaveCount(1);
    const initialTriggers = await liveTriggers();
    expect(
      initialTriggers,
      'window.ScrollTrigger missing: build with npm run build:e2e',
    ).not.toBeNull();
    expect(initialTriggers).toBeGreaterThan(0);

    await page.locator('#unmount-toggle').click();

    await expect(page.locator('.horizontal-scroll-section')).toHaveCount(0);
    await expect(page.locator('.pin-spacer')).toHaveCount(0);
    expect(await liveTriggers()).toBe(0);
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
    expect(Math.abs(halfData.translateX - -0.5 * distance)).toBeLessThanOrEqual(25);
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
