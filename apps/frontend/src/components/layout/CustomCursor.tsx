'use client';

import { useEffect, useRef } from 'react';

export function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(
      '(pointer: fine) and (prefers-reduced-motion: no-preference)',
    );
    if (!mediaQuery.matches) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

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

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    };

    const onMouseOver = (e: MouseEvent) => {
      const target =
        e.target instanceof Element ? e.target.closest('a, button, .hover-target') : null;
      if (!target) return;
      const related =
        e.relatedTarget instanceof Element
          ? e.relatedTarget.closest('a, button, .hover-target')
          : null;
      if (target === related) return;
      ring.style.width = '60px';
      ring.style.height = '60px';
      ring.style.borderColor = '#fff';
    };

    const onMouseOut = (e: MouseEvent) => {
      const target =
        e.target instanceof Element ? e.target.closest('a, button, .hover-target') : null;
      if (!target) return;
      const related =
        e.relatedTarget instanceof Element
          ? e.relatedTarget.closest('a, button, .hover-target')
          : null;
      if (target === related) return;
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'white';
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseover', onMouseOver);
    document.addEventListener('mouseout', onMouseOut);

    rafId = requestAnimationFrame(updateCursor);

    return () => {
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseover', onMouseOver);
      document.removeEventListener('mouseout', onMouseOut);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return (
    <div className="custom-cursor" aria-hidden="true">
      <div ref={dotRef} className="cursor-dot" />
      <div ref={ringRef} className="cursor-ring" />
    </div>
  );
}
