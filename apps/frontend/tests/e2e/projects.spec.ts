import { test, expect } from '@playwright/test';
import { hasSource, missingSourceMessage, openSource } from '../baseline/source';

test.describe('/du-an/ and /en/our-project/ project listing, filter and pagination', () => {
  test('Default /du-an/ renders "Tất cả" active, 6 cards, 11 pages (62 items)', async ({
    page,
  }) => {
    await page.goto('/du-an/');
    await expect(page).toHaveURL(/\/du-an\/$/);

    // Initial filter state
    const filterAll = page.locator('.filter-nav li.active a');
    await expect(filterAll).toHaveText('Tất cả');

    // 6 cards rendered initially
    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(6);

    // 11 pages in pagination (since 62 items / 6 per page = 11 pages)
    const pagination = page.locator('#portfolio-pagination .pagination');
    await expect(pagination).toBeVisible();

    const current = pagination.locator('.page-numbers.current');
    await expect(current).toHaveText('1');

    // Check last numbered page button is 11
    const pageButtons = pagination.locator('button.page-numbers:not(.next):not(.prev)');
    const lastPageText = await pageButtons.last().textContent();
    expect(lastPageText?.trim()).toBe('11');
  });

  test('VI /du-an/ hero renders imported description, CTA, breadcrumb and images', async ({
    page,
  }) => {
    await page.goto('/du-an/');
    const hero = page.locator('.banner.banner-project');
    await expect(hero).toContainText('Khám phá tư duy thiết kế và triết lý sáng tạo');
    await expect(hero.locator('a.but-lh')).toHaveAttribute('href', '/lien-he/');
    await expect(hero).toContainText('Trang chủ');
    await expect(hero.locator('.banner-bg img')).toHaveAttribute(
      'src',
      '/wp-content/uploads/2024/02/de729be13c98f6a585c5656f0ce73db4-1.webp',
    );
    await expect(
      hero.locator('img[src="/wp-content/uploads/2024/02/43e3185f955f1d3fca7ffa93786c89a0.png"]'),
    ).toHaveCount(1);
    // Filter links stay on the listing route for middle-click / no-JS.
    for (const href of await page
      .locator('.filter-nav a')
      .evaluateAll((as) => as.map((a) => a.getAttribute('href'))))
      expect(href).toBe('/du-an/');
  });

  test('Filtering on /du-an/ resets page, updates counts, and preserves URL', async ({ page }) => {
    await page.goto('/du-an/');
    const initialUrl = page.url();

    // 1. Click page 3 first to test reset on filter change
    const pagination = page.locator('#portfolio-pagination .pagination');
    const page3Btn = pagination.locator('button.page-numbers', { hasText: '3' });
    await page3Btn.click();
    await expect(pagination.locator('.page-numbers.current')).toHaveText('3');
    expect(page.url()).toBe(initialUrl);

    // 2. Click Branding filter
    const brandingFilter = page.locator('.filter-nav a[data-term="branding"]');
    await brandingFilter.click();

    // Active state updated
    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', 'branding');

    // 2 cards for Branding
    const cards = page.locator('#portfolio-results .col');
    await expect(cards).toHaveCount(2);

    // Total page is 1, so pagination wrapper has no .pagination nav
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);
    expect(page.url()).toBe(initialUrl);

    // 3. Click Website filter
    const websiteFilter = page.locator('.filter-nav a[data-term="website"]');
    await websiteFilter.click();

    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', 'website');
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);

    // 59 items / 6 per page = 10 pages
    await expect(page.locator('#portfolio-pagination .pagination')).toBeVisible();
    await expect(page.locator('#portfolio-pagination .current')).toHaveText('1');
    const lastWebsitePage = await page
      .locator('#portfolio-pagination button.page-numbers:not(.next):not(.prev)')
      .last()
      .textContent();
    expect(lastWebsitePage?.trim()).toBe('10');
    expect(page.url()).toBe(initialUrl);

    // 4. Click Tất cả (All) filter
    const allFilter = page.locator('.filter-nav a[data-term=""]');
    await allFilter.click();
    await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', '');
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);
    const lastAllPage = await page
      .locator('#portfolio-pagination button.page-numbers:not(.next):not(.prev)')
      .last()
      .textContent();
    expect(lastAllPage?.trim()).toBe('11');
    expect(page.url()).toBe(initialUrl);
  });

  test('Page change scrolls to #portfolio-wrapper - 100px and keeps URL unchanged', async ({
    page,
  }) => {
    await page.goto('/du-an/');
    const initialUrl = page.url();

    // Scroll to bottom first so page change scroll up is noticeable
    await page.evaluate(() => window.scrollTo(0, 2000));
    await page.waitForFunction(() => window.scrollY > 1000);

    const pagination = page.locator('#portfolio-pagination .pagination');
    const page2Btn = pagination.locator('button.page-numbers', { hasText: '2' });
    await page2Btn.click();

    await expect(pagination.locator('.page-numbers.current')).toHaveText('2');
    expect(page.url()).toBe(initialUrl);

    // Wait for scroll animation to settle near #portfolio-wrapper - 100px
    const expectedScroll = await page.evaluate(() => {
      const wrapper = document.getElementById('portfolio-wrapper');
      return wrapper ? wrapper.getBoundingClientRect().top + window.scrollY - 100 : 0;
    });

    await page.waitForFunction(
      (expected) => Math.abs(window.scrollY - expected) < 20,
      expectedScroll,
    );
    const actualScroll = await page.evaluate(() => window.scrollY);
    expect(Math.abs(actualScroll - expectedScroll)).toBeLessThan(20);

    // Cards 7-12 rendered
    await expect(page.locator('#portfolio-results .col')).toHaveCount(6);

    // Next button click
    const nextBtn = pagination.locator('button.next.page-numbers');
    await nextBtn.click();
    await expect(pagination.locator('.page-numbers.current')).toHaveText('3');
    expect(page.url()).toBe(initialUrl);
  });

  test('EN /en/our-project/ renders shell, hero, All only, empty-state message, no pagination', async ({
    page,
  }) => {
    await page.goto('/en/our-project/');
    await expect(page).toHaveURL(/\/en\/our-project\/$/);

    // Hero title
    const heroTitle = page.locator('.service-hero-heading');
    await expect(heroTitle).toContainText('Projects Partnered');
    await expect(heroTitle).toContainText('with Sova');

    // Only "All" filter
    const filterItems = page.locator('.filter-nav li');
    await expect(filterItems).toHaveCount(1);
    await expect(filterItems.first().locator('a')).toHaveText('All');

    // Empty state message
    const emptyMsg = page.locator('#portfolio-results p');
    await expect(emptyMsg).toHaveText('No projects found.');

    // No pagination
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);
  });

  test('No duplicate IDs and no console errors on VI and EN pages', async ({ page }) => {
    for (const url of ['/du-an/', '/en/our-project/']) {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      await page.goto(url);

      const duplicateIds = await page.evaluate(() => {
        const allIds = Array.from(document.querySelectorAll('[id]')).map((el) => el.id);
        const seen = new Set<string>();
        const dupes: string[] = [];
        for (const id of allIds) {
          if (seen.has(id)) dupes.push(id);
          else seen.add(id);
        }
        return dupes;
      });

      expect(duplicateIds).toEqual([]);
      expect(consoleErrors).toEqual([]);
    }
  });

  test('Dev fixtures variants: loading, empty, error', async ({ page }) => {
    // 1. Loading fixture
    await page.goto('/dev-fixtures/projects/loading/');
    const loadingMsg = page.locator('#portfolio-results p');
    await expect(loadingMsg).toHaveText('Đang tải...');

    // 2. Empty fixture
    await page.goto('/dev-fixtures/projects/empty/');
    const emptyMsg = page.locator('#portfolio-results p');
    await expect(emptyMsg).toHaveText('Không có dự án nào.');
    await expect(page.locator('#portfolio-pagination .pagination')).toHaveCount(0);

    // 3. Error fixture (VI)
    await page.goto('/dev-fixtures/projects/error/');
    await expect(page.locator('.page-error-main')).toBeVisible();

    // 4. Error fixture (EN)
    await page.goto('/dev-fixtures/projects/error/?locale=en');
    await expect(page.locator('.page-error-main')).toBeVisible();
  });

  test('Pagination wrapper markup and computed CSS matches eras-clone du-an', async ({ page }) => {
    test.skip(!hasSource, missingSourceMessage);

    // Measure source
    await openSource(page, {
      key: 'du-an-pagination',
      url: '/du-an/',
      file: 'du-an/index.html',
      family: 'projects',
      locale: 'vi',
      reason: 'parity',
    });

    const sourceData = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-pagination');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textAlign: style.textAlign,
        marginTop: style.marginTop,
      };
    });

    // Measure Sova
    await page.goto('/du-an/');
    const sovaData = await page.evaluate(() => {
      const el = document.querySelector('#portfolio-pagination');
      if (!el) return null;
      const style = window.getComputedStyle(el);
      return {
        tagName: el.tagName.toLowerCase(),
        id: el.id,
        className: el.className,
        textAlign: style.textAlign,
        marginTop: style.marginTop,
      };
    });

    expect(sovaData).not.toBeNull();
    expect(sourceData).not.toBeNull();
    expect(sovaData?.tagName).toBe(sourceData?.tagName);
    expect(sovaData?.id).toBe(sourceData?.id);
    expect(sovaData?.className).toBe(sourceData?.className);
    expect(sovaData?.textAlign).toBe(sourceData?.textAlign);
    expect(sovaData?.marginTop).toBe(sourceData?.marginTop);
  });
});

