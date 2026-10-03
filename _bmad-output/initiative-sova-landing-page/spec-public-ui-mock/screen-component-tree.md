# Cây component từng màn hình (snapshot)

Snapshot của tài liệu chủ dự án "Cây component chi tiết từng màn hình", lấy từ https://claude.ai/artifact/LCN7iqK4fMEPWKY1KLrUmu ở rev 36 ngày 03/10/2026. Cây đi theo thứ tự section → component con → phần tử, số lượng đếm từ source. Khung chung (header, footer, popup, nút nổi) không lặp lại trong từng cây. Snapshot bỏ hai trang chủ dự án đã đánh dấu xóa là Truyền thông số và Tuyển dụng (kể cả chi tiết tin tuyển dụng). Nếu cây này khác COMPONENT_MAP thì kiểm lại source HTML; phần đối chiếu nằm ở cuối file.

## Trang chủ

```text
Trang chủ
├── Banner video đầu trang
│   ├── Video nền
│   ├── Tiêu đề H1 hiệu ứng đánh máy (3 dòng)
│   └── Nút "Liên hệ"
├── Khối thành tựu
│   └── Bộ đếm số liệu ×4
├── Dịch vụ tại Sova
│   ├── Tiêu đề section
│   └── Danh sách dịch vụ dạng xổ ×6
│       └── Mục dịch vụ: số thứ tự, tên, danh sách dịch vụ con, nút "Xem thêm"
├── Dải chữ chạy ngang
├── Dự án tiêu biểu (cuộn ngang)
│   ├── Tiêu đề section
│   └── Mục dự án ×6: ảnh, tên, mô tả, link chi tiết
├── Đối tác tin cậy
│   ├── Tiêu đề section
│   └── Lưới logo đối tác ×30
├── Khách hàng nhận xét
│   ├── Tiêu đề section
│   └── Slider
│       └── Thẻ nhận xét ×3: ảnh đại diện, tên, nội dung
└── Tin tức mới nhất
    ├── Tiêu đề section + nút "Xem tất cả"
    └── Slider
        └── Thẻ bài viết ×3: ảnh, tiêu đề, link
```

## Giới thiệu

```text
Giới thiệu
├── Banner đầu trang
│   ├── Ảnh nền
│   ├── Tiêu đề H1 hiệu ứng đánh máy (2 dòng)
│   └── Nút "Liên hệ"
├── Thành tựu & Mục tiêu
│   ├── Bộ đếm số liệu ×4
│   └── Lưới mục tiêu
│       └── Thẻ icon ×6: icon, tiêu đề, mô tả
├── Các sản phẩm của Sova
│   ├── Ảnh minh hoạ
│   └── Khối nội dung ×4: Mục tiêu, Cam kết, Sứ mệnh, Tầm nhìn
├── Hình thành và phát triển
│   ├── Tiêu đề section
│   └── Dòng thời gian ×9 mốc (2016 → nay): năm, tiêu đề, mô tả, ảnh
├── Có thể tìm thấy tại Sova
│   ├── Dải chữ chạy ngang
│   └── 3 trụ cột: Xây dựng chiến lược, Thiết kế trải nghiệm, Phát triển sản phẩm
│       └── Thẻ icon[] mỗi trụ cột (27 thẻ)
└── Khách hàng nhận xét (giống Trang chủ)
```

## Dịch vụ (8 trang, 1 khung chung)

```text
Trang dịch vụ
├── Banner dịch vụ
│   ├── Tiêu đề H1 (2 dòng)
│   └── Ảnh minh hoạ (2–3 ảnh)
├── Lợi ích (website, app, SEO, UI/UX)
│   ├── Tiêu đề H2
│   └── Banner video
│       └── Thẻ icon ×4: icon, tiêu đề, mô tả
├── [Phần riêng của từng dịch vụ — xem dưới]
├── Dự án tiêu biểu (giống Trang chủ, không có ở E-mail/Hosting/VPS)
├── Khách hàng nhận xét (giống Trang chủ)
└── Những câu hỏi thường gặp
    ├── Tiêu đề H2
    └── Mục hỏi đáp xổ xuống ×4–10: câu hỏi, câu trả lời
```

Phần riêng của từng dịch vụ:

```text
Thiết kế website                        (FAQ ×8)
├── Bảng giá dạng thẻ
│   └── Thẻ gói ×3: Cơ bản / Nâng cao / Chuyên nghiệp
│       ├── Nhãn giảm giá 50% / 45% / 35%
│       ├── Danh sách tính năng
│       └── Nút đăng ký
├── Banner form liên hệ
│   └── Form: họ tên, SĐT, lĩnh vực, nội dung, reCAPTCHA, nút gọi hotline
└── Tại sao chọn Sova (nguồn: "Eras")
    └── 3 cột: Lợi ích / Cam kết / Sản phẩm nhận được

Thiết kế App mobile                     (FAQ ×8)
└── Tại sao chọn Sova (giống trang website)

SEO từ khoá website                     (FAQ ×8)
├── Lợi thế
│   └── Thẻ icon ×4
└── Lưới thẻ dịch vụ SEO
    └── Nhóm ×4: SEO Onpage / SEO Offpage / Chăm sóc website / Content writer
        └── Danh sách tính năng dạng thẻ icon

UI/UX, Branding Design                  (FAQ ×10)
└── Lưới thẻ dịch vụ thiết kế
    └── Nhóm[]: logo thương hiệu, …
        └── Danh sách tính năng dạng thẻ icon

Giải pháp lưu trữ                       (FAQ ×4, đang copy nhầm của SEO — A13; không có Lợi ích)
└── Lưới thẻ dịch vụ lưu trữ
    └── Nhóm[]: Hosting / VPS / …
        ├── Danh sách tính năng
        └── Nút xem chi tiết

E-mail doanh nghiệp                     (FAQ ×9; không có Lợi ích, không có Dự án)
├── Bảng giá dạng table
│   └── Gói[] kèm "Tùy chọn nâng cấp"
└── Lưới tính năng: Thẻ icon ×6

Hosting doanh nghiệp                    (FAQ ×10; như E-mail)
├── Bảng giá dạng table
│   └── 5 gói A–E: CPU, RAM, dung lượng, SSL, backup, giá/tháng, nút đăng ký
└── Lưới tính năng: Thẻ icon ×6

VPS doanh nghiệp                        (FAQ ×10; như Hosting)
├── Bảng giá dạng table
└── Lưới tính năng: Thẻ icon ×6
```

