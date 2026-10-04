'use client';

import { useCallback, useReducer, useRef } from 'react';
import type { SubmitResult } from '@/types/content';
import { defaultSubmitAdapter } from './mock-transport';
import type { SubmitAdapter } from './transport';

export type SubmitStatus = 'idle' | 'submitting' | 'demo-success' | 'demo-error';

export interface SubmitState {
  status: SubmitStatus;
  result?: SubmitResult;
  error?: unknown;
}

export type SubmitAction =
  | { type: 'SUBMIT_START' }
  | { type: 'SUBMIT_SUCCESS'; result: SubmitResult }
  | { type: 'SUBMIT_ERROR'; error?: unknown; result?: SubmitResult }
  | { type: 'RESET' };

export function submitStatusReducer(
  state: SubmitState,
  action: SubmitAction,
): SubmitState {
  switch (action.type) {
    case 'SUBMIT_START':
      // Ignores submit while already submitting
      if (state.status === 'submitting') {
        return state;
      }
      return {
        status: 'submitting',
        result: undefined,
        error: undefined,
      };

    case 'SUBMIT_SUCCESS': {
      const outcome = action.result.outcome;
      return {
        status: outcome === 'error' ? 'demo-error' : 'demo-success',
        result: action.result,
        error: undefined,
      };
    }

    case 'SUBMIT_ERROR': {
      return {
        status: 'demo-error',
        result: action.result,
        error: action.error,
      };
    }

    case 'RESET':
      return {
        status: 'idle',
        result: undefined,
        error: undefined,
      };

    default:
      return state;
  }
}

// Mock-only: every outcome maps to a demo-* status and thrown errors become
// mock results. A live adapter needs its own statuses before it can use this.
export function useSubmitStatus<T = unknown>(adapter?: SubmitAdapter<T>) {
  const [state, dispatch] = useReducer(submitStatusReducer, { status: 'idle' });
  const isSubmittingRef = useRef(false);

  const submit = useCallback(
    async (values: T): Promise<SubmitResult | undefined> => {
      if (isSubmittingRef.current || state.status === 'submitting') {
        return undefined;
      }
      isSubmittingRef.current = true;
      dispatch({ type: 'SUBMIT_START' });
      const submitAdapter = adapter ?? defaultSubmitAdapter;
      try {
        const result = await submitAdapter(values);
        dispatch({ type: 'SUBMIT_SUCCESS', result });
        return result;
      } catch (err) {
        const errorResult: SubmitResult = {
          mode: 'mock',
          outcome: 'error',
          message: err instanceof Error ? err.message : 'Unknown error',
        };
        dispatch({ type: 'SUBMIT_ERROR', error: err, result: errorResult });
        return errorResult;
      } finally {
        isSubmittingRef.current = false;
      }
    },
    [adapter, state.status],
  );

  const reset = useCallback(() => {
    isSubmittingRef.current = false;
    dispatch({ type: 'RESET' });
  }, []);

  return {
    status: state.status,
    result: state.result,
    error: state.error,
    isSubmitting: state.status === 'submitting',
    submit,
    reset,
  };
}
