import type { UtilityContent } from '@/types/content';
import { ProjectDeliveryTerms } from './ProjectDeliveryTerms';

export interface ProjectContentProps {
  terms: UtilityContent | null;
  displayDate?: string;
}

export function ProjectContent({ terms, displayDate }: ProjectContentProps) {
  const isTerms2 = terms?.id === 'project-terms-2';

  return (
    <div className="col-inner">
      <h3>Thông tin chi tiết</h3> {/* business-text-ok: source section title */}
      <ProjectDeliveryTerms terms={terms} />
      {displayDate ? (
        <div className="qodef-portfolio-info">
          <div className="qodef-e qodef-info--date">
            {isTerms2 ? (
              <h3 className="qodef-e-title">DATE: {displayDate}</h3> /* business-text-ok: source date prefix */
            ) : (
              <>
                <p className="qodef-e-title">DATE:</p> {/* business-text-ok: source date label */}
                <p className="entry-date updated">{displayDate}</p>
              </>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
