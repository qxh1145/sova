# Data model — hợp đồng đề xuất, chưa triển khai

Theo hướng mới: **mock UI trước, backend/admin sau**. [ADMIN_CONTENT_MAP](ADMIN_CONTENT_MAP.md) xác định ownership và khả năng biên tập; [MOCK_UI_PLAN](MOCK_UI_PLAN.md) xác định nghiệm thu UI độc lập backend.

## Luồng dữ liệu

`Page (Server) → lib/queries → ContentRepository → mock adapter → src/data → typed props → UI`.

Khi có CMS/API, thay adapter và validation ở biên; page composition, model/view props vẫn ổn định. Presentational component không fetch, không import trực tiếp HTML WordPress hoặc `src/data`. Các server query return Promise ngay từ đầu. Client nhận view DTO serializable; không nhận repository, class instance, hàm query hoặc thông tin cấu hình riêng.

## Các kiểu nền và model

```ts
type Locale = 'vi' | 'en';
type EntityId = string;
type PublicPath = `/${string}`;
interface SourceRef { file: string; line: number; sourceId?: string }
interface AssetRef {
  id: EntityId; src: string; alt: string;
  width?: number; height?: number;
  kind: 'image' | 'video' | 'font' | 'pdf' | 'icon';
  status: 'local' | 'remote' | 'missing';
  sources: SourceRef[];
}
interface LinkModel { label: string; href: string; external?: boolean }
// Biên content: sanitizer ở adapter; UI không nhận script, event handler hay WP page wrappers.
interface RichContent {
  format: 'sanitized-html'; html: string;
  assetIds: EntityId[]; sources: SourceRef[];
}
interface LocalizedIdentity {
  id: EntityId; locale: Locale; path: PublicPath; title: string;
  translationKey?: string; sources: SourceRef[];
}
interface SEO {
  title: string; description?: string; canonicalPath: PublicPath;
  imageId?: EntityId; noIndex?: boolean;
}
interface Feature {
  id: EntityId; title: string; body: RichContent; iconId?: EntityId;
}
interface HeroContent {
  headingLines: string[]; description?: RichContent;
  imageId?: EntityId; videoId?: EntityId; cta?: LinkModel;
}
type ServiceKey = 'website' | 'mobile' | 'seo' | 'branding'
  | 'storage' | 'email' | 'hosting' | 'vps';
interface Service extends LocalizedIdentity {
  key: ServiceKey; summary: string; parentKey?: ServiceKey;
  hero: HeroContent; benefits: Feature[];
  faqs: FAQPlacement[]; testimonialIds: EntityId[];
  featuredProjectIds: EntityId[]; pricingId?: EntityId; seo: SEO;
  // Page-specific content ở records có kiểu riêng; không section booleans.
}
interface OfferingPanel {
  id: EntityId; title: string; content: RichContent; mediaId?: EntityId;
}
interface WebsiteContent {
  serviceId: EntityId; whyChooseUs: OfferingPanel[];
  contactHeading: string; contactCopy: RichContent;
}
interface Project extends LocalizedIdentity {
  slug: string; categoryIds: EntityId[];
  thumbnailId?: EntityId; heroImageId?: EntityId; galleryIds: EntityId[];
  summary?: string; body: RichContent;
  publishedAt?: string; displayDate?: string; clientName?: string;
  metadata: { label: string; value: string }[];
  deliveryTermsId?: EntityId; relatedProjectIds: EntityId[]; seo: SEO;
}
interface ProjectCategory {
  id: EntityId; slug: 'website' | 'branding' | 'mobile-app';
  label: string; locale: Locale; path: PublicPath;
}
interface FAQ {
  id: EntityId; locale: Locale; question: string; answer: RichContent;
  topicIds: EntityId[]; serviceKeys: ServiceKey[]; sources: SourceRef[];
  // Tạm thời chỉ cho mismatch nguồn có ghi log, ví dụ A05.
  sourceRevisions?: { id: EntityId; answer: RichContent; sources: SourceRef[] }[];
}
interface FAQPlacement {
  faqId: EntityId; order: number; sourceRevisionId?: EntityId;
}
interface FAQTopic { id: EntityId; locale: Locale; label: string; items: FAQPlacement[] }
interface Testimonial {
  id: EntityId; locale: Locale; person: string; role?: string; company?: string;
  quote: RichContent; avatarId?: EntityId; sources: SourceRef[];
}
interface Partner {
  id: EntityId; name: string; logoId: EntityId; href?: string; sources: SourceRef[];
}
interface Post extends LocalizedIdentity {
  slug: string; categoryIds: EntityId[]; excerpt: string; body: RichContent;
  thumbnailId?: EntityId; featuredImageId?: EntityId;
  author: { id: EntityId; name: string; href?: string };
  publishedAt?: string; modifiedAt?: string; displayDate?: string;
  relatedPostIds: EntityId[]; seo: SEO;
}
interface PostCategory {
  id: EntityId; locale: Locale; slug: string; title: string; path: PublicPath;
  // Count nguồn có thể bao gồm bài chưa tải; không ép thành mock count.
  sourceDisplayCount?: number;
}
interface Money {
  amount: number; currency: 'VND' | 'USD';
  period: 'once' | 'month' | 'year';
  displayText: string; taxNote?: string;
}
interface PricingPlan {
  id: EntityId; name: string; price?: Money; originalPrice?: Money;
  discountLabel?: string; note?: string; featureIds: EntityId[];
  cta: LinkModel; recommended?: boolean;
}
interface PricingFeature { id: EntityId; label: string; group?: string }
type PricingCell =
  | { kind: 'text'; value: string }
  | { kind: 'included'; value: boolean }
  | { kind: 'money'; value: Money };
type Pricing = {
  id: EntityId; locale: Locale; serviceKey: ServiceKey;
  heading: string; plans: PricingPlan[]; sources: SourceRef[];
} & (
  | { kind: 'cards'; features: PricingFeature[] }
  | { kind: 'table'; columns: { id: EntityId; label: string; planId?: EntityId }[];
      rows: { id: EntityId; label: string; cells: Record<EntityId, PricingCell> }[];
      upgradeOptions?: { label: string; price?: Money; note?: string }[] }
);
interface NavigationItem {
  id: EntityId; label: string;
  destination?: { kind: 'internal'; routeId: EntityId }
    | { kind: 'external'; href: string }
    | { kind: 'anchor'; hash: string };
  children?: NavigationItem[];
}
interface Navigation {
  locale: Locale; header: NavigationItem[]; mobile: NavigationItem[];
  footerGroups: { id: EntityId; label: string; items: NavigationItem[] }[];
}
interface RouteEntry {
  id: EntityId; locale: Locale; path: PublicPath;
  kind: 'home' | 'about' | 'service' | 'project-list' | 'project-detail'
    | 'post-list' | 'post-detail' | 'faq' | 'contact' | 'legal' | 'profile'
    | 'thank-you' | 'sample' | 'login';
  entityId?: EntityId; counterpartId?: EntityId;
  aliases: PublicPath[]; source: SourceRef;
}
interface ListingSnapshot {
  routeId: EntityId; page: number; orderedIds: EntityId[];
  previousPath?: PublicPath; nextPath?: PublicPath;
}
interface SiteSettings {
  locale: Locale; companyName: string; address: string;
  phones: { label: string; href: string }[]; email: string;
  socialLinks: LinkModel[]; mapEmbedUrl: string; logoIds: EntityId[];
}
interface Stat { id: EntityId; value: number; suffix?: string; label: string }
```

