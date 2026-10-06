export const VALID_PRIMITIVE_VARIANTS = ['tabs', 'pagination'] as const;
export type PrimitiveVariant = (typeof VALID_PRIMITIVE_VARIANTS)[number];

export function isPrimitiveVariant(v: string): v is PrimitiveVariant {
  return (VALID_PRIMITIVE_VARIANTS as readonly string[]).includes(v);
}

export const FIXTURE_PAGINATION_LABELS_VI = {
  nav: 'Phân trang',
  prev: 'Trang trước',
  next: 'Trang sau',
};

export const FIXTURE_PAGINATION_LABELS_EN = {
  nav: 'Pagination',
  prev: 'Previous',
  next: 'Next',
};

export { FIXTURE_FAQ_LABELS } from '@/app/(fixtures)/dev-fixtures/faq/[variant]/constants';
