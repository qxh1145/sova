import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { seoServices } from '@/data/services/seo';
import { ServicePackageCards, SERVICE_PACKAGE_CARDS_IDS_SEO_VI } from './ServicePackageCards';

const service = seoServices.find((s) => s.locale === 'vi')!;

const labels = {
  prev: 'Trước',
  next: 'Tiếp theo',
  goTo: 'Chuyển tới slide {index}',
  pause: 'Tạm dừng',
  play: 'Tiếp tục',
};

describe('ServicePackageCards', () => {
  it('renders CTA link with data-pointer="cta" on each offering', () => {
    const html = renderToStaticMarkup(
      <ServicePackageCards
        copy={{
          eyebrow: 'Bảng giá dịch vụ',
          title: 'SEO Từ Khóa',
        }}
        offerings={service.offerings}
        ids={SERVICE_PACKAGE_CARDS_IDS_SEO_VI}
        labels={labels}
      />,
    );
    const root = parse(html);

    const ctaLinks = root.querySelectorAll('a.but-lh');
    expect(ctaLinks.length).toBeGreaterThan(0);
    ctaLinks.forEach((a) => {
      expect(a.getAttribute('data-pointer')).toBe('cta');
    });
  });
});