`ProjectSummary`, `PostSummary`, `ServiceSummary` là Pick theo fields thật sự UI card cần, tránh gửi RichContent dài vào client filter. Giá là dữ liệu **snapshot**, không tra giá mới hay tự đổi tiền tệ. EN hiển thị giá/ngôn ngữ như HTML, chưa giả định đã dịch. Taxonomy và related ordering lấy từ href/classes/source lists, không đoán từ title.

## Nguồn duy nhất và consumers

| Data | Nguồn đề xuất | Consumers |
| --- | --- | --- |
| Service (8 keys, nội dung VI/EN) | data/services/{website,mobile,seo,branding,storage,email,hosting,vps}.ts | Header/mobile/footer links, Home service accordion, service page, contact service selector |
| FAQ + topics/placements | data/faq.ts | 8 service FAQ và FAQ global VI/EN |
| Projects + categories + ordered collection IDs | data/projects.ts, data/collections.ts | Home/service FeaturedProjects, project listing/archive/category/detail/related |
| Testimonials | data/testimonials.ts | Home/About/8 service VI/EN |
| Partners | data/partners.ts | Home partner gallery, About logos |
| Posts + categories | data/posts.ts, data/post-categories.ts | Home latest, blog/category/pagination, detail/related/search |
| Pricing | data/pricing/{website,email,hosting,vps}.ts | Website cards, standalone tables; storage hub tham chiếu cùng pricing IDs khi nội dung trùng |
| Navigation + route registry | data/navigation.ts, data/routes.ts | Header, Footer, mobile, LanguageSwitcher, metadata, sitemap |
| Company/contact | data/site.ts | Footer, Contact, popup, floating actions, mobile bar |
| Stats | data/stats.ts | Home/About; values giữ theo source placement nếu có khác biệt |
| Trang cố định | data/pages/{home,about,contact,legal,profile}.ts | 36 structured pages kết hợp service records; hero/copy/placements/SEO |
| Utility copy / terms | data/content.ts | sample, thanks, project terms có provenance |
| Captured listings | data/listings.ts | Pagination/order chính xác cho blog và categories |

