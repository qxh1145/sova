# Migration plan — public mock UI trước, backend sau

## Hướng triển khai đã cập nhật

Yêu cầu mới ưu tiên **coding mockup UI dùng typed local data**; backend sẽ tích hợp sau. Lượt này cập nhật planning, chưa bắt đầu code. [MOCK_UI_PLAN](MOCK_UI_PLAN.md) là checklist coding chính; [ADMIN_CONTENT_MAP](ADMIN_CONTENT_MAP.md) là danh sách trang/module có nội dung sửa qua dashboard tương lai.

Nghiệm thu phase code là một website public chạy/review được độc lập backend. Chưa bao gồm dashboard UI, database, auth, upload thật hay gửi lead thật. Backend credentials không chặn coding hoặc nghiệm thu UI mock. Các khối/page có data contracts từ đầu; chỉ integration phase sau mới cần persistent storage/publish workflows.

## Kết quả hiện tại và phạm vi

Đã hoàn tất kiểm kê tĩnh và kiến trúc đề xuất, chưa scaffold Next.js, chưa copy asset, chưa port CSS, chưa viết React. Điều này tuân thủ phần CURRENT PHASE / IMPORTANT CONSTRAINTS của yêu cầu đính kèm. Người dùng xác nhận thư mục đích là sibling `sova-landing-page`.

Giữ URL VI/EN và mọi page không bị chỉ định loại. Chỉ 16 Digital Media/Recruitment pages nằm ngoài migration. Route registry gồm 147 canonical marketing/content pages, login utility snapshot, redirect/alias contracts; 4 missing-content URLs được ghi riêng, không tự bịa nội dung.

## Dependency graph

```text
0 Baseline + decisions → 1 Scaffold/fonts/assets/styles/data contracts
 → 2 Shared shell → 3 UI primitives
 → 4 Home (vertical slice)
 → 7 Project listing/detail → 8 Blog/category/detail
 → 5 Shared domains + About → 6 Services
 → 9 FAQ/contact/legal/profile/utilities
 → 10 Responsive/motion regression → 11 Mock UI QA/cleanup/handoff
 → B Backend + dashboard integration (phase riêng về sau)
```

Các số phase dưới đây giữ để đối chiếu tài liệu cũ; thứ tự code ưu tiên collections/templates sớm theo graph và MOCK_UI_PLAN. Phase backend B độc lập và thực hiện sau khi UI mock hoàn tất.

QA diễn ra ngay trong từng phase, không để toàn bộ vấn đề responsive cuối dự án. Phase10 là sweep tổng thể. Query contract/route registry làm từ phase1; backend transport thật nối ở phase B. Form mock có đủ validation/loading/demo-success/demo-error để nghiệm thu giao diện; không coi demo-success là đã nhận lead thật.

## Phases với output và acceptance

