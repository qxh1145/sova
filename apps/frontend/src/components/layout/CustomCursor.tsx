'use client';

import { useEffect, useRef } from 'react';

const QUERY = '(pointer: fine) and (prefers-reduced-motion: no-preference)';
const INTERACTIVE = 'a, button, .hover-target';
// Set on <html> only while the island runs; globals.css hides the native cursor under it.
const ACTIVE_CLASS = 'has-custom-cursor';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    const mediaQuery = window.matchMedia(QUERY);
    const root = document.documentElement;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let rafId: number | null = null;

    const updateCursor = () => {
      ringX += (mouseX - ringX) * 0.15;
      ringY += (mouseY - ringY) * 0.15;

      dot.style.left = `${mouseX}px`;
      dot.style.top = `${mouseY}px`;

      ring.style.left = `${ringX}px`;
      ring.style.top = `${ringY}px`;

      rafId = requestAnimationFrame(updateCursor);
    };

    const setHover = (hover: boolean) => {
      ring.style.width = hover ? '60px' : '40px';
      ring.style.height = hover ? '60px' : '40px';
      ring.style.borderColor = hover ? '#fff' : 'white';
    };

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    // Decide on every mouseover so a hovered element that unmounts (no mouseout) cannot leave the ring at 60px.
    const onMouseOver = (e: MouseEvent) => {
      setHover(e.target instanceof Element && e.target.closest(INTERACTIVE) !== null);
    };

    // Leaving the window fires mouseout with no relatedTarget and no following mouseover.
    const onMouseOut = (e: MouseEvent) => {
      if (!e.relatedTarget) setHover(false);
    };

    const start = () => {
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseover', onMouseOver);
      document.addEventListener('mouseout', onMouseOut);
      rafId = requestAnimationFrame(updateCursor);
      root.classList.add(ACTIVE_CLASS);
    };

    const stop = () => {
      root.classList.remove(ACTIVE_CLASS);
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
    };

    const onMediaChange = () => (mediaQuery.matches ? start() : stop());

    if (mediaQuery.matches) start();
    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      stop();
    };
  }, []);

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}
