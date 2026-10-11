import type { LegalPage } from '@/types/content';
import { PageHeroSimple } from '@/components/hero/PageHeroSimple';
import { RichText } from '@/components/ui/RichText';
import { getLegalPreset } from './legalIds';

export interface LegalViewProps {
  page: LegalPage;
}

export function LegalView({ page }: LegalViewProps) {
  const preset = getLegalPreset(page.path);

  return (
    <div id="content" role="main">
      <PageHeroSimple
        title={page.title}
        ids={preset.heroIds}
        headingClass={preset.headingClass}
        emphasis={preset.emphasis}
        headingWrap={preset.headingWrap}
      />
      <div className="row" id={preset.bodyIds.row}>
        <div id={preset.bodyIds.col} className="col small-12 large-12">
          <RichText content={page.body} className="col-inner" />
        </div>
      </div>
    </div>
  );
}
