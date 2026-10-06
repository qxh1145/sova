'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { nextStuck } from './stickyThreshold';

export interface HeaderMotionProps {
  children: ReactNode;
}

const HEADER_CLASS = 'header transparent has-transparent has-sticky sticky-jump';

export function HeaderMotion({ children }: HeaderMotionProps) {
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const headerEl = headerRef.current;
    if (!headerEl) return;
    const wrapperEl = headerEl.querySelector<HTMLElement>('.header-wrapper');
    if (!wrapperEl) return;

    let isStuck = false;
    let lockedHeight = headerEl.offsetHeight || 90;

    // Initial check on mount: if loaded past threshold, stick without animation
    const initialScrollY = window.scrollY;
    const initialWrapperHeight = wrapperEl.offsetHeight || 90;
    if (nextStuck(initialScrollY, initialWrapperHeight, false)) {
      isStuck = true;
      headerEl.style.height = `${lockedHeight}px`;
      wrapperEl.classList.add('stuck', 'ux-no-animation');
      headerEl.classList.remove('transparent');
    }

    const onScroll = () => {
      const scrollY = window.scrollY;
      const currentWrapperHeight = isStuck ? lockedHeight : wrapperEl.offsetHeight || 90;
      const shouldStick = nextStuck(scrollY, currentWrapperHeight, isStuck);

      if (shouldStick !== isStuck) {
        isStuck = shouldStick;
        if (shouldStick) {
          lockedHeight = headerEl.offsetHeight || 90;
          headerEl.style.height = `${lockedHeight}px`;
          wrapperEl.classList.add('stuck');
          headerEl.classList.remove('transparent');
        } else {
          wrapperEl.classList.remove('stuck', 'ux-no-animation');
          if (headerEl.classList.contains('has-transparent')) {
            headerEl.classList.add('transparent');
          }
          headerEl.style.height = '';
        }
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <header id="header" ref={headerRef} className={HEADER_CLASS}>
      {children}
    </header>
  );
}
