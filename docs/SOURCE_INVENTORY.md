# Source inventory và giới hạn kiểm chứng

Audit ngày 03/10/2026, source read-only `/Users/quan/HocTap/Vibecode/eras-clone`.

## Coverage

- 2856 files ngoài `.git` đã fingerprint trước công việc; bảng `evidence/source-files.csv` gồm cả `dist`, tooling, reports.
- 169 HTML mirror: 163 canonical index pages, 5 redirect snapshots, 1 login query snapshot. Thêm 1 HTML Save Page của browser ở root là reference phụ.
- Canonical pages: 62 project detail, 27 blog detail, 16 service locale pages, 16 excluded, 14 blog listing/category/pagination pages; các page còn lại trong ROUTE_MAP.
- 1289 assets local, 22 `.css`, 41 `.js`, 5 video files; các stylesheet/script không extension trong browser snapshot được inventory riêng.
- 2 ngôn ngữ, 8 service types sau loại trừ; 3 taxonomy dự án; 6 blog categories.

## Công cụ và nguồn chứng cứ

`audit-source.py` kèm theo trong evidence dùng Python stdlib HTMLParser, không cài dependency vào source. Quét toàn bộ HTML, lấy headings/sections/forms/sliders/media/class markers; quét CSS/JS URL references và hash asset. `pages.json` không phải DOM spec tuyệt đối: HTMLParser không thực hiện browser tree repair, không tính computed styles, visibility hoặc network. Dòng source và raw HTML luôn là thẩm quyền khi malformed markup.

Không khởi chạy website live, không submit form, không đo pixel parity ở phase này. Những dữ kiện behavior là từ source JS/options; runtime baseline và responsive screenshots là deliverable phase 0/1 của triển khai. Các 404 là từ crawl report, không được trình bày là lỗi live mới xác minh.

## CSS/JS local inventory

| Type | Source | Reference sources |
| --- | --- | --- |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/ScrollTrigger.min.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/all.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/codedropz-uploader-min.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/contactus.min.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/contactus.min.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/dflip.min.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/dflip.min.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/dnd-upload-cf7.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/events.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/fbevents.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/flatsome-live-search.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/flatsome.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/flatsome.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/generated-desktop.css | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/gsap.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/hooks.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/hoverIntent.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/i18n.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/index(1).js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/index.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/jquery.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/maskedinput.min.js | 0 |
| .js | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/scripts.js | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/style.css | 0 |
| .css | Trang chủ - Công ty thiết kế website chuyên nghiệp _ Eras Việt Nam_files/styles.css | 0 |
| .css | wp-content/mu-plugins/include/css/login-eras.css | 1 |
| .css | wp-content/plugins/3d-flipbook-dflip-lite/assets/css/dflip.min__q_b5c1416d9d1f.css | 168 |
| .js | wp-content/plugins/3d-flipbook-dflip-lite/assets/js/dflip.min__q_b5c1416d9d1f.js | 168 |
| .css | wp-content/plugins/ar-contactus/res/css/contactus.min__q_15752bfc04a6.css | 168 |
| .css | wp-content/plugins/ar-contactus/res/css/generated-desktop__q_593a7b90e94f.css | 168 |
| .js | wp-content/plugins/ar-contactus/res/js/contactus.min__q_15752bfc04a6.js | 168 |
| .js | wp-content/plugins/ar-contactus/res/js/maskedinput.min__q_690dca739029.js | 168 |
| .js | wp-content/plugins/ar-contactus/res/js/scripts__q_15752bfc04a6.js | 168 |
| .css | wp-content/plugins/cf7-google-sheets-connector/assets/css/gs-connector-frontend__q_5fde45a30922.css | 6 |
| .css | wp-content/plugins/contact-form-7/includes/css/styles__q_b8a5f5bb6ce3.css | 168 |
| .js | wp-content/plugins/contact-form-7/includes/js/index__q_b8a5f5bb6ce3.js | 168 |
| .js | wp-content/plugins/contact-form-7/includes/swv/js/index__q_b8a5f5bb6ce3.js | 168 |
| .css | wp-content/plugins/drag-and-drop-multiple-file-upload-contact-form-7/assets/css/dnd-upload-cf7__q_bde1fb0d66c8.css | 168 |
| .js | wp-content/plugins/drag-and-drop-multiple-file-upload-contact-form-7/assets/js/codedropz-uploader-min__q_bde1fb0d66c8.js | 168 |
| .css | wp-content/themes/flatsome/assets/css/flatsome__q_1e786b5fffc6.css | 168 |
| .js | wp-content/themes/flatsome/assets/js/extensions/flatsome-live-search__q_1e786b5fffc6.js | 168 |
| .js | wp-content/themes/flatsome/assets/js/flatsome__q_bc0eacc75591.js | 168 |
| .js | wp-content/themes/flatsome/assets/libs/isotope.pkgd.min__q_1e786b5fffc6.js | 1 |
| .css | wp-content/themes/flatsome-child/style__q_bc593aceec73.css | 168 |
| .css | wp-includes/css/buttons.min__q_e3dfde8c2bed.css | 1 |
| .css | wp-includes/css/dashicons.min__q_e3dfde8c2bed.css | 1 |
| .css | wp-includes/css/dist/base-styles/admin-schemes.min__q_e3dfde8c2bed.css | 1 |
| .js | wp-includes/js/clipboard.min__q_5cccf263886e.js | 1 |
| .js | wp-includes/js/dist/a11y.min__q_08ebab12904b.js | 1 |
| .js | wp-includes/js/dist/dom-ready.min__q_5c6c8647906e.js | 1 |
| .js | wp-includes/js/dist/hooks.min__q_c83485c8df7f.js | 169 |
| .js | wp-includes/js/dist/i18n.min__q_210c0f36754b.js | 169 |
| .js | wp-includes/js/hoverIntent.min__q_b0d77473ad7e.js | 168 |
| .js | wp-includes/js/jquery/jquery.min__q_00eb8052eee1.js | 169 |
| .js | wp-includes/js/mediaelement/mediaelement-and-player.min__q_b0c71c5ad622.js | 2 |
| .js | wp-includes/js/mediaelement/mediaelement-migrate.min__q_e3dfde8c2bed.js | 2 |
| .css | wp-includes/js/mediaelement/mediaelementplayer-legacy.min__q_b0c71c5ad622.css | 2 |
| .js | wp-includes/js/mediaelement/renderers/vimeo.min__q_b0c71c5ad622.js | 2 |
| .css | wp-includes/js/mediaelement/wp-mediaelement.min__q_e3dfde8c2bed.css | 2 |
| .js | wp-includes/js/mediaelement/wp-mediaelement.min__q_e3dfde8c2bed.js | 2 |
| .js | wp-includes/js/underscore.min__q_36448a51b1d9.js | 1 |
| .js | wp-includes/js/wp-util.min__q_e3dfde8c2bed.js | 1 |
| .js | wp-includes/js/zxcvbn-async.min__q_b110dfd444ee.js | 1 |

