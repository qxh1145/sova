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
  const port = process.env.PORT ?? '3000';
  return `http://localhost:${port}`;
}
