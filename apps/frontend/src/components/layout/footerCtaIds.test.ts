import { describe, expect, it } from 'vitest';
import { FOOTER_CTA_IDS } from './footerCtaIds';
import sourceMirrorIds from '../../../tests/fixtures/source-mirror-ids.json';

describe('FOOTER_CTA_IDS preset', () => {
  const viIds = new Set(sourceMirrorIds.vi);
  const enIds = new Set(sourceMirrorIds.en);

  it('defines both vi and en presets', () => {
    expect(FOOTER_CTA_IDS.vi).toBeDefined();
    expect(FOOTER_CTA_IDS.en).toBeDefined();
  });

  it('ensures ids differ between vi and en', () => {
    expect(FOOTER_CTA_IDS.vi.section).not.toBe(FOOTER_CTA_IDS.en.section);
    expect(FOOTER_CTA_IDS.vi.gap).not.toBe(FOOTER_CTA_IDS.en.gap);
    expect(FOOTER_CTA_IDS.vi.row).not.toBe(FOOTER_CTA_IDS.en.row);
    expect(FOOTER_CTA_IDS.vi.colLeft).not.toBe(FOOTER_CTA_IDS.en.colLeft);
    expect(FOOTER_CTA_IDS.vi.text).not.toBe(FOOTER_CTA_IDS.en.text);
    expect(FOOTER_CTA_IDS.vi.colRight).not.toBe(FOOTER_CTA_IDS.en.colRight);
  });

  it('ensures all vi ids exist in source mirror / legacy css', () => {
    const ids = Object.values(FOOTER_CTA_IDS.vi);
    for (const id of ids) {
      expect(viIds.has(id), `Expected VI id ${id} to exist in VI source mirror/CSS`).toBe(true);
    }
  });

  it('ensures all en ids exist in source mirror / legacy css', () => {
    const ids = Object.values(FOOTER_CTA_IDS.en);
    for (const id of ids) {
      expect(enIds.has(id), `Expected EN id ${id} to exist in EN source mirror/CSS`).toBe(true);
    }
  });
});
