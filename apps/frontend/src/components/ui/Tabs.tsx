'use client';

import { useState, type ReactNode } from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export interface TabItem {
  value: string;
  title: ReactNode;
  content: ReactNode;
}

export interface TabsProps {
  items: TabItem[];
  defaultValue?: string;
  className?: string;
}

export function Tabs({ items, defaultValue, className }: TabsProps) {
  const [activeTab, setActiveTab] = useState<string>(
    defaultValue ?? items[0]?.value ?? '',
  );

  return (
    <TabsPrimitive.Root
      value={activeTab}
      onValueChange={setActiveTab}
      orientation="vertical"
      className={['tabbed-content', className].filter(Boolean).join(' ')}
    >
      <TabsPrimitive.List asChild>
        <ul
          className="nav nav-pills nav-vertical nav-normal nav-size-large nav-left"
          role="tablist"
        >
          {items.map((item) => {
            const isActive = item.value === activeTab;
            return (
              <li
                key={item.value}
                className={['tab', 'has-icon', isActive ? 'active' : '']
                  .filter(Boolean)
                  .join(' ')}
                role="presentation"
              >
                <TabsPrimitive.Trigger
                  asChild
                  value={item.value}
                  id={`tab-${item.value}`}
                  aria-controls={`tab_${item.value}`}
                >
                  <a
                    href={`#tab_${item.value}`}
                    onClick={(e) => {
                      e.preventDefault();
                    }}
                  >
                    <span>{item.title}</span>
                  </a>
                </TabsPrimitive.Trigger>
              </li>
            );
          })}
        </ul>
      </TabsPrimitive.List>
      <div className="tab-panels">
        {items.map((item) => {
          const isActive = item.value === activeTab;
          return (
            <TabsPrimitive.Content
              key={item.value}
              value={item.value}
              forceMount
              id={`tab_${item.value}`}
              aria-labelledby={`tab-${item.value}`}
              className={['panel', 'entry-content', isActive ? 'active' : '']
                .filter(Boolean)
                .join(' ')}
            >
              {item.content}
            </TabsPrimitive.Content>
          );
        })}
      </div>
    </TabsPrimitive.Root>
  );
}
