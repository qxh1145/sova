import type { ReactNode } from 'react';

export interface ProjectGridProps {
  children?: ReactNode;
  id?: string;
  largeColumns?: number;
  mediumColumns?: number;
  smallColumns?: number;
  rowIsotope?: boolean;
}

export function ProjectGrid({
  children,
  id,
  largeColumns = 2,
  mediumColumns = 2,
  smallColumns = 1,
  rowIsotope = true,
}: ProjectGridProps) {
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
    <div id={id} className={classes}>
      {children}
    </div>
  );
}
