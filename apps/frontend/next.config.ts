import type { NextConfig } from 'next';
import { RENAMED_PATHS } from './src/lib/content/brand.ts';

const nextConfig: NextConfig = {
  trailingSlash: true,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Old Eras-slug URLs answer 301 (not Next's default 308) so they move to the Sova path.
  async redirects() {
    return Object.entries(RENAMED_PATHS).map(([source, destination]) => ({
      source,
      destination,
      statusCode: 301 as const,
    }));
  },
};

export default nextConfig;
