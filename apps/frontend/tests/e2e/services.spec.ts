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

const STORAGE_SERVICE_ROUTES = [
  {
    locale: 'vi',
    path: '/giai-phap-luu-tru/',
    sectionIds: [
      'banner-1255492643',
      'section_1644279447',
      'section_1086282974',
      'section_1048537414',
      'section_1489580969',
    ],
    headingLines: ['Giải pháp lưu trữ', 'cho doanh nghiệp'],
    eyebrow: 'Sova cung cấp',
    title: 'Các dịch vụ lưu trữ',
    faqEyebrow: { id: 'text-1409335333', text: 'GIẢI ĐÁP' },
    decoImageId: 'image_1886760630',
    heroSmallGaps: ['gap-1295344278', 'gap-161076987'],
    routes: ['/hosting-doanh-nghiep/', '/vps-doanh-nghiep/', '/e-mail-doanh-nghiep/'],
    slideTitles: ['Business hosting', 'Cloud VPS', 'E-mail doanh nghiệp'],
    faqCount: 4,
  },
  {
    locale: 'en',
    path: '/en/storage-solution/',
    sectionIds: [
      'banner-964121618',
      'section_475696028',
      'section_674888486',
      'section_2078920882',
      'section_1266521913',
    ],
    headingLines: ['Business', 'Storage Solutions'],
    eyebrow: 'Sova provides',
    title: 'Storage Services',
    faqEyebrow: { id: 'text-4251296495', text: 'FAQs' },
    decoImageId: 'image_1222782848',
    heroSmallGaps: ['gap-474200673', 'gap-2132235472'],
    routes: ['/en/business-hosting/', '/en/business-vps/', '/en/business-e-mail/'],
    slideTitles: ['Business hosting', 'Cloud VPS', 'Business Email'],
    faqCount: 4,
  },
] as const;

