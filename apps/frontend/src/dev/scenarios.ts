// Deterministic dev/test scenarios, selected via CONTENT_SCENARIO (ignored in production).
import type { ContentData, ContentRepository } from '@/lib/repositories/contracts';
import { createMockRepository } from '@/lib/repositories/mock';
import { extendedFixtures } from './extended';
import { fixtures, missingMediaFixtures } from './fixtures';

export const scenarioNames = ['happy-path', 'empty', 'missing-media', 'error', 'extended'] as const;
export type ScenarioName = (typeof scenarioNames)[number];

const empty: ContentData = {
  ...(Object.fromEntries(Object.keys(fixtures).map((key) => [key, []])) as unknown as ContentData),
  // The site shell needs these even when everything else is empty.
  siteSettings: fixtures.siteSettings,
  navigation: fixtures.navigation,
  shellContent: fixtures.shellContent,
};

// Every method rejects with a transport error naming itself.
const errorRepository = new Proxy({} as ContentRepository, {
  get: (_, method) =>
    method === 'then'
      ? undefined
      : () => Promise.reject(new Error(`Transport error in ${String(method)}`)),
});

export function createScenarioRepository(name: string): ContentRepository {
  switch (name as ScenarioName) {
    case 'happy-path':
      return createMockRepository(fixtures);
    case 'empty':
      return createMockRepository(empty);
    case 'missing-media':
      return createMockRepository(missingMediaFixtures);
    case 'error':
      return errorRepository;
    case 'extended':
      return createMockRepository(extendedFixtures);
    default:
      throw new Error(
        `Unknown CONTENT_SCENARIO "${name}" (expected one of: ${scenarioNames.join(', ')})`,
      );
  }
}
