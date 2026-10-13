# Proposed folder structure

**Đây là cây đề xuất, chưa tạo src/public/package.json.** Ngoài docs chỉ có README; không có production code.

## Routing và locale layout

Dùng ba root-layout wrappers (VI, EN, utility) gọi **cùng** `RootDocument` để render `<html lang>` đúng trên server và cùng SiteShell cho marketing. Không có `src/app/layout.tsx` phía trên chúng, không có layout riêng cho từng service. `(site)` và `(vi)` là route groups không có URL. Chuyển giữa root layouts có thể full-page navigation; ghi nhận cho language switch, không làm client pathname hack. [Next.js route groups](https://nextjs.org/docs/app/api-reference/file-conventions/route-groups).

```text
sova-landing-page/
├── README.md
├── docs/                              8 required docs + source/style audits + evidence
├── package.json                       tương lai: Next/React/TypeScript và dependencies thực sự cần
├── package-lock.json                  tương lai: một package manager, version pin khi scaffold
├── next.config.ts                     preserve trailing slash/aliases; không mặc định basePath/export
├── tsconfig.json
├── eslint.config.mjs
├── src/
│   ├── app/
│   │   ├── (site)/                    organizational group, không layout cộng thêm
│   │   │   ├── (vi)/
│   │   │   │   ├── layout.tsx         RootDocument(locale=vi) + SiteShell(locale=vi)
│   │   │   │   ├── page.tsx           Home, explicit composition
│   │   │   │   ├── gioi-thieu/page.tsx
│   │   │   │   ├── thiet-ke-website/page.tsx
│   │   │   │   ├── thiet-ke-app-mobile/page.tsx
│   │   │   │   ├── seo-tu-khoa-website/page.tsx
│   │   │   │   ├── ui-ux-branding-design/page.tsx
│   │   │   │   ├── giai-phap-luu-tru/page.tsx
│   │   │   │   ├── e-mail-doanh-nghiep/page.tsx
│   │   │   │   ├── hosting-doanh-nghiep/page.tsx
│   │   │   │   ├── vps-doanh-nghiep/page.tsx
│   │   │   │   ├── du-an/page.tsx
│   │   │   │   ├── featured_item/
│   │   │   │   │   ├── page.tsx       preserved archive, not redirect deletion
│   │   │   │   │   └── [slug]/
│   │   │   │   │       ├── page.tsx
│   │   │   │   │       └── _components/
│   │   │   │   │           ├── ProjectHero.tsx
│   │   │   │   │           ├── ProjectGallery.tsx
│   │   │   │   │           ├── ProjectBodyLayout.tsx
│   │   │   │   │           ├── ProjectDeliveryTerms.tsx
│   │   │   │   │           ├── ProjectContent.tsx
│   │   │   │   │           ├── ProjectInfoSidebar.tsx
│   │   │   │   │           └── RelatedProjects.tsx
│   │   │   │   ├── featured_item_category/[category]/page.tsx
│   │   │   │   ├── goc-nhin/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── page/[page]/page.tsx
│   │   │   │   ├── [slug]/            ONLY root post/category resolver
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── page/[page]/page.tsx
│   │   │   │   │   └── _components/
│   │   │   │   │       ├── ArticleHeroImage.tsx
│   │   │   │   │       ├── PostMeta.tsx
│   │   │   │   │       ├── ArticleBody.tsx
│   │   │   │   │       └── RelatedPosts.tsx
│   │   │   │   ├── cau-hoi-thuong-gap/page.tsx
│   │   │   │   ├── lien-he/page.tsx
│   │   │   │   ├── dieu-khoan-su-dung/page.tsx
│   │   │   │   ├── chinh-sach-bao-mat/page.tsx
│   │   │   │   ├── chinh-sach-hoan-tien/page.tsx
│   │   │   │   ├── chinh-sach-bao-hanh/page.tsx
│   │   │   │   ├── huong-dan-thanh-toan/page.tsx
│   │   │   │   ├── ho-so-nang-luc-eras-vietnam/page.tsx
│   │   │   │   ├── eras-xin-chan-thanh-cam-on-quy-khach/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── _components/ThankYouMessage.tsx
│   │   │   │   ├── sample-page/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── _components/SampleContent.tsx
│   │   │   │   ├── error.tsx          error boundary island
│   │   │   │   └── not-found.tsx
│   │   │   └── en/
│   │   │       ├── layout.tsx         RootDocument(locale=en) + shared SiteShell
│   │   │       ├── page.tsx           redirect /en/ → /en/home/
│   │   │       ├── home/page.tsx
│   │   │       ├── about-us/page.tsx
│   │   │       ├── website-development/page.tsx
│   │   │       ├── app-mobile-development/page.tsx
│   │   │       ├── website-keyword-seo/page.tsx
│   │   │       ├── ui-ux-branding-design-2/page.tsx
│   │   │       ├── business-e-mail/page.tsx
│   │   │       ├── storage-solution/page.tsx
│   │   │       ├── business-hosting/page.tsx
│   │   │       ├── business-vps/page.tsx
│   │   │       ├── our-project/page.tsx
│   │   │       ├── insight/page.tsx
│   │   │       ├── faq/page.tsx
│   │   │       ├── contact-us/page.tsx
│   │   │       ├── terms-of-use/page.tsx
│   │   │       ├── privacy-policy/page.tsx
│   │   │       ├── refund-policy/page.tsx
│   │   │       ├── warranty-policy/page.tsx
│   │   │       ├── payment-guide/page.tsx
│   │   │       ├── porfolio-eras-vietnam/page.tsx
│   │   │       ├── error.tsx
│   │   │       └── not-found.tsx
│   │   ├── (utility)/
│   │   │   ├── layout.tsx             shared RootDocument, no marketing shell
│   │   │   └── login-eras/
│   │   │       ├── page.tsx
│   │   │       └── _components/{LoginPanel,LoginForm}.tsx
│   │   ├── api/contact/route.ts       phase B only; KHÔNG tạo trong mock UI
│   │   ├── robots.ts                  explicit staging/live policy
│   │   └── sitemap.ts                 registry, excludes removed routes
│   ├── components/
│   │   ├── layout/                   RootDocument, SiteShell, Header, HeaderMotion, Footer,
│   │   │                             FooterCTA, DesktopNavigation, MobileMenu, NavigationItem,
│   │   │                             MobileNavigationBranch, MenuTrigger, LogoLink, FooterLinkGroup,
│   │   │                             LanguageSwitcher, ConsultPopup, FloatingContactActions,
│   │   │                             MobileContactBar, SocialLinks, CustomCursor
│   │   ├── ui/                       Button, Container, SectionHeading, FormField, PhoneField,
│   │   │                             SubmitButton, RichText, HeadingLines, Carousel, Tabs, TabList,
│   │   │                             AccordionItem, AccordionToggle, Dialog, Pagination,
│   │   │                             StatCounter, TypewriterHeading, BackgroundVideo
│   │   ├── hero/                     PageHero, PageHeading
│   │   ├── home/                     HomeHero, HomeAchievements, ServicesAccordion,
│   │   │                             ServiceSummary, ServiceLink, HomePartners, LatestPosts
│   │   ├── about/                    AboutHero, AchievementsAndGoals, Goals, GoalCard,
│   │   │                             MissionVision, PurposePanel, CompanyTimeline, Milestone,
│   │   │                             Capabilities, CapabilityCard
│   │   ├── service/                  ServiceHero, ServiceBenefits, BenefitItem, FeatureItem,
│   │   │                             ServiceFeatureGrid, WhyChooseUs, ServiceDetailCards, ServiceFAQ
│   │   │   ├── website/              WebsitePricing, WebsiteContactBanner, BannerHeading
│   │   │   ├── seo/                  SEOOfferings
│   │   │   ├── branding/             BrandingOfferings
│   │   │   └── storage/              StorageOfferings, StorageOfferCard
│   │   ├── projects/                 FeaturedProjects, HorizontalProjects, ProjectShowcaseItem,
│   │   │                             ProjectBrowser, ProjectFilters, ProjectPagination,
│   │   │                             ProjectCard, ProjectGrid
│   │   ├── blog/                     PostCard, PostList, BlogListing, BlogColumns, BlogSidebar,
│   │   │                             SearchForm, CategoryList
│   │   ├── faq/                      FAQAccordion, FAQTopics
│   │   ├── testimonials/             Testimonials, TestimonialCard
│   │   ├── partners/                 PartnerLogos, PartnerLogo
│   │   ├── pricing/                  PricingCards, PricingPlanCard, PricingTable, PricingRow
│   │   ├── forms/                    ContactForm, WebsiteContactForm, ConsultForm, CaptchaAdapter
│   │   ├── contact/                  ContactSection, ContactMap
│   │   ├── company/                  CompanyInfo
│   │   ├── content/                  LegalContent, FlipbookViewer (plan sau)
│   │   ├── stats/                    Stats
│   │   └── motion/                   Marquee
│   ├── data/
│   │   ├── navigation.ts
│   │   ├── routes.ts                 paths, locale counterparts, source aliases
│   │   ├── services/                 website.ts, mobile.ts, seo.ts, branding.ts,
│   │   │                             storage.ts, email.ts, hosting.ts, vps.ts
│   │   ├── faq.ts
│   │   ├── projects.ts
│   │   ├── collections.ts            ordered curated IDs, not duplicate entities
│   │   ├── testimonials.ts
│   │   ├── partners.ts
│   │   ├── posts.ts
│   │   ├── post-categories.ts
│   │   ├── listings.ts
│   │   ├── pricing/{website,email,hosting,vps}.ts
│   │   ├── assets.ts
│   │   ├── site.ts
│   │   ├── stats.ts
│   │   ├── pages/                    home.ts, about.ts, contact.ts, legal.ts, profile.ts
│   │   └── content.ts                utility copy/project terms; không duplicate page records
│   ├── types/                        content.ts, service.ts, project.ts, faq.ts, post.ts,
│   │                                 testimonial.ts, partner.ts, pricing.ts, navigation.ts,
│   │                                 assets.ts, routes.ts, forms.ts
│   ├── lib/
│   │   ├── queries/                  home.ts, about.ts, services.ts, projects.ts, posts.ts,
│   │   │                             faq.ts, site.ts, content.ts
│   │   ├── repositories/             contracts.ts, mock.ts, index.ts (future API adapter)
│   │   ├── routing/                  registry.ts, resolve-root-slug.ts, aliases.ts, locale.ts
│   │   ├── content/                  sanitize.ts, normalize-links.ts, validate.ts
│   │   ├── forms/                    schemas.ts, transport.ts, mock-transport.ts
│   │   └── assets/                   resolve.ts, manifest.ts
│   ├── dev/scenarios.ts              deterministic mock scenarios, dev/test only
│   └── styles/
│       ├── globals.css               stable import order
│       ├── tokens.css
│       ├── fonts.css
│       ├── motion.css
│       └── legacy/                   scoped extracted rules with source provenance
│                                     component styles colocated as *.module.css
├── public/
│   ├── wp-content/
│   │   ├── uploads/<year>/<month>/<original filename>
│   │   ├── fonts/fz-poppins/<original filename>           only if used
│   │   └── themes/flatsome/assets/css/icons/<filename>   icon-font allowlist
│   └── fonts/<verified licensed font binaries>          only when available
└── tests/                            route/schema/critical interactions/visual QA when implemented
```

`{...}` là ký hiệu liệt kê file, không phải literal folder name. Không tạo một file riêng cho mọi text leaf nếu component ngắn không có API tái sử dụng; cây này mô tả trách nhiệm. Không có generic `components/sections` chứa tất cả UI, không có production `features/careers` hoặc social landing.

## Colocation rule

Global UI → ui, global layout → layout, multi-route domain → domain folder. Page-specific children ở `_components` như cây trên. Sections dùng cả VI/EN là shared theo hai public routes, nên domain home/about/service có nhiều file; chúng không trở thành global primitives. Nếu triển khai thêm section độc nhất cho một locale/route, đặt ngay trong `app/.../_components`, không thêm vào domain shared khi chưa có consumer thứ hai.

Root wrappers dùng cùng server RootDocument và SiteShell; chỉ khác locale/utility shell, không copy markup/layout CSS. Page service rõ composition, lấy locale DTO và truyền props; không renderer generic liệt kê mọi section từ JSON.

## Routing safeguards

`[slug]` chỉ resolve post/category public hiện có qua repository; reserved paths thuộc config, không cố định allowlist bằng số slug lúc import. Static services/utility pages không đi qua catch-all content renderer. Không tạo thêm `[category]` cùng cấp. `page/[page]` dùng phân trang path giữ nguyên. Unknown route không rơi về service mặc định. Alias route ngoài tập HTML được config theo ROUTE_MAP. `public/` CSV là candidate preservation map; active JS/CSS chuyển sang source modules, không ship toàn WordPress theme/plugins.

## Điều chỉnh cho CMS-ready mock UI

Xem [MOCK_UI_PLAN](MOCK_UI_PLAN.md) và [ADMIN_CONTENT_MAP](ADMIN_CONTENT_MAP.md). UI public dùng local mock qua repository; không tạo `/admin`, API handlers, database client, auth provider hay upload endpoint trong đợt này. Public form dùng mock-transport trực tiếp, không cần server giả. Những API paths trong cây chỉ dành phase B.

Typed page data nằm `src/data/pages/{home,about,contact,legal,profile}.ts`; service data vẫn chia theo 8 service types; shared collection/entity data giữ file riêng. `src/data/content.ts` chỉ còn utility copy/project terms dùng chung, không lưu thêm bản sao của page data. Page DTOs và editorial metadata bổ sung trong DATA_MODEL. Fields/domain phát sinh sau này có thể thêm file mà không đổi route hierarchy.
