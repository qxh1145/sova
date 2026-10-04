import type { ReactNode } from 'react';
import type { Locale } from '@/types/content';

export interface RootDocumentProps {
  locale: Locale;
  children: ReactNode;
}

export function RootDocument({ locale, children }: RootDocumentProps) {
  return (
    <html lang={locale === 'en' ? 'en-US' : 'vi'}>
      <body>{children}</body>
    </html>
  );
}
