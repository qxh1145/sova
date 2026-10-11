import type { ReactNode } from 'react';
import type { Locale } from '@/types/content';

export interface RootDocumentProps {
  locale: Locale;
  children: ReactNode;
  bodyClassName?: string;
}

export function RootDocument({ locale, children, bodyClassName }: RootDocumentProps) {
  return (
    <html lang={locale === 'en' ? 'en-US' : 'vi'}>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
