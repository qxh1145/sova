import { expect, expectNoDuplicateIds, STAGING, test } from './fixtures';
import { homePages } from '../../src/data/pages/home';

test.describe('Partner logo grid', () => {
  test('VI and EN placements are empty, so the home routes render no partners section, headings, grid or trailing gap', async ({
    page,
  }) => {
    const cases = [
      {
        path: '/',
        localeIndex: 0,
        sectionId: '#section_62935602',
        gapId: '#gap-1743500161',
        eyebrowId: '#text-2149017180',
        titleId: '#text-1007250049',
      },
      {
        path: '/en/home/',
        localeIndex: 1,
        sectionId: '#section_841675174',
        gapId: '#gap-974238391',
        eyebrowId: '#text-3114286333',
        titleId: '#text-3018448185',
      },
    ];

    for (const { path, localeIndex, sectionId, gapId, eyebrowId, titleId } of cases) {
      expect(homePages[localeIndex].partnerPlacements).toEqual([]);

      await page.goto(path);

      await expect(page.locator(sectionId)).toHaveCount(0);
      await expect(page.locator(gapId)).toHaveCount(0);
      await expect(page.locator(eyebrowId)).toHaveCount(0);
      await expect(page.locator(titleId)).toHaveCount(0);
      await expect(page.locator('.row-doitac')).toHaveCount(0);
      await expect(page.locator('.gal-doitac')).toHaveCount(0);

      // The neighbouring sections still render.
      await expect(page.locator('.col-thanhtuu')).toBeVisible();
      await expect(page.locator('.cs-moving_text_wrap')).toBeVisible();

      await expectNoDuplicateIds(page);
    }
  });

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
