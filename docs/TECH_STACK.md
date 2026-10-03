# Frontend tech stack — Sova landing page

Quyết định cho public UI mock trước, backend/dashboard nối sau. Đây là lựa chọn kiến trúc dựa trên source audit; chưa cài dependency, scaffold hoặc code app. Các package phải khóa phiên bản tương thích trong lockfile khi bắt đầu code, không dùng canary/beta mặc định.

## Stack được chọn

| Lớp | Lựa chọn | Áp dụng trong dự án |
| --- | --- | --- |
| Framework | Next.js 16, App Router | Giữ URL nguồn, shared layouts, template project/post theo slug, metadata; Server Components mặc định |
| UI runtime | React 19, react-dom cùng phiên bản tương thích Next | Client islands cho tương tác; không biến cả page thành client |
| Ngôn ngữ | TypeScript, strict mode | Content models, props, repository contracts, locale/route mapping |
| Styling | CSS Modules + global CSS có kiểm soát + CSS custom properties | Port source CSS theo cascade; giữ spacing, fonts, colors, breakpoints; component styles colocated |
| UI behavior primitives | Radix Primitives (Dialog, Accordion, Tabs khi cần) | Focus/keyboard/state cho popup, mobile drawer, FAQ; tự style theo source |
| Motion | CSS transitions/keyframes + GSAP/ScrollTrigger + @gsap/react | CSS cho typewriter/marquee/hover; GSAP cho pinned horizontal projects và animation cần DOM |
| Carousel | Embla Carousel React | Một Carousel adapter dùng chung, thêm autoplay/auto-height plugin khi instance cần |
| Forms | React Hook Form + Zod + @hookform/resolvers | Typed fields, validation/schema, trạng thái submit mock; transport thật nối sau |
| Content/data | Typed TS mock records + async repository/query layer | Đọc local trước; thay API adapter khi backend có, không fetch trong cards |
| UI state | useState / useReducer; Context chỉ phạm vi cần dùng chung | Menu, popup, filters, active tabs; không global store cho content read-only |
| Locale | Typed VI/EN dictionaries + route counterpart map + Intl | Giữ slug EN/VI thực tế, không tự thêm locale prefix vào mọi URL |
| Media/SEO | Next built-in image/font/metadata khi phù hợp; native video | Giữ crop/aspect ratio; local fonts khi đã có binaries đúng; metadata từ models |
| Test | Playwright + Vitest | Playwright cho critical flows/visual comparisons; Vitest cho selectors, schemas, slug resolution |
| Tooling | Node.js 24 LTS + npm + ESLint + Prettier | Một package-lock; tách build, lint, typecheck; CI dùng cùng Node major |

