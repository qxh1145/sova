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
    mobileMenu: {
      trigger: 'Menu',
      close: 'Đóng',
      tagline: 'Thấu hiểu, đồng hành và thiết kế trải nghiệm digital toàn diện',
      menuHeading: 'Menu',
      contactHeading: 'Liên hệ',
      toggleSubmenu: 'Mở rộng menu con',
    },
    consult: {
      heading: 'Đăng ký',
      placeholder: 'Số điện thoại',
      submit: 'Gửi đi  →',
      submitting: 'Đang gửi...',
      required: 'Vui lòng nhập số điện thoại',
      invalid: 'Số điện thoại không hợp lệ',
      success: 'Đã ghi nhận yêu cầu trong bản demo.',
      error: 'Đã có lỗi xảy ra trong quá trình gửi. Vui lòng thử lại.',
      demoBadge: 'Bản demo — chưa gửi thông tin',
      note: 'Đăng ký để nhận những thông tin mới nhất về các chương trình ưu đãi của {{site.companyName}}',
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
    mobileMenu: {
      trigger: 'Menu',
      close: 'Close',
      tagline: 'Understand, accompany, and design a comprehensive digital experience.',
      menuHeading: 'Menu',
      contactHeading: 'Contact',
      toggleSubmenu: 'Toggle submenu',
    },
    consult: {
      heading: 'Register',
      placeholder: 'Phone Number',
      submit: 'Submit →',
      submitting: 'Sending...',
      required: 'Please enter your phone number',
      invalid: 'Invalid phone number',
      success: 'Request recorded in demo mode.',
      error: 'An error occurred while sending. Please try again.',
      demoBadge: 'Demo — no data was sent',
      note: "Register to receive the latest information about {{site.companyName}}'s promotional programs",
    },
  },
];
