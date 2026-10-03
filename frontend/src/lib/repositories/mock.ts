import { siteSettings } from '@/data/site';
import type { ContentRepository } from './contracts';

export const mockRepository: ContentRepository = {
  async getSiteSettings(locale) {
    const record = siteSettings.find((s) => s.locale === locale);
    if (!record) throw new Error(`No SiteSettings for locale "${locale}"`);
    return record;
  },
};
