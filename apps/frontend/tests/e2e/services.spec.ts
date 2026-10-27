import { ALLOW_404, expect, expectNoDuplicateIds, test } from './fixtures';
import { getService } from '../../src/lib/queries/services';

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
    faqCount: 8,
    breadcrumbId: 'text-1919501786',
    breadcrumb: {
      home: 'Home',
      homeHref: '/en/home/',
      text: 'Home / Services / App Mobile Development',
    },
    imageWrapperId: 'image_1568157091',
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

      // Question IDs stay unique on EN
      if (config.locale === 'en') {
        const itemIds = await faqItems.evaluateAll((items) => items.map((i) => i.id));
        const uniqueIds = new Set(itemIds);
        expect(uniqueIds.size).toBe(config.faqCount);
      }
    });

    for (const width of [390, 1280]) {
      test(`Benefit titles are blue and FAQ matches source styling at ${width}px on ${config.path}`, async ({
        page,
      }) => {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(config.path);

        // Source: <h3><span style="color:#0065df">…</span></h3>
        const titles = page.locator(`#${config.benefitsId} .row_ptien h3 > span`);
        await expect(titles).toHaveCount(4);
        for (const color of await titles.evaluateAll((els) =>
          els.map((e) => getComputedStyle(e).color),
        )) {
          expect(color).toBe('rgb(0, 101, 223)');
        }

        const faq = page.locator(`#${config.faqId}`);
        const accordion = faq.locator('.accordion.ac-luutru');
        await expect(accordion).toHaveCount(1);
        const title = accordion.locator('.accordion-title').first();
        await expect(title).toHaveCSS('border-radius', '8px');
        await expect(title).toHaveCSS('background-color', 'rgb(0, 0, 0)');

        await expect(faq.locator('h2').first()).toHaveCSS('text-align', 'center');
        const m = await faq.locator('.is-divider').evaluate((el) => {
          const r = el.getBoundingClientRect();
          return { w: r.width, off: Math.round(r.left + r.width / 2 - window.innerWidth / 2) };
        });
        expect(m).toEqual({ w: 133, off: 0 });
      });
    }

    test(`Hero, benefits and why-choose-us assets render on ${config.path}`, async ({ page }) => {
      const { mobileServices } = await import('../../src/data/services/mobile');
      const service = mobileServices.find((s) => s.locale === config.locale)!;
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
      ).toContainText(service.offerings[0].items![0]);
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

    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's clients.
    test(`No testimonials section on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      await expect(page.locator(`#${config.testimonialsId}`)).toHaveCount(0);
      await expect(page.locator('.ss-kh, .slide-kh')).toHaveCount(0);
    });

    test(`No tab UI ([role=tablist]) on service page on ${config.path}`, async ({ page }) => {
      await page.goto(config.path);

      const tablists = page.locator('[role=tablist]');
      await expect(tablists).toHaveCount(0);
    });
  }
});

// Storage, e-mail, hosting and VPS are hidden (stakeholder review 2026-10-27): records and routes are commented out.
const HIDDEN_SERVICE_PATHS = [
  '/giai-phap-luu-tru/',
  '/en/storage-solution/',
  '/e-mail-doanh-nghiep/',
  '/en/business-e-mail/',
  '/hosting-doanh-nghiep/',
  '/en/business-hosting/',
  '/vps-doanh-nghiep/',
  '/en/business-vps/',
] as const;

