/* eslint-disable @next/next/no-img-element */
import type { AssetRef, Testimonial } from '@/types/content';

export interface TestimonialSlideIds {
  row: string;
  col?: string;
  ndKh?: string;
  line?: string;
  iconBoxText?: string;
}

export interface TestimonialCardProps {
  testimonial: Testimonial;
  avatar?: AssetRef;
  lineArt: AssetRef;
  ids?: TestimonialSlideIds;
}

export function TestimonialCard({
  testimonial,
  avatar,
  lineArt,
  ids,
}: TestimonialCardProps) {
  return (
    <div
      className="row row-collapse row-full-width"
      id={ids?.row ?? `row-${testimonial.id}`}
    >
      <div id={ids?.col} className="col small-12 large-12">
        <div className="col-inner">
          <div
            id={ids?.ndKh}
            className="text nd-kh"
            dangerouslySetInnerHTML={{ __html: testimonial.quote.html }}
          />
          <div id={ids?.line} className="text">
            <p style={{ marginBottom: 0 }}>
              <img
                decoding="async"
                className="alignnone wp-image-3103 size-full"
                role="img"
                src={lineArt.src}
                alt={lineArt.alt}
                width={lineArt.width}
                height={lineArt.height}
              />
            </p>
          </div>
          <div className="icon-box featured-box icon-kh icon-box-left text-left">
            {avatar && (
              <div className="icon-box-img" style={{ width: '106px' }}>
                <div className="icon">
                  <div className="icon-inner">
                    <img
                      decoding="async"
                      width={avatar.width ?? 400}
                      height={avatar.height ?? 400}
                      src={avatar.src}
                      className="attachment-medium size-medium"
                      alt={avatar.alt ?? ''}
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="icon-box-text last-reset">
              <div id={ids?.iconBoxText} className="text">
                <h3>
                  <strong>{testimonial.person}</strong>
                </h3>
                {testimonial.role && (
                  <p style={{ color: '#9e9e9e' }}>{testimonial.role}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
