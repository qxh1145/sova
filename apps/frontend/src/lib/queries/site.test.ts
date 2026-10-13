import { afterEach, expect, test, vi } from 'vitest';
import {
  getCounterpartMap,
  getShellContent,
  getShellProps,
  getSiteSettings,
  resolveRoute,
  routeAlternates,
  seoMetadata,
} from './site';

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

test('getShellProps composes locale shell props', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const en = await getShellProps('en');
  expect(en.shellContent.locale).toBe('en');
  expect(en.headerCtas).toEqual({
    vi: { label: 'Liên hệ', href: '/en/contact-us/' },
    en: { label: 'Contact Us', href: '/en/contact-us/' },
  });
  expect(en.counterparts['/en/home/']).toBe('/');
});

test('routeAlternates handles paired, unpaired and unknown routes', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  // Paired route
  const paired = await routeAlternates('/thiet-ke-website/');
  expect(paired).toEqual({
    canonical: '/thiet-ke-website/',
    languages: {
      vi: '/thiet-ke-website/',
      en: '/en/website-development/',
    },
  });

  // Unpaired route (VI-only post)
  const unpaired = await routeAlternates('/5-yeu-to-cai-thien-trai-nghiem-nguoi-dung-ux/');
  expect(unpaired).toEqual({
    canonical: '/5-yeu-to-cai-thien-trai-nghiem-nguoi-dung-ux/',
    languages: {
      vi: '/5-yeu-to-cai-thien-trai-nghiem-nguoi-dung-ux/',
    },
  });

  // Unknown path
  const unknown = await routeAlternates('/unknown-nonexistent-path/');
  expect(unknown).toEqual({
    canonical: '/unknown-nonexistent-path/',
  });
});

test('seoMetadata produces canonical, alternates and robots when noIndex', async () => {
  vi.stubEnv('CONTENT_SCENARIO', '');
  const meta = await seoMetadata({
    title: 'Test Title',
    description: 'Test Desc',
    canonicalPath: '/thiet-ke-website/',
    noIndex: true,
  });
  expect(meta.title).toBe('Test Title');
  expect(meta.description).toBe('Test Desc');
  expect(meta.alternates).toEqual({
    canonical: '/thiet-ke-website/',
    languages: {
      vi: '/thiet-ke-website/',
      en: '/en/website-development/',
    },
  });
  expect(meta.robots).toEqual({ index: false, follow: true });

  const metaIndexed = await seoMetadata({
    title: 'Title 2',
    canonicalPath: '/thiet-ke-website/',
  });
  expect(metaIndexed.robots).toBeUndefined();
  expect(metaIndexed.description).toBeUndefined();
});
