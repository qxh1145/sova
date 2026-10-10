import type { Locale } from '@/types/content';

export interface FAQPreset {
  heroIds: {
    banner: string;
    textBox: string;
  };
  sectionId: string;
  rowId: string;
  colId: string;
}

export const FAQ_PRESETS: Record<Locale, FAQPreset> = {
  vi: {
    heroIds: {
      banner: 'banner-698016762',
      textBox: 'text-box-1453721807',
    },
    sectionId: 'section_1603437353',
    rowId: 'row-133155175',
    colId: 'col-564510526',
  },
  en: {
    heroIds: {
      banner: 'banner-941895101',
      textBox: 'text-box-1414960542',
    },
    sectionId: 'section_793933155',
    rowId: 'row-1068303864',
    colId: 'col-751981030',
  },
};

export function getFAQPreset(locale: Locale): FAQPreset {
  return FAQ_PRESETS[locale];
}

/**
 * Derives tab slug from topic label matching source Flatsome IDs.
 * Spaces are replaced by '-', preserving lowercase and other characters (e.g. 'ui/ux,-branding-design').
 */
export function topicSlug(label: string): string {
  return label.toLowerCase().replace(/\s+/g, '-');
}
