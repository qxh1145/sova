import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '@/styles/globals.css';
import { RootDocument } from '@/components/layout/RootDocument';
import { SiteShell } from '@/components/layout/SiteShell';
import { getShellProps } from '@/lib/queries/site';
import { getSiteUrl } from '@/lib/site-url';

export const metadata: Metadata = {
  metadataBase: new URL(getSiteUrl()),
};

export default async function ViRootLayout({ children }: { children: ReactNode }) {
  const shell = await getShellProps('vi');

  return (
    <RootDocument locale={shell.locale}>
      <SiteShell {...shell}>{children}</SiteShell>
    </RootDocument>
  );
}
