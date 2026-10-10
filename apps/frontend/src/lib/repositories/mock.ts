import { assets } from '@/data/assets';
import { utilityContent } from '@/data/content';
import { faqs, faqTopics } from '@/data/faq';
import { listingSettings, listingSnapshots } from '@/data/listings';
import { navigation } from '@/data/navigation';
import { shellContent } from '@/data/shell';
import { aboutPages } from '@/data/pages/about';
import { contactPages } from '@/data/pages/contact';
import { homePages } from '@/data/pages/home';
import { legalPages, paymentGuides } from '@/data/pages/legal';
import { profiles } from '@/data/pages/profile';
import { faqPages } from '@/data/pages/faq';
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
import { resolveDeep } from '@/lib/queries/tokens';
import type { EntityId, Locale, PageResult, Post } from '@/types/content';
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

const RAW = new Set(['getSiteSettings', 'listRoutes']);
const isLocale = (value: unknown): value is Locale => value === 'vi' || value === 'en';
const localeOf = (value: unknown) =>
  value && typeof value === 'object' && 'locale' in value && isLocale(value.locale)
    ? value.locale
    : undefined;

/**
 * The token-resolution boundary: every query, test and scenario reads through here, so every
 * method but getSiteSettings/listRoutes returns copy with `{{site.*}}` resolved. The locale is the
 * method's locale argument (or `input.locale`), else the result's, else VI.
 */
function withSiteTokens(repository: ContentRepository, data: ContentData): ContentRepository {
  const wrap =
    (method: (...args: unknown[]) => Promise<unknown>) =>
    async (...args: unknown[]) => {
      const result = await method(...args);
      if (!JSON.stringify(result ?? null).includes('{{site.')) return result;
      const locale =
        args.find(isLocale) ?? args.map(localeOf).find(Boolean) ?? localeOf(result) ?? 'vi';
      const settings = data.siteSettings.find((s) => s.locale === locale);
      return settings ? resolveDeep(result, settings) : result;
    };
  return Object.fromEntries(
    Object.entries(repository).map(([name, method]) => [
      name,
      RAW.has(name) ? method : wrap(method),
    ]),
  ) as unknown as ContentRepository;
}

export function createMockRepository(data: ContentData): ContentRepository {
  return withSiteTokens(createRawRepository(data), data);
}

const isPublished = (post: Post) => post.editorial.status === 'published';

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, ' ');
}

function normalizeSearchText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, (m) => (m === 'đ' ? 'd' : 'D'))
    .replace(/\s+/g, ' ')
    .toLowerCase();
}

function createRawRepository(data: ContentData): ContentRepository {
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
    async getShellContent(locale) {
      return required(
        data.shellContent.find((s) => s.locale === locale),
        `ShellContent for locale "${locale}"`,
      );
    },
    async getService(key, locale) {
      return data.services.find((s) => s.key === key && s.locale === locale) ?? null;
    },
    async getProject(slug) {
      return data.projects.find((p) => p.slug === slug) ?? null;
    },
    async getProjectCategories() {
      return data.projectCategories;
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
      const post = data.posts.find((p) => p.slug === slug);
      return post && isPublished(post) ? post : null;
    },
    async listPosts({ locale, category, page, pageSize }) {
      const categoryIds = data.postCategories
        .filter((c) => c.slug === category && c.locale === locale)
        .map((c) => c.id);
      const items = data.posts.filter(
        (p) =>
          p.locale === locale &&
          isPublished(p) &&
          (!category || p.categoryIds.some((id) => categoryIds.includes(id))),
      );
      return paginate(items, page, pageSize);
    },
    async getPostCategories(locale) {
      const publishedPosts = data.posts.filter((p) => p.locale === locale && isPublished(p));
      return data.postCategories
        .filter((c) => c.locale === locale)
        .map((category) => {
          const count = publishedPosts.filter((p) => p.categoryIds.includes(category.id)).length;
          return { ...category, count };
        });
    },
    async getRelatedPosts(id) {
      const post = data.posts.find((p) => p.id === id);
      if (!post || !isPublished(post)) return [];
      return byIds(data.posts, post.relatedPostIds, (p) => isPublished(p));
    },
    async getRelatedProjects(id) {
      const project = data.projects.find((p) => p.id === id);
      if (!project) return [];
      return byIds(data.projects, project.relatedProjectIds);
    },
    async searchPosts({ locale, query, page, pageSize }) {
      const publishedPosts = data.posts.filter((p) => p.locale === locale && isPublished(p));
      const trimmed = query.trim();
      if (!trimmed) {
        return paginate(publishedPosts, page, pageSize);
      }
      const normalizedQuery = normalizeSearchText(trimmed);
      const matched = publishedPosts.filter((post) => {
        const textToSearch = `${post.title} ${post.excerpt} ${stripHtml(post.body.html)}`;
        return normalizeSearchText(textToSearch).includes(normalizedQuery);
      });
      return paginate(matched, page, pageSize);
    },
    async getFAQs(ids, locale) {
      return byIds(data.faqs, ids, (f) => f.locale === locale);
    },
    async getFAQTopics(locale) {
      return data.faqTopics.filter((t) => t.locale === locale);
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
    async getPaymentGuide(locale) {
      return data.paymentGuides.find((p) => p.locale === locale) ?? null;
    },
    async getProfile(locale) {
      return data.profiles.find((p) => p.locale === locale) ?? null;
    },
    async getFAQPage(locale) {
      return data.faqPages.find((p) => p.locale === locale) ?? null;
    },
    async getLegalPage(path, locale) {
      return data.legalPages.find((p) => p.path === path && p.locale === locale) ?? null;
    },
    async getListingSettings(routeId) {
      return data.listingSettings.find((l) => l.routeId === routeId) ?? null;
    },
    async getListingSnapshot(routeId, page) {
      return data.listingSnapshots.find((s) => s.routeId === routeId && s.page === page) ?? null;
    },
    async getUtilityContent(id) {
      return data.utilityContent.find((c) => c.id === id) ?? null;
    },
    async listRoutes() {
      return data.routes;
    },
  };
}

export const defaultContentData: ContentData = {
  siteSettings,
  navigation,
  shellContent,
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
  faqTopics,
  testimonials,
  partners,
  stats,
  pricing: [...websitePricing, ...emailPricing, ...hostingPricing, ...vpsPricing],
  assets,
  homePages,
  aboutPages,
  contactPages,
  legalPages,
  paymentGuides,
  profiles,
  faqPages,
  listingSettings,
  listingSnapshots,
  utilityContent,
};

export const mockRepository = createMockRepository(defaultContentData);
