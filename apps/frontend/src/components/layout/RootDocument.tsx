import type { ReactNode } from 'react';
import { Be_Vietnam_Pro } from 'next/font/google';
import type { Locale } from '@/types/content';

// Self-hosted at build time; exposed as --font-be-vietnam-pro for --font-body in tokens.css.
const beVietnamPro = Be_Vietnam_Pro({
  weight: ['300', '400', '500', '600', '700', '800'],
  subsets: ['latin', 'vietnamese'],
  display: 'swap',
  variable: '--font-be-vietnam-pro',
});

export interface RootDocumentProps {
  locale: Locale;
  children: ReactNode;
  bodyClassName?: string;
}

export function RootDocument({ locale, children, bodyClassName }: RootDocumentProps) {
  return (
    <html lang={locale === 'en' ? 'en-US' : 'vi'} className={beVietnamPro.variable}>
      <body className={bodyClassName}>{children}</body>
    </html>
  );
}
