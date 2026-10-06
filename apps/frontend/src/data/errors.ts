export interface ErrorCopy {
  title: string;
  description: string;
  retry: string;
}

export const homeErrors: Record<'vi' | 'en', ErrorCopy> = {
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
