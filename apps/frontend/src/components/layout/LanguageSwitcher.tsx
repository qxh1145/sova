'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { Locale } from '@/types/content';

export interface LanguageSwitcherProps {
  locale: Locale;
  labels: Record<Locale, string>;
  counterparts: Record<string, string>;
}

export function LanguageSwitcher({ locale, labels, counterparts }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const normalized = pathname?.endsWith('/') ? pathname : `${pathname}/`;
  const counterpartPath = pathname
    ? (counterparts[pathname] ?? counterparts[normalized])
    : undefined;

  const currentLabel = labels[locale];
  const otherLocale: Locale = locale === 'vi' ? 'en' : 'vi';
  const otherLabel = labels[otherLocale];

  if (!counterpartPath) {
    return (
      <div className="lang-switcher-inline">
        <span className="current-lang">{currentLabel}</span>
      </div>
    );
  }

  return (
    <div className="lang-switcher-inline">
      {locale === 'vi' ? (
        <>
          <span className="current-lang">{currentLabel}</span>
          {' | '}
          <Link href={counterpartPath}>{otherLabel}</Link>
        </>
      ) : (
        <>
          <Link href={counterpartPath}>{otherLabel}</Link>
          {' | '}
          <span className="current-lang">{currentLabel}</span>
        </>
      )}
    </div>
  );
}
