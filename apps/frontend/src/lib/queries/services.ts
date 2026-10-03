import { getRepository } from '@/lib/repositories';
import type { EntityId, Locale, Pricing, Service, ServiceKey } from '@/types/content';

export function getService(key: ServiceKey, locale: Locale): Promise<Service | null> {
  return getRepository().getService(key, locale);
}

export function getPricing(id: EntityId, locale: Locale): Promise<Pricing | null> {
  return getRepository().getPricing(id, locale);
}
