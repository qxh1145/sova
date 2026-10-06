'use client';

import { useState } from 'react';
import type { Service } from '@/types/content';

export interface ServicesAccordionProps {
  services: Service[];
  id?: string;
}

export function toggleAccordionIndex(
  currentIndex: number | null,
  clickedIndex: number,
): number | null {
  return currentIndex === clickedIndex ? null : clickedIndex;
}

export function ServicesAccordion({ services, id }: ServicesAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!services.length) return null;

  const toggle = (idx: number) => {
    setOpenIndex((prev) => toggleAccordionIndex(prev, idx));
  };

  return (
    <div id={id} className="text show-for-small">
      <div className="accordion acc_dvu" rel="accordion">
        {services.map((service, idx) => {
          const isOpen = openIndex === idx;
          const isLast = idx === services.length - 1;
          const num = `${String(idx + 1).padStart(2, '0')}/`;
          const panelId = `${id ?? 'acc'}-panel-${idx}`;
          const triggerId = `${id ?? 'acc'}-trigger-${idx}`;

          return (
            <div
              key={service.id}
              className={`accordion-item ${isOpen ? 'is-active' : ''} ${isLast ? 'dich_vu_last' : ''}`.trim()}
            >
              <button
                type="button"
                id={triggerId}
                className={`accordion-title plain ${isOpen ? 'active' : ''}`.trim()}
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(idx)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'none',
                  borderLeft: 0,
                  borderRight: 0,
                  borderBottom: 0,
                  cursor: 'pointer',
                }}
              >
                <span className="acc-header">
                  <span className="acc-num">{num}</span>
                  <span className="acc-title">{service.title}</span>
                </span>
              </button>

              <div
                id={panelId}
                role="region"
                aria-labelledby={triggerId}
                className="accordion-inner"
                style={{ display: isOpen ? 'block' : 'none' }}
              >
                {service.subServices.map((sub) => (
                  <span key={sub.href} className="dv-con">
                    <a href={sub.href}>{sub.label}</a>
                  </span>
                ))}
                <p className="mta_dv">{service.homeSummary}</p>
                <p className="nut_xthem">
                  <a href={service.arrowHref}>→</a>
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
