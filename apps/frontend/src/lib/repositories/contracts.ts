import type {
  AboutPageRecord,
  AssetRef,
  CompanyProfileContent,
  ContactPageContent,
  EntityId,
  FAQ,
  FAQTopic,
  HomePageRecord,
  LegalPage,
  ListingSettings,
  Locale,
  Navigation,
  PageResult,
  Partner,
  PaymentGuideContent,
  Post,
  PostCategory,
  Pricing,
  Project,
  ProjectCategory,
  RouteEntry,
  Service,
  ServiceKey,
  SiteSettings,
  Stat,
  Testimonial,
} from '@/types/content';

export interface ContentRepository {
  /** Throws when the locale has no record. */
  getSiteSettings(locale: Locale): Promise<SiteSettings>;
  /** Throws when the locale has no record. */
  getNavigation(locale: Locale): Promise<Navigation>;
  getService(key: ServiceKey, locale: Locale): Promise<Service | null>;
  getProject(slug: string): Promise<Project | null>;
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
  getLegalPage(path: string, locale: Locale): Promise<LegalPage | null>;
  getPaymentGuide(locale: Locale): Promise<PaymentGuideContent | null>;
  getListingSettings(routeId: EntityId): Promise<ListingSettings | null>;
  listRoutes(): Promise<RouteEntry[]>;
}

/** Everything a repository reads, one array per domain. */
export interface ContentData {
  siteSettings: SiteSettings[];
  navigation: Navigation[];
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
  listingSettings: ListingSettings[];
}
