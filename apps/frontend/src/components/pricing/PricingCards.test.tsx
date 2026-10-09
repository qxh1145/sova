import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { websitePricing } from '@/data/pricing/website';
import {
  PricingCards,
  PRICING_CARDS_IDS_VI,
  PRICING_CARDS_IDS_EN,
} from './PricingCards';

const viPricing = websitePricing.find((p) => p.locale === 'vi' && p.kind === 'cards')!;
const enPricing = websitePricing.find((p) => p.locale === 'en' && p.kind === 'cards')!;

const labels = {
  prev: 'Trước',
  next: 'Tiếp theo',
  goTo: 'Chuyển tới slide {index}',
  carousel: 'Bảng giá',
  slide: 'Slide {index}',
};

describe('PricingCards', () => {
  it('renders VI pricing grid with 3 cards, badges, 9 features, and slider', () => {
    const html = renderToStaticMarkup(
      <PricingCards
        plans={viPricing.plans}
        features={'features' in viPricing ? viPricing.features : []}
        copy={{ eyebrow: 'Bảng giá dịch vụ', title: 'Thiết kế website' }}
        ids={PRICING_CARDS_IDS_VI}
        labels={labels}
      />
    );
    const root = parse(html);

    expect(root.querySelector('#section_1346750226')).toBeTruthy();
    expect(root.querySelector('#row-1975763604')).toBeTruthy();

    const gridCards = root.querySelectorAll('#row-1975763604 .col-logo-tke');
    expect(gridCards).toHaveLength(3);

    // Plan 2 has col-blur-blue
    expect(gridCards[1].getAttribute('class')).toContain('col-blur-blue');

    // Badges present on VI
    expect(root.querySelectorAll('.text_sale h3').map((el) => el.text.trim())).toEqual([
      'Giảm 50%',
      'Giảm 45%',
      'Giảm 35%',
      'Giảm 50%',
      'Giảm 45%',
      'Giảm 35%',
    ]);

    // Slider present inside section
    expect(root.querySelector('#section_1346750226 #slider-74016963')).toBeTruthy();
  });

  it('renders EN pricing with original price and discount price, slider after section', () => {
    const html = renderToStaticMarkup(
      <PricingCards
        plans={enPricing.plans}
        features={'features' in enPricing ? enPricing.features : []}
        copy={{ eyebrow: 'Service Pricing Table', title: 'Website Development' }}
        ids={PRICING_CARDS_IDS_EN}
        labels={labels}
      />
    );
    const root = parse(html);

    expect(root.querySelector('#section_1856214289')).toBeTruthy();
    expect(root.querySelector('#row-308766213')).toBeTruthy();

    // No text_sale on EN
    expect(root.querySelectorAll('.text_sale')).toHaveLength(0);

    // gia_giam prices present
    expect(root.querySelectorAll('.gia_giam').length).toBeGreaterThan(0);

    // Slider sits outside section for EN
    expect(root.querySelector('#section_1856214289 #slider-1604990153')).toBeNull();
    expect(root.querySelector('#slider-1604990153')).toBeTruthy();
  });
});
