import type { UtilityContent } from '@/types/content';
import { RichText } from '@/components/ui/RichText';

export interface ProjectDeliveryTermsProps {
  terms: UtilityContent | null;
}

export function ProjectDeliveryTerms({ terms }: ProjectDeliveryTermsProps) {
  if (!terms) return null;
  return <RichText content={terms.body} className="qodef-e qodef-portfolio-content" />;
}
