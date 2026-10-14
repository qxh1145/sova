'use client';

import { useEffect, useRef, useState } from 'react';

export interface StatCounterProps {
  value: number;
  minDigits?: number;
}

const DURATION_MS = 2000;
const formatDigits = (v: number, minDigits: number) => String(v).padStart(minDigits, '0');

export function StatCounter({ value, minDigits = 2 }: StatCounterProps) {
  const [display, setDisplay] = useState(() => formatDigits(value, minDigits));
  const elRef = useRef<HTMLSpanElement>(null);
  const animatedRef = useRef(false);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const el = elRef.current;
    if (!el) return;

    let rafId: number | undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting && !animatedRef.current) {
          animatedRef.current = true;
          observer.disconnect();

          let startTimestamp: number | null = null;

          const step = (timestamp: number) => {
            if (startTimestamp === null) startTimestamp = timestamp;
            const elapsed = timestamp - startTimestamp;
            const progress = Math.min(elapsed / DURATION_MS, 1);
            // ease-out cubic
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(easeOut * value);
            setDisplay(formatDigits(current, minDigits));

            if (progress < 1) {
              rafId = requestAnimationFrame(step);
            } else {
              setDisplay(formatDigits(value, minDigits));
            }
          };

          setDisplay(formatDigits(0, minDigits));
          rafId = requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);

    return () => {
      observer.disconnect();
      if (rafId !== undefined) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [value, minDigits]);

  return (
    <span ref={elRef} className="count-up active">
      {display}
    </span>
  );
}
