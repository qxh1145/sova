import { ALLOW_SERVER_ERROR, expect, STAGING, test } from './fixtures';

test.describe('error fixture', () => {
  test.use({
    allowConsole: [ALLOW_SERVER_ERROR],
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
