import { expect, expectNoDuplicateIds, test } from './fixtures';

const SERVICES_ROUTES = [
  {
    locale: 'vi',
    path: '/thiet-ke-app-mobile/',
    heroBannerId: 'banner-2067401347',
    benefitsId: 'section_734451128',
    whyChooseUsId: 'section_1129413203',
    decorId: 'section_667104485',
    testimonialsId: 'section_611504284',
    faqId: 'section_2067065940',
    headingLines: ['Thiết kế App mobile', 'Chuyên Nghiệp'],
    faqCount: 8,
    breadcrumbId: 'text-2027656733',
    breadcrumb: {
      home: 'Trang chủ',
      homeHref: '/',
      text: 'Trang chủ / Dịch vụ / Thiết kế App Mobile',
    },
    imageWrapperId: 'image_984856161',
    sampleItem: 'Tăng tính tiện lợi, cạnh tranh',
  },
  {
    locale: 'en',
    path: '/en/app-mobile-development/',
    heroBannerId: 'banner-476138808',
    benefitsId: 'section_1647811100',
    whyChooseUsId: 'section_1411013231',
    decorId: 'section_2081583834',
    testimonialsId: 'section_1896637792',
    faqId: 'section_703582263',
    headingLines: ['Professional', 'Mobile App Design'],
    faqCount: 9,
    breadcrumbId: 'text-1919501786',
    breadcrumb: {
      home: 'Home',
      homeHref: '/en/home/',
      text: 'Home / Services / App Mobile Development',
    },
    imageWrapperId: 'image_1568157091',
    sampleItem: 'Increased Convenience & Competitiveness',
  },
];

