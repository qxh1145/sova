import { afterEach, expect, test, vi } from 'vitest';
import { getSiteSettings } from './site';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('getSiteSettings resolves the mock record', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const settings = await getSiteSettings('vi');
  expect(settings.companyName).toBe('Sova');
});
