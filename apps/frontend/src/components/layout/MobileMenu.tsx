'use client';

import { type MouseEvent, type ReactNode } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { useShellOverlay } from './ShellOverlayProvider';
import type { ShellContent } from '@/types/content';

export interface MobileMenuTriggerProps {
  label: string;
  dataColor?: string;
  children?: ReactNode;
}

export function MobileMenuTrigger({
  label,
  dataColor,
  children = <i className="icon-menu" aria-hidden="true" />,
}: MobileMenuTriggerProps) {
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
      data-color={dataColor}
      className="is-small"
      aria-label={label}
      aria-controls="main-menu"
      aria-haspopup="dialog"
      aria-expanded={openState}
      onClick={handleClick}
    >
      {children}
    </a>
  );
}

export interface MobileMenuDrawerProps {
  labels: ShellContent['mobileMenu'];
  children: ReactNode;
}

export function MobileMenuDrawer({ labels, children }: MobileMenuDrawerProps) {
  const { isOpen, close, onCloseAutoFocus } = useShellOverlay();
  const open = isOpen('menu');

  const handleContentClick = (e: MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    const anchor = target.closest('a');
    if (anchor?.getAttribute('href')) {
      close();
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) close();
      }}
      variant="off-canvas"
      side="right"
      id="main-menu"
      className="mobile-sidebar no-scrollbar"
      title={labels.menuHeading}
      titleHidden
      labels={{ close: labels.close }}
      onCloseAutoFocus={onCloseAutoFocus}
    >
      <div className="sidebar-menu no-scrollbar" onClick={handleContentClick}>
        <ul className="nav nav-sidebar nav-vertical nav-uppercase" data-tab="1">
          <li className="html custom html_nav_position_text">{children}</li>
        </ul>
      </div>
    </Dialog>
  );
}
