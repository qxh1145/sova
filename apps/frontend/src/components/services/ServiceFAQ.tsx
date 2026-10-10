import type { Locale, FAQ, SectionCopy } from '@/types/content';
import { FAQList } from '@/components/faq/FAQList';

export interface ServiceFAQIds {
  section: string;
  gap?: string;
  headingRow: string;
  headingCol: string;
  eyebrowText?: string;
  titleText: string;
  listRow: string;
  listCol: string;
}

export interface ServiceFAQProps {
  faqs: FAQ[];
  copy?: SectionCopy;
  ids: ServiceFAQIds;
  locale: Locale;
}

export function ServiceFAQ({ faqs, copy, ids, locale }: ServiceFAQProps) {
  if (faqs.length === 0 || !copy) return null;

  return (
    <section className="section" id={ids.section}>
      <div className="section-bg fill" />
      <div className="section-content relative">
        {ids.gap && (
          <div
            id={ids.gap}
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />
        )}
        <div className="row" id={ids.headingRow}>
          <div id={ids.headingCol} className="col small-12 large-12">
            <div className="col-inner">
              {copy.eyebrow && (
                <div id={ids.eyebrowText} className="text">
                  <p>
                    <strong>
                      <span style={{ color: '#0065df' }}>{copy.eyebrow}</span>
                    </strong>
                    <br />
                  </p>
                </div>
              )}
              <div id={ids.titleText} className="text">
                <h2>{copy.title}</h2>
              </div>
              <div className="text-center">
                <div
                  className="is-divider divider clearfix"
                  style={{ maxWidth: 133, height: 2, backgroundColor: 'rgb(0, 101, 223)' }}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="row" id={ids.listRow}>
          <div id={ids.listCol} className="col small-12 large-12">
            <div className="col-inner">
              <FAQList
                faqs={faqs}
                type="single"
                defaultOpen="first"
                className="ac-luutru"
                labels={{ toggle: locale === 'en' ? 'Toggle answer' : 'Mở rộng câu trả lời' }} // business-text-ok: accordion toggle label
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
