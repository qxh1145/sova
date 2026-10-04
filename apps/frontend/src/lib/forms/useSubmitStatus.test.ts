import { describe, expect, it } from 'vitest';
import type { SubmitResult } from '@/types/content';
import { submitStatusReducer, type SubmitState } from './useSubmitStatus';

describe('submitStatusReducer', () => {
  const idleState: SubmitState = { status: 'idle' };

  it('transitions from idle to submitting on SUBMIT_START', () => {
    const next = submitStatusReducer(idleState, { type: 'SUBMIT_START' });
    expect(next).toEqual({
      status: 'submitting',
      result: undefined,
      error: undefined,
    });
  });

  it('ignores submit while submitting', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const next = submitStatusReducer(submittingState, { type: 'SUBMIT_START' });
    expect(next).toBe(submittingState);
  });

  it('transitions from submitting to demo-success on successful mock result', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const result: SubmitResult = {
      mode: 'mock',
      outcome: 'success',
      message: 'success',
    };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_SUCCESS',
      result,
    });

    expect(next).toEqual({
      status: 'demo-success',
      result,
      error: undefined,
    });
  });

  it('transitions from submitting to demo-error on mock error result', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const result: SubmitResult = {
      mode: 'mock',
      outcome: 'error',
      message: 'error',
    };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_SUCCESS',
      result,
    });

    expect(next).toEqual({
      status: 'demo-error',
      result,
      error: undefined,
    });
  });

  it('transitions to demo-error on SUBMIT_ERROR action', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const err = new Error('Network error');
    const result: SubmitResult = {
      mode: 'mock',
      outcome: 'error',
      message: 'Network error',
    };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_ERROR',
      error: err,
      result,
    });

    expect(next).toEqual({
      status: 'demo-error',
      result,
      error: err,
    });
  });

  it('allows resubmit from demo-error (form stays editable, resubmit allowed)', () => {
    const errorState: SubmitState = {
      status: 'demo-error',
      result: { mode: 'mock', outcome: 'error', message: 'error' },
    };
    const next = submitStatusReducer(errorState, { type: 'SUBMIT_START' });
    expect(next).toEqual({
      status: 'submitting',
      result: undefined,
      error: undefined,
    });
  });

  it('resets to idle on RESET', () => {
    const errorState: SubmitState = {
      status: 'demo-error',
      result: { mode: 'mock', outcome: 'error', message: 'error' },
    };
    const next = submitStatusReducer(errorState, { type: 'RESET' });
    expect(next).toEqual({
      status: 'idle',
      result: undefined,
      error: undefined,
    });
  });

  it('supports lowercase action types', () => {
    const next1 = submitStatusReducer(idleState, { type: 'start' });
    expect(next1.status).toBe('submitting');

    const result: SubmitResult = { mode: 'mock', outcome: 'success', message: 'ok' };
    const next2 = submitStatusReducer(next1, { type: 'success', result });
    expect(next2.status).toBe('demo-success');

    const next3 = submitStatusReducer(next2, { type: 'reset' });
    expect(next3.status).toBe('idle');
  });
});

describe('useSubmitStatus', () => {
  it('synchronously ignores rapid consecutive calls to submit using isSubmittingRef', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { useSubmitStatus } = await import('./useSubmitStatus');

    let hookResult!: ReturnType<typeof useSubmitStatus>;
    let adapterCalls = 0;

    let resolveAdapter!: () => void;
    const adapterPromise = new Promise<void>((resolve) => {
      resolveAdapter = resolve;
    });

    const mockAdapter = async () => {
      adapterCalls++;
      await adapterPromise;
      return {
        mode: 'mock' as const,
        outcome: 'success' as const,
        message: 'success',
      };
    };

    function TestComponent() {
      hookResult = useSubmitStatus(mockAdapter);
      return null;
    }

    renderToStaticMarkup(React.createElement(TestComponent));

    // Rapid consecutive calls before any re-render
    const call1 = hookResult.submit({});
    const call2 = hookResult.submit({});

    expect(await call2).toBeUndefined();
    expect(adapterCalls).toBe(1);

    resolveAdapter();
    const result1 = await call1;
    expect(result1?.outcome).toBe('success');
    expect(adapterCalls).toBe(1);
  });
});
