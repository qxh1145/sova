import type { Locale } from '@/types/content';

export interface FooterCtaIds {
  section: string;
  gap: string;
  row: string;
  colLeft: string;
  text: string;
  colRight: string;
}

export const FOOTER_CTA_IDS: Record<Locale, FooterCtaIds> = {
  vi: {
    section: 'section_539620154',
    gap: 'gap-701964121',
    row: 'row-2042733711',
    colLeft: 'col-395461297',
    text: 'text-43480091',
    colRight: 'col-1563444768',
  },
  en: {
    section: 'section_1016084764',
    gap: 'gap-864777220',
    row: 'row-529871960',
    colLeft: 'col-1527838528',
    text: 'text-3886040369',
    colRight: 'col-1517189639',
  },
};