test.describe('/featured_item/ archive and /featured_item_category/* archives', () => {
  const ARCHIVE = '#portfolio-1541637127';
  const CATEGORIES = [
    { slug: 'website', title: 'Website', count: 59, portfolio: '#portfolio-200128785' },
    { slug: 'branding', title: 'Branding', count: 2, portfolio: '#portfolio-1442370418' },
    { slug: 'mobile-app', title: 'Mobile App', count: 1, portfolio: '#portfolio-1320843097' },
  ];

  test('Archive default: THP page title (A12), "Tất cả" active, 62 cards, no pagination', async ({
    page,
  }) => {
    await page.goto('/featured_item/');
    await expect(page.locator('.page-title h1.entry-title')).toHaveText(
      'Công ty Cổ phần Phát triển Công nghệ THP',
    );
    await expect(page.locator('.filter-nav li.active a')).toHaveText('Tất cả');
    await expect(page.locator('.filter-nav a')).toHaveText([
      'Tất cả',
      'Branding',
      'Mobile App',
      'Website',
    ]);
    await expect(page.locator(`${ARCHIVE} .col`)).toHaveCount(62);
    await expect(page.locator('#portfolio-pagination, .pagination')).toHaveCount(0);
    await expect(page.locator('.banner.banner-project')).toContainText('Khám phá tư duy thiết kế');

    // Cards render in source archive order: STORMICK 19th, Dsmart 23rd
    const cardLinks = page.locator(`${ARCHIVE} .col a[href*="/featured_item/"]`);
    await expect(cardLinks.nth(0)).toHaveAttribute(
      'href',
      '/featured_item/evc-athena-cong-ty-tnhh-evc-athena/',
    );
    await expect(cardLinks.nth(18)).toHaveAttribute(
      'href',
      '/featured_item/stormick-cong-ty-tnhh-storm-entertaiment/',
    );
    await expect(cardLinks.nth(22)).toHaveAttribute(
      'href',
      '/featured_item/giao-dien-dsmart-giai-phap-dieu-khien-xe-hoi-tren-smartphone/',
    );
  });

  // Legacy per-route CSS targets these source hero ids; each route must carry its own set.
  const HERO_IDS = [
    {
      path: '/featured_item/',
      banner: 'banner-1513224978',
      heading: 'text-1186201538',
      gap: 'gap-1700866820',
    },
    {
      path: '/featured_item_category/website/',
      banner: 'banner-669224451',
      heading: 'text-1283775997',
      gap: 'gap-1582094197',
    },
    {
      path: '/featured_item_category/branding/',
      banner: 'banner-1437243260',
      heading: 'text-3643032278',
      gap: 'gap-163447323',
    },
    {
      path: '/featured_item_category/mobile-app/',
      banner: 'banner-819223527',
      heading: 'text-4093867166',
      gap: 'gap-447887585',
    },
  ];

  for (const { path, banner, heading, gap } of HERO_IDS) {
    test(`Hero on ${path} carries source ids ${banner}, ${heading}, ${gap}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator(`#${banner}.banner-project`)).toHaveCount(1);
      // headingGap renders directly after the heading text box
      await expect(page.locator(`#${banner} #${heading} + #${gap}.gap-element`)).toHaveCount(1);
    });
  }

  test('Archive filter: Branding 2 (incl. THP), Mobile App 1, Website 59, Tất cả 62; URL unchanged', async ({
    page,
  }) => {
    await page.goto('/featured_item/');
    const url = page.url();
    const cards = page.locator(`${ARCHIVE} .col`);
    for (const [term, count] of [
      ['branding', 2],
      ['mobile-app', 1],
      ['website', 59],
      ['', 62],
    ] as const) {
      await page.locator(`.filter-nav a[data-term="${term}"]`).click();
      await expect(page.locator('.filter-nav li.active a')).toHaveAttribute('data-term', term);
      await expect(cards).toHaveCount(count);
      if (term === 'branding')
        await expect(cards.locator('.portfolio-box-title')).toContainText([
          'Công ty Cổ phần Phát triển Công nghệ THP',
        ]);
      await expect(page.locator('.pagination')).toHaveCount(0);
      expect(page.url()).toBe(url);
    }
  });

  test('Archive columns: 2 / 3 / 3 / 4 / 4 cards per row at 549 / 550 / 849 / 850 / 1280', async ({
    page,
  }) => {
    for (const [width, perRow] of [
      [549, 2],
      [550, 3],
      [849, 3],
      [850, 4],
      [1280, 4],
    ]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/featured_item/');
      const firstRow = await page.locator(`${ARCHIVE} .col`).evaluateAll((cols) => {
        const tops = cols.map((c) => (c as HTMLElement).offsetTop);
        return tops.filter((t) => t === tops[0]).length;
      });
      expect(firstRow, `${width}px`).toBe(perRow);
    }
  });

  for (const { slug, title, count, portfolio } of CATEGORIES) {
    test(`Category ${slug}: H1 "${title}", ${count} cards, no filter nav, no pagination`, async ({
      page,
    }) => {
      await page.goto(`/featured_item_category/${slug}/`);
      await expect(page.locator('.page-title h1.entry-title')).toHaveText(title);
      const cards = page.locator(`${portfolio} .col`);
      await expect(cards).toHaveCount(count);
      await expect(cards.locator('.portfolio-box-category')).toHaveText(Array(count).fill(title));
      await expect(page.locator('.filter-nav')).toHaveCount(0);
      await expect(page.locator('.pagination, #portfolio-pagination')).toHaveCount(0);
      if (slug === 'branding')
        await expect(cards.locator('.portfolio-box-title')).toContainText([
          'Công ty Cổ phần Phát triển Công nghệ THP',
        ]);
    });
  }

  test('Unknown category is a 404', async ({ page }) => {
    const res = await page.goto('/featured_item_category/nope/');
    expect(res?.status()).toBe(404);
  });

  test('No duplicate ids and no console errors on the four routes', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource'))
        consoleErrors.push(msg.text());
    });
    page.on('pageerror', (err) => consoleErrors.push(err.message));
    for (const url of [
      '/featured_item/',
      ...CATEGORIES.map((c) => `/featured_item_category/${c.slug}/`),
    ]) {
      await page.goto(url);
      const dupes = await page.evaluate(() => {
        const seen = new Set<string>();
        return Array.from(document.querySelectorAll('[id]'))
          .map((el) => el.id)
          .filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
      });
      expect(dupes, url).toEqual([]);
    }
    expect(consoleErrors).toEqual([]);
  });

  // Tag + class signature of the archive wrapper, grid and first card (hrefs/srcs differ by design).
  const signature = (wrapperSelector: string) => {
    const wrapper = document.querySelector('.portfolio-page-wrapper');
    const portfolio = document.querySelector(wrapperSelector);
    const grid = portfolio?.querySelector('.row');
    const card = grid?.querySelector('.col');
    const sig = (el: Element | null | undefined) =>
      el ? `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}` : null;
    return {
      wrapper: sig(wrapper),
      pageTitle: sig(wrapper?.querySelector('.page-title h1')),
      section: sig(wrapper?.querySelector('section')),
      sectionId: wrapper?.querySelector('section')?.id,
      portfolio: sig(portfolio),
      filter: sig(portfolio?.querySelector('.filter-nav')),
      grid: sig(grid),
      card: card ? [card, ...card.querySelectorAll('*')].map(sig) : null,
      cardTerms: card?.getAttribute('data-terms'),
    };
  };

  for (const row of [
    { url: '/featured_item/', file: 'featured_item/index.html', portfolio: ARCHIVE },
    ...CATEGORIES.map((c) => ({
      url: `/featured_item_category/${c.slug}/`,
      file: `featured_item_category/${c.slug}/index.html`,
      portfolio: c.portfolio,
    })),
  ]) {
    test(`${row.url} wrapper, grid and card markup match eras-clone`, async ({ page }) => {
      test.skip(!hasSource, missingSourceMessage);
      await openSource(page, {
        key: `archive-${row.url}`,
        url: row.url,
        file: row.file,
        family: 'projects',
        locale: 'vi',
        reason: 'parity',
      });
      const source = await page.evaluate(signature, row.portfolio);
      await page.goto(row.url);
      const sova = await page.evaluate(signature, row.portfolio);
      expect(source.grid).not.toBeNull();
      expect(sova).toEqual(source);
    });
  }
});

