import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { seoServices } from '@/data/services/seo';
import { ServicePackageCards, SERVICE_PACKAGE_CARDS_IDS_SEO_VI } from './ServicePackageCards';
import { mobileServices } from '@/data/services/mobile';
import { ServiceDetailCards, SERVICE_DETAIL_CARDS_IDS_MOBILE_VI } from './ServiceDetailCards';

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

  it('marks only the desktop row for the scroll stack', () => {
    const root = parse(
      renderToStaticMarkup(
        <ServicePackageCards
          copy={{ eyebrow: 'Bảng giá dịch vụ', title: 'SEO Từ Khóa' }}
          offerings={service.offerings}
          ids={SERVICE_PACKAGE_CARDS_IDS_SEO_VI}
          labels={labels}
        />,
      ),
    );
    const stacks = root.querySelectorAll('[data-scroll-stack]');
    expect(stacks).toHaveLength(1);
    expect(stacks[0].getAttribute('id')).toBe(SERVICE_PACKAGE_CARDS_IDS_SEO_VI.gridRow);
    expect(stacks[0].classList.contains('hide-for-small')).toBe(true);
  });
});

describe('ServiceDetailCards', () => {
  it('marks only the desktop row for the scroll stack', () => {
    const mobile = mobileServices.find((s) => s.locale === 'vi')!;
    const root = parse(
      renderToStaticMarkup(
        <ServiceDetailCards
          copy={{ eyebrow: 'Bảng giá dịch vụ', title: 'App Mobile' }}
          offerings={mobile.offerings}
          ids={SERVICE_DETAIL_CARDS_IDS_MOBILE_VI}
          labels={labels}
        />,
      ),
    );
    const stacks = root.querySelectorAll('[data-scroll-stack]');
    expect(stacks).toHaveLength(1);
    expect(stacks[0].getAttribute('id')).toBe(SERVICE_DETAIL_CARDS_IDS_MOBILE_VI.gridRow);
    expect(stacks[0].classList.contains('hide-for-small')).toBe(true);
  });
});