## Libraries / integrations

| Nguồn | Dấu hiệu sử dụng | Kế hoạch |
| --- | --- | --- |
| WordPress + Flatsome/UX Builder | Body classes, rows/cols, generated ID styles, flatsome runtime | Cấu trúc tham chiếu; không phụ thuộc WP DOM trong components mới |
| jQuery/hoverIntent | Accordion, menu, AJAX handlers | Port event/state vào client islands |
| Flickity (theme lazy chunk) | `.slider`, `data-flickity-options` | Carousel adapter; preserve options từng instance |
| MagnificPopup (theme lazy chunk) | mobile offcanvas, popup close | Dialog/menu adapter giữ interactions |
| Isotope | portfolio grid/theme library | Xác minh layout sorting/filter parity trước quyết định CSS grid thay thế |
| GSAP 3.12.2 + ScrollTrigger | pinned horizontal FeaturedProjects + hover | Scope effect/ref/cleanup; không import toàn page vào client |
| Contact Form 7 + SWV | field validation, REST submit, mailsent redirect | Forms + transport interface; không có backend trong mirror |
| CF7 Google Sheets connector | stylesheet/plugin marker | Data sink chưa có cấu hình/contract để migrate |
| CF7 drag/drop uploader | enqueue toàn site; form upload chủ yếu jobs bị loại | Không dựng upload UI ngoài phạm vi giữ lại |
| ar-contactus + maskedinput | multi-channel floating menu, prompts, cookies | Port menu/links/phone behavior theo config |
| DFlip Lite | VI/EN profile PDF reader | Browser-only adapter, thiếu PDF binary |
| MediaElement/Vimeo | blog inline media dependencies | Đối chiếu từng article media trước thay native playback |
| Font Awesome 5.8.1 + fl-icons | icon CSS/fonts | Giữ glyph/size khi parity; không đổi icon tùy ý |
| GA/Google Ads, Meta Pixel, TikTok | remote scripts/inline tracking | Ghi inventory, preview không phát analytics của nguồn |
| Google Maps / reCAPTCHA | Contact iframe / full forms | Integration configs riêng, preserve UI failure/loading |

## Form inventory

Global Consult CF7 f11: phone required; Contact f6819: name/email/service/phone/message required + reCAPTCHA; Website f6818: name/business required, phone/message không có required ở HTML. Website có 2 form instances theo responsive. Login snapshot: username/password/remember/password visibility; nghiệp vụ leave request redirect chưa có page nội dung. Chi tiết fields/aria-required/actions theo từng page có ở `pages.json`. Không coi hidden honeypot/WP nonce là domain fields.

## Internal links / runtime

Mỗi anchor gồm source, line, label, raw URL, resolved local path trong `links.json`. Link `/social-marketing` vẫn giữ, Digital Media/Recruitment link phải bị loại ở target. External themes.erasvietnam.vn, Messenger/Zalo, mailto/tel giữ loại link riêng, không suy ra route nội bộ.

`serve.py`: rewrites absolute site URLs, missing paths redirect ra live; aliases `/en/`; POST portfolio trả toàn bộ cards, POST khác 501. `build.py`: tạo dist với base `/eras-clone/`, noindex và portfolio JSON. Không chạy build.py trong audit vì nó xóa/tạo lại dist. Next target không tự thừa kế basePath hoặc GitHub Pages export mode khi hosting chưa chốt.

## Bảo toàn nguồn

`.gitignore`, `.omc/`, `docs/` đã có trạng thái modified/untracked trước audit; không sửa hoặc dọn chúng. Hash verification sau khi hoàn thành được lưu `evidence/verification.json`. Các tài liệu mới chỉ ở thư mục sibling sova-landing-page.
