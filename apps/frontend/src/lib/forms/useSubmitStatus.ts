'use client';

import { useCallback, useReducer, useRef } from 'react';
import type { SubmitResult } from '@/types/content';
import { defaultSubmitAdapter } from './mock-transport';
import type { SubmitAdapter } from './transport';

export type SubmitStatus = 'idle' | 'submitting' | 'demo-success' | 'demo-error';

export interface SubmitState {
  status: SubmitStatus;
}

export type SubmitAction =
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; outcome: SubmitResult['outcome'] }
  | { type: 'SUBMIT_ERROR' }
  | { type: 'RESET' };

export function submitStatusReducer(
  state: SubmitState,
  action: SubmitAction,
): SubmitState {
  switch (action.type) {
    case 'SUBMIT_START':
      return { status: 'submitting' };

    case 'SUBMIT_SUCCESS':
      return {
        status: action.outcome === 'error' ? 'demo-error' : 'demo-success',
      };

    case 'SUBMIT_ERROR':
      return { status: 'demo-error' };

    case 'RESET':
      return { status: 'idle' };

    default: {
      const _exhaustive: never = action;
      return _exhaustive;
    }
  }
}

// Mock-only: every outcome maps to a demo-* status and thrown errors become
// mock results. A live adapter needs its own statuses before it can use this.
export function useSubmitStatus<T = unknown>(adapter?: SubmitAdapter<T>) {
  const [state, dispatch] = useReducer(submitStatusReducer, { status: 'idle' });
  const isSubmittingRef = useRef(false);

  const submit = useCallback(
    async (values: T): Promise<SubmitResult | undefined> => {
      if (isSubmittingRef.current) {
        return undefined;
      }
      isSubmittingRef.current = true;
      dispatch({ type: 'SUBMIT_START' });
      const submitAdapter = adapter ?? defaultSubmitAdapter;
      try {
        const result = await submitAdapter(values);
        dispatch({ type: 'SUBMIT_SUCCESS', outcome: result.outcome });
        return result;
      } catch (err) {
        const errorResult: SubmitResult = {
          mode: 'mock',
          outcome: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        };
        dispatch({ type: 'SUBMIT_ERROR' });
        return errorResult;
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [adapter],
  );

  const reset = useCallback(() => {
    isSubmittingRef.current = false;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    status: state.status,
    isSubmitting: state.status === 'submitting',
    submit,
    reset,
  };
}
