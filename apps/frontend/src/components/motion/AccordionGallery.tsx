'use client';

/*
 * AccordionGallery, ported from React Bits (https://reactbits.dev), trimmed for Sova.
 *
 * MIT + Commons Clause License Condition v1.0
 *
 * Copyright (c) 2026 David Haz
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, and distribute the Software as part of an application,
 * website, or product, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * Commons Clause Restriction: You may use this Software, including for any commercial purpose,
 * so long as you do not sell, sublicense, or redistribute the components themselves-whether
 * alone, in a bundle, or as a ported version.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from 'react';
import gsap from 'gsap';
import './AccordionGallery.css';

export interface AccordionGalleryItem {
  href: string;
  title: string;
  category?: string;
  image?: string;
  alt?: string;
}

export interface AccordionGalleryProps {
  items: AccordionGalleryItem[];
  className?: string;
}

const DEFAULT_EXPAND_RATIO = 5.4;
const DEFAULT_TILT = 8;
const DURATION = 0.6;
const EASE = 'power3.out';

export function AccordionGallery({ items, className }: AccordionGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const panelRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const isFirstRender = useRef(true);
  const activeOnPointerDownRef = useRef(0);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const panels = panelRefs.current.filter((p): p is HTMLAnchorElement => Boolean(p));
    if (panels.length === 0) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const isNarrow = window.matchMedia('(max-width: 549px)').matches;

    if (reducedMotion) {
      gsap.killTweensOf(panels);
      panels.forEach((panel, i) => {
        const isTarget = i === activeIndex;
        gsap.set(panel, {
          flexGrow: isTarget ? (isNarrow ? 4 : DEFAULT_EXPAND_RATIO) : 1,
          rotateY: 0,
        });
        const img = panel.querySelector<HTMLElement>('.accordion-gallery-img');
        if (img) {
          gsap.killTweensOf(img);
          gsap.set(img, { xPercent: 0, scale: 1 });
        }
      });
      return;
    }

    panels.forEach((panel, i) => {
      const isTarget = i === activeIndex;
      const targetFlex = isTarget ? (isNarrow ? 4 : DEFAULT_EXPAND_RATIO) : 1;
      const targetTilt = isNarrow ? 0 : isTarget ? 0 : i < activeIndex ? -DEFAULT_TILT : DEFAULT_TILT;

      gsap.to(panel, {
        flexGrow: targetFlex,
        rotateY: targetTilt,
        duration: DURATION,
        ease: EASE,
        overwrite: 'auto',
      });

      const img = panel.querySelector<HTMLElement>('.accordion-gallery-img');
      if (img) {
        const targetXPercent = isNarrow ? 0 : isTarget ? 0 : (i - activeIndex) * 8;
        const targetScale = isTarget ? 1.05 : 1;
        gsap.to(img, {
          xPercent: targetXPercent,
          scale: targetScale,
          duration: DURATION,
          ease: EASE,
          overwrite: 'auto',
        });
      }
    });
  }, [activeIndex]);

  useEffect(() => {
    const panels = panelRefs.current.filter((p): p is HTMLAnchorElement => Boolean(p));
    return () => {
      panels.forEach((panel) => {
        gsap.killTweensOf(panel);
        const img = panel.querySelector<HTMLElement>('.accordion-gallery-img');
        if (img) gsap.killTweensOf(img);
      });
    };
  }, []);

  const handleMouseEnter = (index: number) => {
    const isFine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    if (!isFine) return;
    setActiveIndex(index);
  };

  const handleFocus = (index: number) => {
    setActiveIndex(index);
  };

  const handleClick = (e: MouseEvent<HTMLAnchorElement>, index: number) => {
    const isCoarse = window.matchMedia('(pointer: coarse)').matches;
    const isNarrow = window.matchMedia('(max-width: 549px)').matches;
    const isTouch = (e.nativeEvent as PointerEvent).pointerType === 'touch';
    const wasInactive = activeOnPointerDownRef.current !== index;
    if ((isTouch || isCoarse || isNarrow) && wasInactive) {
      e.preventDefault();
      setActiveIndex(index);
      activeOnPointerDownRef.current = index;
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (index + 1) % items.length;
      setActiveIndex(nextIndex);
      panelRefs.current[nextIndex]?.focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (index - 1 + items.length) % items.length;
      setActiveIndex(prevIndex);
      panelRefs.current[prevIndex]?.focus();
    }
  };

  if (!items.length) return null;

  return (
    <div
      ref={containerRef}
      className={`accordion-gallery ${className ?? ''}`.trim()}
    >
      {items.map((item, index) => {
        const isActive = activeIndex === index;
        return (
          <a
            key={item.href || index}
            ref={(el) => {
              panelRefs.current[index] = el;
            }}
            href={item.href}
            className="accordion-gallery-panel"
            data-state={isActive ? 'active' : 'inactive'}
            onPointerDown={() => {
              activeOnPointerDownRef.current = activeIndex;
            }}
            onMouseEnter={() => handleMouseEnter(index)}
            onFocus={() => handleFocus(index)}
            onClick={(e) => handleClick(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
          >
            <div className="accordion-gallery-media">
              {item.image && (
                <img
                  src={item.image}
                  alt={item.alt ?? item.title}
                  className="accordion-gallery-img"
                  loading="lazy"
                />
              )}
              <div className="accordion-gallery-overlay" />
            </div>
            <div className="accordion-gallery-content">
              <div className="accordion-gallery-caption">
                <h3 className="accordion-gallery-title">{item.title}</h3>
                {item.category && (
                  <div className="accordion-gallery-category">
                    <span>{item.category}</span>
                  </div>
                )}
              </div>
            </div>
          </a>
        );
      })}
    </div>
  );
}
