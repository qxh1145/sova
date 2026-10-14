import type { HTMLElement } from 'node-html-parser';
import type { AssetRegistry } from '../assets.ts';
import type { AboutPageRecord, Feature, OfferingPanel } from '../../../src/types/content.ts';
import { slug } from '../faq.ts';
import { sanitize, type Stats } from '../html.ts';
import { linkModel, plain, trimBreaks } from '../services.ts';
import { readSlides } from '../social.ts';
import {
  count,
  EXPECTED,
  hooks,
  identity,
  must,
  readStats,
  rich,
  seoOf,
  type Page,
} from './shared.ts';

export function about(page: Page, registry: AssetRegistry, stats: Stats) {
  const { root, file, lineOf, route } = page;
  const { locale } = route;
  const content = must(root.querySelector('#content'), page, '#content');
  const heading = must(content.querySelectorAll('.banner .page_text_go h1'), page, 'hero heading');
  const textCol = must(heading[0].closest('.col'), page, 'hero column');
  const texts = textCol.querySelectorAll('.text');
  const after = texts
    .slice(texts.findIndex((t) => t.querySelector('h1')) + 1)
    .filter((t) => !t.querySelector('a.but-lh'));
  const heroLine = lineOf(heading[0].range[0]);
  const h = (line: number) => hooks(page, line, stats);
  const id = `about-${locale}`;
  const block = (el: HTMLElement, line: number) => trimBreaks(sanitize(el, h(line)));

  const goals = count(
    content
      .querySelectorAll('.row_muctieu.hide-for-small > .col')
      .filter((col) => col.querySelector('.icon-box')),
    EXPECTED.goals,
    page,
    'goals',
  ).map((col): Feature => {
    const line = lineOf(col.range[0]);
    const title = plain(must(col.querySelector('h3'), page, 'goal title'), stats);
    return {
      id: `${id}-goal-${slug(title)}`,
      title,
      body: rich(
        col
          .querySelectorAll('.mota_mt')
          .map((t) => block(t, line))
          .join(''),
        [{ file, line }],
      ),
      iconId: registry.image(col.querySelector('.icon-inner img'), file, lineOf),
    };
  });

  const panel =
    (kind: string) =>
    (col: HTMLElement): OfferingPanel => {
      const line = lineOf(col.range[0]);
      const titleEl = must(col.querySelector('h3'), page, `${kind} title`);
      const title = plain(titleEl, stats);
      const bullets = col.querySelectorAll('.icon-box-text p');
      const html = bullets.length
        ? `<ul>${bullets.map((p) => `<li>${sanitize(p, h(line))}</li>`).join('')}</ul>`
        : col
            .querySelectorAll('p')
            .map((p) => `<p>${sanitize(p, h(line))}</p>`)
            .join('');
      return {
        id: `${id}-${kind}-${slug(title)}`,
        title,
        content: rich(trimBreaks(html), [{ file, line }]),
      };
    };
  const purposePanels = count(
    content.querySelectorAll('.row_cacsp .col-line-top'),
    EXPECTED.purpose,
    page,
    'purpose panels',
  ).map(panel('purpose'));
  const capabilities = count(
    content.querySelectorAll('.hover_gra.hide-for-small .col-logo'),
    EXPECTED.capabilities,
    page,
    'capability panels',
  ).map(panel('capability'));

  // Timeline rows: year h3, title h3, body paragraphs (VI copy-paste bodies kept as-is).
  const timeline = count(
    content.querySelectorAll('section.hinhthanh-phattrien .row-full-width'),
    EXPECTED.timeline,
    page,
    'timeline rows',
  ).map((row) => {
    const text = must(
      row.querySelectorAll('.text').find((t) => t.querySelectorAll('h3').length === 2),
      page,
      'timeline text',
    );
    const line = lineOf(text.range[0]);
    const [year, title] = text.querySelectorAll('h3').map((el) => plain(el, stats));
    return {
      id: `${id}-timeline-${year}`,
      year,
      title,
      body: rich(
        trimBreaks(
          text
            .querySelectorAll('p')
            .map((p) => `<p>${sanitize(p, h(line))}</p>`)
            .join(''),
        ),
        [{ file, line }],
      ),
    };
  });

  const timelineDotId = must(
    registry.image(
      content.querySelector('section.hinhthanh-phattrien .text-border img'),
      file,
      lineOf,
    ),
    page,
    'timeline dot asset',
  );

  const seo = seoOf(page, registry, stats);
  const description = trimBreaks(after.map((t) => sanitize(t, h(heroLine))).join(''));
  const record: AboutPageRecord = {
    ...identity(page, id, seo, heroLine),
    translationKey: 'about',
    hero: {
      headingLines: heading.map((el) => plain(el, stats)),
      description: description
        ? rich(description, [{ file, line: lineOf(after[0].range[0]) }])
        : undefined,
      imageId: registry.image(content.querySelector('.banner .banner-bg img'), file, lineOf),
      cta: linkModel(textCol.querySelector('a.but-lh'), { file, lineOf, stats }),
    },
    seo,
    statIds: readStats(root, file, locale, stats).map((s) => s.id),
    goals,
    purposePanels,
    timeline,
    capabilities,
    partnerIds: [],
    testimonialIds: readSlides(root, file).map((s) => s.id),
    sectionCopy: {
      achievements: {
        title: locale === 'vi' ? 'Thành tựu chúng tôi đạt được' : 'Our Achievements',
        description:
          locale === 'vi'
            ? 'Đối với Sova xem mỗi dự án không chỉ là cơ hội tạo ra giá trị cho doanh nghiệp mà còn là sự đồng hành cùng doanh nghiệp, mang lại giá trị cộng hưởng cho khách hàng thông qua từng sản phẩm trải nghiệm số.'
            : 'Sova see every project as more than just a task — it’s a chance to co-create value with our clients, delivering meaningful digital experiences that drive impact and foster lasting partnerships.',
      },
      goals: {
        eyebrow: 'Target',
        title: locale === 'vi' ? 'Mục tiêu của chúng tôi' : 'Our Mission',
        description:
          locale === 'vi'
            ? 'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,\nvới mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.\nMỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.'
            : 'Sova are committed to continuously improving our service quality\nwith the goal of becoming the top choice for our clients.\nEvery project is both a new experience and a meaningful challenge for us.',
        descriptionLines:
          locale === 'vi'
            ? [
                'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,',
                'với mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.',
                'Mỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.',
              ]
            : [
                'Sova are committed to continuously improving our service quality',
                'with the goal of becoming the top choice for our clients.',
                'Every project is both a new experience and a meaningful challenge for us.',
              ],
      },
      purpose: {
        title: locale === 'vi' ? 'Các sản phẩm của Sova' : 'Our Products',
        ...(locale === 'vi' ? { titleLines: ['Các sản phẩm của', 'Sova'] } : {}),
        description:
          locale === 'vi'
            ? 'Tất cả đều đang đáp ứng chính xác nhu cầu của thị trường, đã được cấp chứng chỉ sở hữu trí tuệ từ Nhà nước, và sẵn sàng đồng hành cùng các tổ chức doanh nghiệp lớn, vừa và nhỏ để phát triển một cách toàn diện và bền vững.'
            : 'All of Sova’s products are precisely aligned with market demands, officially certified by the State for intellectual property rights, and ready to partner with financial institutions of all sizes — enabling comprehensive and sustainable growth.',
      },
      timeline: {
        title: locale === 'vi' ? 'Hình thành và phát triển' : 'Our Journey of Growth',
      },
      pillars: {
        eyebrow: locale === 'vi' ? 'Những dịch vụ' : 'Services',
        title: locale === 'vi' ? 'Có thể tìm thấy tại Sova' : 'What You Can Find at Sova',
        ...(locale === 'vi' ? { titleLines: ['Có thể tìm thấy tại', 'Sova'] } : {}),
        description:
          locale === 'vi'
            ? 'Khi trở thành khách hàng của Sova, bạn có thể sử dụng những dịch vụ do công ty cung cấp như sau'
            : 'As a client of Sova, you can take advantage of the following services provided by our company:',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: locale === 'vi' ? 'Khách hàng nhận xét về chúng tôi' : 'Customer Reviews',
        ...(locale === 'vi' ? { titleLines: ['Khách hàng nhận xét', 'về chúng tôi'] } : {}),
      },
    },
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    purposeImageId: 'asset-e0d6652ff9',
    timelineDotId,
  };
  return record;
}
