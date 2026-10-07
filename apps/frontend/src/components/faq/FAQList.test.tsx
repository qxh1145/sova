import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { FAQList } from './FAQList';
import type { FAQ } from '@/types/content';

describe('FAQList component', () => {
  const duplicateFaqs: FAQ[] = [
    {
      id: 'faq-dup-1',
      locale: 'en',
      question: 'First Question',
      answer: {
        format: 'sanitized-html',
        html: '<p>Answer one</p>',
        assetIds: [],
        sources: [],
      },
      topicIds: [],
      serviceKeys: [],
      sources: [],
    },
    {
      id: 'faq-dup-1',
      locale: 'en',
      question: 'Duplicate Question Placed Again',
      answer: {
        format: 'sanitized-html',
        html: '<p>Answer two</p>',
        assetIds: [],
        sources: [],
      },
      topicIds: [],
      serviceKeys: [],
      sources: [],
    },
    {
      id: 'faq-other-2',
      locale: 'en',
      question: 'Third Question',
      answer: {
        format: 'sanitized-html',
        html: '<p>Answer three</p>',
        assetIds: [],
        sources: [],
      },
      topicIds: [],
      serviceKeys: [],
      sources: [],
    },
  ];

  it('renders separate items when duplicate faq ids exist', () => {
    const html = renderToStaticMarkup(
      <FAQList
        faqs={duplicateFaqs}
        type="single"
        defaultOpen="first"
        labels={{ toggle: 'Toggle answer' }}
      />,
    );

    const root = parse(html);
    const triggers = root.querySelectorAll('button');
    expect(triggers.length).toBe(3);

    const questions = triggers.map((t) => t.text.trim());
    expect(questions[0]).toContain('First Question');
    expect(questions[1]).toContain('Duplicate Question Placed Again');
    expect(questions[2]).toContain('Third Question');

    const items = root.querySelectorAll('.accordion-item');
    expect(items.length).toBe(3);
    expect(items[0].getAttribute('id')).toBe('accordion-faq-dup-1-0');
    expect(items[1].getAttribute('id')).toBe('accordion-faq-dup-1-1');
    expect(items[2].getAttribute('id')).toBe('accordion-faq-other-2-2');

    // First item trigger has active class
    const firstTrigger = items[0].querySelector('.accordion-title');
    expect(firstTrigger?.classList.contains('active')).toBe(true);
    // Second item trigger is not active
    const secondTrigger = items[1].querySelector('.accordion-title');
    expect(secondTrigger?.classList.contains('active')).toBe(false);
  });
});
