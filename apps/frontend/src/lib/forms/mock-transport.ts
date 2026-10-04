import type { SubmitResult } from '@/types/content';
import type { SubmitAdapter } from './transport';

export type FormScenario = 'success' | 'error';

export interface CreateMockTransportOptions {
  scenario?: FormScenario;
  gate?: Promise<unknown> | (() => Promise<unknown>);
}

export const createMockTransport = <T = unknown>(
  options: CreateMockTransportOptions = { scenario: 'success' },
): SubmitAdapter<T> => {
  const scenario = options.scenario ?? 'success';
  return async (): Promise<SubmitResult> => {
    if (typeof options.gate === 'function') {
      await options.gate();
    } else if (options.gate) {
      await options.gate;
    }
    return {
      mode: 'mock',
      outcome: scenario === 'error' ? 'error' : 'success',
      message: scenario,
    };
  };
};

export const defaultSubmitAdapter: SubmitAdapter<unknown> = createMockTransport({
  scenario: 'success',
});
