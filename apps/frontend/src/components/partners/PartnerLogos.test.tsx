import { describe, expect, it } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { parse } from 'node-html-parser';
import { PartnerLogos } from './PartnerLogos';
import type { AssetRef, Partner } from '@/types/content';

describe('PartnerLogos component', () => {
  const mockPartners: Partner[] = [
    {
      id: 'partner-1',
      name: 'Partner One',
      logoId: 'asset-logo-1',
      sources: [],
    },
    {
      id: 'partner-2',
      name: 'Partner Two',
      logoId: 'asset-logo-2',
      sources: [],
    },
  ];

  const mockAssets: AssetRef[] = [
    {
      id: 'asset-logo-1',
      src: '/wp-content/uploads/2025/04/logo-1.png',
      alt: '',
      width: 480,
      height: 325,
      kind: 'image',
      status: 'local',
      sources: [],
    },
    {
      id: 'asset-logo-2',
      src: '/wp-content/uploads/2025/04/logo-2.png',
      alt: '',
      width: 480,
      height: 325,
      kind: 'image',
      status: 'local',
      sources: [],
    },
  ];

  it('renders logos in order with alt="", correct src, width, height, and decoding="async"', () => {
    const html = renderToStaticMarkup(
      <PartnerLogos partners={mockPartners} assets={mockAssets} />,
    );
    const root = parse(html);

    const cols = root.querySelectorAll('.gallery-col.col');
    expect(cols).toHaveLength(2);

    const imgs = root.querySelectorAll('img.gal-doitac');
    expect(imgs).toHaveLength(2);

    expect(imgs[0].getAttribute('src')).toBe('/wp-content/uploads/2025/04/logo-1.png');
    expect(imgs[0].getAttribute('alt')).toBe('');
    expect(imgs[0].getAttribute('width')).toBe('480');
    expect(imgs[0].getAttribute('height')).toBe('325');
    expect(imgs[0].getAttribute('decoding')).toBe('async');

    expect(imgs[1].getAttribute('src')).toBe('/wp-content/uploads/2025/04/logo-2.png');
    expect(imgs[1].getAttribute('alt')).toBe('');
    expect(imgs[1].getAttribute('width')).toBe('480');
    expect(imgs[1].getAttribute('height')).toBe('325');
    expect(imgs[1].getAttribute('decoding')).toBe('async');

    // Partner names never reach the DOM
    expect(html).not.toContain('Partner One');
    expect(html).not.toContain('Partner Two');
  });

  it('throws loudly when a partner logo asset is missing', () => {
    expect(() => {
      renderToStaticMarkup(
        <PartnerLogos
          partners={mockPartners}
          assets={[mockAssets[0]]} // missing asset-logo-2
        />,
      );
    }).toThrowError(/asset-logo-2/);
  });

  it('renders empty row when partners array is empty', () => {
    const html = renderToStaticMarkup(<PartnerLogos partners={[]} assets={[]} />);
    const root = parse(html);
    const cols = root.querySelectorAll('.gallery-col.col');
    expect(cols).toHaveLength(0);
  });
});
