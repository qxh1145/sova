import type { MetadataRoute } from 'next';
import { listRoutes } from '@/lib/queries/site';
import { getSiteUrl } from '@/lib/site-url';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const routes = await listRoutes();
  const baseUrl = getSiteUrl();

  return routes.map((route) => ({
    url: `${baseUrl}${route.path}`,
  }));
}