test.describe('Hidden storage, e-mail, hosting and VPS service pages', () => {
  test.use({ allowConsole: [ALLOW_404] });

  for (const path of HIDDEN_SERVICE_PATHS) {
    test(`${path} returns 404`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(404);
    });
  }
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
    offeringsEyebrow: 'Những dịch vụ',
    packageTitles: ['SEO ONPAGE', 'SEO OFFPAGE', 'CHĂM SÓC WEBSITE', 'CONTENT WRITER'],
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
      'section_1520280801',
    ],
    headingLines: ['Top-Ranking', 'SEO Services'],
    breadcrumb: 'Home / Services / Website keyword SEO',
    homeHref: '/en/home/',
    homeLabel: 'Home',
    breadcrumbId: 'text-4167340980',
    topGapId: 'gap-716151157',
    heroCtaId: 'text-2349830623',
    ctaIconCount: 0,
    offeringsTitleId: 'text-3610428661',
    faqEyebrowId: 'text-712709189',
    faqEyebrow: 'FAQs',
    advantagesEyebrow: 'Website Keyword SEO',
    offeringsEyebrow: 'Services',
    packageTitles: ['SEO ONPAGE', 'SEO OFFPAGE', 'WEBSITE MAINTENANCE', 'CONTENT WRITER'],
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
      await expect(breadcrumb.getByRole('link', { name: config.homeLabel })).toHaveAttribute(
        'href',
        config.homeHref,
      );

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
      ).toHaveText(service.sectionCopy.benefits!.title);
      const advantageCards = advantagesSection.locator('.row.align-equal > .col');
      await expect(advantageCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(advantageCards.nth(i).locator('h3')).toHaveText(service.benefits[i].title);
      }

      // Package cards desktop grid: 4 package cards
      const packagesSection = page.locator(`#${config.sectionIds[2]}`);
      await expect(packagesSection).toContainText(config.offeringsEyebrow);
      // Source splits the VI title with <br>.
      const offeringsCopy = service.sectionCopy.offerings!;
      expect(await packagesSection.locator(`#${config.offeringsTitleId} h2`).innerText()).toBe(
        (offeringsCopy.titleLines ?? [offeringsCopy.title]).join('\n'),
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

      // Testimonials hidden (stakeholder review 2026-10-27).
      await expect(page.locator('.ss-kh, .slide-kh')).toHaveCount(0);

      // FAQ items count per locale (8 items, first open)
      const faqSection = page.locator(`#${config.sectionIds[4]}`);
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
    offeringsEyebrow: 'Những dịch vụ',
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
      'section_1106628234',
    ],
    headingLines: ['UI/UX,', 'Branding Design'],
    breadcrumb: 'Home / Services / UI/UX, Branding Design',
    homeHref: '/en/home/',
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
    offeringsEyebrow: 'Services',
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
      await expect(breadcrumb.getByRole('link', { name: config.homeLabel })).toHaveAttribute(
        'href',
        config.homeHref,
      );

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
      await expect(advantagesSection).toContainText(service.sectionCopy.benefits!.description!);

      const advantageCards = advantagesSection.locator('.row.align-equal > .col');
      await expect(advantageCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        await expect(advantageCards.nth(i).locator('h3')).toHaveText(service.benefits[i].title);
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
      // Source splits the VI title with <br>.
      const offeringsCopy = service.sectionCopy.offerings!;
      expect(await packagesSection.locator(`#${config.offeringsTitleId} h2`).innerText()).toBe(
        (offeringsCopy.titleLines ?? [offeringsCopy.title]).join('\n'),
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

      // Testimonials hidden (stakeholder review 2026-10-27).
      await expect(page.locator('.ss-kh, .slide-kh')).toHaveCount(0);

      // FAQ items count per locale (10 items, first open)
      const faqSection = page.locator(`#${config.sectionIds[4]}`);
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

const WEBSITE_SERVICES_ROUTES = [
  {
    locale: 'vi',
    path: '/thiet-ke-website/',
    headingLines: ['Thiết kế Website', 'Chuyên Nghiệp'],
    breadcrumb: 'Trang chủ / Dịch vụ / Thiết kế website',
    homeHref: '/',
    homeLabel: 'Trang chủ',
    sectionIds: [
      'banner-719407594',
      'section_949181512',
      'section_1346750226',
      'section_2045360196',
      'section_1384595751',
      'section_852011045',
    ],
    pricingSectionId: 'section_1346750226',
    pricingSliderId: 'slider-74016963',
    whyChooseUsId: 'section_2045360196',
    whyChooseUsSliderId: 'slider-1976037433',
    breadcrumbId: 'text-560624937',
    benefitsCardsRowId: 'row-2045382502',
    mobileHeadingId: 'text-3235701455',
    faqSectionId: 'section_852011045',
    faqCount: 8,
    plans: [
      { name: 'CƠ BẢN', badge: 'Giảm 50%', recommended: false },
      { name: 'NÂNG CAO', badge: 'Giảm 45%', recommended: true },
      { name: 'CHUYÊN NGHIỆP', badge: 'Giảm 35%', recommended: false },
    ],
  },
  {
    locale: 'en',
    path: '/en/website-development/',
    headingLines: ['Professional', 'Website Development'],
    breadcrumb: 'Home / Services / Website Development',
    homeHref: '/en/home/',
    homeLabel: 'Home',
    sectionIds: [
      'banner-653181182',
      'section_1040334430',
      'section_1856214289',
      'section_720050151',
      'section_1784272447',
      'section_581402483',
    ],
    pricingSectionId: 'section_1856214289',
    pricingSliderId: 'slider-1604990153',
    whyChooseUsId: 'section_720050151',
    whyChooseUsSliderId: 'slider-1884506166',
    breadcrumbId: 'text-2147121753',
    benefitsCardsRowId: 'row-850357972',
    mobileHeadingId: 'text-2812727029',
    faqSectionId: 'section_581402483',
    faqCount: 8,
    plans: [
      {
        name: 'STANDARD',
        price: '5.000.000 VNĐ',
        originalPrice: '7.000.000 VNĐ',
        recommended: false,
      },
      {
        name: 'ADVANCED',
        price: '8.000.000 VNĐ',
        originalPrice: '10.000.000 VNĐ',
        recommended: true,
      },
      {
        name: 'PROFESSIONAL',
        price: '+15.000.000 VNĐ',
        originalPrice: '18.000.000 VNĐ',
        recommended: false,
      },
    ],
  },
];

const PLAN_ICON_FILES = ['Glass-Left-1.svg', 'Group-1000001808.svg', 'Group-1000001809.svg'];

test.describe('Website Service Pages (Story 5.7)', () => {
  for (const config of WEBSITE_SERVICES_ROUTES) {
    test(`Sections render in source order and structure on ${config.path}`, async ({ page }) => {
      const { websiteServices } = await import('../../src/data/services/website');
      const { websitePricing } = await import('../../src/data/pricing/website');
      const { siteSettings } = await import('../../src/data/site');
      const zaloHref = siteSettings.find((x) => x.locale === config.locale)?.zaloHref;
      const service = websiteServices.find((s) => s.locale === config.locale);
      if (!service) throw new Error('website service missing');
      const pricing = websitePricing.find((p) => p.locale === config.locale)!;

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

      // Benefits: 4 website-variant cards with icon, title and body from data
      const benefitCards = page.locator(`#${config.benefitsCardsRowId} > .col`);
      await expect(benefitCards).toHaveCount(4);
      for (let i = 0; i < 4; i++) {
        const card = benefitCards.nth(i);
        await expect(card.locator('.icon-box-img img')).toHaveCount(1);
        await expect(card.locator('.icon-box h3')).toHaveText(service.benefits[i].title);
        await expect(card.locator('.col-inner > .text')).not.toBeEmpty();
        // Source sets 16px inline on the body <p>; Sova inherits it from a wrapper (A58).
        await expect(card.locator('.col-inner > .text p').first()).toHaveCSS('font-size', '16px');
      }

      // Mobile benefits heading line breaks match source
      const benefitsCopy = service.sectionCopy.benefits!;
      const mobileHeadingLines = benefitsCopy.mobileTitleLines ?? [benefitsCopy.title];
      const mobileHeading = page.locator(`#${config.mobileHeadingId} h2`);
      await expect(mobileHeading.locator('br')).toHaveCount(mobileHeadingLines.length - 1);
      expect(
        (await mobileHeading.innerHTML())
          .split(/<br\s*\/?>/)
          .map((line) => line.replace(/<[^>]+>/g, '').trim()),
      ).toEqual(mobileHeadingLines);

      // Projects slot is present and empty ss-decor
      const projectsSlot = page.locator(`#${config.sectionIds[4]}`);
      await expect(projectsSlot).toHaveClass(/ss-decor/);

      // H1 heading lines with typewriter
      const h1 = page.locator('main h1');
      await expect(h1).toHaveCount(1);
      await expect(h1.locator('.typewriter')).toHaveText(config.headingLines);

      // Hero breadcrumb
      const breadcrumb = page.locator(`#${config.breadcrumbId}`);
      await expect(breadcrumb).toContainText(config.breadcrumb);
      await expect(breadcrumb.getByRole('link', { name: config.homeLabel })).toHaveAttribute(
        'href',
        config.homeHref,
      );

      // Hero CTA
      const heroCta = page.locator('main .banner a.but-lh');
      await expect(heroCta).toHaveAttribute(
        'href',
        config.locale === 'en' ? '/en/contact-us/' : '/lien-he/',
      );

      // Marquee present, with Ellipse-2351.svg separator
      const marquee = page.locator('.cs-moving_text_wrap');
      await expect(marquee).toBeVisible();
      await expect(marquee.locator('img[src*="Ellipse-2351.svg"]').first()).toBeAttached();

      // Pricing cards desktop grid (3 plans, features from data + CTA each)
      const pricingSection = page.locator(`#${config.pricingSectionId}`);
      const gridCards = pricingSection.locator('.eras-table-price > .col');
      await expect(gridCards).toHaveCount(3);

      for (let i = 0; i < 3; i++) {
        const card = gridCards.nth(i);
        const plan = config.plans[i];
        await expect(card.locator('h3').first()).toHaveText(plan.name);
        await expect(
          card.locator(`.icon-tke .icon-inner img[src*="${PLAN_ICON_FILES[i]}"]`),
        ).toHaveCount(1);

        if (plan.recommended) {
          await expect(card).toHaveClass(/col-blur-blue/);
        } else {
          await expect(card).not.toHaveClass(/col-blur-blue/);
        }

        if ('badge' in plan && plan.badge) {
          await expect(card.locator('.text_sale h3')).toHaveText(plan.badge);
        } else if ('price' in plan && plan.price) {
          await expect(card.locator('p.gia_giam')).toHaveText(plan.originalPrice);
          await expect(card.locator('p.gia_giam + h3')).toHaveText(plan.price);
        }

        await expect(card.locator('.icon-box-left .text p')).toHaveCount(
          pricing.plans[i].featureIds.length,
        );
        // CTA
        await expect(card.locator('a.but-lh')).toHaveAttribute('href', zaloHref!);
      }

      // Why choose us (3 cols desktop)
      const whyChooseUsSection = page.locator(`#${config.whyChooseUsId}`);
      const whyCards = whyChooseUsSection.locator('.eras-table-price > .col');
      await expect(whyCards).toHaveCount(3);
      for (let i = 0; i < 3; i++) {
        await expect(whyCards.nth(i).locator('.icon-box-text p')).toHaveText(
          service.offerings[i].items ?? [],
        );
      }

      // Testimonials hidden (stakeholder review 2026-10-27).
      await expect(page.locator('.ss-kh, .slide-kh')).toHaveCount(0);

      // FAQ items count per locale (8 items, first open)
      const faqSection = page.locator(`#${config.faqSectionId}`);
      const faqItems = faqSection.locator('.accordion-item');
      await expect(faqItems).toHaveCount(config.faqCount);
      await expect(faqItems.first().locator('.accordion-title')).toHaveClass(/active/);
    });

    test(`Pricing and why-choose-us mobile sliders work at mobile viewports on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);

        // Pricing slider
        const pricingSlider = page.locator(`#${config.pricingSliderId}`);
        await expect(pricingSlider).toBeVisible();

        const pricingSlides = pricingSlider.locator('.flickity-slider > *');
        await expect(pricingSlides).toHaveCount(3);

        // Slider wrap verification
        await expect(pricingSlides.nth(0)).toHaveClass(/is-selected/);
        await pricingSlider.locator('.flickity-prev-next-button.previous').dispatchEvent('click');
        await expect(pricingSlides.nth(2)).toHaveClass(/is-selected/);
        await pricingSlider.locator('.flickity-prev-next-button.next').dispatchEvent('click');
        await expect(pricingSlides.nth(0)).toHaveClass(/is-selected/);

        // Why-choose-us mobile slider
        const whySlider = page.locator(`#${config.whyChooseUsSliderId}`);
        await expect(whySlider).toBeVisible();
        const whySlides = whySlider.locator('.flickity-slider > .row');
        await expect(whySlides).toHaveCount(3);

        // No horizontal page scroll
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `${width}px scrollWidth <= innerWidth`).toBeLessThanOrEqual(innerWidth);
      }

      // At >= 550px: sliders hidden, grids visible
      await page.setViewportSize({ width: 550, height: 844 });
      await page.goto(config.path);
      await expect(page.locator(`#${config.pricingSliderId}`)).toBeHidden();
      await expect(page.locator(`#${config.whyChooseUsSliderId}`)).toBeHidden();
    });
  }
});

