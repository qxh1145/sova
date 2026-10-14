import { createScenarioRepository } from '@/dev/scenarios';
import type { ContentRepository } from './contracts';
import { mockRepository } from './mock';

/**
 * Reads env per call so tests can switch scenarios. Production ignores CONTENT_SCENARIO unless
 * built with NEXT_PUBLIC_E2E=1 (`build:e2e`), which the extended suite runs on.
 */
export function getRepository(): ContentRepository {
  const name = process.env.CONTENT_SCENARIO;
  const isE2E = process.env.NEXT_PUBLIC_E2E === '1';
  return name && (process.env.NODE_ENV !== 'production' || isE2E)
    ? createScenarioRepository(name)
    : mockRepository;
}
