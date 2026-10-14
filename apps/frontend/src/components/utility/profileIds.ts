import type { Locale } from '@/types/content';

export interface ProfilePreset {
  bannerId: string;
  textBoxId: string;
  gapId: string;
  rowId: string;
  colId: string;
  colClass: string;
  textId: string;
}

export function getProfilePreset(locale: Locale): ProfilePreset {
  const PROFILE_PRESETS: Record<Locale, ProfilePreset> = {
    vi: {
      bannerId: 'banner-1559052784',
      textBoxId: 'text-box-205491153',
      gapId: 'gap-1482944867',
      rowId: 'row-143567771',
      colId: 'col-1684974797',
      colClass: 'col medium-7 small-12 large-7',
      textId: 'text-1019941480',
    },
    en: {
      bannerId: 'banner-151127649',
      textBoxId: 'text-box-137215681',
      gapId: 'gap-430848395',
      rowId: 'row-14294543',
      colId: 'col-20498190',
      colClass: 'col medium-6 small-12 large-6',
      textId: 'text-3247181948',
    },
  };
  return PROFILE_PRESETS[locale];
}
