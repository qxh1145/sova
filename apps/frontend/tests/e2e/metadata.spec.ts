import { expect, test } from './fixtures';
import { routes } from '../../src/data/routes';
import { buildCounterpartMap } from '../../src/lib/routes';
import { BRAND_TITLE_SUFFIX } from '../../src/lib/queries/site';

test.describe('Metadata & Indexing Acceptance', () => {
  // Family routes: one route per (kind, locale)
  const familyRoutesMap = new Map<string, { locale: 'vi' | 'en'; path: string; kind: string }>();
  for (const r of routes) {
    const key = `${r.kind}:${r.locale}`;
    if (!familyRoutesMap.has(key)) {
      familyRoutesMap.set(key, { locale: r.locale as 'vi' | 'en', path: r.path, kind: r.kind });
    }
  }
  // Listing pages whose generateMetadata is not reached by each family's first route.
  for (const path of [
    '/goc-nhin/',
    '/goc-nhin/page/2/',
    '/thu-thuat/page/2/',
    '/featured_item/',
    '/featured_item_category/website/',
  ]) {
    const r = routes.find((route) => route.path === path)!;
    familyRoutesMap.set(path, { locale: r.locale as 'vi' | 'en', path: r.path, kind: r.kind });
  }
  const FAMILY_ROUTES = Array.from(familyRoutesMap.values());

  const counterpartMapVi = buildCounterpartMap(routes, 'vi');
  const counterpartMapEn = buildCounterpartMap(routes, 'en');

  for (const route of FAMILY_ROUTES) {
    test(`Route ${route.path} (${route.kind}:${route.locale}) has non-empty title with suffix, correct canonical and hreflang`, async ({
      page,
    }) => {
      const response = await page.goto(route.path);
      expect(response?.status()).toBe(200);

      // Title non-empty and follows brand conventions
      const title = await page.title();
      expect(title).toBeTruthy();
      if (route.kind !== 'login') {
        expect(title.endsWith(BRAND_TITLE_SUFFIX)).toBe(true);
      }

      // Canonical pathname matches route's own path
      const canonicalHref = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(canonicalHref).toBeTruthy();
      const canonicalUrl = new URL(canonicalHref!);
      expect(canonicalUrl.pathname).toBe(route.path);

      // Hreflang alternates
      const selfAlternate = page.locator(`link[rel="alternate"][hreflang="${route.locale}"]`);
      await expect(selfAlternate).toHaveCount(1);
      const selfHref = await selfAlternate.getAttribute('href');
      expect(new URL(selfHref!).pathname).toBe(route.path);

      const otherLocale = route.locale === 'vi' ? 'en' : 'vi';
      const counterpartPath =
        route.locale === 'vi' ? counterpartMapVi[route.path] : counterpartMapEn[route.path];

      const otherAlternate = page.locator(`link[rel="alternate"][hreflang="${otherLocale}"]`);
      if (counterpartPath) {
        await expect(otherAlternate).toHaveCount(1);
        const otherHref = await otherAlternate.getAttribute('href');
        expect(new URL(otherHref!).pathname).toBe(counterpartPath);
      } else {
        await expect(otherAlternate).toHaveCount(0);
      }
    });
  }

  test('Sitemap /sitemap.xml serves 148 registry loc pathnames and no aliases', async ({
    request,
  }) => {
    const response = await request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    const body = await response.text();

    const locMatches = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    expect(locMatches).toHaveLength(148);

    const locPathnames = locMatches.map((loc) => new URL(loc).pathname);
    const registryPaths = routes.map((r) => r.path);
    expect(locPathnames).toEqual(registryPaths);
  });

  test('Robots /robots.txt serves allow / and sitemap directive', async ({ request }) => {
    const response = await request.get('/robots.txt');
    expect(response.status()).toBe(200);
    const body = await response.text();

    expect(body).toContain('User-Agent: *');
    expect(body).toContain('Allow: /');
    expect(body).toMatch(/Sitemap: https?:\/\/[^\/]+\/sitemap\.xml/);
  });

  test('/tim-kiem/?s=web sets robots noindex, follow', async ({ page }) => {
    const response = await page.goto('/tim-kiem/?s=web');
    expect(response?.status()).toBe(200);

    const robotsMeta = page.locator('meta[name="robots"]');
    await expect(robotsMeta).toHaveAttribute('content', 'noindex, follow');

    const title = await page.title();
    expect(title.endsWith(BRAND_TITLE_SUFFIX)).toBe(true);
  });

  test.describe('Utility error fixture', () => {
    test.use({
      allowConsole: [
        /Failed to load resource: the server responded with a status of 500|react\.dev\/errors\/441/,
      ],
    });

    test('Utility error boundary catches error and renders .page-error-main with retry', async ({
      page,
    }) => {
      await page.goto('/dev-fixtures/utility-error/');

      const errorMain = page.locator('.page-error-main');
      await expect(errorMain).toBeVisible();
      await expect(errorMain.locator('h2')).toHaveText('Đã có lỗi xảy ra');
      await expect(errorMain.locator('button')).toHaveText('Thử lại');
    });
  });

  test.describe('Unknown routes 404', () => {
    test.use({
      allowConsole: [/Failed to load resource: the server responded with a status of 404/],
    });

    test('Unknown project route /featured_item/khong-ton-tai-xyz/ returns 404', async ({ page }) => {
      const response = await page.goto('/featured_item/khong-ton-tai-xyz/');
      expect(response?.status()).toBe(404);
    });

    test('Unknown project listing /featured_item_category/khong-ton-tai/ returns 404', async ({
      page,
    }) => {
      const response = await page.goto('/featured_item_category/khong-ton-tai/');
      expect(response?.status()).toBe(404);
    });
  });
});
