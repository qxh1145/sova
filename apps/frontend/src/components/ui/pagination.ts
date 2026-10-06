/**
 * Computes the list of page numbers and dots for pagination.
 * Reproduces WordPress `paginate_links` output with `end_size = 1, mid_size = 2`.
 *
 * @param current Current page number (1-indexed). Clamped to [1, total].
 * @param total Total number of pages.
 * @returns Array of page numbers and 'dots' markers. Returns empty array if total <= 1.
 */
export function paginationItems(current: number, total: number): (number | 'dots')[] {
  if (total <= 1) {
    return [];
  }

  const clamped = Math.min(Math.max(1, Math.floor(current)), Math.floor(total));
  const endSize = 1;
  const midSize = 2;

  const items: (number | 'dots')[] = [];
  let dots = false;

  for (let n = 1; n <= total; n++) {
    if (n === clamped) {
      items.push(n);
      dots = true;
    } else {
      const inEnd = n <= endSize || n > total - endSize;
      const inMid = n >= clamped - midSize && n <= clamped + midSize;
      if (inEnd || inMid) {
        items.push(n);
        dots = true;
      } else if (dots) {
        items.push('dots');
        dots = false;
      }
    }
  }

  return items;
}
