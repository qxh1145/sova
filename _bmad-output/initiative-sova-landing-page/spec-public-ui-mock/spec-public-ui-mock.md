---
id: SPEC-public-ui-mock
companions:
  - screen-component-tree.md
  - ../../../docs/MOCK_UI_PLAN.md
  - ../../../docs/TECH_STACK.md
  - ../../../docs/MIGRATION_PLAN.md
  - ../../../docs/ROUTE_MAP.md
  - ../../../docs/ADMIN_CONTENT_MAP.md
  - ../../../docs/COMPONENT_MAP.md
  - ../../../docs/COMPONENT_REUSE_MAP.md
  - ../../../docs/DATA_MODEL.md
  - ../../../docs/CLIENT_BOUNDARIES.md
  - ../../../docs/ASSET_MAP.md
  - ../../../docs/STYLE_AUDIT.md
  - ../../../docs/PROPOSED_FOLDER_STRUCTURE.md
  - ../../../docs/SOURCE_INVENTORY.md
sources:
  - ../../../README.md
---

> **Canonical contract.** This SPEC and the files in `companions:` are the complete, preservation-validated contract for what to build, test, and validate. Source documents listed in frontmatter are for traceability — consult them only if you need narrative rationale or prose color this contract intentionally omits.

# Sova public UI — Next.js trên mock data (phase A)

## Why

Vision + mandate: thay bản mirror WordPress `../eras-clone` bằng website public Next.js mang thương hiệu **Sova**. Website giữ nguyên layout, CSS, motion và URL của nguồn, không redesign. Content contracts sẵn sàng cho CMS để phase B (backend/dashboard) chỉ cần thay adapter, không phải đổi component. Phase A phải chạy và review được hoàn toàn trên typed mock data: chủ dự án nghiệm thu giao diện trước khi chọn backend, nên credentials/hosting không được chặn tiến độ.

## Capabilities

- **CAP-1**
  - **intent:** App chạy dev/build/typecheck/lint/test độc lập: không backend, không database, không env secret, không gọi live tới nguồn.
  - **success:** Trên máy sạch không có `.env`, `npm run build`, `lint`, `typecheck`, `test` đều pass và network log không có request tới domain WordPress/tracking.
- **CAP-2**
  - **intent:** Mọi URL canonical được giữ (147 trang VI/EN + login utility + aliases theo ROUTE_MAP) phục vụ đúng source path có trailing slash.
  - **success:** Crawl theo route registry trả 200 cho mọi route giữ lại. 16 route Digital Media/Recruitment không có page và không có link trong nav/service selector. Slug không có dữ liệu trả 404. Alias không lặp vô hạn.
- **CAP-3**
  - **intent:** Business content chỉ đọc qua typed async repository/query layer, mỗi record có một nguồn duy nhất.
  - **success:** Sửa một record FAQ/pricing/phone/hero trong mock là mọi consumer đều đổi theo, không phải sửa JSX. Grep không thấy business text hard-code trong component.
- **CAP-4**
  - **intent:** Collections mở rộng được bằng dữ liệu.
  - **success:** Thêm một project/post mock hợp lệ thì detail, listing, category và related đều hoạt động mà không cần thêm file page. Slug trùng reserved root path bị chặn.
- **CAP-5**
  - **intent:** Site shell dùng chung (header, footer, mobile menu, consult popup, floating contacts, mobile contact bar, cursor) render một lần cho mọi trang marketing VI/EN.
  - **success:** Playwright xác nhận sticky 90→70px, menu/popup mở/đóng bằng phím và Escape, focus return và scroll lock đúng. Logo/tên/liên hệ đọc từ `SiteSettings`.
- **CAP-6**
  - **intent:** Home là vertical slice đầy đủ: mọi section nguồn, gồm cả Stats (A01).
  - **success:** Home VI/EN render đủ section theo thứ tự nguồn: typewriter CSS, FeaturedProjects pin/scrub, testimonials autoplay 6000ms, posts 3/2/1. FeaturedProjects dùng ordered project IDs.
- **CAP-7**
  - **intent:** Người xem lọc dự án theo category và phân trang.
  - **success:** Mỗi trang hiển thị 6 dự án. Đổi filter thì reset về trang 1. Category website/branding/mobile-app khớp count 59/2/1. Scenario loading/empty/error xem trước được qua fixture.
- **CAP-8**
  - **intent:** Người xem duyệt blog theo listing, category, phân trang và tìm kiếm trên bài published.
  - **success:** Search khớp theo title/excerpt/body. `/goc-nhin/page/2–5/` và pagination các category giữ thứ tự và count của nguồn. Đủ 27 bài, kèm nội dung và media.
- **CAP-9**
  - **intent:** 8 service types × 2 locale và About là các composition tường minh, giữ thứ tự section của nguồn.
  - **success:** Mọi pricing/FAQ/testimonial/project ID tham chiếu đều resolve. Bảng giá đọc được trên mobile. Không có tab tự chế và không có ServicePage generic.
- **CAP-10**
  - **intent:** Consult/contact/website forms validate theo đúng required flags của nguồn và mô phỏng submit.
  - **success:** Mỗi form có idle/submitting/demo-success/demo-error. Trạng thái demo ghi “Bản demo — chưa gửi thông tin”. Khi lỗi, input được giữ nguyên. Phone của website form vẫn optional. Trang cảm ơn có preview demo được gắn nhãn.
