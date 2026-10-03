// Guards the committed importer output (the importer itself cannot run in CI).
import { expect, test } from 'vitest';
import { BRAND_LEAK_RE } from '@/lib/content/brand';
import { SCRUB_RULES } from '@/lib/content/scrub';
import type { Pricing, Service } from '@/types/content';
import { assets } from './assets';
import { faqs } from './faq';
import { partners } from './partners';
import { emailPricing } from './pricing/email';
import { hostingPricing } from './pricing/hosting';
import { vpsPricing } from './pricing/vps';
import { websitePricing } from './pricing/website';
import { projects } from './projects';
import { brandingServices } from './services/branding';
import { emailServices } from './services/email';
import { hostingServices } from './services/hosting';
import { mobileServices } from './services/mobile';
import { seoServices } from './services/seo';
import { storageServices } from './services/storage';
import { vpsServices } from './services/vps';
import { websiteServices } from './services/website';
import { testimonials } from './testimonials';

const services: Service[] = [
  ...websiteServices,
  ...mobileServices,
  ...seoServices,
  ...brandingServices,
  ...storageServices,
  ...emailServices,
  ...hostingServices,
  ...vpsServices,
];
const pricing: Pricing[] = [...websitePricing, ...emailPricing, ...hostingPricing, ...vpsPricing];
const assetIds = new Set(assets.map((a) => a.id));

test('16 services, one per key and locale, with unique ids', () => {
  expect(services).toHaveLength(16);
  expect(new Set(services.map((s) => s.id)).size).toBe(16);
  for (const key of new Set(services.map((s) => s.key))) {
    const pair = services.filter((s) => s.key === key);
    expect(pair.map((s) => s.locale).sort()).toEqual(['en', 'vi']);
    expect(pair.every((s) => s.translationKey === `service-${key}`)).toBe(true);
  }
});

test('parents, pricing ids and plan counts follow the source', () => {
  const by = (key: string, locale = 'vi') =>
    services.find((s) => s.key === key && s.locale === locale)!;
  expect(
    services
      .filter((s) => s.parentKey)
      .map((s) => `${s.key}:${s.parentKey}`)
      .sort(),
  ).toEqual(['hosting:storage', 'hosting:storage', 'vps:storage', 'vps:storage']);
  expect(services.filter((s) => s.pricingId).map((s) => s.key)).toEqual([
    'website',
    'website',
    'email',
    'email',
    'hosting',
    'hosting',
    'vps',
    'vps',
  ]);
  const plans = Object.fromEntries(pricing.map((p) => [`${p.locale}:${p.id}`, p.plans.length]));
  expect(plans).toEqual({
    'vi:pricing-website': 3,
    'en:pricing-website': 3,
    'vi:pricing-email': 7,
    'en:pricing-email': 5,
    'vi:pricing-hosting': 8,
    'en:pricing-hosting': 8,
    'vi:pricing-vps': 6,
    'en:pricing-vps': 6,
  });
  for (const p of pricing) {
    if (p.kind === 'table') {
      expect(p.rows.map((r) => r.id)).toEqual(p.plans.map((plan) => plan.id));
      for (const row of p.rows) expect(Object.keys(row.cells)).toEqual(p.columns.map((c) => c.id));
      for (const plan of p.plans) expect(plan.price?.period).toBe('month');
    } else {
      expect(p.plans.map((plan) => !!plan.recommended)).toEqual([false, true, false]);
      for (const plan of p.plans) {
        expect(plan.featureIds).toHaveLength(9);
        for (const id of plan.featureIds) expect(p.features.map((f) => f.id)).toContain(id);
        if (p.locale === 'vi')
          expect([plan.discountLabel, plan.price]).toEqual([expect.any(String), undefined]);
        else expect([plan.discountLabel, plan.price?.period]).toEqual([undefined, 'once']);
      }
    }
  }
  expect(by('website').featuredProjectIds).toHaveLength(6);
  expect(by('website', 'en').featuredProjectIds).toEqual([]);
});

test('every reference resolves in the same locale', () => {
  const projectIds = new Set(projects.map((p) => p.id));
  for (const service of services) {
    const { locale } = service;
    expect(service.faqs.map((p) => p.order)).toEqual(service.faqs.map((_, i) => i + 1));
    for (const placement of service.faqs) {
      const faq = faqs.find((f) => f.id === placement.faqId);
      expect(faq?.locale, `${service.id} ${placement.faqId}`).toBe(locale);
      if (placement.sourceRevisionId)
        expect(faq?.sourceRevisions?.map((r) => r.id)).toContain(placement.sourceRevisionId);
    }
    for (const id of service.testimonialIds)
      expect(testimonials.some((t) => t.id === id && t.locale === locale)).toBe(true);
    for (const id of service.featuredProjectIds) expect(projectIds).toContain(id);
    if (service.pricingId)
      expect(pricing.some((p) => p.id === service.pricingId && p.locale === locale)).toBe(true);
    const ids = [
      service.hero.imageId,
      service.hero.videoId,
      service.seo.imageId,
      ...service.benefits.map((b) => b.iconId),
      ...service.offerings.map((o) => o.mediaId),
    ];
    for (const id of ids.filter(Boolean)) expect(assetIds, `${service.id} ${id}`).toContain(id);
  }
  expect(services.flatMap((s) => s.faqs).filter((p) => p.sourceRevisionId)).toHaveLength(1);
  for (const t of testimonials) if (t.avatarId) expect(assetIds).toContain(t.avatarId);
  for (const p of partners) expect(assetIds).toContain(p.logoId);
});

test('3 testimonials per locale, 30 partners, every record keeps its source', () => {
  expect(testimonials.filter((t) => t.locale === 'vi')).toHaveLength(3);
  expect(testimonials.filter((t) => t.locale === 'en')).toHaveLength(3);
  expect(partners).toHaveLength(30);
  expect(new Set(partners.map((p) => p.id)).size).toBe(30);
  for (const record of [...services, ...pricing, ...testimonials, ...partners])
    expect(record.sources.length).toBeGreaterThan(0);
});

test('no Eras word or raw Eras contact value in service, pricing, testimonial and partner text', () => {
  const text = JSON.stringify({ services, pricing, testimonials, partners });
  expect([...text.matchAll(BRAND_LEAK_RE)].map((m) => m[0])).toEqual([]);
  expect(text.match(/\bERAS\b|Sova VietNam/g)).toBeNull();
  for (const [pattern] of SCRUB_RULES) expect(text.match(pattern)).toBeNull();
});
