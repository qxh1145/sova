import { ALLOW_SERVER_ERROR, expect, KNOWN_ABSENT_CSS_ASSETS, STAGING, test } from './fixtures';

test.describe('error fixture', () => {
  test.use({
    allowConsole: [ALLOW_SERVER_ERROR],
  });

  // Same 404 collector as home-hero.spec.ts, which wrapped this describe before the split.
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

  test('Given the error scenario, then the localized error renders with no error message or stack', async ({
    page,
  }) => {
    test.skip(STAGING, 'Dev fixtures are not deployed to staging');

    for (const [url, expectedTitle] of [
      ['/dev-fixtures/home/error', 'Đã có lỗi xảy ra'],
      ['/dev-fixtures/home/error?locale=en', 'An error occurred'],
    ]) {
      await page.goto(url);
      const error = page.locator('.page-error-main');
      await expect(error.locator('h2')).toHaveText(expectedTitle);
      const text = await error.innerText();
      expect(text).not.toContain('Transport error');
      expect(text).not.toContain('Error:');
      expect(text).not.toContain('stack');

      // Retry re-runs the server render; the error repository still rejects.
      await error.getByRole('button').click();
      await expect(page.locator('.page-error-main h2')).toHaveText(expectedTitle);
    }
  });
});
