'use client';

import { useEffect } from 'react';
import './PointerTracker.css';

const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)';

export function PointerTracker() {
  useEffect(() => {
    const mediaQuery = window.matchMedia(QUERY);

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return;
      const target = (e.target as Element | null)?.closest?.(
        '[data-pointer]',
      ) as HTMLElement | null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      const x = Math.round(e.clientX - rect.left);
      const y = Math.round(e.clientY - rect.top);
      target.style.setProperty('--pointer-x', `${x}px`);
      target.style.setProperty('--pointer-y', `${y}px`);
    };

    let listening = false;
    const start = () => {
      if (listening) return;
      document.addEventListener('pointermove', onMove, { passive: true });
      listening = true;
    };

    const stop = () => {
      if (!listening) return;
      document.removeEventListener('pointermove', onMove);
      listening = false;
    };

    const onMediaChange = () => (mediaQuery.matches ? start() : stop());

    if (mediaQuery.matches) start();
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      stop();
    };
  }, []);

  return null;
}
