import { getRepository } from '@/lib/repositories';
import type { ContentRepository } from '@/lib/repositories/contracts';
import type { PageResult, Project, ProjectCategory } from '@/types/content';

export function getProject(slug: string): Promise<Project | null> {
  return getRepository().getProject(slug);
}

export function listProjects(input: {
  category?: string;
  page: number;
  pageSize: number;
}): Promise<PageResult<Project>> {
  return getRepository().listProjects(input);
}

export function getProjectCategories(
  repository: ContentRepository = getRepository(),
): Promise<ProjectCategory[]> {
  return repository.getProjectCategories();
}