Chọn patch Next 16/React 19 đã được vá và tương thích tại lúc scaffold; không lấy version cũ từ mirror làm npm version. Node 24 là target runtime phát triển, không phải yêu cầu nâng runtime hệ thống trong phase planning. [Next installation](https://nextjs.org/docs/app/getting-started/installation), [Node release table](https://nodejs.org/en/about/previous-releases).

## Vì sao CSS Modules phù hợp bản migrate này

Source có Flatsome/child CSS, nhiều per-section rules, container1320px, breakpoint550/850px và overrides riêng. CSS Modules cho scope theo component; global stylesheet giữ font/tokens/layout rules dùng chung. Next hỗ trợ cả CSS Modules và global CSS. [Next CSS](https://nextjs.org/docs/app/getting-started/css).

Đợt đầu không cài Tailwind hoặc áp dụng một component theme có sẵn. Đây là quyết định giữ fidelity: không thay source spacing bằng utility preset, không thêm preflight làm đổi default styles. Khi đạt parity mới gom CSS lặp; CSS Modules không bắt buộc rewrite sạch toàn bộ source CSS ngay từ đầu.

Radix là primitives không áp đặt giao diện hoàn chỉnh; dùng phần behavior rồi viết CSS khớp nguồn. Native link/button/input vẫn ưu tiên cho phần đơn giản. Không cài toàn bộ component catalog hoặc dùng shadcn theme cho public marketing pages. [Radix introduction](https://www.radix-ui.com/primitives/docs/overview/introduction).

## Motion và carousel: adapter có kiểm tra parity

GSAP dùng trong client island với scoped refs và cleanup qua useGSAP; giữ pin/scrub/resize lifecycle. CSS typewriter/marquee không cần client timer. Không thêm Framer Motion/Motion song song cho cùng một loại hiệu ứng. [GSAP React](https://gsap.com/resources/React/).

Embla là lựa chọn đích cho slider React; repository chính thức có React wrapper. [Embla repository](https://github.com/davidjerleke/embla-carousel).

Nguồn dùng Flickity options nên không coi Embla là thay thế tương đương từng tham số. `friction`, `selectedAttraction`, focus-style scaling, grouped cells, adaptiveHeight, drag threshold và autoplay pause phải được đối chiếu từng instance bằng visual/interaction QA. Dựng prototype testimonials + project gallery + mobile pricing trước khi triển khai toàn site. Nếu một behavior quan trọng không đạt, thay implementation phía sau Carousel adapter và ghi quyết định; không âm thầm bỏ behavior hoặc duy trì hai carousel engines toàn site.

Profile PDF giữ FlipbookViewer adapter riêng; **plan sau, ngoài phase A** (03/10/2026). Chưa chốt thay DFlip bằng thư viện khác khi thiếu PDF local; phase profile cần xác minh viewer API/assets và behavior. Không dùng iframe PDF đơn giản rồi tuyên bố đã giữ flipbook parity.

## Forms và dữ liệu mock

React Hook Form quản lý field/form state; Zod định nghĩa validation schema; resolver nối hai phần. Giữ source-required rules, không tự biến optional phone thành required. Mock transport trả demo-success/demo-error có nhãn rõ chưa gửi thật. [React Hook Form](https://github.com/react-hook-form/react-hook-form), [Zod](https://zod.dev/).

```text
Next page (Server)
  → page query
  → ContentRepository
  → MockRepository → src/data/*.ts
  → typed props → sections/cards/client islands

Backend phase:
  ContentRepository → ApiRepository → API/CMS
```

UI public có khả năng quản lý nội dung từ admin nhờ typed models/IDs/relationships, không nhờ Redux hoặc một page-builder library. Không import fixture trực tiếp trong presentational components. `fetch` chuẩn dùng trong API adapter khi có endpoint; chưa cần Axios/TanStack Query/SWR cho mock local reads. Sau này dashboard nhiều mutations/pagination/caching có thể đánh giá TanStack Query riêng, chưa đưa thành dependency bắt buộc của public site.

Không cần MSW/fake REST server ở đợt đầu vì repository mock đã đủ cho UI. Không thêm database SDK, Prisma, auth SDK hoặc CMS SDK trước khi chọn backend. Rich content phải đi qua allowlisted import/sanitize boundary theo DATA_MODEL; lựa chọn sanitizer/editor xác định khi triển khai content adapter, không render arbitrary CMS HTML trực tiếp.

## UI state, locale và media

- Menu/popup/filter state nằm ở island sở hữu nó; Context chỉ khi trigger và dialog cần phối hợp. Không đặt toàn public content trong global client store.
- Hai locale dùng dictionary/slug map hiện có. `Intl` cho formatting; giữ display text giá/ngày từ source khi parity yêu cầu. Thêm i18n framework khi có nhu cầu dịch/phân phối locale vượt scope này, không refactor URLs ngay bây giờ.
- Giữ ảnh/icon nguồn; logo và nhận diện là Sova, không dùng logo Eras. Không thay icon hệ thống bằng Lucide chỉ để đồng bộ thư viện. next/image chỉ áp dụng khi giữ được dimensions/crop/srcset và deployment hỗ trợ; video dùng native video element.
- Font: **system fallback** qua CSS tokens, không `next/font`, không tải webfont (đã chốt 03/10/2026, xem MIGRATION_PLAN). Có font file hợp lệ sau này mới thêm `next/font/local`. Không thay bằng Inter/Poppins.

## Kiểm thử và commands dự kiến

Playwright: menu/popup keyboard behavior, filters, paging, form demo states, locale navigation, screenshot comparisons tại breakpoints nguồn. [Playwright visual comparisons](https://playwright.dev/docs/test-snapshots).

Vitest: pure queries, dedupe/reference integrity, schemas và route resolution; không dùng unit-render async Server Components làm gate. Next hướng dẫn dùng E2E cho async Server Components do Vitest chưa hỗ trợ trực tiếp trường hợp đó. [Next Vitest guide](https://nextjs.org/docs/app/guides/testing/vitest).

Khi scaffold sẽ có scripts dev/build/start, lint (eslint), typecheck (tsc --noEmit), format, test (vitest), test:e2e (playwright). Lint chạy riêng, không giả định next build chạy lint. Snapshot review dùng môi trường/fonts/viewport cố định. Không thêm tests chỉ lặp lại text JSX.

## Package groups để coding agent cài đúng lúc

```text
Core:
  next, react, react-dom

Client islands (cài khi triển khai consumer):
  @radix-ui/react-dialog
  @radix-ui/react-accordion
  @radix-ui/react-tabs
  gsap, @gsap/react
  embla-carousel-react
  embla-carousel-autoplay, embla-carousel-auto-height (nếu instance cần)
  react-hook-form, zod, @hookform/resolvers

Development:
  typescript, @types/node, @types/react, @types/react-dom
  eslint, eslint-config-next, prettier, eslint-config-prettier
  @playwright/test, vitest
```

Danh sách là kế hoạch, chưa phải package.json đã install/build-tested. Chốt versions và peer compatibility khi scaffold. Không thêm dependency thứ hai cho cùng responsibility nếu adapter hiện tại đáp ứng.

## Backend/dashboard sau này

Giữ Next/React/TypeScript, domain schemas và reusable form primitives. Admin là scope riêng, có authentication/editor/mutations/permissions của nó; không thêm các thư viện dashboard vào bundle public khi chưa có consumer. Content từ API vẫn đi qua repository/query để service/home/legal không phải đổi layout. Deploy trên Vercel (03/10/2026); cache invalidation chốt cùng backend, không khóa static export ngay ở phase mock.
