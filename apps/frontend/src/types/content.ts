// Shapes copied from docs/DATA_MODEL.md. SiteSettings adds wordmark/messengerHref/zaloHref.

export type Locale = 'vi' | 'en';
export type EntityId = string;
export type PublicPath = `/${string}`;

export interface SourceRef {
  file: string;
  line: number;
  sourceId?: string;
}

export interface AssetRef {
  id: EntityId;
  src: string;
  alt: string;
  width?: number;
  height?: number;
  kind: 'image' | 'video' | 'font' | 'pdf' | 'icon';
  status: 'local' | 'remote' | 'missing';
  sources: SourceRef[];
}

export interface LinkModel {
  label: string;
  href: string;
  external?: boolean;
}

export interface RichContent {
  format: 'sanitized-html';
  html: string;
  assetIds: EntityId[];
  sources: SourceRef[];
}

export interface LocalizedIdentity {
  id: EntityId;
  locale: Locale;
  path: PublicPath;
  title: string;
  translationKey?: string;
  sources: SourceRef[];
}

export interface SEO {
  title: string;
  description?: string;
  canonicalPath: PublicPath;
  imageId?: EntityId;
  noIndex?: boolean;
}

export interface Feature {
  id: EntityId;
  title: string;
  body: RichContent;
  iconId?: EntityId;
}

export interface HeroContent {
  headingLines: string[];
  description?: RichContent;
  imageId?: EntityId;
  bgImageId?: EntityId;
  videoId?: EntityId;
  cta?: LinkModel;
  breadcrumb?: { label: string; href?: string }[];
}

export type ServiceKey =
  'website' | 'mobile' | 'seo' | 'branding' | 'storage' | 'email' | 'hosting' | 'vps';

export type Asset = AssetRef;

export interface Service extends LocalizedIdentity {
  key: ServiceKey;
  summary: string;
  homeSummary: string;
  subServices: { label: string; href: string }[];
  arrowHref: string;
  parentKey?: ServiceKey;
  hero: HeroContent;
  benefits: Feature[];
  faqs: FAQPlacement[];
  testimonialIds: EntityId[];
  featuredProjectIds: EntityId[];
  pricingId?: EntityId;
  /** Background image of the benefits icon-card section (hosting/VPS `ss-ndv-seo`). */
  benefitsBgImageId?: EntityId;
  seo: SEO;
  /** Why-choose-us (website/mobile), packages (SEO/branding), hub summaries (storage); else []. */
  offerings: OfferingPanel[];
  /** Section headings; `contact` is the website form copy. */
  sectionCopy: Partial<Record<ServiceSection, SectionCopy>>;
}

export type ServiceSection =
  'intro' | 'benefits' | 'offerings' | 'pricing' | 'projects' | 'testimonials' | 'faq' | 'contact';

export interface OfferingPanel {
  id: EntityId;
  title: string;
  slideTitle?: string;
  content: RichContent;
  items?: string[];
  mediaId?: EntityId;
  cta?: { label: string; routeId: EntityId };
}

export interface WebsiteContent {
  serviceId: EntityId;
  whyChooseUs: OfferingPanel[];
  contactHeading: string;
  contactCopy: RichContent;
}

export interface Project extends LocalizedIdentity {
  slug: string;
  categoryIds: EntityId[];
  thumbnailId?: EntityId;
  heroImageId?: EntityId;
  galleryIds: EntityId[];
  summary?: string;
  body: RichContent;
  publishedAt?: string;
  displayDate?: string;
  clientName?: string;
  metadata: { label: string; value: string }[];
  /** A `UtilityContent` id. */
  deliveryTermsId?: EntityId;
  relatedProjectIds: EntityId[];
  seo: SEO;
}

export interface ProjectCategory {
  id: EntityId;
  slug: 'website' | 'branding' | 'mobile-app';
  label: string;
  locale: Locale;
  path: PublicPath;
}

export interface FAQ {
  id: EntityId;
  locale: Locale;
  question: string;
  answer: RichContent;
  topicIds: EntityId[];
  serviceKeys: ServiceKey[];
  sources: SourceRef[];
  sourceRevisions?: { id: EntityId; answer: RichContent; sources: SourceRef[] }[];
}

export interface FAQPlacement {
  faqId: EntityId;
  order: number;
  sourceRevisionId?: EntityId;
}

