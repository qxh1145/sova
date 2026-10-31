'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import './ScrollReveal.css';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

const TARGET_SELECTOR = [
  ':is(main, [role="main"], .portfolio-page-wrapper) .section:not(.section .section, .horizontal-scroll-section, .horizontal-scroll-section *)',
  ':is(main, [role="main"], .portfolio-page-wrapper) :is(h2, h3):not(.horizontal-scroll-section, :is(.section, .banner, .horizontal-scroll-section) *)',
].join(', ');

export function ScrollReveal() {
  const pathname = usePathname();

  useEffect(() => {
    if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
      return;
    }

    const mediaQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    let observer: IntersectionObserver | null = null;

    const scanAndObserve = () => {
      if (mediaQuery.matches) {
        return;
      }

      observer?.disconnect();
      observer = new IntersectionObserver((entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            target.setAttribute('data-reveal', 'shown');
            observer?.unobserve(target);
          }
        }
      });

      const windowHeight = window.innerHeight || document.documentElement.clientHeight;
      const targets = document.querySelectorAll<HTMLElement>(TARGET_SELECTOR);
      for (const target of targets) {
        const r = target.getBoundingClientRect();
        if (r.top >= windowHeight) {
          target.setAttribute('data-reveal', 'hidden');
          observer.observe(target);
        }
      }
    };

    scanAndObserve();

    const onMediaChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        observer?.disconnect();
        observer = null;
        const hiddenEls = document.querySelectorAll<HTMLElement>('[data-reveal="hidden"]');
        for (const el of hiddenEls) {
          el.setAttribute('data-reveal', 'shown');
        }
      } else {
        scanAndObserve();
      }
    };

    mediaQuery.addEventListener('change', onMediaChange);

    return () => {
      mediaQuery.removeEventListener('change', onMediaChange);
      observer?.disconnect();
      observer = null;
    };
  }, [pathname]);

  return null;
}