## Dự án

```text
Dự án
├── Banner đầu trang (chia 2 cột)
│   ├── Tiêu đề H1 hiệu ứng đánh máy "Dự án đồng hành cùng Sova" (nguồn: "Eras")
│   ├── Đoạn mô tả + nút "Liên hệ"
│   └── Ảnh minh hoạ
└── Danh mục dự án
    ├── Bộ lọc ×4: Tất cả / Branding / Mobile App / Website
    └── Lưới dự án (2–4 cột), 6 dự án mỗi trang (quyết định 03/10/2026)
        └── Thẻ dự án ×62: ảnh, tên, danh mục, link chi tiết
```

## Chi tiết dự án

```text
Chi tiết dự án
├── Banner đầu trang
│   ├── Ảnh nền
│   └── Tiêu đề H1 = tên dự án
├── Slider ảnh dự án (ảnh chụp giao diện)
├── Nội dung (2 cột)
│   ├── Cột trái (9/12)
│   │   ├── Tiêu đề dự án
│   │   ├── Nội dung mô tả (HTML từ WordPress)
│   │   └── Thông tin chi tiết: hình thức thanh toán, thời gian thực hiện,
│   │       thời gian bảo hành, bàn giao website (giống nhau ở mọi dự án)
│   └── Cột phải (3/12)
│       └── Thông tin dự án: ngày, danh mục
└── Dự án liên quan
    ├── Tiêu đề H4
    └── Lưới 4 cột: Thẻ dự án[] (dùng lại thẻ ở trang Dự án)
```

## Góc nhìn (blog) và danh mục

```text
Góc nhìn
├── Tiêu đề trang (nền tối): H1 "Góc nhìn"
└── Bố cục 2 cột
    ├── Cột trái (8/12)
    │   ├── Tiêu đề danh mục H2 (chỉ ở trang danh mục)
    │   ├── Thẻ bài viết dạng dòng ×6 mỗi trang: ảnh, tiêu đề (h5), đoạn trích, nút "Xem thêm"
    │   └── Phân trang: số trang, dấu "…", nút trang sau
    └── Cột phải (4/12) — thanh bên
        ├── Ô tìm kiếm (input + nút)
        └── Danh sách danh mục ×6 (tên + số bài)
```

## Chi tiết bài viết

```text
Chi tiết bài viết
├── Tiêu đề trang (nền tối): H1 = tiêu đề bài
├── Ảnh đại diện
├── Thông tin bài: tác giả, ngày đăng
├── Nội dung bài (HTML từ WordPress): H2/H3, đoạn văn, ảnh, bảng
└── Bài viết liên quan
    ├── Tiêu đề H3
    └── Lưới 3 cột: Thẻ bài viết dạng lưới ×3 (ảnh, tiêu đề)
```

Không có thanh bên, không có breadcrumb (khác trang danh sách).

## Liên hệ

```text
Liên hệ
├── Tiêu đề trang: H1 "Liên hệ" + ảnh
└── Khối liên hệ
    ├── Thông tin công ty: tên công ty H2 + thẻ icon ×3 (địa chỉ, hotline, email)
    ├── Form liên hệ: họ tên, email, chọn dịch vụ, SĐT, nội dung, reCAPTCHA, nút gửi
    └── Bản đồ Google Maps (iframe)
```

## Hỏi đáp và pháp lý ×6

```text
Hỏi đáp
├── Banner tiêu đề: H2 "Câu hỏi thường gặp"
└── Tab chủ đề ×7: Website / App / SEO / UI-UX / E-mail / Hosting / VPS
    └── Mục hỏi đáp xổ xuống (tổng 65 câu, trùng FAQ của từng trang dịch vụ)

Trang pháp lý (điều khoản, bảo mật, hoàn tiền, bảo hành, thanh toán, hồ sơ năng lực)
├── Banner tiêu đề: H2
└── Nội dung văn bản
```

FAQ ở trang Hỏi đáp và ở trang dịch vụ là cùng một bộ câu hỏi: lưu một chỗ, gắn theo dịch vụ, hai nơi cùng đọc.

## Gộp UI gần giống nhau

- PageHero: variant service, split-cta, simple. Không làm variant background, vì chỉ trang đã xóa dùng đến.
- PostCard: 3 variant list, grid, slider.
- Testimonials: chỉ làm variant default. Variant social chỉ phục vụ Truyền thông số, trang đã xóa.
- Pricing: tách thành 2 component là PricingCards và PricingTable.

## Đối chiếu với docs/

- **Khung dịch vụ chung:** dựng thành composition tường minh cho từng page, mỗi page dùng lại các section chung theo thứ tự khung. Không dùng ServicePage có cờ bật/tắt (A03).
- **About, mục "Có thể tìm thấy tại Sova":** cây này không có logo đối tác, còn COMPONENT_MAP có PartnerLogos. Kiểm lại source HTML trước khi dựng.
- **Hồ sơ năng lực:** cây xếp vào nhóm pháp lý (banner + văn bản). Flipbook để plan sau, nằm ngoài spec này.
