'use client';

import { useMemo, useState } from 'react';
import { createMockTransport, type FormScenario } from '@/lib/forms/mock-transport';
import type { SubmitAdapter } from '@/lib/forms/transport';

export function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export function useGatedMockAdapter<T = unknown>(scenario: FormScenario): {
  adapter: SubmitAdapter<T>;
  release: () => void;
} {
  const [deferred, setDeferred] = useState(() => createDeferred());

  const release = () => {
    deferred.resolve();
    setDeferred(createDeferred());
  };

  const adapter = useMemo(() => {
    return createMockTransport<T>({
      scenario,
      gate: deferred.promise,
    });
  }, [scenario, deferred]);

  return { adapter, release };
}
