# Component map

## Hướng mock UI / nội dung admin

Page composition và CSS giữ cố định theo nguồn; mọi business content truyền qua typed props từ query/mock repository. Admin tương lai sửa content models và ID placements, không sửa JSX/section types. Xem [ADMIN_CONTENT_MAP](ADMIN_CONTENT_MAP.md) cho classification từng route; không thêm dashboard components vào phạm vi public UI ở đây.

## Cách đọc và mức chắc chắn

Nguồn: `docs/phase-0-architecture.md` trong eras-clone và tài liệu **“Cây component chi tiết từng màn hình”** của chủ dự án (snapshot [screen-component-tree](../_bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md), 03/10/2026). Mọi quyết định dưới đây đã đối chiếu HTML/CSS. Hai nguồn lệch nhau thì source HTML quyết định.

`[G] GLOBAL`: layout toàn site hoặc primitive UI. `[S] SHARED`: domain nhiều route. `[P] PAGE-SPECIFIC`: một route/template, để ở `app/<route>/_components`. `[C]` cần client island; phần còn lại server mặc định. Chuỗi sau dấu `→` là con/leaf, không yêu cầu tách thành file nếu chỉ là markup ngắn.

Bản VI/EN đều nằm trong phạm vi. Với section có **hai consumer VI + EN**, đặt shared domain (home/about/service/contact/faq/content), không nhét vào `components/ui`. Các section chỉ có một template consumer như ProjectGallery, PostMeta, ThankYouMessage ở `_components`. Chỉ route composition nằm trong page; không có `ServicePage` với hàng chục cờ.

## Layout chung

```text
RootDocument [G] dùng chung → html/body + locale + global CSS; ba root wrappers gọi lại, không app/layout.tsx
├── (site)/(vi)/layout → RootDocument + SiteShell [G](locale=vi)
├── (site)/en/layout   → RootDocument + SiteShell [G](locale=en)
│   ├── Header [G] → LogoLink [G], DesktopNavigation [G], LanguageSwitcher [G]
│   │   ├── NavigationItem [G] → link, submenu link
│   │   ├── HeaderMotion [G,C] → sticky state (90px → 70px)
│   │   └── MenuTrigger [G,C] → MobileMenu [G,C]
│   │       └── MobileNavigationBranch [G,C] → expand button, nested links
│   ├── main → page content
│   ├── MobileContactBar [G] → menu trigger, contact links (azt-contact-footer)
│   ├── FooterCTA [G] → heading, contact CTA
│   ├── Footer [G] → CompanyInfo [S], FooterLinkGroup [G], SocialLinks [G]
│   ├── ConsultPopup [G,C] → Dialog [G,C] → ConsultForm [S,C] → PhoneField, SubmitButton [G]
│   ├── FloatingContactActions [G,C] → expand button, Hotline/Messenger/Zalo/Email links
│   └── CustomCursor [G,C] → dot, ring, pointer listeners
└── (utility)/login-eras/page → LoginPanel [P,C], không có marketing shell
```

Không lặp Header/Footer trong từng page. `sample-page` vẫn có shell như HTML. `en/our-project` dù body class `page-blank` vẫn có header/footer (đã kiểm tra), không tự bỏ shell. Shared SiteShell nhận locale từ hai layout wrapper; không dùng pathname hook để kéo toàn layout về client.

## Home → `/`, `/en/home/`

```text
HomePage [route, server]
├── HomeHero [S] → BackgroundVideo [G/native], TypewriterHeading [G/CSS], CTA [G]
├── HomeAchievements [S] → Stats [S] → StatCounter [G,C]
├── ServicesAccordion [S] → ServiceSummary [S] → AccordionToggle [G,C], ServiceLink [S]
├── Marquee [S/CSS] → text track, decorative duplicate aria-hidden
├── FeaturedProjects [S] → SectionHeading [G], HorizontalProjects [S,C]
│   └── ProjectShowcaseItem [S] → image, project title, project link
├── HomePartners [S] → SectionHeading [G], PartnerLogos [S] → PartnerLogo [S]
├── Testimonials [S] → SectionHeading [G], Carousel [G,C]
│   └── TestimonialCard [S] → avatar, person/company, quote
└── LatestPosts [S] → SectionHeading [G], Carousel [G,C]
    └── PostCard [S, slider] → thumbnail, title, excerpt, read-more link
```

Bằng chứng Home `index.html`: video 631, title 654/674; **Stats 786** bị doc cũ bỏ sót; accordion 1097/1309; marquee 1356; projects 1387/GSAP 1530; partners 1664; testimonials 2122; posts 2529. Home có 6 `.box-blog-post` trong desktop/mobile markup, không suy diễn thành 6 bài độc lập; dedupe bằng href.

## About → `/gioi-thieu/`, `/en/about-us/`

