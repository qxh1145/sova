'use client';

import { useSyncExternalStore } from 'react';

const noopSubscribe = () => () => {};

// False during SSR and before hydration, true after. Forms keep submit disabled
// until then: a native submit would put field values in the URL or POST body.
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
