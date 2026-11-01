'use client';

import { useEffect } from 'react';
import './PointerTracker.css';

const QUERY = '(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)';

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
      // Unitless 0–1 ratios so CSS can map the pointer to an angle (tilted card).
      if (rect.width > 0 && rect.height > 0) {
        target.style.setProperty('--pointer-rx', (x / rect.width).toFixed(3));
        target.style.setProperty('--pointer-ry', (y / rect.height).toFixed(3));
      }
    };

    let listening = false;
    const start = () => {
      if (listening) return;
      document.addEventListener('pointermove', onMove, { passive: true });
      document.documentElement.setAttribute('data-pointer-tracker', '');
      listening = true;
    };

    const stop = () => {
      if (!listening) return;
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeAttribute('data-pointer-tracker');
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
