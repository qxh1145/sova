import type { Locale } from '@/types/content';

export interface ContactPreset {
  hero: {
    sectionId: string;
    rowId: string;
    colId: string;
    titleId: string;
    breadcrumbId: string;
  };
  main: {
    sectionId: string;
    headingRowId: string;
    headingColId: string;
    headingTextId: string;
    imageCardsRowId: string;
    imageCards: {
      zalo: { colId: string; imageId: string };
      hotline: { colId: string; imageId: string };
      messenger: { colId: string; imageId: string };
    };
    gapHeadingToInfoId: string;
    infoRowId: string;
    infoColId: string;
    gapTitleToIntroId: string;
    gapAddressToPhoneId: string;
    gapPhoneToEmailId: string;
    formColId: string;
  };
}

export const CONTACT_PRESETS: Record<Locale, ContactPreset> = {
  vi: {
    hero: {
      sectionId: 'section_1877783735',
      rowId: 'row-1690625502',
      colId: 'col-1780890689',
      titleId: 'text-2417329742',
      breadcrumbId: 'text-2894170611',
    },
    main: {
      sectionId: 'section_1202983847',
      headingRowId: 'row-1653782351',
      headingColId: 'col-1050069992',
      headingTextId: 'text-991251802',
      imageCardsRowId: 'row-208555365',
      imageCards: {
        zalo: { colId: 'col-64232818', imageId: 'image_1785788582' },
        hotline: { colId: 'col-1985906756', imageId: 'image_1922311441' },
        messenger: { colId: 'col-1074648174', imageId: 'image_1559231223' },
      },
      gapHeadingToInfoId: 'gap-634918825',
      infoRowId: 'row-2044034017',
      infoColId: 'col-1303957059',
      gapTitleToIntroId: 'gap-1029487218',
      gapAddressToPhoneId: 'gap-625076958',
      gapPhoneToEmailId: 'gap-3106780',
      formColId: 'col-525100765',
    },
  },
  en: {
    hero: {
      sectionId: 'section_2117830475',
      rowId: 'row-1348636984',
      colId: 'col-1977980038',
      titleId: 'text-758195946',
      breadcrumbId: 'text-602092353',
    },
    main: {
      sectionId: 'section_160314766',
      headingRowId: 'row-767195573',
      headingColId: 'col-791017317',
      headingTextId: 'text-3499194979',
      imageCardsRowId: 'row-1894374296',
      imageCards: {
        zalo: { colId: 'col-1483532564', imageId: 'image_233434064' },
        hotline: { colId: 'col-519329382', imageId: 'image_1432476685' },
        messenger: { colId: 'col-335882097', imageId: 'image_729738737' },
      },
      gapHeadingToInfoId: 'gap-252756250',
      infoRowId: 'row-1816370760',
      infoColId: 'col-670041440',
      gapTitleToIntroId: 'gap-1449019626',
      gapAddressToPhoneId: 'gap-1136831720',
      gapPhoneToEmailId: 'gap-1359534738',
      formColId: 'col-812295511',
    },
  },
};

export function getContactPreset(locale: Locale): ContactPreset {
  return CONTACT_PRESETS[locale];
}
