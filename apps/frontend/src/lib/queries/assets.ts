import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type { AssetRef, EntityId } from '@/types/content';

export function getAssets(
  ids: EntityId[],
  repository: ContentRepository = getRepository(),
): Promise<AssetRef[]> {
  return repository.getAssets(ids);
}
