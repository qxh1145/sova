'use client';

import { useState, type MouseEvent, type ReactNode } from 'react';
import Link from 'next/link';

export interface MobileMenuItemProps {
  id: string;
  href?: string;
  label: string;
  toggleLabel: string;
  children: ReactNode;
}

export function MobileMenuItem({ id, href, label, toggleLabel, children }: MobileMenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);
  const submenuId = `submenu-${id}`;
  const toggle = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsOpen((prev) => !prev);
  };

  return (
    <li className={`has-children${isOpen ? ' active' : ''}`}>
      {href ? (
        <Link href={href}>{label}</Link>
      ) : (
        // A parent with no destination toggles its submenu, so the label is never a dead tap target.
        <a
          href={`#${submenuId}`}
          className="nav-top-link"
          aria-expanded={isOpen}
          aria-controls={submenuId}
          onClick={toggle}
        >
          {label}
        </a>
      )}
      <button
        type="button"
        className="toggle-submenu"
        aria-expanded={isOpen}
        aria-controls={submenuId}
        aria-label={toggleLabel}
        onClick={toggle}
      >
        ▼
      </button>
      <ul id={submenuId} className="sub-menu" inert={!isOpen}>
        {children}
      </ul>
    </li>
  );
}
