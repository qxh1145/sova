# Các trang cần nội dung động và dashboard admin

## Quyết định phạm vi

Theo yêu cầu mới: **code mockup UI trước, tích hợp backend sau**. Tài liệu này phân loại khả năng biên tập của website public và đề xuất module dashboard tương lai. Chưa xây backend, database, CMS, auth hoặc màn hình admin trong phase UI public. Chưa bắt đầu code ở lượt cập nhật planning này.

“Nội dung động” ở đây nghĩa là dữ liệu chỉnh được qua admin sau này. Nó **không đồng nghĩa** mọi route phải có `[slug]`, dùng Client Component hoặc render server mỗi request. Home và service vẫn có composition riêng; query lấy nội dung mock bây giờ, adapter API sau. Layout, breakpoint, animation và loại section do code quản lý.

## Kết quả lọc

| Nhóm | Số URL canonical | Cách quản lý |
| --- | ---: | --- |
| COLLECTION | 89 (62 dự án + 27 bài viết) | Thêm/sửa/ẩn/xuất bản record, media, taxonomy, SEO; detail bằng slug |
| STRUCTURED | 36 (đã tính VI/EN) | URL/layout cố định, admin sửa các field nội dung trong form có cấu trúc |
| DERIVED | 20 (6 project listings + 14 blog/category/pagination) | Danh sách tự lấy từ collections; chỉ heading, rule và featured selection cần cấu hình |
| UTILITY | 2 canonical + 1 login snapshot | Thank-you, sample và legacy login; không cần CMS nội dung riêng ban đầu |
| EXCLUDED | 16 | Digital Media / Recruitment; không tạo module admin để quản lý các trang đã loại |

Tổng: 147 canonical giữ lại = **145 URL tiêu thụ nội dung quản lý được** + 2 utility; login ghi riêng. Con số 145 không phải 145 form hay database tables. Các trang cùng template dùng chung model/module. Slug và số trang hiện tại là seed source, không phải giới hạn cứng cho nội dung tương lai.

## 1. Collections cần CRUD — ưu tiên cao nhất khi nối admin

| Trang public | Admin module | Field cho phép chỉnh | Quan hệ / ảnh hưởng |
| --- | --- | --- | --- |
| `/featured_item/[slug]/` (62 bản nguồn) | Dự án | Tiêu đề, slug, khách hàng, mô tả, ảnh đại diện/hero/gallery, nội dung, ngày, metadata, danh mục, SEO, draft/published, related IDs | `/du-an/`, `/featured_item/`, category, Home, 5 loại service có FeaturedProjects, related projects |
| `/<postSlug>/` (27 bản nguồn) | Bài viết | Tiêu đề, slug, mô tả ngắn, cover, body có heading/list/image/table/embed được hỗ trợ, tác giả, ngày, danh mục, SEO, draft/published, related IDs | `/goc-nhin/`, category/pagination, `/en/insight/` theo nguồn, Home LatestPosts, related posts |

Thêm một bài hoặc dự án cùng template chỉ cần thêm record; không tạo thêm file `page.tsx`. Admin đổi slug sau này phải kiểm tra trùng và lưu redirect từ slug cũ; bài viết ở root phải tránh mọi service/legal/category/utility path được giữ. Mock thực hiện lookup từ dataset, không check một hard-coded danh sách 62/27 slug.

## 2. Trang cố định nhưng nội dung phải editable

### Home, About, contact và nội dung hỗ trợ

| Trang VI | Trang EN | Nội dung admin chỉnh | Nguồn |
| --- | --- | --- | --- |
| `/` | `/en/home/` | Hero text/video/ảnh/CTA; achievement stats; service order; marquee text; chọn/thứ tự dự án, logo đối tác, đánh giá, bài nổi bật; section headings | HomePageContent + ID references |
| `/gioi-thieu/` | `/en/about-us/` | Hero, stats, goals, mục tiêu/cam kết/sứ mệnh/tầm nhìn, timeline, capabilities, logo/đánh giá được chọn | AboutPageContent + shared IDs |
| `/cau-hoi-thuong-gap/` | `/en/faq/` | Topic title/order, câu hỏi/đáp án, FAQ placements; cùng records với service FAQs | FAQ + FAQTopic |
| `/lien-he/` | `/en/contact-us/` | Heading/copy, địa chỉ, hotline, email, link xã hội, URL map; nhãn form nếu cần | ContactPageContent + SiteSettings; không có bản copy địa chỉ riêng |
| `/dieu-khoan-su-dung/` | `/en/terms-of-use/` | Tiêu đề, nội dung có cấu trúc, SEO, ngày cập nhật | LegalPage |
| `/chinh-sach-bao-mat/` | `/en/privacy-policy/` | Như legal trên | LegalPage |
| `/chinh-sach-hoan-tien/` | `/en/refund-policy/` | Như legal trên | LegalPage |
| `/chinh-sach-bao-hanh/` | `/en/warranty-policy/` | Như legal trên | LegalPage |
| `/huong-dan-thanh-toan/` | `/en/payment-guide/` | Nội dung, tài khoản/ngân hàng/QR, hướng dẫn; không phải payment gateway | PaymentGuideContent |
| `/ho-so-nang-luc-eras-vietnam/` | `/en/porfolio-eras-vietnam/` | Tiêu đề, cover, PDF theo locale, SEO | CompanyProfileContent + MediaAsset |

