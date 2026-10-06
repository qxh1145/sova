import type { ErrorCopy, Locale } from '@/types/content';

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
