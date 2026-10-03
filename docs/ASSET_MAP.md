# Asset map

## Số liệu và cách kiểm kê

Quét tất cả asset trong `wp-content/`, `wp-includes/` và thư mục Save Page `_files/`: **1289 files**, 182.6 MiB. Phân loại theo extension, content references và SHA-256. Không tính bản sao `dist/` là asset độc lập; không xóa hay đổi tên file nào.

- [assets.csv](evidence/assets.csv): **mỗi file một dòng**, source → candidate public destination, bytes/hash, families, tất cả reference sources.
- [asset-duplicates.json](evidence/asset-duplicates.json): 69 nhóm **trùng byte**; không chỉ giống filename.
- [source-files.csv](evidence/source-files.csv): toàn bộ source/tooling/dist/crawl files với hash để kiểm tra không sửa nguồn.
- [crawl-failures.json](evidence/crawl-failures.json): tài nguyên/trang không tải được theo report nguồn.

Reference extractor kiểm tra src/srcset/data-src/poster/href, CSS url, URL literal trong HTML/CSS/JS. **87 files chưa thấy reference trực tiếp** được đánh dấu `unproven-use`, không khẳng định unused: runtime URLs, escaped JS, font CSS từ xa và plugin lazy chunks có thể chưa resolve. Family ownership là quan sát từ trang tham chiếu, không thay thế semantic review. Các file được cùng CSS dùng toàn site giữ global ownership dù references đi qua stylesheet.

## Quy tắc destination

Giữ `public/wp-content/uploads/<year>/<month>/<filename>` trong đợt parity đầu tiên. Không phân phát lại ảnh theo tên tự đặt trong `public/home`, `public/services` vì phá URL/content links và tạo duplicate cho ảnh dùng chung. Ownership theo domain nằm trong `AssetRef`/manifest, physical URL được giữ. `__q_<hash>` trong tên mirror là filename thật, không tự bỏ suffix.

Candidate destination trong CSV là đường dẫn an toàn khi cần giữ nguyên asset; **không có nghĩa phải copy toàn bộ JS/theme/plugin vào runtime**. Files bị loại hoặc legacy JS chỉ được archive/reference trong docs; allowlist thực tế quyết định từ consumers ở phase 1. Chưa tạo `public/` ở giai đoạn planning.

| Ownership | Nguồn đã thấy | Đích dự kiến / cách dùng |
| --- | --- | --- |
| Global logo | `wp-content/uploads/2025/08/logo-eras-White-1.svg`, các dark/light variations | **Không dùng** (thương hiệu Sova). Wordmark "Sova" tạm, AssetRef `missing` đến khi có logo Sova; xem MIGRATION_PLAN “Quyết định đã chốt” |
| Global floating contacts | `wp-content/uploads/2025/04/{call-111,messenger-111,zalo-111,mail-111}.webp`, bản PNG 2026/09 | Giữ source paths, placement theo desktop/mobile/theme đúng nguồn |
| Global navigation | `wp-content/uploads/2026/09/menu-bar-1.png`, `contact-1.png` | Cùng paths; mobile bar/menu |
| Global/theme typography | `wp-content/fonts/fz-poppins/FZ-Poppins-*.ttf` (9 weights), `themes/flatsome/.../fl-icons__q_*.woff2/.woff/.ttf/.eot/.svg` | fl-icons giữ paths; FZ-Poppins không dùng. Typography dùng system fallback |
| Home | `wp-content/uploads/2025/04/video-banner-2.mp4` | Giữ path; muted/loop/playsInline; poster và responsive crop đối chiếu HTML |
| Home/About partners | `logo-*.png`/webp nhiều tháng | Không copy từng logo cho mỗi page; Partner records trỏ một AssetRef |
| About | ảnh mission/capabilities/timeline từ `gioi-thieu/index.html` / EN tương ứng | CSV lọc families about; giữ từng image/crop/alt, không chọn ảnh minh họa mới |
| Services | illustrations, benefits media, tables decoration theo các service HTML | CSV families services; pricing content là data, không rasterize bảng |
| Testimonials dùng chung | `feedback-dong-a-400x400.webp`, `feedback-ten-400x400.webp`, `feedback-vinatex-400x400.webp` | Cùng public source path, avatar refs theo record |
| Projects | featured_item gallery/thumbs, cả 280/400/768/800/1536 size variants | Giữ source paths; originals và resized variants không phải duplicate byte mặc định |
| Blog | article images, covers, infographic, inline media | CSV post-detail/blog families; rewrite rich-content URLs tại adapter |
| Profile VI/EN | remote `wp-content/uploads/2025/05/Porfolio-Eras-Vietnam-VI.pdf`, `...-EN.pdf` | **Không có PDF local**; planned same public path sau khi có file hợp lệ; AssetRef remote/missing cho hiện tại |
| Service video khác | `cybervpn.mp4`, `nocode.mp4`, `SaveInsta.to_*.mp4` trong 2025/05 | Giữ tên gốc dài; consumers từ CSV/HTML, không tự đổi codec |
| Excluded Digital Media | `wp-content/uploads/2026/09/video-giai-phap-truyen-thong.webm` và social-only art | Không cần bundle nếu không consumer giữ lại; vẫn giữ nguyên nguồn |
| Browser Save Page assets | `Trang chủ - …_files/*` | Chỉ recovery candidates/reference; ưu tiên canonical wp-content asset có hash tương ứng; không nhân đôi snapshot directory trong app |
| Legacy CSS | Flatsome, child, plugin styles | Port CSS được dùng sang `src/styles/legacy/`/CSS modules với provenance; font/icon URLs giữ public paths |
| Legacy JS / trackers | theme/plugins/wp-includes, downloaded analytics | Inventory-only khi behavior được port. Không copy nguyên WP runtime để init trên DOM React |