test.describe('Storage service pages (Story 5.4)', () => {
  for (const config of STORAGE_SERVICE_ROUTES) {
    test(`Section order, h1, cards, testimonials and FAQ on ${config.path}`, async ({ page }) => {
      const { storageServices } = await import('../../src/data/services/storage');
      const service = storageServices.find((s) => s.locale === config.locale);
      if (!service) throw new Error('storage service missing');

      await page.goto(config.path);

      const sectionIds = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('main#main > .banner, main#main > section'),
          (el) => el.id,
        ),
      );
      expect(sectionIds).toEqual(config.sectionIds);
      await expectNoDuplicateIds(page);

      // No pricing table, benefits video or marquee markup.
      await expect(page.locator('main table')).toHaveCount(0);
      await expect(page.locator('main video')).toHaveCount(0);
      await expect(page.locator('main .ss-ndv-seo')).toHaveCount(0);
      await expect(page.locator('main .cs-moving_text')).toHaveCount(0);
      await expect(page.locator('[role=tablist]')).toHaveCount(0);

      // Projects slot is present and empty.
      const projectsSlot = page.locator(`#${config.sectionIds[2]}`);
      await expect(projectsSlot).toHaveClass(/ss-decor/);

      // H1 heading lines
      await expect(page.locator('main h1')).toHaveCount(1);
      await expect(page.locator('main h1 .typewriter')).toHaveText([...config.headingLines]);

      // Offerings section
      const offerings = page.locator(`#${config.sectionIds[1]}`);
      await expect(offerings).toContainText(config.eyebrow);
      await expect(offerings.locator('h2')).toHaveText(config.title);
      await expect(
        offerings.locator(`#${config.decoImageId} img[src*="Deco-1-6.svg"]`),
      ).toHaveCount(1);
      const gridCards = offerings.locator('.eras-table-price > .col');
      await expect(gridCards).toHaveCount(3);

      for (let i = 0; i < 3; i++) {
        const card = gridCards.nth(i);
        const offering = service.offerings[i];
        await expect(card.locator('h3')).toHaveText(offering.title);
        await expect(card.locator('.icon-box')).toHaveCount(7);
        await expect(card.locator('.icon-box h5')).toHaveText(offering.items ?? []);
        const cta = card.locator('p a.but-lh');
        await expect(cta).toHaveAttribute('href', config.routes[i]);
      }

      // Testimonials (3 slides)
      await expect(
        page.locator(`#${config.sectionIds[3]} .slide-kh .flickity-slider > *`),
      ).toHaveCount(3);

      // FAQ (4 items, first open)
      const faqItems = page.locator(
        `#${config.sectionIds[4]} .accordion.ac-luutru .accordion-item`,
      );
      await expect(faqItems).toHaveCount(config.faqCount);
      await expect(faqItems.first().locator('.accordion-title')).toHaveClass(/active/);
      await expect(page.locator(`#${config.faqEyebrow.id}`)).toHaveText(config.faqEyebrow.text);
    });

    test(`Hero assets and breadcrumb on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);
      const hero = page.locator(`#${config.sectionIds[0]}`);
      await expect(
        hero.locator('img.bg[src*="de729be13c98f6a585c5656f0ce73db4-1.webp"]'),
      ).toHaveCount(1);
      await expect(hero.locator('.img-inner img[src*="image-71.svg"]')).toHaveCount(1);
      for (const gapId of config.heroSmallGaps) {
        await expect(hero.locator(`#${gapId}`)).toHaveClass('gap-element clearfix show-for-small');
      }

      const breadcrumb = hero.locator(
        `#${config.locale === 'vi' ? 'text-445793396' : 'text-1244128777'}`,
      );
      await expect(breadcrumb).toContainText(
        config.locale === 'vi'
          ? 'Trang chủ / Dịch vụ / Giải pháp lưu trữ'
          : 'Home / Services / Storage solutions',
      );
      await expect(
        hero.getByRole('link', {
          name: config.locale === 'vi' ? 'Trang chủ' : 'Home',
        }),
      ).toHaveAttribute('href', config.locale === 'vi' ? '/' : '/en/home/');
    });

    test(`Grid hidden and slider visible at mobile viewports with no page scroll on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);

        const offerings = page.locator(`#${config.sectionIds[1]}`);
        const grid = offerings.locator('.eras-table-price.hide-for-small');
        const slider = offerings.locator('.eras-table-price-slider.show-for-small');

        await expect(grid).toBeHidden();
        await expect(slider).toBeVisible();

        // 3 slides in carousel
        const slides = slider.locator('.flickity-slider > .row');
        await expect(slides).toHaveCount(3);
        for (let i = 0; i < 3; i++) {
          const slide = slides.nth(i);
          await expect(slide.locator('h3')).toHaveText(config.slideTitles[i]);
          await expect(slide.locator('.icon-box')).toHaveCount(7);
          const cta = slide.locator('p a.but-lh');
          await expect(cta).toHaveAttribute('href', config.routes[i]);
        }

        // Carousel dots and arrows present
        await expect(slider.locator('.flickity-page-dots')).toBeVisible();
        await expect(slider.locator('.flickity-prev-next-button')).toHaveCount(2);

        // No horizontal page scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `${width}px scrollWidth <= innerWidth`).toBeLessThanOrEqual(innerWidth);
      }

      // At >= 550px: slider hidden, grid visible
      await page.setViewportSize({ width: 550, height: 844 });
      await page.goto(config.path);
      const offerings550 = page.locator(`#${config.sectionIds[1]}`);
      await expect(offerings550.locator('.eras-table-price.hide-for-small')).toBeVisible();
      await expect(offerings550.locator('.eras-table-price-slider.show-for-small')).toBeHidden();
    });
  }

  test.describe('Carousel wrap guard (retro A4)', () => {
    test.beforeEach(async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
    });

    test('mobile slider (slide_tkap) wraps next and prev at 390px with both arrows enabled', async ({
      page,
    }) => {
      await page.goto('/thiet-ke-app-mobile/');
      const slider = page.locator('.eras-table-price-slider.slide_tkap');
      await expect(slider).toBeVisible();

      const prevBtn = slider.locator('.flickity-prev-next-button.previous');
      const nextBtn = slider.locator('.flickity-prev-next-button.next');
      const slides = slider.locator('.flickity-slider > .row');
      const slideCount = await slides.count();
      expect(slideCount).toBe(3);

      // Both arrows stay enabled (DOM attribute check; elements have display:none on mobile per Flatsome CSS)
      await expect(prevBtn).toBeAttached();
      await expect(nextBtn).toBeAttached();
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();

      // Initially slide 0 is selected
      await expect(slides.nth(0)).toHaveClass(/is-selected/);

      // Prev on slide 0 goes to last slide (slide 2)
      await prevBtn.dispatchEvent('click');
      await expect(slides.nth(slideCount - 1)).toHaveClass(/is-selected/);
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();

      // Next on last slide wraps to slide 0
      await nextBtn.dispatchEvent('click');
      await expect(slides.nth(0)).toHaveClass(/is-selected/);
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();
    });

    test('storage slider (slide_gplt) wraps next and prev at 390px with both arrows enabled', async ({
      page,
    }) => {
      await page.goto('/giai-phap-luu-tru/');
      const slider = page.locator('.eras-table-price-slider.slide_gplt');
      await expect(slider).toBeVisible();

      const prevBtn = slider.locator('.flickity-prev-next-button.previous');
      const nextBtn = slider.locator('.flickity-prev-next-button.next');
      const slides = slider.locator('.flickity-slider > .row');
      const slideCount = await slides.count();
      expect(slideCount).toBe(3);

      // Both arrows stay enabled (DOM attribute check; elements have display:none on mobile per Flatsome CSS)
      await expect(prevBtn).toBeAttached();
      await expect(nextBtn).toBeAttached();
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();

      // Initially slide 0 is selected
      await expect(slides.nth(0)).toHaveClass(/is-selected/);

      // Prev on slide 0 goes to last slide (slide 2)
      await prevBtn.dispatchEvent('click');
      await expect(slides.nth(slideCount - 1)).toHaveClass(/is-selected/);
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();

      // Next on last slide wraps to slide 0
      await nextBtn.dispatchEvent('click');
      await expect(slides.nth(0)).toHaveClass(/is-selected/);
      await expect(prevBtn).toBeEnabled();
      await expect(nextBtn).toBeEnabled();
    });

    for (const path of ['/seo-tu-khoa-website/', '/en/website-keyword-seo/']) {
      test(`seo slider (slide_seo) wraps next and prev at 390px with both arrows enabled on ${path}`, async ({
        page,
      }) => {
        await page.goto(path);
        const slider = page.locator('.eras-table-price-slider.slide_seo');
        await expect(slider).toBeVisible();

        const prevBtn = slider.locator('.flickity-prev-next-button.previous');
        const nextBtn = slider.locator('.flickity-prev-next-button.next');
        const slides = slider.locator('.flickity-slider > .row');
        const slideCount = await slides.count();
        expect(slideCount).toBe(4);

        // Both arrows stay enabled (DOM attribute check; elements have display:none on mobile per Flatsome CSS)
        await expect(prevBtn).toBeAttached();
        await expect(nextBtn).toBeAttached();
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();

        // Initially slide 0 is selected
        await expect(slides.nth(0)).toHaveClass(/is-selected/);

        // Prev on slide 0 goes to last slide (slide 3)
        await prevBtn.dispatchEvent('click');
        await expect(slides.nth(slideCount - 1)).toHaveClass(/is-selected/);
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();

        // Next on last slide wraps to slide 0
        await nextBtn.dispatchEvent('click');
        await expect(slides.nth(0)).toHaveClass(/is-selected/);
        await expect(prevBtn).toBeEnabled();
        await expect(nextBtn).toBeEnabled();
      });
    }
  });
});

