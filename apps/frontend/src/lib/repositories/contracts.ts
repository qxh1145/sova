import type {
  AboutPageRecord,
  AssetRef,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  FAQ,
  FAQPageContent,
  FAQTopic,
  HomePageRecord,
  LegalPage,
  ListingSettings,
  ListingSnapshot,
  Locale,
  Navigation,
  PageResult,
  Partner,
  PaymentGuideContent,
  Post,
  PostCategory,
  PostCategoryWithCount,
  Pricing,
  Project,
  ProjectCategory,
  RouteEntry,
  Service,
  ServiceKey,
  ShellContent,
  SiteSettings,
  Stat,
  Testimonial,
  UtilityContent,
} from '@/types/content';

/**
 * Every method but getSiteSettings and listRoutes returns copy with `{{site.*}}` tokens resolved
 * from that locale's SiteSettings (createMockRepository is the resolution boundary).
 */
export interface ContentRepository {
  /** Raw settings; throws when the locale has no record. */
  getSiteSettings(locale: Locale): Promise<SiteSettings>;
  /** Throws when the locale has no record. */
  getNavigation(locale: Locale): Promise<Navigation>;
  /** Throws when the locale has no record. */
  getShellContent(locale: Locale): Promise<ShellContent>;
  getService(key: ServiceKey, locale: Locale): Promise<Service | null>;
  getProject(slug: string): Promise<Project | null>;
  getProjectCategories(): Promise<ProjectCategory[]>;
  listProjects(input: {
    category?: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<Project>>;
  getPost(slug: string): Promise<Post | null>;
  listPosts(input: {
    locale: Locale;
    category?: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<Post>>;
  /**
   * Returns categories for the locale in source order, with counts computed from published posts.
   */
  getPostCategories(locale: Locale): Promise<PostCategoryWithCount[]>;
  /**
   * Posts referenced by `relatedPostIds` in post order; unknown ids skipped; published only.
   */
  getRelatedPosts(id: EntityId): Promise<Post[]>;
  /**
   * Projects referenced by `relatedProjectIds` in project order; unknown ids skipped.
   */
  getRelatedProjects(id: EntityId): Promise<Project[]>;
  /**
   * Published posts matching query in title, excerpt or body (HTML stripped), case- and accent-insensitive.
   * Blank query returns all published posts paginated.
   */
  searchPosts(input: {
    locale: Locale;
    query: string;
    page: number;
    pageSize: number;
  }): Promise<PageResult<Post>>;
  getFAQs(ids: EntityId[], locale: Locale): Promise<FAQ[]>;
  getFAQTopics(locale: Locale): Promise<FAQTopic[]>;
  getTestimonials(ids: EntityId[], locale: Locale): Promise<Testimonial[]>;
  getPartners(ids: EntityId[]): Promise<Partner[]>;
  getStats(ids: EntityId[]): Promise<Stat[]>;
  getPricing(id: EntityId, locale: Locale): Promise<Pricing | null>;
  getAssets(ids: EntityId[]): Promise<AssetRef[]>;
  getHomePage(locale: Locale): Promise<HomePageRecord | null>;
  getAboutPage(locale: Locale): Promise<AboutPageRecord | null>;
  getContactPage(locale: Locale): Promise<ContactPageContent | null>;
  getProfile(locale: Locale): Promise<CompanyProfileContent | null>;
  getFAQPage(locale: Locale): Promise<FAQPageContent | null>;
  getLegalPage(path: string, locale: Locale): Promise<LegalPage | null>;
  getPaymentGuide(locale: Locale): Promise<PaymentGuideContent | null>;
  getListingSettings(routeId: EntityId): Promise<ListingSettings | null>;
  getListingSnapshot(routeId: EntityId, page: number): Promise<ListingSnapshot | null>;
  /** Utility copy or project delivery terms (Project.deliveryTermsId). */
  getUtilityContent(id: EntityId): Promise<UtilityContent | null>;
  listRoutes(): Promise<RouteEntry[]>;
}

/** Everything a repository reads, one array per domain. */
export interface ContentData {
  siteSettings: SiteSettings[];
  navigation: Navigation[];
  shellContent: ShellContent[];
  routes: RouteEntry[];
  services: Service[];
  projects: Project[];
  projectCategories: ProjectCategory[];
  posts: Post[];
  postCategories: PostCategory[];
  faqs: FAQ[];
  faqTopics: FAQTopic[];
  testimonials: Testimonial[];
  partners: Partner[];
  stats: Stat[];
  pricing: Pricing[];
  assets: AssetRef[];
  homePages: HomePageRecord[];
  aboutPages: AboutPageRecord[];
  contactPages: ContactPageContent[];
  legalPages: LegalPage[];
  paymentGuides: PaymentGuideContent[];
  profiles: CompanyProfileContent[];
  faqPages: FAQPageContent[];
  listingSettings: ListingSettings[];
  listingSnapshots: ListingSnapshot[];
  utilityContent: UtilityContent[];
}
