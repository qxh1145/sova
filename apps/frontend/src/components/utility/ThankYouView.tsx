import type { UtilityContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ThankYouViewProps {
  content: UtilityContent;
  demoLabel?: string;
}

export function ThankYouView({ content, demoLabel }: ThankYouViewProps) {
  return (
    <div id="content" role="main">
      <section className="section dark" id="section_430522107">
        <div className="section-bg fill">
          <img
            decoding="async"
            width="2560"
            height="1085"
            src="/wp-content/uploads/2024/02/scdscszdcs-scaled-1.webp"
            className="bg attachment-original size-original"
            alt=""
            loading="lazy"
          />
        </div>

        <div className="section-content relative">
          <div
            id="gap-490568669"
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />
          <div
            id="gap-1163282652"
            className="gap-element clearfix"
            style={{ display: 'block', height: 'auto' }}
          />

          <div className="row align-middle align-center" id="row-884857160">
            <div id="col-1741565368" className="col form_tke medium-7 small-12 large-7">
              <div className="col-inner text-center">
                {demoLabel ? <span className="wpcf7-demo-badge">{demoLabel}</span> : null}
                <RichText content={content.body} className="text" />
                <div className="success-animate">
                  <svg viewBox="0 0 52 52">
                    <circle className="circle" cx="26" cy="26" r="25" fill="none" />
                    <path className="check" fill="none" d="M14 27l7 7 16-16" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
