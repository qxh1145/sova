import { expect, expectNoDuplicateIds, STAGING, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';
import { partners } from '../../src/data/partners';
import { assets } from '../../src/data/assets';

test.describe('Partner logo grid', () => {
  const partnerMap = new Map(partners.map((p) => [p.id, p]));
  const assetMap = new Map(assets.map((a) => [a.id, a]));

  const getExpectedLogoSrcs = (localeIndex: number) => {
    return homePages[localeIndex].partnerPlacements.map((placement) => {
      const partner = partnerMap.get(placement.entityId);
      if (!partner) throw new Error(`Partner not found: ${placement.entityId}`);
      const asset = assetMap.get(partner.logoId);
      if (!asset) throw new Error(`Asset not found: ${partner.logoId}`);
      return asset.src;
    });
  };

  test('VI and EN routes render 30 partner logos in placement order, all decorative (alt=""), no accessible names, and no duplicate IDs', async ({
    page,
  }) => {
    const cases = [
      { path: '/', localeIndex: 0, eyebrowId: '#text-2149017180', titleId: '#text-1007250049' },
      {
        path: '/en/home/',
        localeIndex: 1,
        eyebrowId: '#text-3114286333',
        titleId: '#text-3018448185',
      },
    ];

    for (const { path, localeIndex, eyebrowId, titleId } of cases) {
      await page.goto(path);

      // Section headings
      const copy = homePages[localeIndex].sectionCopy.partners;
      await expect(page.locator(`${eyebrowId} h4`)).toHaveText(copy.eyebrow!);
      await expect(page.locator(`${titleId} h2`)).toHaveText(copy.title);

      // 30 logos in placement order
      const logos = page.locator('.row.gal-doitac img.gal-doitac');
      await expect(logos).toHaveCount(30);

      const expectedSrcs = getExpectedLogoSrcs(localeIndex);
      for (let i = 0; i < 30; i++) {
        await expect(logos.nth(i)).toHaveAttribute('src', expectedSrcs[i]);
        await expect(logos.nth(i)).toHaveAttribute('alt', '');
        await expect(logos.nth(i)).toHaveAttribute('decoding', 'async');
      }

      // First VI logo is logo-wisdomland.png
      if (localeIndex === 0) {
        await expect(logos.first()).toHaveAttribute('src', /logo-wisdomland\.png/);
      }

      // No anchor / lightbox in grid
      await expect(page.locator('.row.gal-doitac a')).toHaveCount(0);

      // Logos are decorative: none has an accessible name
      const accessibleNames = await page
        .locator('.row.gal-doitac img, .row.gal-doitac a')
        .evaluateAll((elements) =>
          elements.map(
            (el) =>
              (el as HTMLElement).innerText ||
              el.getAttribute('aria-label') ||
              el.getAttribute('alt') ||
              '',
          ),
        );
      expect(accessibleNames.every((name) => name === '')).toBe(true);

      // Partner names never reach the DOM
      const partnerNames = homePages[localeIndex].partnerPlacements.map(
        (p) => partnerMap.get(p.entityId)!.name,
      );
      const pageText = await page.locator('.row-doitac').innerText();
      for (const name of partnerNames) {
        expect(pageText).not.toContain(name);
      }

      await expectNoDuplicateIds(page);
    }
  });

  const RESPONSIVE_COUNTS = [
    { width: 549, expectedCount: 3 },
    { width: 550, expectedCount: 3 },
    { width: 849, expectedCount: 3 },
    { width: 850, expectedCount: 6 },
  ];

  for (const { width, expectedCount } of RESPONSIVE_COUNTS) {
    test(`Partner grid renders ${expectedCount} logos per row at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/');

      const cols = page.locator('.row.gal-doitac .gallery-col');
      await expect(cols).toHaveCount(30);

      const firstRowCols = await cols.evaluateAll((elements) => {
        const htmlElements = elements as HTMLElement[];
        const top = htmlElements[0].offsetTop;
        return htmlElements.filter((el) => Math.abs(el.offsetTop - top) < 2).length;
      });
      expect(firstRowCols).toBe(expectedCount);
    });
  }

  test('Empty dev-fixture scenario renders no .row-doitac, partners section, or trailing gap', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const url of ['/dev-fixtures/home/empty', '/dev-fixtures/home/empty?locale=en']) {
      await page.goto(url);
      await expect(page.locator('.row-doitac')).toHaveCount(0);
      await expect(page.locator('#section_62935602')).toHaveCount(0);
      await expect(page.locator('#section_841675174')).toHaveCount(0);
      await expect(page.locator('#gap-1743500161')).toHaveCount(0);
      await expect(page.locator('#gap-974238391')).toHaveCount(0);
      await expect(page.locator('#section_1900032435')).toHaveCount(0);
      await expect(page.locator('#section_1228410742')).toHaveCount(0);
    }
  });
});
