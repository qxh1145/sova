// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_ABOUT=1.
import type { AboutPageRecord } from '@/types/content';

export const aboutPages: AboutPageRecord[] = [
  {
    id: 'about-en',
    locale: 'en',
    path: '/en/about-us/',
    title: 'About Us',
    sources: [{ file: 'en/about-us/index.html', line: 658, sourceId: '7349' }],
    translationKey: 'about',
    hero: {
      headingLines: ['Taking Your Brand', 'to New Heights'],
      breadcrumb: [{ label: 'Home', href: '/en/home/' }, { label: 'About Us' }],
      description: {
        format: 'sanitized-html',
        html: '<p>Sova Technology Solutions Co., Ltd. – a website design company that puts its whole heart into every product, service and experience it delivers to clients.</p>',
        assetIds: [],
        sources: [{ file: 'en/about-us/index.html', line: 686 }],
      },
      imageId: 'asset-1a1c3b1f81',
      cta: { label: 'Sova Portfolio →', href: '/en/sova-portfolio/' },
    },
    seo: {
      title: 'About Us - Professional Website Design Company | Sova',
      description:
        'The Sova story: in the market since 2023, a 20-member team serving 500+ clients across 50+ projects in website design, mobile apps, SEO and branding.',
      canonicalPath: '/en/about-us/',
      imageId: 'asset-8318759646',
    },
    statIds: ['stat-clients-en', 'stat-projects-en', 'stat-members-en', 'stat-years-en'],
    goals: [
      {
        id: 'about-en-goal-staying-ahead-of-the-curve',
        title: 'Getting Ahead of Change',
        body: {
          format: 'sanitized-html',
          html: '<p>Welcoming new ideas early keeps Sova strong and lays the groundwork for lasting growth.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1183 }],
        },
        iconId: 'asset-067e286c8e',
      },
      {
        id: 'about-en-goal-solution-oriented-thinking',
        title: 'A Solution-First Mindset',
        body: {
          format: 'sanitized-html',
          html: '<p>We keep a close eye on new technologies and set ourselves challenges to find the most effective, lasting answers.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1265 }],
        },
        iconId: 'asset-3390bb323e',
      },
      {
        id: 'about-en-goal-listening-understanding',
        title: 'Understanding by Listening',
        body: {
          format: 'sanitized-html',
          html: '<p>Sova listens to every question you raise, analyzes it closely and answers in detail until everything is clear. From there, we propose the best-fitting way to solve the problem.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1347 }],
        },
        iconId: 'asset-b76c181761',
      },
      {
        id: 'about-en-goal-turning-vision-into-reality',
        title: 'Delivering Concrete Results',
        body: {
          format: 'sanitized-html',
          html: '<p>The Sova brand is built on understanding: we aim to be a trusted “right hand” for our clients, using technology to turn each need into concrete results.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1429 }],
        },
        iconId: 'asset-a7a7c1b2e8',
      },
      {
        id: 'about-en-goal-trust-reliability',
        title: 'Keeping Our Promises',
        body: {
          format: 'sanitized-html',
          html: '<p>To Sova, every client is a lasting relationship. We stay transparent in every transaction, keep the commitments we make, and bring satisfaction and enduring value throughout our work together.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1510 }],
        },
        iconId: 'asset-4df71020f1',
      },
      {
        id: 'about-en-goal-positive-change',
        title: 'Innovating Daily',
        body: {
          format: 'sanitized-html',
          html: '<p>Constantly renewing ourselves in a positive way is how Sova becomes the preferred choice for clients: each project creates business value while spreading the energy we pursue.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1592 }],
        },
        iconId: 'asset-74979526ba',
      },
    ],
    purposePanels: [
      {
        id: 'about-en-purpose-our-goal',
        title: 'Our Goal',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova aims for products and services optimized down to every detail, helping our clients’ businesses perform at a high level. What sets us apart from competitors is outstanding quality and a clear commitment to every product and service.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2263 }],
        },
      },
      {
        id: 'about-en-purpose-our-commitment',
        title: 'Our Commitment',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova delivers software products that fully support organizations and businesses, making workflows leaner and productivity higher. Along the way, roadblocks get cleared, costs come down and profits improve.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2296 }],
        },
      },
      {
        id: 'about-en-purpose-our-mission',
        title: 'Our Mission',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova aims to establish its standing through its own strengths in digital products and digital experience services for businesses, while steadily building up our core capabilities, sense of responsibility and creative thinking.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2329 }],
        },
      },
      {
        id: 'about-en-purpose-our-vision',
        title: 'Our Vision',
        content: {
          format: 'sanitized-html',
          html: '<p>In this new technology era, Sova wants to become a sustainably growing business and a springboard that helps other companies keep pace and speed up their digital transformation journey.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2362 }],
        },
      },
    ],
    timeline: [
      {
        id: 'about-en-timeline-2023',
        year: '2023',
        title: 'Entering the market',
        body: {
          format: 'sanitized-html',
          html: '<p>Starting from small ideas, Sova built its first digital products.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-en-timeline-2024',
        year: '2024',
        title: 'Refining our products',
        body: {
          format: 'sanitized-html',
          html: '<p>Focused on improving product quality based on real-world feedback.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-en-timeline-2025',
        year: '2025',
        title: 'Launching our services',
        body: {
          format: 'sanitized-html',
          html: '<p>Officially launched website design, SEO, mobile app development and outsourcing services.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-en-timeline-2026',
        year: '2026',
        title: 'Scaling up',
        body: {
          format: 'sanitized-html',
          html: '<p>Expanded our team to serve clients nationwide and reach international markets.</p>',
          assetIds: [],
          sources: [],
        },
      },
    ],
    capabilities: [
      {
        id: 'about-en-capability-building-a-strategy',
        title: 'BUILDING A STRATEGY',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Pinpointing Exactly What Clients Need</li><li>Streamlining Workflows for Efficiency</li><li>Regularly Refreshing and Upgrading Products</li><li>Putting User Experience (UX/UI) First</li><li>Tight Security and Proper Compliance</li><li>Supporting Digital Transformation and Long-Term Growth</li><li>Tracking Results and Listening to Client Feedback</li><li>Making Products Easier to Customize and More Flexible</li><li>Prioritizing Innovation with Advanced Technology</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4149 }],
        },
      },
      {
        id: 'about-en-capability-experience-design',
        title: 'EXPERIENCE DESIGN',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Clear, Coherent Task &amp; Interaction Flows</li><li>Easy to Adjust &amp; Flexible to Each Need</li><li>Smoother Connection &amp; Collaboration</li><li>Looking Great on Every Platform and Device</li><li>Protecting Data Safety &amp; Privacy</li><li>Fast Response &amp; Smooth System Operation</li><li>Built-In Analytics &amp; Reporting Tools</li><li>Experiences That Suit Many Different User Groups</li><li>Intuitive Interfaces Anyone Can Easily Use</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4521 }],
        },
      },
      {
        id: 'about-en-capability-product-development',
        title: 'PRODUCT DEVELOPMENT',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Development in Cycles of Improvement</li><li>Applying Modern Technologies</li><li>Open Structure, Easy to Extend &amp; Fine-Tune</li><li>Supporting Teamwork &amp; Data Linking</li><li>Care for Every UX/UI Touchpoint</li><li>Raising Safety &amp; Compliance Standards</li><li>Powering a Sustainable Digitalization Journey</li><li>Following the Real Needs &amp; Requests of Business Clients</li><li>Proposing Solutions for Smoother Operations</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4893 }],
        },
      },
    ],
    partnerIds: [],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialIds: [
      // 'testimonial-feedback-ten',
      // 'testimonial-feedback-dong-a',
      // 'testimonial-feedback-vinatex',
    ],
    sectionCopy: {
      achievements: {
        title: 'Numbers That Speak',
        description:
          'For Sova, each project is both a chance to add value for a business and a promise of long-term partnership, so every digital experience we build brings extra value to its customers.',
      },
      goals: {
        eyebrow: 'Target',
        title: 'Sova’s Aims',
        description:
          'Raising our service quality every day is what Sova always pursues,\nbecause we want to be the first name clients think of.\nFor Sova, every project is a fresh experience and a new challenge.',
        descriptionLines: [
          'Raising our service quality every day is what Sova always pursues,',
          'because we want to be the first name clients think of.',
          'For Sova, every project is a fresh experience and a new challenge.',
        ],
      },
      purpose: {
        title: 'Sova Products',
        description:
          'Every product is built around real market needs and is ready to stand alongside businesses of every size—large, medium or small—toward comprehensive, sustainable growth.',
      },
      timeline: {
        title: 'Growing Step by Step',
      },
      pillars: {
        eyebrow: 'Services',
        title: 'Ready to Serve You at Sova',
        description: 'As a Sova client, you are backed by the capabilities listed below:',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Reviews for Sova',
      },
    },
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    purposeImageId: 'asset-e0d6652ff9',
    timelineDotId: 'asset-c78e42b8a9',
  },
  {
    id: 'about-vi',
    locale: 'vi',
    path: '/gioi-thieu/',
    title: 'Giới thiệu',
    sources: [{ file: 'gioi-thieu/index.html', line: 658, sourceId: '7192' }],
    translationKey: 'about',
    hero: {
      headingLines: ['Đưa thương hiệu của bạn', 'vươn tầm cao mới'],
      breadcrumb: [{ label: 'Trang chủ', href: '/' }, { label: 'Giới thiệu' }],
      description: {
        format: 'sanitized-html',
        html: '<p>Công ty TNHH Giải Pháp Công Nghệ Sova – đơn vị thiết kế website luôn đặt trọn tâm huyết vào từng sản phẩm, dịch vụ và trải nghiệm trao tới khách hàng.</p>',
        assetIds: [],
        sources: [{ file: 'gioi-thieu/index.html', line: 686 }],
      },
      imageId: 'asset-1a1c3b1f81',
      cta: { label: 'Sova Portfolio →', href: '/ho-so-nang-luc-sova/' },
    },
    seo: {
      title: 'Giới thiệu - Công ty thiết kế website chuyên nghiệp | Sova',
      description:
        'Câu chuyện của Sova: bước vào thị trường năm 2023, đội ngũ 20 thành viên, hơn 500 khách hàng và hơn 50 dự án thiết kế website, app mobile, SEO, branding.',
      canonicalPath: '/gioi-thieu/',
      imageId: 'asset-8318759646',
    },
    statIds: ['stat-clients-vi', 'stat-projects-vi', 'stat-members-vi', 'stat-years-vi'],
    goals: [
      {
        id: 'about-vi-goal-theo-kip-xu-huong',
        title: 'Đón đầu thay đổi',
        body: {
          format: 'sanitized-html',
          html: '<p>Chủ động đón nhận cái mới giúp Sova luôn vững mạnh và đặt nền móng cho sự phát triển lâu dài.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1183 }],
        },
        iconId: 'asset-067e286c8e',
      },
      {
        id: 'about-vi-goal-tim-kiem-giai-phap',
        title: 'Tư duy giải pháp',
        body: {
          format: 'sanitized-html',
          html: '<p>Chúng tôi không ngừng theo dõi các công nghệ mới và tự đặt thử thách cho mình để tìm ra lời giải hiệu quả, bền vững nhất.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1265 }],
        },
        iconId: 'asset-3390bb323e',
      },
      {
        id: 'about-vi-goal-luon-lang-nghe-thau-hieu',
        title: 'Thấu hiểu nhờ lắng nghe',
        body: {
          format: 'sanitized-html',
          html: '<p>Mỗi câu hỏi của bạn đều được Sova lắng nghe, phân tích kỹ và trả lời tường tận cho đến khi bạn nắm rõ. Từ đó, chúng tôi đề xuất hướng xử lý phù hợp nhất cho vấn đề.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1347 }],
        },
        iconId: 'asset-b76c181761',
      },
      {
        id: 'about-vi-goal-thuc-hien-hoa',
        title: 'Kết quả cụ thể',
        body: {
          format: 'sanitized-html',
          html: '<p>Thương hiệu Sova được xây nên từ sự thấu hiểu: chúng tôi muốn là “cánh tay phải” đáng tin của khách hàng, dùng công nghệ biến từng nhu cầu thành kết quả cụ thể.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1429 }],
        },
        iconId: 'asset-a7a7c1b2e8',
      },
      {
        id: 'about-vi-goal-su-tin-cay',
        title: 'Giữ chữ tín',
        body: {
          format: 'sanitized-html',
          html: '<p>Với Sova, mỗi khách hàng là một mối quan hệ gắn bó lâu dài. Chúng tôi minh bạch trong từng giao dịch, giữ đúng những cam kết đã đưa ra và đem lại sự hài lòng cùng giá trị bền lâu suốt thời gian hai bên hợp tác.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1510 }],
        },
        iconId: 'asset-4df71020f1',
      },
      {
        id: 'about-vi-goal-thay-doi-tich-cuc',
        title: 'Đổi mới mỗi ngày',
        body: {
          format: 'sanitized-html',
          html: '<p>Không ngừng làm mới mình theo hướng tích cực là cách Sova trở thành lựa chọn ưu tiên của khách hàng: mỗi dự án vừa tạo giá trị cho doanh nghiệp, vừa lan tỏa nguồn năng lượng mà chúng tôi theo đuổi.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1592 }],
        },
        iconId: 'asset-74979526ba',
      },
    ],
    purposePanels: [
      {
        id: 'about-vi-purpose-muc-tieu',
        title: 'Mục tiêu',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova hướng đến những sản phẩm và dịch vụ được tối ưu tới từng chi tiết, giúp hoạt động kinh doanh của khách hàng đạt hiệu quả cao. Điều làm nên khác biệt của chúng tôi trước các đối thủ chính là chất lượng vượt trội cùng cam kết rõ ràng cho từng sản phẩm, dịch vụ.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2263 }],
        },
      },
      {
        id: 'about-vi-purpose-cam-ket',
        title: 'Cam kết',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova mang đến các sản phẩm phần mềm đồng hành trọn vẹn cùng tổ chức và doanh nghiệp, để quy trình làm việc trở nên gọn gàng, năng suất được nâng lên. Bên cạnh đó, nhiều vướng mắc được tháo gỡ, chi phí được tiết giảm và lợi nhuận được cải thiện.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2296 }],
        },
      },
      {
        id: 'about-vi-purpose-su-menh',
        title: 'Sứ mệnh',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova đặt mục tiêu khẳng định vị thế nhờ thế mạnh riêng về sản phẩm số và dịch vụ trải nghiệm số dành cho doanh nghiệp, song song với việc bồi đắp năng lực cốt lõi, tinh thần trách nhiệm và óc sáng tạo.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2329 }],
        },
      },
      {
        id: 'about-vi-purpose-tam-nhin',
        title: 'Tầm nhìn',
        content: {
          format: 'sanitized-html',
          html: '<p>Trong kỷ nguyên công nghệ mới, Sova muốn trở thành một doanh nghiệp phát triển bền vững, đồng thời là bệ đỡ giúp các doanh nghiệp khác bắt nhịp và tăng tốc trên hành trình chuyển đổi số.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2362 }],
        },
      },
    ],
    timeline: [
      {
        id: 'about-vi-timeline-2023',
        year: '2023',
        title: 'Gia nhập thị trường',
        body: {
          format: 'sanitized-html',
          html: '<p>Khởi đầu từ những ý tưởng nhỏ, Sova xây dựng các sản phẩm số đầu tiên.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-vi-timeline-2024',
        year: '2024',
        title: 'Hoàn thiện sản phẩm',
        body: {
          format: 'sanitized-html',
          html: '<p>Tập trung cải tiến và nâng cao chất lượng sản phẩm dựa trên phản hồi thực tế.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-vi-timeline-2025',
        year: '2025',
        title: 'Ra mắt dịch vụ',
        body: {
          format: 'sanitized-html',
          html: '<p>Chính thức cung cấp dịch vụ thiết kế website, SEO, phát triển app mobile và outsourcing.</p>',
          assetIds: [],
          sources: [],
        },
      },
      {
        id: 'about-vi-timeline-2026',
        year: '2026',
        title: 'Mở rộng quy mô',
        body: {
          format: 'sanitized-html',
          html: '<p>Mở rộng đội ngũ, phục vụ khách hàng trên toàn quốc và hướng ra thị trường quốc tế.</p>',
          assetIds: [],
          sources: [],
        },
      },
    ],
    capabilities: [
      {
        id: 'about-vi-capability-xay-dung-chien-luoc',
        title: 'XÂY DỰNG CHIẾN LƯỢC',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Nắm bắt chính xác điều khách hàng cần</li><li>Sắp xếp quy trình làm việc gọn, hiệu quả</li><li>Đều đặn làm mới và nâng cấp sản phẩm</li><li>Đặt trải nghiệm người dùng (UX/UI) lên hàng đầu</li><li>Bảo mật chặt chẽ, tuân thủ đúng quy định</li><li>Đồng hành cùng chuyển đổi số và tăng trưởng dài hạn</li><li>Theo dõi hiệu quả, lắng nghe phản hồi khách hàng</li><li>Giúp sản phẩm dễ tùy biến và linh hoạt hơn</li><li>Ưu tiên đổi mới cùng công nghệ tiên tiến</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4150 }],
        },
      },
      {
        id: 'about-vi-capability-thiet-ke-trai-nghiem',
        title: 'THIẾT KẾ TRẢI NGHIỆM',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Luồng thao tác và tương tác mạch lạc</li><li>Dễ điều chỉnh, linh hoạt theo từng nhu cầu</li><li>Kết nối và cộng tác thuận tiện hơn</li><li>Hiển thị tốt trên mọi nền tảng, thiết bị</li><li>Bảo vệ an toàn dữ liệu và quyền riêng tư</li><li>Hệ thống phản hồi nhanh, vận hành mượt</li><li>Tích hợp sẵn công cụ phân tích, lập báo cáo</li><li>Trải nghiệm phù hợp cho nhiều nhóm người dùng khác nhau</li><li>Giao diện trực quan, ai cũng dễ dàng sử dụng</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4522 }],
        },
      },
      {
        id: 'about-vi-capability-phat-trien-san-pham',
        title: 'PHÁT TRIỂN SẢN PHẨM',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Phát triển theo vòng lặp cải tiến</li><li>Ứng dụng các công nghệ hiện đại</li><li>Cấu trúc mở, dễ mở rộng và tinh chỉnh</li><li>Hỗ trợ làm việc nhóm và liên kết dữ liệu</li><li>Chăm chút từng điểm chạm UX/UI</li><li>Nâng chuẩn an toàn và mức độ tuân thủ</li><li>Tiếp sức cho hành trình số hóa bền vững</li><li>Bám sát nhu cầu và đòi hỏi thực tế của khách hàng doanh nghiệp</li><li>Đề xuất giải pháp giúp vận hành trơn tru hơn</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4894 }],
        },
      },
    ],
    partnerIds: [],
    // Testimonials hidden (stakeholder review 2026-10-27): the quotes came from the source site's
    // clients. Uncomment the entries to show the section again.
    testimonialIds: [
      // 'testimonial-feedback-ten',
      // 'testimonial-feedback-dong-a',
      // 'testimonial-feedback-vinatex',
    ],
    sectionCopy: {
      achievements: {
        title: 'Những con số biết nói về Sova',
        description:
          'Mỗi dự án, với Sova, vừa là dịp tạo thêm giá trị cho doanh nghiệp, vừa là lời cam kết đồng hành dài lâu, để từng trải nghiệm số chúng tôi làm ra đem lại giá trị cộng thêm cho khách hàng.',
      },
      goals: {
        eyebrow: 'Target',
        title: 'Điều Sova hướng tới',
        description:
          'Nâng chất lượng dịch vụ lên từng ngày là điều Sova luôn theo đuổi,\nbởi chúng tôi muốn là cái tên khách hàng nghĩ đến đầu tiên.\nVới Sova, dự án nào cũng là một trải nghiệm mới và một thử thách.',
        descriptionLines: [
          'Nâng chất lượng dịch vụ lên từng ngày là điều Sova luôn theo đuổi,',
          'bởi chúng tôi muốn là cái tên khách hàng nghĩ đến đầu tiên.',
          'Với Sova, dự án nào cũng là một trải nghiệm mới và một thử thách.',
        ],
      },
      purpose: {
        title: 'Sản phẩm mang tên Sova',
        titleLines: ['Sản phẩm mang tên', 'Sova'],
        description:
          'Mỗi sản phẩm đều được xây dựng sát với nhu cầu thực tế của thị trường và sẵn sàng sát cánh cùng doanh nghiệp ở mọi quy mô, từ lớn, vừa đến nhỏ, hướng tới phát triển toàn diện, bền vững.',
      },
      timeline: {
        title: 'Từng bước trưởng thành',
      },
      pillars: {
        eyebrow: 'Những dịch vụ',
        title: 'Sẵn sàng phục vụ tại Sova',
        titleLines: ['Sẵn sàng phục vụ tại', 'Sova'],
        description: 'Là khách hàng của Sova, bạn được đồng hành bởi những năng lực dưới đây',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Những lời đánh giá dành cho Sova',
        titleLines: ['Những lời đánh giá', 'dành cho Sova'],
      },
    },
    marqueeText: ['Development', 'UI/UX', 'Sova', 'Branding', 'Writer', 'Mobile'],
    marqueeSeparatorId: 'asset-400b882328',
    testimonialArtIds: {
      photoId: 'asset-941f38ec1d',
      quoteIconId: 'asset-1d227d7c9b',
      lineId: 'asset-5763f42849',
    },
    purposeImageId: 'asset-e0d6652ff9',
    timelineDotId: 'asset-c78e42b8a9',
  },
];
