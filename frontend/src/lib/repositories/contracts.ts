import type { Locale, SiteSettings } from '@/types/content';

export interface ContentRepository {
  getSiteSettings(locale: Locale): Promise<SiteSettings>;
}
