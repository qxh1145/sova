'use client';

import { useLayoutEffect, useRef, type ReactNode } from 'react';

export interface ProjectGridProps {
  children?: ReactNode;
  id?: string;
  largeColumns?: number;
  mediumColumns?: number;
  smallColumns?: number;
  rowIsotope?: boolean;
  /** Place `.col` cards like the source isotope masonry (Flatsome `flatsome-filtering`). */
  masonry?: boolean;
}

/** Isotope masonry: column width = first card width, each card to the shortest column (leftmost on ties). */
function layoutMasonry(grid: HTMLElement) {
  const items = Array.from(grid.querySelectorAll<HTMLElement>(':scope > .col'));
  if (!items.length) {
    grid.style.height = '';
    return;
  }
  grid.style.position = 'relative';
  // Measure after going absolute so flex rows no longer stretch cards to the row height.
  for (const item of items) item.style.position = 'absolute';
  const outer = (el: HTMLElement) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      width: r.width + parseFloat(s.marginLeft) + parseFloat(s.marginRight),
      height: r.height + parseFloat(s.marginTop) + parseFloat(s.marginBottom),
    };
  };
  // ponytail: no grid padding/border offset; `.row` has none. Add isotope's padding offset if it gains any.
  const containerWidth = grid.getBoundingClientRect().width;
  const columnWidth = outer(items[0]).width;
  const excess = columnWidth - (containerWidth % columnWidth);
  const cols = Math.max(
    1,
    (excess && excess < 1 ? Math.round : Math.floor)(containerWidth / columnWidth),
  );
  const colYs: number[] = new Array(cols).fill(0);
  // Measure every card before writing any position, so one pass forces one layout.
  const sizes = items.map(outer);
  items.forEach((item, index) => {
    const { width, height } = sizes[index];
    const remainder = width % columnWidth;
    const span = Math.min(
      cols,
      (remainder && remainder < 1 ? Math.round : Math.ceil)(width / columnWidth),
    );
    const groupYs = colYs
      .slice(0, cols - span + 1)
      .map((_, i) => Math.max(...colYs.slice(i, i + span)));
    const y = Math.min(...groupYs);
    const col = groupYs.indexOf(y);
    item.style.left = `${col * columnWidth}px`;
    item.style.top = `${y}px`;
    colYs.fill(y + height, col, col + span);
  });
  grid.style.height = `${Math.max(...colYs)}px`;
}

export function ProjectGrid({
  children,
  id,
  largeColumns = 2,
  mediumColumns = 2,
  smallColumns = 1,
  rowIsotope = true,
  masonry = false,
}: ProjectGridProps) {
  const ref = useRef<HTMLDivElement>(null);

  // No deps: re-run after every render so cards added or removed by a filter are observed and placed.
  useLayoutEffect(() => {
    const grid = ref.current;
    if (!masonry || !grid) return;
    layoutMasonry(grid);
    // Width changes and card height changes (image load, title wrap) re-place every card.
    // Layout runs in the next frame: writing the grid height inside the callback would trip the
    // "ResizeObserver loop completed with undelivered notifications" error.
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => layoutMasonry(grid));
    });
    observer.observe(grid);
    for (const item of grid.children) observer.observe(item);
    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  });

  const classes = [
    'row',
    rowIsotope ? 'row-isotope' : '',
    `large-columns-${largeColumns}`,
    `medium-columns-${mediumColumns}`,
    `small-columns-${smallColumns}`,
    'row-small',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div ref={ref} id={id} className={classes}>
      {children}
    </div>
  );
}
