import { HTMLElement, TextNode } from 'node-html-parser';
import type { AssetRegistry } from '../assets.ts';
import type { ContactFormContent, ContactPageContent, Locale } from '../../../src/types/content.ts';
import { processText, sanitize, type Stats } from '../html.ts';
import { plain } from '../services.ts';
import {
  hooks,
  identity,
  must,
  rich,
  seoOf,
  type Page,
} from './shared.ts';

export const CONTACT_FORM_MESSAGES: Record<
  Locale,
  { required: string; emailInvalid: string; phoneInvalid: string }
> = {
  vi: {
    required: 'Vui lòng điền vào trường này.',
    emailInvalid: 'Địa chỉ email không hợp lệ.',
    phoneInvalid: 'Số điện thoại không hợp lệ',
  },
  en: {
    required: 'Please fill out this field.',
    emailInvalid: 'Please enter an email address.',
    phoneInvalid: 'Invalid phone number',
  },
};

export function contact(page: Page, registry: AssetRegistry, stats: Stats): ContactPageContent {
  const { root, file, lineOf, route } = page;
  const h1 = must(root.querySelector('#content h1'), page, 'h1');
  const heroImg = must(root.querySelector('#content section .section-bg img'), page, 'hero image');
  const heroImageId = must(registry.image(heroImg, file, lineOf), page, 'hero image asset');

  const heroSection = must(root.querySelector('#content > section'), page, 'hero section');
  const breadcrumb = must(heroSection.querySelector('p'), page, 'breadcrumb');
  const homeLink = must(breadcrumb.querySelector('a'), page, 'breadcrumb home link');
  const currentSpan = must(breadcrumb.querySelector('span'), page, 'breadcrumb current span');

  const h2s = root.querySelectorAll('#content h2');
  const sectionHeading = plain(must(h2s[0], page, 'section heading h2'), stats);
  const company = must(h2s[1], page, 'company h2');
  const intro = must(
    root
      .querySelectorAll('#content p')
      .find((p) => p.range[0] > company.range[0] && plain(p, stats)),
    page,
    'introduction',
  );
  const line = lineOf(intro.range[0]);
  const seo = seoOf(page, registry, stats);

  const icons = root.querySelectorAll('#content .icon-box .icon-inner img');
  if (icons.length !== 3) throw new Error(`Source drift: ${file} expected exactly 3 icon-box images`);
  const addressIconId = must(registry.image(icons[0], file, lineOf), page, 'address icon');
  const phoneIconId = must(registry.image(icons[1], file, lineOf), page, 'phone icon');
  const emailIconId = must(registry.image(icons[2], file, lineOf), page, 'email icon');

  const formEl = must(root.querySelector('.wpcf7 form'), page, 'contact form');
  const labelEls = formEl.querySelectorAll('label');
  if (labelEls.length !== 5) {
    throw new Error(`Source drift: ${file} expected exactly 5 form labels, found ${labelEls.length}`);
  }

  const labelTexts = labelEls.map((l) => {
    const firstText = l.childNodes.find((n) => n instanceof TextNode && n.rawText.trim());
    if (!firstText) throw new Error(`Source drift: ${file} label missing text node`);
    return processText(firstText.rawText.trim(), stats);
  });

  const optionEls = formEl.querySelectorAll('select option');
  if (optionEls.length !== 8) {
    throw new Error(`Source drift: ${file} expected exactly 8 select options, found ${optionEls.length}`);
  }

  const servicePrompt = plain(optionEls[0], stats);
  const serviceOptions = optionEls.slice(1).map((opt) => plain(opt, stats));

  const submitInput = must(
    formEl.querySelector('input.wpcf7-submit'),
    page,
    'submit input',
  );
  const submitValue = submitInput.getAttribute('value');
  if (!submitValue) {
    throw new Error(`Source drift: ${file} missing submit input value`);
  }
  const submit = processText(submitValue, stats);

  const messages = CONTACT_FORM_MESSAGES[route.locale];

  const formContent: ContactFormContent = {
    nameLabel: labelTexts[0],
    emailLabel: labelTexts[1],
    serviceLabel: labelTexts[2],
    servicePrompt,
    serviceOptions,
    phoneLabel: labelTexts[3],
    messageLabel: labelTexts[4],
    submit,
    required: messages.required,
    emailInvalid: messages.emailInvalid,
    phoneInvalid: messages.phoneInvalid,
  };

  return {
    ...identity(page, `contact-${route.locale}`, seo, lineOf(h1.range[0]), plain(h1, stats)),
    translationKey: 'contact',
    heroImageId,
    sectionHeading,
    heading: plain(company, stats),
    breadcrumb: {
      homeLabel: plain(homeLink, stats),
      current: plain(currentSpan, stats),
    },
    infoIconIds: {
      address: addressIconId,
      phone: phoneIconId,
      email: emailIconId,
    },
    introduction: rich(`<p>${sanitize(intro, hooks(page, line, stats))}</p>`, [{ file, line }]),
    form: formContent,
    seo,
  };
}
