'use client';

import { useRef, useState, type ReactNode } from 'react';

export function NavDropdown({
  children,
  label,
  href,
}: {
  children: ReactNode;
  label: string;
  href?: string;
}) {
  const [open, setOpen] = useState(false);
  const dismissed = useRef(false);

  return (
    <li
      className={`menu-item menu-item-type-custom menu-item-object-custom menu-item-has-children menu-item-design-default has-dropdown${open ? ' current-dropdown' : ''}`}
      onMouseEnter={() => {
        dismissed.current = false;
        setOpen(true);
      }}
      onMouseLeave={() => {
        dismissed.current = false;
        setOpen(false);
      }}
      onFocus={() => {
        if (!dismissed.current) setOpen(true);
      }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          dismissed.current = false;
          setOpen(false);
        }
      }}
      onKeyDown={(event) => {
        if (event.key === 'Escape') {
          dismissed.current = true;
          setOpen(false);
          event.currentTarget.querySelector<HTMLElement>('.nav-top-link')?.focus();
          event.stopPropagation();
        }
      }}
    >
      <a
        className="nav-top-link"
        {...(href ? { href } : { role: 'button', tabIndex: 0 })}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={href ? undefined : () => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (!href && (event.key === 'Enter' || event.key === ' ')) {
            event.preventDefault();
            dismissed.current = open;
            setOpen((value) => !value);
          }
        }}
      >
        <span>{label}</span>
        <i className="icon-angle-down" aria-hidden="true" />
      </a>
      {children}
    </li>
  );
}