const SEO_SERVICES_ROUTES = [
  {
    locale: 'vi',
    path: '/seo-tu-khoa-website/',
    sectionIds: [
      'banner-1838497058',
      'section_922596210',
      'section_148064088',
      'section_1443166173',
      'section_994856196',
      'section_1595200881',
    ],
    headingLines: ['Dịch vụ SEO TOP', 'từ khoá website'],
    breadcrumb: 'Trang chủ / Dịch vụ / Seo từ khoá Website',
    homeHref: '/',
    homeLabel: 'Trang chủ',
    breadcrumbId: 'text-639428615',
    topGapId: 'gap-463430753',
    heroCtaId: 'text-1784037823',
    ctaIconCount: 1,
    offeringsTitleId: 'text-1492573675',
    faqEyebrowId: 'text-1069659283',
    faqEyebrow: 'GIẢI ĐÁP',
    advantagesEyebrow: 'Dịch vụ SEO website',
    advantagesTitle: 'Lợi thế khi chọn dịch vụ SEO của chúng tôi',
    advantageTitles: [
      'Tăng thứ hạng bền vững trên Google',
      'Tối ưu SEO toàn diện (Onpage & Offpage)',
      'Báo cáo & theo dõi minh bạch',
      'Đội ngũ chuyên gia giàu kinh nghiệm',
    ],
    offeringsEyebrow: 'Những dịch vụ',
    // Source splits the VI title with <br>.
    offeringsTitle: 'SEO top Google tại\nSova',
    packageTitles: [
      'SEO ONPAGE',
      'SEO OFFPAGE',
      'CHĂM SÓC WEBSITE',
      'CONTENT WRITER',
    ],
    faqCount: 8,
  },
  {
    locale: 'en',
    path: '/en/website-keyword-seo/',
    sectionIds: [
      'banner-1245691485',
      'section_1367982414',
      'section_1771281465',
      'section_1303915883',
      'section_1195289173',
      'section_1520280801',
    ],
    headingLines: ['Top-Ranking', 'SEO Services'],
    breadcrumb: 'Home / Services / Website keyword SEO',
    homeHref: '/en/',
    homeLabel: 'Home',
    breadcrumbId: 'text-4167340980',
    topGapId: 'gap-716151157',
    heroCtaId: 'text-2349830623',
    ctaIconCount: 0,
    offeringsTitleId: 'text-3610428661',
    faqEyebrowId: 'text-712709189',
    faqEyebrow: 'FAQs',
    advantagesEyebrow: 'Website Keyword SEO',
    advantagesTitle: 'Advantages of Choosing Our SEO Services',
    advantageTitles: [
      'Achieve Sustainable Google Rankings',
      'Comprehensive SEO Optimization',
      'Transparent Reporting & Monitoring',
      'Experienced SEO Experts',
    ],
    offeringsEyebrow: 'Services',
    offeringsTitle: 'SEO top Google at Sova',
    packageTitles: [
      'SEO ONPAGE',
      'SEO OFFPAGE',
      'WEBSITE MAINTENANCE',
      'CONTENT WRITER',
    ],
    faqCount: 8,
  },
];

