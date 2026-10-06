import { notFound } from 'next/navigation';
import { FAQList } from '@/components/faq/FAQList';
import { Tabs } from '@/components/ui/Tabs';
import { Pagination } from '@/components/ui/Pagination.tsx';
import { getFAQTopics, getPlacedFAQs } from '@/lib/queries/faq';
import { createMockRepository, defaultContentData } from '@/lib/repositories/mock';
import type { Locale } from '@/types/content';
import {
  FIXTURE_FAQ_LABELS,
  FIXTURE_PAGINATION_LABELS_EN,
  FIXTURE_PAGINATION_LABELS_VI,
  isPrimitiveVariant,
} from './constants';
import { ActionPaginationDemo } from './ActionPaginationDemo';

export const dynamic = 'force-dynamic';

export default async function FixturePrimitivesPage({
  params,
  searchParams,
}: {
  params: Promise<{ variant: string }>;
  searchParams?: Promise<{ locale?: string; page?: string }>;
}) {
  if (process.env.FIXTURE_HARNESS !== '1') {
    notFound();
  }

  const { variant } = await params;
  if (!isPrimitiveVariant(variant)) {
    notFound();
  }

  const { locale: rawLocale, page: rawPage } = (await searchParams) ?? {};
  const locale: Locale = rawLocale === 'en' ? 'en' : 'vi';

  const repo = createMockRepository(defaultContentData);

  if (variant === 'tabs') {
    const topics = await getFAQTopics(locale, repo);
    const tabItems = await Promise.all(
      topics.map(async (topic) => {
        const placedFaqs = await getPlacedFAQs(topic.items, locale, repo);
        return {
          value: topic.id,
          title: topic.label,
          content: (
            <FAQList
              faqs={placedFaqs}
              type="single"
              defaultOpen="none"
              className="ac-luutru"
              labels={FIXTURE_FAQ_LABELS}
            />
          ),
        };
      }),
    );

    return (
      <main id="main" className="fixture-primitives-page" style={{ padding: '40px 20px' }}>
        <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
          <Tabs items={tabItems} className="tab_cus_new" />
        </div>
      </main>
    );
  }

  const currentPage = Number.parseInt(rawPage ?? '1', 10) || 1;
  const paginationLabels =
    locale === 'en' ? FIXTURE_PAGINATION_LABELS_EN : FIXTURE_PAGINATION_LABELS_VI;

  return (
    <main id="main" className="fixture-primitives-page" style={{ padding: '40px 20px' }}>
      <div className="container" style={{ maxWidth: 1200, margin: '0 auto' }}>
        <section data-testid="link-pagination-section">
          <Pagination
            current={currentPage}
            total={5}
            labels={paginationLabels}
            hrefForPage={(n: number) => {
              const sp = new URLSearchParams();
              if (locale === 'en') sp.set('locale', 'en');
              sp.set('page', String(n));
              return `/dev-fixtures/primitives/pagination?${sp.toString()}`;
            }}
          />
        </section>
        <section data-testid="action-pagination-section" style={{ marginTop: 40 }}>
          <ActionPaginationDemo
            labels={paginationLabels}
            initialPage={1}
            total={5}
          />
        </section>
      </div>
    </main>
  );
}
