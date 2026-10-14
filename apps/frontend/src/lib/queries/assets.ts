import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type { AssetRef, EntityId } from '@/types/content';

export function getAssets(
  ids: EntityId[],
  repository: ContentRepository = getRepository(),
): Promise<AssetRef[]> {
  return repository.getAssets(ids);
}

export const missingIds = (wanted: EntityId[], found: { id: EntityId }[] = []) =>
  wanted.filter((id) => !found.some((f) => f.id === id));

export function assertResolved(pageId: EntityId, missing: EntityId[]) {
  if (missing.length)
    throw new Error(`${pageId} references missing ids: ${[...new Set(missing)].join(', ')}`);
}
