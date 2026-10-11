import type { PaymentGuideContent } from '@/types/content';
import { PageHeroSimple } from '@/components/hero/PageHeroSimple';
import { RichText } from '@/components/ui/RichText';
import { getPaymentPreset } from './paymentIds';

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
                const card = preset.cards[index];
                if (!card) {
                  throw new Error(`Missing payment card preset for account index: ${index}`);
                }

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
                              {guide.labels.accountNumber} <strong>{account.accountNumber}</strong>
                              <br />
                              {guide.labels.holder} <strong>{account.holder}</strong>
                            </p>
                          </div>
                        </div>
                        <div id={card.qrCol} className="col medium-2 small-12 large-2">
                          <div className="col-inner">
                            <div
                              className="img has-hover x md-x lg-x y md-y lg-y"
                              id={card.imageId}
                            >
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
            <div className="row row-large align-middle" id={preset.walletIds.row}>
              <div id={preset.walletIds.introCol} className="col small-12 large-12 small-col-first">
                <div className="col-inner">
                  <RichText content={guide.wallet.intro} />
                </div>
              </div>
              <div id={preset.walletIds.qrCol} className="col medium-4 small-12 large-4">
                <div className="col-inner">
                  <div
                    className="img has-hover x md-x lg-x y md-y lg-y"
                    id={preset.walletIds.imageId}
                  >
                    <div className="img-inner dark">
                      <div
                        data-media-status="missing"
                        style={{ width: '100%', aspectRatio: '344/349' }}
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div
                id={preset.walletIds.stepsCol}
                className="col medium-6 small-12 large-6 small-col-first"
              >
                <div className="col-inner">
                  <RichText content={guide.wallet.steps} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
