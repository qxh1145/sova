import { createScenarioRepository } from '@/dev/scenarios';
import type { ContentRepository } from './contracts';
import { mockRepository } from './mock';

/** Reads env per call so tests can switch scenarios; production ignores CONTENT_SCENARIO. */
export function getRepository(): ContentRepository {
  const name = process.env.CONTENT_SCENARIO;
  return name && process.env.NODE_ENV !== 'production'
    ? createScenarioRepository(name)
    : mockRepository;
}
