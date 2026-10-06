import { notFound } from 'next/navigation';
import { FAQList } from '@/components/faq/FAQList';
import { getFAQTopics, getPlacedFAQs } from '@/lib/queries/faq';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import type { ContentData } from '@/lib/repositories/contracts';
import type { Locale } from '@/types/content';
import { FIXTURE_FAQ_LABELS, isFAQVariant, type FAQVariant } from './constants';

export const dynamic = 'force-dynamic';

/** Real data with one VI FAQ answer edited; revision entries untouched. */
const faqChangedData: ContentData = (() => {
  const data = structuredClone(defaultContentData);
  const target = data.faqs.find((f) => f.id === 'faq-vi-3285462442');
  if (!target) throw new Error('faq-vi-3285462442 missing: faq changed fixture cannot apply');
  target.answer.html = '<p>Nội dung câu hỏi FAQ đã được chỉnh sửa cho fixture test.</p>';
  return data;
})();

const VARIANTS: Record<FAQVariant, ContentData> = {
  default: defaultContentData,
  changed: faqChangedData,
};

export default async function FixtureFAQPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ locale?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!isFAQVariant(variant)) {
    notFound();
  }

  const { locale: rawLocale } = (await searchParams) ?? {};
  const locale: Locale = rawLocale === 'en' ? 'en' : 'vi';

  const repo = createMockRepository(VARIANTS[variant]);

  const service = await repo.getService('seo', locale);
  if (!service) {
    notFound();
  }

  const seoFaqs = await getPlacedFAQs(service.faqs, locale, repo);
  const topics = await getFAQTopics(locale, repo);
  const topic = topics[0];
  const topicFaqs = topic ? await getPlacedFAQs(topic.items, locale, repo) : [];

  return (
    <main id="main" className="fixture-faq-page" style={{ padding: '40px 20px' }}>
      <section data-testid="seo-faq-section" className="section-seo-faqs">
        <FAQList
          faqs={seoFaqs}
          type="single"
          defaultOpen="first"
          className="ac-luutru"
          labels={FIXTURE_FAQ_LABELS}
        />
      </section>
      <section
        data-testid="topic-faq-section"
        className="section-topic-faqs"
        style={{ marginTop: 40 }}
      >
        <FAQList
          faqs={topicFaqs}
          type="multiple"
          defaultOpen="none"
          labels={FIXTURE_FAQ_LABELS}
        />
      </section>
    </main>
  );
}
