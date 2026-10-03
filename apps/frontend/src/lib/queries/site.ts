import { repository } from '@/lib/repositories';
import type { Locale, SiteSettings } from '@/types/content';

export function getSiteSettings(locale: Locale): Promise<SiteSettings> {
  return repository.getSiteSettings(locale);
}
