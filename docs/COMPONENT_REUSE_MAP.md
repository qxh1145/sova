# Component reuse map

## Quyết định dựa trên DOM thực tế

| Component | Consumers giữ lại | Quyết định / props nhỏ | Vị trí |
| --- | --- | --- | --- |
| Header/Footer/Menu/Popup/Actions | Mọi marketing page, VI/EN | Duy nhất SiteShell; locale + navigation props; login utility ngoại lệ | components/layout |
| SectionHeading | Home/About/Service/Testimonials/Projects | eyebrow, title, optional description; semantic heading level tách style | components/ui |
| PageHero | Services, About, Projects, FAQ/legal/profile | Discriminated union service / split-cta / simple. Background chưa có consumer cần thiết ngoài trang bị loại; ProjectHero riêng | components/hero |
| PageHeading | Blog, article, contact | Nền/spacing cs-page_heading khác banner; giữ riêng cho đến khi đo visual parity | components/hero |
| ServiceHero | 8 services ×2 locale | Wrapper nhỏ PageHero service, illustration, heading lines, marquee | components/service |
| ServiceBenefits | Website, app, SEO, UI/UX | 4 BenefitItem + media; content props, giữ breakpoint | components/service |
| WhyChooseUs | Website + app, VI/EN | Shared domain; không còn gọi là page-specific như doc cũ | components/service |
| ServiceDetailCards | WhyChooseUs + SEO + branding | Cấu trúc panels/list + mobile slider; dùng children hoặc typed panel data; **không invent tab** | components/service |
| StorageOfferings | Storage VI/EN | Cấu trúc riêng với offers và pricing, không ép vào generic TabbedFeatureList | components/service/storage |
| PricingCards | Website VI/EN | Một shared pricing presentation; locale/currency/text là data | components/pricing |
| PricingTable | Email/Hosting/VPS/Storage VI/EN | Columns/rows typed; hỗ trợ feature groups, unit, CTA, không render cards bằng hàng chục cờ | components/pricing |
| Testimonials | Home/About/8 Service VI/EN | default .ss-kh; **không triển khai social** vì chỉ consumer đã bị loại | components/testimonials |
| FeaturedProjects | Home + website/app/SEO/UIUX/storage VI/EN | Horizontal scroller + ordered project IDs; khác ProjectGrid card nhỏ | components/projects |
| ProjectCard | archive/category/filter results/related | Thumbnail/title/category thống nhất; layout đặt ở grid consumer | components/projects |
| ProjectShowcaseItem | FeaturedProjects | Card khổ lớn/horizontal, giữ riêng với ProjectCard nếu đổi variant làm tăng coupling | components/projects |
| PostCard | Home/list/category/related | list / grid / slider là ba variant nhỏ; slider là wrapper bên ngoài, card server | components/blog |
| FAQAccordion / ServiceFAQ | 8 services + FAQ VI/EN | FAQ ID/query chung; topic tabs chỉ wrapper FAQTopics | components/faq và service |
| Stats | Home + About VI/EN | Có consumer thực ở Home, không chỉ About/social | components/stats |
| PartnerLogos | Home/About VI/EN | Asset refs dùng chung; grid/track wrappers giữ theo bố cục | components/partners |
| Marquee | Home/About/service | CSS animation dùng chung, không React timer | components/motion |
| Carousel | Testimonials/posts/goals/pricing/details | Adapter client, config nhỏ có kiểu; nội dung children có thể server-render | components/ui |
| Contact / Consult / Website forms | Popup / contact / website | Chung FormField + validation primitives + transport; giữ ba form riêng theo fields | components/forms |
| BlogSidebar | Listing/category/pagination/EN insight | Shared vì nhiều route; doc cũ ghi page-specific không đúng phạm vi | components/blog |
| ProjectFilters | du-an/featured_item/category/EN | Shared domain, không nằm riêng trong du-an/_components | components/projects |
| CompanyInfo | Footer/contact | SiteSettings single source, markup compact thích hợp từng context | components/company |
| FlipbookViewer | VI/EN company profile | Plan sau (03/10/2026), ngoài phase A. Shared domain lazy-loaded; PDF chưa mirror, không âm thầm thay bằng ảnh | components/content |

## API đề xuất

```ts
type PageHeroProps =
  | { variant: 'service'; headingLines: string[]; image: AssetRef; description?: string }
  | { variant: 'split-cta'; headingLines: string[]; image: AssetRef; cta: LinkModel }
  | { variant: 'simple'; title: string; background?: AssetRef };
type PostCardProps = { post: PostSummary; variant: 'list' | 'grid' | 'slider' };
// Chỉ đề xuất type, chưa tạo file source.
```