test.describe('Website Contact Form Banner (Story 5.8)', () => {
  const BANNER_CONFIGS = [
    {
      locale: 'vi',
      path: '/thiet-ke-website/',
      bannerId: 'banner-1813159824',
      headingBoxId: 'text-box-461418576',
      formBoxId: 'text-box-1917404396',
      formId: 'wpcf7-f6818-p7233-o1',
      promoBoxId: 'text-box-324172340',
      submitText: 'Gửi yêu cầu tư vấn  →',
      namePlaceholder: 'Họ & tên của bạn',
      phonePlaceholder: 'Số điện thoại của bạn',
      businessPlaceholder: 'Lĩnh vực bạn đang kinh doanh',
      nameRequiredTip: 'Vui lòng nhập họ và tên',
      businessRequiredTip: 'Vui lòng nhập lĩnh vực kinh doanh',
      phoneInvalidTip: 'Số điện thoại không hợp lệ',
    },
    {
      locale: 'en',
      path: '/en/website-development/',
      bannerId: 'banner-1313966365',
      headingBoxId: 'text-box-2108502950',
      formBoxId: 'text-box-1136070934',
      formId: 'wpcf7-f6823-p7372-o1',
      promoBoxId: null,
      submitText: 'Send a consultation request →',
      namePlaceholder: 'Your full name',
      phonePlaceholder: 'Your phone number',
      businessPlaceholder: 'Your field of business',
      nameRequiredTip: 'Please enter your full name',
      businessRequiredTip: 'Please enter your field of business',
      phoneInvalidTip: 'Invalid phone number',
    },
  ];

  for (const config of BANNER_CONFIGS) {
    test(`Renders exactly one form with unique IDs, required fields, and hotline href on ${config.path}`, async ({
      page,
    }) => {
      await page.goto(config.path);

      // Exactly one form in the banner
      const banner = page.locator(`#${config.bannerId}`);
      await expect(banner).toBeVisible();
      const form = banner.locator('form');
      await expect(form).toHaveCount(1);
      await expect(form).toHaveClass(/wpcf7-form init/);

      // Unique IDs across page
      await expectNoDuplicateIds(page);

      // Check fields and aria-required
      const nameInput = banner.locator('input[name="your-name"]');
      const phoneInput = banner.locator('input[name="your-phone"]');
      const businessInput = banner.locator('input[name="your-lvuc"]');
      const messageInput = banner.locator('textarea[name="your-message"]');
      const submitInput = banner.locator('input.wpcf7-submit');

      await expect(nameInput).toHaveAttribute('aria-required', 'true');
      await expect(nameInput).toHaveAttribute('placeholder', config.namePlaceholder);

      // Phone is optional: no aria-required
      await expect(phoneInput).not.toHaveAttribute('aria-required', 'true');
      await expect(phoneInput).toHaveAttribute('placeholder', config.phonePlaceholder);

      await expect(businessInput).toHaveAttribute('aria-required', 'true');
      await expect(businessInput).toHaveAttribute('placeholder', config.businessPlaceholder);

      await expect(messageInput).toBeAttached();
      await expect(submitInput).toHaveValue(config.submitText);

      // Hotline button check
      const hotlineLink = banner.locator('a.button.white.is-shade');
      await expect(hotlineLink).toHaveAttribute('href', 'tel:0000000000');
      await expect(hotlineLink).toContainText('0000 000 000');

      // Promo box on VI only
      if (config.promoBoxId) {
        const promoBox = banner.locator(`#${config.promoBoxId}`);
        await expect(promoBox).toBeVisible();
        const { websiteServices } = await import('../../src/data/services/website');
        const service = websiteServices.find((s) => s.locale === config.locale)!;
        await expect(promoBox).toContainText(service.sectionCopy.contact!.eyebrow!);
      } else {
        await expect(banner.locator('#text-box-324172340')).toHaveCount(0);
      }
    });

    test(`Validation tips and aria-invalid work on empty and invalid inputs on ${config.path}`, async ({
      page,
    }) => {
      await page.goto(config.path);

      const banner = page.locator(`#${config.bannerId}`);
      const submitBtn = banner.locator('input.wpcf7-submit');
      const nameInput = banner.locator('input[name="your-name"]');
      const phoneInput = banner.locator('input[name="your-phone"]');
      const businessInput = banner.locator('input[name="your-lvuc"]');

      // Click submit with empty form
      await submitBtn.click();

      // Check tips appear
      const tips = banner.locator('.wpcf7-not-valid-tip');
      await expect(tips).toHaveCount(2);
      await expect(tips.nth(0)).toHaveText(config.nameRequiredTip);
      await expect(tips.nth(1)).toHaveText(config.businessRequiredTip);
      await expect(nameInput).toHaveAttribute('aria-invalid', 'true');
      await expect(nameInput).toBeFocused();

      // Fill name & business, put bad phone
      await nameInput.fill('Nguyen Van A');
      await businessInput.fill('Retail');
      await phoneInput.fill('bad-phone-123');
      await submitBtn.click();

      await expect(banner.locator('.wpcf7-not-valid-tip')).toHaveCount(1);
      await expect(banner.locator('.wpcf7-not-valid-tip')).toHaveText(config.phoneInvalidTip);
      await expect(phoneInput).toHaveAttribute('aria-invalid', 'true');
    });

    test(`Valid submit resolves to demo-success with demo badge, no storage/network, and invalid resubmit clears result on ${config.path}`, async ({
      page,
    }) => {
      await page.goto(config.path);

      const banner = page.locator(`#${config.bannerId}`);
      const nameInput = banner.locator('input[name="your-name"]');
      const businessInput = banner.locator('input[name="your-lvuc"]');
      const submitBtn = banner.locator('input.wpcf7-submit');

      // networkGuard only blocks external hosts; a real submit would send a non-GET request.
      // GETs are excluded: Next.js prefetch and lazy images load in the background.
      const requests: string[] = [];
      page.on('request', (request) => {
        if (request.method() !== 'GET') requests.push(`${request.method()} ${request.url()}`);
      });

      await nameInput.fill('Nguyen Van A');
      await businessInput.fill('Tech Retail');
      await submitBtn.click();

      // Demo-success output
      const form = banner.locator('form');
      await expect(form).toHaveClass(/sent/);
      const responseOutput = banner.locator('.wpcf7-response-output');
      await expect(responseOutput).toBeVisible();
      await expect(responseOutput.locator('.wpcf7-demo-badge')).toBeVisible();

      // Inputs kept
      await expect(nameInput).toHaveValue('Nguyen Van A');
      await expect(businessInput).toHaveValue('Tech Retail');

      // No storage or cookies
      const storageState = await page.evaluate(() => ({
        local: localStorage.length,
        session: sessionStorage.length,
        cookies: document.cookie,
      }));
      expect(storageState.local).toBe(0);
      expect(storageState.session).toBe(0);
      expect(storageState.cookies).toBe('');
      expect(requests, 'no submit request leaves the page').toEqual([]);

      // An invalid resubmit clears the earlier result instead of showing it next to the tip
      await nameInput.fill('');
      await submitBtn.click();
      await expect(banner.locator('.wpcf7-not-valid-tip')).toHaveText(config.nameRequiredTip);
      await expect(form).toHaveClass(/invalid/);
      await expect(responseOutput).toHaveCount(0);
    });

    test(`No horizontal overflow at 390px and 549px viewports on ${config.path}`, async ({
      page,
    }) => {
      for (const width of [390, 549]) {
        await page.setViewportSize({ width, height: 844 });
        await page.goto(config.path);

        const banner = page.locator(`#${config.bannerId}`);
        await expect(banner).toBeVisible();

        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const innerWidth = await page.evaluate(() => window.innerWidth);
        expect(scrollWidth, `${width}px scrollWidth <= innerWidth`).toBeLessThanOrEqual(innerWidth);

        // Mobile layout: heading and form stack inside the banner without overlap
        const bannerBox = (await banner.boundingBox())!;
        const headingBox = (await page.locator(`#${config.headingBoxId}`).boundingBox())!;
        const formBox = (await page.locator(`#${config.formBoxId}`).boundingBox())!;
        expect(formBox.y, `${width}px form below heading`).toBeGreaterThanOrEqual(
          headingBox.y + headingBox.height - 1,
        );
        expect(formBox.y + formBox.height, `${width}px form inside banner`).toBeLessThanOrEqual(
          bannerBox.y + bannerBox.height + 1,
        );
      }
    });
  }

  test('Gated fixture: enters submitting state, demo-error keeps inputs, and resubmit works', async ({
    page,
  }) => {
    await page.goto('/dev-fixtures/website-form/error');

    const nameInput = page.locator('input[name="your-name"]');
    const businessInput = page.locator('input[name="your-lvuc"]');
    const submitBtn = page.locator('input.wpcf7-submit');
    const releaseBtn = page.locator('[data-testid="fixture-release"]');

    await nameInput.fill('Demo User');
    await businessInput.fill('Software');

    // Submit enters gated pending state
    await submitBtn.click();
    await expect(submitBtn).toBeDisabled();
    await expect(submitBtn).toHaveAttribute('aria-busy', 'true');
    await expect(page.locator('form')).toHaveClass(/submitting/);

    // Release gate to error outcome
    await releaseBtn.click();

    // Form status becomes failed, response output visible
    await expect(page.locator('form')).toHaveClass(/failed/);
    const responseOutput = page.locator('.wpcf7-response-output');
    await expect(responseOutput).toBeVisible();
    await expect(responseOutput.locator('.wpcf7-demo-badge')).toHaveText(
      'Bản demo — chưa gửi thông tin',
    );

    // Inputs kept
    await expect(nameInput).toHaveValue('Demo User');
    await expect(businessInput).toHaveValue('Software');

    // Button re-enabled, resubmit works
    await expect(submitBtn).not.toBeDisabled();
    await submitBtn.click();
    await expect(submitBtn).toBeDisabled();
    await releaseBtn.click();
    await expect(page.locator('form')).toHaveClass(/failed/);
  });
});

