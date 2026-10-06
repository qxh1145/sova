'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { defaultSubmitAdapter } from './mock-transport';
import type { SubmitAdapter } from './transport';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SubmitAdapterContext = createContext<SubmitAdapter<any> | undefined>(undefined);

export interface SubmitAdapterProviderProps<T = unknown> {
  adapter?: SubmitAdapter<T>;
  children: ReactNode;
}

export function SubmitAdapterProvider<T = unknown>({
  adapter,
  children,
}: SubmitAdapterProviderProps<T>) {
  return (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    <SubmitAdapterContext.Provider value={adapter as SubmitAdapter<any>}>
      {children}
    </SubmitAdapterContext.Provider>
  );
}

export function useSubmitAdapter<T = unknown>(): SubmitAdapter<T> {
  const context = useContext(SubmitAdapterContext);
  return (context as SubmitAdapter<T>) ?? (defaultSubmitAdapter as SubmitAdapter<T>);
}
