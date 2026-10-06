export const VALID_FAQ_VARIANTS = ['default', 'changed'] as const;
export type FAQVariant = (typeof VALID_FAQ_VARIANTS)[number];

export function isFAQVariant(v: string): v is FAQVariant {
  return (VALID_FAQ_VARIANTS as readonly string[]).includes(v);
}

export const FIXTURE_FAQ_LABELS = {
  toggle: 'Chuyển đổi',
};
