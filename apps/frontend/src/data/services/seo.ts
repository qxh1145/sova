// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_SERVICES=1.
import type { Service } from '@/types/content';

export const seoServices: Service[] = [
  {
    id: 'service-seo-vi',
    locale: 'vi',
    path: '/seo-tu-khoa-website/',
    title: 'SEO từ khoá website',
    translationKey: 'service-seo',
    sources: [{ file: 'seo-tu-khoa-website/index.html', line: 676, sourceId: '7226' }],
    key: 'seo',
    summary:
      'Sova coi mỗi dự án SEO là dịp tạo thêm giá trị thực cho doanh nghiệp, đồng thời là bước khởi đầu để hai bên trở thành bạn đồng hành, cùng nhân lên thành quả qua các sản phẩm số được trau chuốt kỹ lưỡng.',
    homeSummary:
      'Dịch vụ SEO tổng thể cho Website do Sova thực hiện bài bản, đáng tin cậy và có cam kết thứ hạng từ khóa khi chiến dịch Marketing kết thúc',
    subServices: [],
    arrowHref: '/seo-tu-khoa-website/',
    hero: {
      headingLines: ['Dịch vụ SEO TOP', 'từ khoá website'],
      description: {
        format: 'sanitized-html',
        html: '<p>Sova coi mỗi dự án SEO là dịp tạo thêm giá trị thực cho doanh nghiệp, đồng thời là bước khởi đầu để hai bên trở thành bạn đồng hành, cùng nhân lên thành quả qua các sản phẩm số được trau chuốt kỹ lưỡng.</p>',
        assetIds: [],
        sources: [{ file: 'seo-tu-khoa-website/index.html', line: 702 }],
      },
      imageId: 'asset-617f9283d2',
      bgImageId: 'asset-358b4a1d92',
      breadcrumb: [
        { label: 'Trang chủ', href: '/' },
        { label: 'Dịch vụ' },
        { label: 'Seo từ khoá Website' },
      ],
      cta: { label: 'Kết nối ngay', href: '/seo-tu-khoa-website/' },
      ctaIconId: 'asset-d17ec3ffd1',
    },
    advantagesPhotoId: 'asset-82cc1b9e6c',
    advantagesDecoId: 'asset-bcb1d8243f',
    offeringsBgImageId: 'asset-e0d6652ff9',
    benefits: [
      {
        id: 'service-seo-vi-benefit-tang-thu-hang-ben-vung-tren-google',
        title: 'Thứ hạng Google ổn định, lâu dài',
        body: {
          format: 'sanitized-html',
          html: '<p>Bằng chiến lược SEO chuyên sâu, website của bạn leo lên top Google một cách tự nhiên và giữ vững vị trí lâu dài, thay vì rơi hạng nhanh chóng như khi chạy quảng cáo trả phí.</p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 954 }],
        },
        iconId: 'asset-2320be2176',
      },
      {
        id: 'service-seo-vi-benefit-toi-uu-seo-toan-dien-onpage-offpage',
        title: 'SEO toàn diện cả Onpage lẫn Offpage',
        body: {
          format: 'sanitized-html',
          html: '<p>SEO Onpage: Trau chuốt nội dung, tăng tốc tải trang, tinh chỉnh UX/UI để người dùng trải nghiệm tốt hơn.</p><p>SEO Offpage: Phát triển backlink chất lượng, lên chiến lược nội dung, nâng độ uy tín website để cải thiện thứ hạng.</p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1020 }],
        },
        iconId: 'asset-83245ab95f',
      },
      {
        id: 'service-seo-vi-benefit-bao-cao-theo-doi-minh-bach',
        title: 'Theo dõi và báo cáo rõ ràng',
        body: {
          format: 'sanitized-html',
          html: '<p>Mỗi tháng, bạn nhận báo cáo chi tiết về từ khóa, traffic và thứ hạng Google.</p><p>Kế hoạch SEO luôn minh bạch, giúp bạn nắm tiến độ dễ dàng.</p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1087 }],
        },
        iconId: 'asset-c1702f3eb0',
      },
      {
        id: 'service-seo-vi-benefit-doi-ngu-chuyen-gia-giau-kinh-nghiem',
        title: 'Chuyên gia SEO có kinh nghiệm thực chiến',
        body: {
          format: 'sanitized-html',
          html: '<p>Đội ngũ SEO thực chiến của Sova cam kết giúp website của bạn chạm tới thứ hạng cao trên Google bằng phương pháp an toàn, hiệu quả.</p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1154 }],
        },
        iconId: 'asset-715577a59b',
      },
    ],
    faqs: [
      { faqId: 'faq-vi-3285462442', order: 1 },
      { faqId: 'faq-vi-2909576598', order: 2 },
      { faqId: 'faq-vi-2283438908', order: 3 },
      { faqId: 'faq-vi-3056324019', order: 4 },
      { faqId: 'faq-vi-2093297807', order: 5 },
      { faqId: 'faq-vi-2027804686', order: 6 },
      { faqId: 'faq-vi-752892835', order: 7, sourceRevisionId: 'faq-vi-752892835-seo' },
      { faqId: 'faq-vi-2732191879', order: 8 },
    ],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialIds: [
      // 'testimonial-feedback-ten',
      // 'testimonial-feedback-dong-a',
      // 'testimonial-feedback-vinatex',
    ],
    featuredProjectIds: [
      'project-2348',
      'project-2182',
      'project-2176',
      'project-2170',
      'project-2161',
      'project-2120',
    ],
    seo: {
      title: 'SEO từ khoá website - Công ty thiết kế website chuyên nghiệp | Sova',
      description:
        'Dịch vụ SEO từ khóa của Sova tối ưu Onpage và Offpage bằng phương pháp an toàn, báo cáo minh bạch hằng tháng, giúp website lên top Google bền vững.',
      canonicalPath: '/seo-tu-khoa-website/',
      imageId: 'asset-890c9a06c6',
    },
    offerings: [
      {
        id: 'service-seo-vi-offering-seo-onpage',
        title: 'SEO ONPAGE',
        description:
          'Với SEO Onpage, mọi tối ưu được thực hiện ngay bên trong website nhằm nâng thứ hạng trên các công cụ tìm kiếm (Google, Bing,…).',
        items: [
          'Chuẩn Hóa Nội Dung Theo SEO',
          'URL Thân Thiện SEO',
          'Thẻ Meta Tối Ưu',
          'Tối Ưu Ảnh & Video',
          'Hệ Thống Liên Kết Nội Bộ & Liên Kết Ngoài',
          'Rút Ngắn Thời Gian Tải',
          'Nâng Trải Nghiệm Người Dùng (UX/UI)',
        ],
        ctaHref: { label: 'Tư vấn miễn phí\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>Với SEO Onpage, mọi tối ưu được thực hiện ngay bên trong website nhằm nâng thứ hạng trên các công cụ tìm kiếm (Google, Bing,…).</p><ul><li>Chuẩn Hóa Nội Dung Theo SEO</li><li>URL Thân Thiện SEO</li><li>Thẻ Meta Tối Ưu</li><li>Tối Ưu Ảnh &amp; Video</li><li>Hệ Thống Liên Kết Nội Bộ &amp; Liên Kết Ngoài</li><li>Rút Ngắn Thời Gian Tải</li><li>Nâng Trải Nghiệm Người Dùng (UX/UI)</li></ul><p><a href="{{site.zaloHref}}">Tư vấn miễn phí   → </a></p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1288 }],
        },
      },
      {
        id: 'service-seo-vi-offering-seo-offpage',
        title: 'SEO OFFPAGE',
        description:
          'SEO Offpage tác động vào những yếu tố nằm ngoài website, qua đó củng cố uy tín và đẩy thứ hạng trên Google đi lên.',
        items: [
          'PR Báo Chí & Online',
          'Social Media Marketing',
          'Backlink Uy Tín, Chất Lượng',
          'Google My Business & Local SEO',
          'Kế Hoạch Influencer Marketing',
          'Tổ Chức Sự Kiện & Webinar Online',
          'Thu Hút Traffic Tự Nhiên Đa Nguồn',
        ],
        ctaHref: { label: 'Tư vấn miễn phí\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>SEO Offpage tác động vào những yếu tố nằm ngoài website, qua đó củng cố uy tín và đẩy thứ hạng trên Google đi lên.</p><ul><li>PR Báo Chí &amp; Online</li><li>Social Media Marketing</li><li>Backlink Uy Tín, Chất Lượng</li><li>Google My Business &amp; Local SEO</li><li>Kế Hoạch Influencer Marketing</li><li>Tổ Chức Sự Kiện &amp; Webinar Online</li><li>Thu Hút Traffic Tự Nhiên Đa Nguồn</li></ul><p><a href="{{site.zaloHref}}">Tư vấn miễn phí   → </a></p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1492 }],
        },
      },
      {
        id: 'service-seo-vi-offering-cham-soc-website',
        title: 'CHĂM SÓC WEBSITE',
        description:
          'Khi nội dung được chăm sóc đều đặn, website luôn mới mẻ, hấp dẫn khách truy cập và từng bước leo hạng trên Google.',
        items: [
          'Sản Xuất Bài SEO',
          'Làm Mới Bài Viết Cũ',
          'Thiết Kế, Tinh Chỉnh Ảnh & Video',
          'Cập Nhật, Quản Trị Sản Phẩm/Dịch Vụ',
          'Bổ Sung Link Nội Bộ & Liên Kết Ra Ngoài',
          'Điều Chỉnh Nội Dung Theo Hành Vi Người Đọc',
          'Lên Lịch & Đăng Tải Nội Dung',
        ],
        ctaHref: { label: 'Tư vấn miễn phí\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>Khi nội dung được chăm sóc đều đặn, website luôn mới mẻ, hấp dẫn khách truy cập và từng bước leo hạng trên Google.</p><ul><li>Sản Xuất Bài SEO</li><li>Làm Mới Bài Viết Cũ</li><li>Thiết Kế, Tinh Chỉnh Ảnh &amp; Video</li><li>Cập Nhật, Quản Trị Sản Phẩm/Dịch Vụ</li><li>Bổ Sung Link Nội Bộ &amp; Liên Kết Ra Ngoài</li><li>Điều Chỉnh Nội Dung Theo Hành Vi Người Đọc</li><li>Lên Lịch &amp; Đăng Tải Nội Dung</li></ul><p><a href="{{site.zaloHref}}">Tư vấn miễn phí   → </a></p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1705 }],
        },
      },
      {
        id: 'service-seo-vi-offering-content-writer',
        title: 'CONTENT WRITER',
        description:
          'Nội dung chất lượng, cuốn hút người đọc và đạt chuẩn SEO giúp truyền thông thương hiệu hiệu quả hơn.',
        items: [
          'Bài Blog, Bài PR & Bài Chuẩn SEO',
          'Nội Dung Đăng Tải Mạng Xã Hội',
          'Nội Dung Trang Website',
          'Email Marketing & Thông Điệp Quảng Cáo',
          'Biên Soạn Nội Dung Ấn Phẩm & Tài Liệu Tiếp Thị',
          'Hiệu Đính, Chỉnh Lý & Làm Mới Nội Dung',
          'Nghiên Cứu, Đánh Giá Nội Dung',
        ],
        ctaHref: { label: 'Tư vấn miễn phí\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>Nội dung chất lượng, cuốn hút người đọc và đạt chuẩn SEO giúp truyền thông thương hiệu hiệu quả hơn.</p><ul><li>Bài Blog, Bài PR &amp; Bài Chuẩn SEO</li><li>Nội Dung Đăng Tải Mạng Xã Hội</li><li>Nội Dung Trang Website</li><li>Email Marketing &amp; Thông Điệp Quảng Cáo</li><li>Biên Soạn Nội Dung Ấn Phẩm &amp; Tài Liệu Tiếp Thị</li><li>Hiệu Đính, Chỉnh Lý &amp; Làm Mới Nội Dung</li><li>Nghiên Cứu, Đánh Giá Nội Dung</li></ul><p><a href="{{site.zaloHref}}">Tư vấn miễn phí   → </a></p>',
          assetIds: [],
          sources: [{ file: 'seo-tu-khoa-website/index.html', line: 1918 }],
        },
      },
    ],
    sectionCopy: {
      benefits: {
        eyebrow: 'Dịch vụ SEO website',
        title: 'Điểm mạnh giúp dịch vụ SEO của Sova khác biệt',
      },
      offerings: {
        eyebrow: 'Những dịch vụ',
        title: 'Lên top Google cùng Sova',
        titleLines: ['Lên top Google cùng', 'Sova'],
      },
      projects: {
        eyebrow: 'Sova',
        title: 'Dự án kết tinh từ tâm huyết sáng tạo',
        titleLines: ['Dự án kết tinh', 'từ tâm huyết sáng tạo'],
      },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Ghi nhận từ khách hàng',
        titleLines: ['Ghi nhận', 'từ khách hàng'],
      },
      faq: { eyebrow: 'GIẢI ĐÁP', title: 'Những câu hỏi thường gặp' },
    },
  },
  {
    id: 'service-seo-en',
    locale: 'en',
    path: '/en/website-keyword-seo/',
    title: 'Website Keyword SEO',
    translationKey: 'service-seo',
    sources: [{ file: 'en/website-keyword-seo/index.html', line: 676, sourceId: '7366' }],
    key: 'seo',
    summary:
      'Sova sees every SEO project as a chance to create real value for your business and as the first step toward becoming partners, multiplying results together through carefully polished digital products.',
    homeSummary:
      'Sova delivers full-scope Website SEO in a structured, reliable way, with a keyword ranking commitment once the Marketing campaign is complete.',
    subServices: [],
    arrowHref: '/en/website-keyword-seo/',
    hero: {
      headingLines: ['Top-Ranking', 'SEO Services'],
      description: {
        format: 'sanitized-html',
        html: '<p>Sova sees every SEO project as a chance to create real value for your business and as the first step toward becoming partners, multiplying results together through carefully polished digital products.</p>',
        assetIds: [],
        sources: [{ file: 'en/website-keyword-seo/index.html', line: 702 }],
      },
      imageId: 'asset-617f9283d2',
      bgImageId: 'asset-358b4a1d92',
      breadcrumb: [
        { label: 'Home', href: '/en/home/' },
        { label: 'Services' },
        { label: 'Website keyword SEO' },
      ],
      cta: { label: 'Connect now →', href: '/en/contact-us/' },
    },
    advantagesPhotoId: 'asset-82cc1b9e6c',
    advantagesDecoId: 'asset-bcb1d8243f',
    offeringsBgImageId: 'asset-e0d6652ff9',
    benefits: [
      {
        id: 'service-seo-en-benefit-achieve-sustainable-google-rankings',
        title: 'Stable, Long-Lasting Google Rankings',
        body: {
          format: 'sanitized-html',
          html: '<p>With an in-depth SEO strategy, your website climbs to the top of Google organically and holds its position for the long term, instead of dropping fast as it would with paid ads.</p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 954 }],
        },
        iconId: 'asset-2320be2176',
      },
      {
        id: 'service-seo-en-benefit-comprehensive-seo-optimization',
        title: 'End-to-End On-Page & Off-Page SEO',
        body: {
          format: 'sanitized-html',
          html: '<p>On-Page SEO: We refine content, speed up page loading and fine-tune UX/UI for a better user experience.</p><p>Off-Page SEO: We develop quality backlinks, shape the content strategy and strengthen your website’s authority so its overall rankings improve.</p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1020 }],
        },
        iconId: 'asset-83245ab95f',
      },
      {
        id: 'service-seo-en-benefit-transparent-reporting-monitoring',
        title: 'Clear Progress Tracking & Reporting',
        body: {
          format: 'sanitized-html',
          html: '<p>Every month, you receive a detailed report on keywords, traffic and Google rankings.</p><p>The SEO plan stays transparent at all times, so you can follow progress with ease.</p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1087 }],
        },
        iconId: 'asset-c1702f3eb0',
      },
      {
        id: 'service-seo-en-benefit-experienced-seo-experts',
        title: 'Hands-On SEO Specialists',
        body: {
          format: 'sanitized-html',
          html: '<p>Sova’s hands-on SEO team is committed to lifting your website to high Google rankings through safe, effective methods.</p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1154 }],
        },
        iconId: 'asset-715577a59b',
      },
    ],
    faqs: [
      { faqId: 'faq-en-1669848074', order: 1 },
      { faqId: 'faq-en-273079040', order: 2 },
      { faqId: 'faq-en-197859180', order: 3 },
      { faqId: 'faq-en-4141356478', order: 4 },
      { faqId: 'faq-en-1956810812', order: 5 },
      { faqId: 'faq-en-47422159', order: 6 },
      { faqId: 'faq-en-2411405737', order: 7 },
      { faqId: 'faq-en-2506790825', order: 8 },
    ],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialIds: [
      // 'testimonial-feedback-ten',
      // 'testimonial-feedback-dong-a',
      // 'testimonial-feedback-vinatex',
    ],
    featuredProjectIds: [],
    seo: {
      title: 'Website Keyword SEO - Professional Website Design Company | Sova',
      description:
        'Sova’s keyword SEO service covers on-page and off-page optimization with safe methods and transparent monthly reports to lift your site in Google rankings.',
      canonicalPath: '/en/website-keyword-seo/',
      imageId: 'asset-890c9a06c6',
    },
    offerings: [
      {
        id: 'service-seo-en-offering-seo-onpage',
        title: 'SEO ONPAGE',
        description:
          'With On-Page SEO, every optimization is carried out inside the website itself to lift its rankings on search engines (Google, Bing, and others).',
        items: [
          'Content Aligned with SEO',
          'SEO-Friendly URLs',
          'Optimized SEO Meta Tags',
          'Optimized Images & Video',
          'Internal & External Link System',
          'Shorter Page Load Times',
          'An Improved User Experience (UX/UI)',
        ],
        ctaHref: { label: 'Free Consultation\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>With On-Page SEO, every optimization is carried out inside the website itself to lift its rankings on search engines (Google, Bing, and others).</p><ul><li>Content Aligned with SEO</li><li>SEO-Friendly URLs</li><li>Optimized SEO Meta Tags</li><li>Optimized Images &amp; Video</li><li>Internal &amp; External Link System</li><li>Shorter Page Load Times</li><li>An Improved User Experience (UX/UI)</li></ul><p><a href="{{site.zaloHref}}">Free Consultation   → </a></p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1287 }],
        },
      },
      {
        id: 'service-seo-en-offering-seo-offpage',
        title: 'SEO OFFPAGE',
        description:
          'Off-Page SEO works on the factors that sit outside your website, strengthening its authority and pushing its Google ranking upward.',
        items: [
          'Press Coverage & Online PR',
          'Social Media Marketing',
          'Reputable, Quality Backlinks',
          'Google My Business & Local SEO',
          'Influencer Marketing Plan',
          'Running Events & Online Webinars',
          'Attracting Organic Traffic from Many Sources',
        ],
        ctaHref: { label: 'Free Consultation\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>Off-Page SEO works on the factors that sit outside your website, strengthening its authority and pushing its Google ranking upward.</p><ul><li>Press Coverage &amp; Online PR</li><li>Social Media Marketing</li><li>Reputable, Quality Backlinks</li><li>Google My Business &amp; Local SEO</li><li>Influencer Marketing Plan</li><li>Running Events &amp; Online Webinars</li><li>Attracting Organic Traffic from Many Sources</li></ul><p><a href="{{site.zaloHref}}">Free Consultation   → </a></p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1491 }],
        },
      },
      {
        id: 'service-seo-en-offering-website-maintenance',
        title: 'WEBSITE MAINTENANCE',
        description:
          'When its content is cared for regularly, your website stays fresh, appeals to visitors and steadily climbs in Google rankings.',
        items: [
          'Producing SEO Posts',
          'Refreshing and Reworking Old Articles',
          'Designing & Refining Images & Videos',
          'Updating & Managing Products/Services',
          'Adding Internal & Outbound Links',
          'Adapting Content to Reader Behavior',
          'Planning the Content Calendar & Publishing',
        ],
        ctaHref: { label: 'Free Consultation\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>When its content is cared for regularly, your website stays fresh, appeals to visitors and steadily climbs in Google rankings.</p><ul><li>Producing SEO Posts</li><li>Refreshing and Reworking Old Articles</li><li>Designing &amp; Refining Images &amp; Videos</li><li>Updating &amp; Managing Products/Services</li><li>Adding Internal &amp; Outbound Links</li><li>Adapting Content to Reader Behavior</li><li>Planning the Content Calendar &amp; Publishing</li></ul><p><a href="{{site.zaloHref}}">Free Consultation   → </a></p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1704 }],
        },
      },
      {
        id: 'service-seo-en-offering-content-writer',
        title: 'CONTENT WRITER',
        description:
          'Content that is high in quality, captivating for readers and built to SEO standards makes your brand’s communications more effective.',
        items: [
          'Blog Posts, PR Pieces & SEO-Standard Articles',
          'Content for Social Media Posts',
          'Website Page Content',
          'Email Marketing & Advertising Messages',
          'Writing Content for Publications & Marketing Collateral',
          'Proofreading, Revising & Refreshing Content',
          'Content Research & Evaluation',
        ],
        ctaHref: { label: 'Free Consultation\u00a0 \u00a0→ ', href: '{{site.zaloHref}}' },
        content: {
          format: 'sanitized-html',
          html: '<p>Content that is high in quality, captivating for readers and built to SEO standards makes your brand’s communications more effective.</p><ul><li>Blog Posts, PR Pieces &amp; SEO-Standard Articles</li><li>Content for Social Media Posts</li><li>Website Page Content</li><li>Email Marketing &amp; Advertising Messages</li><li>Writing Content for Publications &amp; Marketing Collateral</li><li>Proofreading, Revising &amp; Refreshing Content</li><li>Content Research &amp; Evaluation</li></ul><p><a href="{{site.zaloHref}}">Free Consultation   → </a></p>',
          assetIds: [],
          sources: [{ file: 'en/website-keyword-seo/index.html', line: 1917 }],
        },
      },
    ],
    sectionCopy: {
      benefits: {
        eyebrow: 'Website Keyword SEO',
        title: 'What Sets Sova’s SEO Service Apart',
      },
      offerings: { eyebrow: 'Services', title: 'Top of Google with Sova' },
      projects: {
        eyebrow: 'Sova',
        title: 'Projects Shaped by Heartfelt Creativity',
        titleLines: ['Projects Shaped by', 'Heartfelt Creativity'],
      },
      testimonials: { eyebrow: 'Sova', title: 'What Clients Say' },
      faq: { eyebrow: 'FAQs', title: 'Frequently Asked Questions' },
    },
  },
];
