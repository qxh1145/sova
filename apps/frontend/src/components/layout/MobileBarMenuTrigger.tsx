'use client';

import { type MouseEvent, type ReactNode } from 'react';
import { useShellOverlay } from '@/components/layout/ShellOverlayProvider';

export interface MobileBarMenuTriggerProps {
  label: string;
  children: ReactNode;
}

export function MobileBarMenuTrigger({ label, children }: MobileBarMenuTriggerProps) {
  const { isOpen, open } = useShellOverlay();
  const openState = isOpen('menu');

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    open('menu', e.currentTarget);
  };

  return (
    <a
      href="#main-menu"
      data-open="#main-menu"
      data-pos="right"
      className="is-small"
      aria-label={label}
      aria-controls="main-menu"
      aria-expanded={openState}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}
