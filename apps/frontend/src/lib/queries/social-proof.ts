import { getRepository } from '@/lib/repositories';
import type { EntityId, Locale, Partner, Stat, Testimonial } from '@/types/content';

export function getTestimonials(ids: EntityId[], locale: Locale): Promise<Testimonial[]> {
  return getRepository().getTestimonials(ids, locale);
}

export function getPartners(ids: EntityId[]): Promise<Partner[]> {
  return getRepository().getPartners(ids);
}

export function getStats(ids: EntityId[]): Promise<Stat[]> {
  return getRepository().getStats(ids);
}