| Phase | Files / routes ảnh hưởng | Components / công việc | Phụ thuộc | Validation / exit criteria |
| --- | --- | --- | --- | --- |
| 0. Baseline và anomaly register | `docs/*`, local source served read-only | Đối chiếu cây component của chủ dự án ([screen-component-tree](../_bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md)); captures VI/EN, missing assets, source interactions; route disposition | Bộ planning này | Mỗi family có desktop/mobile captures; không submit live; A01–A13 có trạng thái; thiếu PDF/font/chunks được đánh dấu, không gọi đó là regression |
| 1. Scaffold + contracts + fonts/assets/style | package/lock/tsconfig/Next config, `src/styles`, `src/types`, `src/data`, `src/lib`, public allowlist | Next.js 16 App Router + React 19 + TS strict theo TECH_STACK; pin compatible patched versions khi scaffold; models, async mock repository, route registry; copy asset allowlist giữ hash; preserve CSS cascade | Phase0 | Dev/build/typecheck chạy; asset hashes match; font tokens fallback áp dụng (không tải webfont typography); không còn broken local refs không giải thích; đủ route/ID schema; không inherited basePath `/eras-clone` vô ý |
| 2. Layout shell | VI/EN root wrappers + utility wrapper, components/layout, data/navigation/site | RootDocument, SiteShell, Header/Footer/FooterCTA, MobileMenu, Popup, FloatingContactActions, MobileContactBar, Cursor | 1 | Header/footer chỉ một lần; EN lang đúng SSR; navigation không có excluded routes; submenu/overlay/Escape/focus/scroll-lock tốt; links counterpart thật; không credential/live form submission; logo/tên/liên hệ chỉ đọc từ SiteSettings Sova |
| 3. UI primitives | components/ui, styles primitives | Button/Container/SectionHeading/FormField/Accordion/Tabs/Carousel/Dialog/Pagination | 1–2 | Keyboard và aria; carousel swipe/loop/options; no hydration warnings; primitive không import mock data; no whole-page use-client |
| 4. Home | `/`, `/en/home`, home/hero/stats/projects/partners/testimonials/blog domains | HeroVideo, HomeAchievements, ServicesAccordion, Marquee, FeaturedProjects, Partners, Testimonials, LatestPosts | 2–3 + data models | Đủ section gồm Stats; canonical project/post IDs; video crop; CSS typewriter; scroll pin; 3/2/1 cards và 6000ms testimonial autoplay; screenshots khớp source |
| 5. Shared domains + About | `/gioi-thieu`, `/en/about-us`, components/about/service/pricing/faq | Extract verified shared sections từ vertical slice; About goals/timeline/mission/capabilities; shared WhyChooseUs/cards | 4 | Không ép icon-box thành mega component; consumers đúng ownership; logo/testimonial/FAQ query dùng ID chung; About motion/counters/mobile checked |
| 6. Service pages | 8 VI + 8 EN explicit page files | Composition từng page; website pricing/banner/form; app WhyUs; SEO/branding panels; storage hub; email/hosting/VPS table/features | 3–5 | Thứ tự source đúng; 5/8 service types có projects; bảng giá/mobile scrolling readable; không có invented tabs; faqIds/placements resolve; CF7 fields giữ required đúng; no ServicePage boolean matrix |
| 7. Projects | du-an, en/our-project, featured_item, category3, detail62 | ProjectBrowser/Filters/Grid/Card, colocated detail Hero/Gallery/Info/Related, query pagination | 1 registry +4 project showcase +3 carousel | 62 slugs; category59/2/1; related links đúng; dynamic unknown slug404; loading/error/empty/filter reset; layout density từng route; log source AJAX pagination uncertainty trước quyết định pageSize |
| 8. Blog | goc-nhin/page2–5, categories6 + captured page2, EN insight, root posts27 | PostCard variants, BlogListing/Sidebar, native SearchForm, article components colocated, rich-content adapter | 1 data registry +3 UI +4 cards | Root route không đụng services/categories; preserved ordering/page links/counts; all27 article contents/media; EN links không tạo fake translations; sanitizer/URL rewrite; query search contract explicit |
| 9. FAQ/contact/legal/profile/utility | FAQ2, contact2, legal10, profile2, thank-you, sample, login, aliases | FAQTopics, ContactForm/Map, LegalContent, CompanyProfile route (FlipbookViewer plan sau), LoginPanel/adapter, ThankYou/Sample local components | 2–3 +6 FAQs/pricing +data/content | Shared FAQ answers/known revision; source fields/messages; submit errors preserve input; demo-success/error và thank-you preview có nhãn demo; legacy login chỉ mock fields/state; aliases không loop |
| 10. Responsive + motion integration | Tất cả retained routes và CSS/islands | Cross-breakpoint sweep, scroll/pin resize, offcanvas, tables, touch, reduced-motion | 4–9 | 390/549/550/768/849/850/1280/1440; no horizontal overflow ngoài intentional scroller; cleanup listeners khi navigate; no duplicated active forms/IDs; differences logged |
| 11. Mock UI QA + cleanup + handoff | Toàn app/docs, unused candidate assets/CSS, metadata/sitemap/robots, build | Comparison triage, ghi rõ anomalies còn thiếu nguồn, remove dead target code after reachability review, bàn giao contracts và mock scenarios | 10; không cần backend credentials | Build/typecheck/lint; route crawl/asset checks; screenshot diff review; keyboard; no mock-success claims; staging trên Vercel cho phép index (quyết định 03/10/2026); source hash unchanged; chạy được với local mock data không backend; không còn chuỗi/asset/link Eras ngoài ngoại lệ đã ghi; handoff kèm việc chưa làm ở phase B và các mục thương hiệu cần xác nhận trước release |

## Baseline và fidelity protocol