## Dedupe và bảo toàn nguồn

1. IDs ổn định từ WP ID hoặc canonical slug; không title, array index hay filename ảnh làm ID nghiệp vụ. `translationKey` nối record VI/EN khi mapping đã xác minh.
2. FAQ bỏ số thứ tự khỏi **ID so khớp**, render thứ tự qua FAQPlacement; giữ nguyên nội dung câu hỏi. So normalized question/visible answer, không so style tag chứa auto IDs. 65 items trên FAQ VI thuộc 7 topics; storage FAQ 4 câu là domain riêng (nội dung đang copy nhầm từ SEO — A13), không ép thành topic thứ tám chưa tồn tại trong global FAQ.
3. A05: service SEO answer có literal `</p`; giữ revision khác nhau trong **cùng FAQ record**, không hai bản FAQ độc lập. Việc chuẩn hóa lỗi nội dung cần quyết định ghi vào anomaly log trước áp dụng.
4. FeaturedProjects lưu ordered IDs cho 6 dự án nguồn, không lấy `projects.slice(0, 6)`. Dùng canonical project data khi khớp; nếu teaser image/copy khác, collection placement chỉ giữ override được ghi nguồn, không nhân bản Project.
5. Giữ listings/pagination snapshot theo trang. Mirror chỉ có 27 bài nhưng sidebar hoặc category counts có thể phản ánh site đầy đủ; lưu sourceDisplayCount và available-count riêng, không lặng lẽ “sửa” số.
6. Project delivery text phổ biến được đối chiếu/hash rồi trỏ `deliveryTermsId`; metadata/gallery khác nhau vẫn thuộc project. Duplicate thumbnails/resized images là AssetRef variants, không Project mới.
7. Legal table/QR/video/iframe giữ như rich content có kiểm soát. Sanitize không sửa lỗi ngôn từ; bỏ executable code là thay đổi kỹ thuật có ghi nhận.

## Query contracts và thay backend

```ts
interface PageResult<T> { items: T[]; total: number; page: number; pageSize: number }
interface ContentRepository {
  getService(key: ServiceKey, locale: Locale): Promise<Service | null>;
  getProject(slug: string): Promise<Project | null>;
  listProjects(input: { category?: string; page: number; pageSize: number }): Promise<PageResult<Project>>;
  getPost(slug: string): Promise<Post | null>;
  listPosts(input: { locale: Locale; category?: string; page: number }): Promise<PageResult<Post>>;
  getFAQs(ids: EntityId[], locale: Locale): Promise<FAQ[]>;
  getTestimonials(ids: EntityId[], locale: Locale): Promise<Testimonial[]>;
  getNavigation(locale: Locale): Promise<Navigation>;
}
```

Page query tổng hợp domain records và kiểm tra thiếu ID trước render; adapter validate payload và rewrite asset/internal links tại một chỗ. Không trả WP CSS selectors trong model. Lỗi thiếu record → notFound đúng route, lỗi transport → error boundary, client filter có loading/error/empty state.

Form transport là interface riêng (không ContentRepository). Mock cho phép demo-success/demo-error có nhãn “Bản demo — chưa gửi thông tin”; preview trang cảm ơn cũng giữ nhãn demo. Chỉ response từ adapter thật mới được xác nhận đã gửi/nhận thông tin. Login cần auth provider và return-URL allowlist, không thu thập/gửi credentials bằng mock transport.

## Kiểm tra dữ liệu bắt buộc khi triển khai

ID/path uniqueness; 62 project/27 posts có source; category refs hợp lệ; FAQ IDs resolve; excluded IDs không xuất hiện navigation/service selector; alias không loop; related IDs không self-reference ngoài trường hợp nguồn đã ghi anomaly; assets missing có trạng thái rõ; exact collection order; locale counterpart không trỏ nhầm ngôn ngữ. Không viết unit test sao chép từng text literal.

## Nội dung trang cố định: typed records, layout do code quản lý

Các model dưới đây bổ sung cho 36 structured pages. Mỗi locale/page identity có record tương ứng; không có generic `sections: any[]` hay React/CSS configuration trong CMS.

