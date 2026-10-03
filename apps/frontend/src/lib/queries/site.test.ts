import { afterEach, expect, test, vi } from 'vitest';
import { getSiteSettings, resolveRoute } from './site';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('getSiteSettings resolves the mock record', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const settings = await getSiteSettings('vi');
  expect(settings.companyName).toBe('Sova');
});

test('resolveRoute resolves aliases over the repository', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  expect(await resolveRoute('/en/')).toMatchObject({
    route: { path: '/en/home/' },
    redirect: true,
  });
  expect(await resolveRoute('/cloud-vps/')).toBeNull();
});
