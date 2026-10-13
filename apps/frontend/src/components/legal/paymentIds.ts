export interface PaymentCardPreset {
  cardCol: string;
  cardRow: string;
  textCol: string;
  qrCol: string;
  imageId: string;
}

export interface PaymentPreset {
  heroIds: {
    banner: string;
    textBox: string;
  };
  guideIds: {
    row: string;
    col: string;
    cardsRow: string;
  };
  cards: PaymentCardPreset[];
  walletIds: {
    row: string;
    introCol: string;
    qrCol: string;
    imageId: string;
    stepsCol: string;
  };
}

export type PaymentGuidePath = '/huong-dan-thanh-toan/' | '/en/payment-guide/';

const PAYMENT_PRESETS: Record<PaymentGuidePath, PaymentPreset> = {
  '/huong-dan-thanh-toan/': {
    heroIds: {
      banner: 'banner-617005671',
      textBox: 'text-box-606738285',
    },
    guideIds: {
      row: 'row-663367248',
      col: 'col-1690944737',
      cardsRow: 'row-112823104',
    },
    cards: [
      {
        cardCol: 'col-1192808074',
        cardRow: 'row-1619249247',
        textCol: 'col-605549348',
        qrCol: 'col-584102200',
        imageId: 'image_2118889429',
      },
      {
        cardCol: 'col-1961648322',
        cardRow: 'row-833258171',
        textCol: 'col-2023991759',
        qrCol: 'col-1257827365',
        imageId: 'image_96051783',
      },
    ],
    walletIds: {
      row: 'row-1060875105',
      introCol: 'col-1331101806',
      qrCol: 'col-656832615',
      imageId: 'image_482825465',
      stepsCol: 'col-605154894',
    },
  },
  '/en/payment-guide/': {
    heroIds: {
      banner: 'banner-2119527039',
      textBox: 'text-box-538624085',
    },
    guideIds: {
      row: 'row-1477327995',
      col: 'col-712197199',
      cardsRow: 'row-1267678346',
    },
    cards: [
      {
        cardCol: 'col-215159017',
        cardRow: 'row-1966881737',
        textCol: 'col-779567462',
        qrCol: 'col-1779987263',
        imageId: 'image_1118197476',
      },
      {
        cardCol: 'col-1873065842',
        cardRow: 'row-1110203423',
        textCol: 'col-2104812277',
        qrCol: 'col-302071095',
        imageId: 'image_945316809',
      },
    ],
    walletIds: {
      row: 'row-1538564195',
      introCol: 'col-332006230',
      qrCol: 'col-1292489598',
      imageId: 'image_1227812246',
      stepsCol: 'col-553119844',
    },
  },
};

export function getPaymentPreset(path: string): PaymentPreset {
  const preset = PAYMENT_PRESETS[path as PaymentGuidePath];
  if (!preset) {
    throw new Error(`Missing payment preset for path: ${path}`);
  }
  return preset;
}
