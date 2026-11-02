import type { Page } from '@playwright/test';
import {
  expect,
  expectNoDuplicateIds,
  installRafCounter,
  KNOWN_ABSENT_CSS_ASSETS,
  STAGING,
  test,
} from './fixtures';
import { idleRafCount, loadBeforeRun } from './cap16-helpers';
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

    const items = section.locator('.accordion-gallery-panel');
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
      await expect(item).toHaveAttribute('href', expected.path);
      await expect(item.locator('.accordion-gallery-title')).toHaveText(expected.title);
      await expect(item.locator('.accordion-gallery-category')).toContainText(expected.category);
      const img = item.locator('.accordion-gallery-img');
      await expect(img).toHaveAttribute('src', new RegExp(expected.image));
    }

    // No .pin-spacer exists on home VI
    await expect(page.locator('.pin-spacer')).toHaveCount(0);

    // On EN home, no .horizontal-scroll-section
    await page.goto('/en/home/');
    await expect(page.locator('.horizontal-scroll-section')).toHaveCount(0);
  });

  test('Fine pointer hover: panel 4 grows, color and caption in, others shrink and gray', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const panels = section.locator('.accordion-gallery-panel');
    await expect(panels).toHaveCount(6);

    // Panel 0 is initially active
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
    await expect(panels.nth(3)).toHaveAttribute('data-state', 'inactive');

    // Hover panel 4 (index 3)
    const targetPanel = panels.nth(3);
    await targetPanel.scrollIntoViewIfNeeded();
    await targetPanel.hover();
    await page.waitForTimeout(400);

    await expect(targetPanel).toHaveAttribute('data-state', 'active');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'inactive');

    // Target panel width grows larger than inactive panels
    const targetBox = await targetPanel.boundingBox();
    const inactiveBox = await panels.nth(0).boundingBox();
    expect(targetBox && inactiveBox && targetBox.width > inactiveBox.width * 2).toBe(true);

    // Caption in on target panel
    const captionOpacity = await targetPanel
      .locator('.accordion-gallery-caption')
      .evaluate((el) => window.getComputedStyle(el).opacity);
    expect(Number(captionOpacity)).toBeGreaterThan(0.5);

    // Grayscale: target panel 0%, inactive 100%
    const targetFilter = await targetPanel.evaluate((el) => window.getComputedStyle(el).filter);
    expect(targetFilter).not.toContain('grayscale(1');

    // Every other panel is narrower than the target and gray
    for (const i of [0, 1, 2, 4, 5]) {
      const other = panels.nth(i);
      const otherBox = await other.boundingBox();
      expect(targetBox && otherBox && otherBox.width < targetBox.width).toBe(true);
      await expect
        .poll(() => other.evaluate((el) => window.getComputedStyle(el).filter))
        .toContain('grayscale(1');
    }
  });

  test('Keyboard: Tab to panel, ArrowRight moves focus and active (wraps)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const panels = section.locator('.accordion-gallery-panel');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');

    // Focus first panel
    await panels.nth(0).focus();
    await expect(panels.nth(0)).toBeFocused();

    // ArrowRight moves focus and active to panel 1
    await page.keyboard.press('ArrowRight');
    await expect(panels.nth(1)).toBeFocused();
    await expect(panels.nth(1)).toHaveAttribute('data-state', 'active');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'inactive');

    // Move to last panel (index 5)
    await panels.nth(5).focus();
    await expect(panels.nth(5)).toHaveAttribute('data-state', 'active');

    // ArrowRight on last panel wraps to panel 0
    await page.keyboard.press('ArrowRight');
    await expect(panels.nth(0)).toBeFocused();
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
  });

  test('Touch tap: coarse pointer, tap inactive panel expands without navigating; tap again navigates', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 390, height: 844 },
    });
    const page = await context.newPage();
    try {
      await page.goto('/');

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      const panels = section.locator('.accordion-gallery-panel');
      await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
      await expect(panels.nth(2)).toHaveAttribute('data-state', 'inactive');

      const targetHref = await panels.nth(2).getAttribute('href');
      expect(targetHref).toBeTruthy();

      // Tap inactive panel 2 (index 2)
      await panels.nth(2).click();
      await page.waitForTimeout(200);

      // Expands to active, but URL remains '/'
      await expect(panels.nth(2)).toHaveAttribute('data-state', 'active');
      expect(new URL(page.url()).pathname).toBe('/');

      // Tap panel 2 again
      await panels.nth(2).click();
      await page.waitForURL(new RegExp(`${targetHref}$`));
      expect(new URL(page.url()).pathname).toBe(targetHref);
    } finally {
      await context.close();
    }
  });

  test('Touch tap at 768px: first tap expands an inactive panel without navigating; second tap navigates', async ({
    browser,
  }) => {
    const context = await browser.newContext({
      hasTouch: true,
      isMobile: true,
      viewport: { width: 768, height: 1024 },
    });
    const page = await context.newPage();
    try {
      await page.goto('/');

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();
      expect(await page.evaluate(() => window.matchMedia('(pointer: coarse)').matches)).toBe(true);

      const panels = section.locator('.accordion-gallery-panel');
      await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
      await expect(panels.nth(2)).toHaveAttribute('data-state', 'inactive');

      const targetHref = await panels.nth(2).getAttribute('href');
      expect(targetHref).toBeTruthy();

      await panels.nth(2).tap();
      await expect(panels.nth(2)).toHaveAttribute('data-state', 'active');
      await expect(panels.nth(0)).toHaveAttribute('data-state', 'inactive');
      expect(new URL(page.url()).pathname).toBe('/');

      await panels.nth(2).tap();
      await page.waitForURL(new RegExp(`${targetHref}$`));
      expect(new URL(page.url()).pathname).toBe(targetHref);
    } finally {
      await context.close();
    }
  });

  test('Keyboard at 390px: Tab to a non-first panel activates it and Enter navigates on the first press', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const panels = page.locator('.horizontal-scroll-section .accordion-gallery-panel');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
    const targetHref = await panels.nth(1).getAttribute('href');
    expect(targetHref).toBeTruthy();

    await panels.nth(0).focus();
    await page.keyboard.press('Tab');
    await expect(panels.nth(1)).toBeFocused();
    await expect(panels.nth(1)).toHaveAttribute('data-state', 'active');

    await page.keyboard.press('Enter');
    await page.waitForURL(new RegExp(`${targetHref}$`));
    expect(new URL(page.url()).pathname).toBe(targetHref);
  });

  test('Reduced motion: active state applied instantly with no running tween', async ({ page }) => {
    await installRafCounter(page);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const panels = section.locator('.accordion-gallery-panel');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');

    // Hover or focus panel 3
    await panels.nth(3).focus();
    await expect(panels.nth(3)).toHaveAttribute('data-state', 'active');
    await expect(panels.nth(0)).toHaveAttribute('data-state', 'inactive');

    // window.gsap is only exposed by HorizontalProjects (not on home), so a running tween shows as
    // rAF activity instead: none may remain once GSAP's autoSleep tail has settled.
    await page.waitForTimeout(2500);
    const base = loadBeforeRun()?.['home-vi'];
    expect(base, 'Missing before-run idleRaf for home-vi').toBeDefined();
    expect(await idleRafCount(page)).toBeLessThanOrEqual(base!.idleRaf + 5);

    // Computed style shows expanded active panel
    const flexGrow = await panels.nth(3).evaluate((el) => window.getComputedStyle(el).flexGrow);
    expect(Number(flexGrow)).toBeGreaterThanOrEqual(4);
  });

  test('JS off / SSR: default panel expanded via CSS and all panels are working links', async ({
    browser,
  }) => {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    try {
      await page.goto('/');
      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      const panels = section.locator('.accordion-gallery-panel');
      await expect(panels).toHaveCount(6);

      // Default panel (0) has data-state="active", title, and category
      await expect(panels.nth(0)).toHaveAttribute('data-state', 'active');
      await expect(panels.nth(0).locator('.accordion-gallery-title')).toBeVisible();
      await expect(panels.nth(0).locator('.accordion-gallery-category')).toBeVisible();

      // toBeVisible ignores opacity: the caption must be fully opaque, and panel 0 widest (CSS first frame)
      const captionOpacity = await panels
        .nth(0)
        .locator('.accordion-gallery-caption')
        .evaluate((el) => window.getComputedStyle(el).opacity);
      expect(captionOpacity).toBe('1');
      const widths = await panels.evaluateAll((els) =>
        els.map((el) => el.getBoundingClientRect().width),
      );
      widths.slice(1).forEach((w) => expect(widths[0]).toBeGreaterThan(w));

      // Every panel has a working href link
      for (let i = 0; i < 6; i++) {
        const href = await panels.nth(i).getAttribute('href');
        expect(href).toMatch(/^\/featured_item\/.+/);
      }
    } finally {
      await context.close();
    }
  });

  test('Narrow (< 550px): vertical accordion with no horizontal overflow', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');

    const section = page.locator('.horizontal-scroll-section');
    await expect(section).toBeVisible();

    const gallery = section.locator('.accordion-gallery');
    const flexDirection = await gallery.evaluate((el) => window.getComputedStyle(el).flexDirection);
    expect(flexDirection).toBe('column');

    // No horizontal overflow
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

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
});