test.describe('SEO Service Pages (Story 5.5)', () => {
  for (const config of SEO_SERVICES_ROUTES) {
    test(`Sections render in source order and structure on ${config.path}`, async ({ page }) => {
      const { seoServices } = await import('../../src/data/services/seo');
      const { siteSettings } = await import('../../src/data/site');
      const zaloHref = siteSettings.find((x) => x.locale === config.locale)?.zaloHref;
      const service = seoServices.find((s) => s.locale === config.locale);
      if (!service) throw new Error('seo service missing');

      await page.goto(config.path);

      // Section order verification inside main
      const sectionIds = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('main#main > .banner, main#main > section'),
          (el) => el.id,
        ),
      );
      expect(sectionIds).toEqual(config.sectionIds);
      await expectNoDuplicateIds(page);

      // No tablist, video, or table
      await expect(page.locator('[role=tablist]')).toHaveCount(0);
      await expect(page.locator('main table')).toHaveCount(0);
      await expect(page.locator('main video')).toHaveCount(0);

      // Projects slot is present and empty ss-decor
      const projectsSlot = page.locator(`#${config.sectionIds[3]}`);
      await expect(projectsSlot).toHaveClass(/ss-decor/);

      // H1 heading lines with typewriter
      const h1 = page.locator('main h1');
      await expect(h1).toHaveCount(1);
      await expect(h1.locator('.typewriter')).toHaveText(config.headingLines);

      // Hero breadcrumb
      const breadcrumb = page.locator(`#${config.breadcrumbId}`);
      await expect(breadcrumb).toContainText(config.breadcrumb);
      await expect(
        breadcrumb.getByRole('link', { name: config.homeLabel }),
      ).toHaveAttribute('href', config.homeHref);

      // Hero: top gap is mobile-only; VI CTA carries the Vector-Stroke arrow, EN has none
      await expect(page.locator(`#${config.topGapId}`)).toHaveClass(
        'gap-element clearfix show-for-small',
      );
      await expect(
        page.locator(`#${config.heroCtaId} a.but-lh img[src*="Vector-Stroke.svg"]`),
      ).toHaveCount(config.ctaIconCount);

      // Advantages section: 4 cards with titles
      const advantagesSection = page.locator(`#${config.sectionIds[1]}`);
      await expect(advantagesSection).toContainText(config.advantagesEyebrow);
      await expect(
        advantagesSection.locator(config.locale === 'en' ? 'h3' : 'h2').first(),
      ).toHaveText(config.advantagesTitle);
      const advantageCards = advantagesSection.locator('.row.align-equal > .col');
      await expect(advantageCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(advantageCards.nth(i).locator('h3')).toHaveText(config.advantageTitles[i]);
      }

      // Package cards desktop grid: 4 package cards
      const packagesSection = page.locator(`#${config.sectionIds[2]}`);
      await expect(packagesSection).toContainText(config.offeringsEyebrow);
      expect(await packagesSection.locator(`#${config.offeringsTitleId} h2`).innerText()).toBe(
        config.offeringsTitle,
      );
      const gridCards = packagesSection.locator('.eras-table-price > .col');
      await expect(gridCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const card = gridCards.nth(i);
        const offering = service.offerings[i];
        await expect(card.locator('h2')).toHaveText(config.packageTitles[i]);
        await expect(card.locator('.text p')).toHaveText(offering.description ?? '');
        await expect(card.locator('.icon-box h5')).toHaveText(offering.items ?? []);
        await expect(card.locator('p a.but-lh')).toHaveAttribute('href', zaloHref!);
      }

      // Testimonials (3 slides)
      await expect(
        page.locator(`#${config.sectionIds[4]} .slide-kh .flickity-slider > *`),
      ).toHaveCount(3);

      // FAQ items count per locale (8 items, first open)
      const faqSection = page.locator(`#${config.sectionIds[5]}`);
      await expect(faqSection.locator(`#${config.faqEyebrowId}`)).toHaveText(config.faqEyebrow);
      const faqItems = faqSection.locator('.accordion-item');
      await expect(faqItems).toHaveCount(config.faqCount);
      await expect(faqItems.first().locator('.accordion-title')).toHaveClass(/active/);

      // A05 check on VI item 7: answer text contains literal </p
      if (config.locale === 'vi') {
        const item7Answer = faqItems.nth(6).locator('.accordion-inner');
        await expect(item7Answer).toContainText('</p');
      }
    });

    test(`Grid hidden and slider visible at mobile viewports with no page scroll on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);

        const offerings = page.locator(`#${config.sectionIds[2]}`);
        const grid = offerings.locator('.eras-table-price.hide-for-small');
        const slider = offerings.locator('.eras-table-price-slider.slide_seo');

        await expect(grid).toBeHidden();
        await expect(slider).toBeVisible();

        // 4 slides in carousel
        const slides = slider.locator('.flickity-slider > .row');
        await expect(slides).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
          const slide = slides.nth(i);
          await expect(slide.locator('h2')).toHaveText(config.packageTitles[i]);
        }

        // Carousel dots and arrows present
        await expect(slider.locator('.flickity-page-dots')).toBeVisible();
        await expect(slider.locator('.flickity-prev-next-button')).toHaveCount(2);

        // No horizontal page scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `${width}px scrollWidth <= innerWidth`).toBeLessThanOrEqual(innerWidth);
      }

      // At >= 550px: slider hidden, grid visible
      await page.setViewportSize({ width: 550, height: 844 });
      await page.goto(config.path);
      const offerings550 = page.locator(`#${config.sectionIds[2]}`);
      await expect(offerings550.locator('.eras-table-price.hide-for-small')).toBeVisible();
      await expect(offerings550.locator('.eras-table-price-slider.slide_seo')).toBeHidden();
    });
  }
});

