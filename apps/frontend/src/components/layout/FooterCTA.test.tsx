import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { FooterCTA } from './FooterCTA';

describe('FooterCTA', () => {
  it('renders arrow link a.plain with data-pointer="cta" and heading link without it', () => {
    const html = renderToStaticMarkup(
      <FooterCTA
        headingLines={['Bắt đầu dự án', 'cùng Sova']}
        targetHref="/lien-he/"
        locale="vi"
      />,
    );
    const root = parse(html);

    const arrowLink = root.querySelector('a.plain');
    expect(arrowLink).not.toBeNull();
    expect(arrowLink?.getAttribute('data-pointer')).toBe('cta');

    const headingLink = root.querySelector('h1 a');
    expect(headingLink).not.toBeNull();
    expect(headingLink?.getAttribute('data-pointer')).toBeFalsy();
  });
});
