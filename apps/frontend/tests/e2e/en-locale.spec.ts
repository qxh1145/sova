import { test, expect } from './fixtures';
import { routes } from '@/data/routes';
import { buildCounterpartMap } from '@/lib/routes';

test.describe('EN locale parity', () => {
  // One route per EN family derived from routes registry
  const familyRoutesMap = new Map<string, { locale: string; path: string; kind: string }>();
  for (const r of routes) {
    if (r.locale === 'en' && !familyRoutesMap.has(r.kind)) {
      familyRoutesMap.set(r.kind, { locale: r.locale, path: r.path, kind: r.kind });
    }
  }
  const EN_ROUTES = Array.from(familyRoutesMap.values());

  const viToEnMap = buildCounterpartMap(routes, 'vi');
  const VI_COUNTERPART_PATHS = new Set(Object.keys(viToEnMap));

  // Story 6.8 decision: footer privacy stays VI link (/chinh-sach-bao-mat/)
  const ALLOWED_EXCEPTIONS: Record<string, string> = {
    '/chinh-sach-bao-mat/': 'Story 6.8 decision: footer privacy policy link retained as VI',
  };

  for (const { kind, path } of EN_ROUTES) {
    test(`[${kind}] ${path} renders EN FooterCTA ids and styles`, async ({ page }) => {
      // 1. Narrow viewport (<550px)
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto(path);

      // Section ID
      const section = page.locator('#section_1016084764');
      await expect(section).toBeVisible();

      // Heading ID and computed font size at <550px: 1.4rem = 22.4px (14px base * 1.6 or 16px * 1.4)
      const heading = page.locator('#text-3886040369');
      await expect(heading).toBeVisible();
      const fontSizeNarrow = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      // 1.4rem computed: 22.4px (since 1rem = 16px in root)
      expect(parseFloat(fontSizeNarrow)).toBeCloseTo(22.4, 0);

      // 2. Wide viewport (>=550px)
      await page.setViewportSize({ width: 1280, height: 800 });
      const fontSizeWide = await heading.evaluate((el) => {
        return window.getComputedStyle(el).fontSize;
      });
      // 2.9rem computed: 46.4px (16 * 2.9)
      expect(parseFloat(fontSizeWide)).toBeCloseTo(46.4, 0);
    });

    test(`[${kind}] ${path} has no links pointing to paired VI routes`, async ({ page }) => {
      await page.goto(path);

      const hrefs = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[href]'));
        return links
          .filter((a) => !a.closest('.lang-switcher-inline'))
          .filter((a) => {
            const rawHref = a.getAttribute('href') || '';
            return rawHref && !rawHref.startsWith('#') && !rawHref.startsWith('mailto:') && !rawHref.startsWith('tel:');
          })
          .map((a) => {
            const href = a.getAttribute('href') || '';
            let pathname = href;
            try {
              const url = new URL(href, window.location.origin);
              pathname = url.pathname;
            } catch {
              // keep as is
            }
            return { pathname, html: a.outerHTML, href };
          });
      });

      for (const { pathname, html, href } of hrefs) {
        if (VI_COUNTERPART_PATHS.has(pathname)) {
          if (!ALLOWED_EXCEPTIONS[pathname]) {
            throw new Error(
              `Found link to paired VI route "${pathname}" (href="${href}", html=${html}) on EN page "${path}". Should be "${viToEnMap[pathname]}".`,
            );
          }
        }
      }
    });
  }

  test('Client navigation VI -> EN swaps CTA ids and rules correctly', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/');

    await expect(page.locator('#section_539620154')).toBeVisible();
    await expect(page.locator('#text-43480091')).toBeVisible();

    // Client nav to EN Home
    await page.goto('/en/home/');

    await expect(page.locator('#section_1016084764')).toBeVisible();
    await expect(page.locator('#text-3886040369')).toBeVisible();

    const heading = page.locator('#text-3886040369');
    const fontSize = await heading.evaluate((el) => {
      const h2 = el.querySelector('h2') ?? el;
      return window.getComputedStyle(h2).fontSize;
    });
    expect(parseFloat(fontSize)).toBeCloseTo(46.4, 0);
  });
});
