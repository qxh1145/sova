import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { PageHero } from './PageHero';
import { ABOUT_HERO_IDS_VI } from '@/components/about/aboutHeroIds';

describe('PageHero', () => {
  it('renders CTA link with data-pointer="cta" when cta is present', () => {
    const html = renderToStaticMarkup(
      <PageHero
        hero={{
          headingLines: ['Về chúng tôi'],
          cta: { label: 'Liên hệ ngay', href: '/lien-he/' },
        }}
        ids={ABOUT_HERO_IDS_VI}
      />,
    );
    const root = parse(html);

    const cta = root.querySelector('a.but-lh');
    expect(cta).not.toBeNull();
    expect(cta?.getAttribute('data-pointer')).toBe('cta');
  });
});
