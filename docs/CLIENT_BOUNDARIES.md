# Server / client boundaries

Page, layout và content-query chạy server mặc định; chỉ state/event/DOM islands cần `"use client"`. Client wrapper có thể nhận JSX server qua children; client controller import presentation nhỏ thì subtree đó vào client bundle, không được gọi nhầm là vẫn RSC. [Next.js Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components).

## Mock UI trước, backend sau

Nội dung sửa qua admin không làm thay đổi server/client boundary. Query mock đọc trên server; filters/forms/carousels là islands hiện có. CRUD dashboard/auth/upload chưa thuộc public UI scope. Form demo cho phép mô phỏng success/error và xem thank-you với nhãn demo; không gọi live endpoints. Xem [MOCK_UI_PLAN](MOCK_UI_PLAN.md).

## Server components

- Mọi `page.tsx`, layout wrapper, SiteShell, Header/Footer markup, nav link data, LanguageSwitcher (link counterpart có sẵn).
- PageHero, PageHeading, SectionHeading, ServiceBenefits, pricing markup, rich text, ProjectCard/PostCard/TestimonialCard/PartnerLogo khi render từ server.
- HomeHero video dùng thuộc tính native `muted autoPlay loop playsInline`, ContactMap iframe dùng HTML; không cần React state cho bản hiện tại.
- TypewriterHeading: CSS `typing 2s steps(30,end)` + `fadeIn .5s`; delay 0/2.2/4.4s theo `index.html:157`. Không cần client timer.
- Marquee: CSS keyframes tại child stylesheet, không client nếu không có interaction thực.
- BlogPagination, category links và SearchForm native GET không tự cần client; kết quả search/query xử lý server.
- Legal, article, project body/table/content metadata; data models/adapters server-only.

## Client island matrix

| Island | Consumers | Vì sao / bằng chứng nguồn | Contract và kiểm chứng |
| --- | --- | --- | --- |
| HeaderMotion | shell | sticky shrink khi scroll: 90 → 70px | Observer/state ở header nhỏ; unmount cleanup; mobile 70px |
| MobileMenu | shell | offcanvas + nested `.toggle-submenu` (`index:3598`) | open/close, Escape, overlay, focus return, scroll lock; submenu không nuốt link |
| ConsultPopup/Dialog | shell | popup CF7 + `.eras-popup-close`, MagnificPopup (`index:4076`) | Trigger/close/focus; chỉ wrapper client, headings/layout server |
| FloatingContactActions | shell | ar-contactus init, menu/prompt/cookies (`index:3744`) | Hotline/Messenger/Zalo/mail, open/close; không chỉ giữ phone và Zalo |
| CustomCursor | shell | pointer move + RAF ring lerp .15 (`index:578`) | Pointer events, hover 40→60px, cancel RAF/listeners; coarse-pointer/reduced-motion behavior ghi rõ trong QA |
| Carousel | testimonials/goals/posts/pricing/mobile panels/project gallery/related | Flickity `data-flickity-options` | Config riêng từng instance; prev/next/dots/swipe; pause hover; widths/loop/autoplay đúng source |
| HorizontalProjects | FeaturedProjects | GSAP+ScrollTrigger pin/scrub (`index:1530`) | Scoped ref, calculate scroll width on resize/font/image load, pin release, hover scale 1.05/.25s; cleanup route navigation |
| AccordionItem / ServicesAccordion | FAQ + home service list | Expansion và active state; Home custom handler 1309 | Khác state model home/FAQ; question button, aria-expanded, panel ID ổn định; kiểm tra initial open |
| FAQTopics | FAQ VI/EN | `.tabbed-content`, 7 topic panels | Active tab, keyboard/aria; answers lấy cùng FAQ IDs |
| StatCounter | Home/About | `.count-up` x4 | Intersection-trigger, format suffix/locale, stable server fallback value; prevent repeated animation after navigation |
| ProjectBrowser | listing/archive/category/EN | `load_portfolio_items`, term/paged, scroll-to-wrapper (`du-an`) | SSR initial items; filter/page state, loading/error/empty; scroll offset 100, duration 500ms theo source |
| ContactForm | contact VI/EN | validation + CF7/reCAPTCHA, submit status | Required name/email/service/phone/message; demo-success có nhãn rõ chưa gửi; failure giữ input |
| WebsiteContactForm | website VI/EN | CF7 f6818 desktop/mobile | Required name/business; phone HTML không required, message optional. Không tự siết required phone |
| ConsultForm | popup | CF7 f11 phone-only | Required phone; native input/tel + submit adapter |
| CaptchaAdapter | hai full forms nếu còn dùng reCAPTCHA | external callback/browser widget | Dev mock không gọi live endpoint; production credentials/backend tách config |
| FlipbookViewer (plan sau, ngoài phase A) | profile VI/EN | DFlip canvas/WebGL/PDF | Lazy load island; PDF missing/error/loading; source `controlsPosition:hide`, `enableDownload:false` không bị global defaults ghi đè |
| LoginPanel | utility login | password reveal, remember, auth status | UI prototype + auth contract; credentials không gửi từ planning/mock |

Không tạo Client Component cho một danh sách tĩnh chỉ vì nguồn dùng jQuery. Không mang toàn bộ Flatsome/CF7/ar-contactus runtime vào React page để “giữ tương tác”; port hành vi đã kiểm kê thành islands, có adapter riêng khi library cần DOM.

## Cấu hình slider đã quan sát

| Instance | Source | Settings chính |
| --- | --- | --- |
| Testimonials | `index.html:2203`, `thiet-ke-website:6526` | center, loop, autoplay 6000ms, hover pause, arrows+dots, adaptiveHeight, dragThreshold 10, attraction .1, friction .6 |
| Home posts | `index.html:2688` | left, loop, autoplay false, arrows+dots, groupCells false, columns 3/2/1 |
| About goals | `gioi-thieu:1674` | left, autoplay 6000, loop, adaptiveHeight, arrows+dots |
| About capabilities | `gioi-thieu:2986` | center, autoplay 6000, loop |
| Website pricing / WhyUs mobile | `thiet-ke-website:2655/5372` | center, autoplay 6000, loop, arrows+dots |
| THP gallery | `featured_item/...thp/index.html:744` | center, loop, autoplay 3000, arrows+dots |
| THP related | cùng file:800 | left, groupCells 100%, loop, no autoplay, no dots, dragThreshold 5; columns 4/3/2 |

Tất cả instance khác được lưu trong `evidence/pages.json`; không dùng một default autoplay toàn site. Trạng thái source ban đầu gồm class/options, chưa chứng minh behavior trong trình duyệt vì thiếu remote chunks; phase baseline phải chụp và ghi rõ network failures.

## Submission / backend limits

`serve.py` trả 501 cho POST ngoài portfolio AJAX. CF7 thật gọi REST WordPress, site có Google Sheets connector và reCAPTCHA; không có backend tương đương trong repo. Không tự đưa webhook/nonce/public production IDs sang đích. Giữ fields, required flags, loading/error và contract success; gắn transport thật ở phase B sau mock UI. Trang cảm ơn có route và demo preview từ đầu; chỉ live-success xác nhận đã gửi thông tin thật. Không cần captcha/API credentials để nghiệm thu form mock.

Analytics GA/Ads/Meta/TikTok là integrations, không phải UI dependencies; inventory giữ URL/ID nguồn trong source, môi trường preview không tự chạy tracking của website gốc. Decision kích hoạt lại nằm phase release configuration.
