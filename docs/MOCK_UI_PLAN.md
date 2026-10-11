# Kế hoạch coding mockup UI — backend nối sau

Stack và quy tắc dependency đã chọn trong [TECH_STACK](TECH_STACK.md).

## Mục tiêu của phase code kế tiếp

Dựng Next.js public UI giống source với đủ các trang được giữ và interactions thực thi trên **dữ liệu mock cục bộ có kiểu**. Project phải chạy/review được khi không có database, CMS, API keys hay dịch vụ auth. Lượt này chỉ cập nhật planning; chưa scaffold/code giao diện và chưa có dashboard admin.

## Ranh giới công việc

**Làm trong mock UI:** layout VI/EN, assets/styles, route templates, responsive/motion, filter/search/pagination trên mock records, typed content/query layer, trạng thái form và error/empty/loading có thể preview.

**Phase backend riêng sau:** API/database, dashboard editors, CRUD lưu bền, media upload, draft preview được bảo vệ, auth/roles, email/lead delivery, captcha verification, publish/cache invalidation, slug redirect history. Chỉ giữ contracts tối thiểu cần cho UI ngay bây giờ; không xây fake REST server hoặc generic CMS engine để đọc local arrays.

## Data flow bắt buộc

```text
page.tsx (server)
  → lib/queries/getHomePage | getServicePage | listProjects | getPost...
  → ContentRepository (async, read-only cho public UI)
  → MockContentRepository
  → src/data typed records + asset IDs + collection IDs
  → typed props → section/card → client islands khi cần interaction

Sau này: thay repository mock bằng API repository.
Dashboard viết dữ liệu qua backend riêng, website public tiếp tục đọc cùng contracts.
```

Không fetch trong card/presentational components; không import fixture sâu trong JSX. Dữ liệu có thể chỉnh: headings, copy, images, CTAs, pricing rows, FAQ, collection order, SEO. Layout composition, section types, CSS và animation giữ trong code. Không đặt hard-coded business text vào JSX; label UI đơn giản có thể nằm trong locale dictionary, không nhất thiết tạo CMS record.

## Thứ tự code gợi ý

1. **Scaffold + typed mock data:** route/content types, IDs, local assets, services/posts/projects/FAQ/pricing/site settings, selectors và fixture scenarios. Mock source content là dataset chính; không phát minh bài viết để thay 27 records nguồn.
2. **Shell + primitives:** Header/Footer/menu/popup/actions, typography/container/buttons, accordion/tabs/carousel. Cùng dữ liệu navigation/site settings cho mọi consumer.
3. **Home hoàn chỉnh:** một lát cắt kiểm tra UI → query → mock → shared components; sửa data trong mock phải đổi tất cả placements liên quan.
4. **Collections + templates:** project/post detail, listings/categories/filter/search/pagination để chứng minh thêm record không cần thêm page file. Sau đó dùng lại cards/collections tại Home/services.
5. **8 service types + About:** explicit compositions, content records riêng theo loại service; pricing/FAQ/testimonials refs; không làm mega ServicePage.
6. **FAQ/contact/legal/profile/utility + EN:** reuse models với locale; forms mock; không chờ API hoặc auth. Thiếu font/PDF thì đánh dấu asset issue và kiểm tra fallback/error, không chặn các route khác.
7. **Responsive/interaction/visual QA + handoff:** review toàn route registry; ghi rõ vùng thiếu source media và mọi khác biệt so baseline.

Thứ tự này ưu tiên kiểm tra template/data layer sớm. Các phase fidelity chi tiết trong MIGRATION_PLAN vẫn là checklist; backend credentials không là điều kiện pass mock UI.

## Mock interaction contract

| UI | Mock behavior cần có | Nối backend sau |
| --- | --- | --- |
| Project filter/pagination | Query category, reset page khi filter đổi, hiển thị records, loading/empty/error có scenario test | Thay query adapter; không đổi card/page hierarchy |
| Blog/category/search | Tìm kiếm trên published mock title/excerpt/body text, stable sort/page, URL contract hiện có | Search service/query backend; taxonomy cùng IDs |
| FAQ/carousels/menu/popup | Hành vi UI thật theo source, không cần backend | Không thay component chỉ để nối CMS |
| Forms | Validation đúng source; trạng thái idle/submitting/demo-success/demo-error; ghi rõ “Bản demo — chưa gửi thông tin” khi mô phỏng | SubmitAdapter nối endpoint, success thật mới xác nhận đã nhận lead |
| Thank-you | Preview demo bằng query/fixture state được ghi rõ; không giả claim email đã gửi | Điều hướng sau response success thực |
| Login legacy | Render fields/reveal/validation; không login thật, không gửi credentials | Provider/auth flow được thiết kế ở phase backend |
| PDF/media thiếu | Missing/error/loading states có thể review; không tự tạo file thay thế | AssetRef trỏ file thật khi được cung cấp |

Scenario chọn qua test/dev fixture configuration, không thêm debug toolbar vào giao diện khách hàng. Dữ liệu form mock chỉ ở bộ nhớ; không lưu tên/email/credentials vào localStorage. Không gọi WordPress live, không dùng REST nonce/tracking IDs nguồn. Mock form không cần API route hay captcha keys để review.

## Fixture organization tối thiểu

```text
src/data/                  published records lấy từ nguồn + curated ID collections
src/lib/repositories/
  contracts.ts             read interfaces
  mock.ts                  adapter đọc các records trên
  index.ts                 composition root, chọn adapter
src/lib/queries/            tổng hợp page DTO, lookup/filter/search/pagination
src/lib/forms/
  transport.ts             SubmitResult / SubmitAdapter
  mock-transport.ts        deterministic success/error demo, không network
src/dev/scenarios.ts         happy-path, empty, missing-media, error; dev/test only
```

Không random hóa IDs/nội dung/delay; không rải setTimeout ở components. Default mock dataset/render output ổn định để screenshot. Fixture draft/archived và lỗi dùng cho test selectors, không lẫn vào published pages mặc định. Số lượng 62 project/27 bài là baseline, thêm fixture chứng minh extension trong test không đổi route coverage đã audit.

## Tiêu chí nghiệm thu mock UI

- Chạy dev/build không cần backend/env secret. Không route public phụ thuộc admin service.
- Thay một FAQ/pricing/phone record cập nhật mọi consumer tương ứng; không có bản copy cứng.
- Thêm project/post mock hợp lệ → detail + collection queries hoạt động, không thêm file page; reserved root slug được kiểm tra.
- 36 structured pages đọc dữ liệu qua query; đổi hero/media/CTA không sửa JSX.
- 20 listing URLs query collections; source ordering fixture giữ cho baseline, pagination không hard-code thành 20 content pages riêng.
- Form demo success/error phân biệt với submit thật; mock login không cấp quyền.
- Build/typecheck/lint + kiểm tra route/data refs, critical interactions và visual comparisons phù hợp; thiếu source asset được ghi riêng.
- Source `eras-clone` nguyên trạng. Dashboard/backoffice/backend được ghi **chưa làm**, không phải blocker nghiệm thu UI mock.

## Khi bắt đầu tích hợp backend

Implement API adapter và schema validation → import seed records cùng IDs → nối CMS editors theo ADMIN_CONTENT_MAP → draft/public separation + media URLs → slug aliases/reserved paths → publish dependency invalidation → form/auth adapters → kiểm tra visual/regression lại. Khả năng thay adapter giảm phạm vi sửa; đây không phải cam kết “chỉ một dòng code” vì auth, publish và error handling vẫn cần triển khai.
