import type { CollectionPlacement, EntityId } from '@/types/content';

// Ordered curated IDs (e.g. featured projects), not duplicate entities.
export const collections: { id: EntityId; placements: CollectionPlacement[] }[] = [];