## Fonts và dependency bị thiếu

Theme config khai báo Lato/Moul nhưng child stylesheet dòng 164–170 override body/header/headings thành **SF Pro Display** với `!important`, Kanit cho `.kanit-font`. Font CSS external gồm Google Kanit/Moul và CDNFonts SF Pro Display. File Save Page `sf-pro-display`, `css`, `css2` là stylesheet không extension, **không phải font binary**.

Có fl-icons local và 9 FZ-Poppins TTF; chưa có SF Pro/Kanit/Moul/Lato binaries đầy đủ theo references đang chạy. Report ghi 8 font URLs lỗi path server `/home/hosting1/...`. **Đã chốt 03/10/2026:** không self-host; dùng system font fallback cho SF Pro/Kanit/Moul. Stack và tiêu chí QA trong MIGRATION_PLAN “Quyết định đã chốt”. Không thay bằng Inter/Poppins.

Flatsome preload trỏ `chunk.slider.js`, `chunk.popups.js`, `chunk.tooltips.js` từ site thật; các chunk không có trong inventory local. GSAP/ScrollTrigger đang qua CDN (bản Save Page có bản tải cũ); dependency installed sau này cần chọn theo parity, không copy tracking scripts.

## Duplication / unused policy

Hash groups thường liên quan Save Page và wp-content, hoặc resize/content giống byte. Chọn một canonical AssetRef nhưng không xóa file nguồn. Các ảnh có kích thước khác nhau giữ variants cho srcset; cùng basename khác content không được dedupe. Asset chỉ được xác nhận unused khi không có references trực tiếp **và gián tiếp**, không nằm trong data collection, không được lazy runtime gọi, và đã qua route-wide QA. Hiện chỉ đánh dấu candidates trong CSV.

## Missing/broken mapping

Report nguồn có 5 lỗi URL (4 trang + 1 video), 25 asset errors (19 HTTP 404 + 6 robots blocked), 3 skipped URLs. Đây là trạng thái lần crawl, chưa kiểm tra lại live hôm nay. Ngoài report, PDF refs nằm trong escaped inline JS và không được mirror. Những missing decorations như `Deco-1-1.svg`, `Vector.svg`, logo child-theme path và `2Ug0Fxodeb.mp4` phải giữ trong anomaly log; không tạo placeholder mới rồi gọi là fidelity.

## Validation khi copy

So sánh byte hash source/destination cho ảnh/font/video giữ nguyên; validate tất cả src/srcset/CSS url với local server; check alt, aspect ratio, video playback và reduced-motion behavior; capture missing remote assets thành danh sách riêng. Không đem `dist/`, reports, `.netlify`, source HTML hoặc tracking IDs vào `public/` mặc định.
