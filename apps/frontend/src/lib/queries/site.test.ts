import { expect, test } from 'vitest';
import { getSiteSettings } from './site';

test('getSiteSettings resolves the mock record', async () => {
  const settings = await getSiteSettings('vi');
  expect(settings.companyName).toBe('Sova');
});