- **CAP-11**
  - **intent:** Các trang utility và nội dung (FAQ topics, legal, contact map, sample, legacy login) hoạt động ở mức UI.
  - **success:** FAQ tabs dùng phím được và chia sẻ FAQ IDs với service FAQ. Trang hồ sơ năng lực render route + shell + heading. Login chỉ có fields/reveal/validation, không gửi credentials và không cấp quyền.
- **CAP-12**
  - **intent:** Nhận diện Sova thay Eras trên toàn site.
  - **success:** Grep build output (HTML/JS/metadata) không còn `Eras`, `eras-`, `erasvietnam` ngoài danh sách ngoại lệ đã ghi. Logo slot là wordmark “Sova”, liên hệ là placeholder rõ ràng là giả.
- **CAP-13**
  - **intent:** Fidelity responsive và motion so với baseline nguồn được chụp lại.
  - **success:** Có screenshot so sánh tại 390/549/550/768/849/850/1280/1440 (thêm 575/1199/1380 cho marquee). Không có horizontal overflow ngoài scroller có chủ đích. Listener được cleanup khi điều hướng. Mỗi khác biệt được phân loại source-missing / accepted / regression.
- **CAP-14**
  - **intent:** Bàn giao cho phase B và release.
  - **success:** Có tài liệu handoff liệt kê anomaly register (A01–A13 + mới phát sinh), mock scenarios, việc phase B chưa làm và các gate thương hiệu trước release.

## Constraints

- `../eras-clone` read-only: hash nguồn không đổi, baseline lưu ngoài nguồn, không chạy `build.py`.
- Stack khóa theo TECH_STACK. Không Tailwind, shadcn, Framer Motion, MSW, fake REST, DB/auth/CMS SDK. Mỗi responsibility chỉ một dependency.
- Server Components mặc định; client islands chỉ theo CLIENT_BOUNDARIES. Không fetch hoặc import fixture trong presentational components.
- CSS port giữ cascade/specificity, container 1320px, breakpoints 550/850. Chỉ dedupe sau khi đạt parity.
- Mock deterministic: không random IDs/content/delay, không setTimeout trong components. Scenario chọn qua dev/test fixture, không có debug UI hiển thị cho khách.
- Không gọi live WordPress/REST/nonce/tracking. Không lưu PII/credentials. Mock success không bao giờ được coi là đã gửi thật (`SubmitResult.mode`).
- Typography dùng system fallback font tokens, không webfont, không `next/font`. Giữ `fl-icons`.
- Assets giữ path `public/wp-content/uploads/...` với byte hash khớp nguồn, allowlist theo consumer. Không bịa asset hay nội dung bị thiếu.
- Page composition tường minh, không ServicePage boolean matrix, không tab tự chế (A03/A04).
- Embla là carousel engine duy nhất, đặt sau adapter. Phải prototype testimonials + project gallery + mobile pricing trước khi rollout toàn site.
- EN dùng đúng slug registry của nguồn: không thêm prefix `/en` vào slug VI, không bịa bản dịch.
- Deploy trên Vercel. Staging được index, nên placeholder liên hệ và nội dung chứng thực mượn từ Eras sẽ public từ bản staging.
- Anomaly A01–A13 phải có quyết định được ghi lại trước khi sửa. Slug chứa “eras” giữ nguyên trong mock.

## Non-goals

- Phase B: API/database, dashboard, CRUD lưu bền, auth/roles, media upload, gửi lead thật, captcha, publish/cache invalidation, slug history.
- Trang Digital Media và Recruitment (16 route), kể cả variant PageHero `background` và Testimonials `social` chỉ phục vụ chúng.
- FlipbookViewer cho hồ sơ năng lực: plan riêng sau.
- Redesign hoặc đổi layout/spacing so với nguồn.
- Parity typography ngoài macOS/iOS; self-host font.
- Analytics/tracking (GA, Ads, Meta, TikTok).
- Chính sách 404/410/redirect cho URL bị loại; đổi slug eras→sova; xác nhận quyền dùng nội dung chứng thực. Ba việc này là gate release, không thuộc mock.

## Success signal

- Reviewer clone repo về máy không có secret, build xong rồi duyệt được mọi route VI/EN giữ lại. Reviewer dùng thử filter, search, forms ở chế độ demo, sửa một mock record và thấy nó đổi ở mọi nơi dùng, đồng thời grep build output không còn Eras ngoài ngoại lệ đã ghi.

## Assumptions

- Code snippet và cây folder trong `docs/` là đề xuất, không phải signature bắt buộc.
- Thứ tự trong MOCK_UI_PLAN là thứ tự build. Bảng phase của MIGRATION_PLAN là checklist cho từng phase.
- “8 trang, 1 khung chung” trong cây component được hiểu là thứ tự section dùng chung + slot riêng từng service, dựng bằng composition tường minh cho từng page, không dùng ServicePage có cờ.
- Khi `screen-component-tree.md` khác COMPONENT_MAP (vd. PartnerLogos ở About), source HTML quyết định.
