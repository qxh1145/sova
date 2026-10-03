import { getRepository } from '@/lib/repositories';
import type { AssetRef, EntityId } from '@/types/content';

export function getAssets(ids: EntityId[]): Promise<AssetRef[]> {
  return getRepository().getAssets(ids);
}