Home chọn ID của project/post/testimonial/partner, không nhập lại nội dung của card. Stats là số liệu biên tập thủ công theo source, chưa phải analytics thời gian thực. Với các khối lặp trong **cùng section**, admin được đổi thứ tự items; thứ tự/loại section của trang vẫn giữ theo source trong đợt đầu.

### 8 loại service × 2 locale = 16 URL

| Service | Route VI | Route EN | Field riêng ngoài hero/SEO/FAQ/testimonials |
| --- | --- | --- | --- |
| Website | `/thiet-ke-website/` | `/en/website-development/` | Benefits, 3 gói giá/features/CTA, contact banner copy, WhyChooseUs, featured project IDs |
| Mobile App | `/thiet-ke-app-mobile/` | `/en/app-mobile-development/` | Benefits, WhyChooseUs, featured project IDs |
| SEO | `/seo-tu-khoa-website/` | `/en/website-keyword-seo/` | Benefits, Onpage/Offpage/chăm sóc/content panels, featured project IDs |
| UI/UX Branding | `/ui-ux-branding-design/` | `/en/ui-ux-branding-design-2/` | Benefits, logo/UIUX/identity/point-of-sale panels, featured project IDs |
| Storage hub | `/giai-phap-luu-tru/` | `/en/storage-solution/` | Hosting/VPS/email offers, pricing references, featured project IDs |
| Email | `/e-mail-doanh-nghiep/` | `/en/business-e-mail/` | Pricing table, upgrade options, features |
| Hosting | `/hosting-doanh-nghiep/` | `/en/business-hosting/` | Pricing table, features |
| VPS | `/vps-doanh-nghiep/` | `/en/business-vps/` | Pricing table, features |

Service layout và route khóa theo 8 loại đã audit. Admin sửa nội dung mỗi loại bằng form phù hợp; chưa có tính năng tạo dịch vụ với layout hoàn toàn mới. Pricing là model riêng, references dùng lại ở storage hub. Điều chỉnh service content không được tự đổi layout, thêm section bất kỳ hay làm xuất hiện pricing ở một template không có pricing.

## 3. Listing/category/pagination: dữ liệu suy ra

| Nhóm | URL đang có | Admin chỉnh trực tiếp | Dữ liệu lấy từ đâu |
| --- | --- | --- | --- |
| Project listing (6) | `/du-an/`, `/featured_item/`, `/en/our-project/`, `/featured_item_category/{website,branding,mobile-app}/` | Heading/hero/CTA theo route, category labels/order; layout variant do code | Project status/category, sort/query, source fixture ordering |
| Blog listing (14) | `/goc-nhin/`, `/goc-nhin/page/2/`…`5/`, `/en/insight/`, 6 category dưới đây và 2 trang pagination | Heading/sidebar label, category labels/order; count đọc từ dataset public khi integration | Published posts + categories + pagination query |
| Blog categories (đã nằm trong 14) | `/tin-tuc/`, `/thu-thuat/`, `/social-marketing/`, `/ux-ui/`, `/goc-nhin-website/`, `/creative-branding/` | Name/description/SEO; slug có reserved-path guard khi mở tính năng sửa | Posts có category tương ứng |
| Category pagination (đã nằm trong 14) | `/social-marketing/page/2/`, `/thu-thuat/page/2/` | Không có màn hình “sửa trang 2” riêng | Query results |

Không lưu HTML/card arrays độc lập cho từng trang pagination. `ListingSnapshot` từ mirror chỉ là fixture dùng kiểm tra fidelity. Sau nối CMS, query xuất bản là nguồn danh sách/counts/pagination; số sourceDisplayCount cũ chỉ còn phục vụ baseline, không ghi đè số liệu thật. Khác biệt được ghi nhận trong integration QA.

`/social-marketing/` là category blog **vẫn giữ**, không phải trang dịch vụ Digital Media đã loại.

