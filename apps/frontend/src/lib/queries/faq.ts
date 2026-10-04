import { getRepository } from '@/lib/repositories';
import type { EntityId, FAQ, FAQTopic, Locale } from '@/types/content';

/** FAQs in `ids` order; unknown ids are skipped. */
export function getFAQs(ids: EntityId[], locale: Locale): Promise<FAQ[]> {
  return getRepository().getFAQs(ids, locale);
}

export function getFAQTopics(locale: Locale): Promise<FAQTopic[]> {
  return getRepository().getFAQTopics(locale);
}
