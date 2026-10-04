'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { SubmitAdapterProvider } from '@/lib/forms/SubmitAdapterContext';
import { createMockTransport, type FormScenario } from '@/lib/forms/mock-transport';
import type { ConsultFormValues } from '@/lib/forms/schemas';

function createDeferred<T = void>() {
  let resolve!: (value: T | PromiseLike<T>) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

export interface ConsultScenarioProps {
  scenario: FormScenario;
  children: ReactNode;
}

export function ConsultScenario({ scenario, children }: ConsultScenarioProps) {
  const [deferred, setDeferred] = useState(() => createDeferred());

  const handleRelease = () => {
    deferred.resolve();
    setDeferred(createDeferred());
  };

  const adapter = useMemo(() => {
    return createMockTransport<ConsultFormValues>({
      scenario,
      gate: deferred.promise,
    });
  }, [scenario, deferred]);

  return (
    <SubmitAdapterProvider adapter={adapter}>
      {children}
      <button
        type="button"
        data-testid="fixture-release"
        onClick={handleRelease}
      >
        Release Gate {/* business-text-ok: fixture button */}
      </button>
    </SubmitAdapterProvider>
  );
}