## 4. Dữ liệu dùng toàn site cần module admin riêng

| Module | Field và thao tác | Consumers |
| --- | --- | --- |
| Site settings | Tên công ty, địa chỉ, hotline/email, logo, social links, map, footer CTA, popup copy | Header/footer/contact/mobile bar/floating actions/popup |
| Navigation | Label, route/external target, thứ tự, nested items; chỉ chọn route public hợp lệ | Desktop/mobile/footer |
| Pricing | Plans, prices/units/discount labels, rows/features, upgrade options, CTA | Website/email/hosting/VPS/storage |
| FAQ | Question/answer, topics, service refs, thứ tự placements | Service pages + FAQ global |
| Testimonials | Tên/chức vụ/công ty/avatar/quote; chọn và sắp xếp ID | Home/About/service |
| Partners | Tên/logo/link; chọn/thứ tự ID | Home/About |
| Media | Ảnh/video/PDF, alt, dimensions, link; usage references | Tất cả content models |
| Categories / authors | Label/name, metadata, associations | Projects/blog/filter/sidebar |
| SEO theo record/page | Title, description, social image; canonical được suy ra từ route chuẩn | Metadata của page/post/project/service |

Không đưa CSS class, khoảng cách, breakpoint, script, React component name hay config animation vào form admin. Link/media fields dùng kiểu dữ liệu có kiểm tra, không nhập arbitrary executable HTML. Thư viện ảnh/PDF lúc mock dùng local AssetRef; upload thực là chức năng backend phase sau.

## 5. Utility và các hành vi không thuộc CMS nội dung

- Thank-you `/eras-xin-chan-thanh-cam-on-quy-khach/`: copy để trong data nhỏ; chưa cần admin screen riêng. Có thể đưa vào SiteSettings sau nếu có nhu cầu.
- `/sample-page/`: giữ theo scope nguồn, không đưa thành module nội dung cốt lõi.
- `/login-eras/`: giữ legacy UI/route; **không mặc định dùng làm auth cho dashboard admin mới**. Auth là integration riêng sau.
- Search, filters, pagination, accordion, popup là UI logic; admin chỉ thay data chúng dùng.
- Inbox lead, gửi email, upload, auth/roles, analytics là backend workflows về sau; không giả định đã có chỉ vì form UI chạy được.

## 6. Cấu trúc dashboard đề xuất cho phase backend

```text
Nội dung
  Bài viết / Danh mục / Tác giả
  Dự án / Danh mục
  Trang cố định: Home, About, Contact, Legal, Profile (VI/EN)
  Dịch vụ (8 loại)
Dữ liệu dùng chung
  Bảng giá / FAQ & topics / Đánh giá / Đối tác / Media
Cấu hình website
  Thông tin công ty / Menu / Footer & popup
```

Đây là information architecture tương lai, chưa thêm `/admin` routes vào mockup public. Nhóm core khi nối admin: posts/projects, services/pricing/FAQ, settings/menu; sau đó form editor cho Home/About/legal/profile, media/preview theo nhu cầu. Tất cả đã dùng mock content layer từ đầu, không trì hoãn việc tách data đến lúc xây dashboard.

## 7. Publish và đồng bộ nhiều nơi

Một record có ID ổn định, locale, draft/published/archived, updatedAt/revision và metadata. Admin cập nhật draft không đổi public data; publish mới đưa revision ra public. Cơ chế cache/invalidation chọn khi biết backend/hosting, với dependency graph dự kiến:

| Record publish | Consumers phải đọc revision mới |
| --- | --- |
| Project | Detail, listings/category, Home/service featured, related projects |
| Post | Detail, listings/category/page/search, Home latest, related posts |
| FAQ | FAQ global + service pages dùng faqId |
| Pricing | Service sở hữu + storage hub references |
| Settings/navigation | Toàn bộ site shell + Contact |
| Partner/testimonial | Tất cả curated placements dùng ID đó |

VI/EN dùng localization identity rõ ràng; không copy record tiếng Việt thành bản dịch giả. Preserve known EN-to-VI content links như nguồn. Hidden/draft referenced content được loại khỏi public query và hiển thị cảnh báo broken reference trong admin tương lai; public không để card hỏng. Route cố định/service không đổi slug trong editor ban đầu.

## Danh sách lọc theo từng URL

[admin-content-routes.csv](evidence/admin-content-routes.csv) và [JSON tương ứng](evidence/admin-content-routes.json) gán CMS kind, module, data source, route policy cho **toàn bộ 163 canonical entries + login snapshot**. Các URLs alias/404 không là record biên tập độc lập; xem ROUTE_MAP.
