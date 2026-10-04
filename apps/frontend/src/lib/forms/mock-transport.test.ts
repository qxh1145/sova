import { describe, expect, it, vi } from 'vitest';
import type { SubmitResult } from '@/types/content';
import { createMockTransport, defaultSubmitAdapter } from './mock-transport';
import { isLiveResult, isMockResult } from './transport';

describe('mock-transport', () => {
  it('returns success outcome and mode mock for success scenario', async () => {
    const adapter = createMockTransport({ scenario: 'success' });
    const result = await adapter({ sample: 'data' });

    expect(result).toEqual({
      mode: 'mock',
      outcome: 'success',
      message: 'success',
    });
    expect(result.mode).toBe('mock');
  });

  it('returns error outcome and mode mock for error scenario', async () => {
    const adapter = createMockTransport({ scenario: 'error' });
    const result = await adapter({});

    expect(result).toEqual({
      mode: 'mock',
      outcome: 'error',
      message: 'error',
    });
    expect(result.mode).toBe('mock');
  });

  it('defaults to success mock scenario when using defaultSubmitAdapter', async () => {
    const result = await defaultSubmitAdapter({});

    expect(result).toEqual({
      mode: 'mock',
      outcome: 'success',
      message: 'success',
    });
    expect(result.mode).toBe('mock');
  });

  it('holds resolution until gate promise resolves', async () => {
    let resolveGate!: () => void;
    const gate = new Promise<void>((resolve) => {
      resolveGate = resolve;
    });

    const adapter = createMockTransport({
      scenario: 'success',
      gate,
    });

    let resolved = false;
    const promise = adapter({}).then((res) => {
      resolved = true;
      return res;
    });

    // Check that it does not resolve synchronously while gate is unresolved
    await Promise.resolve();
    expect(resolved).toBe(false);

    // Release gate
    resolveGate();
    const result = await promise;
    expect(resolved).toBe(true);
    expect(result.outcome).toBe('success');
  });

  it('holds resolution with gate function getter', async () => {
    let resolveGate!: () => void;
    const gate = new Promise<void>((resolve) => {
      resolveGate = resolve;
    });

    const adapter = createMockTransport({
      scenario: 'error',
      gate: () => gate,
    });

    let resolved = false;
    const promise = adapter({}).then((res) => {
      resolved = true;
      return res;
    });

    await Promise.resolve();
    expect(resolved).toBe(false);

    resolveGate();
    const result = await promise;
    expect(resolved).toBe(true);
    expect(result.outcome).toBe('error');
  });

  it('correctly discriminates mock vs live results with isMockResult and isLiveResult', () => {
    const mockSuccess: SubmitResult = {
      mode: 'mock',
      outcome: 'success',
      message: 'success',
    };
    const mockError: SubmitResult = {
      mode: 'mock',
      outcome: 'error',
      message: 'error',
    };
    const liveSuccess: SubmitResult = {
      mode: 'live',
      outcome: 'success',
      reference: 'ORDER-123',
    };
    const liveError: SubmitResult = {
      mode: 'live',
      outcome: 'error',
      message: 'Gateway timeout',
    };

    expect(isMockResult(mockSuccess)).toBe(true);
    expect(isMockResult(mockError)).toBe(true);
    expect(isMockResult(liveSuccess)).toBe(false);
    expect(isMockResult(liveError)).toBe(false);

    expect(isLiveResult(mockSuccess)).toBe(false);
    expect(isLiveResult(mockError)).toBe(false);
    expect(isLiveResult(liveSuccess)).toBe(true);
    expect(isLiveResult(liveError)).toBe(true);
  });

  it('never calls fetch during execution (spy)', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    const adapter = createMockTransport({ scenario: 'success' });
    await adapter({ test: true });
    await defaultSubmitAdapter({});

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
