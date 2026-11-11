import type { MetadataRoute } from 'next';
import { listRoutes } from '@/lib/queries/site';
import { NOINDEX_PATHS } from '@/lib/routes';
import { getSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await listRoutes();
  const baseUrl = getSiteUrl();

  return routes
    .filter((route) => !NOINDEX_PATHS.has(route.path))
    .map((route) => ({
      url: `${baseUrl}${route.path}`,
    }));
}
