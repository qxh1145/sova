import type { ErrorCopy, Locale } from '@/types/content';

export const notFoundCopy: Record<Locale, { title: string; description: string; home: string }> = {
  vi: {
    title: 'Không tìm thấy trang',
    description: 'Trang bạn tìm không tồn tại hoặc đã được chuyển sang địa chỉ khác.',
    home: 'Về trang chủ',
  },
  en: {
    title: 'Page not found',
    description: 'The page you are looking for does not exist or has moved.',
    home: 'Back to home',
  },
};

export const pageErrors: Record<Locale, ErrorCopy> = {
  vi: {
    title: 'Đã có lỗi xảy ra',
    description: 'Vui lòng thử lại sau.',
    retry: 'Thử lại',
  },
  en: {
    title: 'An error occurred',
    description: 'Please try again later.',
    retry: 'Try again',
  },
};
