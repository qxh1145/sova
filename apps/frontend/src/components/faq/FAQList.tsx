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
  const defaultValue = defaultOpen === 'first' && faqs.length > 0 ? [`${faqs[0].id}-0`] : [];

  return (
    <Accordion type={type} defaultValue={defaultValue} className={className}>
      {faqs.map((faq, index) => {
        const itemKey = `${faq.id}-${index}`;
        return (
          <AccordionItem
            key={itemKey}
            value={itemKey}
            title={faq.question}
            labels={labels}
          >
            <RichText content={faq.answer} />
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}
