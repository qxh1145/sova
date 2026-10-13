import { describe, expect, it } from 'vitest';
import {
  TESTIMONIALS_IDS,
  type TestimonialsConsumer,
  type TestimonialsIds,
} from './testimonialsIds';
import sourceMirrorIds from '../../../tests/fixtures/source-mirror-ids.json';

describe('TESTIMONIALS_IDS presets', () => {
  const viIds = new Set(sourceMirrorIds.vi);
  const enIds = new Set(sourceMirrorIds.en);

  const consumers: TestimonialsConsumer[] = [
    'home',
    'mobile',
    'hosting',
    'vps',
    'email',
    'storage',
    'seo',
    'branding',
    'website',
    'about',
  ];

  function collectIds(preset: TestimonialsIds): string[] {
    const ids: string[] = [
      preset.section,
      preset.row,
      preset.leftCol,
      preset.imageWrapper,
      preset.rightCol,
      preset.sliderWrapper,
    ];
    if (preset.eyebrowText) ids.push(preset.eyebrowText);
    if (preset.titleText) ids.push(preset.titleText);
    if (preset.innerGap) ids.push(preset.innerGap);
    if (preset.bottomGap) ids.push(preset.bottomGap);
    if (preset.slides) {
      for (const slide of preset.slides) {
        ids.push(slide.row);
        if (slide.col) ids.push(slide.col);
        if (slide.ndKh) ids.push(slide.ndKh);
        if (slide.line) ids.push(slide.line);
        if (slide.iconBoxText) ids.push(slide.iconBoxText);
      }
    }
    return ids;
  }

  it('defines both vi and en presets for all 10 consumers', () => {
    for (const consumer of consumers) {
      const preset = TESTIMONIALS_IDS[consumer];
      expect(preset, `Preset for ${consumer} must exist`).toBeDefined();
      expect(preset.vi, `VI preset for ${consumer} must exist`).toBeDefined();
      expect(preset.en, `EN preset for ${consumer} must exist`).toBeDefined();
    }
  });

  it('ensures section, row, sliderWrapper, and slides ids differ between vi and en', () => {
    for (const consumer of consumers) {
      const { vi, en } = TESTIMONIALS_IDS[consumer];
      expect(vi.section, `${consumer} section ID differs`).not.toBe(en.section);
      expect(vi.row, `${consumer} row ID differs`).not.toBe(en.row);
      expect(vi.leftCol, `${consumer} leftCol ID differs`).not.toBe(en.leftCol);
      expect(vi.sliderWrapper, `${consumer} sliderWrapper ID differs`).not.toBe(en.sliderWrapper);

      expect(Boolean(vi.slides), `${consumer} slides defined in both locales`).toBe(
        Boolean(en.slides),
      );
      if (vi.slides && en.slides) {
        expect(vi.slides.length).toBe(en.slides.length);
        for (let i = 0; i < vi.slides.length; i++) {
          expect(vi.slides[i].row, `${consumer} slide[${i}] row differs`).not.toBe(
            en.slides[i].row,
          );
          expect(vi.slides[i].ndKh, `${consumer} slide[${i}] ndKh differs`).not.toBe(
            en.slides[i].ndKh,
          );
        }
      }
    }
  });

  it('ensures all vi ids in all consumers exist in source mirror / legacy css', () => {
    for (const consumer of consumers) {
      const ids = collectIds(TESTIMONIALS_IDS[consumer].vi);
      for (const id of ids) {
        expect(viIds.has(id), `Expected VI id ${id} (${consumer}) to exist in VI mirror`).toBe(
          true,
        );
      }
    }
  });

  it('ensures all en ids in all consumers exist in source mirror / legacy css', () => {
    for (const consumer of consumers) {
      const ids = collectIds(TESTIMONIALS_IDS[consumer].en);
      for (const id of ids) {
        expect(enIds.has(id), `Expected EN id ${id} (${consumer}) to exist in EN mirror`).toBe(
          true,
        );
      }
    }
  });
});
