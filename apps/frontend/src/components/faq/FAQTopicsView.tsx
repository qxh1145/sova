import type { FAQ, FAQPageContent, FAQTopic } from '@/types/content';
import { PageHeroSimple } from '@/components/hero/PageHeroSimple';
import { FAQList } from '@/components/faq/FAQList';
import { Tabs, type TabItem } from '@/components/ui/Tabs';
import { getFAQPreset, topicSlug } from './faqIds';

export interface FAQTopicGroup {
  topic: FAQTopic;
  faqs: FAQ[];
}

export interface FAQTopicsViewProps {
  page: FAQPageContent;
  topics: FAQTopicGroup[];
}

export function FAQTopicsView({ page, topics }: FAQTopicsViewProps) {
  const preset = getFAQPreset(page.locale);

  const tabItems: TabItem[] = topics.map(({ topic, faqs }) => ({
    value: topicSlug(topic.label),
    title: topic.label,
    content: (
      <FAQList
        faqs={faqs}
        type="single"
        defaultOpen="first"
        className="ac-luutru"
        labels={{ toggle: page.locale === 'en' ? 'Toggle answer' : 'Mở rộng câu trả lời' }} // business-text-ok: accordion toggle label
      />
    ),
  }));

  const homeHref = page.locale === 'en' ? '/en/' : '/';

  return (
    <div id="content" role="main">
      <PageHeroSimple
        title={page.title}
        ids={preset.heroIds}
        breadcrumb={{
          homeLabel: page.breadcrumb.homeLabel,
          homeHref,
          current: page.breadcrumb.current,
        }}
      />
      <section className="section" id={preset.sectionId}>
        <div className="section-bg fill" />
        <div className="section-content relative">
          <div className="row" id={preset.rowId}>
            <div id={preset.colId} className="col small-12 large-12">
              <div className="col-inner">
                <Tabs items={tabItems} className="tab_cus_new" />
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