test.describe('Featured Projects on Service Pages (Story 5.9)', () => {
  const VI_TARGET_SERVICES = [
    {
      name: 'website' as const,
      path: '/thiet-ke-website/',
      rowId: 'row-134970593',
      colId: 'col-1655533775',
      eyebrowId: 'text-2072217073',
      titleId: 'text-166351269',
      eyebrowText: 'Sova',
    },
    {
      name: 'mobile' as const,
      path: '/thiet-ke-app-mobile/',
      rowId: 'row-26389138',
      colId: 'col-1861618344',
      eyebrowId: 'text-1571546421',
      titleId: 'text-84787226',
      eyebrowText: 'Sova',
    },
    {
      name: 'seo' as const,
      path: '/seo-tu-khoa-website/',
      rowId: 'row-328500521',
      colId: 'col-1824878441',
      eyebrowId: 'text-3301960015',
      titleId: 'text-1254685663',
      eyebrowText: 'Sova',
    },
    {
      name: 'branding' as const,
      path: '/ui-ux-branding-design/',
      rowId: 'row-262932845',
      colId: 'col-1523603196',
      eyebrowId: 'text-1453977587',
      titleId: 'text-642705441',
      eyebrowText: 'Sova',
    },
  ];

  const EXPECTED_PROJECTS = [
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

  const EN_TARGET_PATHS = [
    '/en/website-development/',
    '/en/app-mobile-development/',
    '/en/website-keyword-seo/',
    '/en/ui-ux-branding-design-2/',
  ];

  for (const service of VI_TARGET_SERVICES) {
    test(`VI ${service.name} renders 6 featured projects in order with source ids and heading`, async ({
      page,
    }) => {
      await page.goto(service.path);
      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();

      await expect(section.locator(`#${service.rowId}`)).toBeVisible();
      await expect(section.locator(`#${service.colId}`)).toBeVisible();
      await expect(section.locator(`#${service.eyebrowId}`)).toContainText(service.eyebrowText);
      const { titleLines } = (await getService(service.name, 'vi'))!.sectionCopy.projects!;
      expect(await section.locator(`#${service.titleId} h2`).innerText()).toBe(
        titleLines!.join('\n'),
      );
      await expect(section.locator(`#${service.titleId} h2 br`)).toHaveCount(1);

      const items = section.locator('.scroll-item');
      await expect(items).toHaveCount(6);

      for (const [idx, expected] of EXPECTED_PROJECTS.entries()) {
        const item = items.nth(idx);
        const link = item.locator('a.item-link');
        await expect(link).toHaveAttribute('href', expected.path);
        await expect(item.locator('.item-title')).toHaveText(expected.title);
        await expect(item.locator('.item-categories .item-term')).toHaveText(expected.category);
        const content = item.locator('.item-content');
        const bgStyle = await content.evaluate((el) => el.style.backgroundImage);
        expect(bgStyle).toContain(expected.image);
      }
    });
  }

  for (const enPath of EN_TARGET_PATHS) {
    test(`EN ${enPath} renders no horizontal-scroll-section`, async ({ page }) => {
      await page.goto(enPath);
      await expect(page.locator('.horizontal-scroll-section')).toHaveCount(0);
    });
  }

  for (const service of VI_TARGET_SERVICES) {
    test(`VI ${service.name} horizontal projects pin and scrub with no horizontal overflow at 390px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(service.path);

      const section = page.locator('.horizontal-scroll-section');
      await expect(section).toBeVisible();
      await expect(page.locator('.pin-spacer > .horizontal-scroll-section')).toHaveCount(1);

      const { startY, distance } = await page.evaluate(() => {
        const sec = document.querySelector('.horizontal-scroll-section') as HTMLElement;
        const wrapper = sec.querySelector('.scrolling-wrapper') as HTMLElement;
        const pinSpacer = sec.parentElement as HTMLElement;
        const rect = pinSpacer.getBoundingClientRect();
        return {
          startY: window.scrollY + rect.top,
          distance: wrapper.scrollWidth - window.innerWidth,
        };
      });
      expect(distance).toBeGreaterThan(0);

      const translateX = () =>
        page.evaluate(() => {
          const wrapper = document.querySelector(
            '.horizontal-scroll-section .scrolling-wrapper',
          ) as HTMLElement;
          const transform = window.getComputedStyle(wrapper).transform;
          return transform && transform !== 'none' ? new DOMMatrixReadOnly(transform).m41 : 0;
        });
      const pageOverflow = () =>
        page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

      expect(await pageOverflow(), '390px initial scrollWidth <= innerWidth').toBeLessThanOrEqual(
        0,
      );

      // Scroll to 50% of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + 0.5 * distance);
      await expect
        .poll(async () => Math.abs((await translateX()) - -0.5 * distance))
        .toBeLessThanOrEqual(25);
      expect(await pageOverflow(), '390px scrolled scrollWidth <= innerWidth').toBeLessThanOrEqual(
        0,
      );

      // Scroll to end of distance
      await page.evaluate((y) => window.scrollTo(0, y), startY + distance);
      await expect
        .poll(async () => Math.abs((await translateX()) - -distance))
        .toBeLessThanOrEqual(25);
    });
  }
});

test('Service hero lines keep source 40px boxes and 54.2px pitch below 550px', async ({ page }) => {
  for (const width of [390, 549]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/thiet-ke-app-mobile/');
    const boxes = await page.locator('.service-hero-heading .typewriter').evaluateAll((lines) =>
      lines.map((line) => {
        const { top, height } = line.getBoundingClientRect();
        return { top, height };
      }),
    );
    expect(boxes).toHaveLength(2);
    boxes.forEach((box) => expect(box.height).toBeCloseTo(40, 0));
    expect(boxes[1].top - boxes[0].top).toBeCloseTo(54.2, 0);
  }
});
