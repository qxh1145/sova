'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import * as AccordionPrimitive from '@radix-ui/react-accordion';

export interface AccordionLabels {
  toggle: string;
}

export interface AccordionProps {
  type: 'single' | 'multiple';
  defaultValue: string[];
  className?: string;
  children: ReactNode;
}

export interface AccordionItemProps {
  value: string;
  title: ReactNode;
  labels: AccordionLabels;
  children: ReactNode;
  className?: string;
}

interface AccordionContextValue {
  openValues: Set<string>;
}

const AccordionContext = createContext<AccordionContextValue>({
  openValues: new Set(),
});

export function useAccordionContext() {
  return useContext(AccordionContext);
}

export function Accordion({
  type,
  defaultValue,
  className,
  children,
}: AccordionProps) {
  if (type === 'single') {
    return (
      <SingleAccordion defaultValue={defaultValue} className={className}>
        {children}
      </SingleAccordion>
    );
  }

  return (
    <MultipleAccordion defaultValue={defaultValue} className={className}>
      {children}
    </MultipleAccordion>
  );
}

function SingleAccordion({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string[];
  className?: string;
  children: ReactNode;
}) {
  const [value, setValue] = useState<string>(defaultValue[0] ?? '');
  const openValues = useMemo(() => new Set(value ? [value] : []), [value]);

  return (
    <AccordionContext.Provider value={{ openValues }}>
      <AccordionPrimitive.Root
        type="single"
        collapsible
        value={value}
        onValueChange={setValue}
        className={['accordion', className].filter(Boolean).join(' ')}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  );
}

function MultipleAccordion({
  defaultValue,
  className,
  children,
}: {
  defaultValue: string[];
  className?: string;
  children: ReactNode;
}) {
  const [value, setValue] = useState<string[]>(defaultValue);
  const openValues = useMemo(() => new Set(value), [value]);

  return (
    <AccordionContext.Provider value={{ openValues }}>
      <AccordionPrimitive.Root
        type="multiple"
        value={value}
        onValueChange={setValue}
        className={['accordion', className].filter(Boolean).join(' ')}
      >
        {children}
      </AccordionPrimitive.Root>
    </AccordionContext.Provider>
  );
}

export function AccordionItem({
  value,
  title,
  labels,
  children,
  className,
}: AccordionItemProps) {
  const { openValues } = useAccordionContext();
  const isOpen = openValues.has(value);

  return (
    <AccordionPrimitive.Item
      id={`accordion-${value}`}
      value={value}
      className={['accordion-item', className].filter(Boolean).join(' ')}
    >
      <AccordionPrimitive.Header asChild>
        <div>
          <AccordionPrimitive.Trigger
            id={`accordion-${value}-label`}
            aria-controls={`accordion-${value}-content`}
            className={['accordion-title', 'plain', isOpen ? 'active' : undefined]
              .filter(Boolean)
              .join(' ')}
            style={{ textAlign: 'left', textTransform: 'none', width: '100%' }}
          >
            <span className="toggle" aria-label={labels.toggle}>
              <i className="icon-angle-down" aria-hidden="true" />
            </span>
            <span>{title}</span>
          </AccordionPrimitive.Trigger>
        </div>
      </AccordionPrimitive.Header>
      <AccordionPrimitive.Content
        id={`accordion-${value}-content`}
        aria-labelledby={`accordion-${value}-label`}
        className="accordion-inner"
        forceMount
        style={isOpen ? { display: 'block' } : undefined}
      >
        <div className="text">{children}</div>
      </AccordionPrimitive.Content>
    </AccordionPrimitive.Item>
  );
}