```text
AboutPage
├── AboutHero [S] → PageHero [S, service-like image layout]
├── AchievementsAndGoals [S] → Stats [S], Goals [S] → GoalCard [S], Carousel [G,C]
├── MissionVision [S] → PurposePanel [S] → image, heading, rich text
├── CompanyTimeline [S] → Milestone [S] → year, title, description
├── Capabilities [S] → CapabilityCard [S], PartnerLogos [S], Carousel [G,C]   (cây chủ dự án: 3 trụ cột × 27 thẻ icon, không có logo đối tác — kiểm source HTML trước khi dựng)
└── Testimonials [S]
```

Nguồn VI: 789, 2183, 2424/2488, 2931, 5304. Không gộp goal slider và benefits của services thành FeatureGrid với nhiều boolean: mục đích, responsive và bố cục khác nhau.

## Service routes — composition rõ ràng

Áp dụng cả bản EN tương ứng theo ROUTE_MAP. Mỗi dòng là một page composition, giữ nguyên thứ tự:

```text
WebsiteService
 ServiceHero [S] → ServiceBenefits [S] → WebsitePricing [S]
 → WebsiteContactBanner [S] → WhyChooseUs [S]
 → FeaturedProjects [S] → Testimonials [S] → ServiceFAQ [S]

MobileService
 ServiceHero [S] → ServiceBenefits [S] → WhyChooseUs [S]
 → FeaturedProjects [S] → Testimonials [S] → ServiceFAQ [S]

SEOService
 ServiceHero [S] → ServiceBenefits [S] → SEOOfferings [S]
 → FeaturedProjects [S] → Testimonials [S] → ServiceFAQ [S]

BrandingService
 ServiceHero [S] → ServiceBenefits [S] → BrandingOfferings [S]
 → FeaturedProjects [S] → Testimonials [S] → ServiceFAQ [S]

StorageService
 ServiceHero [S] → StorageOfferings [S]
 → FeaturedProjects [S] → Testimonials [S] → ServiceFAQ [S]

EmailService / HostingService / VPSService (3 explicit pages)
 ServiceHero [S] → PricingTable [S] → ServiceFeatureGrid [S]
 → Testimonials [S] → ServiceFAQ [S]
```

Hero chứa `banner-service`; marquee nằm trong/giáp hero, lấy thứ tự và media từ file, không thêm section marketing mới. Chi tiết children:

```text
ServiceHero → PageHero [S, service] → HeadingLines [G], illustration, Marquee [S]
ServiceBenefits → SectionHeading [G], BenefitItem [S] ×4 → icon/title/body, media
WebsitePricing → PricingCards [S] → PricingPlanCard [S] → title/price/discount/features/CTA
                + Carousel [G,C] trên breakpoint nguồn tương ứng
WebsiteContactBanner → BannerHeading [S], WebsiteContactForm [S,C]
 → FormField [G] × name/phone/business/message, Captcha adapter [S,C], submit
WhyChooseUs → ServiceDetailCards [S] → Benefit/Commitment/Deliverables panels
SEOOfferings / BrandingOfferings → ServiceDetailCards [S] → heading/body/list; mobile Carousel [G,C]
StorageOfferings → StorageOfferCard [S] → hosting/VPS/email summaries, PricingTable [S], CTA
PricingTable → caption/head/body → PricingRow [S] → plan cells, action link
ServiceFeatureGrid → FeatureItem [S] ×6 → icon/title/description
ServiceFAQ → SectionHeading [G], FAQAccordion [S] → AccordionItem [G,C] → question button / RichText [G]
```

Trong HTML service, các `ss-ndv-seo` và WhyChooseUs chủ yếu là desktop panels + mobile sliders; scan chỉ thấy `tabbed-content` thật ở FAQ, không thấy ở 8 service canonical VI. Vì vậy đổi tên đề xuất `TabbedFeatureList` thành **ServiceDetailCards**; không tự thêm tab interaction.

| VI source | Benefit | Unique / feature section | Projects | Testimonials | FAQ |
| --- | --- | --- | --- | --- | --- |
| thiet-ke-website/index.html | 817 | price 1264; forms 4323/4475; WhyUs 4567 | 6177 | 6445 | 6852 |
| thiet-ke-app-mobile/index.html | 815 | WhyUs 1229 | 2859 | 3144 | 3551 |
| seo-tu-khoa-website/index.html | 824 | offerings 1237 | 3020 | 3305 | 3712 |
| ui-ux-branding-design/index.html | 838 | offerings 1299 | 3169 | 3454 | 3861 |
| giai-phap-luu-tru/index.html | — | offerings 843 | 2371 | 2656 | 3063 |
| e-mail-doanh-nghiep/index.html | — | price 820; features 1491 | — | 1990 | 2397 |
| hosting-doanh-nghiep/index.html | — | price 843; features 1066 | — | 1573 | 1980 |
| vps-doanh-nghiep/index.html | — | price 810; features 1005 | — | 1498 | 1905 |

## Projects → listing/archive/category

