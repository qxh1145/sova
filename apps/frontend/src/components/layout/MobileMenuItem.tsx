'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';

export interface MobileMenuItemProps {
  id: string;
  href?: string;
  label: string;
  toggleLabel: string;
  children: ReactNode;
}

export function MobileMenuItem({
  id,
  href,
  label,
  toggleLabel,
  children,
}: MobileMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const submenuId = `submenu-${id}`;

  return (
    <li className={`has-children${isOpen ? ' active' : ''}`}>
      {href ? (
        <Link href={href}>{label}</Link>
      ) : (
        <a className="nav-top-link">{label}</a>
      )}
      <button
        type="button"
        className="toggle-submenu"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        aria-label={toggleLabel}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
      >
        ▼
      </button>
      <ul id={submenuId} className="sub-menu">
        {children}
      </ul>
    </li>
  );
}
