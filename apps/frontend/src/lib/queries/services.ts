import { getRepository } from '@/lib/repositories';
import type {
  EntityId,
  FAQ,
  Locale,
  Pricing,
  Project,
  Service,
  ServiceKey,
  Testimonial,
} from '@/types/content';
import { applyFAQPlacements, getFAQs } from './faq';

export function getService(key: ServiceKey, locale: Locale): Promise<Service | null> {
  return getRepository().getService(key, locale);
}

export function getPricing(id: EntityId, locale: Locale): Promise<Pricing | null> {
  return getRepository().getPricing(id, locale);
}

export interface ServicePage {
  service: Service;
  /** In placement order; a placement's source revision replaces the canonical answer. */
  faqs: FAQ[];
  testimonials: Testimonial[];
  projects: Project[];
  pricing: Pricing | null;
}

/**
 * A service joined to its FAQs, testimonials, featured projects and pricing; null when the service is
 * missing. Throws naming the service and ids when a referenced record does not resolve.
 */
export async function getServicePage(key: ServiceKey, locale: Locale): Promise<ServicePage | null> {
  const repository = getRepository();
  const service = await repository.getService(key, locale);
  if (!service) return null;
  const placements = [...service.faqs].sort((a, b) => a.order - b.order);
  const [faqs, testimonials, allProjects, pricing] = await Promise.all([
    getFAQs(
      placements.map((p) => p.faqId),
      locale,
    ),
    repository.getTestimonials(service.testimonialIds, locale),
    // ponytail: no getProjects(ids) in the repository yet; one full page is fine for 62 mock projects.
    service.featuredProjectIds.length
      ? repository.listProjects({ page: 1, pageSize: Number.MAX_SAFE_INTEGER })
      : null,
    service.pricingId ? repository.getPricing(service.pricingId, locale) : null,
  ]);
  const projects = service.featuredProjectIds.flatMap(
    (id) => allProjects?.items.find((p) => p.id === id) ?? [],
  );
  const missing = [
    ...placements.map((p) => p.faqId).filter((id) => !faqs.some((f) => f.id === id)),
    ...service.testimonialIds.filter((id) => !testimonials.some((t) => t.id === id)),
    ...service.featuredProjectIds.filter((id) => !projects.some((p) => p.id === id)),
    ...(service.pricingId && !pricing ? [service.pricingId] : []),
  ];
  if (missing.length)
    throw new Error(`${service.id} references missing ids: ${missing.join(', ')}`);
  return {
    service,
    faqs: applyFAQPlacements(faqs, placements),
    testimonials,
    projects,
    pricing,
  };
}