const BRANDING_SERVICES_ROUTES = [
  {
    locale: 'vi',
    path: '/ui-ux-branding-design/',
    sectionIds: [
      'banner-5834555',
      'section_1240484658',
      'section_282263172',
      'section_2117777695',
      'section_1502022357',
      'section_1909361623',
    ],
    headingLines: ['UI/UX,', 'Branding Design'],
    breadcrumb: 'Trang chủ / Dịch vụ / UI/UX, Branding Design',
    homeHref: '/',
    homeLabel: 'Trang chủ',
    breadcrumbId: 'text-427293232',
    heroCtaId: 'text-3358106738',
    advantagesTopGapId: 'gap-1534842904',
    decoImageId: 'image_1727408718',
    offeringsTitleId: 'text-2802465451',
    faqEyebrowId: 'text-1109536633',
    faqEyebrow: 'GIẢI ĐÁP',
    advantagesEyebrow: 'Dịch vụ thiết kế UI/UX',
    advantagesTitle: 'Tại Sova',
    advantagesSubtitle: 'Chúng tôi thiết kế dựa trên cốt lõi văn hóa doanh nghiệp',
    advantageTitles: [
      'Nghiên cứu văn hoá doanh nghiệp',
      'Thiết kế trải nghiệm doanh nghiệp',
      'Phát triển chiến lược sản phẩm',
      'Tạo dựng giá trị bền vững',
    ],
    offeringsEyebrow: 'Những dịch vụ',
    offeringsTitle: 'Thiết kế UI/UX\ntại Sova',
    packageTitles: [
      'THIẾT KẾ LOGO THƯƠNG HIỆU',
      'THIẾT KẾ UI/UX WEB/APP',
      'THIẾT KẾ NHẬN DIỆN THƯƠNG HIỆU',
      'THIẾT KẾ NHẬN DIỆN TẠI ĐIỂM BÁN',
    ],
    faqCount: 10,
  },
  {
    locale: 'en',
    path: '/en/ui-ux-branding-design-2/',
    sectionIds: [
      'banner-1642333106',
      'section_1111233762',
      'section_879951789',
      'section_1698149091',
      'section_1058517608',
      'section_1106628234',
    ],
    headingLines: ['UI/UX,', 'Branding Design'],
    breadcrumb: 'Home / Services / UI/UX, Branding Design',
    homeHref: '/en/',
    homeLabel: 'Home',
    breadcrumbId: 'text-931641378',
    heroCtaId: 'text-1083235922',
    advantagesTopGapId: 'gap-313452462',
    decoImageId: 'image_1583733878',
    offeringsTitleId: 'text-1082219404',
    faqEyebrowId: 'text-3191336055',
    faqEyebrow: 'FAQs',
    advantagesEyebrow: 'UI/UX Design Service',
    advantagesTitle: 'At Sova',
    advantagesSubtitle: 'We design with your corporate culture at the core',
    advantageTitles: [
      'Corporate Culture Research',
      'Enterprise Experience Design',
      'Product Strategy Development',
      'Building Sustainable Value',
    ],
    offeringsEyebrow: 'Services',
    offeringsTitle: 'UI/UX Design at Sova',
    packageTitles: [
      'BRAND LOGO DESIGN',
      'UI/UX DESIGN FOR WEB & APP',
      'BRAND IDENTITY DESIGN',
      'RETAIL BRAND IDENTITY DESIGN',
    ],
    faqCount: 10,
  },
];

