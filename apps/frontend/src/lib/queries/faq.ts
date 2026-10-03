import { getRepository } from '@/lib/repositories';
import type { EntityId, FAQ, Locale } from '@/types/content';

export function getFAQs(ids: EntityId[], locale: Locale): Promise<FAQ[]> {
  return getRepository().getFAQs(ids, locale);
}