Serve source từ script read-only hoặc static server trong môi trường review; lưu baseline **ngoài source**. `serve.py` fallback ra live và POST fake portfolio có giới hạn: capture network log, không nhầm kết quả server mirror với WordPress thật. Không chạy `build.py` để lấy baseline vì nó ghi lại dist.

Chọn ít nhất một trang mỗi family, đồng thời kiểm tra exceptions: EN project blank-template, website duplicated form, THP gallery, project không gallery, long article table/video, FAQ tab, profile PDF, login utility. Dùng DOM/network evidence cùng screenshot; screenshots chỉ có ý nghĩa khi cùng fonts/viewport/scroll/slide state. Tắt animation có kiểm soát cho stable screenshot, test motion riêng ở trạng thái bật. Accessibility adjustments phải ghi khác biệt và giữ layout.

## Các quyết định/giới hạn còn lại

| Vấn đề | Quyết định hiện tại / công việc khi triển khai |
| --- | --- |
| Tên thư mục | Đã xác nhận `sova-landing-page`; không còn pending |
| Spec “Cây component chi tiết từng màn hình” | Đã có (03/10/2026): snapshot [screen-component-tree](../_bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md). Đã diff với COMPONENT_MAP; lệch thì source HTML quyết định |
| EN | Giữ vì không có yêu cầu xóa; use exact slug registry và locale-specific copy |
| Hosting / backend | Deploy: **Vercel** (03/10/2026); staging được index. Chưa chọn backend provider/database/CMS; dev/build mock UI độc lập chúng. Cache/invalidation chốt ở phase B |
| Source source-of-truth | canonical HTML/CSS/JS; docs là architectural intent; `dist` chỉ derivative. Không redesign |
| Thương hiệu | **Đã chốt 03/10/2026: Sova.** Xem mục “Quyết định đã chốt” |
| Fonts | **Đã chốt 03/10/2026: system font fallback, không self-host.** Xem mục “Quyết định đã chốt” |
| Profile PDFs | Remote-only. **FlipbookViewer plan sau** (03/10/2026); phase A chỉ render route + shell + heading |
| Project pagination | **6 dự án mỗi trang** (03/10/2026). Source AJAX có paged; mirror bỏ pagination |
| Forms/auth | Code validation và demo states không cần backend; giữ pending contracts cho phase B, không gọi source production endpoints |
| Unknown/broken links | Giữ registry anomaly; không xóa page/link âm thầm, không viết nội dung thay thế |
| Source anomalies | A01–A13 trong COMPONENT_REUSE_MAP; mọi fix ghi source/decision/result trước merge |

Các mục này không chặn hoàn thành **planning**; là dependency cho phase triển khai tương ứng.

## Quyết định đã chốt — 03/10/2026

### Thương hiệu: Sova

Website đích mang thương hiệu **Sova**. Giữ layout, CSS, motion và cấu trúc route của source; thay mọi điểm nhận diện Eras. Đây không phải redesign.

- **Một nguồn:** tên, logo, hotline, email, địa chỉ, map, social, Messenger/Zalo nằm trong `SiteSettings` (`companyName: 'Sova'`). Header, Footer, popup, floating contacts, mobile bar, contact, login panel và metadata title suffix đều đọc từ đây; không hard-code "Sova" trong JSX.
- **Text trong records** (service, FAQ, about, legal, posts, project terms, testimonials): thay khi import mock bằng **một** brand term map trong `src/lib/content/` — `Eras Việt Nam`, `Eras Vietnam`, `Eras Viet Nam`, `ErasVietnam`, `Eras` → `Sova`. Decode escaped unicode (`Eras Vi\u1ec7t Nam`) trước khi map; so khớp phân biệt hoa thường theo ranh giới từ để không đụng từ khác. Mỗi lần thay giữ `SourceRef`; không sửa `eras-clone`.
- **Link:** URL tới `erasvietnam.vn` / `themes.erasvietnam.vn` (search form action, link tuyệt đối trong bài) đổi thành internal path tương đối hoặc gỡ, ghi log; không để public link trỏ sang site Eras.
- **Assets Eras:** không dùng `logo-eras-*` và file có tên/nhận diện Eras. Chưa có logo Sova → logo slot render wordmark chữ "Sova" bằng font token, `AssetRef.status: 'missing'`; thay SVG khi chủ dự án cung cấp. Ảnh/infographic có chữ Eras in sẵn được liệt kê vào anomaly log, không tự vẽ lại.
- **Liên hệ Sova chưa được cung cấp:** mock dùng giá trị placeholder rõ ràng là giả (ví dụ `+84 000 000 000`, `hello@example.com`), **không** dùng số/email/địa chỉ thật của Eras. Phải thay trước release.
- **Slug chứa "eras"** (`/ho-so-nang-luc-eras-vietnam/`, `/en/porfolio-eras-vietnam/`, `/porfolio-eras-vietnam/`, `/eras-xin-chan-thanh-cam-on-quy-khach/`, `/login-eras/`): giữ trong mock vì route registry đổi được qua data; đổi sang slug Sova trước release, chốt cùng domain.
- **Nội dung chứng thực** (62 dự án, testimonials, partner logos, stats, PDF hồ sơ năng lực): giữ làm mock data để dựng UI. Trước public release, chủ dự án xác nhận Sova có quyền dùng hoặc thay bằng dữ liệu Sova. Đây là gate release, không chặn mock UI.
- **Kiểm tra:** grep build output (HTML/JS/metadata) không còn `Eras`, `eras-`, `erasvietnam` ngoài danh sách ngoại lệ đã ghi (vd. đường dẫn asset `wp-content` giữ tên file gốc, slug chờ đổi).

