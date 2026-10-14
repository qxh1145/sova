import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, test } from 'vitest';
import { getContactPreset, type ContactPreset } from './contactIds';

const STYLES_DIR = path.resolve(__dirname, '../../styles/legacy/sections');
const CSS_FILES = {
  vi: path.join(STYLES_DIR, 'route-lien-he.css'),
  en: path.join(STYLES_DIR, 'route-en--contact-us.css'),
};

/**
 * 9 keys per locale are unstyled by source:
 * Flatsome layout grid containers (structural rows and columns) rely solely
 * on standard framework classes (.row, .col, .medium-*) and have no `#id`
 * rules generated in the page-scoped stylesheet.
 */
export const UNSTYLED_CONTACT_KEYS: { path: string; reason: string }[] = [
  {
    path: 'hero.rowId',
    reason: 'Structural row container in hero; styling provided by .row and .align-middle classes',
  },
  {
    path: 'main.headingRowId',
    reason: 'Structural row container for heading; unstyled in route stylesheet',
  },
  {
    path: 'main.imageCardsRowId',
    reason: 'Row container for contact quick-action cards; unstyled in route stylesheet',
  },
  {
    path: 'main.imageCards.zalo.colId',
    reason: 'Grid column container for Zalo card; uses standard column classes without custom id rules',
  },
  {
    path: 'main.imageCards.hotline.colId',
    reason: 'Grid column container for Hotline card; uses standard column classes without custom id rules',
  },
  {
    path: 'main.imageCards.messenger.colId',
    reason: 'Grid column container for Messenger card; uses standard column classes without custom id rules',
  },
  {
    path: 'main.infoRowId',
    reason: 'Grid row container splitting info column and form column; unstyled in route stylesheet',
  },
  {
    path: 'main.infoColId',
    reason: 'Grid column container for company contact details; unstyled in route stylesheet',
  },
  {
    path: 'main.formColId',
    reason: 'Grid column container for contact form; unstyled in route stylesheet',
  },
];

const UNSTYLED_PATH_SET = new Set(UNSTYLED_CONTACT_KEYS.map((k) => k.path));

interface FlatIdEntry {
  path: string;
  id: string;
}

function flattenIds(preset: ContactPreset): FlatIdEntry[] {
  return [
    { path: 'hero.sectionId', id: preset.hero.sectionId },
    { path: 'hero.rowId', id: preset.hero.rowId },
    { path: 'hero.colId', id: preset.hero.colId },
    { path: 'hero.titleId', id: preset.hero.titleId },
    { path: 'hero.breadcrumbId', id: preset.hero.breadcrumbId },
    { path: 'main.sectionId', id: preset.main.sectionId },
    { path: 'main.headingRowId', id: preset.main.headingRowId },
    { path: 'main.headingColId', id: preset.main.headingColId },
    { path: 'main.headingTextId', id: preset.main.headingTextId },
    { path: 'main.imageCardsRowId', id: preset.main.imageCardsRowId },
    { path: 'main.imageCards.zalo.colId', id: preset.main.imageCards.zalo.colId },
    { path: 'main.imageCards.zalo.imageId', id: preset.main.imageCards.zalo.imageId },
    { path: 'main.imageCards.hotline.colId', id: preset.main.imageCards.hotline.colId },
    { path: 'main.imageCards.hotline.imageId', id: preset.main.imageCards.hotline.imageId },
    { path: 'main.imageCards.messenger.colId', id: preset.main.imageCards.messenger.colId },
    { path: 'main.imageCards.messenger.imageId', id: preset.main.imageCards.messenger.imageId },
    { path: 'main.gapHeadingToInfoId', id: preset.main.gapHeadingToInfoId },
    { path: 'main.infoRowId', id: preset.main.infoRowId },
    { path: 'main.infoColId', id: preset.main.infoColId },
    { path: 'main.gapTitleToIntroId', id: preset.main.gapTitleToIntroId },
    { path: 'main.gapAddressToPhoneId', id: preset.main.gapAddressToPhoneId },
    { path: 'main.gapPhoneToEmailId', id: preset.main.gapPhoneToEmailId },
    { path: 'main.formColId', id: preset.main.formColId },
  ];
}

describe('ContactPreset ID verification against route CSS', () => {
  test('exactly 9 keys are documented as unstyled with reasons', () => {
    expect(UNSTYLED_CONTACT_KEYS).toHaveLength(9);
    for (const item of UNSTYLED_CONTACT_KEYS) {
      expect(item.path).toBeTruthy();
      expect(item.reason).toBeTruthy();
    }
  });

  for (const locale of ['vi', 'en'] as const) {
    describe(`locale: ${locale}`, () => {
      const preset = getContactPreset(locale);
      const allEntries = flattenIds(preset);
      const cssContent = readFileSync(CSS_FILES[locale], 'utf8');

      test(`preset has exactly 23 ids (14 styled, 9 unstyled)`, () => {
        expect(allEntries).toHaveLength(23);
      });

      test('every styled preset id appears as #id in route CSS', () => {
        const styledEntries = allEntries.filter((e) => !UNSTYLED_PATH_SET.has(e.path));
        expect(styledEntries).toHaveLength(14);

        for (const entry of styledEntries) {
          const selector = `#${entry.id}`;
          expect(
            cssContent.includes(selector),
            `Expected ${entry.path} id "${entry.id}" (${selector}) to be present in ${CSS_FILES[locale]}`,
          ).toBe(true);
        }
      });

      test('every unstyled preset id does not appear as #id in route CSS', () => {
        const unstyledEntries = allEntries.filter((e) => UNSTYLED_PATH_SET.has(e.path));
        expect(unstyledEntries).toHaveLength(9);

        for (const entry of unstyledEntries) {
          const selector = `#${entry.id}`;
          expect(
            cssContent.includes(selector),
            `Unstyled ${entry.path} id "${entry.id}" (${selector}) unexpectedly found in ${CSS_FILES[locale]}`,
          ).toBe(false);
        }
      });
    });
  }
});
