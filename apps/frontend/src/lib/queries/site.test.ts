import { afterEach, expect, test, vi } from 'vitest';
import { getCounterpartMap, getShellContent, getSiteSettings, resolveRoute } from './site';

afterEach(() => {
  vi.unstubAllEnvs();
});

test('getSiteSettings resolves the mock record', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const settings = await getSiteSettings('vi');
  expect(settings.companyName).toBe('Sova');
});

test('getShellContent resolves shell content with tokens replaced', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const viShell = await getShellContent('vi');
  expect(viShell.locale).toBe('vi');
  expect(viShell.headerCta.label).toBe('Liên hệ');
  expect(viShell.copyright).toContain('Sova');
  expect(viShell.copyright).not.toContain('{{site.');

  const enShell = await getShellContent('en');
  expect(enShell.locale).toBe('en');
  expect(enShell.headerCta.label).toBe('Contact Us');
  expect(enShell.copyright).toContain('Sova');
  expect(enShell.copyright).not.toContain('{{site.');
});

test('getCounterpartMap maps canonical paths to counterparts', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const viMap = await getCounterpartMap('vi');
  expect(viMap['/']).toBe('/en/home/');
  expect(viMap['/lien-he/']).toBe('/en/contact-us/');

  const enMap = await getCounterpartMap('en');
  expect(enMap['/en/home/']).toBe('/');
  expect(enMap['/en/contact-us/']).toBe('/lien-he/');
});

test('resolveRoute resolves aliases over the repository', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  expect(await resolveRoute('/en/')).toMatchObject({
    route: { path: '/en/home/' },
    redirect: true,
  });
  expect(await resolveRoute('/cloud-vps/')).toBeNull();
});