test.describe('Mobile App Service Pages Tracer (Story 5.1)', () => {
  for (const config of SERVICES_ROUTES) {
    test(`Sections render in source order on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      // Section order verification inside main
      const sectionIds = await page.evaluate(() => {
        const main = document.querySelector('main#main');
        if (!main) return [];
        const elements = main.querySelectorAll(':scope > .banner, :scope > section');
        return Array.from(elements).map((el) => el.id);
      });

      expect(sectionIds).toEqual([
        config.heroBannerId,
        config.benefitsId,
        config.whyChooseUsId,
        config.decorId,
        config.testimonialsId,
        config.faqId,
      ]);

      await expectNoDuplicateIds(page);
    });

    test(`Exactly one main h1 with two lines on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const h1s = page.locator('main h1');
      await expect(h1s).toHaveCount(1);

      const typewriterSpans = page.locator('main h1 .typewriter');
      await expect(typewriterSpans).toHaveCount(config.headingLines.length);
      await expect(typewriterSpans).toHaveText(config.headingLines);
    });

    test(`FAQ items count per locale (${config.faqCount}) on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const faqItems = page.locator(`#${config.faqId} .accordion-item`);
      await expect(faqItems).toHaveCount(config.faqCount);

      // First item is open by default
      const firstTrigger = faqItems.first().locator('.accordion-title');
      await expect(firstTrigger).toHaveClass(/active/);

      // Duplicate question ID verification on EN (orders 2 and 3 have unique IDs)
      if (config.locale === 'en') {
        const itemIds = await faqItems.evaluateAll((items) => items.map((i) => i.id));
        const uniqueIds = new Set(itemIds);
        expect(uniqueIds.size).toBe(config.faqCount);
      }
    });

    test(`Hero, benefits and why-choose-us assets render on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const hero = page.locator(`#${config.heroBannerId}`);
      await expect(hero.locator('img.bg[src*="svzd-zdfvx-scaled-1.webp"]')).toHaveCount(1);
      await expect(page.locator(`#${config.imageWrapperId} img`)).toHaveCount(1);

      const breadcrumb = page.locator(`#${config.breadcrumbId}`);
      await expect(breadcrumb).toHaveText(config.breadcrumb.text);
      await expect(breadcrumb.getByRole('link', { name: config.breadcrumb.home })).toHaveAttribute(
        'href',
        config.breadcrumb.homeHref,
      );

      const benefits = page.locator(`#${config.benefitsId}`);
      await expect(benefits.locator('video source[src*="cybervpn.mp4"]')).toHaveCount(1);
      await expect(benefits.locator('.row_ptien .icon-box-img img')).toHaveCount(4);

      const gridCards = page.locator(
        `#${config.whyChooseUsId} .eras-table-price.hide-for-small > .col`,
      );
      await expect(gridCards).toHaveCount(3);
      for (const card of await gridCards.all()) {
        await expect(card.locator('h3')).not.toBeEmpty();
        await expect(card.locator('.icon-box')).toHaveCount(7);
        await expect(card.locator('.icon-box img[src*="Subtract.svg"]')).toHaveCount(7);
        await expect(card.locator('.icon-box-text p')).toHaveCount(7);
      }
      await expect(
        page.locator(`#${config.whyChooseUsId} .eras-table-price.hide-for-small`),
      ).toContainText(config.sampleItem);
    });

    test(`Responsive why-choose-us slider vs grid toggle on ${config.path}`, async ({ page }) => {
      const slider = page.locator('.eras-table-price-slider.slide_tkap');
      const grid = page.locator('.eras-table-price.hide-for-small');

      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(config.path);
      await expect(slider).toBeVisible();
      await expect(grid).toBeHidden();

      await page.setViewportSize({ width: 549, height: 844 });
      await expect(slider).toBeVisible();
      await expect(grid).toBeHidden();

      await page.setViewportSize({ width: 550, height: 844 });
      await expect(grid).toBeVisible();
      await expect(slider).toBeHidden();

      await page.setViewportSize({ width: 1280, height: 800 });
      await expect(grid).toBeVisible();
      await expect(slider).toBeHidden();
    });

    test(`Testimonials renders 3 cards on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const testimonialSlides = page.locator(
        `#${config.testimonialsId} .slide-kh .flickity-slider > *`,
      );
      await expect(testimonialSlides).toHaveCount(3);
    });

    test(`No tab UI ([role=tablist]) on service page on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const tablists = page.locator('[role=tablist]');
      await expect(tablists).toHaveCount(0);
    });
  }

  test('EN duplicate FAQ items open independently without key warnings', async ({ page }) => {
    const keyWarnings: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && /same key/i.test(msg.text())) keyWarnings.push(msg.text());
    });

    await page.goto('/en/app-mobile-development/');
    const items = page.locator('#section_703582263 .accordion-item');
    const second = items.nth(1).locator('.accordion-title');
    const third = items.nth(2).locator('.accordion-title');

    await expect(second).toHaveText(await third.innerText());

    await second.click();
    await expect(second).toHaveClass(/active/);
    await expect(third).not.toHaveClass(/active/);

    await third.click();
    await expect(third).toHaveClass(/active/);
    await expect(second).not.toHaveClass(/active/);

    expect(keyWarnings).toEqual([]);
  });
});

const TABLE_SERVICE_ROUTES = [
  {
    key: 'hosting',
    locale: 'vi',
    path: '/hosting-doanh-nghiep/',
    sectionIds: [
      'banner-998365047',
      'section_1575376699',
      'section_2022484527',
      'section_601922759',
      'section_2047789767',
    ],
    headingLines: ['Dịch vụ', 'Business Hosting'],
    pricingTitle: 'Bảng giá dịch vụ',
    benefitsTitle: 'Sử dụng dịch vụ của Sova',
    rows: 8,
    columns: 8,
    faqCount: 10,
    icons: 6,
    iconWidths: ['78px', '78px', '78px', '78px', '78px', '78px'],
  },
  {
    key: 'hosting',
    locale: 'en',
    path: '/en/business-hosting/',
    sectionIds: [
      'banner-1497056567',
      'section_594539523',
      'section_1382323701',
      'section_1341923526',
      'section_748910381',
    ],
    headingLines: ['Business Hosting', 'Service'],
    pricingTitle: 'Business Hosting Pricing',
    benefitsTitle: 'Sova’s Email Service ?',
    rows: 8,
    columns: 8,
    faqCount: 10,
    icons: 6,
    iconWidths: ['78px', '78px', '78px', '78px', '78px', '78px'],
  },
  {
    key: 'vps',
    locale: 'vi',
    path: '/vps-doanh-nghiep/',
    sectionIds: [
      'banner-52976556',
      'section_887597801',
      'section_753586130',
      'section_2083222755',
      'section_630471639',
    ],
    headingLines: ['Dịch vụ', 'Cloud VPS'],
    pricingTitle: 'Bảng giá dịch vụ',
    benefitsTitle: 'Sử dụng dịch vụ của Sova',
    rows: 6,
    columns: 8,
    faqCount: 12,
    icons: 5,
    iconWidths: ['78px', '78px', '94px', '79px', '80px', '78px'],
  },
  {
    key: 'vps',
    locale: 'en',
    path: '/en/business-vps/',
    sectionIds: [
      'banner-1956119831',
      'section_932558823',
      'section_349332889',
      'section_1606797624',
      'section_681289048',
    ],
    headingLines: ['Cloud VPS', 'Service'],
    // EN source copy errors kept as-is.
    pricingTitle: 'Business Hosting Pricing',
    benefitsTitle: 'Sova’s Email Service ?',
    rows: 6,
    columns: 8,
    faqCount: 12,
    icons: 5,
    iconWidths: ['78px', '78px', '94px', '79px', '80px', '78px'],
  },
  {
    key: 'email',
    locale: 'vi',
    path: '/e-mail-doanh-nghiep/',
    sectionIds: [
      'banner-880688064',
      'section_1723121385',
      'section_136281833',
      'section_1984183481',
      'section_630184286',
    ],
    headingLines: ['Dịch vụ', 'Email doanh nghiệp'],
    pricingTitle: 'Bảng giá dịch vụ',
    benefitsTitle: 'Sử dụng dịch vụ tại Sova',
    rows: 7,
    columns: 7,
    faqCount: 9,
    icons: 6,
    iconWidths: ['60px', '60px', '75px', '60px', '60px', '60px'],
  },
  {
    key: 'email',
    locale: 'en',
    path: '/en/business-e-mail/',
    sectionIds: [
      'banner-782456447',
      'section_1607043033',
      'section_676662741',
      'section_2136010649',
      'section_1417737979',
    ],
    headingLines: ['Business', 'Email Service'],
    pricingTitle: 'Service Pricing Table',
    benefitsTitle: 'Sova’s Email Service ?',
    rows: 5,
    columns: 7,
    faqCount: 9,
    icons: 6,
    iconWidths: ['60px', '60px', '75px', '60px', '60px', '60px'],
  },
] as const;

test.describe('Hosting, VPS, and Email service pages', () => {
  for (const config of TABLE_SERVICE_ROUTES) {
    test(`Sections, h1, table, cards, testimonials and FAQ on ${config.path}`, async ({ page }) => {
      const { hostingPricing } = await import('../../src/data/pricing/hosting');
      const { vpsPricing } = await import('../../src/data/pricing/vps');
      const { emailPricing } = await import('../../src/data/pricing/email');
      const pricingMap = { hosting: hostingPricing, vps: vpsPricing, email: emailPricing };
      const pricing = pricingMap[config.key].find((p) => p.locale === config.locale);
      if (pricing?.kind !== 'table') throw new Error('table pricing missing');

      await page.goto(config.path);

      const sectionIds = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('main#main > .banner, main#main > section'),
          (el) => el.id,
        ),
      );
      expect(sectionIds).toEqual(config.sectionIds);
      await expectNoDuplicateIds(page);

      // No benefits video, projects, upgrade-triggers, or why-choose-us sections.
      await expect(page.locator('main video')).toHaveCount(0);
      await expect(page.locator('main .ss-decor')).toHaveCount(0);
      await expect(page.locator('main .eras-table-price')).toHaveCount(0);
      await expect(page.locator('main .vps-actions')).toHaveCount(0);
      await expect(page.locator('main .vps-btn-config')).toHaveCount(0);
      await expect(page.locator('main [id*="popup"]')).toHaveCount(0);
      await expect(page.locator('[role=tablist]')).toHaveCount(0);

      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main h1 .typewriter')).toHaveText([...config.headingLines]);

      const [, pricingId, iconsId, testimonialsId, faqId] = config.sectionIds;
      await expect(page.locator(`#${pricingId} h2`)).toHaveText(config.pricingTitle);
      const table = page.locator(`#${pricingId} .vps-table-wrapper > table.vps-table`);
      await expect(table.locator('thead th')).toHaveText(pricing.columns.map((c) => c.label));
      const rows = table.locator('tbody tr');
      await expect(rows).toHaveCount(config.rows);
      for (const [i, plan] of pricing.plans.entries()) {
        const row = rows.nth(i);
        await expect(row.locator('td')).toHaveCount(config.columns);
        await expect(row.locator('td').first()).toHaveText(plan.name);
        await expect(row.locator('td.vps-price')).toHaveText(plan.price!.displayText);
        const cta = row.locator('td:last-child a.vps-btn');
        await expect(cta).toHaveAttribute('href', /^https:\/\//);
        await expect(cta).toHaveAttribute('target', '_blank');
        await expect(cta.locator('span')).toHaveText(plan.cta.label);
      }

      const icons = page.locator(`#${iconsId}`);
      await expect(icons).toHaveClass(/ss-ndv-seo/);
      await expect(
        icons.locator('img.bg[src*="b64598d7e18308083c456d32c69bae66.webp"]'),
      ).toHaveCount(1);
      await expect(icons.locator('h2')).toHaveText(config.benefitsTitle);
      await expect(icons.locator('.row_ptien > .col')).toHaveCount(6);
      await expect(icons.locator('.row_ptien .icon-box-img img')).toHaveCount(config.icons);
      expect(
        await icons
          .locator('.row_ptien .icon-box-img')
          .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.width)),
      ).toEqual(config.iconWidths);

      await expect(page.locator(`#${testimonialsId} .slide-kh .flickity-slider > *`)).toHaveCount(
        3,
      );

      const faqItems = page.locator(`#${faqId} .accordion.ac-luutru .accordion-item`);
      await expect(faqItems).toHaveCount(config.faqCount);
      await expect(faqItems.first().locator('.accordion-title')).toHaveClass(/active/);
    });

    test(`Hero assets and breadcrumb on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);
      const hero = page.locator(`#${config.sectionIds[0]}`);
      const bg =
        config.key === 'hosting'
          ? 'freepikvdfvdf_2704716-scaled-1-1.webp'
          : config.key === 'vps'
            ? 'anh-nen-1.webp'
            : 'zdvdxf-xdbfd-scaled-1.webp';
      await expect(hero.locator(`img.bg[src*="${bg}"]`)).toHaveCount(1);
      await expect(hero.locator('.img-inner img')).toHaveCount(1);
      if (config.key === 'email') {
        await expect(
          hero.getByRole('link', {
            name: config.locale === 'vi' ? 'Trang chủ' : 'Home',
          }),
        ).toHaveAttribute('href', config.locale === 'vi' ? '/' : '/en/home/');
        const crumbs = hero.locator(
          `#${config.locale === 'vi' ? 'text-951094996' : 'text-2322921990'}`,
        );
        await expect(crumbs).toContainText(
          config.locale === 'vi' ? 'Dịch vụ / Email Business' : 'Services / Email Business',
        );
        await expect(crumbs.locator('a')).toHaveCount(1);
        await expect(
          hero.locator(`#${config.locale === 'vi' ? 'gap-2007649633' : 'gap-1782042057'}`),
        ).toHaveClass('gap-element clearfix show-for-small');
      } else {
        await expect(
          hero.getByRole('link', {
            name: config.locale === 'vi' ? 'Giải pháp lưu trữ' : 'Storage solutions',
          }),
        ).toHaveAttribute(
          'href',
          config.locale === 'vi' ? '/giai-phap-luu-tru/' : '/en/storage-solution/',
        );
      }
    });

    test(`Table scrolls inside its wrapper, never the page, on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549, 768]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);
        const metrics = await page.evaluate(() => {
          const wrapper = document.querySelector<HTMLElement>('.vps-table-wrapper')!;
          const lastCell = wrapper.querySelector('tbody tr td:last-child')!;
          wrapper.scrollLeft = wrapper.scrollWidth;
          const cell = lastCell.getBoundingClientRect();
          const box = wrapper.getBoundingClientRect();
          return {
            page: document.documentElement.scrollWidth - window.innerWidth,
            scrollable: wrapper.scrollWidth > wrapper.clientWidth,
            lastCellReachable: cell.right <= box.right + 1 && cell.left >= box.left - 1,
          };
        });
        expect(metrics, `${width}px`).toEqual({
          page: 0,
          scrollable: true,
          lastCellReachable: true,
        });
      }
    });
  }
});
