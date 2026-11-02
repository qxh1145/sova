import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { homePages } from '@/data/pages/home';
import { HomeHero } from './HomeHero';

const homeVi = homePages.find((p) => p.locale === 'vi')!;
const homeEn = homePages.find((p) => p.locale === 'en')!;

describe('HomeHero', () => {
  it('renders third typewriter line strong with home-hero-sheen class', () => {
    const html = renderToStaticMarkup(<HomeHero hero={homeVi.hero} locale="vi" />);
    const root = parse(html);

    const strongs = root.querySelectorAll('h1.home-hero-heading .typewriter strong');
    expect(strongs).toHaveLength(3);
    expect(strongs[0].getAttribute('class')).toBeFalsy();
    expect(strongs[1].getAttribute('class')).toBeFalsy();
    expect(strongs[2].getAttribute('class')).toContain('home-hero-sheen');
  });

  it('renders hero CTA anchor with data-pointer="cta" on VI and EN', () => {
    for (const page of [homeVi, homeEn]) {
      const html = renderToStaticMarkup(<HomeHero hero={page.hero} locale={page.locale} />);
      const root = parse(html);

      const cta = root.querySelector('.link_banner a');
      expect(cta).not.toBeNull();
      expect(cta?.getAttribute('data-pointer')).toBe('cta');
    }
  });
});
