import type { PaymentGuideContent } from '@/types/content';
import { PageHeroSimple } from '@/components/hero/PageHeroSimple';
import { RichText } from '@/components/ui/RichText';

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
}

export const PAYMENT_PRESETS: Record<string, PaymentPreset> = {
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
  },
};

export function getPaymentPreset(path: string): PaymentPreset {
  const normalized = path.endsWith('/') ? path : `${path}/`;
  const preset = PAYMENT_PRESETS[normalized];
  if (!preset) {
    throw new Error(`Missing payment preset for path: ${path}`);
  }
  return preset;
}

export interface PaymentGuideViewProps {
  guide: PaymentGuideContent;
}

export function PaymentGuideView({ guide }: PaymentGuideViewProps) {
  const preset = getPaymentPreset(guide.path);

  return (
    <div id="content" role="main">
      <PageHeroSimple
        title={guide.title}
        ids={preset.heroIds}
        headingClass="uppercase"
        emphasis="b"
      />
      <div className="row align-center" id={preset.guideIds.row}>
        <div id={preset.guideIds.col} className="col medium-11 small-12 large-10">
          <div className="col-inner box-shadow-2">
            <RichText content={guide.introduction} />
            <div className="row row-large align-middle" id={preset.guideIds.cardsRow}>
              {guide.accounts.map((account, index) => {
                const card = preset.cards[index] ?? {
                  cardCol: `${preset.guideIds.cardsRow}-col-${index + 1}`,
                  cardRow: `${preset.guideIds.cardsRow}-row-${index + 1}`,
                  textCol: `${preset.guideIds.cardsRow}-text-${index + 1}`,
                  qrCol: `${preset.guideIds.cardsRow}-qr-${index + 1}`,
                  imageId: `image_${preset.guideIds.cardsRow}_${index + 1}`,
                };

                return (
                  <div key={account.id} id={card.cardCol} className="col small-12 large-12">
                    <div className="col-inner">
                      <div
                        className="is-border is-dashed"
                        style={{
                          borderColor: 'rgb(80, 214, 172)',
                          borderRadius: '10px',
                          borderWidth: '1px 1px 1px 1',
                        }}
                      />
                      <div className="row row-collapse align-middle" id={card.cardRow}>
                        <div id={card.textCol} className="col medium-7 small-12 large-7">
                          <div className="col-inner">
                            <p>
                              <span data-text-color="secondary">
                                <strong>{account.bank}</strong>
                              </span>
                            </p>
                            <p>
                              {guide.labels.accountNumber}{' '}
                              <strong>{account.accountNumber}</strong>
                              <br />
                              {guide.labels.holder}{' '}
                              <strong>{account.holder}</strong>
                            </p>
                          </div>
                        </div>
                        <div id={card.qrCol} className="col medium-2 small-12 large-2">
                          <div className="col-inner">
                            <div className="img has-hover x md-x lg-x y md-y lg-y" id={card.imageId}>
                              <div className="img-inner dark">
                                <div
                                  data-media-status="missing"
                                  style={{ width: '100%', aspectRatio: '1/1' }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <RichText content={guide.instructions} />
          </div>
        </div>
      </div>
    </div>
  );
}
