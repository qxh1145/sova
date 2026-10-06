'use client';
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react';
import type { ShellContent, SiteSettings } from '@/types/content';
import { useShellOverlay } from '@/components/layout/ShellOverlayProvider';
import { buildContactItems } from './floatingContacts';

export interface FloatingContactActionsProps {
  labels: ShellContent['floatingContacts'];
  settings: SiteSettings;
}

export function FloatingContactActions({ labels, settings }: FloatingContactActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const [showIcons, setShowIcons] = useState(false);
  const [lineX, setLineX] = useState<number | null>(null);
  const [flipIn, setFlipIn] = useState(true);
  const { active } = useShellOverlay();

  const [prevActive, setPrevActive] = useState(active);
  if (active !== prevActive) {
    setPrevActive(active);
    if (active !== null && isOpen) {
      setIsOpen(false);
    }
  }

  // Source adds flipInY on init and drops it after 1s; its fill-mode transform would otherwise
  // keep containing the fixed backdrop.
  useEffect(() => {
    const t = window.setTimeout(() => setFlipIn(false), 1000);
    return () => window.clearTimeout(t);
  }, []);

  // Escape key closes widget and restores focus to button
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Button icon slider, mirrors contactus.min.js B(): pause 2000ms, then one icon per 600ms
  // (iconsAnimationSpeed), back to the static text, repeat. Stopped while the menu is open.
  useEffect(() => {
    const line = lineRef.current;
    const first = line?.firstElementChild as HTMLElement | null;
    if (isOpen || !line || !first) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const step = first.clientWidth + 40;
    const count = line.children.length;
    let u = 0;
    let interval: number | undefined;
    let timeout: number | undefined;
    const start = () => {
      interval = window.setInterval(() => {
        setShowIcons(u < count);
        setLineX(u < count ? -(step * u + 2) : -2);
        u++;
        if (u > count) {
          window.clearInterval(interval);
          u = 0;
          timeout = window.setTimeout(start, 2600);
        }
      }, 600);
    };
    timeout = window.setTimeout(start, 2000);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
      setShowIcons(false);
      setLineX(-2);
    };
  }, [isOpen]);

  const toggleMenu = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  const closeMenu = useCallback(() => {
    setIsOpen(false);
  }, []);

  const items = buildContactItems(settings, labels);

  return (
    <div
      id="arcontactus"
      className={`arcu-widget arcu-message layout-default arcu-fadeindown arcu-menu-regular right lg active arcuAnimated${flipIn ? ' flipInY' : ''}${
        isOpen ? ' open' : ''
      }`}
    >
      <div
        className={`messangers-block arcuAnimated has-header${isOpen ? ' arcu-show' : ''}`}
        id="arcu-menu"
      >
        <div className="arcu-menu-header arcu-icon-center" style={{ backgroundColor: '#2A63D7' }}>
          <div className="arcu-menu-header-content arcu-text-center">{labels.menuHeader}</div>
        </div>
        <div className="messangers-list-container">
          <ul className="messangers-list arcu-downtoup rounded-items">
            {items.map((item) => (
              <li key={item.id}>
                <a
                  className="messanger msg-item-"
                  id={item.id}
                  rel="nofollow noopener"
                  href={item.href}
                  title={item.title}
                  target={item.target ?? '_blank'}
                  onClick={closeMenu}
                >
                  <span
                    className="no-container arcu-item-icon"
                    style={{ color: '#000000', fill: '#000000' }}
                  >
                    {item.iconSrc && (
                      <img
                        width={500}
                        height={500}
                        src={item.iconSrc}
                        className="attachment-full size-full"
                        alt=""
                        decoding="async"
                        loading="lazy"
                      />
                    )}
                  </span>
                  <div className="arcu-item-label">
                    <div className="arcu-item-title">{item.title}</div>
                    {item.subtitle && <div className="arcu-item-subtitle">{item.subtitle}</div>}
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* div role="button" like the source DOM: a native <button> picks up Flatsome's button
          styles (padding, margin, uppercase, line-height) and renders 88px wide instead of 70px. */}
      <div
        role="button"
        tabIndex={0}
        ref={buttonRef}
        className="arcu-message-button"
        style={{ backgroundColor: '#2A63D7' }}
        aria-expanded={isOpen}
        aria-controls="arcu-menu"
        aria-label={labels.buttonText}
        onClick={toggleMenu}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggleMenu();
          }
        }}
      >
        <div className="arcu-online-badge online" />
        <div className="arcu-unread-badge" />
        <div className="arcu-button-icon">
          <div className={`static${isOpen || showIcons ? ' arcu-hide' : ''}`}>
            <div className="static-container">
              <div className="img-24">
                <svg
                  viewBox="0 0 20 20"
                  version="1.1"
                  xmlns="http://www.w3.org/2000/svg"
                  xmlnsXlink="http://www.w3.org/1999/xlink"
                >
                  <g id="Canvas" transform="translate(-825 -308)">
                    <g id="Vector">
                      <use
                        xlinkHref="#path0_fill0123"
                        transform="translate(825 308)"
                        fill="currentColor"
                      />
                    </g>
                  </g>
                  <defs>
                    <path
                      fill="currentColor"
                      id="path0_fill0123"
                      d="M 19 4L 17 4L 17 13L 4 13L 4 15C 4 15.55 4.45 16 5 16L 16 16L 20 20L 20 5C 20 4.45 19.55 4 19 4ZM 15 10L 15 1C 15 0.45 14.55 0 14 0L 1 0C 0.45 0 0 0.45 0 1L 0 15L 4 11L 14 11C 14.55 11 15 10.55 15 10Z"
                    />
                  </defs>
                </svg>
                <p>{labels.buttonText}</p>
              </div>
            </div>
          </div>
          <div className={`icons${showIcons ? '' : ' arcu-hide'}`}>
            <div
              className="icons-line"
              ref={lineRef}
              style={lineX === null ? undefined : { transform: `translate(${lineX}px, 0px)` }}
            >
              {items.map((item) => (
                <span key={item.id} style={{ color: '#2A63D7' }}>
                  {item.iconSrc && (
                    <img
                      width={500}
                      height={500}
                      src={item.iconSrc}
                      className="attachment-full size-full"
                      alt=""
                      decoding="async"
                      loading="lazy"
                    />
                  )}
                </span>
              ))}
            </div>
          </div>
          <div className={`arcu-close${isOpen ? ' arcu-show' : ''}`}>
            <svg
              width="12"
              height="13"
              viewBox="0 0 14 14"
              version="1.1"
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
            >
              <g transform="translate(-4087 108)">
                <g>
                  <path
                    transform="translate(4087 -108)"
                    fill="currentColor"
                    d="M 14 1.41L 12.59 0L 7 5.59L 1.41 0L 0 1.41L 5.59 7L 0 12.59L 1.41 14L 7 8.41L 12.59 14L 14 12.59L 8.41 7L 14 1.41Z"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>
        <div
          className={`pulsation${isOpen ? ' stop' : ''}`}
          style={{ backgroundColor: '#2A63D7' }}
        />
        <div
          className={`pulsation${isOpen ? ' stop' : ''}`}
          style={{ backgroundColor: '#2A63D7' }}
        />
      </div>

      <div
        className="arcu-backdrop"
        style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
        onClick={closeMenu}
        aria-hidden="true"
      />
    </div>
  );
}
