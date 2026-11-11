import type { NextConfig } from 'next';
import { RENAMED_PATHS } from './src/lib/content/brand.ts';

const isDev = process.env.NODE_ENV === 'development';

// Inline scripts stay allowed: static pages cannot carry a per-request nonce.
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self' data:",
  "media-src 'self'",
  // The contact map iframe starts on maps.google.com and redirects to www.google.com.
  'frame-src https://maps.google.com https://www.google.com',
  `connect-src 'self'${isDev ? ' ws:' : ''}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: contentSecurityPolicy },
  { key: 'Strict-Transport-Security', value: 'max-age=15552000' },
  { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
];

const nextConfig: NextConfig = {
  trailingSlash: true,
  poweredByHeader: false,
  distDir: process.env.NEXT_DIST_DIR ?? '.next',
  // Fixed at build time so a dynamic route cannot disagree with the prerendered pages.
  env: process.env.SITE_URL ? { SITE_URL: process.env.SITE_URL } : {},
  experimental: {
    globalNotFound: true,
  },
  // Old Eras-slug URLs answer 301 (not Next's default 308) so they move to the Sova path.
  async redirects() {
    return Object.entries(RENAMED_PATHS).map(([source, destination]) => ({
      source,
      destination,
      statusCode: 301 as const,
    }));
  },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      {
        // Unhashed file names: a week, not immutable.
        source: '/wp-content/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=604800' }],
      },
    ];
  },
};

export default nextConfig;
