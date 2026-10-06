'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
  if (process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_E2E === '1') {
    (window as unknown as { ScrollTrigger?: typeof ScrollTrigger }).ScrollTrigger = ScrollTrigger;
  }
}

export interface HorizontalProjectsProps {
  children: React.ReactNode;
}

export function HorizontalProjects({ children }: HorizontalProjectsProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useGSAP(
    (_context, contextSafe) => {
      let isMounted = true;
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const section = wrapper.closest<HTMLElement>('.horizontal-scroll-section');
      if (!section) return;

      const getDistance = () => wrapper.scrollWidth - window.innerWidth;

      gsap.to(wrapper, {
        x: () => -getDistance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: () => '+=' + getDistance(),
          scrub: true,
          pin: true,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      });

      const items = wrapper.querySelectorAll<HTMLElement>('.scroll-item');
      const cleanups: (() => void)[] = [];

      items.forEach((item) => {
        const onEnter = contextSafe?.(() => {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          gsap.to(item, { scale: 1.05, duration: 0.25, ease: 'power2.out' });
        });
        const onLeave = contextSafe?.(() => {
          if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
          gsap.to(item, { scale: 1, duration: 0.25, ease: 'power2.out' });
        });

        if (onEnter && onLeave) {
          item.addEventListener('mouseenter', onEnter);
          item.addEventListener('mouseleave', onLeave);
          cleanups.push(() => {
            item.removeEventListener('mouseenter', onEnter);
            item.removeEventListener('mouseleave', onLeave);
          });
        }
      });

      if (typeof document !== 'undefined' && 'fonts' in document) {
        document.fonts.ready.then(() => {
          if (isMounted) {
            ScrollTrigger.refresh();
          }
        });
      }

      const cardContents = wrapper.querySelectorAll<HTMLElement>('.item-content');
      cardContents.forEach((card) => {
        const bg = card.style.backgroundImage;
        const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
        if (match?.[1]) {
          const img = new Image();
          const onDone = () => {
            img.onload = null;
            img.onerror = null;
            if (isMounted) {
              ScrollTrigger.refresh();
            }
          };
          img.onload = onDone;
          img.onerror = onDone;
          cleanups.push(() => {
            img.onload = null;
            img.onerror = null;
          });
          img.src = match[1];
          if (img.complete) onDone();
        }
      });

      return () => {
        isMounted = false;
        cleanups.forEach((fn) => fn());
      };
    },
    { scope: wrapperRef },
  );

  return (
    <div ref={wrapperRef} className="scrolling-wrapper">
      <div className="scroll-spacer" style={{ width: '10vw' }} />
      {children}
      <div className="scroll-spacer" style={{ width: '10vw' }} />
    </div>
  );
}
