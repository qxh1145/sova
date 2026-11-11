/**
 * Returns the base URL for the site according to the plan decision:
 * SITE_URL env, else https://${VERCEL_PROJECT_PRODUCTION_URL}, else http://localhost:${PORT ?? 3000}.
 */
export function getSiteUrl(): string {
  if (process.env.SITE_URL) {
    return process.env.SITE_URL.replace(/\/$/, '');
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`.replace(/\/$/, '');
  }
  // A real build without an origin would publish localhost in every canonical and sitemap URL.
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PUBLIC_E2E !== '1') {
    throw new Error('SITE_URL is required for a production build, e.g. https://www.example.vn');
  }
  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}
