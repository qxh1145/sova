import type { SubmitResult } from '@/types/content';

export type SubmitAdapter<T = unknown> = (values: T) => Promise<SubmitResult>;

export function isMockResult(
  result: SubmitResult,
): result is Extract<SubmitResult, { mode: 'mock' }> {
  return result.mode === 'mock';
}

export function isLiveResult(
  result: SubmitResult,
): result is Extract<SubmitResult, { mode: 'live' }> {
  return result.mode === 'live';
}