```text
ProjectsPage / ProjectArchivePage / ProjectCategoryPage / EN ProjectsPage
├── PageHero [S, split-cta] → TypewriterHeading [G/CSS], CTA [G], image
└── ProjectBrowser [S,C] → ProjectFilters [S,C] → category buttons
    ├── ProjectGrid [S] → ProjectCard [S] → thumbnail, h6 title, category label, detail link
    └── ProjectPagination [S,C] → page links/buttons, loading status
```

`du-an:615`, filter/AJAX dưới hero; du-an HTML có 0 portfolio cards ban đầu, featured_item có 62. Không dùng 0 làm empty-state của dữ liệu. Category source có 59 website/2 branding/1 mobile-app. Giữ grid density theo route: du-an hai cột, archive/category có bố cục khác; không ép tất cả giống nhau. Sidebar/filter container có cùng hành vi dùng shared domain, không colocation vào một listing.

## Project detail → 62 URL `/featured_item/[slug]/`

```text
ProjectDetailPage
├── ProjectHero [P] → title, source hero image
├── ProjectGallery [P] → Carousel [G,C] → GalleryImage [P]
├── ProjectBodyLayout [P] (9/3 desktop)
│   ├── ProjectContent [P] → RichText [G], ProjectDeliveryTerms [P]
│   └── ProjectInfoSidebar [P] → date, metadata rows
└── RelatedProjects [P] → Carousel [G,C] → ProjectCard [S]
```

Mẫu THP: hero 616, gallery 744, detail 754, sidebar 784, related 797. Có 51 file với 2 `.slider`, 11 file chỉ 1: gallery optional theo **dữ liệu thật**, không bắt buộc tạo gallery rỗng. Từng project có heading/media riêng tại `pages.json`.

## Blog listing → `/goc-nhin/`, 6 category, pagination, `/en/insight/`

```text
BlogListingPage
├── PageHeading [S] → heading, category name nếu có
└── BlogColumns [S] (8/4)
    ├── PostList [S] → PostCard [S, list] → image/title/excerpt/read-more
    │   └── Pagination [G] → previous/number/next links
    └── BlogSidebar [S] → SearchForm [S/native GET], CategoryList [S] → links/counts
```

Bài EN insight còn link nội dung VI. Không dịch tự động, không tạo `/en/<postSlug>` không có nguồn.

## Blog detail → 27 root slug

```text
PostDetailPage
├── PageHeading [S]
├── ArticleHeroImage [P]
├── PostMeta [P] → author/date
├── ArticleBody [P] → RichText [G] → h2/h3/p/list/link/img/table/video blocks
└── RelatedPosts [P] → PostCard [S, grid] × source-related records
```

Colocate trong `app/(site)/(vi)/[slug]/_components`. Resolver cùng folder còn phục vụ category bằng BlogListing domain components; không renderer HTML toàn trang.

## Contact, FAQ, legal/profile, utility

```text
ContactPage (VI/EN)
 PageHeading [S] → ContactSection [S]
  → CompanyInfo [S] → address/phone/email links
  → ContactForm [S,C] → name/email/service/phone/message/Captcha/submit
  → ContactMap [S/native iframe]

FAQPage (VI/EN)
 PageHero [S, simple] → FAQTopics [S,C] → TabList [G,C] ×7
  → FAQAccordion [S] → question button, answer RichText [G]

LegalPage (5 VI + 5 EN)
 PageHero [S, simple] → LegalContent [S] → RichText [G]
 Payment guide: bank/account/QR sections theo source, không chuyển thành checkout

CompanyProfilePage (VI/EN)
 PageHero [S, simple] → (FlipbookViewer [S,C] plan sau, ngoài phase A)

ThankYouPage
 ThankYouMessage [P] → heading, source paragraph/CTA (nếu có)

SamplePage
 SampleContent [P] → RichText [G], giữ nội dung hiện có

LoginPage (utility shell)
 LoginPanel [P,C] → LoginForm [P,C] → username/password/remember/password-toggle/submit
  → lost-password/register links theo nguồn, return URL được validate phía server
```

Contact source 700/910/955; FAQ 659 (65 accordion items trong 7 nhóm VI); profile 7213 flipbook options trỏ PDF từ xa chưa được mirror. Login không gửi dữ liệu về WordPress production từ mock app.

## Trang bị loại

Không xây SocialLanding, Careers, JobDetail, ApplyForm, SocialFooter hoặc testimonial variant social. 16 route vẫn được kiểm kê trong ROUTE_MAP/evidence để chứng minh phạm vi loại bỏ. Không xóa tệp nguồn.

## Coverage theo từng file

Bảng ROUTE_MAP gán mỗi URL canonical vào đúng cây ở trên. `evidence/pages.json` lưu **thứ tự section, heading, số dòng, forms, fields, sliders/options, iframe, video, class markers** cho cả 169 HTML mirror; `evidence/links.json` lưu mỗi anchor và line. Đây là dữ liệu audit, không phải schema production hay HTML-to-JSX generator.