export interface FAQTopic {
  id: EntityId;
  locale: Locale;
  label: string;
  items: FAQPlacement[];
}

export interface Testimonial {
  id: EntityId;
  locale: Locale;
  person: string;
  role?: string;
  company?: string;
  quote: RichContent;
  avatarId?: EntityId;
  sources: SourceRef[];
}

export interface Partner {
  id: EntityId;
  name: string;
  logoId: EntityId;
  href?: string;
  sources: SourceRef[];
}

export interface Post extends LocalizedIdentity {
  slug: string;
  categoryIds: EntityId[];
  excerpt: string;
  body: RichContent;
  thumbnailId?: EntityId;
  featuredImageId?: EntityId;
  author: { id: EntityId; name: string; href?: string };
  publishedAt?: string;
  modifiedAt?: string;
  displayDate?: string;
  relatedPostIds: EntityId[];
  seo: SEO;
}

export interface PostCategory {
  id: EntityId;
  locale: Locale;
  slug: string;
  title: string;
  path: PublicPath;
  sourceDisplayCount?: number;
}

export interface Money {
  amount: number;
  currency: 'VND' | 'USD';
  period: 'once' | 'month' | 'year';
  displayText: string;
  taxNote?: string;
}

export interface PricingPlan {
  id: EntityId;
  name: string;
  price?: Money;
  originalPrice?: Money;
  discountLabel?: string;
  note?: string;
  featureIds: EntityId[];
  cta: LinkModel;
  recommended?: boolean;
}

export interface PricingFeature {
  id: EntityId;
  label: string;
  group?: string;
}

export type PricingCell =
  | { kind: 'text'; value: string }
  | { kind: 'included'; value: boolean }
  | { kind: 'money'; value: Money };

export type Pricing = {
  id: EntityId;
  locale: Locale;
  serviceKey: ServiceKey;
  heading: string;
  plans: PricingPlan[];
  sources: SourceRef[];
} & (
  | { kind: 'cards'; features: PricingFeature[] }
  | {
      kind: 'table';
      columns: { id: EntityId; label: string; planId?: EntityId }[];
      rows: { id: EntityId; label: string; cells: Record<EntityId, PricingCell> }[];
      upgradeOptions?: { label: string; price?: Money; note?: string }[];
    }
);

export interface NavigationItem {
  id: EntityId;
  label: string;
  destination?:
    | { kind: 'internal'; routeId: EntityId }
    | { kind: 'external'; href: string }
    | { kind: 'anchor'; hash: string };
  children?: NavigationItem[];
}

export interface Navigation {
  locale: Locale;
  header: NavigationItem[];
  mobile: NavigationItem[];
  footerGroups: { id: EntityId; label: string; items: NavigationItem[] }[];
  /** Contact-form service selector, in source option order; each links to its service page. */
  serviceOptions: NavigationItem[];
}

export interface RouteEntry {
  id: EntityId;
  locale: Locale;
  path: PublicPath;
  kind:
    | 'home'
    | 'about'
    | 'service'
    | 'project-list'
    | 'project-detail'
    | 'post-list'
    | 'post-detail'
    | 'faq'
    | 'contact'
    | 'legal'
    | 'profile'
    | 'thank-you'
    | 'sample'
    | 'login';
  entityId?: EntityId;
  counterpartId?: EntityId;
  aliases: PublicPath[];
  source: SourceRef;
}

export interface ListingSnapshot {
  /** A registry route id. */
  routeId: EntityId;
  page: number;
  orderedIds: EntityId[];
  previousPath?: PublicPath;
  nextPath?: PublicPath;
}

/** Utility copy (thank-you page) and project delivery terms. */
export interface UtilityContent {
  id: EntityId;
  body: RichContent;
}

export interface ShellContent {
  locale: Locale;
  headerCta: {
    label: string;
    routeId: EntityId;
  };
  footerCta: {
    headingLines: string[];
    targetRouteId: EntityId;
  };
  copyright: string;
  themeCredit: string;
  languageLabels: Record<Locale, string>;
  mobileMenu: {
    trigger: string;
    close: string;
    tagline: string;
    menuHeading: string;
    contactHeading: string;
    toggleSubmenu: string;
  };
  consult: {
    heading: string;
    placeholder: string;
    submit: string;
    submitting: string;
    required: string;
    invalid: string;
    success: string;
    error: string;
    demoBadge: string;
    note: string;
  };
  contactBar: {
    menu: string;
    contact: string;
    call: string;
    messenger: string;
    zalo: string;
  };
  floatingContacts: {
    buttonText: string;
    menuHeader: string;
    hours: string;
    hotline: string;
    messenger: string;
    zalo: string;
    email: string;
  };
}

