import type { ShellContent } from '@/types/content';

export const shellContent: ShellContent[] = [
  {
    locale: 'vi',
    headerCta: {
      label: 'Liên hệ',
      routeId: 'route-lien-he',
    },
    footerCta: {
      headingLines: ['Hiện thực hoá', 'ý tưởng của bạn'],
      targetRouteId: 'route-lien-he',
    },
    copyright: 'Copyright © 2026 {{site.companyName}} | All Rights Reserved.',
    themeCredit: 'Copyright 2026 © Flatsome Theme',
    languageLabels: {
      vi: 'VI',
      en: 'EN',
    },
  },
  {
    locale: 'en',
    headerCta: {
      label: 'Contact Us',
      routeId: 'route-en--contact-us',
    },
    footerCta: {
      headingLines: ['Realize your amazing digital experience!'],
      targetRouteId: 'route-en--contact-us',
    },
    copyright: 'Copyright © 2026 {{site.companyName}} | All Rights Reserved.',
    themeCredit: 'Copyright 2026 © Flatsome Theme',
    languageLabels: {
      vi: 'VI',
      en: 'EN',
    },
  },
];
