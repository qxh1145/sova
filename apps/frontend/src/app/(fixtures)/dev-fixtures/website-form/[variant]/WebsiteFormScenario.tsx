'use client';

import type { ReactNode } from 'react';
import { SubmitAdapterProvider } from '@/lib/forms/SubmitAdapterContext';
import type { FormScenario } from '@/lib/forms/mock-transport';
import type { WebsiteContactFormValues } from '@/lib/forms/schemas';
import { useGatedMockAdapter } from '@/app/(fixtures)/dev-fixtures/gatedMockAdapter';

export interface WebsiteFormScenarioProps {
  scenario: FormScenario;
  children: ReactNode;
}

export function WebsiteFormScenario({ scenario, children }: WebsiteFormScenarioProps) {
  const { adapter, release } = useGatedMockAdapter<WebsiteContactFormValues>(scenario);

  return (
    <SubmitAdapterProvider adapter={adapter}>
      {children}
      <button
        type="button"
        data-testid="fixture-release"
        onClick={release}
      >
        Release Gate {/* business-text-ok: fixture button */}
      </button>
    </SubmitAdapterProvider>
  );
}
