import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { defaultSubmitAdapter } from './mock-transport';
import { SubmitAdapterProvider, useSubmitAdapter } from './SubmitAdapterContext';

describe('SubmitAdapterContext', () => {
  it('useSubmitAdapter falls back to defaultSubmitAdapter without provider', () => {
    let captured: unknown;
    function Consumer() {
      captured = useSubmitAdapter();
      return null;
    }
    renderToString(<Consumer />);
    expect(captured).toBe(defaultSubmitAdapter);
  });

  it('useSubmitAdapter returns provided adapter within SubmitAdapterProvider', () => {
    const customAdapter = async () => ({
      mode: 'mock' as const,
      outcome: 'success' as const,
      message: 'custom',
    });
    let captured: unknown;
    function Consumer() {
      captured = useSubmitAdapter();
      return null;
    }
    renderToString(
      <SubmitAdapterProvider adapter={customAdapter}>
        <Consumer />
      </SubmitAdapterProvider>,
    );
    expect(captured).toBe(customAdapter);
  });
});
