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
      headingLines: ['Strategically Building', 'Elevating Brand Value'],
      description: {
        format: 'sanitized-html',
        html: '<p>Sova Technology Solutions Co., Ltd. – A top-tier web design company, committed to delivering exceptional digital products, innovative services, and an unparalleled user experience</p>',
        assetIds: [],
        sources: [{ file: 'en/about-us/index.html', line: 686 }],
      },
      imageId: 'asset-1a1c3b1f81',
      cta: { label: 'Sova Porfolio →', href: '/en/porfolio-eras-vietnam/' },
    },
    seo: {
      title: 'About Us - Công ty thiết kế website chuyên nghiệp | Sova',
      description: 'Home / About Us',
      canonicalPath: '/en/about-us/',
      imageId: 'asset-8318759646',
    },
    statIds: ['stat-clients-en', 'stat-projects-en', 'stat-members-en', 'stat-years-en'],
    goals: [
      {
        id: 'about-en-goal-staying-ahead-of-the-curve',
        title: 'Staying Ahead of the Curve',
        body: {
          format: 'sanitized-html',
          html: '<p>Embracing innovation is what drives Sova to grow stronger and build a sustainable future.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1183 }],
        },
        iconId: 'asset-067e286c8e',
      },
      {
        id: 'about-en-goal-solution-oriented-thinking',
        title: 'Solution-Oriented Thinking',
        body: {
          format: 'sanitized-html',
          html: '<p>We constantly seek out emerging technologies and challenge ourselves to discover the most powerful and sustainable solutions.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1265 }],
        },
        iconId: 'asset-3390bb323e',
      },
      {
        id: 'about-en-goal-listening-understanding',
        title: 'Listening & Understanding',
        body: {
          format: 'sanitized-html',
          html: '<p>We listen carefully, analyze thoroughly, and provide clear, thoughtful answers — helping you gain clarity and offering the most effective solutions to your challenges.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1347 }],
        },
        iconId: 'asset-b76c181761',
      },
      {
        id: 'about-en-goal-turning-vision-into-reality',
        title: 'Turning Vision into Reality',
        body: {
          format: 'sanitized-html',
          html: '<p>To build the Sova brand, we focus on understanding and becoming a reliable “right-hand partner” — using technology to transform every customer need into tangible results.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1429 }],
        },
        iconId: 'asset-a7a7c1b2e8',
      },
      {
        id: 'about-en-goal-trust-reliability',
        title: 'Trust & Reliability',
        body: {
          format: 'sanitized-html',
          html: '<p>We value long-term, sustainable partnerships built on transparency and trust. Sova is committed to delivering lasting value and satisfaction throughout every collaboration.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 1510 }],
        },
        iconId: 'asset-4df71020f1',
      },
      {
        id: 'about-en-goal-positive-change',
        title: 'Positive Change',
        body: {
          format: 'sanitized-html',
          html: '<p>Continuous, positive innovation enables Sova to become the top choice for clients — where every project delivers business value and the energetic spirit we passionately pursue.</p>',
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
          html: '<p>We are committed to creating the most optimized products and services that drive business performance for our clients. What sets us apart from competitors is our superior quality and unwavering commitment to excellence.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2263 }],
        },
      },
      {
        id: 'about-en-purpose-our-commitment',
        title: 'Our Commitment',
        content: {
          format: 'sanitized-html',
          html: '<p>We provide software solutions that offer end-to-end support for organizations and businesses — optimizing workflows, enhancing productivity, addressing operational challenges, reducing costs, and increasing profitability.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2296 }],
        },
      },
      {
        id: 'about-en-purpose-our-mission',
        title: 'Our Mission',
        content: {
          format: 'sanitized-html',
          html: '<p>To become a leading company distinguished by our expertise in digital products and digital experience services. We aim to strengthen our core competencies, foster creativity, and uphold a deep sense of responsibility in everything we do.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2329 }],
        },
      },
      {
        id: 'about-en-purpose-our-vision',
        title: 'Our Vision',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova strives to become a sustainable enterprise in the era of digital transformation — empowering businesses to grow faster and more efficiently through innovative technology.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2362 }],
        },
      },
    ],
    timeline: [
      {
        id: 'about-en-timeline-2016',
        year: '2016',
        title: 'Market Entry',
        body: {
          format: 'sanitized-html',
          html: '<p>Founded and entered the market as a specialized provider of Facebook Marketing solutions.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2518 }],
        },
      },
      {
        id: 'about-en-timeline-2017',
        year: '2017',
        title: 'Launch of SEO Services',
        body: {
          format: 'sanitized-html',
          html: '<p>Expanded our offerings to include SEO services, further strengthening our digital marketing solutions.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2559 }],
        },
      },
      {
        id: 'about-en-timeline-2018',
        year: '2018',
        title: 'Website, Branding',
        body: {
          format: 'sanitized-html',
          html: '<p>Founded and entered the market as a specialized provider of Facebook Marketing solutions.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2600 }],
        },
      },
      {
        id: 'about-en-timeline-2019',
        year: '2019',
        title: 'Staying ahead of trends',
        body: {
          format: 'sanitized-html',
          html: '<p>Continued to innovate by offering cutting-edge solutions in Facebook Marketing to keep up with market trends.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2641 }],
        },
      },
      {
        id: 'about-en-timeline-2020',
        year: '2020',
        title: 'Explosive Growth During Social Distancing',
        body: {
          format: 'sanitized-html',
          html: '<p>With products perfectly suited for online needs, remote work, and e-commerce, our revenue tripled during the pandemic.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2682 }],
        },
      },
      {
        id: 'about-en-timeline-2021',
        year: '2021',
        title: 'Launch of New Products',
        body: {
          format: 'sanitized-html',
          html: '<p>Introduced domain-specific email services to offer a more comprehensive product suite to our clients.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2723 }],
        },
      },
      {
        id: 'about-en-timeline-2022',
        year: '2022',
        title: 'Reaching 2000 Clients Milestone',
        body: {
          format: 'sanitized-html',
          html: '<p>Achieved the milestone of serving 2000 clients and expanded our presence by opening a representative office in Ho Chi Minh City.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2764 }],
        },
      },
      {
        id: 'about-en-timeline-2023',
        year: '2023',
        title: 'Launch new services',
        body: {
          format: 'sanitized-html',
          html: '<p>Introduced mobile app design and development services to keep up with the growing mobile platform trends.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2805 }],
        },
      },
      {
        id: 'about-en-timeline-2024',
        year: '2024',
        title: 'Continuous Self-Improvement',
        body: {
          format: 'sanitized-html',
          html: '<p>Re-organized our internal structure to pave the way for significant growth and transformation in the coming year.</p>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 2852 }],
        },
      },
    ],
    capabilities: [
      {
        id: 'about-en-capability-building-a-strategy',
        title: 'BUILDING A STRATEGY',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Understand Customer Needs</li><li>Optimize Workflow Processes</li><li>Continuous Product Improvement and Upgrades</li><li>Optimize User Experience (UX/UI)</li><li>Ensure Security and Compliance</li><li>Support Digital Transformation and Sustainable Growth</li><li>Measure Effectiveness and Customer FeedbackMeasure Effectiveness and Customer Feedback</li><li>Enhance Product Customization and Flexibility</li><li>Drive Innovation and Leverage Advanced Technologies</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4149 }],
        },
      },
      {
        id: 'about-en-capability-experience-design',
        title: 'EXPERIENCE DESIGN',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Optimizing Workflow &amp; Interaction Processes</li><li>Ensuring Flexibility &amp; Customization</li><li>Enhancing Collaboration &amp; Connectivity</li><li>Optimized for Multiple Platforms and Devices</li><li>Enhancing Collaboration &amp; Connectivity</li><li>Improving System Speed &amp; Performance</li><li>Integrating Analytics &amp; Reporting Tools</li><li>Creating User Experiences for Diverse Audiences</li><li>Crafting Intuitive &amp; Easy-to-Use Interfaces</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4521 }],
        },
      },
      {
        id: 'about-en-capability-product-development',
        title: 'PRODUCT DEVELOPMENT',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Continuous Improvement &amp; Upgrades</li><li>Integrating Advanced Technologies</li><li>Customization &amp; Flexibility</li><li>Enhancing Collaboration &amp; Connectivity</li><li>Optimizing User Experience (UX/UI)</li><li>Improving Security &amp; Compliance</li><li>Supporting Digital Transformation &amp; Sustainable Growth</li><li>Meeting Business Customer Needs &amp; Demands</li><li>Providing Workflow Optimization Solutions</li></ul>',
          assetIds: [],
          sources: [{ file: 'en/about-us/index.html', line: 4893 }],
        },
      },
    ],
    partnerIds: [],
    testimonialIds: [
      'testimonial-feedback-ten',
      'testimonial-feedback-dong-a',
      'testimonial-feedback-vinatex',
    ],
    sectionCopy: {
      achievements: {
        title: 'Our Achievements',
        description:
          'Sova see every project as more than just a task — it’s a chance to co-create value with our clients, delivering meaningful digital experiences that drive impact and foster lasting partnerships.',
      },
      goals: {
        eyebrow: 'Target',
        title: 'Our Mission',
        description:
          'Sova are committed to continuously improving our service quality\nwith the goal of becoming the top choice for our clients.\nEvery project is both a new experience and a meaningful challenge for us.',
        descriptionLines: [
          'Sova are committed to continuously improving our service quality',
          'with the goal of becoming the top choice for our clients.',
          'Every project is both a new experience and a meaningful challenge for us.',
        ],
      },
      purpose: {
        title: 'Our Products',
        description:
          'All of Sova’s products are precisely aligned with market demands, officially certified by the State for intellectual property rights, and ready to partner with financial institutions of all sizes — enabling comprehensive and sustainable growth.',
      },
      timeline: {
        title: 'Our Journey of Growth',
      },
      pillars: {
        eyebrow: 'Services',
        title: 'What You Can Find at Sova',
        description:
          'As a client of Sova, you can take advantage of the following services provided by our company:',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Customer Reviews',
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
      headingLines: ['Kiến tạo & Nâng tầm', 'thương hiệu'],
      description: {
        format: 'sanitized-html',
        html: '<p>Công ty TNHH Giải Pháp Công Nghệ Sova – Một trong những đơn vị thiết kế website hàng đầu hiện nay, tự hào mang đến cho khách hàng những sản phẩm, dịch vụ và trải nghiệm xuất sắc nhất.</p>',
        assetIds: [],
        sources: [{ file: 'gioi-thieu/index.html', line: 686 }],
      },
      imageId: 'asset-1a1c3b1f81',
      cta: { label: 'Sova Porfolio →', href: '/ho-so-nang-luc-eras-vietnam/' },
    },
    seo: {
      title: 'Giới thiệu - Công ty thiết kế website chuyên nghiệp | Sova',
      description: 'Trang chủ / Giới thiệu',
      canonicalPath: '/gioi-thieu/',
      imageId: 'asset-8318759646',
    },
    statIds: ['stat-clients-vi', 'stat-projects-vi', 'stat-members-vi', 'stat-years-vi'],
    goals: [
      {
        id: 'about-vi-goal-theo-kip-xu-huong',
        title: 'Theo kịp xu hướng',
        body: {
          format: 'sanitized-html',
          html: '<p>Việc nắm bắt xu hướng đổi mới là động lực giúp Sova trở nên mạnh mẽ và phát triển bền vững trong tương lai.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1183 }],
        },
        iconId: 'asset-067e286c8e',
      },
      {
        id: 'about-vi-goal-tim-kiem-giai-phap',
        title: 'Tìm kiếm giải pháp',
        body: {
          format: 'sanitized-html',
          html: '<p>Luôn tìm kiếm xu hướng công nghệ mới và thử thách bản thân tìm ra những giải pháp mạnh mẽ và bền vững nhất</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1265 }],
        },
        iconId: 'asset-3390bb323e',
      },
      {
        id: 'about-vi-goal-luon-lang-nghe-thau-hieu',
        title: 'Luôn lắng nghe & thấu hiểu',
        body: {
          format: 'sanitized-html',
          html: '<p>Chúng tôi luôn lắng nghe, phân tích và giải đáp cặn kẽ mọi câu hỏi của bạn để bạn có thể hiểu rõ. Và đưa ra các phương án xử lý tối ưu nhất để giải quyết vấn đề.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1347 }],
        },
        iconId: 'asset-b76c181761',
      },
      {
        id: 'about-vi-goal-thuc-hien-hoa',
        title: 'Thực hiện hoá',
        body: {
          format: 'sanitized-html',
          html: '<p>Để xây dựng thương hiệu Sova, điều quan trọng là phải thấu hiểu và trở thành “cánh tay phải” tin cậy, sử dụng công nghệ để hiện thực hóa mọi nhu cầu của khách hàng.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1429 }],
        },
        iconId: 'asset-a7a7c1b2e8',
      },
      {
        id: 'about-vi-goal-su-tin-cay',
        title: 'Sự tin cậy',
        body: {
          format: 'sanitized-html',
          html: '<p>Sova chú trọng xây dựng mối quan hệ lâu dài và bền vững với khách hàng, dựa trên nền tảng minh bạch trong mọi giao dịch và cam kết tin cậy, mang lại sự hài lòng và giá trị lâu dài cho khách hàng trong suốt quá trình hợp tác.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 1510 }],
        },
        iconId: 'asset-4df71020f1',
      },
      {
        id: 'about-vi-goal-thay-doi-tich-cuc',
        title: 'Thay đổi tích cực',
        body: {
          format: 'sanitized-html',
          html: '<p>Sự đổi mới liên tục theo hướng tích cực sẽ giúp Sova trở thành sự lựa chọn hàng đầu của khách hàng, khi mỗi dự án không chỉ mang lại giá trị cho doanh nghiệp mà còn truyền tải năng lượng mà công ty luôn theo đuổi.</p>',
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
          html: '<p>Chúng tôi luôn sẵn sàng tạo ra những sản phẩm và dịch vụ tối ưu nhất, mang lại hiệu quả cao cho hoạt động kinh doanh của khách hàng. Đồng thời, chúng tôi tạo sự khác biệt so với các đối thủ cạnh tranh nhờ vào chất lượng vượt trội và cam kết vững chắc về sản phẩm và dịch vụ.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2263 }],
        },
      },
      {
        id: 'about-vi-purpose-cam-ket',
        title: 'Cam kết',
        content: {
          format: 'sanitized-html',
          html: '<p>Cung cấp các sản phẩm phần mềm mang đến giải pháp toàn diện cho các tổ chức và doanh nghiệp, giúp tối ưu hóa quy trình làm việc và nâng cao năng suất công việc. Đồng thời, giải quyết nhiều khó khăn, tiết kiệm chi phí và gia tăng lợi nhuận.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2296 }],
        },
      },
      {
        id: 'about-vi-purpose-su-menh',
        title: 'Sứ mệnh',
        content: {
          format: 'sanitized-html',
          html: '<p>Trở thành công ty dẫn đầu với thế mạnh khác biệt trong các sản phẩm số và dịch vụ trải nghiệm số cho doanh nghiệp, đồng thời nâng cao năng lực cốt lõi, tinh thần trách nhiệm và khả năng sáng tạo.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2329 }],
        },
      },
      {
        id: 'about-vi-purpose-tam-nhin',
        title: 'Tầm nhìn',
        content: {
          format: 'sanitized-html',
          html: '<p>Sova hướng đến mục tiêu trở thành doanh nghiệp phát triển bền vững trong thời đại công nghệ mới, giúp các doanh nghiệp tiếp cận và phát triển nhanh chóng hơn trong quá trình chuyển đổi số.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2362 }],
        },
      },
    ],
    timeline: [
      {
        id: 'about-vi-timeline-2016',
        year: '2016',
        title: 'Gia nhập thị trường',
        body: {
          format: 'sanitized-html',
          html: '<p>Thành lập và gia nhập thị trường với tư cách là đơn vị chuyên cung cấp các giải pháp Marketing Facebook</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2519 }],
        },
      },
      {
        id: 'about-vi-timeline-2017',
        year: '2017',
        title: 'Ra mắt dịch vụ SEO',
        body: {
          format: 'sanitized-html',
          html: '<p>Thành lập và gia nhập thị trường với tư cách là đơn vị chuyên cung cấp các giải pháp Marketing Facebook</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2560 }],
        },
      },
      {
        id: 'about-vi-timeline-2018',
        year: '2018',
        title: 'Website, Branding',
        body: {
          format: 'sanitized-html',
          html: '<p>Thành lập và gia nhập thị trường với tư cách là đơn vị chuyên cung cấp các giải pháp Marketing Facebook</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2601 }],
        },
      },
      {
        id: 'about-vi-timeline-2019',
        year: '2019',
        title: 'Bắt kịp xu hướng',
        body: {
          format: 'sanitized-html',
          html: '<p>Thành lập và gia nhập thị trường với tư cách là đơn vị chuyên cung cấp các giải pháp Marketing Facebook</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2642 }],
        },
      },
      {
        id: 'about-vi-timeline-2020',
        year: '2020',
        title: 'Tăng trưởng bùng nổ thời giãn cách',
        body: {
          format: 'sanitized-html',
          html: '<p>Sản phẩm phù hợp với nhu cầu online, remote work, thương mại điện tử, nên doanh thu tăng gấp 3 lần.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2683 }],
        },
      },
      {
        id: 'about-vi-timeline-2021',
        year: '2021',
        title: 'Ra mắt sản phẩm mới',
        body: {
          format: 'sanitized-html',
          html: '<p>Bổ sung thêm dịch vụ E-mail theo tên miền nhằm cung cấp toàn diện hơn các sản phẩm cho khách hàng.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2724 }],
        },
      },
      {
        id: 'about-vi-timeline-2022',
        year: '2022',
        title: 'Đạt cột mốc 2000 khách hàng',
        body: {
          format: 'sanitized-html',
          html: '<p>Bắt đầu mở văn phòng đại diện chi nhánh tại Hồ Chính Minh</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2765 }],
        },
      },
      {
        id: 'about-vi-timeline-2023',
        year: '2023',
        title: 'Ra mắt sản phẩm mới',
        body: {
          format: 'sanitized-html',
          html: '<p>Bổ sung thêm dịch vụ thiết kế lập trình App Mobile nhằm theo kịp xu thế phát triển nền tảng di động.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2806 }],
        },
      },
      {
        id: 'about-vi-timeline-2024',
        year: '2024',
        title: 'Tích cực hoàn thiện bản thân',
        body: {
          format: 'sanitized-html',
          html: '<p>Cơ cấu tổ chức lại bộ máy nhân sự để có bước chuyển mình mạnh mẽ trong năm tiếp theo.</p>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 2853 }],
        },
      },
    ],
    capabilities: [
      {
        id: 'about-vi-capability-xay-dung-chien-luoc',
        title: 'XÂY DỰNG CHIẾN LƯỢC',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Hiểu rõ nhu cầu của khách hàng</li><li>Tối ưu hóa quy trình công việc</li><li>Cải tiến và nâng cấp sản phẩm liên tục</li><li>Tối ưu trải nghiệm người dùng (UX/UI)</li><li>Đảm bảo tính bảo mật và tuân thủ quy định</li><li>Hỗ trợ chuyển đổi số và tăng trưởng bền vững</li><li>Đo lường hiệu quả và phản hồi từ khách hàng</li><li>Tăng cường khả năng tùy biến và linh hoạt của sản phẩm</li><li>Định hướng đổi mới sáng tạo và công nghệ tiên tiến</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4150 }],
        },
      },
      {
        id: 'about-vi-capability-thiet-ke-trai-nghiem',
        title: 'THIẾT KẾ TRẢI NGHIỆM',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Tối ưu hóa quy trình làm việc và tương tác</li><li>Đảm bảo tính linh hoạt và tùy chỉnh</li><li>Tăng cường khả năng hợp tác và kết nối</li><li>Tối ưu hóa cho đa nền tảng và thiết bị</li><li>Tăng cường tính bảo mật và quyền riêng tư</li><li>Cải thiện tốc độ và hiệu suất hệ thống</li><li>Tích hợp các công cụ phân tích và báo cáo</li><li>Tạo ra trải nghiệm phù hợp với nhiều đối tượng người dùng</li><li>Tạo ra trải nghiệm người dùng dễ dàng và trực quan</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4522 }],
        },
      },
      {
        id: 'about-vi-capability-phat-trien-san-pham',
        title: 'PHÁT TRIỂN SẢN PHẨM',
        content: {
          format: 'sanitized-html',
          html: '<ul><li>Cải tiến và nâng cấp liên tục</li><li>Tích hợp công nghệ tiên tiến</li><li>Khả năng tùy chỉnh và linh hoạt</li><li>Tăng cường khả năng hợp tác và kết nối</li><li>Tối ưu hóa trải nghiệm người dùng (UX/UI)</li><li>Cải thiện tính bảo mật và tuân thủ quy định</li><li>Hỗ trợ chuyển đổi số và phát triển bền vững</li><li>Đáp ứng nhu cầu và yêu cầu của khách hàng doanh nghiệp</li><li>Cung cấp giải pháp tối ưu hóa quy trình công việc</li></ul>',
          assetIds: [],
          sources: [{ file: 'gioi-thieu/index.html', line: 4894 }],
        },
      },
    ],
    partnerIds: [],
    testimonialIds: [
      'testimonial-feedback-ten',
      'testimonial-feedback-dong-a',
      'testimonial-feedback-vinatex',
    ],
    sectionCopy: {
      achievements: {
        title: 'Thành tựu chúng tôi đạt được',
        description:
          'Đối với Sova xem mỗi dự án không chỉ là cơ hội tạo ra giá trị cho doanh nghiệp mà còn là sự đồng hành cùng doanh nghiệp, mang lại giá trị cộng hưởng cho khách hàng thông qua từng sản phẩm trải nghiệm số.',
      },
      goals: {
        eyebrow: 'Target',
        title: 'Mục tiêu của chúng tôi',
        description:
          'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,\nvới mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.\nMỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.',
        descriptionLines: [
          'Sova luôn nỗ lực không ngừng để nâng cao chất lượng dịch vụ,',
          'với mục tiêu trở thành sự lựa chọn hàng đầu của khách hàng.',
          'Mỗi dự án là một trải nghiệm và thử thách đối với chúng tôi.',
        ],
      },
      purpose: {
        title: 'Các sản phẩm của Sova',
        titleLines: ['Các sản phẩm của', 'Sova'],
        description:
          'Tất cả đều đang đáp ứng chính xác nhu cầu của thị trường, đã được cấp chứng chỉ sở hữu trí tuệ từ Nhà nước, và sẵn sàng đồng hành cùng các tổ chức doanh nghiệp lớn, vừa và nhỏ để phát triển một cách toàn diện và bền vững.',
      },
      timeline: {
        title: 'Hình thành và phát triển',
      },
      pillars: {
        eyebrow: 'Những dịch vụ',
        title: 'Có thể tìm thấy tại Sova',
        titleLines: ['Có thể tìm thấy tại', 'Sova'],
        description:
          'Khi trở thành khách hàng của Sova, bạn có thể sử dụng những dịch vụ do công ty cung cấp như sau',
      },
      testimonials: {
        eyebrow: 'Sova',
        title: 'Khách hàng nhận xét về chúng tôi',
        titleLines: ['Khách hàng nhận xét', 'về chúng tôi'],
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
