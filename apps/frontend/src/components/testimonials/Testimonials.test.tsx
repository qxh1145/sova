import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import {
  Testimonials,
  TESTIMONIALS_IDS_VI,
  TESTIMONIALS_IDS_EN,
  TESTIMONIALS_LABELS,
} from './Testimonials';
import type { AssetRef, SectionCopy, Testimonial } from '@/types/content';

describe('Testimonials component', () => {
  const mockTestimonials: Testimonial[] = [
    {
      id: 'testimonial-feedback-ten',
      locale: 'vi',
      person: 'Anh Bình',
      role: 'TGD TEN Group',
      quote: {
        format: 'sanitized-html',
        html: '<p>First quote text</p>',
        assetIds: [],
        sources: [],
      },
      avatarId: 'asset-avatar-1',
      sources: [],
    },
    {
      id: 'testimonial-feedback-dong-a',
      locale: 'vi',
      person: 'ĐỖ MỸ LINH',
      role: 'Founder Bệnh viện thẩm mỹ Đông Á',
      quote: {
        format: 'sanitized-html',
        html: '<p>Second quote text</p>',
        assetIds: [],
        sources: [],
      },
      avatarId: 'asset-avatar-2',
      sources: [],
    },
    {
      id: 'testimonial-feedback-vinatex',
      locale: 'vi',
      person: 'Anh Đức Anh',
      role: 'Giám đốc Trung tâm nghiên cứu sản phẩm Vinatex',
      quote: {
        format: 'sanitized-html',
        html: '<p>Third quote text</p>',
        assetIds: [],
        sources: [],
      },
      avatarId: 'asset-avatar-3',
      sources: [],
    },
  ];

  const mockAvatars: AssetRef[] = [
    {
      id: 'asset-avatar-1',
      src: '/wp-content/uploads/2025/08/feedback-ten-400x400.webp',
      alt: '',
      width: 400,
      height: 400,
      kind: 'image',
      status: 'local',
      sources: [],
    },
    {
      id: 'asset-avatar-2',
      src: '/wp-content/uploads/2025/08/feedback-dong-a-400x400.webp',
      alt: '',
      width: 400,
      height: 400,
      kind: 'image',
      status: 'local',
      sources: [],
    },
    {
      id: 'asset-avatar-3',
      src: '/wp-content/uploads/2025/08/feedback-vinatex-400x400.webp',
      alt: '',
      width: 400,
      height: 400,
      kind: 'image',
      status: 'local',
      sources: [],
    },
  ];

  const mockCopy: SectionCopy = {
    eyebrow: 'Sova',
    title: 'Khách hàng nhận xét về chúng tôi',
  };

  const mockArt = {
    photo: {
      id: 'asset-photo',
      src: '/wp-content/uploads/2025/08/A8-Feedback-122.webp',
      alt: '',
      width: 700,
      height: 461,
      kind: 'image' as const,
      status: 'local' as const,
      sources: [],
    },
    quoteIcon: {
      id: 'asset-quote-icon',
      src: '/wp-content/uploads/2024/02/Group.svg',
      alt: '',
      width: 55,
      height: 55,
      kind: 'image' as const,
      status: 'local' as const,
      sources: [],
    },
    line: {
      id: 'asset-line',
      src: '/wp-content/uploads/2024/02/Vector-268.svg',
      alt: '',
      width: 726,
      height: 57,
      kind: 'image' as const,
      status: 'local' as const,
      sources: [],
    },
  };

  it('renders 3 cells with correct structure, texts, and art in VI ids', () => {
    const html = renderToStaticMarkup(
      <Testimonials
        testimonials={mockTestimonials}
        avatars={mockAvatars}
        copy={mockCopy}
        art={mockArt}
        ids={TESTIMONIALS_IDS_VI}
        labels={TESTIMONIALS_LABELS.vi}
      />,
    );
    const root = parse(html);

    // Section wrapper
    const section = root.querySelector('#section_1900032435');
    expect(section).not.toBeNull();
    expect(section?.classList.contains('ss-kh')).toBe(true);

    // Side photo
    const sidePhoto = root.querySelector('#image_1870701100 img');
    expect(sidePhoto?.getAttribute('src')).toBe(mockArt.photo.src);

    // Heading and eyebrow
    expect(root.querySelector('#text-355018751')?.text).toContain('Sova');
    expect(root.querySelector('#text-4267280504')?.text).toContain(
      'Khách hàng nhận xét về chúng tôi',
    );

    // Divider line and quote icon
    const quoteIcon = root.querySelector('#col-55011168 > .col-inner > p img');
    expect(quoteIcon?.getAttribute('src')).toBe(mockArt.quoteIcon.src);

    // 3 slides
    const slider = root.querySelector('#slider-1717467276');
    expect(slider).not.toBeNull();

    const slideRows = slider?.querySelectorAll('.row.row-collapse.row-full-width') ?? [];
    expect(slideRows).toHaveLength(3);

    // Verify slide 0 ids
    expect(slideRows[0].getAttribute('id')).toBe('row-14011233');
    expect(slideRows[0].querySelector('.nd-kh')?.getAttribute('id')).toBe('text-1590618984');
    expect(slideRows[0].querySelector('.nd-kh')?.innerHTML).toContain('First quote text');
    expect(slideRows[0].querySelector('#text-867299508 img')?.getAttribute('src')).toBe(
      mockArt.line.src,
    );
    expect(slideRows[0].querySelector('#text-210173545')?.text).toContain('Anh Bình');
    expect(slideRows[0].querySelector('#text-210173545')?.text).toContain('TGD TEN Group');
    expect(slideRows[0].querySelector('.icon-box-img img')?.getAttribute('src')).toBe(
      mockAvatars[0].src,
    );
    expect(slideRows[0].querySelector('.icon-box-img img')?.getAttribute('class')).toBe(
      'attachment-medium size-medium',
    );

    // Verify slide 1 and 2 ids
    expect(slideRows[1].getAttribute('id')).toBe('row-693377910');
    expect(slideRows[2].getAttribute('id')).toBe('row-2021009934');

    // No duplicate ids
    const allIds = root.querySelectorAll('[id]').map((el) => el.getAttribute('id')!);
    const uniqueIds = new Set(allIds);
    expect(uniqueIds.size).toBe(allIds.length);
  });

  it('restores title line breaks and names the carousel region after the title', () => {
    const html = renderToStaticMarkup(
      <Testimonials
        testimonials={mockTestimonials}
        avatars={mockAvatars}
        copy={{ ...mockCopy, titleLines: ['Khách hàng nhận xét', 'về chúng tôi'] }}
        art={mockArt}
        ids={TESTIMONIALS_IDS_VI}
        labels={TESTIMONIALS_LABELS.vi}
      />,
    );
    const root = parse(html);

    expect(root.querySelector('#text-4267280504 h2')?.innerHTML).toBe(
      'Khách hàng nhận xét <br>về chúng tôi',
    );
    expect(root.querySelector('#slider-1717467276 [aria-label]')?.getAttribute('aria-label')).toBe(
      mockCopy.title,
    );
  });

  it('renders with EN ids for English locale', () => {
    const html = renderToStaticMarkup(
      <Testimonials
        testimonials={mockTestimonials}
        avatars={mockAvatars}
        copy={{ eyebrow: 'Sova', title: 'Customer Reviews' }}
        art={mockArt}
        ids={TESTIMONIALS_IDS_EN}
        labels={TESTIMONIALS_LABELS.en}
      />,
    );
    const root = parse(html);

    expect(root.querySelector('#section_1228410742')).not.toBeNull();
    expect(root.querySelector('#slider-283546209')).not.toBeNull();
    expect(root.querySelector('#row-1450896083')).not.toBeNull();
    expect(root.querySelector('#row-1154937134')).not.toBeNull();
    expect(root.querySelector('#row-1376163772')).not.toBeNull();
  });

  it('omits .icon-box-img when testimonial has no avatarId or avatar is missing', () => {
    const itemsWithoutAvatar: Testimonial[] = [
      {
        ...mockTestimonials[0],
        avatarId: undefined,
      },
    ];

    const html = renderToStaticMarkup(
      <Testimonials
        testimonials={itemsWithoutAvatar}
        avatars={[]}
        copy={mockCopy}
        art={mockArt}
        ids={TESTIMONIALS_IDS_VI}
        labels={TESTIMONIALS_LABELS.vi}
      />,
    );
    const root = parse(html);

    expect(root.querySelector('.icon-box-img')).toBeNull();
    expect(root.querySelector('.icon-box-text')?.text).toContain('Anh Bình');
  });

  it('returns null and renders nothing when testimonials list is empty', () => {
    const html = renderToStaticMarkup(
      <Testimonials
        testimonials={[]}
        avatars={mockAvatars}
        copy={mockCopy}
        art={mockArt}
        ids={TESTIMONIALS_IDS_VI}
        labels={TESTIMONIALS_LABELS.vi}
      />,
    );
    expect(html).toBe('');
  });
});
