import { getRepository } from '@/lib/repositories';
import type { PageResult, Project } from '@/types/content';

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
