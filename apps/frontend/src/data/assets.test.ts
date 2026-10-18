import { describe, expect, it } from 'vitest';
import { assets } from './assets';

describe('A14 asset decisions: Eras-branded artwork hidden', () => {
  it('exactly 19 assets match ERAS-THUMB-WEBSITE or Banner-Content-MKT-2, and all are marked status: missing', () => {
    const brandedAssets = assets.filter(
      (a) => a.src.includes('ERAS-THUMB-WEBSITE') || a.src.includes('Banner-Content-MKT-2'),
    );

    expect(brandedAssets).toHaveLength(19);
    for (const asset of brandedAssets) {
      expect(asset.status, `${asset.id} (${asset.src}) must be status: 'missing'`).toBe('missing');
    }
  });
});
