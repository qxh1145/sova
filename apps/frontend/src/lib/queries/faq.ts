import { getRepository } from '@/lib/repositories';
import type { EntityId, FAQ, FAQTopic, Locale, RichContent, SiteSettings } from '@/types/content';
import { resolveSiteTokens } from './tokens';

const resolveRich = (content: RichContent, settings: SiteSettings): RichContent => ({
  ...content,
  html: resolveSiteTokens(content.html, settings),
});

/** FAQs in `ids` order with contact tokens resolved from the locale's SiteSettings. */
export async function getFAQs(ids: EntityId[], locale: Locale): Promise<FAQ[]> {
  const repository = getRepository();
  const faqs = await repository.getFAQs(ids, locale);
  if (!JSON.stringify(faqs).includes('{{site.')) return faqs;
  const settings = await repository.getSiteSettings(locale);
  return faqs.map((faq) => ({
    ...faq,
    question: resolveSiteTokens(faq.question, settings, false),
    answer: resolveRich(faq.answer, settings),
    ...(faq.sourceRevisions && {
      sourceRevisions: faq.sourceRevisions.map((revision) => ({
        ...revision,
        answer: resolveRich(revision.answer, settings),
      })),
    }),
  }));
}

export function getFAQTopics(locale: Locale): Promise<FAQTopic[]> {
  return getRepository().getFAQTopics(locale);
}
