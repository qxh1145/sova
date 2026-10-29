// Seeded by scripts/import, then curated by hand. npm run import skips it unless IMPORT_OVERWRITE_CONTENT=1.
import type { Testimonial } from '@/types/content';

export const testimonials: Testimonial[] = [
  {
    id: 'testimonial-feedback-ten',
    locale: 'vi',
    person: 'Anh Bình',
    quote: {
      format: 'sanitized-html',
      html: 'Trước khi chọn Sova, tôi đã tìm hiểu không ít đơn vị thiết kế website. Điều khiến tôi quyết định hợp tác là đội ngũ ở đây thật sự khác biệt: tận tâm, tự tay lo mọi việc và luôn biết lắng nghe.',
      assetIds: [],
      sources: [{ file: 'index.html', line: 2234 }],
    },
    sources: [{ file: 'index.html', line: 2226 }],
    role: 'Tổng giám đốc',
  },
  {
    id: 'testimonial-feedback-dong-a',
    locale: 'vi',
    person: 'ĐỖ MỸ LINH',
    quote: {
      format: 'sanitized-html',
      html: 'Sau thời gian dài hợp tác, chúng tôi yên tâm giao cho Sova những dự án sản phẩm số có yêu cầu khắt khe về trải nghiệm người dùng, kể cả các dự án dành cho khách hàng và đối tác của chính mình.',
      assetIds: [],
      sources: [{ file: 'index.html', line: 2313 }],
    },
    sources: [{ file: 'index.html', line: 2305 }],
    role: 'Nhà sáng lập',
  },
  {
    id: 'testimonial-feedback-vinatex',
    locale: 'vi',
    person: 'Anh Đức Anh',
    quote: {
      format: 'sanitized-html',
      html: 'Lần đầu làm việc cùng Sova là dự án website của công ty, và hai bên phối hợp rất nhịp nhàng. Hài lòng với chất lượng dịch vụ, chúng tôi tiếp tục chọn Sova cho những dự án sau đó.',
      assetIds: [],
      sources: [{ file: 'index.html', line: 2392 }],
    },
    sources: [{ file: 'index.html', line: 2384 }],
    role: 'Giám đốc Trung tâm nghiên cứu sản phẩm',
  },
  {
    id: 'testimonial-feedback-ten',
    locale: 'en',
    person: 'Mr Binh',
    quote: {
      format: 'sanitized-html',
      html: 'Before choosing Sova, I looked into quite a few website design firms. What made me decide to work with them is how different this team truly is: dedicated, hands-on with everything, and always willing to listen.',
      assetIds: [],
      sources: [{ file: 'en/home/index.html', line: 2165 }],
    },
    sources: [{ file: 'en/home/index.html', line: 2157 }],
    role: 'CEO',
  },
  {
    id: 'testimonial-feedback-dong-a',
    locale: 'en',
    person: 'Ms Do My Linh',
    quote: {
      format: 'sanitized-html',
      html: 'After working together for a long time, we confidently entrust Sova with digital product projects that have strict user experience demands, including those for our own clients and partners.',
      assetIds: [],
      sources: [{ file: 'en/home/index.html', line: 2244 }],
    },
    sources: [{ file: 'en/home/index.html', line: 2236 }],
    role: 'Founder',
  },
  {
    id: 'testimonial-feedback-vinatex',
    locale: 'en',
    person: 'Mr Duc Anh',
    quote: {
      format: 'sanitized-html',
      html: 'Our first project with Sova was the company website, and both teams worked in perfect sync. Satisfied with the service quality, we chose Sova again for the projects that followed.',
      assetIds: [],
      sources: [{ file: 'en/home/index.html', line: 2323 }],
    },
    sources: [{ file: 'en/home/index.html', line: 2315 }],
    role: 'Director of Product Research Center',
  },
];