test.describe('Branding Service Pages (Story 5.6)', () => {
  for (const config of BRANDING_SERVICES_ROUTES) {
    test(`Sections render in source order and structure on ${config.path}`, async ({ page }) => {
      const { brandingServices } = await import('../../src/data/services/branding');
      const { siteSettings } = await import('../../src/data/site');
      const zaloHref = siteSettings.find((x) => x.locale === config.locale)?.zaloHref;
      const service = brandingServices.find((s) => s.locale === config.locale);
      if (!service) throw new Error('branding service missing');

      await page.goto(config.path);

      // Section order verification inside main
      const sectionIds = await page.evaluate(() =>
        Array.from(
          document.querySelectorAll('main#main > .banner, main#main > section'),
          (el) => el.id,
        ),
      );
      expect(sectionIds).toEqual(config.sectionIds);
      await expectNoDuplicateIds(page);

      // No tablist, 0 tables
      await expect(page.locator('[role=tablist]')).toHaveCount(0);
      await expect(page.locator('main table')).toHaveCount(0);

      // Video banner present in advantages
      await expect(page.locator('main video')).toHaveCount(1);

      // Projects slot is present and empty ss-decor
      const projectsSlot = page.locator(`#${config.sectionIds[3]}`);
      await expect(projectsSlot).toHaveClass(/ss-decor/);

      // H1 heading lines with typewriter
      const h1 = page.locator('main h1');
      await expect(h1).toHaveCount(1);
      await expect(h1.locator('.typewriter')).toHaveText(config.headingLines);

      // Hero breadcrumb
      const breadcrumb = page.locator(`#${config.breadcrumbId}`);
      await expect(breadcrumb).toContainText(config.breadcrumb);
      await expect(
        breadcrumb.getByRole('link', { name: config.homeLabel }),
      ).toHaveAttribute('href', config.homeHref);

      // Hero CTA (no icon) and background image
      const heroCta = page.locator(`#${config.heroCtaId} a.but-lh`);
      await expect(heroCta).toHaveAttribute('href', service.hero.cta!.href);
      await expect(heroCta).toHaveText(service.hero.cta!.label);
      await expect(heroCta.locator('img')).toHaveCount(0);
      const heroBg = page.locator(
        `#${config.sectionIds[0]} .banner-bg img.bg[src*="scdscszdcs-scaled-1.webp"]`,
      );
      await expect(heroBg).toHaveCount(1);
      await expect
        .poll(() => heroBg.evaluate((img: HTMLImageElement) => img.naturalWidth))
        .toBeGreaterThan(0);

      // Advantages section: heading, subtitle, deco, video, and 4 cards with titles
      const advantagesSection = page.locator(`#${config.sectionIds[1]}`);
      await expect(page.locator(`#${config.advantagesTopGapId}`)).toHaveClass(
        'gap-element clearfix hide-for-small',
      );
      await expect(
        advantagesSection.locator(`#${config.decoImageId} img[src*="Deco-1-6.svg"]`),
      ).toHaveCount(1);
      await expect(advantagesSection).toContainText(config.advantagesEyebrow);
      await expect(advantagesSection.locator('h2').first()).toHaveText(config.advantagesTitle);
      await expect(advantagesSection).toContainText(config.advantagesSubtitle);

      const advantageCards = advantagesSection.locator('.row.align-equal > .col');
      await expect(advantageCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(advantageCards.nth(i).locator('h3')).toHaveText(config.advantageTitles[i]);
      }
      expect(
        await advantageCards
          .locator('.icon-box-img')
          .evaluateAll((els) => els.map((el) => (el as HTMLElement).style.width)),
      ).toEqual(['80px', '79px', '80px', '80px']);

      // Package cards desktop grid: 4 package cards (item counts: 7, 7, 7, 5)
      const packagesSection = page.locator(`#${config.sectionIds[2]}`);
      await expect(packagesSection).toContainText(config.offeringsEyebrow);
      await expect(
        packagesSection.locator('.section-bg img[src*="b64598d7e18308083c456d32c69bae66.webp"]'),
      ).toHaveCount(1);
      expect(await packagesSection.locator(`#${config.offeringsTitleId} h2`).innerText()).toBe(
        config.offeringsTitle,
      );
      const gridCards = packagesSection.locator('.eras-table-price > .col');
      await expect(gridCards).toHaveCount(4);
      const expectedItemCounts = [7, 7, 7, 5];
      for (let i = 0; i < 4; i++) {
        const card = gridCards.nth(i);
        const offering = service.offerings[i];
        await expect(card.locator('h3')).toHaveText(config.packageTitles[i]);
        await expect(card.locator('.text p')).toHaveText(offering.description ?? '');
        await expect(card.locator('.icon-box h5')).toHaveText(offering.items ?? []);
        await expect(card.locator('.icon-box h5')).toHaveCount(expectedItemCounts[i]);
        await expect(card.locator('p a.but-lh')).toHaveAttribute('href', zaloHref!);
      }

      // Testimonials (3 slides)
      await expect(
        page.locator(`#${config.sectionIds[4]} .slide-kh .flickity-slider > *`),
      ).toHaveCount(3);

      // FAQ items count per locale (10 items, first open)
      const faqSection = page.locator(`#${config.sectionIds[5]}`);
      await expect(faqSection.locator(`#${config.faqEyebrowId}`)).toHaveText(config.faqEyebrow);
      const faqItems = faqSection.locator('.accordion-item');
      await expect(faqItems).toHaveCount(config.faqCount);
      await expect(faqItems.first().locator('.accordion-title')).toHaveClass(/active/);
    });

    test(`Grid hidden and slider visible at mobile viewports with no page scroll on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);

        const offerings = page.locator(`#${config.sectionIds[2]}`);
        const grid = offerings.locator('.eras-table-price.hide-for-small');
        const slider = offerings.locator('.eras-table-price-slider.slide_ui');

        await expect(grid).toBeHidden();
        await expect(slider).toBeVisible();

        // 4 slides in carousel
        const slides = slider.locator('.flickity-slider > .row');
        await expect(slides).toHaveCount(4);
        for (let i = 0; i < 4; i++) {
          const slide = slides.nth(i);
          await expect(slide.locator('h3')).toHaveText(config.packageTitles[i]);
          // Source highlights only the first slide's column
          if (i === 0) await expect(slide.locator('> .col')).toHaveClass(/col-blur-blue/);
          else await expect(slide.locator('> .col')).not.toHaveClass(/col-blur-blue/);
        }

        // Carousel dots and arrows present
        await expect(slider.locator('.flickity-page-dots')).toBeVisible();
        await expect(slider.locator('.flickity-prev-next-button')).toHaveCount(2);

        // Wraps: previous from the first slide selects the last, next returns to the first.
        // Legacy CSS hides the arrows below 550px, so dispatch the click directly.
        await expect(slides.nth(0)).toHaveClass(/is-selected/);
        await slider.locator('.flickity-prev-next-button.previous').dispatchEvent('click');
        await expect(slides.nth(3)).toHaveClass(/is-selected/);
        await slider.locator('.flickity-prev-next-button.next').dispatchEvent('click');
        await expect(slides.nth(0)).toHaveClass(/is-selected/);

        // No horizontal page scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `${width}px scrollWidth <= innerWidth`).toBeLessThanOrEqual(innerWidth);
      }

      // At >= 550px: slider hidden, grid visible
      await page.setViewportSize({ width: 550, height: 844 });
      await page.goto(config.path);
      const offerings550 = page.locator(`#${config.sectionIds[2]}`);
      await expect(offerings550.locator('.eras-table-price.hide-for-small')).toBeVisible();
      await expect(offerings550.locator('.eras-table-price-slider.slide_ui')).toBeHidden();
    });
  }
});