export interface SiteSettings {
  locale: Locale;
  companyName: string;
  /** Logo slot text. */
  wordmark: string;
  address: string;
  phones: { label: string; href: string }[];
  email: string;
  socialLinks: LinkModel[];
  messengerHref: string;
  zaloHref: string;
  mapEmbedUrl: string;
  logoIds: EntityId[];
}

export interface Stat {
  id: EntityId;
  value: number;
  suffix?: string;
  label: string;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface EditorialState {
  status: 'draft' | 'published' | 'archived';
  updatedAt: string;
  revision: number;
  publishedAt?: string;
}

export interface CollectionPlacement {
  entityId: EntityId;
  order: number;
}

export interface SectionCopy {
  eyebrow?: string;
  title: string;
  /** Source `<br>` line breaks of `title`, set only when the heading has more than one line. */
  titleLines?: string[];
  description?: string;
}

export interface HomePageContent extends LocalizedIdentity {
  hero: HeroContent;
  seo: SEO;
  stats: Stat[];
  services: Service[];
  projects: Project[];
  partners: Partner[];
  testimonials: Testimonial[];
  posts: Post[];
  sectionCopy: Record<
    'achievements' | 'services' | 'projects' | 'partners' | 'testimonials' | 'posts',
    SectionCopy
  >;
  marqueeText: string[];
  marqueeSeparator: Asset;
  testimonialArt: {
    photo: Asset;
    quoteIcon: Asset;
    line: Asset;
  };
}

/** Stored home record: raw ids and placements; queries fill resolved arrays. */
export type HomePageRecord = Omit<
  HomePageContent,
  | 'stats'
  | 'services'
  | 'projects'
  | 'partners'
  | 'testimonials'
  | 'posts'
  | 'marqueeSeparator'
  | 'testimonialArt'
> & {
  statIds: EntityId[];
  serviceIds: EntityId[];
  marqueeSeparatorId: EntityId;
  testimonialArtIds: {
    photoId: EntityId;
    quoteIconId: EntityId;
    lineId: EntityId;
  };
  projectPlacements: CollectionPlacement[];
  partnerPlacements: CollectionPlacement[];
  testimonialPlacements: CollectionPlacement[];
  postPlacements: CollectionPlacement[];
};

/** Localized copy for a route error state. */
export interface ErrorCopy {
  title: string;
  description: string;
  retry: string;
}

export interface AboutPageContent extends LocalizedIdentity {
  hero: HeroContent;
  seo: SEO;
  stats: Stat[];
  goals: Feature[];
  purposePanels: OfferingPanel[];
  timeline: { id: EntityId; year: string; title: string; body: RichContent }[];
  capabilities: OfferingPanel[];
  partnerIds: EntityId[];
  testimonialIds: EntityId[];
}

/** Stored about record; the query fills `stats` from `statIds`. */
export type AboutPageRecord = Omit<AboutPageContent, 'stats'> & { statIds: EntityId[] };

export interface ContactPageContent extends LocalizedIdentity {
  heading: string;
  introduction: RichContent;
  seo: SEO;
}

export interface LegalPage extends LocalizedIdentity {
  body: RichContent;
  seo: SEO;
  displayUpdatedAt?: string;
}

export interface PaymentGuideContent extends LocalizedIdentity {
  introduction: RichContent;
  seo: SEO;
  accounts: {
    id: EntityId;
    bank: string;
    holder: string;
    accountNumber: string;
    qrAssetId?: EntityId;
  }[];
  instructions: RichContent;
}

export interface CompanyProfileContent extends LocalizedIdentity {
  coverId?: EntityId;
  pdfAssetId: EntityId;
  seo: SEO;
}

export interface ListingSettings {
  routeId: EntityId;
  heading: SectionCopy;
  hero?: HeroContent;
}

export type SubmitResult =
  | { mode: 'mock'; outcome: 'success' | 'error'; message: string }
  | { mode: 'live'; outcome: 'success'; reference?: string }
  | { mode: 'live'; outcome: 'error'; message: string };