### Font: system fallback, không self-host

Không có binary SF Pro Display và license Apple không cho nhúng web; Kanit/Moul cũng dùng fallback theo quyết định này. Không tải Google Fonts/CDNFonts, không `next/font`, không preload font typography. FZ-Poppins không dùng (không phải font render của source). Icon font `fl-icons` vẫn giữ vì là icon, không phải typography.

```css
/* src/styles/tokens.css */
--font-body: -apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI",
  Roboto, "Helvetica Neue", Arial, sans-serif;
--font-display: var(--font-body); /* thay Kanit (.kanit-font) */
--font-alt: var(--font-body);     /* thay Moul */
```

- Port mọi `font-family` nguồn (kể cả `!important` ở child style 164–170) sang các token trên; không để sót tên font nguồn rơi về font mặc định trình duyệt.
- macOS/iOS render SF Pro qua `-apple-system` nên gần source nhất; Windows/Android/Linux sẽ khác. Khác biệt typography là **khác biệt đã chấp nhận**, không phải regression. Visual QA tập trung layout/spacing/breakpoint; snapshot Playwright tách theo platform.
- Font fallback đổi độ rộng chữ: kiểm tra typewriter (`steps(30)`) không bị cắt, marquee, heading nhiều dòng và nút không tràn ở các breakpoint của STYLE_AUDIT. Mọi stack trên đều hỗ trợ dấu tiếng Việt.
- Có file font hợp lệ về sau thì thêm `next/font/local` và chỉ đổi giá trị token, không sửa component.

## Definition of done cho coding agent kế tiếp

Đọc README → MOCK_UI_PLAN → ADMIN_CONTENT_MAP → ROUTE_MAP → COMPONENT_MAP/REUSE → DATA_MODEL/CLIENT_BOUNDARIES → ASSET_MAP/STYLE_AUDIT → MIGRATION_PLAN. Dùng machine inventories để tránh scan lại. Triển khai theo vertical slices trong target, source read-only. Không bước vào full migration nếu người dùng chưa mở phase đó. Mỗi phase report routes/components/data changed, validation thật đã chạy và remaining limitations; không khẳng định pixel parity hay gửi form thật chỉ từ build xanh.

## Phase B — backend/dashboard integration (sau mock UI)

- Build API repository/validation và import mock seed data; không thay hierarchy components.
- Admin modules theo ADMIN_CONTENT_MAP: collections, structured page editors, shared content, site settings/navigation/media; không xây page builder tự do.
- Auth/roles cho admin là flow riêng; legacy login URL không tự trở thành auth dashboard.
- Nối draft/publish/preview, media upload, slug history, consistency và cache invalidation cho mọi consumer của shared records.
- Nối form delivery/captcha theo backend được chọn; live-success mới khẳng định gửi thật. Run API/permissions/submit integration tests tại phase B, không biến chúng thành gate của UI mock.
- So lại content/layout/links sau import; exact source counts là baseline, không hard-limit số record có thể thêm từ admin.