test.describe('/featured_item/<slug>/ project detail pages', () => {
  test('All 62 project detail pages return 200 with title, both H1s, terms, date, and sidebar', async ({
    page,
  }) => {
    const { projects } = await import('../../src/data/projects');
    expect(projects).toHaveLength(62);

    for (const project of projects) {
      const res = await page.goto(project.path);
      expect(res?.status(), `status for ${project.path}`).toBe(200);

      // <title> = seo.title
      const title = await page.title();
      expect(title).toBe(project.seo.title);

      // Both H1s match project title
      const h1Current = page.locator('h1.current-post-title');
      const h1Entry = page.locator('h1.entry-title');
      await expect(h1Current).toHaveText(project.title);
      await expect(h1Entry).toHaveText(project.title);

      // Terms block present
      const terms = page.locator('.qodef-portfolio-content');
      await expect(terms).toBeVisible();

      // Date present
      const dateEl = page.locator('.qodef-info--date');
      await expect(dateEl).toBeVisible();
      await expect(dateEl).toContainText(project.displayDate!);

      // Sidebar with excerpt present
      const sidebar = page.locator('.col.large-3.small-12 .col-inner');
      await expect(sidebar).toBeVisible();
      await expect(sidebar.locator('h3')).toHaveText('Thông tin dự án');
      await expect(sidebar).toContainText(project.summary!);
    }
  });

  test('Matrix rows: THP, no gallery (centro), 1 image (bossman), free-text date (huynh-thuc-khang), 58 related (evc-athena), unknown slug', async ({
    page,
  }) => {
    // 1. THP
    await page.goto('/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/');
    const thpDate = page.locator('.qodef-info--date h3.qodef-e-title');
    await expect(thpDate).toHaveText('DATE: 24 Tháng Bảy, 2022');
    const thpRelated = page.locator('.portfolio-bottom .portfolio-related .col');
    await expect(thpRelated).toHaveCount(1);
    await expect(thpRelated.locator('.portfolio-box-title')).toContainText('STORMICK');
    await expect(thpRelated.locator('.portfolio-box-category')).toContainText('Branding');
    await expect(page.locator('.qodef-portfolio-content h2')).toHaveCount(4);

    // 2. Centro (no gallery)
    await page.goto('/featured_item/centro-noi-that-cao-cap-centro-chau-au/');
    const centroSlider = page.locator('#slider-duan .slider');
    await expect(centroSlider).toBeAttached();
    await expect(centroSlider.locator('img, .img')).toHaveCount(0);
    const centroDate = page.locator('.qodef-info--date .entry-date');
    await expect(centroDate).toHaveText('24 Tháng Bảy, 2022');

    // 3. Bossman (1 gallery image)
    await page.goto('/featured_item/bossman-cong-ty-co-phan-bossman-viet-nam/');
    const bossmanImg = page.locator('#slider-duan .row .col.large-12 .img-inner img');
    await expect(bossmanImg).toBeVisible();
    await expect(bossmanImg).toHaveCSS('border-radius', '12px');

    // 4. Free-text date (huynh-thuc-khang)
    await page.goto('/featured_item/truong-trung-hoc-pho-thong-huynh-thuc-khang/');
    const htkDate = page.locator('.qodef-info--date');
    await expect(htkDate).toContainText('Ngày 22 tháng 4 năm 2023');
    await expect(htkDate.locator('.entry-date')).toHaveCount(0);

    // 5. Many related (evc-athena has 58 related ids, capped at first 4)
    await page.goto('/featured_item/evc-athena-cong-ty-tnhh-evc-athena/');
    const athenaRelated = page.locator('.portfolio-bottom .portfolio-related .col');
    await expect(athenaRelated).toHaveCount(4);

    // 6. No related (dsmart): section and heading still render, as source
    await page.goto('/featured_item/giao-dien-dsmart-giai-phap-dieu-khien-xe-hoi-tren-smartphone/');
    await expect(page.locator('.portfolio-bottom h4')).toHaveText('Dự án liên quan');
    await expect(page.locator('.portfolio-bottom .portfolio-related .col')).toHaveCount(0);

    // 7. Unknown slug -> 404
    const unknownRes = await page.goto('/featured_item/khong-ton-tai/');
    expect(unknownRes?.status()).toBe(404);
  });

  test('No duplicate ids and no console errors on THP and centro detail pages', async ({
    page,
  }) => {
    for (const url of [
      '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
      '/featured_item/centro-noi-that-cao-cap-centro-chau-au/',
    ]) {
      const consoleErrors: string[] = [];
      page.on('console', (msg) => {
        if (msg.type() === 'error' && !msg.text().startsWith('Failed to load resource')) {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', (err) => consoleErrors.push(err.message));

      await page.goto(url);
      const dupes = await page.evaluate(() => {
        const seen = new Set<string>();
        return Array.from(document.querySelectorAll('[id]'))
          .map((el) => el.id)
          .filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
      });
      expect(dupes, url).toEqual([]);
      expect(consoleErrors).toEqual([]);
    }
  });

  const detailSignature = () => {
    const sig = (el: Element | null | undefined) =>
      el ? `${el.tagName.toLowerCase()}.${[...el.classList].join('.')}` : null;
    const getTree = (rootEl: Element | null | undefined) =>
      rootEl ? [rootEl, ...rootEl.querySelectorAll('*')].map(sig) : null;

    const wrapper = document.querySelector('.portfolio-page-wrapper.portfolio-single-page');
    const hero = wrapper?.querySelector('section.section');
    const bodyRows = wrapper?.querySelectorAll('.row.row-portcus');
    const bodyRow = bodyRows && bodyRows.length > 1 ? bodyRows[1] : null;
    const sidebar = bodyRow?.querySelector('.col.large-3.small-12');
    const relatedWrapper = wrapper?.querySelector('.portfolio-bottom');
    const relatedCard = relatedWrapper?.querySelector('.portfolio-related .col');

    return {
      wrapper: sig(wrapper),
      hero: sig(hero),
      bodyRow: sig(bodyRow),
      sidebar: sig(sidebar),
      sidebarTree: getTree(sidebar),
      relatedWrapper: sig(relatedWrapper),
      relatedCard: sig(relatedCard),
      relatedCardTree: getTree(relatedCard),
    };
  };

  for (const row of [
    {
      url: '/featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/',
      file: 'featured_item/cong-ty-co-phan-phat-trien-cong-nghe-thp/index.html',
    },
    {
      url: '/featured_item/centro-noi-that-cao-cap-centro-chau-au/',
      file: 'featured_item/centro-noi-that-cao-cap-centro-chau-au/index.html',
    },
  ]) {
    test(`${row.url} detail signature matches eras-clone source`, async ({ page }) => {
      test.skip(!hasSource, missingSourceMessage);
      await openSource(page, {
        key: `detail-${row.url}`,
        url: row.url,
        file: row.file,
        family: 'project-detail',
        locale: 'vi',
        reason: 'parity',
      });
      const source = await page.evaluate(detailSignature);
      await page.goto(row.url);
      const sova = await page.evaluate(detailSignature);
      expect(source.wrapper).not.toBeNull();
      expect(sova).toEqual(source);
    });
  }
});
