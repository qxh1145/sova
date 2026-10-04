import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import type { RichContent } from '@/types/content';
import { RichText } from './RichText';

describe('RichText', () => {
  it('throws when format is not sanitized-html', () => {
    const invalid = {
      format: 'raw-html',
      html: '<p>bad</p>',
      assetIds: [],
      sources: [],
    } as unknown as RichContent;

    expect(() => RichText({ content: invalid })).toThrow(
      'Unsupported RichContent format: raw-html',
    );
  });

  it('renders sanitized HTML correctly', () => {
    const valid: RichContent = {
      format: 'sanitized-html',
      html: '<p>Safe content</p>',
      assetIds: [],
      sources: [],
    };
    const html = renderToStaticMarkup(
      createElement(RichText, { content: valid, className: 'my-rich' }),
    );
    expect(html).toBe('<div class="my-rich"><p>Safe content</p></div>');
  });
});
