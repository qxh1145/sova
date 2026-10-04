import path from 'node:path';
import type { HTMLElement } from 'node-html-parser';
import type { Locale, Partner, Testimonial } from '../../src/types/content.ts';
import { decodeEscapes } from '../../src/lib/content/brand.ts';
import { processHref, processText, sanitize, type Stats } from './html.ts';
import type { AssetRegistry } from './assets.ts';
import { PAGES } from './faq.ts';
import { load } from './projects.ts';

const HOME: Record<Locale, string> = { vi: 'index.html', en: 'en/home/index.html' };
const ABOUT: Record<Locale, string> = { vi: 'gioi-thieu/index.html', en: 'en/about-us/index.html' };
const EXPECTED_TESTIMONIALS = 3;
const EXPECTED_PARTNERS = 30;

/** File stem of an image src without the WordPress `-WxH` size suffix: the record id part. */
export const imageStem = (src: string) =>
  path
    .basename(decodeEscapes(src).split(/[?#]/)[0])
    .replace(/\.[^.]+$/, '')
    .replace(/-\d+x\d+$/, '');

/** The testimonial slides of a page (desktop slider), throwing when a slide has no avatar. */
export function readSlides(root: HTMLElement, file: string) {
  return root.querySelectorAll('.slide-kh .slider > .row').map((row) => {
    const avatar = row.querySelector('.icon-kh img');
    const src = avatar?.getAttribute('src');
    if (!avatar || !src) throw new Error(`${file}: testimonial slide has no avatar`);
    return { row, avatar, id: `testimonial-${imageStem(src)}` };
  });
}

export function importSocial(erasDir: string, registry: AssetRegistry, stats: Stats) {
  const testimonials: Testimonial[] = [];
  for (const locale of ['vi', 'en'] as const) {
    const parse = (file: string, register: boolean) => {
      const { root, lineOf } = load(erasDir, file);
      return readSlides(root, file).map(({ row, avatar, id }): Testimonial => {
        const line = lineOf(row.range[0]);
        const quote = row.querySelector('.nd-kh');
        const person = row.querySelector('.icon-kh h3');
        if (!quote || !person) throw new Error(`${file}:${line}: unexpected testimonial markup`);
        const role = row.querySelector('.icon-kh .text p');
        const testimonial: Testimonial = {
          id,
          locale,
          person: processText(person.rawText, stats).replace(/\s+/g, ' ').trim(),
          quote: {
            format: 'sanitized-html',
            html: sanitize(quote, {
              text: (raw) => processText(raw, stats),
              href: (raw) => processHref(raw, file, line, stats),
            }),
            assetIds: [],
            sources: [{ file, line: lineOf(quote.range[0]) }],
          },
          sources: [{ file, line }],
        };
        if (role) testimonial.role = processText(role.rawText, stats).replace(/\s+/g, ' ').trim();
        if (register) {
          const avatarId = registry.image(avatar, file, lineOf);
          if (!avatarId)
            throw new Error(`${file}:${line}: avatar ${avatar.getAttribute('src')} not found`);
          testimonial.avatarId = avatarId;
        }
        return testimonial;
      });
    };

    // Records come from the home page; every other page must show the same slides.
    const records = parse(HOME[locale], true);
    if (records.length !== EXPECTED_TESTIMONIALS)
      throw new Error(
        `Source drift: ${HOME[locale]} has ${records.length} testimonials, expected ${EXPECTED_TESTIMONIALS}`,
      );
    const signature = (list: Testimonial[]) =>
      JSON.stringify(list.map((t) => [t.id, t.person, t.role, t.quote.html]));
    const expected = signature(records);
    for (const file of [ABOUT[locale], ...PAGES[locale].services.map(([, f]) => f)]) {
      if (signature(parse(file, false)) !== expected)
        throw new Error(`Source drift: ${file} testimonials differ from ${HOME[locale]}`);
    }
    testimonials.push(...records);
  }

  // Partners: the VI home gallery. The lightbox href is the logo itself, so it is not imported.
  const file = HOME.vi;
  const { root, lineOf } = load(erasDir, file);
  const partners: Partner[] = root.querySelectorAll('.row.gal-doitac img.gal-doitac').map((img) => {
    const src = img.getAttribute('src') ?? '';
    const logoId = registry.image(img, file, lineOf);
    if (!logoId) throw new Error(`${file}: partner logo ${src} not found`);
    const stem = imageStem(src);
    const alt = processText(img.getAttribute('alt') ?? '', stats).trim();
    return {
      id: `partner-${stem}`,
      name: alt || stem.replace(/^logo-/i, ''),
      logoId,
      sources: [{ file, line: lineOf(img.range[0]) }],
    };
  });
  if (partners.length !== EXPECTED_PARTNERS)
    throw new Error(
      `Source drift: ${file} has ${partners.length} partner logos, expected ${EXPECTED_PARTNERS}`,
    );
  if (new Set(partners.map((p) => p.id)).size !== partners.length)
    throw new Error(`Source drift: ${file} has duplicate partner logos`);

  return { testimonials, partners };
}
