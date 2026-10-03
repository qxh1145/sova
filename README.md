# Sova landing page — Next.js migration planning

Thư mục đích được xác nhận: `/Users/quan/HocTap/Vibecode/sova-landing-page`.
Nguồn chỉ đọc: `../eras-clone`.

**Trạng thái: hoàn thành tài liệu kiến trúc; chưa khởi tạo ứng dụng Next.js hoặc migrate giao diện**, theo CURRENT PHASE của yêu cầu đính kèm. Không có lệnh `npm run dev` ở giai đoạn này.

## Frontend tech stack

[TECH_STACK](docs/TECH_STACK.md): Next.js 16 App Router + React 19 + TypeScript strict; CSS Modules; Radix primitives; GSAP; Embla; React Hook Form/Zod; typed mock repository; Playwright/Vitest. Chưa cài dependencies.

## Hướng coding đã cập nhật: mock UI trước, backend sau

- [MOCK_UI_PLAN](docs/MOCK_UI_PLAN.md) — thứ tự coding, typed mock data, interactions/demo form states, tiêu chí nghiệm thu không cần backend.
- [ADMIN_CONTENT_MAP](docs/ADMIN_CONTENT_MAP.md) — lọc 89 URL collection, 36 structured pages, 20 derived listings và utility; field/module admin cần quản lý.
- [Danh sách từng URL (CSV)](docs/evidence/admin-content-routes.csv), [JSON](docs/evidence/admin-content-routes.json).

Mục tiêu code tiếp theo là public UI. Dashboard, CRUD lưu bền, auth, upload và gửi lead thật tích hợp ở phase B. Chưa bắt đầu code trong lần cập nhật planning này.

## 8 tài liệu bắt buộc

1. [ROUTE_MAP](docs/ROUTE_MAP.md) — mọi canonical route, nguồn, giữ/loại, alias, dynamic routing.
2. [COMPONENT_MAP](docs/COMPONENT_MAP.md) — cây từng màn hình, child/interaction, GLOBAL/SHARED/PAGE-SPECIFIC.
3. [COMPONENT_REUSE_MAP](docs/COMPONENT_REUSE_MAP.md) — variants, composition, xung đột và bất thường nguồn.
4. [DATA_MODEL](docs/DATA_MODEL.md) — TypeScript contracts, single source, async repository/query layer.
5. [CLIENT_BOUNDARIES](docs/CLIENT_BOUNDARIES.md) — server defaults, client islands và behavior contracts.
6. [ASSET_MAP](docs/ASSET_MAP.md) — source → public mapping, ownership, duplicates/missing assets.
7. [MIGRATION_PLAN](docs/MIGRATION_PLAN.md) — phases, dependencies và validation gates.
8. [PROPOSED_FOLDER_STRUCTURE](docs/PROPOSED_FOLDER_STRUCTURE.md) — App Router, src/public và colocation.

## Bằng chứng bổ sung

- [SOURCE_INVENTORY](docs/SOURCE_INVENTORY.md), [STYLE_AUDIT](docs/STYLE_AUDIT.md).
- [Từng page và section](docs/evidence/pages.json), [từng URL canonical](docs/evidence/routes.json), [liên kết nguồn](docs/evidence/links.json).
- [Tài nguyên từng file](docs/evidence/assets.csv), [nhóm trùng SHA-256](docs/evidence/asset-duplicates.json), [nguồn và hash](docs/evidence/source-files.csv).
- [FAQ occurrences](docs/evidence/faq-occurrences.json), [crawl failures](docs/evidence/crawl-failures.json), [styles](docs/evidence/styles.json), [scripts](docs/evidence/scripts.json).
- [Kết quả kiểm tra](docs/evidence/verification.json).

147 canonical pages giữ lại, 16 trang Digital Media/Recruitment loại theo yêu cầu; login và aliases ghi riêng. Không bỏ EN, sample-page hay featured_item archive. 62 project detail, 27 bài viết; 1.289 tài nguyên có mapping.

Quyết định 03/10/2026: thương hiệu **Sova** (thay nhận diện Eras), font **system fallback** — chi tiết ở [MIGRATION_PLAN](docs/MIGRATION_PLAN.md#quyết-định-đã-chốt--03102026).

Giới hạn: audit HTML/CSS/JS tĩnh, chưa kiểm chứng browser/pixel parity; PDF và một số runtime chunks thiếu; form/auth không có backend. Tài liệu “Cây component chi tiết từng màn hình” của chủ dự án đã có (snapshot: [screen-component-tree](_bmad-output/initiative-sova-landing-page/spec-public-ui-mock/screen-component-tree.md)), đã đối chiếu với COMPONENT_MAP. Những vấn đề này được ghi cụ thể trong kế hoạch, không âm thầm sửa.

Spec phase A: [spec-public-ui-mock](_bmad-output/initiative-sova-landing-page/spec-public-ui-mock/spec-public-ui-mock.md) — contract chính cho coding. Đọc MOCK_UI_PLAN và ADMIN_CONTENT_MAP trước, rồi MIGRATION_PLAN khi mở phase triển khai. Tất cả code snippets/cây folder trong docs chỉ là đề xuất, không phải source application đã tạo.
