import type { FAQ } from '@/types/content';
import { Accordion, AccordionItem, type AccordionLabels } from '@/components/ui/Accordion';
import { RichText } from '@/components/ui/RichText';

export type FAQListLabels = AccordionLabels;

export interface FAQListProps {
  faqs: FAQ[];
  type: 'single' | 'multiple';
  defaultOpen: 'first' | 'none';
  className?: string;
  labels: FAQListLabels;
}

export function FAQList({
  faqs,
  type,
  defaultOpen,
  className,
  labels,
}: FAQListProps) {
  const defaultValue = defaultOpen === 'first' && faqs.length > 0 ? [faqs[0].id] : [];

  return (
    <Accordion type={type} defaultValue={defaultValue} className={className}>
      {faqs.map((faq) => (
        <AccordionItem
          key={faq.id}
          value={faq.id}
          title={faq.question}
          labels={labels}
        >
          <RichText content={faq.answer} />
        </AccordionItem>
      ))}
    </Accordion>
  );
}
