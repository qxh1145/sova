import { assets } from '@/data/assets';
import { faqs } from '@/data/faq';
import { listingSettings } from '@/data/listings';
import { navigation } from '@/data/navigation';
import { aboutPages } from '@/data/pages/about';
import { contactPages } from '@/data/pages/contact';
import { homePages } from '@/data/pages/home';
import { legalPages } from '@/data/pages/legal';
import { profiles } from '@/data/pages/profile';
import { partners } from '@/data/partners';
import { postCategories } from '@/data/post-categories';
import { posts } from '@/data/posts';
import { emailPricing } from '@/data/pricing/email';
import { hostingPricing } from '@/data/pricing/hosting';
import { vpsPricing } from '@/data/pricing/vps';
import { websitePricing } from '@/data/pricing/website';
import { projectCategories } from '@/data/project-categories';
import { projects } from '@/data/projects';
import { routes } from '@/data/routes';
import { brandingServices } from '@/data/services/branding';
import { emailServices } from '@/data/services/email';
import { hostingServices } from '@/data/services/hosting';
import { mobileServices } from '@/data/services/mobile';
import { seoServices } from '@/data/services/seo';
import { storageServices } from '@/data/services/storage';
import { vpsServices } from '@/data/services/vps';
import { websiteServices } from '@/data/services/website';
import { siteSettings } from '@/data/site';
import { stats } from '@/data/stats';
import { testimonials } from '@/data/testimonials';
import type { EntityId, PageResult } from '@/types/content';
import type { ContentData, ContentRepository } from './contracts';

function paginate<T>(items: T[], page: number, pageSize: number): PageResult<T> {
  const valid = Number.isInteger(page) && Number.isInteger(pageSize) && page >= 1 && pageSize >= 1;
  const start = (page - 1) * pageSize;
  return {
    items: valid ? items.slice(start, start + pageSize) : [],
    total: items.length,
    page,
    pageSize,
  };
}

/** Records matching `ids`, in `ids` order; unknown ids are skipped. */
function byIds<T extends { id: EntityId }>(
  list: T[],
  ids: EntityId[],
  match: (item: T) => boolean = () => true,
): T[] {
  return ids.flatMap((id) => list.find((item) => item.id === id && match(item)) ?? []);
}

function required<T>(record: T | undefined, what: string): T {
  if (!record) throw new Error(`No ${what}`);
  return record;
}

export function createMockRepository(data: ContentData): ContentRepository {
  return {
    async getSiteSettings(locale) {
      return required(
        data.siteSettings.find((s) => s.locale === locale),
        `SiteSettings for locale "${locale}"`,
      );
    },
    async getNavigation(locale) {
      return required(
        data.navigation.find((n) => n.locale === locale),
        `Navigation for locale "${locale}"`,
      );
    },
    async getService(key, locale) {
      return data.services.find((s) => s.key === key && s.locale === locale) ?? null;
    },
    async getProject(slug) {
      return data.projects.find((p) => p.slug === slug) ?? null;
    },
    async listProjects({ category, page, pageSize }) {
      const categoryIds = data.projectCategories
        .filter((c) => c.slug === category)
        .map((c) => c.id);
      const items = category
        ? data.projects.filter((p) => p.categoryIds.some((id) => categoryIds.includes(id)))
        : data.projects;
      return paginate(items, page, pageSize);
    },
    async getPost(slug) {
      return data.posts.find((p) => p.slug === slug) ?? null;
    },
    async listPosts({ locale, category, page, pageSize }) {
      const categoryIds = data.postCategories
        .filter((c) => c.slug === category && c.locale === locale)
        .map((c) => c.id);
      const items = data.posts.filter(
        (p) =>
          p.locale === locale &&
          (!category || p.categoryIds.some((id) => categoryIds.includes(id))),
      );
      return paginate(items, page, pageSize);
    },
    async getFAQs(ids, locale) {
      return byIds(data.faqs, ids, (f) => f.locale === locale);
    },
    async getTestimonials(ids, locale) {
      return byIds(data.testimonials, ids, (t) => t.locale === locale);
    },
    async getPartners(ids) {
      return byIds(data.partners, ids);
    },
    async getStats(ids) {
      return byIds(data.stats, ids);
    },
    async getPricing(id, locale) {
      return data.pricing.find((p) => p.id === id && p.locale === locale) ?? null;
    },
    async getAssets(ids) {
      return byIds(data.assets, ids);
    },
    async getHomePage(locale) {
      return data.homePages.find((p) => p.locale === locale) ?? null;
    },
    async getAboutPage(locale) {
      return data.aboutPages.find((p) => p.locale === locale) ?? null;
    },
    async getContactPage(locale) {
      return data.contactPages.find((p) => p.locale === locale) ?? null;
    },
    async getProfile(locale) {
      return data.profiles.find((p) => p.locale === locale) ?? null;
    },
    async getLegalPage(path, locale) {
      return data.legalPages.find((p) => p.path === path && p.locale === locale) ?? null;
    },
    async getListingSettings(routeId) {
      return data.listingSettings.find((l) => l.routeId === routeId) ?? null;
    },
    async listRoutes() {
      return data.routes;
    },
  };
}

export const mockRepository = createMockRepository({
  siteSettings,
  navigation,
  routes,
  services: [
    ...websiteServices,
    ...mobileServices,
    ...seoServices,
    ...brandingServices,
    ...storageServices,
    ...emailServices,
    ...hostingServices,
    ...vpsServices,
  ],
  projects,
  projectCategories,
  posts,
  postCategories,
  faqs,
  testimonials,
  partners,
  stats,
  pricing: [...websitePricing, ...emailPricing, ...hostingPricing, ...vpsPricing],
  assets,
  homePages,
  aboutPages,
  contactPages,
  legalPages,
  profiles,
  listingSettings,
});
