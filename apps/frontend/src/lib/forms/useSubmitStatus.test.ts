import { describe, expect, it } from 'vitest';
import { submitStatusReducer, type SubmitState } from './useSubmitStatus';

describe('submitStatusReducer', () => {
  const idleState: SubmitState = { status: 'idle' };

  it('transitions from idle to submitting on SUBMIT_START', () => {
    const next = submitStatusReducer(idleState, { type: 'SUBMIT_START' });
    expect(next).toEqual({ status: 'submitting' });
  });

  it('transitions from submitting to demo-success on successful mock result', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_SUCCESS',
      outcome: 'success',
    });

    expect(next).toEqual({ status: 'demo-success' });
  });

  it('transitions from submitting to demo-error on mock error result', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_SUCCESS',
      outcome: 'error',
    });

    expect(next).toEqual({ status: 'demo-error' });
  });

  it('transitions to demo-error on SUBMIT_ERROR action', () => {
    const submittingState: SubmitState = { status: 'submitting' };
    const next = submitStatusReducer(submittingState, {
      type: 'SUBMIT_ERROR',
    });

    expect(next).toEqual({ status: 'demo-error' });
  });

  it('allows resubmit from demo-error (form stays editable, resubmit allowed)', () => {
    const errorState: SubmitState = { status: 'demo-error' };
    const next = submitStatusReducer(errorState, { type: 'SUBMIT_START' });
    expect(next).toEqual({ status: 'submitting' });
  });

  it('resets to idle on RESET', () => {
    const errorState: SubmitState = { status: 'demo-error' };
    const next = submitStatusReducer(errorState, { type: 'RESET' });
    expect(next).toEqual({ status: 'idle' });
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

  it('resolves to a mock error result and releases the guard when the adapter rejects', async () => {
    const React = await import('react');
    const { renderToStaticMarkup } = await import('react-dom/server');
    const { useSubmitStatus } = await import('./useSubmitStatus');

    let hookResult!: ReturnType<typeof useSubmitStatus>;
    let adapterCalls = 0;
    const failingAdapter = async () => {
      adapterCalls++;
      throw new Error('boom');
    };

    function TestComponent() {
      hookResult = useSubmitStatus(failingAdapter);
      return null;
    }

    renderToStaticMarkup(React.createElement(TestComponent));

    await expect(hookResult.submit({})).resolves.toEqual({
      mode: 'mock',
      outcome: 'error',
      message: 'boom',
    });

    await hookResult.submit({});
    expect(adapterCalls).toBe(2);
  });
});
