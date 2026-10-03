import { getRepository } from '@/lib/repositories';
import type { Locale, PageResult, Post } from '@/types/content';

export function getPost(slug: string): Promise<Post | null> {
  return getRepository().getPost(slug);
}

export function listPosts(input: {
  locale: Locale;
  category?: string;
  page: number;
  pageSize: number;
}): Promise<PageResult<Post>> {
  return getRepository().listPosts(input);
}