Không thêm `background` hoặc `social` variant chỉ để đáp ứng tên trong doc cũ. Nếu một route được giữ thật sự cần bố cục background khác, thêm sau khi đối chiếu crop, height và overlay; không coi Careers là consumer còn tồn tại.

## Giữ riêng / colocate

- `app/(site)/(vi)/featured_item/[slug]/_components`: ProjectHero, ProjectGallery, ProjectBodyLayout, ProjectContent, ProjectDeliveryTerms, ProjectInfoSidebar, RelatedProjects. Dù 62 bản dữ liệu, đây là **một template route**.
- `app/(site)/(vi)/[slug]/_components`: ArticleHeroImage, PostMeta, ArticleBody, RelatedPosts; category branch chỉ gọi BlogListing shared.
- `app/(site)/(vi)/eras-xin-chan-thanh-cam-on-quy-khach/_components`: ThankYouMessage.
- `app/(site)/(vi)/sample-page/_components`: SampleContent.
- `app/(utility)/login-eras/_components`: LoginPanel, LoginForm.
- Section website/contact/home/about cần cả VI/EN được đặt shared domain tương ứng, **không global UI**. Nếu section chỉ còn một consumer thật sau đối chiếu locale, chuyển về `_components` của route đó. Không tạo component rỗng cho từng div/gap/icon wrapper.

## Không hợp nhất quá sớm

- Pricing cards và table khác semantic structure, responsive, data columns: hai component.
- BlogPagination là link navigation; ProjectPagination là state/AJAX interaction: chung Button primitive nếu hợp, không chung stateful controller.
- Home service accordion không phải FAQ: heading, số thứ tự, ảnh/CTA và click behavior khác.
- Goals carousel của About, service benefits và contact info đều dùng `.icon-box` nhưng không cùng domain abstraction.
- RichText chỉ dành nội dung biên tập (article/legal/project description), không dùng để nhúng header/page builder toàn trang.
- Nội dung terms dự án lặp được đưa vào `ProjectDeliveryTerms` với version ID; chỉ dedupe khi nội dung khớp, không ghi đè trường hợp khác.

## Bất thường phải ghi trước khi chỉnh

| ID | Nguồn / xung đột | Quyết định kế hoạch |
| --- | --- | --- |
| A01 | Doc cũ bỏ Home Stats; `index.html:786` và 4 count-up | Bổ sung Stats; sửa cây theo nguồn |
| A02 | Doc cũ gợi ý bỏ featured_item/sample/login | Không làm theo; chỉ Digital Media/Recruitment được loại |
| A03 | Doc cũ đề xuất data-driven giant ServiceTemplate | Dùng composition rõ từng page, data không chứa mọi layout boolean |
| A04 | “TabbedFeatureList” không có tabbed-content ở service | ServiceDetailCards + mobile Carousel; tabs thật ở FAQ |
| A05 | SEO FAQ #7 có literal `</p` ở cuối đáp án (`seo-tu-khoa-website:3935`); FAQ global 1300 không có | Lưu một FAQ với answer revision/source override tạm thời; chưa tự sửa lỗi văn bản |
| A06 | Home H1 desktop/mobile và Website form bị lặp | Ghi rõ trước; đề xuất một data source, responsive markup giữ visual/behavior, loại duplicate IDs chỉ khi có baseline |
| A07 | EN profile slug `porfolio`; EN UIUX alias về VI | Giữ URL theo manifest, không tự sửa tiếng Anh |
| A08 | `en/our-project` page-blank nhưng vẫn có Header/Footer | Dùng SiteShell bình thường, đo riêng layout |
| A09 | Social footer kép | Trang đã loại; không xây variant để sửa trang ngoài scope |
| A10 | Original AJAX pagination bị server mirror giản lược | Không tuyên bố parity pagination khi chỉ dựa serve.py; cần capture behavior nguồn trước phase projects |
| A12 | `/featured_item/index.html:609` có heading tên THP trước hero chung; THP detail có H1 lặp ở 655/748 | Ghi anomaly heading, giữ baseline trước khi chỉnh semantic hierarchy |
| A13 | Storage service FAQ ×4 là bản copy nhầm từ SEO FAQ (theo cây component chủ dự án) | Mock giữ nội dung nguồn; quyết định sửa ghi anomaly log trước khi áp dụng |
| A11 | Featured project content (tên/hình/href) và taxonomy có thể khác kỳ vọng | Lưu occurrence mapping theo href/slug; THP có category branding, không suy luận category từ tên |

`evidence/faq-occurrences.json` lưu câu hỏi/đáp án đã bỏ style/script, kèm source/line. Sau normalize whitespace, nhóm VI service + global FAQ chỉ có 1 trường hợp cùng question khác answer là A05; chưa khẳng định cùng câu chữ ở locale EN là bản dịch hoàn chỉnh.
