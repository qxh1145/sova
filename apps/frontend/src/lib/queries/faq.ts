import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type { EntityId, FAQ, FAQPlacement, FAQTopic, Locale } from '@/types/content';

/** FAQs in `ids` order; unknown ids are skipped. The repository is injectable so fixtures can run this path. */
export function getFAQs(
  ids: EntityId[],
  locale: Locale,
  repo: ContentRepository = getRepository(),
): Promise<FAQ[]> {
  return repo.getFAQs(ids, locale);
}

export function getFAQTopics(
  locale: Locale,
  repo: ContentRepository = getRepository(),
): Promise<FAQTopic[]> {
  return repo.getFAQTopics(locale);
}

/**
 * Applies source revision answers specified by placements to the matching FAQs.
 * Does not mutate the source FAQ or its answer.
 * If a revision is not found or placement has no revision, the base answer is retained.
 */
export function applyFAQPlacements(faqs: FAQ[], placements: FAQPlacement[]): FAQ[] {
  return faqs.map((faq) => {
    const revisionId = placements.find((p) => p.faqId === faq.id)?.sourceRevisionId;
    if (!revisionId) return faq;
    const revision = faq.sourceRevisions?.find((r) => r.id === revisionId);
    return revision ? { ...faq, answer: revision.answer } : faq;
  });
}

/**
 * Sorts placements by `order`, fetches the FAQs in that order, and applies any revision answers.
 */
export async function getPlacedFAQs(
  placements: FAQPlacement[],
  locale: Locale,
  repo: ContentRepository = getRepository(),
): Promise<FAQ[]> {
  const sorted = [...placements].sort((a, b) => a.order - b.order);
  const ids = sorted.map((p) => p.faqId);
  const faqs = await getFAQs(ids, locale, repo);
  return applyFAQPlacements(faqs, sorted);
}
