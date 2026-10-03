# Style migration audit

## Cascade phải giữ khi đạt parity

Nguồn có external plugin CSS → Flatsome main → fl-icons inline → child stylesheet → `style#custom-css` (theme settings và custom CSS) → từng style ID cạnh section; còn `wp-custom-css` và CSS browser-snapshot. Không coi child stylesheet là toàn bộ thiết kế. `index.html:157` có khoảng 45KB custom CSS và block fonts khác; inventory từng block, hash/media/fonts/keyframes ở `evidence/styles.json`.

Trước implementation, trích CSS theo cascade và đánh dấu provenance (file:line, selector). Chuyển global reset/tokens/fonts/layout và style domain theo đợt; giữ geometry, specificity, media rules trước khi cleanup. Không đưa Tailwind preflight vào giữa cascade mà chưa đối chiếu. Không thay 1320px bằng max-w-7xl hay gap tùy chọn.

## Token candidates có bằng chứng

| Thuộc tính | Giá trị nguồn / selector | Xử lý |
| --- | --- | --- |
| Primary | `#0065df`, `--primary-color`, `--fs-color-primary` | Một semantic token, giữ case-independent value |
| Background | `#181818` ở `#wrapper,#main,#main.dark` | Giữ nền tối, không redesign |
| Text | `#fefefe`; nhiều white overrides | Không đồng nhất alpha/colors trước parity |
| Header background | `rgba(10,10,10,.9)` | Giữ transparent/sticky states |
| Secondary/success/alert | `#C05530`, `#627D47`, `#b20000` | Theme declarations, chưa coi tất cả đều active UI tokens |
| Container | 1320px; collapse 1290; small 1312.5; large 1350 | `index:157`; giữ row gutter effects |
| Header | 90px; sticky 70px; phone <=549px 70px; logo width154px | Geometry/overlap với transparent hero |
| Service hero inset | `.banner-service .banner-inner` padding-top170px `!important` | Ghi riêng mobile overrides trước generalize |
| Drawer | 300px theme, override390px custom | Computed value phụ thuộc cascade/viewport; không chọn giá trị đầu tiên |
| Body/header/headings | SF Pro Display `!important` child style164–166 | Lato theme không phải final rendered family. Đích: `--font-body` system stack (đã chốt) |
| Display secondary | Kanit `.kanit-font`; Moul alt font | Đích: `--font-display`/`--font-alt` = fallback (đã chốt); giữ token riêng để đổi sau |
| Radius | Accordion8px; project card10px; CTA100px | Giữ theo domain |
| Shadows | CTA `0 4px 10px rgba(0,101,223,.3)`; hover `0 6px 18px ... .4`; achievement `0 0 10px rgba(255,255,255,.5)` | Không thay mọi shadow bằng một preset |
| Spacing | Many per-ID rules; profile gap80px, service inset170px, theme row gutters | Không có bằng chứng scale 4/8px thống nhất; extract exact rules |

## Responsive contract

Flatsome dùng 550px/850px min breakpoints (mobile <=549px, tablet <=849px). Custom còn 48em, 575px, 768px, 1199px, 1380px và các rule riêng. Marquee font100px ở <=1380, 80px <=1199, 74px <=575 (child CSS301–317). Blog home cards3/2/1; project related4/3/2; website pricing và WhyChooseUs có desktop/mobile branches; Home heading và Website form bị nhân đôi.

Baseline cần các viewport 390, 549, 550, 768, 849, 850, 1280, 1440; thêm 575/1199/1380 khi kiểm tra marquee. Chụp tại cùng zoom/device scale, chờ fonts/media; ghi scroll position, carousel slide, tab/accordion state, reduced-motion. Đây là **tiêu chí tương lai**, không phải đã có screenshots chứng minh.

## Motion contract

- Typewriter CSS: fadeIn .5s; typing2s steps30; stagger0/2.2/4.4s. Render server; tránh text width nhảy khi fonts tải.
- Marquee dùng CSS track; duplicate aria-hidden có thể cần để loop, không xóa duplicate vì tưởng là dữ liệu lặp.
- FeaturedProjects GSAP: pin section, x theo overflow width, scrub, start top top, end overflow distance, hover scale1.05/.25s. Không đổi thành static grid mà không ghi behavior change.
- Carousel settings từng instance trong CLIENT_BOUNDARIES/pages.json; project gallery khác testimonials.
- Counter dùng count-up; cursor ring RAF interpolation .15 và hover size40→60. Media reduced-motion/coarse-pointer phải có kế hoạch và ghi rõ các khác biệt accessibility với source.

## Chưa giải quyết

Font dùng fallback nên typography không parity ngoài macOS/iOS (đã chấp nhận). Missing CSS decorations, unavailable theme chunks và remote PDF khiến không thể tuyên bố full visual parity từ static parse. Giữ anomaly IDs trong kế hoạch; baseline phải tách “source missing” và “migration regression”. Dedupe CSS chỉ sau khi các route giữ lại đã có comparison ở breakpoint và interaction state tương ứng.