```ts
interface EditorialState {
  status: 'draft' | 'published' | 'archived';
  updatedAt: string; revision: number; publishedAt?: string;
}
interface CollectionPlacement {
  entityId: EntityId; order: number;
  // Chỉ khi source có copy/media khác, lưu override có provenance;
  // không copy toàn bộ entity vào placement.
}
interface SectionCopy { eyebrow?: string; title: string; description?: string }
interface HomePageContent extends LocalizedIdentity {
  hero: HeroContent; seo: SEO; stats: Stat[];
  sectionCopy: Record<'achievements' | 'services' | 'projects' | 'partners' | 'testimonials' | 'posts', SectionCopy>;
  serviceIds: EntityId[]; marqueeText: string[];
  projectPlacements: CollectionPlacement[];
  partnerPlacements: CollectionPlacement[];
  testimonialPlacements: CollectionPlacement[];
  postPlacements: CollectionPlacement[];
}
interface AboutPageContent extends LocalizedIdentity {
  hero: HeroContent; seo: SEO; stats: Stat[]; goals: Feature[];
  purposePanels: OfferingPanel[];
  timeline: { id: EntityId; year: string; title: string; body: RichContent }[];
  capabilities: OfferingPanel[]; partnerIds: EntityId[]; testimonialIds: EntityId[];
}
interface ContactPageContent extends LocalizedIdentity {
  heading: string; introduction: RichContent; seo: SEO;
  // company address/phone/email/map lấy SiteSettings, không lặp fields ở đây.
}
interface LegalPage extends LocalizedIdentity {
  body: RichContent; seo: SEO; displayUpdatedAt?: string;
}
interface PaymentGuideContent extends LocalizedIdentity {
  introduction: RichContent; seo: SEO;
  accounts: { id: EntityId; bank: string; holder: string; accountNumber: string; qrAssetId?: EntityId }[];
  instructions: RichContent;
}
interface CompanyProfileContent extends LocalizedIdentity {
  coverId?: EntityId; pdfAssetId: EntityId; seo: SEO;
}
interface ListingSettings {
  routeId: EntityId; heading: SectionCopy; hero?: HeroContent;
  // Page size/sort tách khỏi editorial content và chỉ mở editor nếu có nhu cầu.
}
```

EditorialState gắn vào content records trong adapter/CMS layer để phân biệt published data. Public DTO chỉ chứa fields UI dùng; raw draft/private data không truyền vào client islands. Mock seed default là published, các trạng thái còn lại là dev/test fixtures. Content read contracts hiện tại không cần generic CRUD interface; dashboard mutations thuộc backend phase sau.

Bổ sung query/read methods tương ứng `getHomePage(locale)`, `getAboutPage(locale)`, `getContactPage(locale)`, `getLegalPage(path,locale)`, `getProfile(locale)`, `getPricing(id,locale)`, `getPartners(ids)`, `getSiteSettings(locale)`, `getListingSettings(routeId)` cùng concrete return types trên. Fixture cùng domain nằm tại một nơi, queries tổng hợp view DTO; không vừa lưu cùng trang trong `content.ts` vừa copy sang `pages/home.ts`.

Home/About stat placements dùng shared stats record nếu số liệu cùng nghĩa/trùng nguồn; nếu khác scope thì giữ record riêng có provenance. `stats: Stat[]` trong DTO là kết quả query đã resolve, không yêu cầu admin lưu bản copy vào mỗi page record. Quy tắc tương tự áp dụng nested Feature/Offering DTOs.

## Source snapshot và CMS runtime

`SourceRef`, sourceDisplayCount, source-specific FAQ revision và ListingSnapshot phục vụ import/parity; không biến tất cả thành fields editor. Khi nối backend, public counts/order/pagination lấy query published records; source snapshot chỉ là baseline evidence. Status update/hide phải xử lý placements dùng record đó để tránh dangling references. Bài/project mới lấy slug từ record; fixed service/page paths giữ trong route config. EN translations độc lập publish; counterpart chỉ xuất hiện khi có trang public hợp lệ.

## Mock submission result

```ts
type SubmitResult =
  | { mode: 'mock'; outcome: 'success' | 'error'; message: string }
  | { mode: 'live'; outcome: 'success'; reference?: string }
  | { mode: 'live'; outcome: 'error'; message: string };
```

UI không đọc `outcome === 'success'` đơn lẻ để khẳng định lead thật đã nhận; còn phải phân biệt mode. Mock không gửi request tới WordPress và không cần API keys. Không lưu credentials/PII trong mock persistence.
